-- Aina Database Schema v2
-- Conforme aux nouveaux diagrammes UML (Patient, Medecin, RendezVous, etc.)

CREATE DATABASE IF NOT EXISTS aina;
USE aina;

-- Geolocalisation
CREATE TABLE IF NOT EXISTS geolocalisation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  activee BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  geolocalisation_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (geolocalisation_id) REFERENCES geolocalisation(id) ON DELETE SET NULL
);

-- Medecins
CREATE TABLE IF NOT EXISTS medecins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  specialite VARCHAR(150),
  carte_professionnelle VARCHAR(255) UNIQUE,
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hopitaux
CREATE TABLE IF NOT EXISTS hopitaux (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  adresse VARCHAR(255),
  telephone VARCHAR(20),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pharmacies
CREATE TABLE IF NOT EXISTS pharmacies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  adresse VARCHAR(255),
  telephone VARCHAR(20),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Association Medecin <-> Hopital
CREATE TABLE IF NOT EXISTS hopital_medecin (
  hopital_id INT NOT NULL,
  medecin_id INT NOT NULL,
  PRIMARY KEY (hopital_id, medecin_id),
  FOREIGN KEY (hopital_id) REFERENCES hopitaux(id) ON DELETE CASCADE,
  FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

-- Association Medecin <-> Pharmacie
CREATE TABLE IF NOT EXISTS pharmacie_medecin (
  pharmacie_id INT NOT NULL,
  medecin_id INT NOT NULL,
  PRIMARY KEY (pharmacie_id, medecin_id),
  FOREIGN KEY (pharmacie_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
  FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

-- RendezVous
CREATE TABLE IF NOT EXISTS rendez_vous (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medecin_id INT NOT NULL,
  date_heure DATETIME NOT NULL,
  statut ENUM('en_attente', 'confirme', 'annule', 'termine') DEFAULT 'en_attente',
  motif VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

-- Alertes
CREATE TABLE IF NOT EXISTS alertes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medecin_id INT,
  type VARCHAR(50) DEFAULT 'urgence',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  statut ENUM('pending', 'accepted', 'refused', 'redirected') DEFAULT 'pending',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE SET NULL
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  medecin_id INT,
  contenu TEXT NOT NULL,
  statut ENUM('envoye', 'lu') DEFAULT 'envoye',
  date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

-- Paiements
CREATE TABLE IF NOT EXISTS paiements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medecin_id INT,
  montant DECIMAL(10, 2) NOT NULL,
  mode_paiement VARCHAR(50) DEFAULT 'carte',
  statut ENUM('en_attente', 'valide', 'echoue') DEFAULT 'en_attente',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE SET NULL
);

-- Formulaires
CREATE TABLE IF NOT EXISTS formulaires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  geolocalisation_id INT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (geolocalisation_id) REFERENCES geolocalisation(id) ON DELETE SET NULL
);

-- Parcours de Soins
CREATE TABLE IF NOT EXISTS parcours_de_soins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medecin_id INT NOT NULL,
  description TEXT,
  date_debut DATE NOT NULL,
  date_fin DATE,
  statut ENUM('en_cours', 'termine', 'annule') DEFAULT 'en_cours',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

-- Villages (conservé pour l'optimisation de parcours)
CREATE TABLE IF NOT EXISTS villages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  district VARCHAR(100),
  region VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data: Hopitaux Madagascar
INSERT INTO hopitaux (nom, adresse, telephone, latitude, longitude) VALUES
('CHU Antananarivo - Hôpital Joseph Raseta Befelatanana', 'Antananarivo', '+261 20 22 200 00', -18.9016, 47.5253),
('CHU Antananarivo - Hôpital Androva', 'Androva, Antananarivo', '+261 20 22 200 01', -18.8875, 47.4972),
('CHU Toamasina - Centre Hospitalier Universitaire', 'Toamasina', '+261 20 53 300 00', -18.1443, 49.3958),
('CHU Mahajanga - Centre Hospitalier Universitaire', 'Mahajanga', '+261 20 62 200 00', -15.7167, 46.3167),
('CHU Fianarantsoa - Centre Hospitalier Universitaire', 'Fianarantsoa', '+261 20 73 200 00', -21.4527, 47.0872),
('CHU Toliara - Centre Hospitalier Universitaire', 'Toliara', '+261 20 94 400 00', -23.3515, 43.6666),
('CENHOSOA - Centre Hospitalier de Soavinandriana', 'Soavinandriana, Antananarivo', '+261 20 22 400 00', -18.8902, 47.5087),
('Hôpital Manarapenitra', 'Anosy, Antananarivo', '+261 20 22 350 00', -18.9081, 47.5261);

-- Seed data: Pharmacies Madagascar
INSERT INTO pharmacies (nom, adresse, telephone, latitude, longitude) VALUES
('Pharmacie Centrale d\'Antananarivo', 'Avenue de l\'Indépendance, Antananarivo', '+261 20 22 200 10', -18.9045, 47.5204),
('Pharmacie Analakely', 'Analakely, Antananarivo', '+261 20 22 200 11', -18.9083, 47.5217),
('Pharmacie Toamasina Centre', 'Toamasina', '+261 20 53 300 10', -18.1468, 49.3932),
('Pharmacie Mahajanga', 'Mahajanga', '+261 20 62 200 10', -15.7190, 46.3140),
('Pharmacie Fianarantsoa', 'Fianarantsoa', '+261 20 73 200 10', -21.4540, 47.0850),
('Pharmacie Toliara', 'Toliara', '+261 20 94 400 10', -23.3530, 43.6640),
('Pharmacie Antsirabe', 'Antsirabe', '+261 20 44 400 10', -19.8645, 47.0333);

-- Seed data: Villages Madagascar
INSERT INTO villages (nom, latitude, longitude, district, region) VALUES
('Ambohimanga', -18.7591, 47.5628, 'Antananarivo Avaradrano', 'Analamanga'),
('Ambohidratrimo', -18.8111, 47.4542, 'Ambohidratrimo', 'Analamanga'),
('Andoharanofotsy', -18.9333, 47.5167, 'Antananarivo Atsimondrano', 'Analamanga'),
('Mahitsy', -18.8231, 47.4339, 'Ambohidratrimo', 'Analamanga'),
('Sabotsy Namehana', -18.8267, 47.5350, 'Antananarivo Avaradrano', 'Analamanga'),
('Alasora', -18.9186, 47.5478, 'Antananarivo Atsimondrano', 'Analamanga'),
('Ambohibao', -18.8464, 47.4864, 'Antananarivo Avaradrano', 'Analamanga'),
('Ankazobe', -18.3167, 47.1167, 'Ankazobe', 'Analamanga'),
('Andramasina', -19.1500, 47.5667, 'Andramasina', 'Analamanga'),
('Manjakandriana', -18.9167, 47.8000, 'Manjakandriana', 'Analamanga'),
('Moramanga', -18.9333, 48.2000, 'Moramanga', 'Alaotra-Mangoro'),
('Ambatondrazaka', -17.8333, 48.4167, 'Ambatondrazaka', 'Alaotra-Mangoro'),
('Toamasina Ville', -18.1443, 49.3958, 'Toamasina I', 'Atsinanana'),
('Brickaville', -18.8167, 49.0667, 'Brickaville', 'Atsinanana'),
('Vatomandry', -19.3333, 48.9833, 'Vatomandry', 'Atsinanana'),
('Mahanoro', -19.9000, 48.8000, 'Mahanoro', 'Atsinanana'),
('Antsirabe', -19.8645, 47.0333, 'Antsirabe I', 'Vakinankaratra'),
('Betafo', -19.8333, 46.8500, 'Betafo', 'Vakinankaratra'),
('Faratsiho', -19.4000, 46.9500, 'Faratsiho', 'Vakinankaratra'),
('Fianarantsoa', -21.4527, 47.0872, 'Fianarantsoa I', 'Haute Matsiatra'),
('Ambalavao', -21.8333, 46.9333, 'Ambalavao', 'Haute Matsiatra'),
('Mananjary', -21.2167, 48.3500, 'Mananjary', 'Vatovavy'),
('Nosy Varika', -20.5833, 48.5333, 'Nosy Varika', 'Vatovavy'),
('Mahajanga', -15.7167, 46.3167, 'Mahajanga I', 'Boeny'),
('Ambato-Boeny', -16.4500, 46.7167, 'Ambato-Boeny', 'Boeny'),
('Toliara', -23.3515, 43.6666, 'Toliara I', 'Atsimo-Andrefana'),
('Morondava', -20.2833, 44.2833, 'Morondava', 'Menabe'),
('Antsiranana', -12.2833, 49.2833, 'Antsiranana I', 'Diana'),
('Nosy Be', -13.3000, 48.2667, 'Nosy Be', 'Diana'),
('Sainte Marie', -16.9000, 49.9000, 'Sainte Marie', 'Analanjirofo'),
('Taolagnaro (Fort Dauphin)', -25.0325, 46.9833, 'Taolagnaro', 'Anosy'),
('Ihosy', -22.4000, 46.1167, 'Ihosy', 'Ihorombe'),
('Ambositra', -20.5167, 47.2500, 'Ambositra', 'Amoron\'i Mania');
