-- Eliminar base de datos si existe
DROP DATABASE IF EXISTS MedicalHistDB;
CREATE DATABASE MedicalHistDB;
USE MedicalHistDB;

-- Eliminar tablas si existen
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS image_annotations;
DROP TABLE IF EXISTS form_details;
DROP TABLE IF EXISTS samples;
DROP TABLE IF EXISTS tissue_types;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- Crear tabla de usuarios
CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       email VARCHAR(120) UNIQUE NOT NULL,
                       fullname VARCHAR(120) NOT NULL,
                       is_active BOOLEAN DEFAULT TRUE,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de roles
CREATE TABLE roles (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(80) UNIQUE NOT NULL,
                       description VARCHAR(255),
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de permisos
CREATE TABLE permissions (
                             id INT AUTO_INCREMENT PRIMARY KEY,
                             name VARCHAR(80) UNIQUE NOT NULL,
                             description VARCHAR(255),
                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de relación rol-permiso
CREATE TABLE role_permissions (
                                  role_id INT,
                                  permission_id INT,
                                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                  PRIMARY KEY (role_id, permission_id),
                                  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                                  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Crear tabla de relación usuario-rol
CREATE TABLE user_roles (
                            user_id INT,
                            role_id INT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (user_id, role_id),
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Crear tabla de tipos de tejido
CREATE TABLE tissue_types (
                              id INT AUTO_INCREMENT PRIMARY KEY,
                              name VARCHAR(100) NOT NULL,
                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de muestras
CREATE TABLE samples (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         code VARCHAR(50) NOT NULL UNIQUE,
                         description TEXT NOT NULL,
                         is_scanned BOOLEAN NOT NULL,
                         tissue_type_id INT,
                         dzi_path VARCHAR(255) NOT NULL,
                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         FOREIGN KEY (tissue_type_id) REFERENCES tissue_types(id)
);

-- Crear tabla para los detalles del formulario
CREATE TABLE form_details (
                              id INT AUTO_INCREMENT PRIMARY KEY,
                              sample_id INT NOT NULL,
                              patient_name VARCHAR(100) NOT NULL,
                              birth_date DATE NOT NULL,
                              patient_id VARCHAR(50) NOT NULL,
                              procedure_date DATETIME NOT NULL,
                              sample_type VARCHAR(50) NOT NULL,
                              anatomical_location VARCHAR(100) NOT NULL,
                              dimensions VARCHAR(100) NOT NULL,
                              texture VARCHAR(100) NOT NULL,
                              cell_type VARCHAR(50) NOT NULL,
                              ki67_index DECIMAL(5,2) NOT NULL,
                              her2_status VARCHAR(20) NOT NULL,
                              brca_type VARCHAR(20) NOT NULL,
                              tnm_classification VARCHAR(50) NOT NULL,
                              recommendations TEXT NOT NULL,
                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                              FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE
);

-- Crear tabla para las anotaciones de las imágenes
CREATE TABLE image_annotations (
                                   id INT AUTO_INCREMENT PRIMARY KEY,
                                   sample_id INT NOT NULL,
                                   user_id INT NOT NULL,
                                   annotation_data JSON NOT NULL,
                                   x FLOAT NOT NULL,
                                   y FLOAT NOT NULL,
                                   width FLOAT NOT NULL,
                                   height FLOAT NOT NULL,
                                   type VARCHAR(50) NOT NULL,
                                   text TEXT NOT NULL,
                                   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                   FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE,
                                   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar roles básicos
INSERT INTO roles (name, description) VALUES
                                          ('ADMIN', 'Administrador del sistema'),
                                          ('DOCTOR', 'Médico con acceso completo a historiales'),
                                          ('TECH', 'Técnico de laboratorio'),
                                          ('VIEWER', 'Usuario con permisos de solo lectura');

-- Insertar permisos básicos
INSERT INTO permissions (name, description) VALUES
                                                ('CREATE_ANNOTATION', 'Puede crear anotaciones'),
                                                ('EDIT_ANNOTATION', 'Puede editar anotaciones'),
                                                ('DELETE_ANNOTATION', 'Puede eliminar anotaciones'),
                                                ('VIEW_SAMPLES', 'Puede ver muestras'),
                                                ('MANAGE_USERS', 'Puede gestionar usuarios'),
                                                ('MANAGE_ROLES', 'Puede gestionar roles'),
                                                ('CREATE_SAMPLE', 'Puede crear muestras'),
                                                ('EDIT_SAMPLE', 'Puede editar muestras'),
                                                ('DELETE_SAMPLE', 'Puede eliminar muestras'),
                                                ('MANAGE_FORMS', 'Puede gestionar formularios');

-- Asignar permisos a roles
-- Admin tiene todos los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'ADMIN'),
    id
FROM permissions;

-- Doctor tiene permisos específicos
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'DOCTOR'),
    id
FROM permissions
WHERE name IN ('CREATE_ANNOTATION', 'EDIT_ANNOTATION', 'VIEW_SAMPLES', 'MANAGE_FORMS');

-- Técnico tiene permisos limitados
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'TECH'),
    id
FROM permissions
WHERE name IN ('CREATE_ANNOTATION', 'VIEW_SAMPLES');

-- Viewer solo puede ver
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'VIEWER'),
    id
FROM permissions
WHERE name IN ('VIEW_SAMPLES');

-- Insertar usuario de prueba (password: Password123!)
INSERT INTO users (username, password, email, fullname) VALUES
    ('admin', '$2a$10$tbdl6jQEVlAvZRfdnNIsx.twQmaOrfvgpZigZjgbhnr4at57N3tzy', 'admin@medical.com', 'Administrator');

-- Asignar rol de administrador al usuario admin
INSERT INTO user_roles (user_id, role_id)
VALUES (
           (SELECT id FROM users WHERE username = 'admin'),
           (SELECT id FROM roles WHERE name = 'ADMIN')
       );
-- Primero, agregar el nuevo permiso
INSERT INTO permissions (name, description) VALUES
    ('MANAGE_TISSUE_TYPES', 'Puede gestionar tipos de tejido');

-- Asignar el permiso al rol ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'DOCTOR'),
    (SELECT id FROM permissions WHERE name = 'MANAGE_TISSUE_TYPES');


-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_samples_tissue_type ON samples(tissue_type_id);
CREATE INDEX idx_form_details_sample ON form_details(sample_id);
CREATE INDEX idx_annotations_sample ON image_annotations(sample_id);
CREATE INDEX idx_annotations_user ON image_annotations(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);


-- Insertar tipos de tejido
INSERT INTO tissue_types (name) VALUES
                                   ('Tejido Epitelial'),
                                   ('Mucosa y Submucosa'),
                                   ('Tejido Conectivo'),
                                   ('Tejido Muscular'),
                                   ('Tejido Nervioso'),
                                   ('Venas y Arterias'),
                                   ('Órganos y Glándulas'),
                                   ('Mamíferos');

-- Insertar muestras para "TEJIDO EPITELIAL"
INSERT INTO samples (code, description, is_scanned, tissue_type_id, dzi_path) VALUES
                                                                                  ('312360', 'EPHITELIUM, SIMP SQUAM, HUMAN, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312360.dzi'),
                                                                                  ('312366', 'EPHITELIUM, SIMPLE CUBOIDAL, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312366.dzi'),
                                                                                  ('312426', 'EPHITELIUM, SIMP COL, HUMAN, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312426.dzi'),
                                                                                  ('312438', 'EPHITELIUM, SIMP CIL COL, HUMAN', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312438.dzi'),
                                                                                  ('312444', 'EPHITELIUM, GLANDULAR, HUMAN, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312444.dzi'),
                                                                                  ('312462', 'EPHITELIUM, TRANSITIONAL, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312462.dzi'),
                                                                                  ('312486', 'EPHITELIUM, PSEUDO CIL COL, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312486.dzi'),
                                                                                  ('312534', 'EPHITELIUM, STRAT SQU, HUMN, SMR', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312534.dzi'),
                                                                                  ('312540', 'EPHITELIUM, STRAT SQU, HUMAN, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312540.dzi'),
                                                                                  ('C312552', 'HUMAN KERATINIZED EPITHELIUM', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\C312552.dzi'),
                                                                                  ('312558', 'EPITHELIUM, STRAT COL, HMN, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312558.dzi'),
                                                                                  ('314522', 'SKIN, NONPIGMENTED, HUMAN, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314522.dzi'),
                                                                                  ('314528', 'SKIN, HEAVILY PIGMENT, HMN, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314528.dzi'),
                                                                                  ('314558', 'SKIN, PLANTAR, HUMAN, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314558.dzi'),
                                                                                  ('314595', 'SKIN SHOWING SWEAT GLANDS', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314595.dzi'),
                                                                                  ('314612', 'SCALP, HUMAN, LS', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314612.dzi'),
                                                                                  ('314998', 'ESOPHAGUS, EPITHELIUM, CS', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314998.dzi'),
                                                                                  ('31-2444', 'HUMAN GLANDULAR EPITHELIUM, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2444.dzi'),
                                                                                  ('31-2534', 'EPITHELIUM STRAT. SQUAMOUS HUMAN, SMEAR', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2534.dzi'),
                                                                                  ('31-2444_1', 'HUMAN GLANDULAR EPITHELIUM, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2444_1.dzi'),
                                                                                  ('314522_1', 'HUMAN SKIN NONPIGMENTED SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314522_1.dzi'),
                                                                                  ('314528_1', 'HUMAN SKIN PIGMENTED EPITHELIUM SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314528_1.dzi'),
                                                                                  ('314528_2', 'HUMAN SKIN PIGMENTED EPITHELIUM SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314528_2.dzi'),
                                                                                  ('314522_2', 'HUMAN SKIN NONPIGMENTED SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314522_2.dzi'),
                                                                                  ('31-2534_1', 'EPITHELIUM STRAT, SQUAMOUS GUMAN, SMEAR', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2534_1.dzi'),
                                                                                  ('31-2534_2', 'EPITHELIUM STRAT, SQUAMOUS GUMAN, SMEAR', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2534_2.dzi'),
                                                                                  ('31-2444_2', 'HUMAN GLANDULAR EPITHELIUM, SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2444_2.dzi'),
                                                                                  ('314522_3', 'HUMAN SKIN NONPIGMENTED SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314522_3.dzi'),
                                                                                  ('314528_3', 'HUUMAN, SKIN PIGMENTED EPITHELIUM SEC', TRUE, 1, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314528_3.dzi');

-- Insertar muestras para "MUCOSA Y SUBMUCOSA"
INSERT INTO samples (code, description, is_scanned, tissue_type_id, dzi_path) VALUES
                                                                                  ('31-2656', 'MUCOUS TISSUE, CS', TRUE, 2, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2656.dzi'),
                                                                                  ('313804', 'MEISSNER''S, PLEXUS, SEC', TRUE, 2, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313804.dzi');

-- Insertar muestras para "TEJIDO CONECTIVO"
INSERT INTO samples (code, description, is_scanned, tissue_type_id, dzi_path) VALUES
                                                                                  ('312668', 'RETICULAR TISSUE, SEC', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312668.dzi'),
                                                                                  ('312686', 'AREOLAR TISSUE, SPREAD', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312686.dzi'),
                                                                                  ('312728', 'ADIPOSE TISSUE, HUMAN, SEC', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312728.dzi'),
                                                                                  ('31-2752', 'ELASTIC TISSUE, LS', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2752.dzi'),
                                                                                  ('312764', 'ELASTIC TISSUE, HUMAN, VERH, SEC', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312764.dzi'),
                                                                                  ('312910', 'CARTILAGE, ELASTIC, SEC', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312910.dzi'),
                                                                                  ('312922', 'FIBROCARTILAGE, SEC', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312922.dzi'),
                                                                                  ('31-2946', 'BONE, SPONGY, HUMAN, SEC', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2946.dzi'),
                                                                                  ('31-2952', 'BONE, COMPACT, MAMMAL, CS', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2952.dzi'),
                                                                                  ('312958', 'BONE, COMPACT, MAMMAL, LS', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312958.dzi'),
                                                                                  ('312964', 'BONE, GROUND, CS', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312964.dzi'),
                                                                                  ('31-3012', 'BONE, DEVELOPING MEMBRANE, SEC', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-3012.dzi'),
                                                                                  ('313152', 'BLOOD, HUMAN H&E, SMEAR', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313152.dzi'),
                                                                                  ('313158', 'HUMAN BLOOD SMEAR WEIGHT\'S', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313158.dzi'),
('313170', 'BONE MARROW, SEC', TRUE, 3, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313170.dzi');

-- Insertar muestras para Tejido Muscular
INSERT INTO samples (code, description, is_scanned, tissue_type_id, dzi_path) VALUES
('313256', 'MUSCLE, SKELETAL, SEC', TRUE, 4, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313256.dzi'),
('313340', 'MUSCLE, SMOOTH, CS', TRUE, 4, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313340.dzi'),
('313364', 'MUSCLE, SMOOTH, HUMAN INTEST, LS', TRUE, 4, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313364.dzi'),
('313388', 'MUSCLE, CARDIAC, SEC', TRUE, 4, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313388.dzi');

-- Insertar muestras para Tejido Nervioso
INSERT INTO samples (code, description, is_scanned, tissue_type_id, dzi_path) VALUES
('313618', 'CEREBRUM, H & E, SEC', TRUE, 5, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313618.dzi'),
('313660', 'CEREBELLUM, H & E, SEC', TRUE, 5, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313660.dzi'),
('313708', 'SPINAL CORD, H & E, CS', TRUE, 5, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313708.dzi'),
('313726', 'SPINAL CORD, SILVER, CS', TRUE, 5, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313726.dzi'),
('313792', 'SPINAL GANG AND NERVE, LS', TRUE, 5, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313792.dzi'),
('314142', 'PURKINJE FIBERS, SEC', TRUE, 5, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314142.dzi'),
('314256', 'LYMPH NODE, SEC', TRUE, 5, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314256.dzi');

-- Insertar muestras para Venas y Arterias
INSERT INTO samples (code, description, is_scanned, tissue_type_id, dzi_path) VALUES
('313998', 'AORTA, HUMAN, H & E, CS', TRUE, 6, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313998.dzi'),
('314010', 'AORTA, HUMAN, VERH, CS', TRUE, 6, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314010.dzi'),
('314046', 'VENA CAVA, HUMAN, SEC', TRUE, 6, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314046.dzi'),
('314082', 'ARTERY AND VEIN, CS', TRUE, 6, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314082.dzi');

-- Insertar muestras para Órganos y Glándulas
INSERT INTO samples (code, description, is_scanned, tissue_type_id, dzi_path) VALUES
('C313840', 'CORNEA, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\C313840.dzi'),
('314304', 'TONSIL, LINGUAL, HUMAN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314304.dzi'),
('314382', 'THYMUS, HUMAN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314382.dzi'),
('314636', 'MAMMARY GLAND, RESTING, HMN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314636.dzi'),
('314642', 'MAMMARY GLAND, LACT, HMN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314642.dzi'),
('314788', 'PAPILLAE, FILIFORM, TONGUE, HMN', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314788.dzi'),
('314806', 'PAPILLAe, FUNGIFORM, TONGUE, HMN', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314806.dzi'),
('314902', 'PAROTID GLAND, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314902.dzi'),
('314962', 'SUBLINGUAL GLAND, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314962.dzi'),
('315076', 'STOMACH, CARDIAC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315076.dzi'),
('315082', 'STOMACH, FUNDIC, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315082.dzi'),
('315142', 'INTESTINE, SMALL, CS', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315142.dzi'),
('C315184', 'DUODENUM, LOWER, CS', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\C315184.dzi'),
('315214', 'JEJUNUM, HUMAN, CS', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315214.dzi'),
('315226', 'ILEUM, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315226.dzi'),
('315262', 'APPENDIX, HUMAN, CS', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315262.dzi'),
('315274', 'COLON, CS', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315274.dzi'),
('315358', 'LIVER, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315358.dzi'),
('315424', 'GALLBLADDER, BODY, HUMAN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315424.dzi'),
('315442', 'PANCREAS, MAMMAL, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315442.dzi'),
('CH8108', 'RECTUM', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\CH8108.dzi'),
('315612', 'TRACHEA, CS', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315612.dzi'),
('315670', 'LUNG, HUMAN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315670.dzi'),
('315860', 'BLADDER, CONTRACTED, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315860.dzi'),
('316012', 'GRAAFIAN FOLLICLES, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316012.dzi'),
('316030', 'CORPUS LUTEUM,SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316030.dzi'),
('316060', 'CORPUS ALBICANS, HUMAN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316060.dzi'),
('316102', 'FALLOPIAN TUBE, HUMAN, CS', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316102.dzi'),
('316150', 'UTERUS, PREGNANT', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316150.dzi'),
('316228', 'VAGINA,HUMAN,SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316228.dzi'),
('316240', 'PLACENTA,HUMAN,H&E,SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316240.dzi'),
('316458', 'EFFERENT TUBULES, HUMAN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316458.dzi'),
('316548', 'PROSTATE GLAND, OLDER, HUMAN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316548.dzi'),
('316566', 'PENIS, HUMAN, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316566.dzi'),
('316590', 'SPERM, HUMAN, SMEAR', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316590.dzi'),
('316670', 'HYPOPHYSIS, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316670.dzi'),
('31-4636', 'HUMAN RESTING MAMMARY GLAND SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-4636.dzi'),
('316718', 'THYROID&PARATHYROID GLAND, SEC', TRUE, 7, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316718.dzi');

-- Insertar muestras para Mamíferos
INSERT INTO samples (code, description, is_scanned, tissue_type_id, dzi_path) VALUES
('312788', 'TENDOM, MAMMAL, LS', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312788.dzi'),
('31-2806', 'MUSCLE-TENDOM JUNCT, MAMMAL, LS', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-2806.dzi'),
('312886', 'HYALINE CARTILAGE, MAMMAL, SEC', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\312886.dzi'),
('313570', 'GIANT MULTIPOLAR NEURON, MAMMAL', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\313570.dzi'),
('31-4016', 'ARTERY, MAMMAL, CS', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\31-4016.dzi'),
('314504', 'SKIN, MAMMAL, SEC', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314504.dzi'),
('314758', 'PAPILLAE, FOLIATE/TASTE BUD, MAM', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\314758.dzi'),
('315112', 'STOMACH, PYLORIC, MAMMAL, SEC', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315112.dzi'),
('315160', 'DUODENUM, MAMMAL, SEC', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315160.dzi'),
('315776', 'MAMMAL KIDNEY, MEDIAN SAG SET', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\315776.dzi'),
('316386', 'TESTIS, MAMMAL, H&E,SEC', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316386.dzi'),
('316464', 'EPIDIDYMIS,  MAMMAL, SEC', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316464.dzi'),
('C316524', 'MAMMAL SEMINAL VESICLE, SEC', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\C316524.dzi'),
('316750', 'MAMMAL ADRENAL GLAND', TRUE, 8, 'C:\\Users\\JOSSELYN\\Desktop\\TESIS DILAN\\DZI\\316750.dzi');


-- Insertar un nuevo detalle de formulario
INSERT INTO form_details (
    sample_id,
    patient_name,
    birth_date,
    patient_id,
    procedure_date,
    sample_type,
    anatomical_location,
    dimensions,
    texture,
    cell_type,
    ki67_index,
    her2_status,
    brca_type,
    tnm_classification,
    recommendations
) VALUES (
             1,  -- ID de la muestra
             'John Doe',
             '1980-01-01',
             'PAT123',
             '2024-10-23 10:00:00',
             'Biopsia',
             'Tejido Epitelial',
             '2x3cm',
             'Suave',
             'Escamoso',
             15.5,
             'Positivo',
             'BRCA1',
             'T2N0M0',
             'Seguimiento en 3 meses'
         );

-- Insertar una nueva anotación
INSERT INTO image_annotations (
    user_id,
    sample_id,
    annotation_data,
    x,
    y,
    width,
    height,
    type,
    text
) VALUES (
                1,  -- ID del usuario
             1,  -- ID de la muestra
             '{"type": "rectangle", "properties": {"color": "red"}}',
             100.5,
             200.3,
             50.0,
             30.0,
             'rectangle',
             'Área de interés con células anormales'
         );

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);



