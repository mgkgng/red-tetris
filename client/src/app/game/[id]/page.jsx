'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SocketProvider } from '@/contexts/SocketContext.jsx';
import RoomComponent from './RoomComponent.jsx'

export default function Page({ params }) {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    return (
        <SocketProvider>
            <RoomComponent id={params.id} />
        </SocketProvider>
    )
}