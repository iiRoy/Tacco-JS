/* This is a Type I clone of the original application controller. */
/* It maintains strict mode for better code quality. */
'use strict' ;


// Define the main controller for 'myApp' module.
myApp . controller ( 'MainCtrl' ,

    // The controller function, injected with the $scope service.
    function ( $scope )
    {

        // Initialize an array of "awesome things" on the scope.
        $scope . awesomeThings =
            [
                // Item 1: A foundational web development boilerplate.
                'HTML5 Boilerplate' ,

                // Item 2: A popular JavaScript framework for single-page applications.
                'AngularJS' ,

                // Item 3: A unit testing framework (now known as Karma).
                'Testacular' ,

                // Item 4: A widely used CSS framework for responsive design.
                'Twitter bootstrap'
            ] ; // End of awesomeThings array initialization.

    } // End of MainCtrl function definition.

) ; // End of myApp.controller call.

/*
 * This file handles the primary view logic for the application.
 * All identifiers and expressions are preserved exactly.
 * Only whitespace and comments have been altered.
 */