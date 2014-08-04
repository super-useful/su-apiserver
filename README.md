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
{
	definitions: {},
	interceptors: {},
	queries: {},
	request: {},
	transformers: {},
	app.js
	config.yaml
}
```

#### app.js

A generator that may perform some initialisation.

#### config.js

Applications config.

#### definitions/

Definitions define the flow of control for a particular route in the application. When a route is matched, the request parameters are validated, and the request passes through the individual routes interceptors. The request then flows through a middleware and finally to the route definitions pipeline middlewares. The final middleware in the pipeline is responsible for returning a value for the request.

They are defined as a hash of `string` / `Definition` pairs denoting the definition name and definitions themselves.

A `Definition` is an Array of Objects that is defined as the following:

* `method` String - HTTP method i.e `GET`
* `type` String - The response type i.e `json`
* `paths` Object<String, Path> - Defines the RESTful path name and corresponding path definitions (see below for `Path` definition).
* `query` GeneratorFunction - Koa middleware generator that should perform any database queries before transfering control to the pipeline middlewares.
* `pipeline` Array<GeneratorFunction> - Ordered set of Koa middlewares that perform any relevent logic to fulfil the request

Within a `Definition` a `Path` is defined as the following. Note that the actual name of the path within the `paths` property forms part of the RESTful URL.

* `params` String - Any reamining segments of the URL with Koa style parameters i.e `pets/:id`.
* `request` RequestObject - A definition of the request used for validation.
* `interceptors` Array<GeneratorFunction> - Ordered set of Koa middleware called first for the request.

#### interceptors/

A hash of `string` / `GeneratorFunction`  pairs denoting the interceptor name and the implementing generator.

#### queries/

A hash of `string` / `GeneratorFunction`  pairs denoting the query name and the implementing generator.

#### request/

A hash of `string` / `RequestObject` pairs where `RequestObject` is of type `su-define-object`. These denote the request name and the implemented class.

#### transformers/

A hash of `string` / `GeneratorFunction`  pairs denoting the transofmer name and the implementing generator.
