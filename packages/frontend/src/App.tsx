import React from "react";
import Map from "./component/Map";
import { ChakraProvider } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client";
import { apollo } from "./lib/data";


export default function App() {
    return <>
        <ChakraProvider>
            <ApolloProvider client={apollo}>
                <Map />
            </ApolloProvider>
        </ChakraProvider>
    </>
}
