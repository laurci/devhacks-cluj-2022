import { Browser, connect, Page, Target } from "puppeteer-core";
import React, { useEffect, useRef, useState } from "react";
import panzoom from "panzoom";
import Webview from "./Webview";
import { GRID_SIZE_HEIGHT, GRID_SIZE_WIDTH, HEIGHT, REMOTE_BROWSER_HOST, WIDTH } from "../constants";
import { bus, FocusEvent } from "../lib/events";
import Controls from "./Controls";
import { mockData } from "../lib/mock-data";
import SidePanel from "./SidePanel";

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

const items = mockData.rooms["room1"].items;

export default function Map() {
    const divRef = useRef<HTMLDivElement>();

    const [pages, setPages] = useState<Page[]>([]);
    const [browser, setBrowser] = useState<Browser>();
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    useEffect(() => {
        if (!divRef.current) return;

        const mapController = panzoom(divRef.current, {
            disableKeyboardInteraction: true,
            beforeWheel(e) {
                if (e.altKey) return false;

                return true;
            },
        });

        bus.on("focus", (ev: FocusEvent) => {
            console.log("focus", ev);
            mapController.moveTo(300, 300);
        });
    }, [divRef.current]);

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

    return <div style={{ position: "relative" }}>
        <SidePanel />
        <div ref={ref => divRef.current = ref!} style={{
            width: `${1 + GRID_SIZE_WIDTH * 80}px`,
            height: `${1 + GRID_SIZE_HEIGHT * 80}px`,
            backgroundImage: "url(/assets/grid.svg)",
        }}>
            {pages.map((page, index) => {
                const key = (page.target() as any)._targetId as string;
                let item = items[index];

                if (!item) {
                    item = {
                        x: 1000,
                        y: 1000,
                        type: "webview",
                    };
                }

                const isActive = index == activeIndex;

                return <Webview key={key} initialX={item.x} initialY={item.y} active={isActive} onClick={() => setActiveIndex(index)} page={page} />;
            })}
        </div>
        {browser && <Controls browser={browser} setActive={setActiveIndex} />}
    </div>;
}
