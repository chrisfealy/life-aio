-- Tracks which exercises belong to a given workout session, independent of the program it
-- was started from. Lets a session add/swap/remove exercises without ever mutating the
-- shared workout_programs / workout_program_exercises definitions, and (unlike client-only
-- state) survives closing and reopening the session.
alter table workouts add column planned_exercise_ids uuid[] not null default '{}';
