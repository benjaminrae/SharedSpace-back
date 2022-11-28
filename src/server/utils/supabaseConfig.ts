import { createClient } from "@supabase/supabase-js";
import { environment } from "../../loadEnvironment";

const { supabaseBucket, supabaseKey, supabaseUrl } = environment;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const bucket = supabase.storage.from(supabaseBucket);
