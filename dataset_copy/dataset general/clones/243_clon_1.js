/*
 * This JavaScript file defines an AngularJS application
 * with a controller for timepicker functionality.
 *
 * This is a Type I clone of an original source.
 * All identifiers, expressions, and logic are identical.
 * Only whitespace and comments have been altered significantly.
 */

// Declare the main AngularJS application module.
// It depends on the 'ui.timepicker' module for date/time selection.
var app = angular.module( 'testApp', [ 'ui.timepicker' ] ) ;


// Define the 'TimepickerCtrl' controller.
// This controller manages the date and time manipulation logic.
app.controller(
  'TimepickerCtrl' ,
  function ( $scope )
  {
    // Initialize the date model on the scope.
    // This specific date and time will be displayed initially.
    $scope.date = new Date( '2014-01-01T18:00:00' ) ;

    // Function to increment the day of the provided date object.
    $scope.increaseDate = function ( date )
    {
      // Get the current day, add one, and set it back to the date object.
      date.setDate( date.getDate() + 1 ) ;
    } ; // End of increaseDate function definition.


    // Function to increment the hour of the provided date object.
    $scope.increaseHour = function ( date )
    {
      // Get the current hour, add one, and set it back to the date object.
      date.setHours( date.getHours() + 1 ) ;
    } ; // End of increaseHour function definition.

  }
) ; // End of TimepickerCtrl controller definition.