import React, { useEffect, useRef, useState } from "react";
import { KeyInput, Page } from "puppeteer-core";
import { HEIGHT, QUALITY, WIDTH } from "../constants";
import { bus, FocusEvent } from "../lib/events";
import { Box, IconButton } from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon, CloseIcon, CopyIcon, DragHandleIcon, ExternalLinkIcon, RepeatIcon, SmallCloseIcon } from "@chakra-ui/icons";

interface WebviewControllerOptions {
    onNavigate?: (url: string) => void;
}

class WebviewController {
    private canvas?: HTMLCanvasElement;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private events = new Map<string, (ev: any) => void | Promise<void>>();

    constructor(
        public page: Page,
        private options?: WebviewControllerOptions
    ) {
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            this.events.delete(type);
        }
    }

    private async onMouseMove(ev: MouseEvent) {
        if (!this.canvas) return;
        ev.preventDefault();
        ev.stopPropagation();

        const position = this.canvas.getBoundingClientRect();

        const widthFactor = WIDTH / position.width;
        const heightFactor = HEIGHT / position.height;

        const x = widthFactor * (ev.clientX - position.x);
        const y = heightFactor * (ev.clientY - position.y);

        await this.page.mouse.move(x, y);
    }

    private async onMouseDown(ev: MouseEvent) {
        ev.preventDefault();
        ev.stopPropagation();

        await this.page.mouse.down();
    }

    private async onMouseUp(ev: MouseEvent) {
        ev.preventDefault();
        ev.stopPropagation();

        await this.page.mouse.up();
    }

    private async onWheel(ev: WheelEvent) {
        ev.preventDefault();
        ev.stopPropagation();

        await this.page.mouse.wheel({
            deltaX: ev.deltaX,
            deltaY: ev.deltaY,
        });
    }

    private async onKeyDown(ev: KeyboardEvent) {
        ev.preventDefault();
        ev.stopPropagation();

        await this.page.keyboard.down(ev.key as KeyInput);
    }

    private async onKeyUp(ev: KeyboardEvent) {
        ev.preventDefault();
        ev.stopPropagation();

        await this.page.keyboard.up(ev.key as KeyInput);
    }

    public async init(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.page.on("framenavigated", (frame) => {
            if (!frame.parentFrame() && !frame.isDetached()) {
                this.options?.onNavigate?.(frame.url());
            }
        });

        this.options?.onNavigate?.(this.page.url());

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

    public async reload() {
        await this.page.reload();
    }

    public async navigate(url: string) {
        await this.page.goto(url);
    }

    public async back() {
        await this.page.goBack();
    }

    public async forward() {
        await this.page.goForward();
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



function useWebviewController(page: Page, options?: WebviewControllerOptions) {
    const [controller, setController] = useState<WebviewController>();

    useEffect(() => {
        setController(new WebviewController(page, options));
    }, []);

    return controller;
}

export interface WebviewProps {
    page: Page;
    active: boolean;
    initialX: number;
    initialY: number;
    onClick?: () => void;
}

interface Move {
    startX: number;
    startY: number;
}

export default function Webview({ page, active, initialX, initialY, onClick }: WebviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>();
    const moveHandleRef = useRef<HTMLDivElement>();

    const [url, setUrl] = useState<string>();

    const [x, setX] = useState(initialX);
    const [y, setY] = useState(initialY);

    const controller = useWebviewController(page, {
        onNavigate: setUrl,
    });

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

    let subUrl = url?.substring(0, 40);
    if (subUrl?.length !== url?.length) {
        subUrl += "...";
    }

    return <div style={{
        position: "absolute",
        width: `${WIDTH}px`,
        height: `${HEIGHT + 40}px`,
        top: 0,
        left: 0,
        transform: `translate(${x}px, ${y}px)`,
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
        border: "1px solid transparent",
        backgroundColor: "#fff",
    }}>
        <Box width={`${WIDTH}px`} height="40px" background="gray.100" display="flex" justifyContent="space-between">
            <Box>
                <IconButton aria-label="drag" icon={<DragHandleIcon />} />
            </Box>
            <Box>
                <IconButton aria-label="back" icon={<ArrowBackIcon />} onClick={() => controller?.back()} />
                <IconButton aria-label="forward" icon={<ArrowForwardIcon />} onClick={() => controller?.forward()} />
                <span style={{
                    borderBottom: "3px solid #d5d5d5",
                    paddingInline: "10px",
                }}>{subUrl}</span>
                <IconButton aria-label="reload" icon={<RepeatIcon />} />
                <IconButton aria-label="copy" icon={<CopyIcon />} />
            </Box>
            <Box>
                <IconButton aria-label="external" icon={<ExternalLinkIcon />} />
                <IconButton aria-label="close" icon={<SmallCloseIcon />} onClick={() => controller?.close()} />
            </Box>

            {/* <button onClick={() => {
                bus.emit("focus", {
                    posX: x,
                    posY: y,
                    zoom: 1
                } as FocusEvent);
            }}>Focus</button> */}
        </Box>
        <canvas ref={ref => canvasRef.current = ref!} width={WIDTH} height={HEIGHT} style={{ width: `${WIDTH}px`, height: `${HEIGHT}px` }} />
        {!active ?
            <div className="webview-inactive"
                style={{
                    width: `${WIDTH}px`,
                    height: `${HEIGHT}px`,
                    background: "transparent",
                    position: "absolute",
                    top: 40,
                    left: 0,
                    zIndex: 1,
                }}
                onClick={(ev) => onClick?.()}
            ></div> : null}
    </div>;
}
