import Section from '../components/Section'
import Card from '../components/Card'
import Image from 'next/image'


export default function OurCabinsPage() {
return (
<Section title="Our Cabins" subtitle="Luxurious 65sqm mirror cabins with panoramic Atlantic views.">
<div className="grid gap-6 md:grid-cols-3">
{[
{ name: 'SUN CABIN', img: '/cabins/sun.jpg', copy: 'A luxurious one‑storey 65sqm mirror cabin escape with panoramic ocean views, personal balcony, private pool and lounge area.' },
{ name: 'SEA CABIN', img: '/cabins/sea.jpg', copy: 'A private 65sqm mirror cabin escape with stunning Atlantic views, balcony, private pool and lounge area.' },
{ name: 'SAND CABIN', img: '/cabins/sand.jpg', copy: 'A private 65sqm mirror cabin escape with Atlantic views, personal balcony, private pool and lounge area.' },
].map((c) => (
<Card key={c.name} title={c.name}>
<Image src={c.img} alt={c.name} width={600} height={400} className="rounded-xl"/>
<p className="muted mt-3">{c.copy}</p>
</Card>
))}
</div>
</Section>
)
}