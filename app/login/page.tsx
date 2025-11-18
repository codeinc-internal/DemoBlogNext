"use client";
import React, { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { InputField, CartoonCard } from "../components";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    telegram: "",
    phone: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        console.log("log in")
        // Sign in with email and password
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
            console.log("Login failed:", result.error);

          setError("Invalid email or password");
        } else {
          router.push('/');
        }
      } else {
        // Register new user
        const registerResponse = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            telegram: form.telegram,
            phone: form.phone,
          }),
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          setError(registerData.error || "Registration failed");
          return;
        }

        // Automatically sign in after registration
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Registration successful, but sign in failed");
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec] p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-40"></div>

      <CartoonCard title={isLogin ? "Login" : "Register"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <InputField
              label="Full Name"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          {!isLogin && (
            <InputField
              label="Telegram Username"
              name="telegram"
              placeholder="@username"
              value={form.telegram}
              onChange={handleChange}
            />
          )}

          {!isLogin && (
            <InputField
              label="Phone Number"
              name="phone"
              placeholder="+12345678"
              value={form.phone}
              onChange={handleChange}
            />
          )}

          <InputField
            label="Email"
            type="email"
            name="email"
            placeholder="email@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <InputField
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            type="password"
          />

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 w-full py-3 bg-black text-white text-xl font-bold rounded-2xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
            style={{ boxShadow: "6px 6px 0px #ffdd57" }}
          >
            {isLoading ? "Processing..." : (isLogin ? "🚀 Sign In" : "🚀 Register")}
          </button>

         

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setForm({
                  name: "",
                  telegram: "",
                  phone: "",
                  email: "",
                  password: ""
                });
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </CartoonCard>
    </div>
  );
}
