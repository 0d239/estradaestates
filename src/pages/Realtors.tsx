import { Phone, Mail, Award, MapPin } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { agents, companyInfo } from '../data/agents';

export function Realtors() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="container-narrow text-center mb-16">
        <Badge className="mb-4">Hollister, CA Real Estate</Badge>
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to {companyInfo.name}
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
          Expert knowledge and 30+ years helping you achieve your real estate goals.
        </p>
      </section>

      {/* Agent Cards */}
      <section className="container-narrow mb-16 space-y-8">
        {agents.map((agent) => (
          <Card key={agent.id} className="overflow-hidden">
            <div className="grid md:grid-cols-3 gap-0">
              <div className="aspect-square md:aspect-auto">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-2">
                <CardContent className="p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
                      <p className="text-primary-400 font-medium">{agent.title}</p>
                      <p className="text-sm text-neutral-400 mt-1">{agent.license}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${agent.phone}`}>
                        <Button variant="primary" size="sm">
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                      </a>
                      <a href={`mailto:${agent.email}`}>
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      </a>
                    </div>
                  </div>

                  <p className="text-neutral-400 mb-6 leading-relaxed">{agent.bio}</p>

                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary-400" />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {agent.specialties.map((specialty) => (
                        <Badge key={specialty} variant="default">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Office Info */}
      <section className="container-narrow">
        <Card>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Our Office</h2>
                <div className="space-y-4 text-neutral-400">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">{companyInfo.name}</p>
                      <p>{companyInfo.address}</p>
                      <p>{companyInfo.city}, {companyInfo.state} {companyInfo.zip}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary-400" />
                    <div>
                      <p>Office: {companyInfo.phone}</p>
                      <p>Fax: {companyInfo.fax}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary-400" />
                    <a href={`mailto:${companyInfo.email}`} className="hover:text-primary-400 transition-colors">
                      {companyInfo.email}
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Why Choose Us</h2>
                <ul className="space-y-3 text-neutral-400">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2"></span>
                    <span>Deep local expertise in Hollister and San Benito County</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2"></span>
                    <span>Personalized service tailored to your unique needs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2"></span>
                    <span>Latest technology for virtual tours and market analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2"></span>
                    <span>Access to multiple MLS systems for broader reach</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
