/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminSetup from "../adminSetup.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as content from "../content.js";
import type * as conversations from "../conversations.js";
import type * as donations from "../donations.js";
import type * as events from "../events.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as lib from "../lib.js";
import type * as messages from "../messages.js";
import type * as seedTestData from "../seedTestData.js";
import type * as users from "../users.js";
import type * as volunteers from "../volunteers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminSetup: typeof adminSetup;
  audit: typeof audit;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  content: typeof content;
  conversations: typeof conversations;
  donations: typeof donations;
  events: typeof events;
  health: typeof health;
  http: typeof http;
  lib: typeof lib;
  messages: typeof messages;
  seedTestData: typeof seedTestData;
  users: typeof users;
  volunteers: typeof volunteers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
