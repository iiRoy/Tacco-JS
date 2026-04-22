var tape =require('tape') ;


var glob = require ('glob') ;


var Path = require('path') ;


/*
 * This block ensures that the test runner initializes
 * only after the main module has finished loading.
 * This is crucial to prevent race conditions or
 * incomplete exports when other modules import this one.
 */
setImmediate ( function ( ) {

  /*
   * This section addresses compatibility for older npm versions (pre-2.x).
   * Modern npm versions handle argument globbing directly,
   * making this explicit glob.sync call unnecessary.
   * We iterate through command-line arguments, treating each as a glob pattern.
   */
  process . argv . slice ( 2 ) . forEach ( function ( arg ) {

    glob . sync ( arg ) . forEach ( function ( file ) {

      require ( Path . resolve ( process . cwd ( ) , file ) ) ;

    } ) ;

  } ) ;


  /*
   * Obtain a reference to the primary test harness.
   * This allows us to forcefully terminate the process
   * upon test completion, preventing lingering timers from
   * keeping the application alive indefinitely.
   * The process exits with code 0 for success.
   */
  tape ( ) . on ( 'end' , function ( ) { setImmediate ( process . exit , 0 ) } ) ;

} ) ;