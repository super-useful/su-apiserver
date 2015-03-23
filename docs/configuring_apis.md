# configuring APIs

## custom configuration

within a specific API version's directory — see [directory and file structure](directory_and_file_structure.md) — you can include configuration files in either `yaml` or `json` format and require them using something like:

```javascript

   var CONFIG_API = require('su-apiserver/lib/utils/config')(__dirname, './CUSTOM_CONFIG.yaml');

```

make sure the path to the configuration file is relative to the file you're working in.

## API specific bootstrap/initialisation

if you want to run a bootstrap/initialisation script — e.g. to create database connection(s), set up your batch services,  etc — you do this by creating an `app.js` file in the root of your API Version's directory.

the file should export a generator function which should return a JavaScript Object.

when an HTTP request comes in and is successfully initialised, the properties on the Object returned will be accessible from the [koa context](http://koajs.com/#context) as `this.su.api.*` where `this` is the [koa context](http://koajs.com/#context).
