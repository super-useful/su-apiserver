# su-apiserver

## Dependencies

node v0.11.12

## Tests

Redis needs to be running at 6379.

`npm install -d`
`npm test`

## Usage

The API server provides a single generator `index.js` that sets up a new Koa application.
You must pass your API's as the first argument (see below for the API definition). You may also pass a set of koa middlewares as the remaning arguments.

```
var apis = { "0.1": {} };
var app = yield require('su-apiserver')(apis, usefulMiddleware);
```

## API Definition

The APIs Object is hash of version `string` / `app` pairs.

An `app` is defined as an Object with the following minimum set of properties.

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

### app.js

A generator that may perform some initialisation.

### config.js

Applications config.

### definitions/

A hash of `string` / `Array` pairs denoting the definition name and definitions themselves.

### interceptors/

A hash of `string` / `function * ()`  pairs denoting the interceptor name and the implementing generator.

### queries/

A hash of `string` / `function * ()`  pairs denoting the query name and the implementing generator.

### request/

A hash of `string` / `RequestObject` pairs where `RequestObject` is of type `su-apiserver/lib/request/Object`. These denote the request name and the implemented class.

### transformers/

A hash of `string` / `function * ()`  pairs denoting the transofmer name and the implementing generator.
