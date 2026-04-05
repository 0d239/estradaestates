export interface TeamMember {
  id: string;
  name: string;
  title: string;
  license?: string;
  phone: string;
  email: string;
  image: string;
  bio: string;
  specialties: string[];
  badges?: string[];
}

/** @deprecated Use TeamMember instead */
export type Agent = TeamMember;

export const team: TeamMember[] = [
  {
    id: 'henry-estrada',
    name: 'Enrique "Henry" Estrada',
    title: 'Owner/Broker, GRI',
    license: 'DRE# 01200315',
    phone: '(408) 804-1511',
    email: 'EstradaSold@MyHillTopRealty.com',
    image: 'https://global.acceleragent.com/usr/13705421761/1161817043.jpg',
    bio: 'For over 30 years, he’s been transforming lives through real estate, helping thousands achieve homeownership, often when others wouldn’t. Known for his honesty, resilience, and unwavering follow-through, he’s the guy who always picks up the phone. With deep roots in the community, fluency in Spanish, and a heart for helping those facing tough odds, he’s not just a top performer—he’s the trusted ally you want on your side.',
    specialties: [
      'Residential Sales',
      'First-Time Homebuyers',
      'Investment Properties',
      'Relocation Services',
      'Market Analysis',
    ],
  },
  {
    id: 'sophia-estrada',
    name: 'Sophia Estrada',
    title: 'Realtor',
    license: 'DRE# 02260287',
    phone: '(831) 524-7076',
    email: 'soldbysophiaestrada@gmail.com',
    image: 'https://placehold.co/400x400/1a1a1a/666666?text=Sophia+Estrada&font=Inter',
    bio: 'Sophia Estrada brings fresh energy and modern marketing expertise to Estrada Estates Realty Group. With a passion for helping clients navigate the home buying and selling process, Sophia combines innovative technology with personalized service to deliver exceptional results.',
    specialties: [
      'Digital Marketing',
      'First-Time Homebuyers',
      'Luxury Properties',
      'Social Media Marketing',
      'Virtual Tours',
    ],
  },
  {
    id: 'laura-velasco',
    name: 'Laura Velasco',
    title: 'Design + Property Value Strategist',
    phone: '',
    email: '',
    image: 'https://placehold.co/400x400/1a1a1a/666666?text=Laura+Velasco&font=Inter',
    bio: 'With over 15 years of industry experience, Laura founded Level Up Interiors in 2018. Laura graduated from The Art Institute of CA–San Diego with a BS in Interior Design and served in the Army National Guard for 7 years as an Operations Specialist in the 670th MP Company. She started her career in model home merchandising at an award-winning design firm where she quickly mastered impactful and smart design to sell out communities. Laura has partnered with developers, property management groups, and asset managers, priding herself in customer service and long-lasting relationships.',
    specialties: [
      'Commercial Interior Design',
      'Model Home Merchandising',
      'Property Value Strategy',
      'Renovation Planning',
      'Staging & Styling',
    ],
  },
];

export const metrics = [
  { label: 'Years of Service', value: '30+' },
  { label: 'Clients Helped', value: '8,000+' },
  { label: 'Sales Volume', value: '$450M+' },
];

export const companyInfo = {
  name: 'Estrada Estates Realty Group',
  tagline: 'Your Trusted Partner in San Benito County Real Estate',
  address: '330 Tres Pinos Rd, Suite F8-3',
  city: 'Hollister',
  state: 'CA',
  zip: '95023',
  phone: '(831) 637-1055',
  fax: '(831) 637-1355',
  email: 'EstradaSold@MyHillTopRealty.com',
  social: {
    instagram: 'https://instagram.com/enriquehenryestrada',
    facebook: 'https://facebook.com/EnriqueEstradaCA',
  },
  mlsAffiliations: ['MLSListings (Bay Area)', 'MetroList (Sacramento)', 'Fresno MLS'],
};
