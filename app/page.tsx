import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/apps");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center shadow-xl">
        <div className="text-5xl">🔐</div>
        <h1 className="mt-4 text-2xl font-semibold">Portal de Aplicações</h1>
        <p className="mt-2 text-sm text-slate-400">
          Autentique-se uma única vez e acesse todas as suas aplicações.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("cognito", { redirectTo: "/apps" });
          }}
        >
          <button
            type="submit"
            className="mt-8 w-full rounded-lg bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
