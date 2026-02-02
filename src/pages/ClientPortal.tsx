import { useState } from 'react';
import { User, DollarSign, Bed, Bath, MapPin, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface ClientPreferences {
  name: string;
  budget: string;
  bedrooms: string;
  bathrooms: string;
  zipcode: string;
  radius: string;
}

export function ClientPortal() {
  const [formData, setFormData] = useState<ClientPreferences>({
    name: '',
    budget: '',
    bedrooms: '',
    bathrooms: '',
    zipcode: '',
    radius: '',
  });

  const [submittedPreferences, setSubmittedPreferences] = useState<ClientPreferences | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedPreferences(formData);
  };

  return (
    <div className="py-12">
      <section className="container-narrow">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Client Portal</h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Tell us about your dream home and we'll help you find the perfect match.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Your Preferences</h2>
              <p className="text-sm text-neutral-400 mt-1">
                Fill out the form below to share your home search criteria
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-1">
                    <User className="w-4 h-4" />
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Maximum budget"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-1">
                      <Bed className="w-4 h-4" />
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      placeholder="Min bedrooms"
                      min="0"
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-1">
                      <Bath className="w-4 h-4" />
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      placeholder="Min bathrooms"
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-1">
                      <MapPin className="w-4 h-4" />
                      Zipcode
                    </label>
                    <input
                      type="text"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleChange}
                      placeholder="Preferred zipcode"
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-1">
                      <Navigation className="w-4 h-4" />
                      Radius (miles)
                    </label>
                    <input
                      type="number"
                      name="radius"
                      value={formData.radius}
                      onChange={handleChange}
                      placeholder="Search radius"
                      min="1"
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full">
                  Submit Preferences
                </Button>
              </form>
            </CardContent>
          </Card>

          {submittedPreferences && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Submitted Preferences</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Here's a summary of what you're looking for
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-neutral-700/50 rounded-lg">
                    <p className="text-xs text-neutral-400">Name</p>
                    <p className="text-white font-medium">{submittedPreferences.name}</p>
                  </div>
                  <div className="p-3 bg-neutral-700/50 rounded-lg">
                    <p className="text-xs text-neutral-400">Budget</p>
                    <p className="text-white font-medium">
                      ${parseInt(submittedPreferences.budget).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-700/50 rounded-lg">
                    <p className="text-xs text-neutral-400">Bedrooms</p>
                    <p className="text-white font-medium">{submittedPreferences.bedrooms}+</p>
                  </div>
                  <div className="p-3 bg-neutral-700/50 rounded-lg">
                    <p className="text-xs text-neutral-400">Bathrooms</p>
                    <p className="text-white font-medium">{submittedPreferences.bathrooms}+</p>
                  </div>
                  <div className="p-3 bg-neutral-700/50 rounded-lg">
                    <p className="text-xs text-neutral-400">Zipcode</p>
                    <p className="text-white font-medium">{submittedPreferences.zipcode}</p>
                  </div>
                  <div className="p-3 bg-neutral-700/50 rounded-lg">
                    <p className="text-xs text-neutral-400">Radius</p>
                    <p className="text-white font-medium">{submittedPreferences.radius} miles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
