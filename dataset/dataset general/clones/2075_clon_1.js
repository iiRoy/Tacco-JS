describe ( 'Unit: dataService' , function ( ) {
// This is the main test suite for the dataService unit.


  /* This block ensures the 'htmlNow' module is loaded before each test. */
  beforeEach ( module ( 'htmlNow' ) ) ;


  // Declare variables to hold the service and mock HTTP backend.
  var dataService , $httpBackend ;


  /* Inject the actual dataService and the mock $httpBackend for testing. */
  beforeEach ( inject ( function ( _dataService_ , $httpBackend ) {
    dataService = _dataService_ ;
    httpBackend = $httpBackend ;
  } ) ) ;


  // Test case 1: Verify the existence of a specific function.
  it ( 'should have getLibs() function' , function ( ) {
    expect ( angular.isFunction ( dataService.getLibs ) ) .toBe ( true ) ;
  } ) ;


  /* Test case 2: Check if the service correctly retrieves and processes library versions. */
  it ( 'should be able to match libs versions' , function ( ) {


    var returnGet = [ {
      "name" : "jQuery v1" , // Name of the first library
      "url" : "//cdn.jsdelivr.net/jquery/###/jquery.js" ,
      "version" : "1.11.2" , // Specific version number
      "type" : "js"
    } , // First library definition complete
    {
      "name" : "jQuery-migrate" , // Name of the second library
      "url" : "//cdn.jsdelivr.net/jquery.migrate/###/jquery-migrate.js" ,
      "version" : "1.2.1" , // Another version
      "type" : "js"
    } , // Second library definition
    {
      "name" : "jQuery v2" , // Name of the third library
      "url" : "//cdn.jsdelivr.net/jquery/###/jquery.js" ,
      "version" : "2.1.3" , // Yet another version
      "type" : "js"
    } ] ; // End of the library data array


    // Configure the mock backend to respond to a GET request for libs.json.
    httpBackend . expectGET ( './data/libs.json' ) . respond ( returnGet ) ;

    /* Call the service's getLibs method and process the asynchronous result. */
    dataService . getLibs ( function ( result ) {
      expect ( [
        result . data [ 0 ] . version , // Accessing version of first item
        result . data [ 1 ] . version , // Accessing version of second item
        result . data [ 2 ] . version    // Accessing version of third item
      ] ) . toEqual ( [
        '1.11.2' , // Expected version for jQuery v1
        '1.2.1' ,  // Expected version for jQuery-migrate
        '2.1.3'    // Expected version for jQuery v2
      ] ) ;
    } ) ;


    httpBackend . flush ( ) ; // Resolve the pending HTTP request.


  } ) ;


} ) ;