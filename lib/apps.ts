export interface AppEntry {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  groups?: string[];
}

export const APPLICATIONS: AppEntry[] = [
  {
    id: "app-1",
    name: "Vendas",
    description: "Ferramentas e relatórios da equipe comercial.",
    url: "http://localhost:4001",
    icon: "🟦",
    groups: ["vendas"],
  },
  {
    id: "app-2",
    name: "Financeiro",
    description: "Controle financeiro, faturamento e relatórios.",
    url: "http://localhost:4002",
    icon: "🟩",
    groups: ["financeiro"],
  },
  {
    id: "app-3",
    name: "Administração",
    description: "Área exclusiva para administradores do sistema.",
    url: "http://localhost:4003",
    icon: "🟧",
    groups: ["admin"],
  },
  {
    id: "app-4",
    name: "Portal Geral",
    description: "Recursos disponíveis para todos os colaboradores.",
    url: "http://localhost:4004",
    icon: "🟪",
  },
];

export function filterAppsByGroups(
  apps: AppEntry[],
  userGroups: string[],
): AppEntry[] {
  return apps.filter(
    (app) =>
      !app.groups ||
      app.groups.length === 0 ||
      app.groups.some((g) => userGroups.includes(g)),
  );
}
