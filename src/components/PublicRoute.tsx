import {
    Navigate,
} from 'react-router-dom';

import type {
    ReactNode,
} from 'react';

import {
    useAuth,
} from '../context/AuthContext';

export default function
    PublicRoute({
                    children,
                }: {
    children: ReactNode;
}) {

    const { token } =
        useAuth();

    if (token) {
        return (
            <Navigate
                to="/"
            />
        );
    }

    return children;
}