-- Corrige una llave mal escrita dentro del jsonb `requires`.
--
-- La columna guarda que exige cada control: biometria, topografia, fondo de
-- ojo y la refraccion bajo cicloplejia. Esa ultima estaba escrita
-- `ciclopejia`, sin la ele. No es un nombre de columna ni nada que la base
-- valide, asi que nadie fallo: simplemente estaba mal escrita la palabra en
-- todas las filas y en el codigo que las lee.
--
-- Esto solo reescribe datos, no cambia el esquema. Hay que correrlo antes de
-- desplegar el codigo que ya busca `cicloplejia`; si se corre despues, entre
-- una cosa y otra los controles dejan de mostrar que llevan refraccion
-- ciclopejica, que es feo pero no borra nada.
--
--   npx tsx scripts/sql/correr.ts scripts/sql/0001-cicloplejia.sql

update followup_template_item
set requires = (requires - 'ciclopejia') || jsonb_build_object('cicloplejia', requires -> 'ciclopejia')
where requires ? 'ciclopejia';

update scheduled_exam
set requires = (requires - 'ciclopejia') || jsonb_build_object('cicloplejia', requires -> 'ciclopejia')
where requires ? 'ciclopejia';
