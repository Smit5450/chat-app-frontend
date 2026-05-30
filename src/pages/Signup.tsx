import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // const handleSignup = async () => {
  //   try {
  //     setLoading(true);
  //     await api.post("/auth/signup", {
  //       name,
  //       email,
  //       password,
  //     });
  //
  //     toast.success("Account created");
  //
  //     navigate("/login");
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      toast.success("Account created");

      navigate("/login");
    } catch (error) {
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
        onSubmit={handleSignup}
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
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          required
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
          // onClick={handleSignup}
          type="submit"
          className={`
            py-3
            rounded-xl
            text-white
            font-semibold
            ${loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}
          `}
        >
          {loading ? "Loading..." : "Signup"}
        </button>

        <p
          className="
            text-gray-300
            text-center
          "
        >
          Already have an account?
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
      </form>
    </div>
  );
}
