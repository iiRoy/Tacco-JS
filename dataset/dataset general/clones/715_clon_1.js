/* This IIFE (Immediately Invoked Function Expression) encapsulates
 * all the application's JavaScript code to prevent global variable
 * pollution.
 */
( function ( ) {

    // Declaration of a variable to hold the application's name.
    var   appName   ;


    // --- Module: phonecatServices ---
    // This module defines services for the phonecat application.
    angular . module ( 'phonecatServices' , [ 'ngResource' ] )

        // The 'Grails' service provides methods to interact with a Grails backend.
        . service ( 'Grails' , function ( $resource ) {

            // The service returns an object containing its public API.
            return {

                /**
                 *  Retrieves a resource object from the backend using ngResource.
                 *  @param {object} scope - The scope object, expected to contain controller, action, and id.
                 *  @returns {object} A ngResource instance configured for the Grails endpoint.
                 */
                getResource : function ( scope ) {

                    /*
                     *  Constructs the resource URL dynamically.
                     *  The appName variable is interpolated into the URL path.
                     */
                    return $resource (
                        "/" + appName + "/:controller/:action/:id" ,
                        {
                            controller : scope . controller || '' ,
                            action     : scope . action     || '' ,
                            id         : scope . id         || ''
                        } ,
                        // Empty action parameter object, common for ngResource.
                        function ( ) {
                            /* No custom methods defined here. */
                        }
                    ) ; // End of $resource call
                } // End of getResource function
            } ; // End of service return object
        } ) ; // End of Grails service definition


    // --- Module: phonecatFilters ---
    // This module defines custom filters for the phonecat application.
    angular . module ( 'phonecatFilters' , [ ] )

        // The 'checkmark' filter transforms boolean values into visual check/cross marks.
        . filter ( 'checkmark' , function ( ) {

            /**
             *  The actual filter function.
             *  @param {boolean} input - The boolean value to be filtered.
             *  @returns {string} Unicode checkmark (✓) for true, or cross mark (✗) for false.
             */
            return function ( input ) {

                // Check if the input value is truthy.
                if ( input ) {
                    return '\u2713' ; // Unicode for checkmark
                }

                // If input is falsy.
                else {
                    return '\u2718' ; // Unicode for cross mark
                }
            } ; // End of filter function
        } ) ; // End of checkmark filter definition


    // --- Controller: PhoneListCtrl ---
    // This controller manages the phone list view.
    this . PhoneListCtrl = function ( $scope , Grails ) {

        // Fetch the list of phones using the Grails service.
        $scope . phones = Grails . getResource ( $scope ) . query ( {
            action : 'query' // Specify the 'query' action for fetching multiple items.
        } ) ;

        // Set the default ordering property for the phone list.
        return $scope . orderProp = 'age' ;
    } ; // End of PhoneListCtrl definition


    // --- Controller: PhoneDetailCtrl ---
    // This controller manages the phone detail view.
    this . PhoneDetailCtrl = function ( $scope , Grails ) {

        // Fetch a single phone's details using the Grails service.
        $scope . phone = Grails . getResource ( $scope ) . get (
            {
                action : 'query' // Specify the 'query' action, often used for single item retrieval too.
            } ,
            // Callback function executed upon successful data retrieval.
            function ( phone ) {
                // Set the main image for the phone detail view.
                return $scope . setMainImage ( phone . images [ 0 ] ) ;
            }
        ) ; // End of $resource.get call


        /**
         *  Sets the main image URL on the scope.
         *  @param {string} imageUrl - The URL of the image to display.
         *  @returns {string} The updated main image URL.
         */
        return $scope . setMainImage = function ( imageUrl ) {
            return $scope . mainImageUrl = imageUrl ;
        } ;
    } ; // End of PhoneDetailCtrl definition


    // Assign the application name. This must be done after its declaration.
    appName = 'phonecat' ;


    // --- Main Application Module ---
    // This is the main module for the 'phonecat' application.
    // It depends on the 'phonecatFilters' and 'phonecatServices' modules.
    angular . module ( appName , [ 'phonecatFilters' , 'phonecatServices' ] ) ;

// Invoke the IIFE, binding 'this' to the global context (window in browsers).
} ) . call ( this ) ;