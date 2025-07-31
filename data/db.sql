CREATE DATABASE IF NOT EXISTS horus;
USE horus;

CREATE TABLE users (
  id VARCHAR(10) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE incidents (
  id VARCHAR(10) PRIMARY KEY,
  date DATETIME NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('em_andamento', 'concluido', 'pendente') NOT NULL
);

-- Inserção de exemplo
INSERT INTO users (id, username, password) VALUES
('1', 'admin', '123'),
('67bd', 'diego123', '1234'),
('b85c', 'diego1234', '1234');

INSERT INTO incidents (id, date, type, description, status) VALUES
('ff6c', '2025-06-25 18:42:00', 'queda de rede', 'sdhlaksj', 'em_andamento');

