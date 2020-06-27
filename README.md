# Bhoe Ja ☕️

Find your latest Tibetan news from different sources in one area.

### Development

[Angular](https://angular.io/start) application with a [Node.js](https://nodejs.org/en/) server that uses [Typescript](https://www.typescriptlang.org/) to 'web scrap` different Tibetan news sources.

#### Getting Started

1. Install the latest version of [Angular CLI](https://cli.angular.io/)
2. Install the latest version of [Node.js](https://nodejs.org/en/)
3. Clone this repo
4. `npm install` Installs all your dependencies for this project
5. `npm run start` Runs the UI and the app server
6. Navigate to `http://localhost:4200`

#### Future Roadmap

- User interface (Angular to create a webpage)
- Support more sites
  - VOA, RFA, Voice of Tibet
- Persist scrapped news
  - Persist news on first access to the site every x hours
  - Retrive from persisted data if applicable
- Publish to a web service
- Create scheduled jobs that runs twice a day and saves the scrapped news

#### Contribution

- TODO

#### UI Development

- Run `npm run serve` or `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
- Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.
- Run `npm run build` or `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

#### Server Development

- Navigate to `server` folder
- Run `npm run serve` for a dev server. App server will be lisitening on `http://localhost:3000/` and will automatically reload if you change any of the source files.

##### Contact tpalber7@gmail.com for any contributions or questions.
