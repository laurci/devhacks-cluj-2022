import { EventEmitter } from "puppeteer-core";

export interface FocusEvent {
    posX: number;
    posY: number;
    zoom: number;
}

export const bus = new EventEmitter();
