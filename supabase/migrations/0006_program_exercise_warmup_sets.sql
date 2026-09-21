-- Lets a program exercise specify a warm-up set count separate from its working set count
-- (target_sets). Both are copied into workout_sets as empty rows when a workout is started
-- from the program.
alter table workout_program_exercises add column warmup_sets int;
