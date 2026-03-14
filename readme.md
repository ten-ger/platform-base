# Platform Base

Platform Base is ...

## Claude Code Specs

To help guide Claude Code in web component generation and code development in general, the following prompt can be used to establish a baseline structure for spec-driven development:

NOTE - update the section [[your intended purpose here]]

```bash
This project is intended to be a frontend-only utility app for [[your intended purpose here]]. 
The app is based on StencilJS as single page app, and it heavily uses Ionic components for app structure, routing, and the basis for many lower-level components.
To support data access and other consolidated logic, singleton services exist and should be created in src/services. Please review existing services to understand the common controller > service paradigm.
In the specs directory, information should be captured and organized to ensure standards are followed with component generation, API usage (if applicable), and local data management.
Whenever generating a new web component, always check the src/components/controls directory for reusable components with which to build a more sophisticated component.
Web components that represent pages are being generated, they should always go in the src/components/pages directory. Modals go in the src/components/modals directory.
Although Stencil is designed to leverage shadow DOM, most structural (i.e., flex) styles are defined in src/global/app.css to be applied application-wide.
Update specs with this information now, please.
```

## Getting Started

To run and develop the project locally, clone this repo to a new directory:

```bash
npm install
npm start
```

To build the app for production, run:

```bash
npm run build
```

To deploy the app to a Firebase project, configure the project according to the Firebase section below and run:

```bash
npm run deploy
```

## Firebase Setup

For convenience, this project assumes the app will be deployed to Firebase for web app hosting, firestore data management, and other services as needed.

- Log into the Firebase Console and create a new project.
- Under Settings > General > Your apps, click to associate a "Web" app, following the prompts to establish Firebase Hosting, if desired.
- When prompted to "Add Firebase SDK" copy the firebaseConfig information into src/services/firebase-app.ts
- If not already installed, follow the prompts to install Firebase CLI and log into Firebase. 