export const sleep = async (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, ms);
    });
};

export const classes = (...classes: (string | false | null)[]): string => {
    return classes.filter(Boolean).join(" ");
};

export const deepCopy = <T>(obj: T): T => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item)) as T;
    }

    const newObj = {} as T;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = deepCopy(obj[key]);
        }
    }

    return newObj;
};

export function log(...args: any[]): void {
    console.log(
        "%cUserscript (React Mode):",
        "color: purple; font-weight: bold",
        ...args
    );
}

export function logFetch(arg: string | URL): Promise<Response> {
    const url = new URL(arg, window.location.href);
    log("fetching", url.toString());
    return fetch(url.toString(), { credentials: "include" });
}

export function addLocationChangeCallback(callback: () => void): MutationObserver {
    window.setTimeout(callback, 0);

    let oldHref = window.location.href;
    const body = document.querySelector("body");

    if (!body) {
        throw new Error("Body element not found.");
    }

    const observer = new MutationObserver((mutations) => {
        if (mutations.some(() => oldHref !== document.location.href)) {
            oldHref = document.location.href;
            callback();
        }
    });

    observer.observe(body, { childList: true, subtree: true });
    return observer;
}

export async function awaitElement(selector: string): Promise<Element> {
    const MAX_TRIES = 60;
    let tries = 0;

    return new Promise((resolve, reject) => {
        function probe(): Element | null {
            tries++;
            return document.querySelector(selector);
        }

        function delayedProbe(): void {
            if (tries >= MAX_TRIES) {
                log("Can't find element with selector", selector);
                reject(new Error(`Element with selector "${selector}" not found after ${MAX_TRIES} tries.`));
                return;
            }

            const elm = probe();
            if (elm) {
                resolve(elm);
                return;
            }

            window.setTimeout(delayedProbe, 250);
        }

        delayedProbe();
    });
}