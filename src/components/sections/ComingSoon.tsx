interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: string;
}

export function ComingSoon({ title, description, icon = "🚧" }: ComingSoonProps) {
  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-parchment">
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="text-5xl opacity-60">{icon}</span>

        <div className="space-y-2">
          <h1 className="font-heading text-4xl tracking-[-0.03em] text-near-black">
            {title}
          </h1>
          <p className="text-stone">Coming soon...</p>
          {description && (
            <p className="mt-1 max-w-sm text-sm text-silver">{description}</p>
          )}
        </div>

        {/* Decorative dots */}
        <div className="mt-4 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-warm"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
