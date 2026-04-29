import Image from "next/image";
import Link from "next/link";

interface CultureHighlightProps {
  imageSrc: string;
  imageAlt: string;
  tag: string;
  title: string;
  href: string;
}

export default function CultureHighlight({
  imageSrc,
  imageAlt,
  tag,
  title,
  href,
}: CultureHighlightProps) {
  return (
    <Link href={href} className="group block cursor-pointer">
      <div className="relative h-[480px] md:h-[500px] rounded-xl overflow-hidden mb-6">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-8 left-8 right-8">
          <span
            className="inline-block px-3 py-1 rounded text-xs font-bold mb-4 text-white"
            style={{ backgroundColor: "var(--color-terracotta, #c96442)" }}
          >
            {tag}
          </span>
          <h3
            className="text-3xl md:text-4xl text-white font-medium leading-tight"
            style={{ fontFamily: "var(--font-serif-jp, 'Newsreader', serif)" }}
          >
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}