# Bhoe Ja ☕️

Bhoe Ja is an open source project that enable users to find the latest Tibetan news from different sources across the web.

[https://bhoeja.news](https://bhoeja.news)

### Supported News Sites

- [Central Tibetan Administration](https://tibet.net/)
- [Free Tibet](https://freetibet.org/)
- [Phayul](https://www.phayul.com/)
- [Radio Free Asia](https://www.rfa.org/english/news/tibet)
- [Shambala](http://www.shambalanews.com/)
- [Tibet Post](http://www.thetibetpost.com/en/)
- [Tibet Sun](https://www.tibetsun.com/)
- [Tibet Times](http://tibettimes.net/)
- [Voice Of Tibet](https://vot.org/)

### Supported Youtube Channels

- [Dalai Lama](https://www.youtube.com/channel/UCiPJ_g02LuOgOG0ZNk5j1jA)
- [RFATibetan](https://www.youtube.com/channel/UCmAs3jM0KZLwsglmaVMwvMg)
- [TibetTV](https://www.youtube.com/channel/UCQG1iEjZPBw9m4HSZgyVoUg)
- [VOA Tibetan](https://www.youtube.com/channel/UC2UlA4pbz0AYXXHba7cbu0Q)
- [Voice of Tibet](https://www.youtube.com/channel/UCYg4JtszcCx83UTR-wObgFg)
- [སྤྱི་ནོར་ྋགོང་ས་ྋསྐྱབས་མགོན་ཆེན་པོ་མཆོག](https://www.youtube.com/channel/UCprjZGYXe2TPAd2LydWhk8A)

### Development

[MERN](https://en.wikipedia.org/wiki/MERN)-style development stack (MongoDB, Express, React, Node) to 'web scrape' different Tibetan news sources and display the list of articles and videos in a web application.
Both UI and server side code base uses [Typescript](https://www.typescriptlang.org/). The UI is built with [React](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) components, and lives in `client/`.

#### Getting Started

1. Install the latest version of [Node.js](https://nodejs.org/en/)
2. Clone this repo
3. `npm install` Installs the root dependencies for this project
4. `cd client && npm install` Installs the React UI dependencies
5. `npm run dev` (from the repo root) Runs the React UI (Vite) and the app server
6. Navigate to `http://localhost:5173` (API requests are proxied to `http://localhost:3000`)

#### Future Roadmap

- Improve site accessibility
- Rating/Ranking of articles and videos depending on user input (More claps will result in news showing first)

#### UI Development

- Run `npm run dev --prefix client` (or `npm run dev` from the repo root, which also starts the app server) for a Vite dev server. Navigate to `http://localhost:5173/`. The app will automatically reload if you change any of the source files. `/api` requests are proxied to `http://localhost:3000`.
- Run `npm run build` from the repo root to build the React UI. The build artifacts will be stored in the `server/build/bhoeja/` directory, served by the Express app server.
- Run `npm run smoke --prefix client` (after a build) to boot the production bundle in jsdom and verify routing, tabs, the about sheet, dark mode, bookmark storage compatibility with the old Angular app, and that no JS errors are thrown.

#### Server Development

- Navigate to `server` folder
- Run `npm run serve` for a dev server. App server will be lisitening on `http://localhost:3000/api/` and will automatically reload if you change any of the source files.

#### Production Deployment

- `rm -rf client/node_modules` Remove existing UI node modules folder if exists
- `cd client && npm ci` Install UI dependencies
- `npm run build` (from the repo root) Build the React UI and add the distribution files within server/build/bhoeja/
- `cd ../server` Navigate to server folder
- `rm -rf node_modules` Remove existing server node modules folder if exists
- `npm ci` Install Server dependencies
- `npm run tsc` Build the Server product and add the distribution files within server/build/
- Add required build files, app.yaml or .env
- `npm start` Start the project from the server with the UI distribution files

##### Contact tpalber7@gmail.com for contributions or any questions.
