var path = require('path');
var chai = require('chai');

var expect = chai.expect;
var email = require('../../../lib/validators/email');

describe( 'lib/validators/email', function() {
	it( 'returns the email address if it is valid', function() {
		var email_address = 'christos.constandinou@bgch.co.uk';

		expect( email( email_address ) ).to.equal( email_address );
	} );

	it( 'throws a TypeError if the email address is not valid', function() {
		var email_address = 'si@jeffwad';

		expect( function() {
			return email( email_address );
		} ).to.throw( TypeError, /^invalid email address/i );
	} );
} );
