import React, { useEffect, useRef, useState } from "react";
import { KeyInput, Page } from "puppeteer-core";
import { HEIGHT, QUALITY, WIDTH } from "../constants";

class WebviewController {
    private canvas?: HTMLCanvasElement;
    private events = new Map<string, (ev: any) => void | Promise<void>>();

    constructor(
        public page: Page,
    ) {
    }

    private addEventListener(el: HTMLElement, type: string, listener: (ev: any) => void | Promise<void>) {
        if (!this.events.has(type)) {
            const binding = listener.bind(this);
            this.events.set(type, binding);
            el.addEventListener(type, binding);
        }
    }

    private removeEventListener(el: HTMLElement, type: string) {
        const listener = this.events.get(type);
        if (listener) {
            el.removeEventListener(type, listener);
        }
    }

    private async onMouseMove(ev: MouseEvent) {
        if (!this.canvas) return;
        ev.preventDefault();

        const position = this.canvas.getBoundingClientRect();

        const x = ev.clientX - position.left;
        const y = ev.clientY - position.top;

        await this.page.mouse.move(x, y);
    }

    private async onMouseDown(ev: MouseEvent) {
        ev.preventDefault();

        await this.page.mouse.down();
    }

    private async onMouseUp(ev: MouseEvent) {
        ev.preventDefault();

        await this.page.mouse.up();
    }

    private async onWheel(ev: WheelEvent) {
        ev.preventDefault();

        await this.page.mouse.wheel({
            deltaX: ev.deltaX,
            deltaY: ev.deltaY,
        });
    }

    private async onKeyDown(ev: KeyboardEvent) {
        ev.preventDefault();

        await this.page.keyboard.down(ev.key as KeyInput);
    }

    private async onKeyUp(ev: KeyboardEvent) {
        ev.preventDefault();

        await this.page.keyboard.up(ev.key as KeyInput);
    }

    public async init(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        const image = new Image(WIDTH, HEIGHT);
        const ctx = canvas.getContext("2d")!;

        const client = await this.page.target().createCDPSession();

        client.on("Page.screencastFrame", async (frameObj) => {
            image.src = `data:image/jpeg;base64,${frameObj.data}`;

            await client.send("Page.screencastFrameAck", {
                sessionId: frameObj.sessionId,
            });
        });

        image.onload = () => {
            ctx.drawImage(image, 0, 0);
        };

        client.send("Page.startScreencast", {
            format: "jpeg",
            quality: QUALITY,
            everyNthFrame: 1,
        });
    }

    public activate() {
        if (!this.canvas) return;

        this.addEventListener(this.canvas, "mousemove", this.onMouseMove);
        this.addEventListener(this.canvas, "mousedown", this.onMouseDown);
        this.addEventListener(this.canvas, "mouseup", this.onMouseUp);
        this.addEventListener(this.canvas, "wheel", this.onWheel);
        this.addEventListener(document.body, "keydown", this.onKeyDown);
        this.addEventListener(document.body, "keyup", this.onKeyUp);
    }

    public deactivate() {
        if (!this.canvas) return;

        this.removeEventListener(this.canvas, "mousemove");
        this.removeEventListener(this.canvas, "mousedown");
        this.removeEventListener(this.canvas, "mouseup");
        this.removeEventListener(this.canvas, "wheel");
        this.removeEventListener(document.body, "keydown");
        this.removeEventListener(document.body, "keyup");
    }

    public close() {
        this.deactivate();
        this.page.close();
    }
}


function useWebviewController(page: Page) {
    const [controller, setController] = useState<WebviewController>();

    useEffect(() => {
        setController(new WebviewController(page));
    }, []);

    return controller;
}

export interface WebviewProps {
    page: Page;
    active: boolean;
    onClick?: () => void;
}

export default function Webview({ page, active, onClick }: WebviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>();
    const controller = useWebviewController(page);

    useEffect(() => {
        if (controller && canvasRef.current) {
            controller.init(canvasRef.current);
        }
    }, [controller, canvasRef.current]);

    useEffect(() => {
        if (active) {
            controller?.activate();
        } else {
            controller?.deactivate();
        }
    }, [active])

    useEffect(() => {
        return () => {
            controller?.deactivate();
        }
    }, []);

    return <div style={{ position: "relative", width: `${WIDTH}px`, height: `${HEIGHT + 30}px` }}>
        <div style={{
            width: `${WIDTH}px`,
            height: `30px`,
            background: "red",
        }}>
            <button onClick={() => controller?.close()}>Close</button>
        </div>
        <canvas ref={ref => canvasRef.current = ref!} width={WIDTH} height={HEIGHT} style={{ width: `${WIDTH}px`, height: `${HEIGHT}px` }} />
        {!active ? <div className="webview-inactive" style={{
            width: `${WIDTH}px`,
            height: `${HEIGHT}px`,
            background: "transparent",
            position: "absolute",
            top: 30,
            left: 0,
            zIndex: 1,
        }} onClick={() => onClick?.()}></div> : null}
    </div>;
}
