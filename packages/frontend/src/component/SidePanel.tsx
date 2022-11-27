import React from "react";
import { Box, Text, Heading, Button, Icon, IconButton, Avatar } from "@chakra-ui/react";
import { AddIcon, ChevronDownIcon, TriangleDownIcon } from "@chakra-ui/icons";
import { MdLock, MdRadioButtonUnchecked } from "react-icons/md";
import type { Room } from "livekit-client";
import { gql } from "../lib/gql";
import client from "../lib/data";

export interface SidePanelProps {
    room: Room;
}

export default function SidePanel({ room }: SidePanelProps) {
    room.participants.forEach(participant => {
        console.log(participant.identity);
    });

    const org = client.use(gql!`
        fragment Org on Organization {
            id,
            name
        }
    `, "ROOT");

    console.log("org", org);

    if (!org) return null;

    return <Box
        background="gray.50"
        zIndex={99}
        width="300px"
        height="calc(100% - 40px)"
        position="fixed"
        top={0}
        left={0}
    >
        <Box paddingLeft="20px" paddingBottom="20px" paddingTop="20px" background="gray.100" boxShadow="0px 10px 30px -5px rgba(0,0,0,0.12);">
            <Heading size="md">{org.name} <ChevronDownIcon /></Heading>
        </Box>

        <Box paddingLeft="10px" paddingTop="15px" paddingRight="15px">
            <Box>

                <Box display="flex" alignItems="center" justifyContent="space-between" marginTop="10px">
                    <Button background="gray.50" size="sm" leftIcon={<TriangleDownIcon />} onClick={() => {
                        client.write(gql!`
                            fragment Org on Organization {
                                id,
                                name
                            }
                        `, "ROOT", {
                            id: "ROOT",
                            name: "ACME Corp " + Math.random()
                        });
                    }}>Rooms</Button>
                    <IconButton background="gray.50" aria-label="add" size="sm" icon={<AddIcon />} />
                </Box>
                <Box background="gray.50" flexDirection="column" display="flex" marginTop="10px" width="100%">
                    <Button background="gray.50" size="sm" fontWeight="normal" leftIcon={<Icon as={MdLock} />} marginLeft="10px" width="calc(100% - 15px)" justifyContent="start" isActive>Room 1</Button>
                    <Box display="flex" alignItems="center">
                        <Avatar src="https://avatars.githubusercontent.com/u/5719762?s=40&v=4" width="25px" height="25px" marginTop="5px" marginLeft="25px" />
                        <Text fontSize="md" marginLeft="8px" paddingTop="5px">Laurentiu Ciobanu</Text>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <Avatar src="https://avatars.githubusercontent.com/u/5719762?s=40&v=4" width="25px" height="25px" marginTop="5px" marginLeft="25px" />
                        <Text fontSize="md" marginLeft="8px" paddingTop="5px">Gicu Boilere</Text>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <Avatar src="https://avatars.githubusercontent.com/u/5719762?s=40&v=4" width="25px" height="25px" marginTop="5px" marginLeft="25px" />
                        <Text fontSize="md" marginLeft="8px" paddingTop="5px">Gicu Cazane</Text>
                    </Box>
                </Box>


                <Box background="gray.50" flexDirection="column" display="flex" marginTop="10px" width="100%">
                    <Button background="gray.50" size="sm" fontWeight="normal" leftIcon={<Icon as={MdRadioButtonUnchecked} />} marginLeft="10px" width="calc(100% - 15px)" justifyContent="start">Room 2</Button>
                    <Box display="flex" alignItems="center">
                        <Avatar src="https://avatars.githubusercontent.com/u/5719762?s=40&v=4" width="25px" height="25px" marginTop="5px" marginLeft="25px" />
                        <Text fontSize="md" marginLeft="8px" paddingTop="5px">Laurentiu Ciobanu</Text>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <Avatar src="https://avatars.githubusercontent.com/u/5719762?s=40&v=4" width="25px" height="25px" marginTop="5px" marginLeft="25px" />
                        <Text fontSize="md" marginLeft="8px" paddingTop="5px">Gicu Boilere</Text>
                    </Box>
                </Box>

            </Box>

            <Box>

                <Box display="flex" alignItems="center" justifyContent="space-between" marginTop="10px" marginBottom="5px">
                    <Button background="gray.50" size="sm" leftIcon={<TriangleDownIcon />}>Your workspaces</Button>
                    <IconButton background="gray.50" aria-label="add" size="sm" icon={<AddIcon />} />
                </Box>

                <Box background="gray.50" flexDirection="column" display="flex" marginTop="2px" width="100%">
                    <Button background="gray.50" size="sm" fontWeight="normal" leftIcon={<Icon as={MdLock} />} marginLeft="10px" width="calc(100% - 15px)" justifyContent="start">Workspace 1</Button>
                </Box>

                <Box background="gray.50" flexDirection="column" display="flex" marginTop="2px" width="100%">
                    <Button background="gray.50" size="sm" fontWeight="normal" leftIcon={<Icon as={MdLock} />} marginLeft="10px" width="calc(100% - 15px)" justifyContent="start">Workspace 2</Button>
                </Box>

                <Box background="gray.50" flexDirection="column" display="flex" marginTop="2px" width="100%">
                    <Button background="gray.50" size="sm" fontWeight="normal" leftIcon={<Icon as={MdLock} />} marginLeft="10px" width="calc(100% - 15px)" justifyContent="start">Workspace 3</Button>
                </Box>

                <Box background="gray.50" flexDirection="column" display="flex" marginTop="2px" width="100%">
                    <Button background="gray.50" size="sm" fontWeight="normal" leftIcon={<Icon as={MdLock} />} marginLeft="10px" width="calc(100% - 15px)" justifyContent="start">Workspace 4</Button>
                </Box>

            </Box>
        </Box>
    </Box>
}
