# LigaPro – Gestor de Torneos Deportivos

Aplicación web inspirada en Copa Fácil para crear y administrar torneos, equipos, partidos y clasificaciones en tiempo real.

## Estructura del proyecto

```
ligapro/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos
├── js/
│   ├── firebase-config.js  # ← Configura Firebase aquí
│   ├── data.js             # Capa de datos (local + Firestore)
│   └── app.js              # Lógica de la interfaz
└── README.md
```

## 1. Probar en local (sin Firebase)

Abre `index.html` en el navegador o usa un servidor local:

```bash
# Desde la carpeta ligapro
npx serve .
# o
python3 -m http.server 8080
```

Los datos se guardan en `localStorage` del navegador.

## 2. Configurar Firebase (tiempo real)

1. Entra en [Firebase Console](https://console.firebase.google.com) y crea un proyecto.
2. Añade una **app web** y copia la configuración.
3. Crea una base de datos **Firestore** (modo de prueba al inicio).
4. Abre `js/firebase-config.js` y pega tus datos:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc"
};

const USE_FIREBASE = true;  // ← activar
```

5. En Firestore → Reglas (para desarrollo):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> En producción activa Authentication y restringe las reglas.

6. Colección usada: `tournaments`  
   Cada documento es un torneo (id, name, sport, teams, matches, players, etc.).

Con `USE_FIREBASE = true`, cualquier cambio (crear torneo, resultado, equipo…) se sincroniza en tiempo real entre todos los dispositivos que tengan la app abierta.

## 3. Subir a GitHub Pages

1. Crea un repositorio en GitHub (ej: `ligapro`).
2. Sube todo el contenido de la carpeta `ligapro`:

```bash
cd ligapro
git init
git add .
git commit -m "LigaPro inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ligapro.git
git push -u origin main
```

3. En el repositorio: **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` / carpeta `/ (root)`
4. Espera 1–2 minutos. La URL será:
   `https://TU_USUARIO.github.io/ligapro/`

Si el repo se llama `usuario.github.io`, la app queda en la raíz del dominio.

## 4. Funcionalidades

- Crear torneos (liga, grupos + eliminatorias, solo eliminatorias)
- Varios deportes con **criterios de clasificación oficiales** (FIFA, FIBA, FIVB, IHF…)
- Equipos, partidos, resultados y tabla en vivo
- Goleadores, asistencias y tarjetas
- Generación automática de calendario (todos contra todos)
- Patrocinadores y configuración del torneo
- Datos en tiempo real con Firebase Firestore

## 5. Próximos pasos opcionales

- Firebase Authentication (login de organizadores)
- Roles (admin / moderador)
- Subida de escudos e imágenes (Firebase Storage)
- PWA (instalable en el móvil)

---

LigaPro – inspirado en la estructura de Copa Fácil.
