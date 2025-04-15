export interface Promotion {
  id: string;
  name: string;
  title: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
  is_main: boolean;
  condition_type: 'tags' | 'collections' | 'products' | string;
  condition_value: string;
  terms_and_conditions: string | null;
  button_text: string | null;
  button_url: string | null;
  background_color: string;
  text_color: string;
  button_background_color: string;
  button_text_color: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
} 