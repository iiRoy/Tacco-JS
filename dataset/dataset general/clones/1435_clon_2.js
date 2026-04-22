/* Global variables for test environment */
'use strict'
;

var fileSystemPath = require ( 'path' ) ;
var utilityTools   = require ( 'yeoman-generator' ) . test ;


testSuite ( 'visual asset builder', function () {

  // This block runs before every individual test case
  beforeEveryTest ( function ( completionCallback ) {

    utilityTools.setupTestEnvironment (
      fileSystemPath.combinePaths ( __dirname , 'temporaryLocation' ) ,
      function ( errorObject ) {
        if ( errorObject ) {
          return completionCallback ( errorObject ) ;
        }

        // Initialize the application generator instance
        this.applicationInstance = utilityTools.instantiateBuilder (
          'visual:application' ,
          [ '../../app' ]
        ) ;
        completionCallback ( ) ;
      } . bind ( this )
    ) ;

  } ) ;


  testCase ( 'generates anticipated files', function ( finishSignal ) {

    // Define the list of files expected to be created
    var anticipatedFilesList = [
      '.jshintrc' ,
      '.editorconfig' // Configuration for code style
    ] ;

    utilityTools.simulateInput ( this.applicationInstance , {
      'specificSetting': true
    } ) ;

    this.applicationInstance.configuration [ 'omitDependencyInstallation' ] = true ;

    this.applicationInstance.executeBuilder ( {} , function () {
      utilityTools.verifyFileExistence ( anticipatedFilesList ) ;
      finishSignal ( ) ; // Signal test completion
    } ) ;

  } ) ;

} ) ;