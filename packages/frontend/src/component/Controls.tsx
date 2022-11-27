import { Avatar, AvatarBadge, Box, Icon, IconButton, Button } from "@chakra-ui/react";
import { ArrowLeftIcon, LinkIcon } from "@chakra-ui/icons";
import { MdFilePresent, MdWebAsset, MdDesktopMac, MdArticle, MdMic, MdHeadphones, MdSettings } from "react-icons/md";

import { Browser } from "puppeteer-core";
import React from "react";
import { Room } from "livekit-client";

export interface ControlsProps {
    browser: Browser;
    room: Room;
    setActive: (index: number) => void;
}

export default function Controls({ browser, setActive, room }: ControlsProps) {
    return <Box position="fixed" width="100%" height="40px" bottom={0} left={0} backgroundColor="gray.100" borderTop="1px solid #CBD5E0">
        <Box width="300px" display="inline-block" borderRight="1px solid #CBD5E0">
            <Box display="flex" justifyContent="space-between">
                <IconButton aria-label="add" icon={<ArrowLeftIcon />} background="gray.100" />

                <Box display="flex" marginRight="10px" alignItems="center">
                    <IconButton aria-label="mic" icon={<Icon as={MdMic} />} background="gray.100" onClick={() => {
                        room.localParticipant.setMicrophoneEnabled(true);
                    }} />
                    <IconButton aria-label="headphones" icon={<Icon as={MdHeadphones} />} background="gray.100" />
                    <IconButton aria-label="settings" icon={<Icon as={MdSettings} />} background="gray.100" marginRight="10px" />

                    <Avatar transform="translate(0px, -4px)" src="https://avatars.githubusercontent.com/u/5719762?s=40&v=4" width="30px" height="30px" marginTop="5px" marginRight="10px">
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
                        }
                    }} />
                    <IconButton aria-label="file" icon={<Icon as={MdFilePresent} color="green" />} background="gray.100" />
                    <IconButton aria-label="screen" icon={<Icon as={MdDesktopMac} color="purple" />} background="gray.100" />
                    <IconButton aria-label="note" icon={<Icon as={MdArticle} color="orange" />} background="gray.100" />
                </Box>
                <Box>
                    <Button rightIcon={<LinkIcon />}>Share</Button>
                </Box>
            </Box>

            {/* <button onClick={() => setActive(-1)}>deactivate all</button>
            <button onClick={() => browser?.close()}>close browser</button> */}
        </Box>

    </Box >

}
