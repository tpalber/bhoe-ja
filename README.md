# Bhoe Ja ☕️

Bhoe Ja is an open source project that enable users to find the latest Tibetan news from different sources across the web.

### Supported News Sites

- [Phayul](https://www.phayul.com/)
- [Radio Free Asia](https://www.rfa.org/english/news/tibet)
- [Tibet Post](http://www.thetibetpost.com/en/)
- [Tibet Times](http://tibettimes.net/)
- [Voice Of Tibet](https://vot.org/)

### Supported Youtube Channels

- [TibetTV](https://www.youtube.com/channel/UCQG1iEjZPBw9m4HSZgyVoUg)
- [VOA Tibetan](https://www.youtube.com/channel/UC2UlA4pbz0AYXXHba7cbu0Q)

### Development

[MEAN](<https://en.wikipedia.org/wiki/MEAN_(solution_stack)>) development statck to 'web scrap' different Tibetan news sources and display the list of articles/videos in a web application.
Both UI and server side code base uses [Typescript](https://www.typescriptlang.org/).

#### Getting Started

1. Install the latest version of [Angular CLI](https://cli.angular.io/)
2. Install the latest version of [Node.js](https://nodejs.org/en/)
3. Clone this repo
4. `npm install` Installs all your dependencies for this project
5. `npm run start` Runs the UI and the app server
6. Navigate to `http://localhost:4200`

#### Future Roadmap

- Support getting news links using provided API
  - Google API to get YouTube videos from Tibetan news channels
  - Videos section for all the videos
- Publish to a web service
- Bookmark news and save it to browser's cache (Window.localStorage)
- Separate news in Tibetan and English into different sections

#### UI Development

- Run `npm run serve` or `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
- Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.
- Run `npm run build` or `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

#### Server Development

- Navigate to `server` folder
- Run `npm run serve` for a dev server. App server will be lisitening on `http://localhost:3000/api/` and will automatically reload if you change any of the source files.

##### Contact tpalber7@gmail.com for any contributions or questions.
