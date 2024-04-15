'use client'

import React from 'react';
import Picker from "emoji-picker-react";
import { Accordion } from 'flowbite-react';
import styles from './EmojiAccordeon.module.css';

const EmojiAccordeon = ({onEmojiClick}) => {
    
    return (
        <Accordion className='border-none hover:bg-none border-t-0' collapseAll>
            <Accordion.Panel>
                <Accordion.Title className={styles.accordion}>Pick Emoji</Accordion.Title>
                <Accordion.Content className="focus:border-t-0">
                    <Picker
                        onEmojiClick={onEmojiClick} 
                        searchDisabled={true}
                        reactionsDefaultOpen={true}
                        height={250}
                        native
                    />
                </Accordion.Content>
            </Accordion.Panel>
        </Accordion>
    )
}

export default EmojiAccordeon;
