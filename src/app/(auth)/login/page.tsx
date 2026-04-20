import { SignInForm } from "@/components/auth/sign-in-form";

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[--color-stone-gray]">
            Welcome back to Porocia
          </p>

          <h1 className="max-w-[11ch] font-heading text-5xl leading-[1.02] tracking-[-0.04em] text-[--color-near-black] sm:text-6xl">
            A calmer workspace for focused teams.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[--color-olive-gray]">
            Sign in to access your team channel, stay in sync with daily updates,
            and continue conversations without losing context.
          </p>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <SignInForm />
        </div>
      </section>
    </main>
  );
}