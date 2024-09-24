# Projeto de Reconhecimento de Placas com Login e Cadastro

Este projeto é uma aplicação Node.js que implementa funcionalidades de login e cadastro de usuários, juntamente com rotas POST que utilizam uma API de OCR para reconhecimento de placas de veículos.

## Funcionalidades

- **Cadastro de Usuários**: Permite que novos usuários se cadastrem na aplicação.
- **Login de Usuários**: Autenticação de usuários cadastrados.
- **Reconhecimento de Placas**: Utiliza uma API de OCR para reconhecer placas de veículos a partir de imagens enviadas.
- **Armazenamento de Dados**: Armazena informações de usuários e placas em um banco de dados MongoDB.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução para JavaScript no servidor.
- **Express**: Framework web para Node.js, usado para criar as rotas da aplicação.
- **Mongoose**: Biblioteca para modelar dados com MongoDB.
- **Bcryptjs**: Para criptografar senhas dos usuários.
- **Axios**: Para realizar requisições HTTP à API de OCR.
- **Multer**: Middleware para manipulação de arquivos enviados via formulário.
- **PDFKit**: Para geração de relatórios em PDF.