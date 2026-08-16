import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProjectDashboardClient from "./ProjectDashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return <ProjectDashboardClient />;
}
