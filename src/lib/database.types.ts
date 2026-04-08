export type ContactType = 'client' | 'lead' | 'partner';
export type ContactStatus = 'active' | 'inactive';
/** @deprecated Use interest_flags bitmap instead: 1=buying, 2=selling, 4=design */
export type LeadInterest = 'buying' | 'selling' | 'both';
export type ListingStatus = 'active' | 'pending' | 'sold' | 'off_market';
export type ListingSource = 'idx' | 'manual';
export type InterestLevel = 'interested' | 'shown' | 'offered' | 'closed';
export type CommunicationChannel = 'sms' | 'email';
export type CommunicationRecipientStatus = 'sent' | 'delivered' | 'failed';
export type TeamRole = 'admin' | 'agent' | 'staff';

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: {
      get_email_by_username: {
        Args: { lookup_username: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          name: string;
          title: string | null;
          license: string | null;
          phone: string | null;
          email: string;
          image_url: string | null;
          bio: string | null;
          specialties: string[];
          role: TeamRole;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          name: string;
          title?: string | null;
          license?: string | null;
          phone?: string | null;
          email: string;
          image_url?: string | null;
          bio?: string | null;
          specialties?: string[];
          role: TeamRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          name?: string;
          title?: string | null;
          license?: string | null;
          phone?: string | null;
          email?: string;
          image_url?: string | null;
          bio?: string | null;
          specialties?: string[];
          role?: TeamRole;
          created_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          type: ContactType;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          birthday: string | null;
          budget: number | null;
          bedrooms_min: number | null;
          bathrooms_min: number | null;
          preferred_zipcodes: string[];
          search_radius_miles: number | null;
          notes: string | null;
          assigned_to: string | null;
          company: string | null;
          interest_flags: number;
          design_services: string[];
          property_zipcode: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: ContactType;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          birthday?: string | null;
          budget?: number | null;
          bedrooms_min?: number | null;
          bathrooms_min?: number | null;
          preferred_zipcodes?: string[];
          search_radius_miles?: number | null;
          notes?: string | null;
          assigned_to?: string | null;
          company?: string | null;
          interest_flags?: number;
          design_services?: string[];
          property_zipcode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: ContactType;
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          birthday?: string | null;
          budget?: number | null;
          bedrooms_min?: number | null;
          bathrooms_min?: number | null;
          preferred_zipcodes?: string[];
          search_radius_miles?: number | null;
          notes?: string | null;
          assigned_to?: string | null;
          company?: string | null;
          interest_flags?: number;
          design_services?: string[];
          property_zipcode?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          address: string;
          city: string | null;
          state: string;
          zip: string | null;
          price: number | null;
          status: ListingStatus;
          bedrooms: number | null;
          bathrooms: number | null;
          sqft: number | null;
          lot_size: string | null;
          year_built: number | null;
          description: string | null;
          photos: string[];
          mls_number: string | null;
          listed_by: string | null;
          source: ListingSource;
          idx_key: string | null;
          idx_synced_at: string | null;
          idx_removed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          address: string;
          city?: string | null;
          state?: string;
          zip?: string | null;
          price?: number | null;
          status: ListingStatus;
          bedrooms?: number | null;
          bathrooms?: number | null;
          sqft?: number | null;
          lot_size?: string | null;
          year_built?: number | null;
          description?: string | null;
          photos?: string[];
          mls_number?: string | null;
          listed_by?: string | null;
          source?: ListingSource;
          idx_key?: string | null;
          idx_synced_at?: string | null;
          idx_removed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          address?: string;
          city?: string | null;
          state?: string;
          zip?: string | null;
          price?: number | null;
          status?: ListingStatus;
          bedrooms?: number | null;
          bathrooms?: number | null;
          sqft?: number | null;
          lot_size?: string | null;
          year_built?: number | null;
          description?: string | null;
          photos?: string[];
          mls_number?: string | null;
          listed_by?: string | null;
          source?: ListingSource;
          idx_key?: string | null;
          idx_synced_at?: string | null;
          idx_removed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_listings: {
        Row: {
          contact_id: string;
          listing_id: string;
          interest_level: InterestLevel;
          created_at: string;
        };
        Insert: {
          contact_id: string;
          listing_id: string;
          interest_level: InterestLevel;
          created_at?: string;
        };
        Update: {
          contact_id?: string;
          listing_id?: string;
          interest_level?: InterestLevel;
        };
        Relationships: [];
      };
      communications: {
        Row: {
          id: string;
          sent_by: string;
          channel: CommunicationChannel;
          message: string;
          recipient_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sent_by: string;
          channel: CommunicationChannel;
          message: string;
          recipient_count: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sent_by?: string;
          channel?: CommunicationChannel;
          message?: string;
          recipient_count?: number;
        };
        Relationships: [];
      };
      communication_recipients: {
        Row: {
          communication_id: string;
          contact_id: string;
          status: CommunicationRecipientStatus;
        };
        Insert: {
          communication_id: string;
          contact_id: string;
          status?: CommunicationRecipientStatus;
        };
        Update: {
          status?: CommunicationRecipientStatus;
        };
        Relationships: [];
      };
};
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Listing = Database['public']['Tables']['listings']['Row'];
export type ContactListing = Database['public']['Tables']['contact_listings']['Row'];
export type Communication = Database['public']['Tables']['communications']['Row'];
export type CommunicationRecipient = Database['public']['Tables']['communication_recipients']['Row'];

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ListingInsert = Database['public']['Tables']['listings']['Insert'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];
export type ListingUpdate = Database['public']['Tables']['listings']['Update'];
