# exibris-primo

This repo maintains the code which is uploaded to the exlibris servers

It is a fork of an older repo, uqlibraru-reusable-components, maintaining only the primo elements

### Getting Started

Project requires the following major dependencies:

- Node.js, used to run JavaScript tools from the command line.
- NPM, the node package manager, installed with Node.js and used to install Node.js packages.
- Gulp, a Node.js-based build tool.
- Bower, a Node.js-based package manager used to install front-end packages (like Polymer).

With Node.js installed, run the following one liner from the root of the repo:

```sh
npm i -g gulp-cli bower npm@6 && npm install
```

### Applications Customisations

- `custom-styles.scss/custom-styles.css` - Custom css for the application

## Workflow

### Suggested workflow for changing CSS on Primo

- Open the page that needs restyling
- Assuming Chrome, open the inspect page and tweak settings in the Elements > css pane until you have what you want
- Open the scss file in PhpStorm and make updates
- Run `gulp styles`
- Open the generated custom-styles.css file and copy all
- On the web page, in the inspector, goto Sources and navigate to the same custom-styles.css file
- Select all and overwrite with css copied from custom-styles.css, above
- Look at the page to check you got what you wanted
- Repeat

This lets you precisely check any changes without having to upload

The [primo readme](src/readme.md) has more details about Exlibris' primo.