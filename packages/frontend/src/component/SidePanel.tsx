import React from "react";
import { Box, Text, Heading, Button, Icon, IconButton, Avatar } from "@chakra-ui/react";
import { AddIcon, ChevronDownIcon, TriangleDownIcon } from "@chakra-ui/icons";
import { MdLock, MdRadioButtonUnchecked } from "react-icons/md";
import type { Room } from "livekit-client";
import { gql } from "../lib/gql";
import client from "../lib/data";
import { USER_ID } from "../constants";
import api from "../lib/api";

export interface SidePanelProps {
    roomId: string;
}

export default function SidePanel({ roomId }: SidePanelProps) {

    const user = client.use(gql!`
        fragment User on User {
            id,
            name,
            workspaces {
                id,
                name,
                participants {
                    id,
                }
            }
        }
    `, USER_ID);

    const org = client.use(gql!`
        fragment Org on Organization {
            id,
            name,
            rooms {
                id,
                name,
                locked,
                participants {
                    id,
                    name,
                    profileImage,
                    livekitIdentity
                }
            }
        }
    `, "ROOT");

    console.log("org", org);
    console.log("user", user);

    if (!user || !org) return null;

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
                    <Button background="gray.50" size="sm" leftIcon={<TriangleDownIcon />}>Rooms</Button>
                    <IconButton background="gray.50" aria-label="add" size="sm" icon={<AddIcon />} />
                </Box>

                {
                    org.rooms.map(room => (
                        <Box background="gray.50" flexDirection="column" display="flex" marginTop="10px" width="100%">
                            <Button background="gray.50" size="sm" fontWeight="normal" leftIcon={room.locked ? <Icon as={MdLock} /> : <Icon as={MdRadioButtonUnchecked} />} marginLeft="10px" width="calc(100% - 15px)" justifyContent="start" isActive={roomId == room.id} onClick={() => {
                                api.join(room.id);
                            }}>{room.name}</Button>
                            {
                                room.participants.map(participant => (
                                    <Box display="flex" alignItems="center">
                                        <Avatar src={participant.profileImage} className={`avatar-${participant.livekitIdentity}`} width="25px" height="25px" marginTop="5px" marginLeft="25px" />
                                        <Text fontSize="md" marginLeft="8px" paddingTop="5px">{participant.name}</Text>
                                    </Box>
                                ))
                            }
                        </Box>
                    ))
                }
            </Box>

            <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" marginTop="10px" marginBottom="5px">
                    <Button background="gray.50" size="sm" leftIcon={<TriangleDownIcon />}>Your workspaces</Button>
                    <IconButton background="gray.50" aria-label="add" size="sm" icon={<AddIcon />} />
                </Box>

                {user.workspaces.map(workspace =>
                    <Box key={workspace.id} background="gray.50" flexDirection="column" display="flex" marginTop="2px" width="100%">
                        <Button background="gray.50" size="sm" fontWeight="normal" leftIcon={<Icon as={MdLock} />} marginLeft="10px" width="calc(100% - 15px)" justifyContent="start" isActive={roomId == workspace.id} onClick={() => {
                            api.join(workspace.id);
                        }}>{workspace.name}</Button>
                    </Box>
                )}
            </Box>
        </Box>
    </Box>
}
