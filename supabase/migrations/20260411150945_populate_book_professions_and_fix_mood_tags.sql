/*
  # Populate book professions and normalize mood tags

  1. Changes
    - Assigns profession tags to all books based on genre/title
    - Adds missing mood tags (motivational, romantic, dark-deep)
    - Normalizes mood tag names to match UI IDs:
      - feel-good (keep)
      - dark-deep (was dark-twisty)
      - motivational (new)
      - romantic (new)
      - mind-bending (keep)
      - cozy (keep)
      - heartwarming (keep)
      - adventurous (keep)

  2. Notes
    - Uses UPDATE ... WHERE to avoid touching unrelated rows
    - All changes are additive / corrective
*/

-- Rename dark-twisty -> dark-deep to match UI mood IDs
UPDATE books
SET mood_tags = array_replace(mood_tags, 'dark-twisty', 'dark-deep');

-- Add romantic tag to romance/contemporary-romance books
UPDATE books SET mood_tags = array_append(mood_tags, 'romantic')
WHERE (
  'romance' = ANY(genres)
  OR title IN (
    'Pride and Prejudice','Beach Read','Red, White & Royal Blue',
    'The Seven Husbands of Evelyn Hugo','The Night Circus','Normal People'
  )
) AND NOT ('romantic' = ANY(mood_tags));

-- Add motivational tag to memoir/nonfiction/self-improvement books
UPDATE books SET mood_tags = array_append(mood_tags, 'motivational')
WHERE (
  'memoir' = ANY(genres)
  OR 'nonfiction' = ANY(genres)
  OR title IN ('Educated','Sapiens','Braiding Sweetgrass','Lessons in Chemistry')
) AND NOT ('motivational' = ANY(mood_tags));

-- Profession: developer
UPDATE books SET professions = array_append(professions, 'developer')
WHERE (
  'scifi' = ANY(genres)
  OR title IN (
    '1984','Dune','Project Hail Mary','Klara and the Sun',
    'Station Eleven','The Fifth Season','Sapiens'
  )
) AND NOT ('developer' = ANY(professions));

-- Profession: designer
UPDATE books SET professions = array_append(professions, 'designer')
WHERE (
  'literary' = ANY(genres)
  OR 'fantasy' = ANY(genres)
  OR title IN (
    'The Night Circus','Piranesi','Circe','Babel',
    'The Midnight Library','Legends & Lattes'
  )
) AND NOT ('designer' = ANY(professions));

-- Profession: entrepreneur
UPDATE books SET professions = array_append(professions, 'entrepreneur')
WHERE (
  'nonfiction' = ANY(genres)
  OR 'memoir' = ANY(genres)
  OR title IN (
    'Educated','Sapiens','Braiding Sweetgrass',
    'Lessons in Chemistry','A Man Called Ove',
    'Tomorrow, and Tomorrow, and Tomorrow'
  )
) AND NOT ('entrepreneur' = ANY(professions));

-- Profession: lawyer
UPDATE books SET professions = array_append(professions, 'lawyer')
WHERE (
  'thriller' = ANY(genres)
  OR 'mystery' = ANY(genres)
  OR 'dystopian' = ANY(genres)
  OR title IN (
    '1984','Gone Girl','The Silent Patient','The Girl with the Dragon Tattoo',
    'The Secret History','The Thursday Murder Club','The Handmaid''s Tale'
  )
) AND NOT ('lawyer' = ANY(professions));

-- Profession: doctor
UPDATE books SET professions = array_append(professions, 'doctor')
WHERE (
  'psychology' = ANY(genres)
  OR title IN (
    'The Body Keeps the Score','A Little Life','Never Let Me Go',
    'Klara and the Sun','Educated','Beloved'
  )
) AND NOT ('doctor' = ANY(professions));

-- Profession: educator
UPDATE books SET professions = array_append(professions, 'educator')
WHERE (
  'history' = ANY(genres)
  OR 'classic' = ANY(genres)
  OR 'nature' = ANY(genres)
  OR title IN (
    'Sapiens','Braiding Sweetgrass','1984','Beloved',
    'One Hundred Years of Solitude','Pride and Prejudice'
  )
) AND NOT ('educator' = ANY(professions));

-- Profession: scientist
UPDATE books SET professions = array_append(professions, 'scientist')
WHERE (
  'scifi' = ANY(genres)
  OR 'speculative' = ANY(genres)
  OR title IN (
    'Project Hail Mary','Dune','Klara and the Sun','Station Eleven',
    'The Fifth Season','Sapiens','Braiding Sweetgrass'
  )
) AND NOT ('scientist' = ANY(professions));
