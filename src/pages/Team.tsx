import { useEffect, useRef, useState, useCallback } from 'react';
import { Phone, Mail, Award, MapPin } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { team, metrics, companyInfo } from '../data/agents';

function parseMetricValue(value: string) {
  const prefix = value.match(/^[^0-9]*/)?.[0] ?? '';
  const suffix = value.match(/[^0-9,]*$/)?.[0] ?? '';
  const numStr = value.slice(prefix.length, value.length - (suffix.length || 0));
  const num = parseInt(numStr.replace(/,/g, ''), 10);
  const hasCommas = numStr.includes(',');
  return { prefix, suffix, num, hasCommas };
}

function formatNumber(n: number, hasCommas: boolean) {
  return hasCommas ? n.toLocaleString() : String(n);
}

function AnimatedMetric({ value, label }: { value: string; label: string }) {
  const { prefix, suffix, num, hasCommas } = parseMetricValue(value);
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(eased * num);
      setDisplay(`${prefix}${formatNumber(current, hasCommas)}${suffix}`);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [prefix, suffix, num, hasCommas]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) animate(); },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div ref={ref}>
      <p className="text-3xl font-bold text-primary-400">{display}</p>
      <p className="text-sm text-neutral-400 mt-1">{label}</p>
    </div>
  );
}

export function Team() {
  return (
    <div className="py-12">
      {/* Metric Story Hero */}
      <section className="container-narrow text-center mb-16">
        <Badge className="mb-4">Hollister, CA Real Estate</Badge>
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to {companyInfo.name}
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
          Expert knowledge and decades of experience helping you achieve your real estate goals.
        </p>
        <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
          {metrics.map((metric) => (
            <AnimatedMetric key={metric.label} value={metric.value} label={metric.label} />
          ))}
        </div>
      </section>

      {/* Team Cards */}
      <section className="container-narrow mb-16 space-y-8">
        {team.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <div className="grid md:grid-cols-3 gap-0">
              <div className="aspect-square md:aspect-auto">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-2">
                <CardContent className="p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{member.name}</h2>
                      <p className="text-primary-400 font-medium">{member.title}</p>
                      {member.license && (
                        <p className="text-sm text-neutral-400 mt-1">{member.license}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {member.phone && (
                        <a href={`tel:${member.phone}`}>
                          <Button variant="primary" size="sm">
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`}>
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-neutral-400 mb-6 leading-relaxed">{member.bio}</p>

                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary-400" />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty) => (
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
                    <span>Full-service real estate and interior design under one roof</span>
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
