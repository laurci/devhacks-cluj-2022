import { useEffect, useState } from "react";
import { GRID_SIZE_HEIGHT, GRID_SIZE_WIDTH, HEIGHT, USER_ID, WIDTH } from "../constants";
import client from "./data";
import { gql } from "./gql";

const MAX_X = (1 + GRID_SIZE_WIDTH * 80) - WIDTH;
const MAX_Y = (1 + GRID_SIZE_HEIGHT * 80) - HEIGHT;

function rectIntersects(
    Ax: number, Ay: number, Aw: number, Ah: number,
    Bx: number, By: number, Bw: number, Bh: number): boolean {
    return Bx + Bw > Ax && By + Bh > Ay && Ax + Aw > Bx && Ay + Ah > By;
}

function pickRandomPosition(rectangles: { x: number, y: number }[]) {
    let x = Math.floor(Math.random() * MAX_X);
    let y = Math.floor(Math.random() * MAX_Y);

    // check collision with other rectangles and try again
    for (let i = 0; i < 300; i++) {
        let collision = false;
        for (const rect of rectangles) {
            if (rectIntersects(x, y, WIDTH, HEIGHT, rect.x, rect.y, WIDTH, HEIGHT)) {
                collision = true;
                break;
            }
        }

        if (!collision) {
            break;
        }

        x = Math.floor(Math.random() * MAX_X);
        y = Math.floor(Math.random() * MAX_Y);
    }

    return { x, y };
}

const api = {
    join(id: string): string | undefined {
        const user = client.read(gql!`
            fragment User on User {
                id
                workspaces {
                    id
                    participants {
                        id
                    }
                }
            }
        `, USER_ID);

        const org = client.read(gql!`
            fragment Org on Organization {
                id
                rooms {
                    id
                    participants {
                        id
                    }
                }
            }
        `, "ROOT");

        console.log({ user, org });

        if (!user || !org) {
            return;
        }

        const room = org.rooms.find(r => r.participants.find(p => p.id === USER_ID));
        const workspace = user.workspaces.find(w => w.participants.find(p => p.id === USER_ID));

        if (room) {
            if (room.id === id) {
                return;
            }

            client.write(gql!`
                fragment Room on Room {
                    id
                    participants {
                        id
                    }
                }
            `, room.id, {
                ...room,
                participants: room.participants.filter(p => p.id !== USER_ID)
            });
        }

        if (workspace) {
            if (workspace.id === id) {
                return;
            }

            client.write(gql!`
                fragment Workspace on Room {
                    id
                    participants {
                        id
                    }
                }
            `, workspace.id, {
                ...workspace,
                participants: workspace.participants.filter(p => p.id !== USER_ID)
            });
        }

        const existingRoom = org.rooms.find(r => r.id === id);
        const existingWorkspace = user.workspaces.find(w => w.id === id);

        if (existingRoom) {
            const newRoom = { ...existingRoom, participants: [...existingRoom.participants, { __typename: "User", id: USER_ID }] };

            client.write(gql!`
                fragment Room on Room {
                    id
                    participants {
                        id
                    }
                }
            `, newRoom.id, newRoom);

            return newRoom.id;
        }

        if (existingWorkspace) {
            const newWorkspace = { ...existingWorkspace, participants: [...existingWorkspace.participants, { __typename: "User", id: USER_ID }] };
            console.log({ newWorkspace });
            client.write(gql!`
                fragment Workspace on Room {
                    id
                    participants {
                        id
                    }
                }
            `, newWorkspace.id, newWorkspace);

            return newWorkspace.id;
        }
    },
    newBrowser(roomId: string, targetId: string) {
        const room = client.read(gql!`
            fragment Room on Room {
                id
                sharedBrowsers {
                    id
                    targetId
                    x
                    y
                }
            }
        `, roomId);

        if (!room) {
            return;
        }

        const position = pickRandomPosition(room.sharedBrowsers);


        client.write(gql!`
            fragment Room on Room {
                id
                sharedBrowsers {
                    id
                    targetId
                    x
                    y
                }
            }
        `, roomId, {
            __typename: "Room",
            id: roomId,
            sharedBrowsers: [...room.sharedBrowsers, { __typename: "Browser", id: crypto.randomUUID(), targetId, ...position }]
        });
    }
}

export default api;

export function useCurrentRoomId() {
    const [roomId, setRoomId] = useState<string | undefined>();
    const user = client.use(gql!`
        fragment User on User {
            id
            workspaces {
                id
                participants {
                    id
                }
            }
        }
    `, USER_ID);

    const org = client.use(gql!`
        fragment Org on Organization {
            id
            rooms {
                id
                participants {
                    id
                }
            }
        }
    `, "ROOT");

    useEffect(() => {
        const currentRoom = org?.rooms.find(r => r.participants.find(p => p.id === USER_ID));
        const currentWorkspace = user?.workspaces.find(w => w.participants.find(p => p.id === USER_ID));

        if (currentRoom) {
            setRoomId(currentRoom.id);
        } else if (currentWorkspace) {
            setRoomId(currentWorkspace.id);
        }
    }, [org, user]);

    return roomId;
}
