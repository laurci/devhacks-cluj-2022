import { Box } from "@chakra-ui/react";
import React from "react";
import client from "../lib/data";
import { gql } from "../lib/gql";

export interface NoteProps {
    noteId: string;
}

export default function Note({ noteId }: NoteProps) {
    const note = client.use(gql!`
        fragment NoteInfo on Note {
            id,
            x,
            y,
            width,
            height,
            content
        }
    `, noteId);

    if (!note) return null;

    return <Box
        transform={`translate(${note.x}px, ${note.y}px)`}
        background="yellow.300"
        width={`${note.width}px`}
        height={`${note.height}px`}
        zIndex={10}
        boxShadow="21px 20px 26px -6px rgba(189,189,42,0.5)"
        padding="5px"
    >
        {note.content}
    </Box>;
}
