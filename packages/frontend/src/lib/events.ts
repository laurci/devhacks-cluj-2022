import { EventEmitter } from "puppeteer-core";

export interface FocusEvent {
    posX: number;
    posY: number;
    zoom: number;
}

export interface SpeakingEvent {
    isSpeaking: boolean;
    identity: string;
}

export const bus = new EventEmitter();
