/*
 * This is a Type I clone of an AngularJS application module.
 * It demonstrates an application setup with a controller and data models.
 * The original code's logic and identifiers are preserved exactly.
 *
 * This version includes extensive changes to whitespace and comments
 * to appear visually different while maintaining identical functionality.
 */

// Define the AngularJS module named 'app'
angular.module(
  'app', // The name of our primary application module

  // Include required dependencies for this module.
  // 'ui.multiselect' is an example of an external UI component.
  [
    'ui.multiselect' // Add the 'ui.multiselect' dependency here
  ]
)

// Chain a controller definition to the module.
// This controller manages the data and logic for a specific view or section.
.controller(
  'appCtrl', // The name of our application controller

  // Use array notation for dependency injection to avoid minification issues.
  [
    '$scope', // Inject the $scope service, which is essential for data binding.

    // This is the controller's main function, executed when the controller is initialized.
    function (
      $scope // The $scope object is passed as an argument.
    ) {
      // --- Data Models for the View ---

      // Initialize an array of car objects.
      // Each object has an 'id' and a 'name'.
      $scope.cars = [
        { id: 1, name: 'Audi' },    // First car entry
        { id: 2, name: 'BMW' },     // Second car entry
        { id: 3, name: 'Honda' }    // Third car entry
      ]; // This array will be used to populate a list of available cars.

      // Initialize an empty array to hold the user's selected cars.
      // This is often used with multi-select components.
      $scope.selectedCar = [];      // Stores the currently selected car(s).

      // Initialize another array, this time for fruit objects.
      $scope.fruits = [
        { id: 1, name: 'Apple' },   // A common fruit
        { id: 2, name: 'Orange' },  // Another popular fruit
        { id: 3, name: 'Banana' }   // And a third one
      ]; // This array provides a list of fruit options.

      // Initialize the selected fruit to null.
      // This is typical for single-select scenarios where nothing is selected initially.
      $scope.selectedFruit = null;  // Holds the user's single fruit selection.

      // End of controller logic.
    } // Closing bracket for the controller function.
  ]
); // Closing bracket for the controller definition and module chain.