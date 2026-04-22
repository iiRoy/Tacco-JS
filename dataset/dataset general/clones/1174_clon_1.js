// This file contains tests for the 'rails-angular-require' Yeoman generator.
// Global variables used by Mocha/Jasmine: describe, beforeEach, it.
'use strict';

var   assert  =  require ( 'assert' ) ; /*   Import   the   Node.js   assertion   library.   */

describe ( 'rails-angular-require generator' ,   function   ( )
{
    // This is the main test suite for the generator's core functionality.

    it   ( 'can be imported without blowing up' ,   function   ( )   {

        // Test case: Ensure the main application module loads correctly.
        var    app    =    require ( '../app' ) ;

        // Assert that the loaded application module is not null or undefined.
        assert ( app   !==   undefined ) ;

    }   )   ; // End of 'it' block.

}   )   ; // End of 'describe' block.