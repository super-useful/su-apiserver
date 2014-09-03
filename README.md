# su-apiserver

## Dependencies

node v0.11.12

## Tests

Redis needs to be running at 6379.

`npm install -d`
`npm test`

## Usage

The API server provides a single generator `index.js` that sets up a new Koa application.
You must pass your API's as the first argument (see below for the API definition).
You may also pass a set of koa middlewares as the remaning arguments.

```
var apis = { "0.1": {} };
var app = yield require('su-apiserver')(apis, usefulMiddleware);
```

## API Definition

The APIs Object is hash of version `string` / `app` pairs.

### Versioning

Multiple versions of your app can be passed to the server when creating an app.

Each version will be prefixed with `/<version>` in the URL.

#### Config versions

For convenience you may provide named versions inside the applications config that should map to available versions.

In your config under `apis.releases`:

```
apis: {
	releases: {
		stable: "2.0.0"
	}
}
```

With the above, `/stable` will be mounted in addition to `/2.0.0`.

### App

An `app` is defined as an Object that contains the API definitions, database lookup functions and other request processing middlewares.

A typical app structure is given below along with explanations of each item.

```
  __common__/
    interceptors/
    transformers/
  route1/
    interceptors/
    transformers/
    index.js
    query.js
    Request.js
  route2/
    interceptors/
    transformers/
    index.js
    query.js
    Request.js
	app.js
	config.yaml

```

#### app.js

A generator that may perform some initialisation.

#### config.js

Applications config.

#### route[n]/index.js

A definition of the flow of control for a particular route in the application. When a route is matched, the request parameters are validated, and the request passes through the individual routes interceptors. The request then flows through a middleware and finally to the route definitions pipeline middlewares. The final middleware in the pipeline is responsible for returning a value for the request.

A `Definition` is an Array of Objects defined as the following:

* `method` String - HTTP method i.e `GET`
* `type` String - The response type i.e `json`
* `paths` Object<String, Path> - Defines the RESTful path name and corresponding path definitions (see below for `Path` definition).
* `query` GeneratorFunction - Koa middleware generator that should perform any database queries before transfering control to the pipeline middlewares.
* `pipeline` Array<GeneratorFunction> - Ordered set of Koa middlewares that perform any relevent logic to fulfil the request

Within a `Definition` a `Path` is defined as the following. Note that the actual name of the path within the `paths` property forms part of the RESTful URL.

* `params` String - Any reamining segments of the URL with Koa style parameters i.e `pets/:id`.
* `request` RequestObject - A definition of the request used for validation.
* `interceptors` Array<GeneratorFunction> - Ordered set of Koa middleware called first for the request.

#### route[n]/interceptors/

`Koa middleware` modify the Request before running any DB queries/API calls etc.

#### route[n]/transformers/

`Koa middleware` transform the response before returning it to the client

#### Request.js

`su-define-object` A definition of the request used for validation

#### query.js

`Koa middleware` performs DB queries/ API calls

#### __common__/

`Koa middleware` functionality that is shared between routes lives here

## TODO

 - add extra service checks to healthcheck. eg, redis, ssh tunnel, etc
