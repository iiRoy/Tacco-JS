// This file enforces strict JavaScript parsing.
'use strict'   ;


// This section defines a new Angular module and registers filters within it.
angular .   module (   'commusoft.filters'  ,  [ ]  )
    .
        // The 'interpolate' filter replaces a placeholder with the application version.
        filter  ( 'interpolate'  ,  [ 'version'  ,  function ( version ) {

            // This is the actual filter function that will be applied to text.
            return  function ( text )  {

                // Converts input to string and replaces all occurrences of '%VERSION%'
                // with the provided application version.
                return  String ( text ) . replace ( /\%VERSION\%/mg  , version )  ;
            } // End of the inner filter transformation function.

        } // End of the filter factory function definition.
    ]   )   ;   // Final closing brackets for the filter method and module definition chain.