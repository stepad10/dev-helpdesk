import { index, route } from "@react-router/dev/routes";
import { type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("api/chat", "routes/api.chat.ts"),
] satisfies RouteConfig;
