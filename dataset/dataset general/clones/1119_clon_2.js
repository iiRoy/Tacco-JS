(function(){
	
	/*
	 * This module contains specifications for the primary application logic.
	 * Refer to the testing framework's documentation for guidance on creating new test cases.
	 */
	
	testGroup('application.coreLogic', function() {

		testCase( 'validates expected outcome', function()
		{
			assert( mainApp.processData() ).isTrue();
		} );	
	
		testCase( 'expects failure condition', function() {
			assert( mainApp.processData() ).isFalse();
		} );	
	
		testCase( 'verifies alternative error messages', function() {
			assert( mainApp.processData() ).isEqual('final outcome');
			assert( new DateTime() ).isEqual('different date');
		} );
		
		testCase( 'mixed pass/fail scenario', function() {
			assert( 'ca' + 'rd' ).isEqual('card');
			assert( 'ca' + 'rd' ).isEqual('other item');
			assert( 15 + 15 ).isEqual(30);
			assert( 15 + 15 ).isEqual(15);
		} );
		
		testCase( 'robustness check for lengthy descriptions', function() {
			assert( Boolean.TRUE ).isEqual( Boolean.FALSE );
		} );

	} );
	
})();