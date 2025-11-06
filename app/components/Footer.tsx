export default function Footer() {
return (
<footer className="border-t border-neutral-200">
<div className="container py-10 grid gap-6 md:grid-cols-3">
<div>
<h4 className="font-semibold mb-2">Contact</h4>
<p className="text-sm">theteam@sojourngh.com</p>
<p className="text-sm">Location: Google Plus Code: 5VCF+Q8 Anomabo, Ghana</p>
<p className="text-sm">Enquiries (7am–7pm): +233-54-748-4568</p>
</div>
<div>
<h4 className="font-semibold mb-2">Social</h4>
<ul className="text-sm space-y-1">
<li><a className="hover:underline" href="https://www.instagram.com" target="_blank">Instagram</a></li>
<li><a className="hover:underline" href="https://www.tiktok.com" target="_blank">TikTok</a></li>
</ul>
</div>
<div>
<h4 className="font-semibold mb-2">© {new Date().getFullYear()} Sojourn Cabins</h4>
<p className="text-sm muted">All rights reserved.</p>
</div>
</div>
</footer>
)
}