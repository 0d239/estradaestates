'use client'

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { listingSchema, type ListingFormData } from '@/lib/schemas/listing';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import type { Listing } from '@/lib/database.types';

interface ListingFormProps {
  listing?: Listing | null;
  onClose: () => void;
}

export function ListingForm({ listing, onClose }: ListingFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!listing;

  const [formData, setFormData] = useState<ListingFormData>({
    address: listing?.address ?? '',
    city: listing?.city ?? null,
    state: listing?.state ?? 'CA',
    zip: listing?.zip ?? null,
    price: listing?.price ?? null,
    status: listing?.status ?? 'active',
    bedrooms: listing?.bedrooms ?? null,
    bathrooms: listing?.bathrooms ?? null,
    sqft: listing?.sqft ?? null,
    lot_size: listing?.lot_size ?? null,
    year_built: listing?.year_built ?? null,
    description: listing?.description ?? null,
    photos: listing?.photos ?? [],
    mls_number: listing?.mls_number ?? null,
    listed_by: listing?.listed_by ?? null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      if (isEditing) {
        const { error } = await supabase
          .from('listings')
          .update(data)
          .eq('id', listing!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('listings').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      onClose();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = listingSchema.safeParse(formData);
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
            {isEditing ? 'Edit Listing' : 'Add Listing'}
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

          {/* Address */}
          <FormField
            label="Address *"
            value={formData.address}
            onChange={(v) => handleChange('address', v)}
            error={errors.address}
            required
          />

          {/* City, State, Zip */}
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="City"
              value={formData.city ?? ''}
              onChange={(v) => handleChange('city', v)}
            />
            <FormField
              label="State"
              value={formData.state ?? 'CA'}
              onChange={(v) => handleChange('state', v)}
            />
            <FormField
              label="ZIP"
              value={formData.zip ?? ''}
              onChange={(v) => handleChange('zip', v)}
            />
          </div>

          {/* Status & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="off_market">Off Market</option>
              </select>
            </div>
            <FormField
              label="Price ($)"
              value={formData.price?.toString() ?? ''}
              onChange={(v) => handleChange('price', v)}
              type="number"
            />
          </div>

          {/* Property details */}
          <div className="grid grid-cols-4 gap-4">
            <FormField
              label="Beds"
              value={formData.bedrooms?.toString() ?? ''}
              onChange={(v) => handleChange('bedrooms', v)}
              type="number"
            />
            <FormField
              label="Baths"
              value={formData.bathrooms?.toString() ?? ''}
              onChange={(v) => handleChange('bathrooms', v)}
              type="number"
            />
            <FormField
              label="Sqft"
              value={formData.sqft?.toString() ?? ''}
              onChange={(v) => handleChange('sqft', v)}
              type="number"
            />
            <FormField
              label="Year Built"
              value={formData.year_built?.toString() ?? ''}
              onChange={(v) => handleChange('year_built', v)}
              type="number"
            />
          </div>

          {/* Lot size & MLS */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Lot Size"
              value={formData.lot_size ?? ''}
              onChange={(v) => handleChange('lot_size', v)}
            />
            <FormField
              label="MLS Number"
              value={formData.mls_number ?? ''}
              onChange={(v) => handleChange('mls_number', v)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
            <textarea
              value={formData.description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Photos (URLs) */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Photo URLs (one per line)
            </label>
            <textarea
              value={formData.photos?.join('\n') ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  photos: e.target.value
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              rows={3}
              placeholder="https://example.com/photo1.jpg"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
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
