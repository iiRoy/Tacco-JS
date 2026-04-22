/*
 * This file contains a set of QUnit tests
 * designed to verify basic functionality.
 *
 * These tests are examples and can be modified or removed as needed.
 */

// Initializing the test suite for example cases.
module ( "example tests" ) ;

test ( "HTML5 Boilerplate is sweet" , function ( ) {

    // Expecting one assertion to be run within this test.
    expect ( 1 ) ;

    equals ( "boilerplate" . replace ( "boilerplate" , "sweet" ) , "sweet" , "Yes. HTML5 Boilerplate is, in fact, sweet" ) ;

} ) ;

/*
 * The following tests validate integrations with plugins.js,
 * specifically checking for the presence and functionality of the 'log'
 * utility and the 'Modernizr' global object.
 */

test ( "Environment is good" , function ( ) {

    // This test expects three assertions to pass.
    expect ( 3 ) ;

    // Verify that the 'log' function is available on the window object.
    ok ( !! window . log , "log function present" ) ;

    // Capture current log history length before adding a new entry.
    var history = log . history && log . history . length || 0 ;

    // Log a message from the test suite itself.
    log ( "logging from the test suite." ) ;

    // Assert that the log history count has increased by one.
    equals ( log . history . length - history , 1 , "log history keeps track" )

    // Verify that the Modernizr global object is present, indicating feature detection setup.
    ok ( !! window . Modernizr , "Modernizr global is present" )

} ) ;