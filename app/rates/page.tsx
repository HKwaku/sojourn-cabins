import Section from '../components/Section'
import Card from '../components/Card'


export default function RatesPage() {
return (
<Section title="Rates" subtitle="All rates include a complimentary walking tour of Anomabo and complimentary continental breakfast.">
<div className="grid gap-6 md:grid-cols-3">
<Card title="SAND Cabin">
<ul className="space-y-1 text-sm">
<li>Weekdays (Sun–Thu): <strong>GHS 2,600/night</strong></li>
<li>Weekends (Fri–Sat): <strong>GHS 3,200/night</strong></li>
</ul>
</Card>
<Card title="SEA Cabin">
<ul className="space-y-1 text-sm">
<li>Weekdays (Sun–Thu): <strong>GHS 2,600/night</strong></li>
<li>Weekends (Fri–Sat): <strong>GHS 3,200/night</strong></li>
</ul>
</Card>
<Card title="SUN Cabin">
<ul className="space-y-1 text-sm">
<li>Weekdays (Sun–Thu): <strong>GHS 3,200/night</strong></li>
<li>Weekends (Fri–Sat): <strong>GHS 3,500/night</strong></li>
</ul>
</Card>
</div>


<div className="mt-10 grid gap-4 md:grid-cols-2">
<Card title="Extras">
<ul className="text-sm space-y-1">
<li>Private Chef – Lunch (2 courses) & Dinner (2 courses): <strong>GHS 2,200/day</strong></li>
<li>Wellness – Relax Package (any two treatments): <strong>GHS 1,250</strong></li>
<li>Wellness – Rejuvenate Package (any four treatments): <strong>GHS 2,275</strong></li>
<li>Wellness – Indulge Package (any six treatments): <strong>GHS 3,300</strong></li>
<li>Outdoor Movie Experience (per night, per cabin): <strong>GHS 420</strong></li>
<li>Professional Saxophone Player (one session): <strong>GHS 1,250</strong></li>
<li>Sip & Paint (Alcohol): <strong>GHS 600</strong></li>
<li>Sip & Paint (Non‑Alcoholic): <strong>GHS 450</strong></li>
</ul>
<p className="muted mt-3">** Prices may be higher during peak periods.</p>
</Card>
</div>
</Section>
)
}