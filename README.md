# su-apiserver

## Dependencies

node v0.11.12

## Tests

Redis needs to be running at 6379.

`npm install -d`
`npm test`

## Usage

- [global configuration](docs/global_configuration.md)
- [directory and file structure](docs/directory_and_file_structure.md)
- [configuring APIs](docs/configuring_apis.md)
- [defining endpoints](docs/defining_endpoints.md)
- [starting the server](docs/starting_the_server.md)

## TODO

 - move validators out into su-validate-type
 - add extra service checks to healthcheck. eg, redis, ssh tunnel, etc — maybe new module su-health???
