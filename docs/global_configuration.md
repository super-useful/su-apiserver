# global configuration

the global configuration for a project should live in `config/default.yaml` directly under the project root.

it defines the following parameters:

``` yaml

   app:
   # what port to run the api server on
     port: 3000
   # if using su-apisession, then it can be configured here
     session:
       host: "localhost"
       port: 6379
   # remove an invalid session from the cache after it's been invalid for — default two hours — milliseconds
       cleanup_time: 7200000
   # check for invalid sessions to remove from the cache every — default one hour — milliseconds
       cleanup_interval: 3600000
   # check for invalid sessions to remove from the cache every — default one hour — milliseconds
     global_request_timeout: 400000
   # make a session invalid after — default one hour — milliseconds of inactivity
     global_session_timeout: 3600000
   log:
   # what to log
     customlevels:
       ERROR: 1
       INFO: 1
       LOG: 1
       WARN: 1
   # where — what directory — to log to
     path: "logs"
   apis:
   # base path APIs will be mounted under
     base: "/apis"
   # alias specific API versions
     releases:
       stable: "0.0.0"
       beta: "0.0.0"
       alpha: "0.0.0"
   # health check URL
     health: "/service/healthcheck"

   # whatever HTTP errors you want the Error factory to create
   # this allows you to specific custom messages
   errors:
     400:
       id: BadRequest
       message: 'Bad Request.'
     500:
       id: InternalServer
       message: 'Internal Server Error.'

```

if you want to create environment specific overwrites, you can simply create a `config/ENVIRONMENT_NAME.yaml` — only including the key/values you want to over-write — and before starting your application be sure to `export NODE_ENV="ENVIRONMENT_NAME"`.

the underlying [node-config](https://www.npmjs.com/package/node-config) module will do the rest.
