/*
 * This file defines the Ember.js application structure and components.
 * It sets up the main application object, routing, and a sortable list feature.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */


App =
  Ember.Application.create(); // Initialize the Ember application instance.


// Define the application's routing map.
App.Router.map(function() {

  // No specific routes are defined here,
  // Ember will use convention-over-configuration for the 'index' route.

}); // End of router mapping function.


// Define the route for the 'index' path.
App.IndexRoute = Ember.Route.extend({
  // The model hook returns the data to be displayed by the route.
  model: function() {
    // Return an array of Ember objects, each with an 'id' and 'idx' property.
    return [
      Ember.Object.create({
        id: '1',
        idx: 4
      }), // First item
      Ember.Object.create({
        id: '4',
        idx: 3
      }), // Second item
      Ember.Object.create({
        id: '5',
        idx: 2
      }), // Third item
      Ember.Object.create({
        id: '2',
        idx: 1
      }), // Fourth item
      Ember.Object.create({
        id: '3',
        idx: 0
      }) // Fifth item
    ];
  } // End of model function
}); // End of IndexRoute definition.


// Define the controller for the 'index' route, extending Ember.ArrayController.
App.IndexController = Ember.ArrayController.extend({

  // Specifies the properties by which the array controller should sort its content.
  sortProperties: ['idx'], // Sort by the 'idx' property.


  /**
   * Updates the 'idx' property of each item in the controller's content
   * based on the provided new indexes.
   *
   * @param {Object} indexes - An object mapping item IDs to their new 'idx' values.
   */
  updateSortOrder: function(indexes) {
    // Begin a batch of property changes for performance.
    this.beginPropertyChanges();

    // Iterate over each item currently managed by this controller.
    this.forEach(function(item) {
      // Get the new index for the current item using its ID.
      var index = indexes[item.get('id')];
      // Set the 'idx' property of the item to its new value.
      item.set('idx', index);
    }, this); // Ensure 'this' context is the controller inside the forEach callback.

    // End the batch of property changes.
    this.endPropertyChanges();
  } // End of updateSortOrder function.
}); // End of IndexController definition.


// Define the view for the 'index' route, extending Ember.View.
App.IndexView = Ember.View.extend({
  /**
   * Called once the view has been inserted into the DOM.
   * This is where DOM manipulation logic, like initializing jQuery UI sortable,
   * should typically reside.
   */
  didInsertElement: function() {
    // Retrieve the controller associated with this view.
    var controller = this.get('controller');

    // Initialize the jQuery UI sortable plugin on the element with class "sortable".
    this.$(".sortable").sortable({
      // The 'update' event is triggered when the user stops sorting and the DOM position has changed.
      update: function(event, ui) {
        // Create an empty object to store the new order of items.
        var indexes = {};

        // Iterate over each '.item' element within the sortable container.
        // 'index' represents the 0-based position of the item in the sorted list.
        $(this).find('.item').each(function(index) {
          // Store the new index, using the item's data-id as the key.
          indexes[$(this).data('id')] = index;
        });

        // Cancel the sortable action to prevent jQuery UI from re-arranging the DOM.
        // The Ember controller will handle the data update and subsequent re-rendering.
        $(this).sortable('cancel');

        // Call the controller's method to update the sort order based on the new indexes.
        controller.updateSortOrder(indexes);
      } // End of update event handler.
    }); // End of sortable initialization.
  } // End of didInsertElement function.
}); // End of IndexView definition.