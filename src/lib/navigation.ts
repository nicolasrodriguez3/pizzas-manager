import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  Plus,
} from "lucide-react";
import type { RefAttributes } from "react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<RefAttributes<SVGSVGElement>>;
  description?: string;
  badge?: string | number;
  quickActions?: QuickAction[];
}

export interface QuickAction {
  name: string;
  href: string;
  icon: React.ComponentType<RefAttributes<SVGSVGElement>>;
  description: string;
}

export const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Resumen general del negocio",
  },
  {
    name: "Productos",
    href: "/products",
    icon: Package,
    description: "Gestionar productos y recetas",
    quickActions: [
      {
        name: "Nuevo producto",
        href: "/products/new",
        icon: Plus,
        description: "Crear un nuevo producto",
      },
    ],
  },
  {
    name: "Ingredientes",
    href: "/ingredients",
    icon: ShoppingCart,
    description: "Control de inventario",
    quickActions: [
      {
        name: "Nuevo ingrediente",
        href: "/ingredients?edit=new",
        icon: Plus,
        description: "Agregar ingrediente",
      },
    ],
  },
  {
    name: "Compras",
    href: "/purchases",
    icon: Calculator,
    description: "Registro de compras",
    quickActions: [
      {
        name: "Nueva compra",
        href: "/purchases",
        icon: Plus,
        description: "Registrar compra",
      },
    ],
  },
  {
    name: "Ventas",
    href: "/sales",
    icon: TrendingUp,
    description: "Registro de ventas",
  },
  {
    name: "Gastos",
    href: "/expenses",
    icon: DollarSign,
    description: "Costos fijos y variables",
    quickActions: [
      {
        name: "Nuevo gasto",
        href: "/expenses/new",
        icon: Plus,
        description: "Registrar gasto fijo",
      },
    ],
  },
  {
    name: "Cuenta",
    href: "/account",
    icon: Users,
    description: "Configuración y perfil",
  },
];
