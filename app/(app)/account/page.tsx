import { getUserInfo } from "@/app/actions/user";
import { auth } from "@/app/auth";
import { PageHeader } from "@/app/components/ui";
import { AccountView } from "./account-view";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  const data = await getUserInfo();

  if (!data) return null;

  const isOwner = data.membership?.role === "OWNER";

  return (
    <div className="min-h-screen p-8 space-y-8 bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        title="Mi cuenta"
        subtitle="Gestiona tu perfil y configuración de cuenta"
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
        gradient="blue"
      />

      <AccountView
        user={{
          name: data.name,
          email: data.email,
        }}
        organization={data.organizationDetails}
        isOwner={isOwner}
      />
    </div>
  );
}
