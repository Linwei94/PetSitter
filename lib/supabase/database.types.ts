export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          wechat_id: string | null
          city: string | null
          district: string | null
          bio: string | null
          is_sitter: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          wechat_id?: string | null
          city?: string | null
          district?: string | null
          bio?: string | null
          is_sitter?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          wechat_id?: string | null
          city?: string | null
          district?: string | null
          bio?: string | null
          is_sitter?: boolean
          is_verified?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      sitters: {
        Row: {
          id: string
          user_id: string
          title: string | null
          description: string | null
          years_experience: number
          home_type: string | null
          home_size: string | null
          has_outdoor_space: boolean
          has_children: boolean
          has_own_pets: boolean
          own_pets_description: string | null
          max_cats: number
          accepts_kittens: boolean
          accepts_senior_cats: boolean
          accepts_special_needs: boolean
          emergency_contact: string | null
          certificate_url: string | null
          id_verified: boolean
          background_checked: boolean
          rating: number
          review_count: number
          response_rate: number
          response_time_hours: number
          completed_bookings: number
          city: string | null
          district: string | null
          address_detail: string | null
          latitude: number | null
          longitude: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          description?: string | null
          years_experience?: number
          home_type?: string | null
          home_size?: string | null
          has_outdoor_space?: boolean
          has_children?: boolean
          has_own_pets?: boolean
          own_pets_description?: string | null
          max_cats?: number
          accepts_kittens?: boolean
          accepts_senior_cats?: boolean
          accepts_special_needs?: boolean
          emergency_contact?: string | null
          certificate_url?: string | null
          id_verified?: boolean
          background_checked?: boolean
          city?: string | null
          district?: string | null
          address_detail?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
        }
        Update: {
          title?: string | null
          description?: string | null
          years_experience?: number
          home_type?: string | null
          home_size?: string | null
          has_outdoor_space?: boolean
          has_children?: boolean
          has_own_pets?: boolean
          own_pets_description?: string | null
          max_cats?: number
          accepts_kittens?: boolean
          accepts_senior_cats?: boolean
          accepts_special_needs?: boolean
          emergency_contact?: string | null
          city?: string | null
          district?: string | null
          address_detail?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      sitter_services: {
        Row: {
          id: string
          sitter_id: string
          service_type: string
          is_active: boolean
          price_per_night: number | null
          price_per_visit: number | null
          additional_cat_price: number
          min_nights: number
          max_nights: number
          visits_per_day: number
          visit_duration_mins: number
          included_services: string[] | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sitter_id: string
          service_type: string
          is_active?: boolean
          price_per_night?: number | null
          price_per_visit?: number | null
          additional_cat_price?: number
          min_nights?: number
          max_nights?: number
          visits_per_day?: number
          visit_duration_mins?: number
          included_services?: string[] | null
          notes?: string | null
        }
        Update: {
          is_active?: boolean
          price_per_night?: number | null
          price_per_visit?: number | null
          additional_cat_price?: number
          min_nights?: number
          max_nights?: number
          visits_per_day?: number
          visit_duration_mins?: number
          included_services?: string[] | null
          notes?: string | null
        }
        Relationships: []
      }
      sitter_photos: {
        Row: {
          id: string
          sitter_id: string
          url: string
          caption: string | null
          is_cover: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          sitter_id: string
          url: string
          caption?: string | null
          is_cover?: boolean
          sort_order?: number
        }
        Update: {
          url?: string
          caption?: string | null
          is_cover?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      sitter_availability: {
        Row: {
          id: string
          sitter_id: string
          date: string
          is_available: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          sitter_id: string
          date: string
          is_available?: boolean
          notes?: string | null
        }
        Update: {
          is_available?: boolean
          notes?: string | null
        }
        Relationships: []
      }
      pets: {
        Row: {
          id: string
          owner_id: string
          name: string
          type: string
          breed: string | null
          age_years: number
          age_months: number
          weight_kg: number | null
          gender: string | null
          is_neutered: boolean
          is_vaccinated: boolean
          vaccination_date: string | null
          microchip_number: string | null
          medical_conditions: string | null
          medications: string | null
          dietary_restrictions: string | null
          feeding_schedule: string | null
          litter_box_notes: string | null
          behavior_notes: string | null
          photo_url: string | null
          emergency_vet: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          type?: string
          breed?: string | null
          age_years?: number
          age_months?: number
          weight_kg?: number | null
          gender?: string | null
          is_neutered?: boolean
          is_vaccinated?: boolean
          vaccination_date?: string | null
          microchip_number?: string | null
          medical_conditions?: string | null
          medications?: string | null
          dietary_restrictions?: string | null
          feeding_schedule?: string | null
          litter_box_notes?: string | null
          behavior_notes?: string | null
          photo_url?: string | null
          emergency_vet?: string | null
        }
        Update: {
          name?: string
          breed?: string | null
          age_years?: number
          age_months?: number
          weight_kg?: number | null
          gender?: string | null
          is_neutered?: boolean
          is_vaccinated?: boolean
          vaccination_date?: string | null
          microchip_number?: string | null
          medical_conditions?: string | null
          medications?: string | null
          dietary_restrictions?: string | null
          feeding_schedule?: string | null
          litter_box_notes?: string | null
          behavior_notes?: string | null
          photo_url?: string | null
          emergency_vet?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          booking_number: string
          owner_id: string
          sitter_id: string
          service_type: string
          pet_ids: string[]
          start_date: string
          end_date: string
          num_visits_per_day: number
          pickup_needed: boolean
          dropoff_needed: boolean
          special_instructions: string | null
          emergency_contact: string | null
          status: string
          cancelled_by: string | null
          cancel_reason: string | null
          total_amount: number | null
          platform_fee: number | null
          sitter_payout: number | null
          payment_status: string
          payment_method: string | null
          payment_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_number?: string
          owner_id: string
          sitter_id: string
          service_type: string
          pet_ids: string[]
          start_date: string
          end_date: string
          num_visits_per_day?: number
          pickup_needed?: boolean
          dropoff_needed?: boolean
          special_instructions?: string | null
          emergency_contact?: string | null
          status?: string
          total_amount?: number | null
          platform_fee?: number | null
          sitter_payout?: number | null
          payment_method?: string | null
        }
        Update: {
          status?: string
          cancelled_by?: string | null
          cancel_reason?: string | null
          payment_status?: string
          payment_method?: string | null
          payment_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          owner_id: string
          sitter_id: string
          rating: number
          comment: string | null
          sitter_response: string | null
          photo_urls: string[] | null
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          owner_id: string
          sitter_id: string
          rating: number
          comment?: string | null
          photo_urls?: string[] | null
        }
        Update: {
          comment?: string | null
          sitter_response?: string | null
          is_visible?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          booking_id: string | null
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          attachments: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          attachments?: string[] | null
        }
        Update: {
          is_read?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body: string
          data?: Json
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          owner_id: string
          sitter_id: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          sitter_id: string
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// 便捷类型
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Sitter = Database['public']['Tables']['sitters']['Row']
export type SitterService = Database['public']['Tables']['sitter_services']['Row']
export type SitterPhoto = Database['public']['Tables']['sitter_photos']['Row']
export type Pet = Database['public']['Tables']['pets']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// 复合类型（带关联数据）
export type SitterWithDetails = Sitter & {
  profiles: Profile
  sitter_services: SitterService[]
  sitter_photos: SitterPhoto[]
  reviews?: Review[]
}

export type BookingWithDetails = Booking & {
  profiles: Profile
  sitters: Sitter & { profiles: Profile }
  pets_data?: Pet[]
}

// 服务类型常量
export const SERVICE_TYPES = {
  CAT_HOME_FEEDING: 'cat_home_feeding',
  CAT_BOARDING: 'cat_boarding',
} as const

export type ServiceType = typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES]

export const SERVICE_LABELS: Record<string, string> = {
  cat_home_feeding: '上门喂猫',
  cat_boarding: '猫咪寄养',
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  active: '服务中',
  completed: '已完成',
  cancelled: '已取消',
}

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}
