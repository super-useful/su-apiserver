# defining endpoints

## directory and file structure

An endpoint for an API version is defined as a directory within a specific API version's directory — see [directory and file structure](directory_and_file_structure.md).

The endpoint directory should have at least one file `index.js` which exports its endpoint configurations.

``` bash

 REPO
 └── apis
     └─ version
        └─ endpoint
           └─ index.js

```

Generally, you might have a structure similar to the following:

``` bash

 REPO
 └── apis
     └─ version
        ├─ __common__
        │  └─ definitions
        │     └─ integer_default_zero.js
        ├─ endpoint
        │  ├─ definitions
        │  │  └─ foo.js
        │  ├─ interceptors
        │  │  └─ validate_params.js
        │  ├─ pipeline
        │  │  └─ manipulate_response_data.js
        │  │  └─ add_links.js
        │  │  └─ add_messages.js
        │  ├─ index.js   # endpoint definition
        │  ├─ Request.js # defining the Request Object and its parameter type definitions
        │  └─ query.js   # what the endpoint will actually do if/when a valid request is made
        └─ app.js

```

## defining a single endpoint

At its most basic level an endpoint definition is simply a JavaScript structure, defining the journey through your program.

All associated pieces of functionality are `require[d]` into the endpoint definition, making it easy to visualise the journey for one specific endpoint definition.

```javascript

    module.exports = [{
    // the http method for this endpoint
        method : 'GET',
    // the response type for this endpoint, i.e. what type of data it will return
        type : 'json',
    // you might want to define multiple paths for the same endpoint
    // e.g. for requests involves dates, you might want to allow different ways of requesting data
    //      while still executing the same query and pipeline
        paths : [{
    // a unique identifier for this endpoint path, this will be prefixed with the endpoint's directory name, e.g. endpoint-example
    // this is used by the koa-router to uniquely identify different endpoints and allow you to also execute them functionally
            id : 'example',
    // the parameter path for this endpoint request, it will be mounted onto the base path for this endpoint
    // the rest params are declared as defined in koa-router, which is exactly the same as express
            params : '/example/foo/:foo/:bar?',
    // the request definition
            request : require('./Request'),
    // once the request has been created and its parameters individually validated
    // you may want to validate the request as a whole — e.g ensure in a date range that the "from" date is less than "to" date —
    // or manipulate the request. you can run any number of generator functions before the query is executed
    // and throw an Error if you want to stop the request
            interceptors : [
                require('./interceptors/validate_params')
            ]
        }],
    // what the endpoint will actually do if/when a valid request is made
        query : require('./query'),
    // once the query has executed, you can run any number of generator functions before the response is sent back
        pipeline : [
            require('./pipeline/manipulate_response_data'),
            require('./pipeline/add_links'),
            require('./pipeline/add_messages')
        ]
    }];

```

This would create a route accessed — based on the above directory structure and `module.exports.paths[0].params` — via: `/apis/version/endpoint/example/foo/:foo/:bar?`.

The required parameter `foo` and the optional parameter `bar` definitions will be found within the module required to `module.exports.paths[0].request` — see [defining the endpoint request](#defining-the-endpoint-request).

**note:** you don't need to `require` in modules, this obviously makes the endpoint definition easier to read and easier to unit test. At the same time, you could just as easily stick a generator function into the interceptors and/or pipeline arrays; or query. this can be useful for debugging.

## multiple definitions within the same query/pipeline

You may want to define a group of endpoints that perform essentially the same thing, the only difference being that their requests are slightly different.

This is not a problem, since you can supply as many paths as you like for one particular endpoint definition, as in the below example:

```javascript

    module.exports = [{
        method : 'GET',
        type : 'json',
        paths : [{
            id : 'example',
            params : '/example/foo/:foo/:bar?',
            request : require('./Request'),
            interceptors : [
                require('./interceptors/validate_params')
            ]
        }, {
            id : 'example2', // [mandatory] unique ID
            params : '/example/foo/:foo/baz/:baz', // [optional] slightly different rest params
            request : require('./Request2'), // [optional] use a different request definition for this path
            interceptors : [
                require('./interceptors/validate_params')
                // [optional] you might want to add more interceptors for this specific path
            ]
        }],
        query : require('./query'),
        pipeline : [
            require('./pipeline/manipulate_response_data'),
            require('./pipeline/add_links'),
            require('./pipeline/add_messages')
        ]
    }];

```

You would now have two endpoints:
- `/apis/version/endpoint/example/foo/:foo/:bar?`
- `/apis/version/endpoint/example/foo/:foo/baz/:baz`

A valid request to either of these two endpoints will execute the same query and run the same pipeline.

## multiple definitions with different queries/pipelines

You may also want to encapsulate a group of endpoints that satisfy a specific use case — e.g. user authentication/session creation and session invalidation — that, while sitting under the same umbrella, do very different things.

This is the reason why the endpoint definition is exported as a JavaScript Array. The example above is illustrated in the code below:

```javascript

    module.exports = [{
        method : 'POST',
        type : 'json',
        paths : [{
            id : 'signin',
            params : '/signin',
            request : require('./requests/SignIn'),
            interceptors : [
                require('./interceptors/user_exists')
            ]
        }],
        query : require('./queries/signin'),
        pipeline : [
            require('./pipeline/persist_user_session')
        ]
    }, {
        method : 'DELETE',
        type : 'json',
        paths : [{
            id : 'signout',
            params : '/signout/:sessionid',
            request : require('./requests/SignOut'),
            interceptors : [
                require('./interceptors/user_session_exists')
            ]
        }],
        query : require('./queries/signout'),
        pipeline : [
            function* (next) {
                yield next;
            }
        ]
    }];

```

If you wanted to, you could modularise this further by abstracting each definition into its own module, e.g:

```javascript

    module.exports = [
        require('./sign_in'),
        require('./sign_out')
    ];

```

The flexibility is there to give you the most freedom in how you want to define your endpoints.

**note:** the more modular your definition(s) the easier it will be to unit test all the individual pieces of functionality.

## defining the endpoint request

When an HTTP request comes in the [koa-router](https://www.npmjs.com/package/koa-router) will parse the URL and update the [koa request context](http://koajs.com/#request). It will not, however, do any type coercion or checking on the REST parameters OR the query string parameters.

This is why when we define a path for an endpoint definition, using we also define the endpoint path's request Object, using [su-define-object](https://github.com/super-useful/su-define-object), where we can encapsulate all the functionality around managing REST and query string parameters — as well as any other properties we want to include, e.g. from HTTP headers.

This allows our `interceptors`, `query` and `pipeline` scripts to remain lean and not require duplicate type checks and coercions: **we always know what to expect, because assigning the wrong type to a property on the endpoint request will throw an `Error`**.

Below is a simple example of an endpoint request, based on the endpoint definition for the `/apis/endpoint/example/foo/:foo/:bar?` route described previously, with the parameter definitions have been included inline, see [su-define-object](https://github.com/super-useful/su-define-object) for more detailed documentation.

```javascript

    var define = require('su-define-object');

    module.exports = define('Request', {
        hasOne : {
            params : define('RequestParams', {
                properties : [{
                    foo : {
                        enumerable : true,
                        type : 'string'
                    }
                }, {
                    bar : {
                        enumerable : true,
                        set : function(val) {
                            val = parseInt(val, 10);

                            if (typeof val !== 'number' || val !== val) {
                                val = 0;
                            }

                            return val;
                        },
                        type : 'number'
                    }
                }]
            })
        }
    });

```

To be able to reuse parameter definitions, you could abstract the parameters out into their own files:

```javascript

    var define = require('su-define-object');

    module.exports = define('Request', {
        hasOne : {
            params : define('RequestParams', {
                properties : [
                // example showing how the "foo" parameter could be modularised for reuse in other requests
                    require('./definitions/foo'),
                    {
                // example showing a parameter definition that can be used with different property names
                        bar : require('../__common__/definitions/integer_default_zero')
                    }
                ]
            }
        }
    });

```

**note:** `query` string parameters and POST `body` parameters are defined in exactly the same way.

## endpoint interceptors

Endpoint interceptors are generator functions that are executed as part of the route's middleware pipeline — see [koa-router](https://www.npmjs.com/package/koa-router) — before the endpoint's query is executed.

This allows you to run any validation — e.g. checking parameters against each other — the [endpoint request object](#defining-the-endpoint-request) described above handles parameter checks at the individual level — like validating a `from` date is before a `to` date for a request involving date ranges; checking the request has a valid CSRF/session token — and/or anything else you would like to set up before executing the endpoint's `query`.

You can request the HTTP Errors specified in your [su-apiserver global configuration](global_configuration.md) for easy throwing of HTTP Errors.

Below is a simple example of an endpoint interceptor, based on the endpoint definition for the `/apis/endpoint/example/foo/:foo/:bar?` route described previously.

```javascript

    // predefined HTTP Errors
    var e = require('su-apiserver/lib/errors');

    module.exports = function* validate_params(next) {
        var req = this.su.req;
        var params = req.params;
        var foo = params.foo;

        try {
            if (something.isNotRight(req.params.foo)) {
                // you can throw a 400 if you have a bad request
                throw e.BadRequestError(new Error("something is not right!"));
            }
        }
        catch (err) {
            // or a 500 if an unexpected error occurs
            throw e.InternalServerError(err);
        }

        yield next;
    };

```

## endpoint query

The endpoint query is a generator function, which include the actual functionality your endpoint is meant to execute, e.g. querying a database or calling a third web party service.

Unlike the previously described generator function examples in which we call `yield next;` run the next middleware in the pipeline, the endpoint query will `return` data, rather than `yield next;`.

Below is a simple example of an endpoint query based on the above example, which simply returns the parameters passed to it:

```javascript

    module.exports = function* query() {
        var req = this.su.req;
        var params = req.params;

    // we return data rather than `yield next;`
        return params.serialise();
    };

```

This data will be assigned to `this.data`, where `this` is the [koa context](http://koajs.com/#context).

Once the data is returned we may want to manipulate the data in some way or other.

Any data manipulation you wish to perform on the data returned from your endpoint query should be done in the [transformer pipeline](#transformer-pipeline).

## transformer pipeline

As mentioned above in the after executing the [endpoint query](#endpoint-query), you may wish to manipulate the data returned from the query or perform other operations, like adding [HATEOAS](http://en.wikipedia.org/wiki/HATEOAS) [links](#adding-links) for managing the state of your application data and/or [messages](#adding-messages) tied to business rules around your data.

This is the purpose of the transformer pipeline, as it allows us to keep our endpoint functionality modular and makes it easy maintain and test each individual component of an endpoint by allowing us to add, remove amd/or reorder our transformer pipeline.

Each module required in the transformer pipeline should return a generator function; the data is accessed from the [koa context](http://koajs.com/#context) as `this.data`.

A simple example based on the endpoint definition for the `/apis/endpoint/example/foo/:foo/:bar?` route described previously which turns the value of the `foo` parameter to uppercase would look like:

```javascript

    module.exports = function* manipulate_response_data(next) {
        var data = this.data;

        data.foo = data.foo.toUpperCase();

        yield next;
    };

```

### adding links

If you would like to include top level [HATEOAS](http://en.wikipedia.org/wiki/HATEOAS) style links, then you can assign these to `this.links`, again, where `this` is the [koa context](http://koajs.com/#context).

```javascript

    module.exports = function* add_links(next) {
        // the API this endpoint lives under
        var api = this.su.api;

        // links is already an Object that exists, you can either add to it, or over-write it
        var links = this.links;

        // the resolveUrl method is a partial function which allows us to generate URLs based on the current endpoint
        // this makes it easy to supply different REST parameters and/or query string parameters
        links.self = api.resolveUrl(this.su.req.params/*, this.su.req.query*/);

        yield next;
    };

```

### adding messages

One aim of su-apiserver is to allow you to encapsulate all business logic around your data in the one place.

This type of architecture means that any user interface — i.e. web application(s) and native applications build on iOS and/or android —  which will be visualising your data can be as stateless as possible and **removes the need to duplicate business logic** in these different interfaces, which **reduces the likelihood of erroneous or inconsistent implementations** of business logic.

If you would like to include top level messages, then you can assign these to `this.messages`, again, where `this` is the [koa context](http://koajs.com/#context).

```javascript

    module.exports = function* add_messages(next) {
        // the API this endpoint lives under
        var api = this.su.api;

        // assuming you have added a database connection to you API
        var db = api.db;

        // messages is already an Object that exists, you can either add to it, or over-write it
        var messages = this.messages;

        // based on the request parameters, you might have a database for your content which contains
        // a contextual legal disclaimer based on the type of request and its parameters
        messages.disclaimer = yield db.content.messaging.query(this.su.req.params.serialise());

        yield next;
    };

```
