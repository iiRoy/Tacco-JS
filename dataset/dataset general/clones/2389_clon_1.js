/*
 * This file contains an Angular.js module definition for ngTagEditor.
 * It includes a custom filter and two directives: 'focusMe' and 'tagEditor'.
 *
 * Original code source: [Insert original source or context if known]
 * Type I clone generated for demonstration purposes.
 */

'use strict'
; // Enforce strict mode for better code quality.


// Define the Angular module named 'ngTagEditor' with no dependencies.
angular .
    module  (   'ngTagEditor'   ,   [ ]   )


    // --- FILTER DEFINITION: getCol ---
    // This filter extracts a specific column (property) from an array of objects
    // and joins them into a comma-separated string.
    .filter  (   'getCol'   ,   function( )
    {
        // The filter function itself returns another function that performs the actual filtering.
        return  function   (   items   ,   row   )
        {
            // Ensure items is not null or undefined before proceeding.
            // If items exist, map each item to its specified 'row' property,
            // then join the resulting array elements with a comma.
            return  items
                &&  items
                    .map   (   function   (   item   )
                    {
                        return  item[row]
                        ;   // Return the value of the specified property.
                    }   )
                    .join  (   ','   )
            ; // End of map and join operations.
        }
        ; // End of inner filter function.
    }   )


    // --- DIRECTIVE DEFINITION: focusMe ---
    // This directive provides a way to programmatically set focus on an element.
    // It watches an expression and focuses the element when the expression evaluates to true.
    .directive  (   'focusMe'   ,
        [   '$timeout'   ,   '$parse'   ,   function   (   $timeout   ,   $parse   )
        {
            // The directive definition object is returned here.
            return  {
                link:   function   (   scope   ,   element   ,   attrs   )
                {
                    // Parse the expression provided in the 'focusMe' attribute.
                    // This allows binding to a scope variable.
                    var model   =   $parse  (   attrs.focusMe   )
                    ;

                    // Set up a watch on the parsed model expression.
                    scope.$watch (   model   ,   function   (   value   )
                    {
                        // If the watched value becomes true, focus the element.
                        if   (   value   ===   true   )
                        {
                            // Use $timeout to ensure the DOM is ready before focusing.
                            $timeout   (   function   (   )
                            {
                                element[0].focus  (   )
                                ; // Programmatically set focus on the native DOM element.
                            }   )
                            ;
                        }
                    }   )
                    ; // End of $watch.

                    // Bind a blur event listener to the element.
                    // When the element loses focus, set the model expression back to false.
                    element.bind  (   'blur'   ,   function   (   )
                    {
                        // Apply changes to the scope.
                        scope.$apply   (   model.assign   (   scope   ,   false   )   )
                        ; // Assign false to the model expression.
                    }   )
                    ; // End of bind('blur').
                }
            }
            ; // End of directive definition object.
        }   ]   )


    // --- DIRECTIVE DEFINITION: tagEditor ---
    // This directive implements a tag input editor with suggestions and dynamic tag management.
    .directive  (   'tagEditor'   ,   function   (   )
    {
        // Return the directive definition object.
        return  {
            restrict:   'AE'   ,   // Restrict to attribute or element usage.
            /* Original comment: require: 'ngModel', */ // This line was commented out in the source.
            scope:   {
                tags:   '=ngModel'   // Two-way data binding for the 'tags' array via ngModel.
            }   ,
            replace:   true   ,   // Replace the directive element with the template.
            templateUrl:   'ngTagEditor.html'   ,   // Path to the HTML template for the directive.

            // Controller function for the directive.
            controller:
                [   '$scope'   ,   '$attrs'   ,   '$element'   ,   '$http'   ,   '$filter'   ,
                    function   (   $scope   ,   $attrs   ,   $element   ,   $http   ,   $filter   )
                    {
                        // Initialize options object for the tag editor.
                        $scope.options   =   [ ]
                        ;

                        // Set default values for options, allowing override via attributes.
                        $scope.options.output   =   $attrs.output   ||   'name'
                        ; // Property to use for output display.
                        $scope.options.fetch   =   $attrs.fetch   ||   'suggestions.php?q='
                        ; // URL for fetching suggestions.
                        $scope.options.placeholder   =   $attrs.placeholder   ||   'Enter a few letters...'
                        ; // Placeholder text for the input field.
                        $scope.options.apiOnly   =   $attrs.apiOnly   ||   false
                        ; // If true, only allow tags from API suggestions.

                        // Initialize the search input model.
                        $scope.search   =   ''
                        ;


                        // Watch for changes in the 'search' model to fetch suggestions.
                        $scope.$watch   (   'search'   ,   function   (   )
                        {
                            // Make an HTTP GET request to fetch suggestions.
                            $http.get   (   $scope.options.fetch   +   $scope.search   )
                                .success   (   function   (   data   )
                                {
                                    // Assign fetched data to suggestions.
                                    $scope.suggestions   =   data.data
                                    ;
                                    // Original comment: /* console.log(data); */
                                    // This line was commented out in the source.
                                }   )
                            ;
                        }   )
                        ; // End of $watch('search').

                        // Function to add a new tag to the tags array.
                        $scope.add   =   function   (   id   ,   name   )
                        {
                            $scope.tags.push   (   {   'id'   :   id   ,   'name'   :   name   }   )
                            ; // Add new tag object.
                            $scope.search   =   ''
                            ; // Clear the search input after adding.
                            $scope.$apply   (   )
                            ; // Manually trigger a digest cycle to update UI.
                        }
                        ;

                        // Function to remove a tag by its index.
                        $scope.remove   =   function   (   index   )
                        {
                            $scope.tags.splice   (   index   ,   1   )
                            ; // Remove one element at the specified index.
                        }
                        ;


                        // Bind a keydown event listener to the input element within the directive.
                        $element.find   (   'input'   )
                            .on   (   'keydown'   ,   function   (   e   )
                            {
                                // Define an array of key codes to listen for: Backspace, Enter, Space.
                                var keys   =   [   8   ,   13   ,   32   ]
                                ;

                                // Check if the pressed key is one of the defined keys.
                                if   (   keys.indexOf   (   e.which   )   !==   -1   )
                                {
                                    // Handle Backspace key.
                                    if   (   e.which   ==   8   )
                                    {   /* This is the backspace key */
                                        // If search input is empty and there are existing tags.
                                        if   (   $scope.search.length   ===   0   &&   $scope.tags.length   )
                                        {
                                            $scope.tags.pop   (   )
                                            ; // Remove the last tag.
                                            e.preventDefault   (   )
                                            ; // Prevent default backspace behavior (e.g., navigating back).
                                        }
                                    }
                                    // Handle Space or Enter key.
                                    else   if   (   e.which   ==   32   ||   e.which   ==   13   )
                                    {   /* This is either a space key or an enter key */
                                        // If search input has content and API-only mode is not active.
                                        if   (   $scope.search.length   &&   !$scope.options.apiOnly   )
                                        {
                                            // Redundant check, but present in original code.
                                            if   (   !$scope.options.apiOnly   )
                                            {
                                                $scope.add   (   0   ,   $scope.search   )
                                                ; // Add the current search input as a new tag.
                                                e.preventDefault   (   )
                                                ; // Prevent default behavior (e.g., form submission, space insertion).
                                            }
                                        }
                                    }
                                    // Manually apply changes to the scope after keydown event.
                                    $scope.$apply   (   )
                                    ;
                                }
                            }   )
                        ; // End of on('keydown').

                    }   ]   // End of controller function definition.
        }
        ; // End of directive definition object.
    }   )
; // End of angular.module chain.