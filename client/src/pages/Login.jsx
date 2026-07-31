import React, { useState } from "react";
import { User2Icon, Mail, Lock } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../app/features/authSlice";
import { toast} from "react-hot-toast";
import api from "../configs/api";
const Login = () => {
    const dispatch=useDispatch()
  const [searchParams, setSearchParams] = useSearchParams();

  const state = (searchParams.get("state") || "login").toLowerCase();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    
    const { data } = await api.post(`/api/users/${state}`, formData);

    dispatch(login(data));
    localStorage.setItem("token", data.token);

    toast.success(data.message);
  } catch (error) {
 
  toast.error(error.response?.data?.message || error.message);
}
};
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleState = () => {
    setSearchParams({
      state: state === "login" ? "register" : "login",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white"
      >
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">
          {state === "login" ? "Login" : "Sign Up"}
        </h1>

        <p className="text-gray-500 text-sm mt-2">
          Please {state === "login" ? "login" : "sign up"} to continue
        </p>

        {state === "register" && (
          <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <User2Icon size={16} color="#6B7280" />

            <input
              type="text"
              name="name"
              placeholder="Name"
              className="border-none outline-none ring-0 flex-1"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <Mail size={16} color="#6B7280" />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border-none outline-none ring-0 flex-1"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <Lock size={16} color="#6B7280" />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border-none outline-none ring-0 flex-1"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {state === "login" && (
          <div className="mt-4 text-left">
            <button
              type="button"
              className="text-sm text-green-500 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="mt-4 w-full h-11 rounded-full text-white bg-green-500 hover:bg-green-600 transition"
        >
          {state === "login" ? "Login" : "Sign Up"}
        </button>

        <p className="text-gray-500 text-sm mt-4 mb-10">
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={toggleState}
            className="text-green-500 hover:underline font-medium"
          >
            Click here
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;