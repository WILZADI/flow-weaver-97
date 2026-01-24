import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with the user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Client with user token to verify identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Create admin client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Delete user's avatar from storage
    const { data: avatarFiles } = await supabaseAdmin.storage
      .from("avatars")
      .list(userId);

    if (avatarFiles && avatarFiles.length > 0) {
      const filePaths = avatarFiles.map((file) => `${userId}/${file.name}`);
      await supabaseAdmin.storage.from("avatars").remove(filePaths);
    }

    // 2. Delete user's transactions
    const { error: transactionsError } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("user_id", userId);

    if (transactionsError) {
      console.error("Error deleting transactions:", transactionsError);
    }

    // 3. Delete user's custom categories
    const { error: categoriesError } = await supabaseAdmin
      .from("custom_categories")
      .delete()
      .eq("user_id", userId);

    if (categoriesError) {
      console.error("Error deleting custom categories:", categoriesError);
    }

    // 4. Delete user's profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
    }

    // 5. Delete the auth user (this must be done last)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      return new Response(
        JSON.stringify({ error: "Error deleting user account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
