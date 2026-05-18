import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Chat from "./pages/Chat.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import PublicRoute from "./components/PublicRoute.tsx";


function App() {
return (
    <BrowserRouter>
      <Routes>

        <Route
            path="/login"
            element={
                <PublicRoute>
                    <Login />
                </PublicRoute>

        }
        />

        <Route
            path="/signup"
            element={
                <PublicRoute>
                    <Signup />
                </PublicRoute>
        }
        />

        <Route
            path="/"
            element={
                <ProtectedRoute>
                    <Chat />
                </ProtectedRoute>
            }
        />
      </Routes>

    </BrowserRouter>
)
}

export default App
