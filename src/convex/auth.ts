// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation
// (A Password provider has been added per the Convex Auth documentation:
//  https://labs.convex.dev/auth/api_reference/providers/Password)

import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import type { Value } from "convex/values";
import { emailOtp } from "./auth/emailOtp";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    emailOtp,
    Anonymous,
    Password({
      /**
       * Capture the visitor's name at sign-up (minimised data collection:
       * full name + email + password, nothing else).
       */
      profile(params: Record<string, Value | undefined>) {
        return {
          email: String(params.email ?? ""),
          ...(typeof params.name === "string" && params.name.trim()
            ? { name: params.name.trim() }
            : {}),
        };
      },
      validatePasswordRequirements(password: string) {
        if (typeof password !== "string" || password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }
        if (password.length > 200) {
          throw new Error("Password must be at most 200 characters.");
        }
      },
    }),
  ],
});
