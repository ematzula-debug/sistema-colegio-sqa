CREATE TABLE IF NOT EXISTS public.alumno_encargado
(
    id serial NOT NULL,
    alumno_id integer NOT NULL,
    encargado_id integer NOT NULL,
    parentesco character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT alumno_encargado_pkey PRIMARY KEY (id),
    CONSTRAINT uq_alumno_encargado UNIQUE (alumno_id, encargado_id)
);

CREATE TABLE IF NOT EXISTS public.alumnos
(
    id serial NOT NULL,
    codigo character varying(30) COLLATE pg_catalog."default" NOT NULL,
    nombres character varying(100) COLLATE pg_catalog."default" NOT NULL,
    apellidos character varying(100) COLLATE pg_catalog."default" NOT NULL,
    fecha_nacimiento date,
    direccion text COLLATE pg_catalog."default",
    telefono character varying(20) COLLATE pg_catalog."default",
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVO'::character varying,
    usuario_id integer,
    CONSTRAINT alumnos_pkey PRIMARY KEY (id),
    CONSTRAINT alumnos_codigo_key UNIQUE (codigo),
    CONSTRAINT alumnos_usuario_id_key UNIQUE (usuario_id)
);

CREATE TABLE IF NOT EXISTS public.asignaciones_profesor
(
    id serial NOT NULL,
    profesor_id integer NOT NULL,
    asignatura_id integer NOT NULL,
    grado_id integer NOT NULL,
    seccion_id integer NOT NULL,
    ciclo_escolar_id integer NOT NULL,
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVO'::character varying,
    CONSTRAINT asignaciones_profesor_pkey PRIMARY KEY (id),
    CONSTRAINT uq_asignacion_profesor UNIQUE (profesor_id, asignatura_id, grado_id, seccion_id, ciclo_escolar_id)
);

CREATE TABLE IF NOT EXISTS public.asignaturas
(
    id serial NOT NULL,
    codigo character varying(30) COLLATE pg_catalog."default" NOT NULL,
    nombre character varying(100) COLLATE pg_catalog."default" NOT NULL,
    grado_id integer NOT NULL,
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVO'::character varying,
    CONSTRAINT asignaturas_pkey PRIMARY KEY (id),
    CONSTRAINT asignaturas_codigo_key UNIQUE (codigo)
);

CREATE TABLE IF NOT EXISTS public.bitacora_sistema
(
    id serial NOT NULL,
    usuario_id integer,
    accion character varying(100) COLLATE pg_catalog."default" NOT NULL,
    descripcion text COLLATE pg_catalog."default",
    fecha_hora timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bitacora_sistema_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.ciclos_escolares
(
    id serial NOT NULL,
    anio integer NOT NULL,
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVO'::character varying,
    CONSTRAINT ciclos_escolares_pkey PRIMARY KEY (id),
    CONSTRAINT ciclos_escolares_anio_key UNIQUE (anio)
);

CREATE TABLE IF NOT EXISTS public.encargados
(
    id serial NOT NULL,
    dpi character varying(20) COLLATE pg_catalog."default",
    nombres character varying(100) COLLATE pg_catalog."default" NOT NULL,
    apellidos character varying(100) COLLATE pg_catalog."default" NOT NULL,
    telefono character varying(20) COLLATE pg_catalog."default",
    direccion text COLLATE pg_catalog."default",
    correo character varying(100) COLLATE pg_catalog."default",
    usuario_id integer,
    CONSTRAINT encargados_pkey PRIMARY KEY (id),
    CONSTRAINT encargados_usuario_id_key UNIQUE (usuario_id)
);

CREATE TABLE IF NOT EXISTS public.grados
(
    id serial NOT NULL,
    nombre character varying(50) COLLATE pg_catalog."default" NOT NULL,
    nivel character varying(50) COLLATE pg_catalog."default",
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVO'::character varying,
    CONSTRAINT grados_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.inscripciones
(
    id serial NOT NULL,
    alumno_id integer NOT NULL,
    ciclo_escolar_id integer NOT NULL,
    grado_id integer NOT NULL,
    seccion_id integer NOT NULL,
    fecha_inscripcion date NOT NULL DEFAULT CURRENT_DATE,
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'INSCRITO'::character varying,
    CONSTRAINT inscripciones_pkey PRIMARY KEY (id),
    CONSTRAINT uq_inscripcion_alumno_ciclo UNIQUE (alumno_id, ciclo_escolar_id)
);

CREATE TABLE IF NOT EXISTS public.notas
(
    id serial NOT NULL,
    alumno_id integer NOT NULL,
    asignatura_id integer NOT NULL,
    profesor_id integer NOT NULL,
    ciclo_escolar_id integer NOT NULL,
    unidad character varying(30) COLLATE pg_catalog."default" NOT NULL,
    nota numeric(5, 2) NOT NULL,
    fecha_registro date NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT notas_pkey PRIMARY KEY (id),
    CONSTRAINT uq_nota_alumno_asignatura_unidad UNIQUE (alumno_id, asignatura_id, ciclo_escolar_id, unidad)
);

CREATE TABLE IF NOT EXISTS public.profesores
(
    id serial NOT NULL,
    codigo character varying(30) COLLATE pg_catalog."default" NOT NULL,
    nombres character varying(100) COLLATE pg_catalog."default" NOT NULL,
    apellidos character varying(100) COLLATE pg_catalog."default" NOT NULL,
    telefono character varying(20) COLLATE pg_catalog."default",
    correo character varying(100) COLLATE pg_catalog."default",
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVO'::character varying,
    usuario_id integer,
    CONSTRAINT profesores_pkey PRIMARY KEY (id),
    CONSTRAINT profesores_codigo_key UNIQUE (codigo),
    CONSTRAINT profesores_usuario_id_key UNIQUE (usuario_id)
);

CREATE TABLE IF NOT EXISTS public.roles
(
    id serial NOT NULL,
    nombre character varying(50) COLLATE pg_catalog."default" NOT NULL,
    descripcion text COLLATE pg_catalog."default",
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_nombre_key UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS public.secciones
(
    id serial NOT NULL,
    nombre character varying(10) COLLATE pg_catalog."default" NOT NULL,
    grado_id integer NOT NULL,
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVO'::character varying,
    CONSTRAINT secciones_pkey PRIMARY KEY (id),
    CONSTRAINT uq_seccion_grado UNIQUE (nombre, grado_id)
);

CREATE TABLE IF NOT EXISTS public.usuarios
(
    id serial NOT NULL,
    nombre_usuario character varying(50) COLLATE pg_catalog."default" NOT NULL,
    correo character varying(100) COLLATE pg_catalog."default" NOT NULL,
    contrasena character varying(255) COLLATE pg_catalog."default" NOT NULL,
    estado character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVO'::character varying,
    rol_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_correo_key UNIQUE (correo),
    CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario)
);

ALTER TABLE IF EXISTS public.alumno_encargado
    ADD CONSTRAINT fk_alumno_encargado_alumno FOREIGN KEY (alumno_id)
    REFERENCES public.alumnos (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.alumno_encargado
    ADD CONSTRAINT fk_alumno_encargado_encargado FOREIGN KEY (encargado_id)
    REFERENCES public.encargados (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.alumnos
    ADD CONSTRAINT fk_alumnos_usuarios FOREIGN KEY (usuario_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS alumnos_usuario_id_key
    ON public.alumnos(usuario_id);


ALTER TABLE IF EXISTS public.asignaciones_profesor
    ADD CONSTRAINT fk_asignaciones_asignaturas FOREIGN KEY (asignatura_id)
    REFERENCES public.asignaturas (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.asignaciones_profesor
    ADD CONSTRAINT fk_asignaciones_ciclos FOREIGN KEY (ciclo_escolar_id)
    REFERENCES public.ciclos_escolares (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.asignaciones_profesor
    ADD CONSTRAINT fk_asignaciones_grados FOREIGN KEY (grado_id)
    REFERENCES public.grados (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.asignaciones_profesor
    ADD CONSTRAINT fk_asignaciones_profesores FOREIGN KEY (profesor_id)
    REFERENCES public.profesores (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.asignaciones_profesor
    ADD CONSTRAINT fk_asignaciones_secciones FOREIGN KEY (seccion_id)
    REFERENCES public.secciones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.asignaturas
    ADD CONSTRAINT fk_asignaturas_grados FOREIGN KEY (grado_id)
    REFERENCES public.grados (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.bitacora_sistema
    ADD CONSTRAINT fk_bitacora_usuarios FOREIGN KEY (usuario_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.encargados
    ADD CONSTRAINT fk_encargados_usuarios FOREIGN KEY (usuario_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS encargados_usuario_id_key
    ON public.encargados(usuario_id);


ALTER TABLE IF EXISTS public.inscripciones
    ADD CONSTRAINT fk_inscripciones_alumnos FOREIGN KEY (alumno_id)
    REFERENCES public.alumnos (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inscripciones
    ADD CONSTRAINT fk_inscripciones_ciclos FOREIGN KEY (ciclo_escolar_id)
    REFERENCES public.ciclos_escolares (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inscripciones
    ADD CONSTRAINT fk_inscripciones_grados FOREIGN KEY (grado_id)
    REFERENCES public.grados (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inscripciones
    ADD CONSTRAINT fk_inscripciones_secciones FOREIGN KEY (seccion_id)
    REFERENCES public.secciones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.notas
    ADD CONSTRAINT fk_notas_alumnos FOREIGN KEY (alumno_id)
    REFERENCES public.alumnos (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.notas
    ADD CONSTRAINT fk_notas_asignaturas FOREIGN KEY (asignatura_id)
    REFERENCES public.asignaturas (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.notas
    ADD CONSTRAINT fk_notas_ciclos FOREIGN KEY (ciclo_escolar_id)
    REFERENCES public.ciclos_escolares (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.notas
    ADD CONSTRAINT fk_notas_profesores FOREIGN KEY (profesor_id)
    REFERENCES public.profesores (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.profesores
    ADD CONSTRAINT fk_profesores_usuarios FOREIGN KEY (usuario_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS profesores_usuario_id_key
    ON public.profesores(usuario_id);


ALTER TABLE IF EXISTS public.secciones
    ADD CONSTRAINT fk_secciones_grados FOREIGN KEY (grado_id)
    REFERENCES public.grados (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.usuarios
    ADD CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id)
    REFERENCES public.roles (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;

INSERT INTO public.roles (nombre, descripcion) VALUES 
('ADMINISTRADOR', 'Acceso total al sistema'),
('PROFESOR', 'Acceso a gestión de notas y asignaciones'),
('ALUMNO', 'Consulta de notas e información escolar'),
('ENCARGADO', 'Consulta de notas de alumnos a su cargo');

INSERT INTO public.usuarios (nombre_usuario, correo, contrasena, rol_id) VALUES 
('admin', 'admin@colegio.com', 'admin123', 1);

UPDATE public.usuarios 
SET contrasena = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQvq4aO' 
WHERE nombre_usuario = 'admin' OR correo = 'admin@colegio.com';


UPDATE public.usuarios 
SET contrasena = '$2b$10$8/.n0WirE8wiS34JGYlN/.ZNgH4NByGC7ZB1g15XTCVLjZdtUhkd.',
    estado = 'ACTIVO'
WHERE LOWER(nombre_usuario) = 'admin';

INSERT INTO public.usuarios (nombre_usuario, correo, contrasena, estado, rol_id) VALUES 
('profesor1', 'profesor1@colegio.com', '$2b$10$8/.n0WirE8wiS34JGY1N/.ZNgH4NByGC7ZB1g15XTCVLjZdtUhkd.', 'ACTIVO', 2),
('alumno1',   'alumno1@colegio.com',   '$2b$10$8/.n0WirE8wiS34JGY1N/.ZNgH4NByGC7ZB1g15XTCVLjZdtUhkd.', 'ACTIVO', 3),
('encargado1', 'encargado1@colegio.com', '$2b$10$8/.n0WirE8wiS34JGY1N/.ZNgH4NByGC7ZB1g15XTCVLjZdtUhkd.', 'ACTIVO', 4);

select * from usuarios


--poblar

--------------------------------------------------------------------------------
-- 1. LIMPIEZA INICIAL (ELIMINAR TABLAS EXISTENTES EN ORDEN CORRECTO)
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.notas CASCADE;
DROP TABLE IF EXISTS public.inscripciones CASCADE;
DROP TABLE IF EXISTS public.alumno_encargado CASCADE;
DROP TABLE IF EXISTS public.asignaciones_profesor CASCADE;
DROP TABLE IF EXISTS public.asignaturas CASCADE;
DROP TABLE IF EXISTS public.secciones CASCADE;
DROP TABLE IF EXISTS public.grados CASCADE;
DROP TABLE IF EXISTS public.bitacora_sistema CASCADE;
DROP TABLE IF EXISTS public.alumnos CASCADE;
DROP TABLE IF EXISTS public.encargados CASCADE;
DROP TABLE IF EXISTS public.profesores CASCADE;
DROP TABLE IF EXISTS public.ciclos_escolares CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

--------------------------------------------------------------------------------
-- 2. CREACIÓN DE TABLAS (DDL)
--------------------------------------------------------------------------------
CREATE TABLE public.roles (
    id serial NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text,
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_nombre_key UNIQUE (nombre)
);

CREATE TABLE public.usuarios (
    id serial NOT NULL,
    nombre_usuario character varying(50) NOT NULL,
    correo character varying(100) NOT NULL,
    contrasena character varying(255) NOT NULL,
    estado character varying(20) NOT NULL DEFAULT 'ACTIVO',
    rol_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_correo_key UNIQUE (correo),
    CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario),
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES public.roles (id)
);

CREATE TABLE public.ciclos_escolares (
    id serial NOT NULL,
    anio integer NOT NULL,
    estado character varying(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT ciclos_escolares_pkey PRIMARY KEY (id),
    CONSTRAINT ciclos_escolares_anio_key UNIQUE (anio)
);

CREATE TABLE public.grados (
    id serial NOT NULL,
    nombre character varying(50) NOT NULL,
    nivel character varying(50),
    estado character varying(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT grados_pkey PRIMARY KEY (id)
);

CREATE TABLE public.secciones (
    id serial NOT NULL,
    nombre character varying(10) NOT NULL,
    grado_id integer NOT NULL,
    estado character varying(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT secciones_pkey PRIMARY KEY (id),
    CONSTRAINT uq_seccion_grado UNIQUE (nombre, grado_id),
    CONSTRAINT fk_secciones_grados FOREIGN KEY (grado_id) REFERENCES public.grados (id)
);

CREATE TABLE public.asignaturas (
    id serial NOT NULL,
    codigo character varying(30) NOT NULL,
    nombre character varying(100) NOT NULL,
    grado_id integer NOT NULL,
    estado character varying(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT asignaturas_pkey PRIMARY KEY (id),
    CONSTRAINT asignaturas_codigo_key UNIQUE (codigo),
    CONSTRAINT fk_asignaturas_grados FOREIGN KEY (grado_id) REFERENCES public.grados (id)
);

CREATE TABLE public.profesores (
    id serial NOT NULL,
    codigo character varying(30) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    telefono character varying(20),
    correo character varying(100),
    estado character varying(20) NOT NULL DEFAULT 'ACTIVO',
    usuario_id integer,
    CONSTRAINT profesores_pkey PRIMARY KEY (id),
    CONSTRAINT profesores_codigo_key UNIQUE (codigo),
    CONSTRAINT profesores_usuario_id_key UNIQUE (usuario_id),
    CONSTRAINT fk_profesores_usuarios FOREIGN KEY (usuario_id) REFERENCES public.usuarios (id)
);

CREATE TABLE public.alumnos (
    id serial NOT NULL,
    codigo character varying(30) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    fecha_nacimiento date,
    direccion text,
    telefono character varying(20),
    estado character varying(20) NOT NULL DEFAULT 'ACTIVO',
    usuario_id integer,
    CONSTRAINT alumnos_pkey PRIMARY KEY (id),
    CONSTRAINT alumnos_codigo_key UNIQUE (codigo),
    CONSTRAINT alumnos_usuario_id_key UNIQUE (usuario_id),
    CONSTRAINT fk_alumnos_usuarios FOREIGN KEY (usuario_id) REFERENCES public.usuarios (id)
);

CREATE TABLE public.encargados (
    id serial NOT NULL,
    dpi character varying(20),
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    telefono character varying(20),
    direccion text,
    correo character varying(100),
    usuario_id integer,
    CONSTRAINT encargados_pkey PRIMARY KEY (id),
    CONSTRAINT encargados_usuario_id_key UNIQUE (usuario_id),
    CONSTRAINT fk_encargados_usuarios FOREIGN KEY (usuario_id) REFERENCES public.usuarios (id)
);

CREATE TABLE public.alumno_encargado (
    id serial NOT NULL,
    alumno_id integer NOT NULL,
    encargado_id integer NOT NULL,
    parentesco character varying(50) NOT NULL,
    CONSTRAINT alumno_encargado_pkey PRIMARY KEY (id),
    CONSTRAINT uq_alumno_encargado UNIQUE (alumno_id, encargado_id),
    CONSTRAINT fk_alumno_encargado_alumno FOREIGN KEY (alumno_id) REFERENCES public.alumnos (id),
    CONSTRAINT fk_alumno_encargado_encargado FOREIGN KEY (encargado_id) REFERENCES public.encargados (id)
);

CREATE TABLE public.asignaciones_profesor (
    id serial NOT NULL,
    profesor_id integer NOT NULL,
    asignatura_id integer NOT NULL,
    grado_id integer NOT NULL,
    seccion_id integer NOT NULL,
    ciclo_escolar_id integer NOT NULL,
    estado character varying(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT asignaciones_profesor_pkey PRIMARY KEY (id),
    CONSTRAINT uq_asignacion_profesor UNIQUE (profesor_id, asignatura_id, grado_id, seccion_id, ciclo_escolar_id),
    CONSTRAINT fk_asignaciones_profesores FOREIGN KEY (profesor_id) REFERENCES public.profesores (id),
    CONSTRAINT fk_asignaciones_asignaturas FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas (id),
    CONSTRAINT fk_asignaciones_grados FOREIGN KEY (grado_id) REFERENCES public.grados (id),
    CONSTRAINT fk_asignaciones_secciones FOREIGN KEY (seccion_id) REFERENCES public.secciones (id),
    CONSTRAINT fk_asignaciones_ciclos FOREIGN KEY (ciclo_escolar_id) REFERENCES public.ciclos_escolares (id)
);

CREATE TABLE public.inscripciones (
    id serial NOT NULL,
    alumno_id integer NOT NULL,
    ciclo_escolar_id integer NOT NULL,
    grado_id integer NOT NULL,
    seccion_id integer NOT NULL,
    fecha_inscripcion date NOT NULL DEFAULT CURRENT_DATE,
    estado character varying(20) NOT NULL DEFAULT 'INSCRITO',
    CONSTRAINT inscripciones_pkey PRIMARY KEY (id),
    CONSTRAINT uq_inscripcion_alumno_ciclo UNIQUE (alumno_id, ciclo_escolar_id),
    CONSTRAINT fk_inscripciones_alumnos FOREIGN KEY (alumno_id) REFERENCES public.alumnos (id),
    CONSTRAINT fk_inscripciones_ciclos FOREIGN KEY (ciclo_escolar_id) REFERENCES public.ciclos_escolares (id),
    CONSTRAINT fk_inscripciones_grados FOREIGN KEY (grado_id) REFERENCES public.grados (id),
    CONSTRAINT fk_inscripciones_secciones FOREIGN KEY (seccion_id) REFERENCES public.secciones (id)
);

CREATE TABLE public.notas (
    id serial NOT NULL,
    alumno_id integer NOT NULL,
    asignatura_id integer NOT NULL,
    profesor_id integer NOT NULL,
    ciclo_escolar_id integer NOT NULL,
    unidad character varying(30) NOT NULL,
    nota numeric(5, 2) NOT NULL,
    fecha_registro date NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT notas_pkey PRIMARY KEY (id),
    CONSTRAINT uq_nota_alumno_asignatura_unidad UNIQUE (alumno_id, asignatura_id, ciclo_escolar_id, unidad),
    CONSTRAINT fk_notas_alumnos FOREIGN KEY (alumno_id) REFERENCES public.alumnos (id),
    CONSTRAINT fk_notas_asignaturas FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas (id),
    CONSTRAINT fk_notas_profesores FOREIGN KEY (profesor_id) REFERENCES public.profesores (id),
    CONSTRAINT fk_notas_ciclos FOREIGN KEY (ciclo_escolar_id) REFERENCES public.ciclos_escolares (id)
);

CREATE TABLE public.bitacora_sistema (
    id serial NOT NULL,
    usuario_id integer,
    accion character varying(100) NOT NULL,
    descripcion text,
    fecha_hora timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bitacora_sistema_pkey PRIMARY KEY (id),
    CONSTRAINT fk_bitacora_usuarios FOREIGN KEY (usuario_id) REFERENCES public.usuarios (id)
);

--------------------------------------------------------------------------------
-- 3. INSERCIÓN DE 5 REGISTROS POR TABLA (DML)
--------------------------------------------------------------------------------

-- 1. Roles
INSERT INTO public.roles (id, nombre, descripcion) VALUES
(1, 'ADMINISTRADOR', 'Acceso total al sistema'),
(2, 'PROFESOR', 'Gestión de clases, notas y asignaciones'),
(3, 'ALUMNO', 'Consulta de notas y materias'),
(4, 'ENCARGADO', 'Seguimiento de alumnos a su cargo'),
(5, 'SECRETARIA', 'Gestión administrativa e inscripciones');

-- 2. Usuarios (Todos con contraseña 'admin123' encriptada con bcryptjs)
INSERT INTO public.usuarios (id, nombre_usuario, correo, contrasena, estado, rol_id) VALUES
(1, 'admin', 'admin@colegio.com', '$2b$10$8/.n0WirE8wiS34JGY1N/.ZNgH4NByGC7ZB1g15XTCVLjZdtUhkd.', 'ACTIVO', 1),
(2, 'profesor1', 'profesor1@colegio.com', '$2b$10$8/.n0WirE8wiS34JGY1N/.ZNgH4NByGC7ZB1g15XTCVLjZdtUhkd.', 'ACTIVO', 2),
(3, 'alumno1', 'alumno1@colegio.com', '$2b$10$8/.n0WirE8wiS34JGY1N/.ZNgH4NByGC7ZB1g15XTCVLjZdtUhkd.', 'ACTIVO', 3),
(4, 'encargado1', 'encargado1@colegio.com', '$2b$10$8/.n0WirE8wiS34JGY1N/.ZNgH4NByGC7ZB1g15XTCVLjZdtUhkd.', 'ACTIVO', 4),
(5, 'secretaria1', 'secretaria@colegio.com', '$2b$10$8/.n0WirE8wiS34JGY1N/.ZNgH4NByGC7ZB1g15XTCVLjZdtUhkd.', 'ACTIVO', 5);

-- 3. Ciclos Escolares
INSERT INTO public.ciclos_escolares (id, anio, estado) VALUES
(1, 2022, 'CERRADO'),
(2, 2023, 'CERRADO'),
(3, 2024, 'CERRADO'),
(4, 2025, 'CERRADO'),
(5, 2026, 'ACTIVO');

-- 4. Grados
INSERT INTO public.grados (id, nombre, nivel, estado) VALUES
(1, 'Primero', 'Primaria', 'ACTIVO'),
(2, 'Segundo', 'Primaria', 'ACTIVO'),
(3, 'Tercero', 'Primaria', 'ACTIVO'),
(4, 'Primero', 'Básico', 'ACTIVO'),
(5, 'Segundo', 'Básico', 'ACTIVO');

-- 5. Secciones
INSERT INTO public.secciones (id, nombre, grado_id, estado) VALUES
(1, 'A', 1, 'ACTIVO'),
(2, 'B', 1, 'ACTIVO'),
(3, 'A', 2, 'ACTIVO'),
(4, 'A', 4, 'ACTIVO'),
(5, 'B', 4, 'ACTIVO');

-- 6. Asignaturas
INSERT INTO public.asignaturas (id, codigo, nombre, grado_id, estado) VALUES
(1, 'MAT-101', 'Matemáticas I', 1, 'ACTIVO'),
(2, 'LENG-101', 'Lenguaje I', 1, 'ACTIVO'),
(3, 'CIEN-101', 'Ciencias Naturales I', 1, 'ACTIVO'),
(4, 'MAT-401', 'Matemáticas Avanzadas', 4, 'ACTIVO'),
(5, 'HIST-401', 'Historia Universal', 4, 'ACTIVO');

-- 7. Profesores
INSERT INTO public.profesores (id, codigo, nombres, apellidos, telefono, correo, estado, usuario_id) VALUES
(1, 'PROF-001', 'Carlos Roberto', 'Mendoza Gómez', '55512345', 'profesor1@colegio.com', 'ACTIVO', 2),
(2, 'PROF-002', 'Ana María', 'López Pérez', '55523456', 'ana.lopez@colegio.com', 'ACTIVO', NULL),
(3, 'PROF-003', 'Jorge Luis', 'Martínez Ruiz', '55534567', 'jorge.martinez@colegio.com', 'ACTIVO', NULL),
(4, 'PROF-004', 'Lilian Elizabeth', 'Sánchez Castro', '55545678', 'lilian.sanchez@colegio.com', 'ACTIVO', NULL),
(5, 'PROF-005', 'Mario Rene', 'García Estrada', '55556789', 'mario.garcia@colegio.com', 'ACTIVO', NULL);

-- 8. Alumnos
INSERT INTO public.alumnos (id, codigo, nombres, apellidos, fecha_nacimiento, direccion, telefono, estado, usuario_id) VALUES
(1, 'ALU-001', 'Juan Jose', 'Pérez Hernández', '2012-05-15', 'Zona 1, Ciudad', '44411111', 'ACTIVO', 3),
(2, 'ALU-002', 'María Fernanda', 'Gómez Morales', '2012-08-20', 'Zona 3, Ciudad', '44422222', 'ACTIVO', NULL),
(3, 'ALU-003', 'Luis Alberto', 'Rodríguez Álvarez', '2011-03-10', 'Zona 5, Ciudad', '44433333', 'ACTIVO', NULL),
(4, 'ALU-004', 'Sofia Isabel', 'Torres Castillo', '2013-01-25', 'Zona 10, Ciudad', '44444444', 'ACTIVO', NULL),
(5, 'ALU-005', 'Diego Alejandro', 'Vásquez Ramos', '2011-11-30', 'Zona 11, Ciudad', '44455555', 'ACTIVO', NULL);

-- 9. Encargados
INSERT INTO public.encargados (id, dpi, nombres, apellidos, telefono, direccion, correo, usuario_id) VALUES
(1, '2580123450101', 'Pedro Pablo', 'Pérez Girón', '33311111', 'Zona 1, Ciudad', 'encargado1@colegio.com', 4),
(2, '2580234560101', 'Carmen Julia', 'Morales de Gómez', '33322222', 'Zona 3, Ciudad', 'carmen.morales@gmail.com', NULL),
(3, '2580345670101', 'Roberto Jose', 'Rodríguez Solís', '33333333', 'Zona 5, Ciudad', 'roberto.rodriguez@gmail.com', NULL),
(4, '2580456780101', 'Patricia Elena', 'Castillo de Torres', '33344444', 'Zona 10, Ciudad', 'patricia.castillo@gmail.com', NULL),
(5, '2580567890101', 'Fernando Arturo', 'Vásquez Méndez', '33355555', 'Zona 11, Ciudad', 'fernando.vasquez@gmail.com', NULL);

-- 10. Alumno - Encargado
INSERT INTO public.alumno_encargado (id, alumno_id, encargado_id, parentesco) VALUES
(1, 1, 1, 'PADRE'),
(2, 2, 2, 'MADRE'),
(3, 3, 3, 'PADRE'),
(4, 4, 4, 'MADRE'),
(5, 5, 5, 'PADRE');

-- 11. Asignaciones Profesor
INSERT INTO public.asignaciones_profesor (id, profesor_id, asignatura_id, grado_id, seccion_id, ciclo_escolar_id, estado) VALUES
(1, 1, 1, 1, 1, 5, 'ACTIVO'),
(2, 2, 2, 1, 1, 5, 'ACTIVO'),
(3, 3, 3, 1, 2, 5, 'ACTIVO'),
(4, 4, 4, 4, 4, 5, 'ACTIVO'),
(5, 5, 5, 4, 5, 5, 'ACTIVO');

-- 12. Inscripciones
INSERT INTO public.inscripciones (id, alumno_id, ciclo_escolar_id, grado_id, seccion_id, fecha_inscripcion, estado) VALUES
(1, 1, 5, 1, 1, '2026-01-10', 'INSCRITO'),
(2, 2, 5, 1, 1, '2026-01-11', 'INSCRITO'),
(3, 3, 5, 1, 2, '2026-01-12', 'INSCRITO'),
(4, 4, 5, 4, 4, '2026-01-15', 'INSCRITO'),
(5, 5, 5, 4, 5, '2026-01-16', 'INSCRITO');

-- 13. Notas
INSERT INTO public.notas (id, alumno_id, asignatura_id, profesor_id, ciclo_escolar_id, unidad, nota, fecha_registro) VALUES
(1, 1, 1, 1, 5, 'Unidad 1', 85.50, '2026-03-15'),
(2, 1, 2, 2, 5, 'Unidad 1', 90.00, '2026-03-16'),
(3, 2, 1, 1, 5, 'Unidad 1', 78.25, '2026-03-15'),
(4, 3, 3, 3, 5, 'Unidad 1', 95.00, '2026-03-18'),
(5, 4, 4, 4, 5, 'Unidad 1', 88.00, '2026-03-20');

-- 14. Bitácora Sistema
INSERT INTO public.bitacora_sistema (id, usuario_id, accion, descripcion, fecha_hora) VALUES
(1, 1, 'INICIO_SESION', 'El usuario administrador inicio sesión', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(2, 1, 'CREACION_USUARIO', 'Se creo el usuario profesor1', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(3, 2, 'REGISTRO_NOTA', 'El profesor creo una nueva nota para el alumno 1', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(4, 3, 'CONSULTA_NOTAS', 'El alumno consulto su boletín de calificaciones', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(5, 1, 'INSCRIPCION', 'Se inscribió al alumno 5 para el ciclo 2026', CURRENT_TIMESTAMP);

--------------------------------------------------------------------------------
-- 4. AJUSTE DE SECUENCIAS (PARA PERMITIR NUEVOS INSERT AUTOMÁTICOS)
--------------------------------------------------------------------------------
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM public.roles));
SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM public.usuarios));
SELECT setval('ciclos_escolares_id_seq', (SELECT MAX(id) FROM public.ciclos_escolares));
SELECT setval('grados_id_seq', (SELECT MAX(id) FROM public.grados));
SELECT setval('secciones_id_seq', (SELECT MAX(id) FROM public.secciones));
SELECT setval('asignaturas_id_seq', (SELECT MAX(id) FROM public.asignaturas));
SELECT setval('profesores_id_seq', (SELECT MAX(id) FROM public.profesores));
SELECT setval('alumnos_id_seq', (SELECT MAX(id) FROM public.alumnos));
SELECT setval('encargados_id_seq', (SELECT MAX(id) FROM public.encargados));
SELECT setval('alumno_encargado_id_seq', (SELECT MAX(id) FROM public.alumno_encargado));
SELECT setval('asignaciones_profesor_id_seq', (SELECT MAX(id) FROM public.asignaciones_profesor));
SELECT setval('inscripciones_id_seq', (SELECT MAX(id) FROM public.inscripciones));
SELECT setval('notas_id_seq', (SELECT MAX(id) FROM public.notas));
SELECT setval('bitacora_sistema_id_seq', (SELECT MAX(id) FROM public.bitacora_sistema));

UPDATE public.usuarios 
SET contrasena = '$2b$10$NyJCC6.kQhC3BozEKu3R7Os2xvOJZVB1/brDyRvEPeDwYgEm3sgZu',
    estado = 'ACTIVO';

select * from roles

-- Actualizar nombres de roles a minúsculas / estándar
UPDATE public.roles SET nombre = 'admin' WHERE id = 1 OR nombre = 'ADMINISTRADOR';
UPDATE public.roles SET nombre = 'profesor' WHERE id = 2 OR nombre = 'PROFESOR';
UPDATE public.roles SET nombre = 'alumno' WHERE id = 3 OR nombre = 'ALUMNO';
UPDATE public.roles SET nombre = 'encargado' WHERE id = 4 OR nombre = 'ENCARGADO';