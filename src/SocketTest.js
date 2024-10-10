import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

function SocketTest() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [lastMessage, setLastMessage] = useState(null);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('testResponse', (data) => {
            setLastMessage(data);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('testResponse');
        };
    }, []);

    const sendTestEvent = () => {
        socket.emit('test', 'Hello from client!');
    };

    return (
        <div>
            <p>Connected: {'' + isConnected}</p>
            <p>Last message: {lastMessage || '-'}</p>
            <button onClick={sendTestEvent}>Send Test Event</button>
        </div>
    );
}

export default SocketTest;