CREATE TABLE public.mental_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  per_week int NOT NULL DEFAULT 7,
  target_date date,
  milestone_target int,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mental_goals TO authenticated;
GRANT ALL ON public.mental_goals TO service_role;
ALTER TABLE public.mental_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mental goals" ON public.mental_goals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.mental_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.mental_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  for_date date NOT NULL DEFAULT current_date,
  minutes int,
  note text,
  xp int NOT NULL DEFAULT 25,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (goal_id, for_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mental_logs TO authenticated;
GRANT ALL ON public.mental_logs TO service_role;
ALTER TABLE public.mental_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mental logs" ON public.mental_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);