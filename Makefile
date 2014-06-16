
test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--harmony \
		--reporter spec \
		--recursive \
		--bail

.PHONY: test