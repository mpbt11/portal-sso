import { revalidatePath } from "next/cache";
import Link from "next/link";
import { auth } from "@/auth";
import {
  adminAddUserToGroup,
  adminRemoveUserFromGroup,
  adminListUsersInGroup,
  adminCreateUser,
} from "@/lib/api";
import { MANAGED_GROUPS, ADMIN_GROUP } from "@/lib/groups";

interface GroupUser {
  username?: string;
  email?: string;
  status?: string;
}

export default async function AdminPage() {
  const session = await auth();
  const isAdmin = (session?.groups ?? []).includes(ADMIN_GROUP);

  if (!isAdmin) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-8 text-center">
          <p className="text-lg">⛔ Acesso restrito a administradores.</p>
          <Link href="/apps" className="mt-4 inline-block text-sky-400 underline">
            Voltar ao portal
          </Link>
        </div>
      </main>
    );
  }

  const token = session?.accessToken;

  async function inviteAction(formData: FormData) {
    "use server";
    const s = await auth();
    await adminCreateUser(s?.accessToken, {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      group: String(formData.get("group")) || undefined,
    });
    revalidatePath("/admin");
  }

  async function addAction(formData: FormData) {
    "use server";
    const s = await auth();
    await adminAddUserToGroup(
      s?.accessToken,
      String(formData.get("email")),
      String(formData.get("group")),
    );
    revalidatePath("/admin");
  }

  async function removeAction(formData: FormData) {
    "use server";
    const s = await auth();
    await adminRemoveUserFromGroup(
      s?.accessToken,
      String(formData.get("email")),
      String(formData.get("group")),
    );
    revalidatePath("/admin");
  }

  const groupsWithUsers = await Promise.all(
    MANAGED_GROUPS.map(async (group) => {
      const res = await adminListUsersInGroup(token, group);
      const users = (res.ok ? (res.data as { users?: GroupUser[] })?.users : []) ?? [];
      return { group, users };
    }),
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-8 py-5">
        <h1 className="text-base font-semibold">🛠️ Administração de Usuários</h1>
        <Link href="/apps" className="text-sm text-sky-400 hover:underline">
          ← Voltar ao portal
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl px-8 py-10">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Convidar novo usuário</h2>
          <p className="mt-1 text-sm text-slate-400">
            A pessoa recebe um e-mail com acesso e define a própria senha no primeiro login.
          </p>
          <form action={inviteAction} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-400">Nome completo</span>
              <input
                name="name"
                type="text"
                required
                placeholder="Maria Paula"
                className="w-56 rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-400">E-mail</span>
              <input
                name="email"
                type="email"
                required
                placeholder="maria@empresa.com"
                className="w-64 rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-400">Setor</span>
              <select
                name="group"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              >
                <option value="">— sem setor —</option>
                {MANAGED_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <button className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-slate-950 hover:bg-emerald-400">
              Enviar convite
            </button>
          </form>
        </section>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Vincular usuário a um grupo</h2>
          <form action={addAction} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-400">E-mail do usuário</span>
              <input
                name="email"
                type="email"
                required
                placeholder="usuario@exemplo.com"
                className="w-72 rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-slate-400">Grupo</span>
              <select
                name="group"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              >
                {MANAGED_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <button className="rounded-md bg-sky-500 px-4 py-2 font-medium text-slate-950 hover:bg-sky-400">
              Vincular
            </button>
          </form>
        </section>

        <section className="mt-8 space-y-6">
          {groupsWithUsers.map(({ group, users }) => (
            <div
              key={group}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <h3 className="text-base font-semibold">
                Grupo <span className="text-sky-400">{group}</span>{" "}
                <span className="text-sm font-normal text-slate-500">
                  ({users.length})
                </span>
              </h3>
              {users.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Nenhum usuário.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-800">
                  {users.map((u) => (
                    <li
                      key={u.username}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span>{u.email ?? u.username}</span>
                      <form action={removeAction}>
                        <input type="hidden" name="email" value={u.email ?? ""} />
                        <input type="hidden" name="group" value={group} />
                        <button className="text-xs text-red-400 hover:underline">
                          remover
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
