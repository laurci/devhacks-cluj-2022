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

        const data = apollo.cache.readFragment({
            id,
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
        fragment Org on Organization {
            id
            name
        }
    `, "ROOT", {
        id: "ROOT",
        name: "Leap Office",
    });

    setTimeout(() => {
        sock.emit("seed-done");
    }, 2000);
});
