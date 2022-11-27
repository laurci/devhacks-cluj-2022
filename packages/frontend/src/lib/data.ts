import { ApolloClient, InMemoryCache, useFragment_experimental } from "@apollo/client";
import type { DocumentNode, FragmentDefinitionNode } from "graphql";
import { io } from "socket.io-client";
import type { PartialDeep } from "type-fest";
import { gql } from "./gql";

export const cache = new InMemoryCache();
export const apollo = new ApolloClient({
    cache
});

const sock = io();

sock.on("connect", () => {
    sock.emit("init");
});

sock.on("init", (data) => {
    console.log("restore cache", data);
    apollo.restore(data);
});

sock.on("change", (fragment: any, id: string, data: any) => {
    apollo.writeFragment({
        id,
        fragment,
        data
    });
});

sock.on("reload", () => {
    window.location.reload();
});

export type FragmentType<T> = T extends { fragment: infer U } ? U : never;

const client = {
    read<T extends GQLFragmentDefinition<any>>(fragment: T, id: string): FragmentType<T> {
        const doc = (fragment as any).__doc as DocumentNode;
        const definition = doc.definitions[0]! as FragmentDefinitionNode;
        const typename = definition.typeCondition.name.value;


        const data = apollo.readFragment({
            id: `${typename}:${id}`,
            fragment: doc,
        });

        return data as FragmentType<T>;
    },

    write<T extends GQLFragmentDefinition<any>>(fragment: T, id: string, data: PartialDeep<FragmentType<T>>) {
        const doc = (fragment as any).__doc as DocumentNode;
        const definition = doc.definitions[0]! as FragmentDefinitionNode;
        const typename = definition.typeCondition.name.value;

        apollo.writeFragment({
            id: `${typename}:${id}`,
            fragment: doc,
            data
        });

        sock.emit("change", doc, `${typename}:${id}`, data);
    },

    use<T extends GQLFragmentDefinition<any>>(fragment: T, id: string): FragmentType<T> | undefined {
        const doc = (fragment as any).__doc as DocumentNode;
        const definition = doc.definitions[0]! as FragmentDefinitionNode;
        const typename = definition.typeCondition.name.value;

        const { complete, missing, data } = useFragment_experimental({
            fragment: doc,
            from: {
                __typename: typename,
                id,
            },
        });

        if (!complete) {
            console.log("missing", missing);
            return undefined;
        }

        return data as FragmentType<T>;
    }
}

export default client;

(window as any)._db_reset = () => {
    sock.emit("reset");
};

sock.on("seed", () => {
    client.write(gql!`
        fragment User on User {
            id,
            name,
            profileImage,
            livekitToken,
            livekitIdentity,
            workspaces {
                id,
                name,
                participants {
                    id
                },
                sharedBrowsers {
                    id
                }
            }
        }
    `, "user-1", {
        __typename: "User",
        id: "user-1",
        name: "Laurentiu Ciobanu",
        profileImage: "https://avatars.githubusercontent.com/u/5719762?s=40&v=4",
        livekitIdentity: "user-faaf1ac0",
        livekitToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Njk1ODc2ODUsImlzcyI6IkFQSTVvYnZ2cWU5ZjVyNSIsIm5iZiI6MTY2OTUwMTI4NSwic3ViIjoidXNlci1mYWFmMWFjMCIsInZpZGVvIjp7InJvb20iOiJyb29tLTA0NDc1YjI3Iiwicm9vbUpvaW4iOnRydWV9fQ.kN3oHmigjqKsBooL0mOVSGkKFrltljS3Juhll9Me4sI",
        workspaces: [
            {
                __typename: "Room",
                id: "workspace-1",
                name: "Personal Space",
                participants: [],
                sharedBrowsers: []
            },
            {
                __typename: "Room",
                id: "workspace-2",
                name: "Scrum research",
                participants: [],
                sharedBrowsers: []
            }
        ]
    });

    client.write(gql!`
        fragment User on User {
            id,
            name,
            profileImage,
            livekitToken,
            livekitIdentity,
            workspaces {
                id,
                name,
                participants {
                    id
                },
                sharedBrowsers {
                    id
                }
            }
        }
    `, "user-2", {
        __typename: "User",
        id: "user-2",
        name: "Dan Poka",
        profileImage: "https://avatars.githubusercontent.com/u/9885905?s=64&v=4",
        livekitIdentity: "user-36cad150",
        livekitToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Njk1ODc2ODUsImlzcyI6IkFQSTVvYnZ2cWU5ZjVyNSIsIm5iZiI6MTY2OTUwMTI4NSwic3ViIjoidXNlci0zNmNhZDE1MCIsInZpZGVvIjp7InJvb20iOiJyb29tLTA0NDc1YjI3Iiwicm9vbUpvaW4iOnRydWV9fQ.7u9NLcV2FIWUQv3VlRfXwgWzT4lT4T6bhGjpOPDn9jc",
        workspaces: [
            {
                __typename: "Room",
                id: "workspace-3",
                name: "Personal Space",
                participants: [],
                sharedBrowsers: []
            },
        ]
    });
    client.write(gql!`
        fragment Org on Organization {
            id
            name
            rooms {
                id
                name,
                locked,
                participants {
                    id
                },
                sharedBrowsers {
                    id
                }
            }
        }
    `, "ROOT", {
        id: "ROOT",
        name: "Leap Office",
        rooms: [
            {
                __typename: "Room",
                id: "room-0",
                name: "Chill",
                locked: false,
                participants: [
                    {
                        __typename: "User",
                        id: "user-1"
                    },
                    {
                        __typename: "User",
                        id: "user-2"
                    }
                ],
                sharedBrowsers: []
            },
            {
                __typename: "Room",
                id: "room-1",
                name: "Devops Daily",
                locked: false,
                participants: [],
                sharedBrowsers: []
            },
            {
                __typename: "Room",
                id: "room-2",
                name: "Alliantz Porject",
                locked: true,
                participants: [],
                sharedBrowsers: []
            },
            {
                __typename: "Room",
                id: "room-3",
                name: "Edison (Bucharest)",
                locked: false,
                participants: [],
                sharedBrowsers: []
            },
            {
                __typename: "Room",
                id: "room-4",
                name: "Growth team",
                locked: true,
                participants: [],
                sharedBrowsers: []
            },
            {
                __typename: "Room",
                id: "room-5",
                name: "Interview room",
                locked: true,
                participants: [],
                sharedBrowsers: []
            }
        ]
    });

    setTimeout(() => {
        sock.emit("seed-done");
    }, 2000);
});
