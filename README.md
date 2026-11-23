# Portfolio — Alix Gouriet

Portfolio d'un étudiant en BUT Science des Données (parcours VCOD), pour une recherche de stage de 10 semaines à partir d'avril 2027. Site statique : React 19, TypeScript, Vite, Tailwind CSS 4, React Router.

## Lancer le site

Prérequis : Node.js récent et npm (testé avec Node 26 et npm 11).

```bash
cd portfolio
npm install
npm run dev
```

Le site s'ouvre sur http://localhost:5173.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | vérification TypeScript puis build dans `dist/` |
| `npm run preview` | sert le build localement |
| `npm run lint` | oxlint (jeu de règles réduit : 2 règles) |
| `npm test` | tests unitaires Vitest (calculs de la régression, cohérence des données) |
| `npm run test:e2e` | tests Playwright (navigation, menu, hero, liens, console, axe) sur 3 tailles d'écran |

Première utilisation des tests e2e : `npx playwright install chromium` (téléchargement d'environ 150 Mo). Pour tester le build : `npm run build` puis `PW_PREVIEW=1 npm run test:e2e`.

## Mettre à jour le contenu

Tout le contenu est dans le code, sans base de données.

- **Projets** : `src/data/projects.ts`. Un projet est soit `disponible` (avec `slug`, période, résumé, résultat, outils, compétences), soit `sans-fiche` (titre, sous-titre et technologies seulement : badge « Fiche en préparation », sans lien, sans page, sans preuve de compétence). Les dates passent par `when(année, mois)` (période, semestre dérivés).
- **Page d'une fiche** : `src/content/projects/<slug>.tsx`. Le `slug` du projet doit correspondre au nom du fichier.
- **Compétences** : `src/data/skills.ts`. La preuve d'une compétence est calculée à partir des outils des projets disponibles ; sans projet, elle s'affiche « Sur CV ».
- **Contact** : `src/data/contact.ts` (e-mail, téléphone, ville, CV). `linkedin: null` masque le lien ; renseigner l'URL pour l'afficher.
- **CV** : remplacer `public/cv-alix-gouriet.pdf`.
- **Couleurs, typographies, courbes d'animation** : variables en tête de `src/styles/index.css`. Le détail est dans `../documentation/DESIGN_SYSTEM_V4.md`.

Les filtres de projets (technologie, mois et année, semestre) n'apparaissent qu'à partir de 5 projets, avec ou sans fiche (`FILTER_THRESHOLD` dans `src/data/derive.ts`).

## Règles de contenu

- N'afficher que des faits vérifiables dans les documents du projet.
- Ne publier ni CSV de données, ni tableurs, ni documents Word bruts : ils contiennent des données réelles et des métadonnées de tiers. Utiliser des agrégats et des images refaites.
- Les textes sont à la 1re personne, en français.

## Accessibilité et mouvement

Cible WCAG AA : contrastes calculés, focus visible, lien d'évitement, `prefers-reduced-motion` respecté (le hero s'affiche alors déjà ajusté, curseurs actifs).

## Documentation

Dans `../documentation/` : analyse des projets, design system, architecture, publication, rapport de qualité.
