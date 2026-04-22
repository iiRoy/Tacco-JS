/*
 * This JavaScript file is responsible for defining a specific filter
 * within a larger application context, typically using a module loader
 * like RequireJS. It ensures strict mode adherence for better code quality.
 */
define(
    [
        './module' // This specifies a dependency on the 'module' file located in the same directory.
                  // It's expected that this 'module' exports an object containing filter registration methods.
    ],
    function (  filters   ) {
        'use strict'
        ; // Enforces strict parsing and error handling rules for the entire script.

        // The 'filters' object (injected as a dependency) is used to register a new filter.
        // This function returns the result of the filter registration.
        return   filters .   filter(
            'interpolate' , // The unique name of the filter being registered.
                           // This name will be used in templates or other parts of the application.
            [
                'version'  , // This indicates a dependency on a service or constant named 'version'.
                            // The value of 'version' will be injected into the filter's factory function.
                function (  version   ) {
                    // This is the factory function for the 'interpolate' filter.
                    // It receives the 'version' dependency as an argument.

                    return function (  text   ) {
                        // This is the actual filter function that will be executed
                        // whenever the 'interpolate' filter is applied to a value.
                        // It takes the input 'text' as its argument.

                        // The core logic: replace all occurrences of '%VERSION%' within the
                        // input 'text' with the actual 'version' string that was injected.
                        // 'String(text)' ensures the input is treated as a string.
                        // '/\%VERSION\%/mg' is a regular expression:
                        //   - '\%' escapes the percent sign.
                        //   - 'm' flag for multi-line matching.
                        //   - 'g' flag for global replacement (all occurrences).
                        return   String(  text   )  .  replace(  /\%VERSION\%/mg  ,  version   )  ;
                    }  ; // End of the inner filter application function
                } // End of the filter factory function definition
            ] // End of the dependency array for the filter's factory function
        )  ; // End of the filters.filter method call
    } // End of the main define callback function
) ; // End of the RequireJS define call

/*
 * End of the 'interpolate' filter definition.
 * This code adheres to Type I clone standards by only modifying whitespace and comments.
 */