# starting the server

Below is the most basic example of starting a web server with all your su-apiserver endpoint definitions

```javascript

    var path = require('path');

    // we use the `co` module to wrap our initialising generator function
    // this makes everything easier to read and does some nice error handling under the hood
    var co = require('co');

    co(function* () {
        // grab all the APIs from wherever you have defined them, using the `require-all` module
        var apis = require('require-all')(path.resolve('apis'));

        // start the server by passing the required APIs to the su-apiserver the generator function.
        // this will parse all our APIs and their endpoint definitions;
        // turn them into koa-router middleware and mount them onto the correct path(s); and
        // start the koa server, which uses node's http server under the hood
        module.exports.app = yield require('su-apiserver')(apis);
    })();

```

That's essentially all you have to do.

Generally, you would also initialise your session handling and logging in here too, however, how you want to do all that is up to you and the requirements of your APIs.
