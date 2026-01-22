import { createClient } from "@supabase/supabase-js";

// Create Supabase client using environment variables
export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Helper function to get the currently logged-in user
export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.log("No user logged in");
    return;
  }

  console.log(data.user);
};
