import { redirect } from "next/navigation";

export default function PartnerLoginRedirectPage() {
  redirect("/auth/login?next=/partner");
}
