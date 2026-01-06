import React from "react";
import RegisterHeader from "./_components/RegisterHeader";
import RegisterForm from "./_components/RegisterForm";
import RegisterFooter from "./_components/RegisterFooter";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <RegisterHeader />
        <RegisterForm />
        <RegisterFooter />
      </div>
    </div>
  );
}