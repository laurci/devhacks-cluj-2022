import { Avatar, AvatarBadge, Box, Icon, IconButton, Button } from "@chakra-ui/react";
import { ArrowLeftIcon, LinkIcon } from "@chakra-ui/icons";
import { MdFilePresent, MdWebAsset, MdDesktopMac, MdArticle, MdMic, MdHeadphones, MdSettings } from "react-icons/md";

import { Browser } from "puppeteer-core";
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import client from "../lib/data";
import { gql } from "../lib/gql";
import { LIVEKIT_DOMAIN, USER_ID } from "../constants";
import { AudioRenderer, useRoom } from "@livekit/react-core";
import { RoomEvent } from "livekit-client";
import { bus, SpeakingEvent } from "../lib/events";

export interface ControlsProps {
    browser: Browser;
    roomId: string;
}

export default function Controls({ browser, roomId }: ControlsProps) {
    const [micState, setMicState] = useState(false);
    const [audioState, setAudioState] = useState(false);

    const { room, connect, audioTracks, } = useRoom({})

    const user = client.read(gql!`
        fragment UserInfo on User {
            id,
            profileImage,
            livekitToken
        }
    `, USER_ID);

    useEffect(() => {
        connect(LIVEKIT_DOMAIN, user.livekitToken).then(() => {
            room?.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
                for (const speaker of speakers) {
                    bus.emit("speaking", {
                        identity: speaker.identity,
                        isSpeaking: speaker.isSpeaking,
                    } as SpeakingEvent);
                }
            });
        }).catch(console.error);
    }, [roomId])

    return <>
        <Box position="fixed" width="100%" height="40px" bottom={0} left={0} backgroundColor="gray.100" borderTop="1px solid #CBD5E0">
            <Box width="300px" display="inline-block" borderRight="1px solid #CBD5E0">
                <Box display="flex" justifyContent="space-between">
                    <IconButton aria-label="add" icon={<ArrowLeftIcon />} background="gray.100" />

                    <Box display="flex" marginRight="10px" alignItems="center">
                        <IconButton aria-label="mic" icon={<Icon as={MdMic} color={micState ? "black" : "red"} />} background="gray.100" onClick={async () => {
                            const currentState = room?.localParticipant.isMicrophoneEnabled;
                            if (!currentState) {
                                await room?.localParticipant.setMicrophoneEnabled(true);
                                await room?.startAudio();
                                setMicState(true);
                                console.log("enable mic");
                            } else {
                                room?.localParticipant.setMicrophoneEnabled(false);
                                setMicState(false);
                                console.log("disable mic");
                            }
                        }} />
                        <IconButton aria-label="headphones" icon={<Icon as={MdHeadphones} color={audioState ? "black" : "red"} onClick={async () => {
                            setAudioState(state => !state);
                            await room?.startAudio();
                        }} />} background="gray.100" />
                        <IconButton aria-label="settings" icon={<Icon as={MdSettings} />} background="gray.100" marginRight="10px" />

                        <Avatar transform="translate(0px, -4px)" src={user!.profileImage} width="30px" height="30px" marginTop="5px" marginRight="10px">
                            <AvatarBadge boxSize='0.75em' bg='green.500' />
                        </Avatar>
                    </Box>
                </Box>

            </Box>
            <Box display="inline-block" width="calc(100% - 300px)" transform="translate(0px, -4px)">
                <Box display="flex" justifyContent="space-between" width="100%">
                    <Box>
                        <IconButton aria-label="add" icon={<Icon as={MdWebAsset} color="blue" />} background="gray.100" onClick={async () => {
                            const page = await browser?.newPage();
                            if (page) {
                                await page.goto("https://google.com");
                                const target = page.target();
                                const targetId = (target as any)._targetId;
                                api.newBrowser(roomId, targetId);
                            }

                        }} />
                        <IconButton aria-label="file" icon={<Icon as={MdFilePresent} color="green" />} background="gray.100" />
                        <IconButton aria-label="screen" icon={<Icon as={MdDesktopMac} color="purple" />} background="gray.100" />
                        <IconButton aria-label="note" icon={<Icon as={MdArticle} color="orange" onClick={() => {
                            api.createNote(roomId);
                        }} />} background="gray.100" />
                    </Box>
                    <Box>
                        <Button rightIcon={<LinkIcon />}>Share</Button>
                    </Box>
                </Box>

                {/* <button onClick={() => setActive(-1)}>deactivate all</button>
            <button onClick={() => browser?.close()}>close browser</button> */}
            </Box>

        </Box >
        {audioTracks.map((t) => {
            console.log("t", t);
            return <AudioRenderer track={t} isLocal={false} />
        })}
    </>

}
