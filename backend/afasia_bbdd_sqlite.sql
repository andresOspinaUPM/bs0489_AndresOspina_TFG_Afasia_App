-- CREATE TABLE usuario (
--     dni TEXT PRIMARY KEY,
--     nombre TEXT NOT NULL,
--     apellidos TEXT NOT NULL,
--     email TEXT NOT NULL,
--     contrasena TEXT NOT NULL,
--     centro_medico TEXT NOT NULL,
--     fecha_registro DATETIME DEFAULT (datetime('now', 'localtime'))
-- );

-- CREATE TABLE medico (
--     dni_medico TEXT PRIMARY KEY,
--     FOREIGN KEY (dni_medico) REFERENCES usuario(dni) ON DELETE CASCADE
-- );

-- CREATE TABLE paciente (
--     dni_paciente TEXT PRIMARY KEY,
--     sexo TEXT CHECK(sexo IN ('Hombre', 'Mujer', 'Otro')) NOT NULL,
--     fecha_nacimiento DATE NOT NULL,
--     dni_medico TEXT NOT NULL,
--     FOREIGN KEY (dni_paciente) REFERENCES usuario(dni) ON DELETE CASCADE,
--     FOREIGN KEY (dni_medico) REFERENCES medico(dni_medico) ON DELETE CASCADE
-- );

-- CREATE TABLE palabra(
--     id_palabra INTEGER PRIMARY KEY AUTOINCREMENT,
--     id_imagen INTEGER NULL,
--     nombre_palabra TEXT NOT NULL,
--     nivel TEXT CHECK(nivel IN ('Facil', 'Medio', 'Dificil')) NOT NULL DEFAULT 'Facil',
--     FOREIGN KEY (id_imagen) REFERENCES imagen(id_imagen) ON DELETE SET NULL
-- );

-- CREATE TABLE imagen(
--     id_imagen INTEGER PRIMARY KEY AUTOINCREMENT,
--     ruta_imagen TEXT NOT NULL
-- );

-- CREATE TABLE sesion(
--     id_sesion INTEGER PRIMARY KEY AUTOINCREMENT,
--     nombre_sesion TEXT NOT NULL,
--     nivel TEXT CHECK(nivel IN ('Facil', 'Medio', 'Dificil')) NOT NULL DEFAULT 'Facil',
--     cantidad_pruebas INTEGER NOT NULL,
--     imagenes_aleatorias BOOLEAN NOT NULL
-- );

-- CREATE TABLE prueba(
--     id_prueba INTEGER PRIMARY KEY AUTOINCREMENT,
--     id_palabra INTEGER NOT NULL,
--     tiempo_limite_por_prueba INTEGER NOT NULL,
--     FOREIGN KEY (id_palabra) REFERENCES palabra(id_palabra) ON DELETE CASCADE
-- );

-- CREATE TABLE configuracion_sesion(
--     id_medico TEXT NOT NULL,
--     id_paciente TEXT NOT NULL,
--     id_sesion INTEGER NOT NULL,
--     PRIMARY KEY (id_medico, id_paciente, id_sesion),
--     FOREIGN KEY (id_medico) REFERENCES medico(dni_medico) ON DELETE CASCADE,
--     FOREIGN KEY (id_paciente) REFERENCES paciente(dni_paciente) ON DELETE CASCADE,
--     FOREIGN KEY (id_sesion) REFERENCES Sesion(id_sesion) ON DELETE CASCADE
-- );


-- CREATE TABLE sesion_prueba(
--     id_sesion INTEGER NOT NULL,
--     id_prueba INTEGER NOT NULL,
--     PRIMARY KEY(id_sesion, id_prueba),
--     FOREIGN KEY (id_sesion) REFERENCES Sesion(id_sesion) ON DELETE CASCADE,
--     FOREIGN KEY (id_prueba) REFERENCES prueba(id_prueba) ON DELETE CASCADE
-- );

-- CREATE TABLE paciente_realiza_sesion(
--     id_paciente TEXT NOT NULL,
--     id_sesion INTEGER NOT NULL,
--     PRIMARY KEY (id_paciente, id_sesion),
--     FOREIGN KEY (id_paciente) REFERENCES paciente(dni_paciente) ON DELETE CASCADE,
--     FOREIGN KEY (id_sesion) REFERENCES Sesion(id_sesion) ON DELETE CASCADE
-- );

-- CREATE TABLE paciente_responde_prueba(
--     id_paciente TEXT NOT NULL,
--     id_prueba INTEGER NOT NULL,
--     fecha DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
--     tiempo_respuesta TEXT NOT NULL,
--     respuesta_correcta INTEGER NOT NULL CHECK(respuesta_correcta IN (0,1)),
--     PRIMARY KEY (id_paciente, id_prueba),
--     FOREIGN KEY (id_paciente) REFERENCES paciente(dni_paciente) ON DELETE CASCADE,
--     FOREIGN KEY (id_prueba) REFERENCES prueba(id_prueba) ON DELETE CASCADE
-- );

CREATE TABLE usuario (
    dni TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL,
    contrasena TEXT NOT NULL,
    centro_medico TEXT NOT NULL,
    fecha_registro DATETIME DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE medico (
    dni_medico TEXT PRIMARY KEY,
    FOREIGN KEY (dni_medico) REFERENCES usuario(dni) ON DELETE CASCADE
);

CREATE TABLE paciente (
    dni_paciente TEXT PRIMARY KEY,
    sexo TEXT CHECK(sexo IN ('Hombre', 'Mujer', 'Otro')) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    dni_medico TEXT NOT NULL,
    FOREIGN KEY (dni_paciente) REFERENCES usuario(dni) ON DELETE CASCADE,
    FOREIGN KEY (dni_medico) REFERENCES medico(dni_medico) ON DELETE CASCADE
);

CREATE TABLE imagen(
    id_imagen INTEGER PRIMARY KEY AUTOINCREMENT,
    ruta_imagen TEXT NOT NULL
);

CREATE TABLE palabra(
    id_palabra INTEGER PRIMARY KEY AUTOINCREMENT,
    id_imagen INTEGER NULL,
    nombre_palabra TEXT NOT NULL,
    nivel TEXT CHECK(nivel IN ('Facil', 'Medio', 'Dificil')) NOT NULL DEFAULT 'Facil',
    FOREIGN KEY (id_imagen) REFERENCES imagen(id_imagen) ON DELETE SET NULL
);

CREATE TABLE sesion(
    id_sesion INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_sesion TEXT NOT NULL,
    nivel TEXT CHECK(nivel IN ('Facil', 'Medio', 'Dificil')) NOT NULL DEFAULT 'Facil',
    cantidad_pruebas INTEGER NOT NULL,
    tiempo_limite_por_prueba INTEGER NOT NULL,
    imagenes_aleatorias BOOLEAN NOT NULL
);

CREATE TABLE sesion_prueba_predefinida(
    id_sesion INTEGER NOT NULL,
    id_palabra INTEGER NOT NULL,
    orden_prueba INTEGER NOT NULL,
    PRIMARY KEY(id_sesion, id_palabra),
    FOREIGN KEY (id_sesion) REFERENCES sesion(id_sesion) ON DELETE CASCADE,
    FOREIGN KEY (id_palabra) REFERENCES palabra(id_palabra) ON DELETE CASCADE
);

CREATE TABLE configuracion_sesion(
    id_medico TEXT NOT NULL,
    id_paciente TEXT NOT NULL,
    id_sesion INTEGER NOT NULL,
    PRIMARY KEY (id_medico, id_paciente, id_sesion),
    FOREIGN KEY (id_medico) REFERENCES medico(dni_medico) ON DELETE CASCADE,
    FOREIGN KEY (id_paciente) REFERENCES paciente(dni_paciente) ON DELETE CASCADE,
    FOREIGN KEY (id_sesion) REFERENCES sesion(id_sesion) ON DELETE CASCADE
);

CREATE TABLE instancia_sesion(
    id_instancia INTEGER PRIMARY KEY AUTOINCREMENT,
    id_sesion INTEGER NOT NULL,
    id_paciente TEXT NOT NULL,
    fecha_inicio DATETIME DEFAULT (datetime('now', 'localtime')),
    fecha_fin DATETIME,
    completada BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_sesion) REFERENCES sesion(id_sesion) ON DELETE CASCADE,
    FOREIGN KEY (id_paciente) REFERENCES paciente(dni_paciente) ON DELETE CASCADE
);

CREATE TABLE registro_prueba_generada(
    id_prueba INTEGER PRIMARY KEY AUTOINCREMENT,
    id_instancia INTEGER NOT NULL,
    id_palabra INTEGER NOT NULL,
    orden_prueba INTEGER NOT NULL,
    tiempo_limite INTEGER NOT NULL,
    FOREIGN KEY (id_instancia) REFERENCES instancia_sesion(id_instancia) ON DELETE CASCADE,
    FOREIGN KEY (id_palabra) REFERENCES palabra(id_palabra) ON DELETE CASCADE
);

CREATE TABLE respuesta_prueba(
    id_respuesta INTEGER PRIMARY KEY AUTOINCREMENT,
    id_prueba INTEGER NOT NULL,
    fecha_respuesta DATETIME DEFAULT (datetime('now', 'localtime')),
    tiempo_respuesta INTEGER NOT NULL,
    respuesta_correcta BOOLEAN NOT NULL,
    FOREIGN KEY (id_prueba) REFERENCES prueba_generada(id_prueba) ON DELETE CASCADE
);

-- Resto de tablas de categorías/propiedades

CREATE TABLE categoria(
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL
);

CREATE TABLE uso(
    id_uso INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL
);

CREATE TABLE accion(
    id_accion INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL
);

CREATE TABLE propiedad(
    id_propiedad INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL
);

CREATE TABLE localizacion(
    id_localizacion INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL
);

CREATE TABLE asociacion(
    id_asociacion INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL
);

-- Tablas de relación palabra-características

CREATE TABLE palabra_categoria(
    id_palabra INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    PRIMARY KEY (id_palabra, id_categoria),
    FOREIGN KEY (id_palabra) REFERENCES palabra(id_palabra) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE
);

CREATE TABLE palabra_uso(
    id_palabra INTEGER NOT NULL,
    id_uso INTEGER NOT NULL,
    PRIMARY KEY (id_palabra, id_uso),
    FOREIGN KEY (id_palabra) REFERENCES palabra(id_palabra) ON DELETE CASCADE,
    FOREIGN KEY (id_uso) REFERENCES uso(id_uso) ON DELETE CASCADE
);

CREATE TABLE palabra_accion(
    id_palabra INTEGER NOT NULL,
    id_accion INTEGER NOT NULL,
    PRIMARY KEY (id_palabra, id_accion),
    FOREIGN KEY (id_palabra) REFERENCES palabra(id_palabra) ON DELETE CASCADE,
    FOREIGN KEY (id_accion) REFERENCES accion(id_accion) ON DELETE CASCADE
);

CREATE TABLE palabra_propiedad(
    id_palabra INTEGER NOT NULL,
    id_propiedad INTEGER NOT NULL,
    PRIMARY KEY (id_palabra, id_propiedad),
    FOREIGN KEY (id_palabra) REFERENCES palabra(id_palabra) ON DELETE CASCADE,
    FOREIGN KEY (id_propiedad) REFERENCES propiedad(id_propiedad) ON DELETE CASCADE
);

CREATE TABLE palabra_localizacion(
    id_palabra INTEGER NOT NULL,
    id_localizacion INTEGER NOT NULL,
    PRIMARY KEY (id_palabra, id_localizacion),
    FOREIGN KEY (id_palabra) REFERENCES palabra(id_palabra) ON DELETE CASCADE,
    FOREIGN KEY (id_localizacion) REFERENCES localizacion(id_localizacion) ON DELETE CASCADE
);

CREATE TABLE palabra_asociacion(
    id_palabra INTEGER NOT NULL,
    id_asociacion INTEGER NOT NULL,
    PRIMARY KEY (id_palabra, id_asociacion),
    FOREIGN KEY (id_palabra) REFERENCES palabra(id_palabra) ON DELETE CASCADE,
    FOREIGN KEY (id_asociacion) REFERENCES asociacion(id_asociacion) ON DELETE CASCADE
);