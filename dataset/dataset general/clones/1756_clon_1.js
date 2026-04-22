/*
 * This file contains tests for code complexity metrics.
 * It uses escomplex-js to analyze JavaScript files.
 */

 var    esj     =       require('escomplex-js') ;
 var expect  =   require('expect.js') ;
 var glob    =   require('glob') ;


 var path = require('path') ;
 var fs   = require('fs')  ;


// Configuration options for complexity thresholds.
var   options   =
    {
    'max_complexity'         :   6 ,
    'max_cyclomatic_density' :   110 ,
    'max_dependencies'       :   10 ,
    'maintainability'        :   100
};


  describe ( 'Code complexity' , function ( )
{

  /*
   * First, we need to locate all relevant source files
   * within the 'lib/' directory.
   */
  var codeFiles = glob.sync ( 'lib/**/*.js' ) ;


  // Iterate over each found code file to perform analysis.
  codeFiles . forEach ( function (   file  )
  {

    describe  ( file , function   ( )
    {

      // Resolve the absolute path for the current file.
      file    =   path . resolve ( file ) ;


      // Read the content of the file as UTF-8.
      var code = fs . readFileSync ( file , 'utf-8' ) ;


      // Perform the complexity analysis using escomplex-js.
      var analysis = esj . analyse ( code ) ;

      // Placeholder for future Halstead metrics checks.
      // TO-DO: analysis.aggregate.halstead -- Implement checks for Halstead complexity.

      /*
       * Now, let's examine the complexity of individual functions
       * found within this JavaScript file.
       */
      describe  ( 'functions' , function ( )
      {
        var fns   = analysis . functions   ||   [ ] ;

        fns . forEach ( function ( fn )
        {
          it  ( fn . name , function ( )
          {
            // Placeholder for Halstead checks.
            // TO-DO: add checks on fn.halstead -- Specific Halstead checks for functions.


            // Ensure cyclomatic complexity is below the defined maximum.
            expect  ( fn . cyclomatic ) . to . be . lessThan ( options . max_complexity ) ;

            // Verify cyclomatic density against the set threshold.
            expect  ( fn . cyclomaticDensity ) . to . be . lessThan ( options . max_cyclomatic_density ) ;
          } ) ;
        } ) ;
      } ) ;


      // Test to ensure the number of dependencies is within acceptable limits.
      it  ( 'dependencies' , function ( )
      {
        expect  ( analysis . dependencies . length ) . to . be . lessThan ( options . max_dependencies ) ;
      } ) ;


      // Test to ensure the overall maintainability index meets the minimum requirement.
      it  ( 'maintainability' , function ( )
      {
        expect  ( analysis . maintainability ) . to . be . greaterThan ( options . maintainability ) ;
      } ) ;

    } ) ;

  } ) ;

} ) ;