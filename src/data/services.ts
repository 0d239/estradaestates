import {
  Home,
  TrendingUp,
  DollarSign,
  BarChart3,
  Search,
  FileText,
  type LucideIcon,
} from 'lucide-react';

export interface RealtyService {
  title: string;
  description: string;
  icon: LucideIcon;
  details: string[];
}

export interface DesignServiceCategory {
  title: string;
  description: string;
  image: string;
  services: { name: string; description: string }[];
}

export const realtyServices: RealtyService[] = [
  {
    title: 'Buying',
    description: 'Full-service guidance from search to close.',
    icon: Home,
    details: [
      'Personalized home search and property tours',
      'Offer strategy and negotiation',
      'Inspection and appraisal coordination',
      'Closing support and move-in preparation',
    ],
  },
  {
    title: 'Selling',
    description: 'Strategic pricing and marketing to maximize your return.',
    icon: TrendingUp,
    details: [
      'Comparative Market Analysis (CMA)',
      'Professional photography and virtual tours',
      'MLS listing across Bay Area, Sacramento, and Fresno networks',
      'Offer review and closing coordination',
    ],
  },
  {
    title: 'Loans',
    description: 'Financing options through trusted lending partners.',
    icon: DollarSign,
    details: [
      'Mortgage pre-approval assistance',
      'United Wholesale Mortgage (UWM) partnership',
      'First-time homebuyer programs',
      'Refinancing guidance',
    ],
  },
  {
    title: 'Market Analysis',
    description: 'Data-driven insights for informed decisions.',
    icon: BarChart3,
    details: [
      'Neighborhood and school district reports',
      'Investment property analysis',
      'Current market trends and pricing data',
      'Comparable sales research',
    ],
  },
  {
    title: 'Property Search',
    description: 'Access to listings across multiple MLS networks.',
    icon: Search,
    details: [
      'MLSListings (Bay Area)',
      'MetroList (Sacramento)',
      'Fresno MLS',
      'Custom search alerts and notifications',
    ],
  },
  {
    title: 'Transaction Management',
    description: 'Seamless coordination from contract to keys.',
    icon: FileText,
    details: [
      'Escrow and title coordination',
      'Document preparation and review',
      'Timeline management and deadline tracking',
      'Post-close support',
    ],
  },
];

export const designServices: DesignServiceCategory[] = [
  {
    title: 'Pre-Purchase',
    description: 'Strategic design insight before you close.',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Pre-Purchase&font=Inter',
    services: [
      {
        name: 'Pre-Purchase Design Assessment',
        description: 'Identify value-add opportunities, renovation potential, and design risks before closing.',
      },
      {
        name: 'High-Level Concept Visioning',
        description: 'Quick, strategic ideas to reimagine the asset and unlock upside.',
      },
      {
        name: 'Budget & Scope Alignment',
        description: 'Early insight into renovation costs and phased improvement strategies.',
      },
      {
        name: 'Market Positioning Guidance',
        description: 'Align design direction with comps, target demographic, and neighborhood expectations.',
      },
    ],
  },
  {
    title: 'New Construction',
    description: 'Full-service design from concept to completion.',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=New+Construction&font=Inter',
    services: [
      {
        name: 'Concept to Completion Design Leadership',
        description: 'Full-service interior design from initial vision through final installation.',
      },
      {
        name: 'Finish & Material Selections',
        description: 'Cohesive palettes that elevate the asset while meeting durability and budget goals.',
      },
      {
        name: 'Plan Review & Value Engineering',
        description: 'Collaborate with architects and consultants to optimize layouts and reduce costly missteps.',
      },
      {
        name: '3D Renderings & Visualizations',
        description: 'Bring the project to life for stakeholders, marketing, and leasing.',
      },
      {
        name: 'Construction Documents & Coordination',
        description: 'Detailed drawing sets and ongoing support through construction.',
      },
    ],
  },
  {
    title: 'Rehab / Value-Add Renovations',
    description: 'Upgrades that drive the highest ROI.',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Rehab+%2F+Value-Add&font=Inter',
    services: [
      {
        name: 'Strategic Renovation Planning',
        description: 'Prioritize upgrades that drive the highest ROI — not just aesthetics.',
      },
      {
        name: 'FF&E & Finish Upgrades',
        description: 'Thoughtful selections that modernize and reposition the property.',
      },
      {
        name: 'Phased Implementation Strategy',
        description: 'Maximize impact while minimizing downtime and disruption.',
      },
      {
        name: 'On-Site Design Oversight',
        description: 'Ensure execution aligns with vision, budget, and timeline.',
      },
      {
        name: 'Demographic-Driven Design',
        description: 'Tailor the look and feel to attract the ideal renter or buyer.',
      },
    ],
  },
  {
    title: 'Selling / Lease-Up',
    description: 'Design that sells and leases faster.',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Selling+%2F+Lease-Up&font=Inter',
    services: [
      {
        name: 'Model Units & Amenity Styling',
        description: 'Design spaces that emotionally connect and lease or sell faster.',
      },
      {
        name: 'Staging for Maximum Value',
        description: 'Elevated, strategic staging to increase perceived value and pricing power.',
      },
      {
        name: 'Marketing-Ready Presentation',
        description: 'Styling for professional photography, social, and listing platforms.',
      },
      {
        name: 'Buyer Experience Enhancement',
        description: 'Create memorable spaces that convert interest into offers.',
      },
      {
        name: 'Top-Dollar Positioning',
        description: 'Design that differentiates your property in a competitive market.',
      },
    ],
  },
];
