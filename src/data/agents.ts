export interface Agent {
  id: string;
  name: string;
  title: string;
  license: string;
  phone: string;
  email: string;
  image: string;
  bio: string;
  specialties: string[];
}

export const agents: Agent[] = [
  {
    id: 'henry-estrada',
    name: 'Enrique "Henry" Estrada',
    title: 'Owner/Broker, GRI',
    license: 'DRE# 01200315',
    phone: '(408) 804-1511',
    email: 'EstradaSold@MyHillTopRealty.com',
    image: 'https://global.acceleragent.com/usr/13705421761/1161817043.jpg',
    bio: 'Henry Estrada is your Hollister CA Real Estate Specialist, bringing expert knowledge and 30+ years of field experience to serve both buyers and sellers in the San Benito County area. With deep roots and commitment to the community, Henry has helped countless families find their perfect home.',
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
    license: 'DRE# 02100000',
    phone: '(408) 555-0123',
    email: 'Sophia@EstradaEstates.com',
    image: 'https://placehold.co/400x400/1a1a1a/666666?text=Sophia+Estrada',
    bio: 'Sophia Estrada brings fresh energy and modern marketing expertise to Estrada Estates Realty Group. With a passion for helping clients navigate the home buying and selling process, Sophia combines innovative technology with personalized service to deliver exceptional results.',
    specialties: [
      'Digital Marketing',
      'First-Time Homebuyers',
      'Luxury Properties',
      'Social Media Marketing',
      'Virtual Tours',
    ],
  },
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
