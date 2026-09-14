-- Seed a common exercise library shared by all users (user_id = null).
-- Users can add their own custom exercises on top of this list.

insert into exercises (name, category, exercise_type, is_custom) values
  -- Chest
  ('Barbell Bench Press', 'chest', 'strength', false),
  ('Incline Barbell Bench Press', 'chest', 'strength', false),
  ('Dumbbell Bench Press', 'chest', 'strength', false),
  ('Incline Dumbbell Press', 'chest', 'strength', false),
  ('Dumbbell Fly', 'chest', 'strength', false),
  ('Push-Up', 'chest', 'strength', false),
  ('Cable Crossover', 'chest', 'strength', false),
  ('Dip (Chest)', 'chest', 'strength', false),

  -- Back
  ('Deadlift', 'back', 'strength', false),
  ('Pull-Up', 'back', 'strength', false),
  ('Chin-Up', 'back', 'strength', false),
  ('Lat Pulldown', 'back', 'strength', false),
  ('Bent-Over Barbell Row', 'back', 'strength', false),
  ('Seated Cable Row', 'back', 'strength', false),
  ('One-Arm Dumbbell Row', 'back', 'strength', false),
  ('T-Bar Row', 'back', 'strength', false),

  -- Legs
  ('Barbell Back Squat', 'legs', 'strength', false),
  ('Barbell Front Squat', 'legs', 'strength', false),
  ('Leg Press', 'legs', 'strength', false),
  ('Romanian Deadlift', 'legs', 'strength', false),
  ('Walking Lunge', 'legs', 'strength', false),
  ('Leg Extension', 'legs', 'strength', false),
  ('Leg Curl', 'legs', 'strength', false),
  ('Standing Calf Raise', 'legs', 'strength', false),
  ('Hip Thrust', 'legs', 'strength', false),

  -- Shoulders
  ('Overhead Barbell Press', 'shoulders', 'strength', false),
  ('Seated Dumbbell Shoulder Press', 'shoulders', 'strength', false),
  ('Lateral Raise', 'shoulders', 'strength', false),
  ('Front Raise', 'shoulders', 'strength', false),
  ('Face Pull', 'shoulders', 'strength', false),
  ('Rear Delt Fly', 'shoulders', 'strength', false),
  ('Barbell Shrug', 'shoulders', 'strength', false),

  -- Arms
  ('Barbell Curl', 'arms', 'strength', false),
  ('Dumbbell Curl', 'arms', 'strength', false),
  ('Hammer Curl', 'arms', 'strength', false),
  ('Skull Crusher', 'arms', 'strength', false),
  ('Triceps Pushdown', 'arms', 'strength', false),
  ('Close-Grip Bench Press', 'arms', 'strength', false),
  ('Dip (Triceps)', 'arms', 'strength', false),

  -- Core
  ('Plank', 'core', 'strength', false),
  ('Hanging Leg Raise', 'core', 'strength', false),
  ('Cable Crunch', 'core', 'strength', false),
  ('Russian Twist', 'core', 'strength', false),
  ('Ab Wheel Rollout', 'core', 'strength', false),

  -- Full body
  ('Clean and Jerk', 'full_body', 'strength', false),
  ('Snatch', 'full_body', 'strength', false),
  ('Kettlebell Swing', 'full_body', 'strength', false),
  ('Farmer''s Carry', 'full_body', 'strength', false),

  -- Cardio
  ('Running', 'cardio', 'cardio', false),
  ('Cycling', 'cardio', 'cardio', false),
  ('Rowing', 'cardio', 'cardio', false),
  ('Swimming', 'cardio', 'cardio', false),
  ('Elliptical', 'cardio', 'cardio', false),
  ('Stair Climber', 'cardio', 'cardio', false),
  ('Walking', 'cardio', 'cardio', false),
  ('Jump Rope', 'cardio', 'cardio', false);
