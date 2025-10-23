CREATE DATABASE loja_25_2;
USE loja_25_2;
CREATE TABLE produto {
    if INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
    nome VARCHAR(50) NOT NULL ,
    preco DOUBLE
};

INSERT INTO produto (nome, preco) VALUES
("Coca-Cola" , 9.89 ) ,
("Pepsi" , 7.59 ) ,
("Trakinas" , 3.99 );

CREATE TABLE categoria (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
    nome VARCHAR(50) NOT NULL
);
