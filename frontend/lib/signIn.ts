"use server";

import { signIn } from "@/auth";

export default async function signInHelper() {
  signIn("github");
}
