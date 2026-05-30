import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { useState } from "react";
import api from "../services/api.ts";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // const handleLogin = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await api.post("/auth/login", { email, password });
  //     login(response.data.accessToken, response.data.user);
  //     toast.success("Login successful");
  //     navigate("/");
  //   } catch (error) {
  //     // toast.error(error.response?.data?.message || "Login failed");
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      login(response.data.accessToken, response.data.user);
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      // toast.error(error.response?.data?.message || "Login failed");
      console.error(error);
    } finally {
      setLoading(false);
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
      <form
        onSubmit={handleLogin}
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
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          type="submit"
          // onClick={handleLogin}
          disabled={loading}
          className={`
            py-3
            rounded-xl
            text-white
            w-full
            transition
            ${loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}
          `}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          className="
            text-gray-300
            text-center
          "
        >
          Don't have an account?
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
      </form>
    </div>
  );
}
