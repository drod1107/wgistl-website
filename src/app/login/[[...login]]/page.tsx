'use client';

import Header from "@/components/layout/Header";
import { SignIn } from "@clerk/nextjs";

export default function Login() {
  return (
    <>
    <Header />
    <div className="flex justify-center items-center h-screen">
    <SignIn
      path="/login"
      routing="path"
    />
    </div>
    </>
    )
}