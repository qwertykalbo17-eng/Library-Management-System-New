
import { supabase } from "./supabaseClient";

export async function testSupabaseConnection() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Supabase connection test failed:", error.message);
    return;
  }

  console.log("Supabase client initialized successfully!");
  console.log(
    "Current session:",
    data.session ? "Signed in" : "Not signed in"
  );
}