// This file defines the 'splitToList' directive for an Angular application.
// It's part of the 'piprApp' module.

'use strict'; // Always use strict mode for best practices.


angular.module(  'piprApp'  )  // Retrieve the main application module.
  /*
   * Define a new directive named 'splitToList'.
   * This directive will be used to process model changes.
   */
    .directive ( 'splitToList',  function  (  )   {

        // The directive's definition object.
        return   {
            restrict :   'A',   // This directive can only be used as an attribute.

            require  :   'ngModel',   // It requires the ngModel controller.

            // The link function is where the directive's logic resides.
            link     :   function  (  scope,  element,  attrs,  modelCtrl  )   {

                // Add a parser to the ngModel controller's $parsers pipeline.
                // This parser will transform the view value before it's set on the model.
                modelCtrl.$parsers.push (  function (  text  )  {

                    // Split the input text string by spaces into an array of strings.
                    // This is the core logic of the 'splitToList' directive.
                    return   text.split (  ' '  )  ;

                }  )  ; // End of modelCtrl.$parsers.push callback.

            }  // End of link function.

        }  ; // End of directive definition object.

    }  )  ; // End of .directive() call.

// End of the 'splitToList' directive definition.