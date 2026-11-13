# ECOcontrol
Proyecto final.
 ECOControl 
Sistema Web de Diagnóstico y Asesoramiento Ambiental

ECOControl es un proyecto de desarrollo web que consiste en una consultora orientada a la sustentabilidad y al cuidado del medio ambiente, destinada principalmente a hogares y pequeños comercios.

El objetivo principal del proyecto es ayudar a las personas y organizaciones a mejorar sus hábitos ambientales mediante el análisis y la evaluación del consumo de recursos como la energía y el agua, además de la generación de residuos.

A través de un sistema web, los usuarios pueden registrarse, iniciar sesión, realizar diagnósticos ambientales y obtener recomendaciones personalizadas para reducir su impacto ambiental, optimizar el uso de los recursos y adoptar prácticas más sustentables.  

Objetivos del proyecto
- Promover el cuidado del medio ambiente.
- Fomentar el uso responsable del agua y la energía.
- Reducir la generación de residuos.
- Brindar diagnósticos y recomendaciones ambientales.
- Facilitar el seguimiento de las mejoras ambientales de cada cliente.

 Funcionalidades principales
- Página principal con información sobre la consultora.
- Registro e inicio de sesión de usuarios.
- Gestión de clientes.
- Diagnósticos ambientales.
- Cálculo de un Índice Eco (de 0 a 100).
- Resultados y recomendaciones personalizadas.
- Solicitud de asesorías.
- Seguimiento de los diagnósticos realizados.

## Tecnologías
| Capa | Tecnología |
|------|------------|
| Frontend | HTML5, CSS3 y JavaScript (sin frameworks) |
| Backend | PHP 8 |
| Base de datos | MySQL / MariaDB (XAMPP) |
| Control de versiones | Git y GitHub |

## Estructura del proyecto
```
ECOcontrol/
├── database/
│   └── ecocontrol.sql        Tablas y usuario de prueba
└── Frontend/
    ├── login.html            Pantalla de acceso (login, registro, recuperar)
    ├── index.html            Aplicación principal
    ├── css/                  styles.css, login.css
    ├── js/                   sesion.js, login.js, app.js
    ├── img/                  favicon, íconos y capturas de pantalla
    └── php/                  conexion, login, registro, logout, recuperar,
                              diagnosticos, asesoramiento, contacto
```

## Cómo usarlo

### Opción 1: con XAMPP (PHP + MySQL)
1. Copiar la carpeta del proyecto dentro de `C:\xampp\htdocs\ecocontrol`.
2. Encender **Apache** y **MySQL** desde el panel de XAMPP.
3. Entrar a `http://localhost/phpmyadmin`, pestaña **Importar**, y elegir `database/ecocontrol.sql`.
4. Abrir `http://localhost/ecocontrol/Frontend/login.html`.

Los datos de conexión están en `Frontend/php/conexion.php` (por defecto usuario `root` sin contraseña).

### Opción 2: sin servidor (para mostrar el proyecto)
Abrir `Frontend/login.html` con doble clic. Todo funciona igual, pero los usuarios y diagnósticos se guardan en el navegador (localStorage) en lugar de MySQL.

### Usuario de prueba
- Correo: `demo@ecocontrol.com`
- Contraseña: `eco123`

## Autor
Santiago Villalba
