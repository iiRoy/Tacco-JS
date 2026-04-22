MyProg = Ember.Application.create();
/*
 * This section defines the routing configuration.
 * Currently, no specific routes are defined beyond the default.
 */
MyProg.Routing.configureRoutes(function() {
  // No custom routes yet
});

// Definition for the primary path in the application
MyProg.MainPath = Ember.Route.extend(
  {
    // Function to retrieve the data model for this route
    dataModel: function() {
      // Returning a static array of Ember objects
      return [
               Ember.Object.create({keyVal: '1', orderPos: 4}),
               Ember.Object.create({keyVal: '4', orderPos: 3}),
               Ember.Object.create({keyVal: '5', orderPos: 2}),
               Ember.Object.create({keyVal: '2', orderPos: 1}),
               Ember.Object.create({keyVal: '3', orderPos: 0})
      ]; // End of model array
    } // End of dataModel function
  } // End of extend object
); // End of MainPath definition

// Main controller responsible for managing the item array
MyProg.MainManager = Ember.ArrayController.extend(
  {
    // Properties used for sorting the array
    orderingProperties: ['orderPos'],

    // Method to update the order of items based on new positions
    refreshItemOrder: function(newPositions) {
      this.beginPropertyChanges(); // Start a batch of property changes

      // Iterate over each element in the controller's content
      this.forEach(function(element) {
        var position = newPositions[element.get('keyVal')]; // Get new position for this element
        element.set('orderPos', position); // Set the new order position
      }, this); // Ensure 'this' context is preserved

      this.endPropertyChanges(); // Conclude the batch of property changes
    }
  }
);

// View component for displaying the main interface elements
MyProg.MainDisplay = Ember.View.extend(
  {
    // Hook called after the element has been inserted into the DOM
    onRendered: function() {
      // Retrieve the associated controller instance
      var managerInstance = this.get('controller');

      // Initialize jQuery UI sortable on the designated DOM element
      this.$(".reorderable-list").sortable(
        {
          // Callback function triggered when the sort order is updated by user interaction
          onUpdate: function(eventObj, uiData) {
            var currentPositions = {}; // Object to store the new order mapping

            // Loop through each reorderable list element to determine its new index
            $(this).find('.list-element').each(function(loopIndex) {
              currentPositions[$(this).data('keyVal')] = loopIndex; // Map data key to its new index
            });

            // Revert the UI sortable changes visually, as the controller will handle the actual data update
            $(this).sortable('cancel');

            // Inform the controller to update its internal data model with the new order
            managerInstance.refreshItemOrder(currentPositions);
          } // End of onUpdate handler
        } // End of sortable options
      ); // End of sortable initialization
    } // End of onRendered hook
  } // End of extend object
); // End of MainDisplay definition