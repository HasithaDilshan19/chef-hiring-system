import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChefHat,
  Clock3,
  Flame,
  Users,
  Utensils,
} from 'lucide-react';

const packages = [
  {
    name: 'Cozy Dinner',
    eyebrow: 'For intimate evenings',
    description: 'A relaxed chef experience for a memorable dinner at home.',
    price: 'From $120',
    guests: 'Up to 4 guests',
    duration: '3 hours',
    accent: 'from-orange-500/20 to-amber-500/5 border-orange-400/30',
    icon: Flame,
    features: ['Menu consultation', 'Fresh ingredients', 'Plated dinner service'],
  },
  {
    name: 'Family Feast',
    eyebrow: 'For sharing together',
    description: 'A generous, crowd-pleasing menu made for family and friends.',
    price: 'From $220',
    guests: 'Up to 10 guests',
    duration: '4 hours',
    accent: 'from-amber-500/20 to-yellow-500/5 border-amber-400/40',
    icon: Utensils,
    featured: true,
    features: ['Custom family menu', 'Buffet or shared plates', 'Kitchen clean-up'],
  },
  {
    name: 'Celebration Table',
    eyebrow: 'For your big moments',
    description: 'A polished dining experience designed around your occasion.',
    price: 'From $390',
    guests: 'Up to 20 guests',
    duration: '5 hours',
    accent: 'from-rose-500/15 to-orange-500/5 border-rose-400/30',
    icon: ChefHat,
    features: ['Event menu planning', 'Dedicated chef service', 'Elegant presentation'],
  },
];

export default function FoodiePackages() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-7xl space-y-8 text-slate-100">
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/50 px-6 py-8 sm:px-10 sm:py-10">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <ChefHat size={14} /> Foodie packages
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Bring a chef-worthy table home.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Choose the kind of experience you want, then find the perfect chef to make it yours.
          </p>
        </div>
        <Utensils className="absolute -bottom-8 -right-4 h-44 w-44 rotate-12 text-orange-400/10" />
      </section>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Made for every occasion</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Find your table style</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300 sm:self-auto"
        >
          Browse all chefs <ArrowRight size={16} />
        </button>
      </div>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {packages.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.name}
              className={`relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-6 ${item.accent} ${item.featured ? 'lg:-translate-y-2' : ''}`}
            >
              {item.featured && (
                <span className="absolute right-5 top-5 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950">
                  Most popular
                </span>
              )}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950/70 text-amber-400">
                <Icon size={22} />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">{item.eyebrow}</p>
              <h3 className="mt-1 text-2xl font-black text-white">{item.name}</h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-300">{item.description}</p>
              <div className="mt-5 flex flex-wrap gap-3 border-y border-white/10 py-4 text-xs font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-amber-400" />{item.guests}</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-amber-400" />{item.duration}</span>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-400" /> {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <p className="text-lg font-black text-white">{item.price}</p>
                <button
                  type="button"
                  onClick={() => navigate('/search')}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-slate-950/50 px-4 py-3 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-500 hover:text-slate-950"
                >
                  Find a chef <ArrowRight size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
