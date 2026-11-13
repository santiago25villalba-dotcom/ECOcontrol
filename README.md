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
| Servicio de informes | Node.js (sin paquetes externos) |
| Base de datos | MySQL / MariaDB (XAMPP) |
| Control de versiones | Git y GitHub |

## Estructura del proyecto
```
ECOcontrol/
├── database/
│   └── ecocontrol.sql        Tablas y usuario de prueba
├── docs/                     Código destacado y matriz de pruebas
├── servicio-node/            Servicio de informes en Node.js
│   ├── servidor.js           Servidor HTTP (puerto 3000)
│   ├── informe.js            Arma el Informe de Resultado
│   ├── indice.js             Reglas del Índice Eco
│   └── pruebas/              Pruebas automáticas (npm test)
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

### Servicio de informes (Node.js)
Para usar el botón **Descargar informe** de la pantalla de resultado:
1. Instalar Node.js (versión 18 o superior) desde nodejs.org.
2. Abrir una terminal en la carpeta `servicio-node`.
3. Ejecutar `node servidor.js` (o `npm start`). Queda funcionando en `http://localhost:3000`.

No hace falta `npm install`: el servicio usa solo módulos que ya trae Node.js. Para correr sus pruebas: `npm test`.

### Opción 2: sin servidor (para mostrar el proyecto)
Abrir `Frontend/login.html` con doble clic. Todo funciona igual, pero los usuarios y diagnósticos se guardan en el navegador (localStorage) en lugar de MySQL.

### Usuarios de prueba
| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | `demo@ecocontrol.com` | `eco123` |
| Titular (administrador) | `admin@ecocontrol.com` | `admin123` |

## Código destacado
Los fragmentos de código más importantes, explicados, están en [docs/CODIGO.md](docs/CODIGO.md).

## Diseño UI/UX
Wireframes, paleta, tipografías y diseño responsivo en [docs/DISENO-UI-UX.md](docs/DISENO-UI-UX.md).

## Base de datos
El DER y el diccionario de datos están en [docs/BASE-DE-DATOS.md](docs/BASE-DE-DATOS.md).

## Matriz de pruebas
Las 43 pruebas realizadas, con su resultado, están en [docs/MATRIZ-DE-PRUEBAS.md](docs/MATRIZ-DE-PRUEBAS.md).

## Autor
Santiago Villalba
