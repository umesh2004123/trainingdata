import { Tables } from "@/integrations/supabase/types";

export type Telltale = Tables<"telltales">;
export type TelltaleImage = Tables<"telltale_images">;
export type TelltaleStatus = "not_started" | "ongoing" | "completed";

export type TelltaleWithImages = Telltale & {
  telltale_images: TelltaleImage[];
};
