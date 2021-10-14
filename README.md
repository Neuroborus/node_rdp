Prepare:
(https://github.com/nodejs/node-gyp)
install python3/pip for system & add to path

if Win:


In case electron error:
Run `npm i -D electron-rebuild` to add the electron-rebuild package
Remove the `node-modules` folder, as well as the `packages-lock.json` file.
Run `npm i` to install all modules.
Run `./node_modules/.bin/electron-rebuild` (`.\node_modules\.bin\electron-rebuild.cmd` for Windows) to rebuild everything

client:
> npm start

server:
> node index.js