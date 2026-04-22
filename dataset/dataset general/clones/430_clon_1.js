/*
 * This file contains a Type I clone of a JavaScript unit test.
 * The original code has been altered only in whitespace and comments
 * to demonstrate Type I code cloning.
 */
"use strict" ; // Enforce strict mode for the entire script.

// Define a test suite for the 'TasksController'.
describe( "Controller: TasksController" , function ( ) {

    // Declare variables to hold the scope and controller instance.
    var scope ,
        tasksController ;

    // This block runs before each test spec.
    beforeEach( function ( ) {
        /*
         * Load the 'angtsApp' module for testing.
         * We also mock the 'taskService' dependency here.
         */
        module( "angtsApp" , function ( $provide ) {
            $provide.value( "taskService" , mocks.taskService ) ;
        } ) ;
    } ) ;

    // Another beforeEach block, using Angular's 'inject' to get services.
    beforeEach( inject( function ( $controller ) {
        // Initialize an empty scope object.
        scope = { } ;
        /*
         * Instantiate the 'TasksController' with the mocked scope.
         * This simulates how Angular would create the controller.
         */
        tasksController = $controller( "TasksController" , {
            $scope : scope
        } ) ;
    } ) ) ;

    // Define a specific test case (spec).
    it( "has the correct number of tasks" , function ( ) {
        // Declare a variable to hold the tasks, initially undefined.
        var tasks = undefined ;

        // The 'runs' block executes immediately.
        runs( function ( ) {
            // Assign the tasks from the controller's scope.
            tasks = scope.tasks ;
        } ) ;

        /*
         * The 'waitsFor' block pauses execution until its condition is met
         * or a timeout occurs. Here, we wait for 'tasks' to be defined.
         */
        waitsFor( function ( ) {
            return tasks !== undefined ;
        } , 500 ) ; // Timeout after 500 milliseconds.

        // This 'runs' block executes after 'waitsFor' condition is met.
        runs( function ( ) {
            // Assert that the length of the tasks array is 2.
            expect( tasks.length ).toBe( 2 ) ;
        } ) ;
    } ) ;

} ) ; // End of the 'TasksController' test suite.