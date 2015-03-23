# directory and file structure

## directory structure

the recommended approach is to have a directory under your project root to house all versions of your APIs.

``` bash

 REPO
 └── apis
     ├── v0.0.1
     │   ├── __common__
     │   ├── endpoint_1
     │   ├── ...
     │   └── endpoint_N
     ├── ...
     └── vN.N.N

```

each directory under an API version will be treated as an endpoint configuration, with the exception of — if included — the `__common__` directory which can be used to store common functionality across multiple endpoints.

the su-apiserver module will then — using the [global configuration](global_configuration.md) — mount the API versions, using the directory name, under the base API path. the endpoint directory name will be mounted on top of the base API path and API version, e.g. `/apis/v0.0.1/endpoint_1`.

## file structure

see the [configuring APIs](configuring_apis.md) section for details on customising API versions using version specific configurations and initialisation scripts.

see the [defining endpoints](defining_endpoints.md) section for details on defining/configuring endpoints.

