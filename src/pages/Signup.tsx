import {

    useState,

} from 'react';

import {

    Link,

    useNavigate,

} from 'react-router-dom';

import api
    from '../services/api';

export default function Signup() {

    const navigate =
        useNavigate();

    const [name, setName] =
        useState('');

    const [email, setEmail] =
        useState('');

    const [
        password,
        setPassword,
    ] = useState('');

    const handleSignup =
        async () => {

            try {

                await api.post(
                    '/auth/signup',
                    {
                        name,
                        email,
                        password,
                    },
                );

                navigate(
                    '/login',
                );

            } catch (error) {

                console.log(error);

                alert(
                    'Signup failed',
                );
            }
        };

    return (

        <div
            className="
        min-h-screen
        bg-slate-900
        flex
        items-center
        justify-center
        px-4
      "
        >

            <div
                className="
          bg-slate-800
          p-8
          rounded-2xl
          w-full
          max-w-md
          flex
          flex-col
          gap-4
        "
            >

                <h1
                    className="
            text-3xl
            text-white
            font-bold
            text-center
          "
                >
                    Signup
                </h1>

                <input

                    type="text"

                    placeholder="Name"

                    value={name}

                    onChange={(e) =>
                        setName(
                            e.target.value,
                        )
                    }

                    className="
            px-4
            py-3
            rounded-xl
            bg-slate-700
            text-white
            outline-none
          "
                />

                <input

                    type="email"

                    placeholder="Email"

                    value={email}

                    onChange={(e) =>
                        setEmail(
                            e.target.value,
                        )
                    }

                    className="
            px-4
            py-3
            rounded-xl
            bg-slate-700
            text-white
            outline-none
          "
                />

                <input

                    type="password"

                    placeholder="Password"

                    value={password}

                    onChange={(e) =>
                        setPassword(
                            e.target.value,
                        )
                    }

                    className="
            px-4
            py-3
            rounded-xl
            bg-slate-700
            text-white
            outline-none
          "
                />

                <button

                    onClick={
                        handleSignup
                    }

                    className="
            bg-green-500
            hover:bg-green-600
            py-3
            rounded-xl
            text-white
            font-semibold
          "
                >

                    Signup

                </button>

                <p
                    className="
            text-gray-300
            text-center
          "
                >

                    Already have
                    an account?

                    <Link

                        to="/login"

                        className="
              text-blue-400
              ml-2
            "
                    >

                        Login

                    </Link>

                </p>

            </div>

        </div>
    );
}