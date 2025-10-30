export interface Promotion {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  active: boolean;
  button_text: string;
  text_color: string;
  button_background_color: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  tags: string;
  enabled: boolean;
  image_url: string;
  sort_order: number;
}
