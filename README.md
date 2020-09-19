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

[MEAN](<https://en.wikipedia.org/wiki/MEAN_(solution_stack)>) development statck to 'web scrap' different Tibetan news sources and display the list of articles/videos in a web application.
Both UI and server side code base uses [Typescript](https://www.typescriptlang.org/).

#### Getting Started

1. Install the latest version of [Angular CLI](https://cli.angular.io/)
2. Install the latest version of [Node.js](https://nodejs.org/en/)
3. Clone this repo
4. `npm install` Installs all your dependencies for this project
5. `npm run dev` Runs the UI and the app server
6. Navigate to `http://localhost:4200`

#### Future Roadmap

- Improve site accessibility
- Separate news in Tibetan and English into different sections
- Dark Mode with Angular Material Theming

#### UI Development

- Run `npm run serve` or `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
- Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.
- Run `npm run build` to build the project. The build artifacts will be stored in the `server/build/` directory.

#### Server Development

- Navigate to `server` folder
- Run `npm run serve` for a dev server. App server will be lisitening on `http://localhost:3000/api/` and will automatically reload if you change any of the source files.

#### Production Deployment

- `npm ci` Install UI dependencies
- `npm run build` Build the UI project and add the distribution files within server/build/
- `cd server` Navigate to server folder
- `npm ci` Install Server dependencies
- `npm run tsc` Build the Server product and add the distribution files within server/build/
- Add required build files, app.yaml or .env
- `npm start` Start the project from the server with the UI distribution files

##### Contact tpalber7@gmail.com for contributions or any questions.
