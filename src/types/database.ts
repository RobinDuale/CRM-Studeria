// Hand-written types matching the schema in supabase/migrations/
// Replace with generated types via: npx supabase gen types typescript --linked > src/types/database.ts

export type DealStage =
  | "prospect"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: "admin" | "user";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      contacts: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          address: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contacts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          unit_price: number;
          unit: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      deals: {
        Row: {
          id: string;
          title: string;
          contact_id: string | null;
          owner_id: string | null;
          stage: DealStage;
          amount: number;
          expected_close_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["deals"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["deals"]["Insert"]>;
      };
      deal_products: {
        Row: {
          id: string;
          deal_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          discount: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["deal_products"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["deal_products"]["Insert"]>;
      };
      quotes: {
        Row: {
          id: string;
          quote_number: string;
          deal_id: string;
          status: QuoteStatus;
          valid_until: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quotes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["quotes"]["Insert"]>;
      };
      quote_lines: {
        Row: {
          id: string;
          quote_id: string;
          product_id: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          discount: number;
          total: number;
          position: number;
        };
        Insert: Omit<Database["public"]["Tables"]["quote_lines"]["Row"], "id" | "total">;
        Update: Partial<Database["public"]["Tables"]["quote_lines"]["Insert"]>;
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          deal_id: string | null;
          quote_id: string | null;
          status: InvoiceStatus;
          issue_date: string;
          due_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["invoices"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      invoice_lines: {
        Row: {
          id: string;
          invoice_id: string;
          product_id: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          discount: number;
          tax_rate: number;
          total: number;
          position: number;
        };
        Insert: Omit<Database["public"]["Tables"]["invoice_lines"]["Row"], "id" | "total">;
        Update: Partial<Database["public"]["Tables"]["invoice_lines"]["Insert"]>;
      };
    };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Deal = Database["public"]["Tables"]["deals"]["Row"];
export type DealProduct = Database["public"]["Tables"]["deal_products"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
export type QuoteLine = Database["public"]["Tables"]["quote_lines"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceLine = Database["public"]["Tables"]["invoice_lines"]["Row"];
