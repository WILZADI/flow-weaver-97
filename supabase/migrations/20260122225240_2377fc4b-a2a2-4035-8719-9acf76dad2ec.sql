-- Harden the handle_new_user function with explicit validation
-- This adds defense-in-depth by ensuring the function only processes valid auth user data

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that we're processing a valid user record
  -- This adds defense-in-depth even though the trigger is already protected by Supabase auth
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'Invalid user: id cannot be null';
  END IF;
  
  -- Only proceed if the user doesn't already have a profile (prevent duplicates)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;