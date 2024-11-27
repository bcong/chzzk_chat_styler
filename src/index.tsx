import React from "react";
import { createRoot, Root } from "react-dom/client";
import "./global.less";
import App from "./App";
import { awaitElement, log, addLocationChangeCallback } from "./Utils";
import { StoreProvider } from "./Stores";

log("CHZZK 채팅 스타일러 - 비콩");

let root: Root | null = null; // 전역 변수로 root 상태 관리

async function main() {
    const body = await awaitElement("body > div");

    // 이미 생성된 컨테이너가 있는지 확인
    let container = document.querySelector("#chzzk-chat-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "chzzk-chat-container"; // 중복 생성을 방지하기 위해 ID 설정
        body.appendChild(container);
    }

    // root가 아직 생성되지 않았으면 생성
    if (!root) {
        root = createRoot(container);
        root.render(
            <StoreProvider>
                <App />
            </StoreProvider>
        );
    }
}

addLocationChangeCallback(() => {
    main().catch((e) => {
        log(e);
    });
});