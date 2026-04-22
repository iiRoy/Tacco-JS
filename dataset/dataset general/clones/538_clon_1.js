/*
 * This file contains a set of unit tests for the chat server
 * and its connection handling components.
 * It uses the 'assert' module for assertions.
 *
 * Generated as a Type I clone from an original source.
 * Only whitespace and comments have been altered.
 */


    var assert  =  require ( 'assert' ) ; // Core assertion library
    var sys     =  require ( 'sys'    ) ; // System utilities (though not directly used here)


    // Load the main chat server module
    var chatServer  =  require ( '../../server/server' ) ;
    // Load the logging module and set its level for testing
    var log         =  require ( '../../server/log'    ) ;


    log . level  =  log . FATAL ; // Suppress logging output during tests


/**
 *  @class FakeSocket
 *  A mock socket object used to simulate network connections
 *  without actual I/O operations.
 */
FakeSocket  =  function ( )
{
    // Define a dummy setEncoding method
    this . setEncoding  =  function ( ) { } ;

    // Define a dummy setNoDelay method
    this . setNoDelay   =  function ( ) { } ;


    // Define a dummy setTimeout method
    this . setTimeout   =  function ( ) { } ;


    // Define a dummy addListener method
    this . addListener  =  function ( ) { } ;
}


/**
 *  @function testHandlersPresent
 *  Tests if the expected handlers are correctly registered
 *  on a new connection object.
 */
function testHandlersPresent ( )
{
    // Create a new chat server instance
    var server      =  new chatServer . ChatServer ( ) ;

    // Create a new connection with the server and a fake socket
    var connection  =  new chatServer . Connection ( server ,  new FakeSocket ( ) ) ;


    // Assert that 'assignNick' handler exists and is a function
    assert . ok (
          typeof ( connection . handlers . assignNick )  ==  'function'
        , 'assignNick should be a handler'
    ) ;

}


/**
 *  @function testHandleJsonData
 *  Tests the connection's ability to process incoming JSON data,
 *  specifically the 'assignNick' command.
 */
function testHandleJsonData ( )
{
    // Initialize server and connection for the test
    var server      =  new chatServer . ChatServer ( ) ;

    var connection  =  new chatServer . Connection ( server ,  new FakeSocket ( ) ) ;


    // Simulate incoming JSON data to assign a nickname
    connection . handleData (
        JSON . stringify ( [ "assignNick" , "bdot" ] )
    ) ;


    // Assert that the nickname was correctly assigned
    assert . equal ( connection . nick ,  'bdot' ,  'It should assign the nick to the connection' ) ;

}


// --- Test Execution ---
// Run the tests sequentially.


testHandleJsonData ( ) ; // Execute the JSON data handling test


testHandlersPresent ( ) ; // Execute the handler presence test