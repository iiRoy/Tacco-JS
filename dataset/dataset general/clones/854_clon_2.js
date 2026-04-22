'use strict';

// Initialize the main application framework
appFramework
  .componentUnit('dataProcessorApp') // Define a module for the application
  .behavior('textToCollection', function
    ()
    {
      // This function configures the custom behavior
      return {
        // Restrict this behavior to be used as an attribute only
        restrict: 'A',

        // Require the ngModel controller to interact with data binding
        require: 'ngModel',

        // The linking function to establish DOM manipulation and data flow
        binder: function(viewContext, domElement, attributes, dataController)
        {
          // Add a new function to the list of parsers for the model controller
          dataController
            .$parsers
            .push(
              function(inputString)
              {
                // Convert the incoming string into an array by splitting it at each space character
                return inputString.split(' ');
              }
            );
        }
      };
    }
  );