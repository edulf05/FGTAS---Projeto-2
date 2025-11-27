CREATE DATABASE fgtas;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(100) NOT NULL UNIQUE,
    senha_usuario VARCHAR(255) NOT NULL,
    data_usuario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    editado_usuario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    adm_usuario TINYINT(1) NOT NULL DEFAULT 0,
    ativo BOLLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE usuarios
  ADD COLUMN data_usuario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER senha_usuario,
  ADD COLUMN editado_usuario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER data_usuario,
  ADD COLUMN adm_usuario TINYINT(1) NOT NULL DEFAULT 0 AFTER editado_usuario;



CREATE TRIGGER trg_criptografia_senha
SET NEW.senha_usuario = SHA2(NEW.senha_usuario, 256);



CREATE TABLE atendimentos (
    id_atendimento INT AUTO_INCREMENT PRIMARY KEY,
    data_hora_atendimento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forma_atendimento ENUM(
        'presencial', 
        'whatsapp', 
        'ligacao', 
        'email', 
        'redes-sociais', 
        'teams', 
        'outra'
    ) NOT NULL,
    perfil ENUM(
        'empregador', 
        'trabalhador', 
        'outras-agencias', 
        'ads', 
        'setores-fgtas', 
        'mercado-de-trabalho', 
        'outra'
    ) NOT NULL,
    nome_empregador VARCHAR(255) NULL,
    cnpj VARCHAR(18) NULL, 
    telefone_contato VARCHAR(20) NULL, 
    tipo_atendimento VARCHAR(255) NOT NULL,
    atendente_matricula VARCHAR(50) NOT NULL, 
    observacoes TEXT NULL
);

ALTER TABLE atendimentos
ADD CONSTRAINT fk_atendente_usuario
FOREIGN KEY (atendente_matricula)
REFERENCES usuarios(id_usuario)
ON UPDATE CASCADE  
ON DELETE RESTRICT; 