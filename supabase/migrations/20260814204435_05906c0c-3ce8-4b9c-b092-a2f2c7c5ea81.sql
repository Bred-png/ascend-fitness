-- ============ enums ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.path_type AS ENUM ('hero', 'villain');
CREATE TYPE public.experience_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.quest_kind AS ENUM ('daily', 'main', 'boss');
CREATE TYPE public.photo_kind AS ENUM ('current', 'target', 'progress');

-- ============ helper: updated_at ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ roles ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  path public.path_type NOT NULL DEFAULT 'hero',
  gender text,
  birth_year int,
  height_cm numeric,
  weight_kg numeric,
  experience public.experience_level NOT NULL DEFAULT 'beginner',
  goal text,
  equipment text[] NOT NULL DEFAULT '{}',
  days_per_week int NOT NULL DEFAULT 4,
  session_minutes int NOT NULL DEFAULT 45,
  onboarding_step text NOT NULL DEFAULT 'path',
  onboarded boolean NOT NULL DEFAULT false,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ progression ============
CREATE TABLE public.progression (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp int NOT NULL DEFAULT 0,
  body_xp int NOT NULL DEFAULT 0,
  mind_xp int NOT NULL DEFAULT 0,
  rank_tier int NOT NULL DEFAULT 0,
  rank_level int NOT NULL DEFAULT 1,
  strength int NOT NULL DEFAULT 1,
  power int NOT NULL DEFAULT 1,
  endurance int NOT NULL DEFAULT 1,
  speed int NOT NULL DEFAULT 1,
  mobility int NOT NULL DEFAULT 1,
  physique int NOT NULL DEFAULT 1,
  discipline int NOT NULL DEFAULT 1,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_active_date date,
  total_workouts int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progression TO authenticated;
GRANT ALL ON public.progression TO service_role;
ALTER TABLE public.progression ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progression" ON public.progression FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER progression_touch BEFORE UPDATE ON public.progression
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ signup hook ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.progression (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ physique photos & analyses ============
CREATE TABLE public.physique_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.photo_kind NOT NULL,
  storage_path text NOT NULL,
  taken_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.physique_photos TO authenticated;
GRANT ALL ON public.physique_photos TO service_role;
ALTER TABLE public.physique_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own photos" ON public.physique_photos FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.physique_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_photo_id uuid REFERENCES public.physique_photos(id) ON DELETE SET NULL,
  target_photo_id uuid REFERENCES public.physique_photos(id) ON DELETE SET NULL,
  summary text,
  development jsonb NOT NULL DEFAULT '{}'::jsonb,
  priorities text[] NOT NULL DEFAULT '{}',
  bodyfat_range text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.physique_analyses TO authenticated;
GRANT ALL ON public.physique_analyses TO service_role;
ALTER TABLE public.physique_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own analyses" ON public.physique_analyses FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ training plans ============
CREATE TABLE public.training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Training Protocol',
  rationale text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_plans TO authenticated;
GRANT ALL ON public.training_plans TO service_role;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plans" ON public.training_plans FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.plan_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index int NOT NULL,
  title text NOT NULL,
  focus text,
  is_rest boolean NOT NULL DEFAULT false,
  cardio text,
  est_minutes int NOT NULL DEFAULT 45
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_days TO authenticated;
GRANT ALL ON public.plan_days TO service_role;
ALTER TABLE public.plan_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plan days" ON public.plan_days FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.plan_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES public.plan_days(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  name text NOT NULL,
  sets int NOT NULL DEFAULT 3,
  reps text NOT NULL DEFAULT '8-12',
  rest_sec int NOT NULL DEFAULT 90,
  tempo text,
  difficulty text,
  progression_target text,
  why text,
  alternatives text[] NOT NULL DEFAULT '{}'
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_exercises TO authenticated;
GRANT ALL ON public.plan_exercises TO service_role;
ALTER TABLE public.plan_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plan exercises" ON public.plan_exercises FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ sessions & sets ============
CREATE TABLE public.workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_id uuid REFERENCES public.plan_days(id) ON DELETE SET NULL,
  title text NOT NULL,
  performed_on date NOT NULL DEFAULT current_date,
  duration_min int,
  difficulty int,
  notes text,
  xp_awarded int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sessions TO authenticated;
GRANT ALL ON public.workout_sessions TO service_role;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions" ON public.workout_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX workout_sessions_user_date ON public.workout_sessions (user_id, performed_on DESC);

CREATE TABLE public.set_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name text NOT NULL,
  set_index int NOT NULL DEFAULT 1,
  weight_kg numeric,
  reps int,
  rpe int,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.set_logs TO authenticated;
GRANT ALL ON public.set_logs TO service_role;
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sets" ON public.set_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX set_logs_user_exercise ON public.set_logs (user_id, exercise_name);

-- ============ quests ============
CREATE TABLE public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.quest_kind NOT NULL DEFAULT 'daily',
  title text NOT NULL,
  description text,
  target_label text,
  xp_reward int NOT NULL DEFAULT 25,
  stat_reward text,
  for_date date NOT NULL DEFAULT current_date,
  expires_on date,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quests TO authenticated;
GRANT ALL ON public.quests TO service_role;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quests" ON public.quests FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX quests_user_date ON public.quests (user_id, for_date DESC);

-- ============ xp ledger (anti-cheese) ============
CREATE TABLE public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL,
  source_key text,
  amount int NOT NULL,
  channel text NOT NULL DEFAULT 'body',
  for_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.xp_events TO authenticated;
GRANT ALL ON public.xp_events TO service_role;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own xp events" ON public.xp_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert own xp events" ON public.xp_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX xp_events_user_date ON public.xp_events (user_id, for_date DESC);

-- ============ achievements ============
CREATE TABLE public.achievements (
  code text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  xp_reward int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone signed in reads achievements" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage achievements" ON public.achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL REFERENCES public.achievements(code) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
GRANT SELECT, INSERT, DELETE ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own achievements" ON public.user_achievements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ body metrics ============
CREATE TABLE public.body_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_on date NOT NULL DEFAULT current_date,
  weight_kg numeric,
  waist_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_metrics TO authenticated;
GRANT ALL ON public.body_metrics TO service_role;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own metrics" ON public.body_metrics FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ nutrition ============
CREATE TABLE public.nutrition_targets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  calories int NOT NULL DEFAULT 2200,
  protein_g int NOT NULL DEFAULT 140,
  carbs_g int NOT NULL DEFAULT 230,
  fat_g int NOT NULL DEFAULT 70,
  water_ml int NOT NULL DEFAULT 2500,
  manual boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_targets TO authenticated;
GRANT ALL ON public.nutrition_targets TO service_role;
ALTER TABLE public.nutrition_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nutrition targets" ON public.nutrition_targets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  for_date date NOT NULL DEFAULT current_date,
  calories int NOT NULL DEFAULT 0,
  protein_g int NOT NULL DEFAULT 0,
  carbs_g int NOT NULL DEFAULT 0,
  fat_g int NOT NULL DEFAULT 0,
  water_ml int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, for_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_logs TO authenticated;
GRANT ALL ON public.nutrition_logs TO service_role;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nutrition logs" ON public.nutrition_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ coach ============
CREATE TABLE public.coach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.coach_messages TO authenticated;
GRANT ALL ON public.coach_messages TO service_role;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own coach messages" ON public.coach_messages FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX coach_messages_user_time ON public.coach_messages (user_id, created_at);

-- ============ research ============
CREATE TABLE public.research_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  claim text NOT NULL,
  citation text NOT NULL,
  url text,
  organisation text,
  year int,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.research_sources TO authenticated;
GRANT ALL ON public.research_sources TO service_role;
ALTER TABLE public.research_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed in read research" ON public.research_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage research" ON public.research_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ tunable config ============
CREATE TABLE public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_config TO authenticated;
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed in read config" ON public.app_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage config" ON public.app_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_config (key, value, description) VALUES
  ('xp_curve', '{"baseXp":1000,"growthRate":1.5,"levelsPerTier":10,"tierMultipliers":{"0":1,"1":1,"2":1.4,"3":2,"4":3}}', 'XP curve: requiredXP = baseXp * growthRate^(level-1) * tierMultiplier'),
  ('xp_rewards', '{"workout":100,"workoutProgression":125,"questMin":25,"questMax":100,"mainQuest":250,"mobility":40,"cardioMin":50,"cardioMax":100,"walking":25,"nutrition":25,"sleep":25,"bossMin":200,"bossMax":500,"personalRecord":100,"progressPhoto":50,"weeklyPlanBonus":300,"mental":25}', 'XP awarded per activity'),
  ('xp_limits', '{"dailyCap":600,"questsPerDay":5,"repeatDecay":0.5,"bossPerWeek":1,"questCooldownHours":20}', 'Anti-farming limits');

-- ============ achievement seed ============
INSERT INTO public.achievements (code, title, description, xp_reward, sort_order) VALUES
  ('first_quest','First Quest','Complete your first workout',50,1),
  ('limit_breaker','Limit Breaker','Beat a personal record',100,2),
  ('streak_7','7 Day Streak','Train seven days in a row',150,3),
  ('streak_30','30 Day Streak','Train thirty days in a row',400,4),
  ('xp_1000','1,000 XP','Accumulate 1,000 total XP',0,5),
  ('rank_c','C-Class','Reach C-Class / Tiger tier',0,6),
  ('rank_a','A-Class','Reach A-Class / Dragon tier',0,7),
  ('rank_s','S-Class','Reach the final tier',0,8),
  ('workouts_100','100 Sessions','Log one hundred workouts',500,9),
  ('no_excuses','No Excuses','Train again right after missing a day',75,10),
  ('mind_first','Opened Book','Log your first mind-training session',25,11),
  ('photo_first','Evidence','Upload your first progress photo',50,12);

-- ============ research seed ============
INSERT INTO public.research_sources (topic, claim, citation, organisation, year, sort_order) VALUES
  ('hypertrophy','10-20 hard sets per muscle group per week maximises hypertrophy for most trainees','Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Sports Sci.','Journal of Sports Sciences',2017,1),
  ('frequency','Training a muscle group at least twice per week produces greater hypertrophy than once weekly at equal volume','Schoenfeld BJ, Ogborn D, Krieger JW. Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis.','Sports Medicine',2016,2),
  ('progressive_overload','Progressive increases in load or repetitions are the primary driver of long-term strength adaptation','ACSM Position Stand: Progression Models in Resistance Training for Healthy Adults.','American College of Sports Medicine',2009,3),
  ('protein','Roughly 1.6 g/kg bodyweight per day maximises resistance-training-induced gains in lean mass','Morton RW et al. A systematic review, meta-analysis and meta-regression of protein supplementation on resistance training-induced gains.','British Journal of Sports Medicine',2018,4),
  ('sleep','Sleep restriction impairs recovery, performance and body-composition outcomes','Dattilo M et al. Sleep and muscle recovery.','Medical Hypotheses',2011,5),
  ('cardio','150 minutes of moderate activity per week is the baseline recommendation for cardiovascular health','WHO Guidelines on Physical Activity and Sedentary Behaviour.','World Health Organization',2020,6),
  ('mobility','Regular range-of-motion work improves joint flexibility without impairing strength when done post-session','Behm DG et al. Acute effects of muscle stretching on physical performance.','Applied Physiology, Nutrition and Metabolism',2016,7),
  ('recovery','48 hours between demanding sessions for the same muscle group supports full recovery in most trainees','ACSM Position Stand: Quantity and Quality of Exercise.','American College of Sports Medicine',2011,8);