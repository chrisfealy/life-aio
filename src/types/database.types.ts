// Hand-written to match supabase/migrations/0001_init.sql and 0002_seed_exercises.sql.
// Once the Supabase project exists, regenerate the authoritative version with:
//   supabase gen types typescript --project-id <ref> > src/types/database.types.ts

export type HabitType = 'boolean' | 'numeric'
export type ExerciseType = 'strength' | 'cardio'
export type WorkoutType = 'strength' | 'cardio'
export type CategoryDirection = 'income' | 'expense' | 'both'
export type TransactionDirection = 'in' | 'out'
export type TransactionSource = 'manual' | 'csv_import'

export interface Database {
  public: {
    Tables: {
      journal_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          entry_date: string
          summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['journal_entries']['Insert']>
        Relationships: []
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          habit_type: HabitType
          target_value: number | null
          unit: string | null
          is_archived: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          description?: string | null
          habit_type?: HabitType
          target_value?: number | null
          unit?: string | null
          is_archived?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['habits']['Insert']>
        Relationships: []
      }
      habit_logs: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          log_date: string
          completed: boolean | null
          value: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          habit_id: string
          log_date: string
          completed?: boolean | null
          value?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['habit_logs']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'habit_logs_habit_id_fkey'
            columns: ['habit_id']
            referencedRelation: 'habits'
            referencedColumns: ['id']
          },
        ]
      }
      exercises: {
        Row: {
          id: string
          user_id: string | null
          name: string
          category: string
          exercise_type: ExerciseType
          is_custom: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          category: string
          exercise_type?: ExerciseType
          is_custom?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>
        Relationships: []
      }
      workout_programs: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['workout_programs']['Insert']>
        Relationships: []
      }
      workout_program_exercises: {
        Row: {
          id: string
          user_id: string
          program_id: string
          exercise_id: string
          sort_order: number
          target_sets: number | null
          target_reps: number | null
          target_weight: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          program_id: string
          exercise_id: string
          sort_order?: number
          target_sets?: number | null
          target_reps?: number | null
          target_weight?: number | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['workout_program_exercises']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'workout_program_exercises_program_id_fkey'
            columns: ['program_id']
            referencedRelation: 'workout_programs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_program_exercises_exercise_id_fkey'
            columns: ['exercise_id']
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
        ]
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          workout_date: string
          workout_type: WorkoutType
          program_id: string | null
          notes: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          planned_exercise_ids: string[]
        }
        Insert: {
          id?: string
          user_id?: string
          workout_date: string
          workout_type: WorkoutType
          program_id?: string | null
          notes?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          planned_exercise_ids?: string[]
        }
        Update: Partial<Database['public']['Tables']['workouts']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'workouts_program_id_fkey'
            columns: ['program_id']
            referencedRelation: 'workout_programs'
            referencedColumns: ['id']
          },
        ]
      }
      workout_sets: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          exercise_id: string
          set_number: number
          weight: number | null
          reps: number | null
          is_warmup: boolean
          rpe: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          workout_id: string
          exercise_id: string
          set_number: number
          weight?: number | null
          reps?: number | null
          is_warmup?: boolean
          rpe?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['workout_sets']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'workout_sets_workout_id_fkey'
            columns: ['workout_id']
            referencedRelation: 'workouts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_sets_exercise_id_fkey'
            columns: ['exercise_id']
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
        ]
      }
      cardio_logs: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          exercise_id: string | null
          duration_seconds: number | null
          distance: number | null
          distance_unit: string | null
          calories: number | null
          avg_heart_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          workout_id: string
          exercise_id?: string | null
          duration_seconds?: number | null
          distance?: number | null
          distance_unit?: string | null
          calories?: number | null
          avg_heart_rate?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['cardio_logs']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'cardio_logs_workout_id_fkey'
            columns: ['workout_id']
            referencedRelation: 'workouts'
            referencedColumns: ['id']
          },
        ]
      }
      finance_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          direction: CategoryDirection
          color: string | null
          is_archived: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          direction?: CategoryDirection
          color?: string | null
          is_archived?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['finance_categories']['Insert']>
        Relationships: []
      }
      csv_import_batches: {
        Row: {
          id: string
          user_id: string
          filename: string | null
          imported_at: string
          row_count: number | null
        }
        Insert: {
          id?: string
          user_id?: string
          filename?: string | null
          imported_at?: string
          row_count?: number | null
        }
        Update: Partial<Database['public']['Tables']['csv_import_batches']['Insert']>
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          txn_date: string
          amount: number
          direction: TransactionDirection
          category_id: string | null
          note: string | null
          raw_description: string | null
          source: TransactionSource
          import_batch_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          txn_date: string
          amount: number
          direction: TransactionDirection
          category_id?: string | null
          note?: string | null
          raw_description?: string | null
          source?: TransactionSource
          import_batch_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'finance_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_import_batch_id_fkey'
            columns: ['import_batch_id']
            referencedRelation: 'csv_import_batches'
            referencedColumns: ['id']
          },
        ]
      }
      category_rules: {
        Row: {
          id: string
          user_id: string
          category_id: string
          keyword: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          category_id: string
          keyword: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['category_rules']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'category_rules_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'finance_categories'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
