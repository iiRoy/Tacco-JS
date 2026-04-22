'use strict' ; // This directive enables strict mode, ensuring cleaner code and catching common errors.


test (  'SET and GET object' , function (  ) { // Test suite for verifying the 'set' and 'get' operations for objects.

	var   obj   =   { 'a' :  'apple'  } ;  // Define a sample object literal.
	var   setTo   =   infect . set ( 'key' , obj ) ; // Store the object 'obj' under the identifier 'key' using infect.set().

	equal ( obj , infect . get ( 'key' ) ,  'object used to SET equals the object returned from GET' ) ; // Assert that the object retrieved by infect.get() is strictly equal to the original object.
	equal ( obj , setTo ,  'object used to SET returned value from SET' ) ; // Assert that infect.set() returns the object that was successfully set.

} ) ; // End of 'SET and GET object' test case.


test ( 'SET and GET function' ,  function ( )  { // Test suite for setting and retrieving function references.

	var   func   =   function (  ) { return  'apple' ;  } ; // Define a simple anonymous function.

	infect . set ( 'key' , func ) ; // Register the function 'func' with the 'infect' container under 'key'.

	equal ( func , infect . get ( 'key' ) ,  'function used to SET equals the function returned from GET' ) ; // Verify that the function retrieved is the exact same reference as the one set.
	equal ( 'apple' , infect . get ( 'key' ) (  ) ,  'function used to SET returns the correct output' ) ; // Execute the retrieved function and confirm its return value.

} ) ;


test ( 'Object injection' , function (  ) { /* This test case specifically checks the mechanism of injecting dependencies into plain objects. */

	var   func   =   function (  ) { return  'apple' ; } ; // A function to be used as a dependency.
	infect . set ( 'key' , func ) ; // Register 'func' as a dependency named 'key'.

	var   obj   =   infect . obj ( {  } , [ 'key' ] ) ; // Create an object that will receive 'key' as an injection.

	equal ( func (  ) , obj . $key (  ) ,  'injected function returns the same value as original function' ) ; // Confirm that the injected function, when called via the object, yields the same result as the original.
} ) ;


test ( 'trying to SET immutable values should throw Error' ,  function (  )  { // This test suite ensures that attempts to set immutable primitives result in errors.

	throws ( function (  ) {
		infect . set ( 'key' , 'string' ) ; // Attempt to register a string value.
	} ,  'trying to set a string throws an error' ) ; // Expect an error, as strings are immutable.

	throws (  function (  ) {
		infect . set ( 'key' , 1234 ) ; // Attempt to register a number value.
	} ,  'trying to set a numer throws an error' ) ; // Expect an error for numbers.

	throws (  function (  ) {
		infect . set ( 'key' , null ) ; // Attempt to register null.
	} ,  'trying to set null throws an error' ) ; // Expect an error for null.

	throws (  function (  ) {
		infect . set ( 'key' , undefined ) ; // Attempt to register undefined.
	} ,  'trying to set undefined throws an error' ) ; // Expect an error for undefined.

	throws (  function (  ) {
		infect . set ( 'key' , true ) ; // Attempt to register a boolean (true).
	} ,  'trying to set bool (true) throws an error' ) ; // Expect an error for booleans.

	throws (  function (  ) {
		infect . set ( 'key' , false ) ; // Attempt to register a boolean (false).
	} ,  'trying to set bool (false) throws an error' ) ; // Expect an error for booleans.
} ) ; // End of immutable value setting tests.


test ( 'Infected constructors should construct' ,  function (  ) { // This test validates the injection mechanism for constructor functions.

	infect . set ( 'a' , { 'apple' : 'delicious' } ) ; // Register an object as a dependency named 'a'.

	function   Apple ( name , $a ) { // Define a constructor function 'Apple' with a dependency '$a'.
		this . name   =   name ; // Assign the provided name.
		this . apple   =   $a . apple ; // Access a property from the injected dependency.
	}

	var   name   =   'Granny Smith' ; // A sample name for the Apple instance.
	var   InfectedApple   =   infect . func ( Apple ) ; // Create an 'infected' version of the Apple constructor.

	var   a1   =   new   Apple ( name , infect . get ( 'a' ) ) ; // Manually instantiate Apple, providing the dependency.
	var   a2   =   new   InfectedApple ( name ) ; // Instantiate the 'InfectedApple', letting 'infect' handle the dependency.

	equal ( a2 . apple , a1 . apple ,  'Constructor is injecting and building' ) ; // Check if the injected property is correctly set in the 'infected' instance.
	equal ( a2 . name , name ,  'new InfectedApple() params are passing through' ) ; // Verify that standard constructor parameters are still passed through.
	ok ( a2   instanceof   Apple ,  'new InfectedApple() is instanceof Apple' ) ; // Confirm that the 'infected' instance is still an instance of the original constructor.
} ) ;


test ( 'Minified Infect constructors should construct' ,  function (  ) { // Test case for constructors with minified parameter names, using $infect property.

	infect . set ( 'a' , { 'apple' : 'delicious' } ) ; // Register dependency 'a'.

	function   Apple ( n , a ) { // Constructor with minified parameter names 'n' and 'a'.
		this . name   =   n ;
		this . apple   =   a . apple ;
	}
	Apple . $infect   =   [ 'a' ] ; // Explicitly declare dependencies for minification safety.

	var   name   =   'Granny Smith' ;
	var   InfectedApple   =   infect . func ( Apple ) ; // Create the 'infected' constructor.

	var   a1   =   new   Apple ( name , infect . get ( 'a' ) ) ; // Manual instantiation.
	var   a2   =   new   InfectedApple ( name ) ; // 'Infected' instantiation.

	equal ( a2 . apple , a1 . apple ,  'Constructor is injecting and building' ) ; // Verify correct dependency injection.
	equal ( a2 . name , name ,  'new InfectedApple() params are passing through' ) ; // Verify parameter passing.
	ok ( a2   instanceof   Apple ,  'new InfectedApple() is instanceof Apple' ) ; // Verify instanceof relationship.
} ) ;


test ( 'Function injection' ,  function (  ) { // This comprehensive test covers various scenarios of function injection.

	var   func   =   function (  ) { return  'apple' ; } ; // First dependency function.
	var   func2   =   function (  ) { return  'orange' ; } ; // Second dependency function.

	infect . set ( 'key' , func ) ; // Register 'func' as 'key'.
	infect . set ( 'key2' , func2 ) ; // Register 'func2' as 'key2'.

	// regular function injection using parameter name
	function   infected ( $key ) { // Function expecting '$key' as a dependency.
		return   $key (  ) ;
	}
	infected   =   infect . func ( infected ) ; // Transform 'infected' into an injectable function.

	// minified function injection using $infect property
	function   minInfected ( k ) { // Function with a minified parameter 'k'.
		return   k (  ) ;
	}
	minInfected . $infect   =   [ 'key' ] ; // Explicitly declare 'key' as the dependency for 'k'.
	minInfected   =   infect . func ( minInfected ) ; // Make 'minInfected' injectable.

	// another minified function test (assigned to a variable)
	var   varMinInfected   =   infect . func ( function ( k ) { // Anonymous function with minified parameter 'k'.
		return   k (  ) ;
	} ) ;
	varMinInfected . $infect   =   [ 'key' ] ; // Declare dependency for the anonymous function.

	var   minInfected2   =   infect . func ( [ 'key' , 'key2' ,  function ( h , k , k2 ) { // Array-style dependency declaration, including a non-injected parameter 'h'.
		return   h   +   k (  )   +   k2 (  ) ;
	} ] ) ;

	equal ( func (  ) , infected (  ) ,  'injected function returns the same value as original function' ) ; // Verify regular injection.
	equal ( func (  ) , minInfected (  ) ,  'minified injected function returns the same value as original function' ) ; // Verify minified injection using $infect.
	equal ( func (  ) , varMinInfected (  ) ,  'minified (var assigned) injected function returns the same value as original function' ) ; // Verify minified injection for variable-assigned function.
	equal ( 'hello '   +   func (  )   +   func2 (  ) , minInfected2 ( 'hello ' ) ,  'minified without setting $infect property' ) ; // Verify array-style injection with multiple dependencies and a regular parameter.
} ) ;