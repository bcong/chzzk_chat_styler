type DocumentPictureInPictureApi = {
    window?: Window | null;
    requestWindow: (options: { width: number; height: number }) => Promise<Window>;
};

const isDocumentPictureInPictureApi = (value: unknown): value is DocumentPictureInPictureApi =>
    typeof value === 'object' && value !== null && typeof Reflect.get(value, 'requestWindow') === 'function';

const CHAT_SELECTOR = '#chatStylerOverlayChat, #chatStylerFrameChat';

export const installChatPipHook = () => {
    const pageWindow = unsafeWindow;
    const pageDocument = pageWindow.document;
    let opening = false;

    const openPictureInPicture = async (
        video: HTMLVideoElement | null,
        pipApi: DocumentPictureInPictureApi,
    ): Promise<Window> => {
        const width = Math.min(video?.videoWidth || 640, 640);
        const height = video?.videoWidth ? Math.round((width * video.videoHeight) / video.videoWidth) : 360;
        const pipWindow = await pipApi.requestWindow({ width, height });
        const pipDocument = pipWindow.document;
        const parent = video?.parentNode ?? null;
        if (video && !parent) throw new Error('The CHZZK video player is no longer available.');

        const nextSibling = video?.nextSibling ?? null;
        const placeholder = video && parent ? pageDocument.createComment('CHZZK chat PiP video position') : null;
        const originalStyle = video?.getAttribute('style') ?? null;
        const originalControls = video?.controls ?? false;
        const copiedStyles = new Set<HTMLStyleElement>();
        const chatHost = pipDocument.createElement('div');
        let chatRoot: HTMLElement | null = null;
        let chatParent: Node | null = null;
        let waitingForChat = false;
        let restored = false;

        const rootObserver = new MutationObserver(syncChat);
        const parentObserver = new MutationObserver(syncChat);
        const documentObserver = new MutationObserver(syncChat);

        const restoreVideo = () => {
            if (restored) return;
            restored = true;
            rootObserver.disconnect();
            parentObserver.disconnect();
            documentObserver.disconnect();
            waitingForChat = false;

            if (video && placeholder?.parentNode) {
                placeholder.parentNode.insertBefore(video, placeholder);
                placeholder.remove();
            } else if (video && parent?.isConnected) {
                parent.insertBefore(video, nextSibling?.parentNode === parent ? nextSibling : null);
            } else if (video) {
                pageDocument.querySelector('#live_player_layout, .pzp-pc')?.append(video);
            }

            if (video) {
                if (originalStyle === null) video.removeAttribute('style');
                else video.setAttribute('style', originalStyle);
                video.controls = originalControls;
            }
        };

        const copyChatStyles = (source: HTMLElement) => {
            const classNames = Array.from(source.classList);
            pageDocument.querySelectorAll('style').forEach((style) => {
                const css = style.textContent ?? '';
                if (!copiedStyles.has(style) && classNames.some((name) => css.includes(name))) {
                    pipDocument.head.append(style.cloneNode(true));
                    copiedStyles.add(style);
                }
            });
        };

        function syncChat() {
            if (restored) return;

            const source = pageDocument.querySelector<HTMLElement>(CHAT_SELECTOR);
            if (source !== chatRoot || source?.parentNode !== chatParent) {
                rootObserver.disconnect();
                parentObserver.disconnect();
                chatRoot = source;
                chatParent = source?.parentNode ?? null;

                if (source) {
                    copyChatStyles(source);
                    rootObserver.observe(source, {
                        attributes: true,
                        childList: true,
                        characterData: true,
                        subtree: true,
                    });
                    if (source.parentNode) {
                        parentObserver.observe(source.parentNode, { childList: true });
                    }
                }
            }

            if (!source) {
                chatHost.replaceChildren();
                if (pageDocument.documentElement && !waitingForChat) {
                    documentObserver.observe(pageDocument.documentElement, { childList: true, subtree: true });
                    waitingForChat = true;
                }
                return;
            }

            documentObserver.disconnect();
            waitingForChat = false;
            const clone = source.cloneNode(true) as HTMLElement;
            clone.style.pointerEvents = 'none';
            clone.querySelector('[data-chat-visibility-toggle]')?.remove();

            if (source.id === 'chatStylerOverlayChat') {
                const maxLeft = Math.max(0, (pipWindow.innerWidth || width) - 80);
                const maxTop = Math.max(0, (pipWindow.innerHeight || height) - 80);
                const sourceRect = source.getBoundingClientRect();
                clone.style.left = `${Math.min(Math.max(0, sourceRect.left), maxLeft)}px`;
                clone.style.top = `${Math.min(Math.max(0, sourceRect.top), maxTop)}px`;
            }

            chatHost.replaceChildren(clone);
        }

        try {
            if (video && parent && placeholder) parent.insertBefore(placeholder, video);
            pipDocument.documentElement.style.cssText = 'width:100%;height:100%;overflow:hidden;';
            pipDocument.body.style.cssText =
                'position:relative;width:100vw;height:100vh;margin:0;overflow:hidden;background:#000;';
            chatHost.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;';
            pipDocument.body.append(chatHost);
            if (video) {
                pipDocument.adoptNode(video);
                video.setAttribute(
                    'style',
                    'position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:contain;',
                );
                video.controls = true;
                pipDocument.body.insertBefore(video, chatHost);
            }
            pipWindow.addEventListener('pagehide', restoreVideo, { once: true });
            syncChat();
            return pipWindow;
        } catch (error) {
            restoreVideo();
            pipWindow.close();
            throw error;
        }
    };

    pageDocument.addEventListener(
        'click',
        (event) => {
            const target = event.target;
            if (
                !(target instanceof Element) ||
                !target.closest('.pzp-pip-button, button[aria-label="PIP 보기"]')
            ) {
                return;
            }

            const pipApi: unknown = Reflect.get(pageWindow, 'documentPictureInPicture');
            if (!isDocumentPictureInPictureApi(pipApi)) return;

            const currentWindow = pipApi.window;
            if (currentWindow && !currentWindow.closed) {
                event.preventDefault();
                event.stopImmediatePropagation();
                currentWindow.focus();
                return;
            }

            if (opening) return;

            const player = target.closest('.pzp-pc');
            const videos = Array.from(
                player?.querySelectorAll<HTMLVideoElement>('video') ?? pageDocument.querySelectorAll('video'),
            );
            const video =
                videos.find((item) => item.videoWidth > 0) ??
                videos.find((item) => item.readyState > 0) ??
                videos[0] ??
                null;

            event.preventDefault();
            event.stopImmediatePropagation();
            opening = true;
            void openPictureInPicture(video, pipApi)
                .catch((error: unknown) => {
                    console.error('[CHZZK Chat Styler] Picture-in-Picture failed:', error);
                })
                .finally(() => {
                    opening = false;
                });
        },
        true,
    );
};
