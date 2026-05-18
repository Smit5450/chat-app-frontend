import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.tsx";
import {useState} from "react";
import api from "../services/api.ts";

export default function Login() {
    const navigate = useNavigate();
    const {login} =useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await api.post('/auth/login', {email, password});
            login(response.data.accessToken, response.data.user);
            navigate('/');
        } catch (error) {
            console.log(error);
            alert('Login failed');
        }
    }

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
                        Login
                    </h1>

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
                            handleLogin
                        }

                        className="
            bg-blue-500
            hover:bg-blue-600
            py-3
            rounded-xl
            text-white
            font-semibold
          "
                    >

                        Login

                    </button>

                    <p
                        className="
            text-gray-300
            text-center
          "
                    >

                        Don't have
                        an account?

                        <Link

                            to="/signup"

                            className="
              text-blue-400
              ml-2
            "
                        >

                            Signup

                        </Link>

                    </p>

                </div>

            </div>
        )
    }
