"use client";
import Link from "next/link";
import Image from "next/image";

export default function PlantCard({
  id,
  name,
  scientificName,
  description,
  imageUrl,
}: {
  id?: string;
  name: string;
  scientificName?: string;
  description?: string;
  imageUrl?: string | null;
}) {
  const content = (
    <article className="rounded-lg border border-[hsl(var(--border))] overflow-hidden shadow-sm bg-[hsl(var(--card))] hover:shadow-md transition-shadow">
      <div className="h-48 w-full bg-[hsl(var(--muted))] flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name} 
            width={400} 
            height={192} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="text-[hsl(var(--muted-foreground))]">No image</div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-[hsl(var(--card-foreground))]">{name}</h3>
        {scientificName && <p className="italic text-sm text-[hsl(var(--muted-foreground))]">{scientificName}</p>}
        {description && <p className="mt-2 text-sm text-[hsl(var(--foreground))] line-clamp-2">{description}</p>}
      </div>
    </article>
  );

  if (id) {
    return <Link href={`/plants/${id}`}>{content}</Link>;
  }

  return content;
}
