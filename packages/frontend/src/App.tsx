import React from "react";
import Map from "./component/Map";
import { ChakraProvider } from "@chakra-ui/react";


export default function App() {
    return <>
        <ChakraProvider>
            <Map />
        </ChakraProvider>
    </>
}
