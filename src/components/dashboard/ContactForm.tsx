'use client'

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { contactSchema, type ContactFormData } from '@/lib/schemas/contact';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import type { Contact } from '@/lib/database.types';

interface ContactFormProps {
  contact?: Contact | null;
  onClose: () => void;
}

export function ContactForm({ contact, onClose }: ContactFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!contact;

  const [formData, setFormData] = useState<ContactFormData>({
    type: contact?.type ?? 'client',
    name: contact?.name ?? '',
    phone: contact?.phone ?? null,
    email: contact?.email ?? null,
    address: contact?.address ?? null,
    birthday: contact?.birthday ?? null,
    budget: contact?.budget ?? null,
    bedrooms_min: contact?.bedrooms_min ?? null,
    bathrooms_min: contact?.bathrooms_min ?? null,
    preferred_zipcodes: contact?.preferred_zipcodes ?? [],
    search_radius_miles: contact?.search_radius_miles ?? null,
    notes: contact?.notes ?? null,
    assigned_to: contact?.assigned_to ?? null,
    company: contact?.company ?? null,
    interest_flags: contact?.interest_flags ?? 0,
    design_services: contact?.design_services ?? [],
    property_zipcode: contact?.property_zipcode ?? null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      if (isEditing) {
        const { error } = await supabase
          .from('contacts')
          .update(data)
          .eq('id', contact!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('contacts').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onClose();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    mutation.mutate(result.data);
  }

  function handleChange(field: string, value: string | null) {
    setFormData((prev) => ({ ...prev, [field]: value || null }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {mutation.error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {(mutation.error as Error).message}
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="client">Client</option>
              <option value="lead">Lead</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          {/* Name */}
          <FormField
            label="Name *"
            value={formData.name}
            onChange={(v) => handleChange('name', v)}
            error={errors.name}
            required
          />

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Phone"
              value={formData.phone ?? ''}
              onChange={(v) => handleChange('phone', v)}
              error={errors.phone}
              type="tel"
            />
            <FormField
              label="Email"
              value={formData.email ?? ''}
              onChange={(v) => handleChange('email', v)}
              error={errors.email}
              type="email"
            />
          </div>
          {errors.phone && !formData.phone && !formData.email && (
            <p className="text-red-400 text-xs -mt-2">{errors.phone}</p>
          )}

          {/* Address */}
          <FormField
            label="Address"
            value={formData.address ?? ''}
            onChange={(v) => handleChange('address', v)}
          />

          {/* Company & Birthday */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Company"
              value={formData.company ?? ''}
              onChange={(v) => handleChange('company', v)}
            />
            <FormField
              label="Birthday"
              value={formData.birthday ?? ''}
              onChange={(v) => handleChange('birthday', v)}
              type="date"
            />
          </div>

          {/* Preferences section (collapsible for leads/clients) */}
          {formData.type !== 'partner' && (
            <>
              <div className="border-t border-neutral-800 pt-4 mt-4">
                <h3 className="text-sm font-medium text-neutral-400 mb-3">
                  Property Preferences (optional)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  label="Budget ($)"
                  value={formData.budget?.toString() ?? ''}
                  onChange={(v) => handleChange('budget', v)}
                  type="number"
                />
                <FormField
                  label="Min Beds"
                  value={formData.bedrooms_min?.toString() ?? ''}
                  onChange={(v) => handleChange('bedrooms_min', v)}
                  type="number"
                />
                <FormField
                  label="Min Baths"
                  value={formData.bathrooms_min?.toString() ?? ''}
                  onChange={(v) => handleChange('bathrooms_min', v)}
                  type="number"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Preferred Zipcodes (comma-separated)"
                  value={formData.preferred_zipcodes?.join(', ') ?? ''}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferred_zipcodes: v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [],
                    }))
                  }
                />
                <FormField
                  label="Search Radius (miles)"
                  value={formData.search_radius_miles?.toString() ?? ''}
                  onChange={(v) => handleChange('search_radius_miles', v)}
                  type="number"
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Notes</label>
            <textarea
              value={formData.notes ?? ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
