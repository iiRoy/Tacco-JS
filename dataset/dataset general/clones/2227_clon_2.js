(function() {
  "use strict"; // Enforce strict mode for better code quality.

  // Declare the primary AngularJS module for managing page navigation.
  var pageNavEngine = angular.module('easyNavigator', []);

  // Define the 'PagingService' factory to provide pagination functionalities.
  pageNavEngine.factory('PagingService', function() {

    // Create a local object to hold the service's methods.
    var navService = {};

    /**
     * Generates a new page controller instance based on the specified items per screen.
     * @param {number} itemsPerScreen - The desired number of items to display on each screen.
     * @returns {object} A newly configured page controller object.
     */
    navService.createInstance = function(itemsPerScreen) {

      // Set a default value for itemsPerScreen if it's not provided.
      itemsPerScreen = itemsPerScreen === undefined ? 5 : itemsPerScreen;

      // Construct the core page controller object with initial properties.
      var pageController = {
        pageCount: 1, // Represents the total available screens.
        itemsPerScreen: itemsPerScreen, // The count of elements to show per screen.
        activePageIndex: 0 // The zero-based index of the current screen.
      };

      /**
       * Moves the current screen back by one position, if not already on the first screen.
       */
      pageController.decrementPage = function() {
        if (pageController.activePageIndex > 0) {
          pageController.activePageIndex -= 1;
        }
      };

      /**
       * Advances the current screen forward by one position, if not already on the last screen.
       */
      pageController.incrementPage = function() {
        if (pageController.activePageIndex < pageController.pageCount - 1) {
          pageController.activePageIndex += 1;
        }
      };

      /**
       * Navigates directly to a specified screen index.
       * @param {number} targetIndex - The zero-based index of the screen to jump to.
       */
      pageController.setPageIndex = function(targetIndex) {
        if (targetIndex >= 0 && targetIndex <= pageController.pageCount - 1) {
          pageController.activePageIndex = targetIndex;
        }
      };

      // Return the fully configured page controller instance.
      return pageController;
    };

    // Return the service object containing the instance creation method.
    return navService;
  });

  // Define an AngularJS filter named 'skipItems' to slice an array.
  pageNavEngine.filter('skipItems', function() {
    return function(collection, offsetCount) {
      // If the input collection is not defined, return it without modification.
      if (collection === undefined) {
        return collection;
      } else {
        // Return a new array containing elements from the specified offset onwards.
        return collection.slice(+offsetCount);
      }
    };
  });

  // Define an AngularJS filter named 'numberRange' to generate a sequence of numbers.
  pageNavEngine.filter('numberRange', function() {
    return function(dataArray, limitValue) {
      // Ensure the limitValue is treated as an integer.
      limitValue = parseInt(limitValue);
      // Loop from zero up to the limit and push each number into the dataArray.
      for (var counter = 0; counter < limitValue; counter++) {
        dataArray.push(counter);
      }
      // Return the modified array containing the numeric sequence.
      return dataArray;
    };
  });

})();