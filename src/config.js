/**
 * ─────────────────────────────────────────────────────────────
 *  CLINIC CONFIG — Healing Hands Child Development Centre (CDC)
 *  All CTAs (call / WhatsApp / maps / hours) read from this file.
 * ─────────────────────────────────────────────────────────────
 */
export const CLINIC = {
  name: 'Healing Hands Child Development Centre',
  shortName: 'Healing Hands CDC',
  tagline: 'Nurturing Abilities, Empowering Futures · Thiruverkadu',
  slogan: 'Small Steps Today, Bright Futures Tomorrow.',
  motto: 'Every Child Deserves the Opportunity to Shine!',
  tamilTagline: 'அன்பான கைகள்... சிறந்த நாளைக்காக...',
  city: 'Thiruverkadu · Chennai-77',
  siteUrl: 'https://healinghandscdc.com',

  // Phone shown to users + the tel: link
  phoneDisplay: '+91 70108 85386',
  phoneHref: 'tel:+917010885386',

  // WhatsApp number in international format (used in wa.me links)
  whatsapp: '917598907494',

  email: 'preethimariyappan00@gmail.com',
  address: '34A, RPS Complex, Therodum Veedhi, Thiruverkadu, Chennai - 600077',
  landmark: 'Opposite to Udhavum Karangal School',
  mapsUrl: 'https://maps.google.com/?q=34A+RPS+Complex+Therodum+Veedhi+Thiruverkadu+Chennai+600077',

  rating: '4.9',
  reviewCount: '120+',

  hours: [
    { days: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
    { days: 'Saturday', time: '9:00 AM – 1:00 PM' },
    { days: 'Sunday', time: 'Closed (Emergency On-call)' },
  ],
};

/** Builds a prefilled WhatsApp deep link. */
export function waLink(message) {
  return `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const WA_DEFAULT = waLink(
  `Hi ${CLINIC.name}! I would like to enquire about child therapy services and book an assessment slot.`
);
