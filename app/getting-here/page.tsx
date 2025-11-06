import Section from '../components/Section'


export default function GettingHerePage() {
return (
<Section title="Getting Here" subtitle="Your cabin is within a 10‑minute drive from Fort William, Anomabo, Ghana, on the Accra – Cape Coast road.">
<div className="prose max-w-none">
<p>If you use Google Maps, enter <strong>5VCF+Q8 Anomabo, Ghana</strong> or search <em>Sojourn Cabins</em>. You can also drop the map pin and navigate.</p>
<ul>
<li>Anomabo is approx. 2.5 hrs from Accra and ~30 mins from Cape Coast.</li>
<li>From Accra: on the Accra/Cape Coast road, turn left at the Anomabo Beach Resort junction.</li>
<li>Then turn left just before the resort entrance and follow directional signage.</li>
<li>Sojourn Cabins is ~3 minutes’ drive from Anomabo Beach Resort.</li>
</ul>
</div>
<div className="mt-8">
<iframe
title="Map"
className="w-full h-[380px] rounded-2xl border"
loading="lazy"
src="https://www.google.com/maps?q=5VCF%2BQ8%20Anomabo%2C%20Ghana&output=embed"></iframe>
</div>
</Section>
)
}