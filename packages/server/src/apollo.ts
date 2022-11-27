import { ApolloClient, InMemoryCache } from "@apollo/client";
import store from "./data";

export const cache = new InMemoryCache();

export const apollo = new ApolloClient({
    cache
});

apollo.cache.restore(store.data);

export function ingestChange(fragment: any, id: string, data: any) {
    console.log("Ingesting change", fragment, id, data);

    apollo.writeFragment({
        fragment,
        id,
        data,
    });

    store.data = apollo.cache.extract();
}
