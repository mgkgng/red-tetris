'use client';

import { useEffect, useState } from 'react';
import { SocketProvider } from '@/contexts/SocketContext';
import RoomComponent from './RoomComponent'

export default function Page({ params }: { params: { id: string } }) {
    const [verified, setVerified] = useState(false);

    return (
        <SocketProvider>
            <RoomComponent id={params.id} />
        </SocketProvider>
    )
}