import { Browser, connect, Page, Target } from "puppeteer-core";
import React, { useEffect, useRef, useState } from "react";
import panzoom from "panzoom";
import Webview from "./Webview";
import { GRID_SIZE_HEIGHT, GRID_SIZE_WIDTH, HEIGHT, REMOTE_BROWSER_HOST, ROOM_ID, WIDTH } from "../constants";
import Controls from "./Controls";
import SidePanel from "./SidePanel";
import { useCurrentRoomId } from "../lib/api";
import client from "../lib/data";
import { gql } from "../lib/gql";

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

export default function Map() {
    const divRef = useRef<HTMLDivElement>();

    const roomId = useCurrentRoomId();

    const [pages, setPages] = useState<Page[]>([]);
    const [browser, setBrowser] = useState<Browser>();
    const [activeId, setActiveId] = useState<string | null>(null);

    const room = client.use(gql!`
        fragment RoomInfo on Room {
            id
            name
            sharedBrowsers {
                id
                targetId
                x
                y
            }
        }
    `, ROOM_ID ?? roomId ?? "");

    useEffect(() => {
        if (!divRef.current) return;

        panzoom(divRef.current, {
            disableKeyboardInteraction: true,
            beforeWheel(e) {
                if (e.altKey) return false;

                return true;
            },
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
    if (!room || !roomId) return null;

    return <div style={{ position: "relative" }}>
        {!ROOM_ID && <SidePanel roomId={roomId} />}
        <div ref={ref => divRef.current = ref!} style={{
            width: `${1 + GRID_SIZE_WIDTH * 80}px`,
            height: `${1 + GRID_SIZE_HEIGHT * 80}px`,
            backgroundImage: "url(/assets/grid.svg)",
        }}>
            {room.sharedBrowsers.map((browser) => {
                const isActive = browser.id == activeId;

                const page = pages.find((page) => (page.target() as any)._targetId == browser.targetId);
                if (!page) return null;

                return <Webview key={browser.id} initialX={browser.x} initialY={browser.y} active={isActive} onClick={() => setActiveId(browser.id)} page={page} />;
            })}
        </div>
        {browser && !ROOM_ID && <Controls roomId={roomId} browser={browser} />}
    </div>;
}
