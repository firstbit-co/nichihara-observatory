/**
 * 英語・フランス語のページ(/en/、/fr/)の文言。
 * 時間・料金・休館日は facility.ts から差し込むので、ここには書かない。
 * 内容は日本語ページの確定稿に合わせる(予約は受け付けていない、料金は変わらない、など)。
 */
import { CLOSED, FEES, HOURS } from './facility';

export type Lang = 'ja' | 'en' | 'fr';

/** 言語の切り替えリンク(各言語の名前はその言語で書く) */
export const LANGS = [
  { lang: 'ja', href: '/', label: '日本語' },
  { lang: 'en', href: '/en/', label: 'English' },
  { lang: 'fr', href: '/fr/', label: 'Français' },
] as const;

const weekday = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
};
const closedDays = (l: 'en' | 'fr') => CLOSED.weekdays.map((d) => weekday[l][d]).join(l === 'en' ? ' and ' : ' et ');
const yenEn = (v: number) => `¥${v.toLocaleString('en-US')}`;
const yenFr = (v: number) => `${v.toLocaleString('fr-FR')} ¥`;
const dash = (a: string, b: string) => `${a}–${b}`;
const frTime = (t: string) => t.replace(':', ' h ');

export const STRINGS = {
  en: {
    locale: 'en_US',
    name: 'Nichihara Observatory',
    tagline: 'A public observatory on Mt. Makurase, Tsuwano, Shimane',
    title: 'Nichihara Observatory — Tsuwano, Shimane, Japan',
    description:
      'A public observatory at 255 m on the summit of Mt. Makurase in Tsuwano, Shimane. Since 1985, anyone can look through its 75 cm reflecting telescope.',
    skip: 'Skip to content',
    menu: 'Open menu',
    nightMode: 'Red night mode',
    langLabel: 'Language',
    nav: [
      ['#about', 'About'],
      ['#visit', 'Visiting'],
      ['#telescope', 'Telescope'],
      ['#facilities', 'Facilities'],
      ['#stay', 'Stay'],
      ['#access', 'Access'],
    ],
    heroLead: 'Look up at the night sky from Mt. Makurase.',
    heroText: 'A public observatory in Tsuwano, opened in 1985. See tonight’s sky through a 75 cm telescope.',
    aboutTitle: 'About the observatory',
    catch: 'Beyond the starry sky, the wonder of the universe awaits.',
    about: [
      'Nichihara Observatory is a public observatory surrounded by rich nature, on the summit of Mt. Makurase in Tsuwano, Shimane Prefecture, at an altitude of 255 m. Since it opened in 1985, it has shared the mystery of the universe and the beauty of the stars with many visitors for more than 40 years.',
      'The star of the observatory is its large 75 cm reflecting telescope. Distant stars invisible to the naked eye, craters on the Moon, the planets — sights you may only have seen in books or photos — you can see them with your own eyes.',
      'This telescope also carries the history of large-telescope development in Japan that later led to the Subaru Telescope, one of the largest optical telescopes in the world. Here you can enjoy the universe and also touch the history of Japanese astronomy.',
    ],
    visitTitle: 'Visiting',
    daysTitle: 'Open days',
    days: `Open ${weekday.en[4]} to ${weekday.en[1]}. Closed every ${closedDays('en')}, and on New Year’s Day.`,
    hoursTitle: 'Opening hours',
    hours: [
      ['Daytime', dash(HOURS.day.start, HOURS.day.end), 'Tour the facilities. On clear days when the Sun is high, you may observe the Sun.'],
      ['Night', `${dash(HOURS.night.start, HOURS.night.end)} (from ${HOURS.night.summerStart} in summer)`, 'Staff point the telescope and you look through it. What you can see depends on the season, the Moon and the clouds.'],
    ],
    hoursNote: 'Opening hours may change.',
    feesTitle: 'Admission',
    feesHead: ['', 'Adults', 'Children'],
    fees: [
      ['Night stargazing', yenEn(FEES.adult), yenEn(FEES.nightStudent)],
      ['Star and Forest Science Museum', yenEn(FEES.adult), `${yenEn(FEES.museumStudent)} (high school and under)`],
    ],
    feesNote: 'Admission fees do not change. The science museum is free for registered residents of Tsuwano.',
    howTitle: 'How to visit',
    how: [
      'No reservation is needed — reservations are not accepted. Just come on the day.',
      'Check in at the Astronomy Archive Hall “Polan no Hiroba”. Tickets for the science museum are also sold here.',
      'Night viewing may not be possible depending on the weather.',
    ],
    tipsTitle: 'Tips',
    tips: [
      'It is colder on the mountain than in town. Please bring a jacket.',
      'When looking through the telescope, keep flashlights and phone screens dim. You can use this site’s red night mode.',
    ],
    telescopeTitle: 'The 75 cm telescope',
    specs: [
      ['Type', 'Altazimuth reflecting telescope (Nasmyth focus)'],
      ['Aperture', '75 cm'],
      ['Focal length', 'about 9 m (f/12)'],
      ['Mount', 'Computer-controlled altazimuth mount'],
      ['Built by', 'Norizuki Giken (Yaizu, Shizuoka), 1985'],
    ],
    telescope: [
      'In the 1980s, Japanese astronomers were researching ways to make huge mirrors lighter, aiming for one of the world’s largest telescopes (later Subaru). The Nichihara 75 cm was built as a test case for that project. Subaru finally chose a different kind of thin mirror, but this telescope still tells the story of that era of challenge.',
      'With the Nasmyth focus, light is sent sideways and you look in from the side of the telescope. The eyepiece stays at almost the same height wherever the telescope points, so children and first-time visitors can observe comfortably.',
    ],
    facilitiesTitle: 'On Mt. Makurase',
    facilities: [
      ['Astronomy Archive Hall “Polan no Hiroba”', 'Opened in 1989. Reception for the observatory and the science museum. Video screenings are free.'],
      ['Star and Forest Science Museum', 'Opened in 1994. A science museum about space and the Earth’s environment, with a Foucault pendulum and exhibits on the phases of the Moon and the planets.'],
    ],
    stayTitle: 'Stay overnight',
    stay: 'The guesthouse “SORABE” (whole-house rental) is on the same mountain. Prices and bookings are on the SORABE website. Accommodation is separate from observatory admission.',
    stayLink: 'SORABE website (Japanese)',
    camp: 'Makurase-yama Campground is also nearby (spring to autumn).',
    accessTitle: 'Access',
    address: '806-1 Makurase, Tsuwano-cho, Kanoashi-gun, Shimane, Japan',
    accessTrain: 'By train: JR Yamaguchi Line to Nichihara Station, then by taxi.',
    accessCar: 'By car: from Nichihara Station toward Makurase-yama Campground. Parking near the summit. The road is a mountain road — drive carefully, especially at night.',
    mapLink: 'Open in Google Maps',
    contactTitle: 'Contact',
    tel: 'Phone',
    japaneseOnly: 'News, events and the other pages of this site are in Japanese.',
    toJapanese: 'Japanese site',
    footerNav: 'Footer menu',
  },
  fr: {
    locale: 'fr_FR',
    name: 'Observatoire de Nichihara',
    tagline: 'Observatoire public du mont Makurase, Tsuwano, Shimane',
    title: 'Observatoire de Nichihara — Tsuwano, Shimane, Japon',
    description:
      'Observatoire public situé à 255 m d’altitude, au sommet du mont Makurase à Tsuwano (Shimane). Depuis 1985, chacun peut observer les étoiles avec son télescope de 75 cm.',
    skip: 'Aller au contenu',
    menu: 'Ouvrir le menu',
    nightMode: 'Mode nuit rouge',
    langLabel: 'Langue',
    nav: [
      ['#about', 'L’observatoire'],
      ['#visit', 'Visite'],
      ['#telescope', 'Télescope'],
      ['#facilities', 'Installations'],
      ['#stay', 'Hébergement'],
      ['#access', 'Accès'],
    ],
    heroLead: 'Observer le ciel nocturne depuis le mont Makurase.',
    heroText: 'Un observatoire public de Tsuwano, ouvert en 1985. Découvrez le ciel du soir à travers un télescope de 75 cm.',
    aboutTitle: 'L’observatoire',
    catch: 'Au-delà du ciel étoilé, l’émerveillement de l’univers vous attend.',
    about: [
      'L’observatoire de Nichihara est un observatoire public entouré d’une nature généreuse, au sommet du mont Makurase, à Tsuwano (préfecture de Shimane), à 255 m d’altitude. Depuis son ouverture en 1985, il partage depuis plus de 40 ans le mystère de l’univers et la beauté du ciel étoilé avec de nombreux visiteurs.',
      'La vedette de l’observatoire est son grand télescope à réflexion de 75 cm. Étoiles lointaines invisibles à l’œil nu, cratères de la Lune, planètes : ce que vous n’aviez vu que dans les livres ou en photo, vous pouvez l’observer de vos propres yeux.',
      'Ce télescope porte aussi l’histoire du développement des grands télescopes au Japon, qui a mené plus tard au télescope Subaru, l’un des plus grands télescopes optiques du monde. Ici, on profite de l’univers tout en découvrant l’histoire de l’astronomie japonaise.',
    ],
    visitTitle: 'Visite',
    daysTitle: 'Jours d’ouverture',
    days: `Ouvert du ${weekday.fr[4]} au ${weekday.fr[1]}. Fermé tous les ${closedDays('fr')}, ainsi que le jour de l’An.`,
    hoursTitle: 'Horaires',
    hours: [
      ['Journée', dash(frTime(HOURS.day.start), frTime(HOURS.day.end)), 'Visite des installations. Par beau temps, quand le Soleil est haut, il est parfois possible d’observer le Soleil.'],
      ['Soirée', `${dash(frTime(HOURS.night.start), frTime(HOURS.night.end))} (à partir de ${frTime(HOURS.night.summerStart)} en été)`, 'Le personnel oriente le télescope et vous observez. Ce que l’on voit dépend de la saison, de la Lune et des nuages.'],
    ],
    hoursNote: 'Les horaires peuvent changer.',
    feesTitle: 'Tarifs',
    feesHead: ['', 'Adultes', 'Enfants'],
    fees: [
      ['Observation du soir', yenFr(FEES.adult), yenFr(FEES.nightStudent)],
      ['Musée des sciences « Étoiles et Forêt »', yenFr(FEES.adult), `${yenFr(FEES.museumStudent)} (jusqu’au lycée)`],
    ],
    feesNote: 'Les tarifs ne changent pas. Le musée des sciences est gratuit pour les résidents de Tsuwano.',
    howTitle: 'Comment venir',
    how: [
      'Aucune réservation n’est nécessaire (les réservations ne sont pas acceptées). Venez simplement le jour même.',
      'L’accueil se fait au centre d’archives astronomiques « Polan no Hiroba ». Les billets du musée des sciences y sont aussi vendus.',
      'Selon la météo, l’observation du soir peut être impossible.',
    ],
    tipsTitle: 'Conseils',
    tips: [
      'Il fait plus froid sur la montagne qu’en ville. Pensez à apporter une veste.',
      'Pendant l’observation, limitez la lumière des lampes et des écrans de téléphone. Vous pouvez utiliser le mode nuit rouge de ce site.',
    ],
    telescopeTitle: 'Le télescope de 75 cm',
    specs: [
      ['Type', 'Télescope à réflexion altazimutal (foyer Nasmyth)'],
      ['Diamètre', '75 cm'],
      ['Focale', 'environ 9 m (f/12)'],
      ['Monture', 'Monture altazimutale pilotée par ordinateur'],
      ['Fabricant', 'Norizuki Giken (Yaizu, Shizuoka), 1985'],
    ],
    telescope: [
      'Dans les années 1980, les astronomes japonais cherchaient à alléger de très grands miroirs, avec pour objectif l’un des plus grands télescopes du monde (le futur Subaru). Le 75 cm de Nichihara a été construit comme cas d’essai de ce projet. Subaru a finalement choisi un autre type de miroir mince, mais ce télescope témoigne encore de cette époque de défis.',
      'Avec le foyer Nasmyth, la lumière est renvoyée sur le côté et l’on observe depuis le flanc du télescope. L’oculaire reste presque à la même hauteur quelle que soit la direction visée : enfants et débutants observent confortablement.',
    ],
    facilitiesTitle: 'Sur le mont Makurase',
    facilities: [
      ['Centre d’archives astronomiques « Polan no Hiroba »', 'Ouvert en 1989. Accueil de l’observatoire et du musée des sciences. Projections vidéo gratuites.'],
      ['Musée des sciences « Étoiles et Forêt »', 'Ouvert en 1994. Un musée consacré à l’espace et à l’environnement terrestre, avec un pendule de Foucault et des expositions sur les phases de la Lune et les planètes.'],
    ],
    stayTitle: 'Séjourner',
    stay: 'Le gîte « SORABE » (location de la maison entière) se trouve sur la même montagne. Tarifs et réservations sur le site de SORABE. L’hébergement est distinct de l’entrée de l’observatoire.',
    stayLink: 'Site de SORABE (en japonais)',
    camp: 'Le camping du mont Makurase est également à proximité (du printemps à l’automne).',
    accessTitle: 'Accès',
    address: '806-1 Makurase, Tsuwano-cho, Kanoashi-gun, Shimane, Japon',
    accessTrain: 'En train : ligne JR Yamaguchi jusqu’à la gare de Nichihara, puis en taxi.',
    accessCar: 'En voiture : depuis la gare de Nichihara, direction camping du mont Makurase. Parking près du sommet. Route de montagne : soyez prudent, surtout la nuit.',
    mapLink: 'Ouvrir dans Google Maps',
    contactTitle: 'Contact',
    tel: 'Téléphone',
    japaneseOnly: 'Les actualités, les événements et les autres pages de ce site sont en japonais.',
    toJapanese: 'Site en japonais',
    footerNav: 'Menu du pied de page',
  },
} as const;
