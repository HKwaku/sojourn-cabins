'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu } from 'lucide-react'


const links = [
{ href: '/', label: 'Home' },
{ href: '/rates', label: 'Rates' },
{ href: '/getting-here', label: 'Getting Here' },
{ href: '/our-cabins', label: 'Our Cabins' },
{ href: '/terms-and-conditions', label: 'T&C' },
{ href: '/book-escape', label: 'Book Escape' },
]


export default function Navbar() {
const [open, setOpen] = useState(false)
return (
<header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-neutral-200">
<div className="container flex h-16 items-center justify-between">
<Link href="/" className="flex items-center gap-2">
<img src="/logo.webp" alt="Sojourn Cabins" className="h-8 w-8 rounded-full object-cover"/>
<span className="font-semibold">Sojourn Cabins</span>
</Link>
<nav className="hidden md:flex items-center gap-6">
{links.map(l => (
<Link key={l.href} href={l.href} className="text-sm hover:underline underline-offset-4">{l.label}</Link>
))}
</nav>
<button className="md:hidden btn-outline" aria-label="Open menu" onClick={() => setOpen(!open)}>
<Menu size={18} />
</button>
</div>
{open && (
<div className="md:hidden border-t border-neutral-200">
<div className="container py-3 grid gap-2">
{links.map(l => (
<Link key={l.href} href={l.href} className="py-2" onClick={() => setOpen(false)}>{l.label}</Link>
))}
</div>
</div>
)}
</header>
)
}