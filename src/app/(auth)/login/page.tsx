import { SignInForm } from "@/components/auth/sign-in-form";

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[--color-stone-gray]">
            Porociaへようこそ
          </p>

          <h1 className="max-w-[15ch] font-heading text-5xl leading-[1.2] tracking-[-0.02em] text-[--color-near-black] sm:text-6xl">
            チームの集中力を高める、穏やかなワークスペース。
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[--color-olive-gray]">
            サインインしてチームチャネルにアクセスし、最新情報を共有。
            文脈を維持したままスムーズに会話を続けましょう。
          </p>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <SignInForm />
        </div>
      </section>
    </main>
  );
}