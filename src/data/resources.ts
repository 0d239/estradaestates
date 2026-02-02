export interface FAQ {
  question: string;
  answer: string;
}

export interface Resource {
  title: string;
  description: string;
  url?: string;
}

export const buyerFAQs: FAQ[] = [
  {
    question: 'How do I know how much house I can afford?',
    answer: 'A general rule is that your monthly mortgage payment should not exceed 28-31% of your gross monthly income. We recommend getting pre-approved by a lender before starting your home search to know your exact budget.',
  },
  {
    question: 'What is the home buying process?',
    answer: 'The typical process includes: 1) Getting pre-approved for a mortgage, 2) Finding the right home with your agent, 3) Making an offer, 4) Home inspection and appraisal, 5) Final loan approval, 6) Closing and getting your keys.',
  },
  {
    question: 'How much do I need for a down payment?',
    answer: 'Down payments can range from 3% to 20% depending on the loan type. FHA loans require as little as 3.5%, while conventional loans typically require 5-20%. VA and USDA loans may offer zero down payment options for qualified buyers.',
  },
  {
    question: 'What are closing costs?',
    answer: 'Closing costs typically range from 2-5% of the purchase price and include fees for the loan origination, appraisal, title insurance, escrow, and recording. Your lender will provide a detailed estimate.',
  },
  {
    question: 'Should I get a home inspection?',
    answer: 'Absolutely. A professional home inspection is crucial to identify potential issues before purchase. It typically costs $300-500 and can save you thousands by uncovering hidden problems.',
  },
];

export const sellerFAQs: FAQ[] = [
  {
    question: 'How do I determine the right listing price?',
    answer: 'We conduct a comprehensive Comparative Market Analysis (CMA) that examines recent sales of similar homes in your area, current market conditions, and your home\'s unique features to recommend an optimal listing price.',
  },
  {
    question: 'How long will it take to sell my home?',
    answer: 'Market conditions vary, but in the current Hollister market, well-priced homes typically sell within 30-60 days. Factors include pricing, condition, location, and marketing strategy.',
  },
  {
    question: 'What repairs should I make before selling?',
    answer: 'Focus on repairs that offer the best return: fresh paint, fixing obvious issues, landscaping, and deep cleaning. We can advise on which improvements will maximize your sale price without over-investing.',
  },
  {
    question: 'What are the costs of selling a home?',
    answer: 'Typical seller costs include agent commissions (typically 5-6%), title insurance, escrow fees, transfer taxes, and any agreed-upon repairs. Your net proceeds estimate will detail all expected costs.',
  },
  {
    question: 'Should I stage my home?',
    answer: 'Staged homes often sell faster and for higher prices. We can recommend professional staging services or provide tips for DIY staging to make your home show its best.',
  },
];

export const buyerResources: Resource[] = [
  {
    title: 'Mortgage Pre-Approval',
    description: 'Get pre-approved to understand your buying power and strengthen your offers.',
  },
  {
    title: 'First-Time Homebuyer Programs',
    description: 'California offers various programs for first-time buyers including down payment assistance.',
  },
  {
    title: 'Home Search Alerts',
    description: 'Receive instant notifications when new listings match your criteria.',
  },
  {
    title: 'Neighborhood Information',
    description: 'Learn about schools, amenities, and community features in Hollister and surrounding areas.',
  },
  {
    title: 'Mortgage Calculator',
    description: 'Estimate your monthly payments based on price, down payment, and interest rates.',
  },
];

export const sellerResources: Resource[] = [
  {
    title: 'Free Home Valuation',
    description: 'Discover what your home is worth in today\'s market with our complimentary evaluation.',
  },
  {
    title: 'Market Reports',
    description: 'Stay informed with current market trends and statistics for San Benito County.',
  },
  {
    title: 'Home Preparation Guide',
    description: 'Step-by-step checklist to prepare your home for a successful sale.',
  },
  {
    title: 'Virtual Tour Services',
    description: 'Showcase your home with professional photography and virtual tour technology.',
  },
  {
    title: 'Relocation Assistance',
    description: 'Full-service support for sellers moving to a new area.',
  },
];

export const generalFAQs: FAQ[] = [
  {
    question: 'What areas does Estrada Estates Realty Group serve?',
    answer: 'We primarily serve Hollister, San Juan Bautista, and the greater San Benito County area. We also have MLS access to the Bay Area, Sacramento region, and Fresno area for clients with broader needs.',
  },
  {
    question: 'How do I get started?',
    answer: 'Simply give us a call at (408) 804-1511 or send an email to EstradaSold@MyHillTopRealty.com. We offer free consultations with no obligation to discuss your real estate goals.',
  },
  {
    question: 'What makes Estrada Estates Realty Group different?',
    answer: 'We combine deep local expertise with personalized service. As a boutique brokerage, we provide dedicated attention to each client, leveraging the latest technology while maintaining the personal touch that large firms often lack.',
  },
];
