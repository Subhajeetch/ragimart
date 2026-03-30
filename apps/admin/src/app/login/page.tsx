import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login/Signup - Ragimart",
  description: "Login or signup to access your Ragimart account",
};

export default function LoginPage() {
  return <LoginClient />;
}