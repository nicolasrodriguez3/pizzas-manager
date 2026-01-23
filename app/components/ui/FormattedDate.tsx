"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date: string | Date;
  type?: "date" | "datetime";
  className?: string;
}

export function FormattedDate({
  date,
  type = "datetime",
  className = "",
}: FormattedDateProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    const d = new Date(date);
    if (type === "date") {
      // Para fechas puras (como compras), usamos UTC para evitar desfases
      setFormatted(d.toLocaleDateString("es-AR", { timeZone: "UTC" }));
    } else {
      // Para fecha y hora (ventas), usamos la hora local del navegador
      setFormatted(
        d.toLocaleString("es-AR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
      );
    }
  }, [date, type]);

  // Evitar problemas de hidratación mostrando nada hasta que estemos en el cliente
  if (!formatted) {
    return <span className={className}>...</span>;
  }

  return <span className={className}>{formatted}</span>;
}
