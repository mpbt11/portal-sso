import { auth, signOut } from "@/auth";
import { APPLICATIONS, filterAppsByGroups } from "@/lib/apps";

export default async function AppsPage() {
  const session = await auth();
  const userName = session?.user?.name ?? session?.user?.email ?? "usuário";

  const groups = session?.groups ?? [];
  const visibleApps = filterAppsByGroups(APPLICATIONS, groups);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-8 py-5">
        <h1 className="text-base font-semibold">🔐 Portal de Aplicações</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">
            Olá, <strong className="text-slate-100">{userName}</strong>
          </span>
          {groups.includes("admin") && (
            <a
              href="/admin"
              className="rounded-md border border-sky-400 px-3 py-1.5 text-xs text-sky-400 transition hover:bg-sky-400 hover:text-slate-900"
            >
              🛠️ Admin
            </a>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="rounded-md border border-red-400 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-400 hover:text-slate-900">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-8 py-10">
        <h2 className="text-xl font-semibold">Suas aplicações</h2>
        <p className="mt-1 text-sm text-slate-400">
          Acesse abaixo as plataformas disponíveis para o seu perfil. Sua sessão é
          única e compartilhada entre todos os sistemas.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Seus grupos:</span>
          {groups.length > 0 ? (
            groups.map((g) => (
              <span
                key={g}
                className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-300"
              >
                {g}
              </span>
            ))
          ) : (
            <span className="text-slate-500">nenhum (vê apenas apps gerais)</span>
          )}
        </div>

        {visibleApps.length > 0 ? (
          <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {visibleApps.map((app) => (
              <a
                key={app.id}
                href={app.url}
                className="block rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-sky-400"
              >
                <div className="text-4xl">{app.icon}</div>
                <h3 className="mt-3 text-base font-semibold">{app.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{app.description}</p>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Você ainda não tem acesso a nenhuma aplicação. Fale com um administrador.
          </div>
        )}
      </main>
    </div>
  );
}
