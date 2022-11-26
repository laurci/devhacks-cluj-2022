import { Browser, connect, Page, Target } from "puppeteer-core";
import React, { useEffect, useState } from "react";
import Webview from "./component/Webview";
import { HEIGHT, REMOTE_BROWSER_HOST, WIDTH } from "./constants";

interface VersionInfo {
    webSocketDebuggerUrl: string;
}

async function setupBrowser() {
    const versionInfo: VersionInfo = await fetch(`http://${REMOTE_BROWSER_HOST}/json/version`).then((res) => res.json());
    const websocketUrl = versionInfo.webSocketDebuggerUrl.replace("localhost:9222", REMOTE_BROWSER_HOST);
    console.log("connecting to", websocketUrl);

    const browser = await connect({
        browserWSEndpoint: websocketUrl,
        defaultViewport: {
            height: HEIGHT,
            width: WIDTH,
        }
    });

    return browser;
}

export default function App() {
    const [pages, setPages] = useState<Page[]>([]);
    const [browser, setBrowser] = useState<Browser>();
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    useEffect(() => {
        setupBrowser()
            .then(async (browser) => {
                async function fetchPages() {
                    const pages = await browser.pages();
                    setPages(pages);
                }

                browser.on("targetcreated", function (target: Target) {
                    if (target.type() == "page") {
                        fetchPages();
                    }
                });

                browser.on("targetdestroyed", function (target: Target) {
                    if (target.type() == "page") {
                        fetchPages();
                    }
                });

                fetchPages();

                setBrowser(browser);
            });
    }, []);

    return <>
        <button onClick={async () => {
            const page = await browser?.newPage();
            if (page) {
                await page.goto("https://google.com");
            }
        }}>new page</button>
        <button onClick={() => setActiveIndex(-1)}>deactivate</button>
        <button onClick={() => browser?.close()}>close browser</button>
        {pages.map((page, index) => {
            const key = (page.target() as any)._targetId;
            const isActive = index == activeIndex;

            return <Webview key={key} active={isActive} onClick={() => setActiveIndex(index)} page={page} />;
        })}
    </>;
}
