import Link from "next/link";
import Button from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Leaf, Search, Star, MapPin, BookOpen, Shield, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-[hsl(var(--background))]">
        {/* Floating Bubbles - Must be first to appear behind everything */}
        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
          {/* Large bubble - top left */}
          <div className="absolute -left-4 top-10 h-64 w-64 animate-float rounded-full bg-emerald-400/50 blur-3xl"></div>
          
          {/* Medium bubble - top right */}
          <div className="absolute -right-8 top-20 h-56 w-56 animate-float-delay-2 rounded-full bg-green-400/45 blur-3xl"></div>
          
          {/* Large bubble - center */}
          <div className="absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 animate-float-delay-5 rounded-full bg-teal-400/40 blur-3xl"></div>
          
          {/* Small bubble - left middle */}
          <div className="absolute left-1/4 top-1/3 h-40 w-40 animate-float-delay-3 rounded-full bg-emerald-500/45 blur-2xl"></div>
          
          {/* Medium bubble - right middle */}
          <div className="absolute right-1/4 top-1/2 h-48 w-48 animate-float-delay-7 rounded-full bg-green-300/40 blur-2xl"></div>
          
          {/* Small bubble - bottom left */}
          <div className="absolute bottom-20 left-1/3 h-36 w-36 animate-float-delay-4 rounded-full bg-cyan-400/40 blur-2xl"></div>
          
          {/* Large bubble - bottom right */}
          <div className="absolute -bottom-10 -right-10 h-80 w-80 animate-float-delay-6 rounded-full bg-teal-500/45 blur-3xl"></div>
          
          {/* Additional accent bubbles for more depth */}
          <div className="absolute left-1/3 top-1/2 h-52 w-52 animate-float-delay-8 rounded-full bg-emerald-300/35 blur-3xl"></div>
          <div className="absolute right-1/3 top-2/3 h-44 w-44 animate-float rounded-full bg-teal-300/40 blur-2xl"></div>
        </div>
        
        {/* Background grid - on top of bubbles */}
        <div className="absolute inset-0 z-10 h-full w-full bg-[hsl(var(--background))] bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] opacity-50 dark:opacity-30"></div>
        
        <div className="relative z-20 container mx-auto flex flex-col items-center gap-8 px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border px-2.5  text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow hover:bg-[hsl(var(--primary))/0.8]">
            <Leaf className="mr-1 h-3 w-3" />
            Botanical Garden Inventory System
          </div>

          {/* Heading */}
          <div className="flex w-full max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">Explore, Learn & Discover</span>
              <span className="mt-2 block bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Our Living Collection
              </span>
            </h1>
            <p className="mx-auto max-w-[750px] text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg md:text-xl">
              A comprehensive platform for exploring plant species, learning their characteristics,
              and managing our botanical garden collection. Built for visitors, researchers, and curators.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/plants">
              <Button size="lg" className="gap-2">
                <Search className="h-4 w-4" />
                Explore Collection
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin Access
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-4 text-center">
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold sm:text-4xl">500+</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">Plant Species</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold sm:text-4xl">10</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">Categories</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold sm:text-4xl">24/7</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2">
            <Sparkles className="mr-1 h-3 w-3" />
            Features
          </div>
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
            Everything you need to explore our garden
          </h2>
          <p className="max-w-[750px] text-lg text-[hsl(var(--muted-foreground))]">
            Whether you&apos;re a visitor, researcher, or curator, our platform provides powerful tools
            for discovering and managing plant information.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))/0.1]">
                <Search className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <CardTitle>Smart Search</CardTitle>
              <CardDescription>
                Find plants instantly by common name, scientific name, or category with powerful filters.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <Star className="h-6 w-6 text-amber-500" />
              </div>
              <CardTitle>Featured Species</CardTitle>
              <CardDescription>
                Discover handpicked notable plants curated by our expert botanists and garden admins.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>Location Mapping</CardTitle>
              <CardDescription>
                Navigate our botanical garden with detailed location information (coming soon).
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <BookOpen className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>Rich Details</CardTitle>
              <CardDescription>
                Access comprehensive plant information including habitat, care tips, and descriptions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <Shield className="h-6 w-6 text-emerald-500" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Full CRUD operations for garden curators with image uploads and category management.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10">
                <TrendingUp className="h-6 w-6 text-rose-500" />
              </div>
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Stay informed with live updates as new species are added to our collection.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-[hsl(var(--muted))/0.5]">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
              Ready to explore our botanical collection?
            </h2>
            <p className="max-w-[750px] text-lg text-[hsl(var(--muted-foreground))]">
              Start discovering unique plant species, learn about their care requirements,
              and connect with the natural world.
            </p>
          </div>
          <Link href="/plants">
            <Button size="lg" className="gap-2">
              <Leaf className="h-4 w-4" />
              Start Exploring Now
            </Button>
          </Link>
        </div>
            </section>
    </main>
  );
}
