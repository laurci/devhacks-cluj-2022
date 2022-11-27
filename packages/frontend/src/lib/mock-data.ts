
type BoardItemType = "webview";

interface BoardItem {
    type: BoardItemType;
    x: number;
    y: number;
}

interface WebviewBoardItem extends BoardItem {
    type: "webview";
}

export function isWebviewBoardItem(item: BoardItem): item is WebviewBoardItem {
    return item.type === "webview";
}

export const mockData = {
    livekitToken: localStorage.getItem("livekitToken") ?? "shit",
    rooms: {
        "room1": {
            name: "Room 1",
            items: [
                {
                    x: 100,
                    y: 100,
                    type: "webview",
                },
                {
                    x: 1200,
                    y: 400,
                }
            ] as BoardItem[],
        }
    }
} as const;
