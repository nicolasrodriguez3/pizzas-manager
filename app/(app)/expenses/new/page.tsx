import { getFixedCosts } from "@/app/actions/fixedCosts";
import { FixedCostForm } from "@/app/components/FixedCostForm";
import { PageHeader } from "@/app/components/ui/PageHeader";

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/expenses", label: "Gastos Fijos" },
  { href: "/expenses/new", label: "Nuevo Gasto Fijo" },
];

export default async function ExpensesNewPage({ searchParams }: PageProps) {
  const { edit } = await searchParams;
  const fixedCosts = await getFixedCosts();

  const editingExpense = edit
    ? fixedCosts.find((cost) => cost.id === edit)
    : undefined;

  return (
    <div className="min-h-screen p-8 space-y-8 bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        title="Gastos Fijos"
        gradient="blue"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
      />

      <div className="max-w-4xl mx-auto mt-8">
        <FixedCostForm fixedCost={editingExpense} />
      </div>
    </div>
  );
}
