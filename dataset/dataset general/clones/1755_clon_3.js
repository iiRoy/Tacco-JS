const SortableApplication = Ember.Application.create();

SortableApplication.PathResolver = Ember.Router.extend({
  // No specific routes are defined for this basic example.
  // The default "index" route handles the primary display.
});

SortableApplication.InitialDataLoader = Ember.Route.extend({
  /**
   * Retrieves and structures the primary data entries for display.
   * @returns {Array<Ember.Object>} An array of structured data objects.
   */
  retrieveDataEntries: function() {
    // Helper function to create an Ember object with unique ID and sequence.
    const createDataObject = (identifier, sequence) => {
      // Basic validation: ensure identifier is a string.
      if (typeof identifier !== 'string') {
        console.warn('Invalid identifier provided, converting to string.');
        identifier = String(identifier);
      }
      return Ember.Object.create({
        uniqueIdentifier: identifier,
        currentSequence: sequence
      });
    };

    // Define the raw data structure.
    const rawData = [
      { idVal: 'alpha', seq: 4 },
      { idVal: 'beta', seq: 3 },
      { idVal: 'gamma', seq: 2 },
      { idVal: 'delta', seq: 1 },
      { idVal: 'epsilon', seq: 0 }
    ];

    // Transform raw data into Ember objects using the helper.
    const structuredData = rawData.map(item =>
      createDataObject(item.idVal, item.seq)
    );

    return structuredData;
  }
});

SortableApplication.DataArrangementManager = Ember.ArrayController.extend({
  // Specifies the property used for sorting the displayed items.
  orderingCriteria: ['currentSequence'],

  /**
   * Applies new positional data to the managed collection of items.
   * This method updates the 'currentSequence' property of each item
   * based on the provided map of new positions.
   *
   * @param {Object<string, number>} newPositionsMap - A mapping from
   *   unique identifiers to their new sequence positions.
   */
  applyNewArrangement: function(newPositionsMap) {
    // A guard clause to ensure a valid map is provided.
    if (!newPositionsMap || typeof newPositionsMap !== 'object') {
      console.error('New positions map is invalid or missing.');
      return;
    }

    // Begin a batch of property changes for performance optimization.
    this.beginPropertyChanges();

    // Iterate over each item currently within this controller's content.
    this.get('content').forEach(function(itemEntry) {
      const itemIdentifier = itemEntry.get('uniqueIdentifier');
      const assignedRank = newPositionsMap[itemIdentifier];

      // Only update if a valid new rank is found for the item.
      if (typeof assignedRank === 'number' && assignedRank >= 0) {
        itemEntry.set('currentSequence', assignedRank);
      } else {
        // Optional: Log if an item's position isn't found in the map.
        console.warn(`Position for item '${itemIdentifier}' not found or invalid.`);
      }
    });

    // End the batch of property changes, triggering observers if any.
    this.endPropertyChanges();
  }
});

SortableApplication.DraggableItemsDisplay = Ember.View.extend({
  // Lifecycle hook: executed after the view's element has been inserted into the DOM.
  postInsertionSetup: function() {
    const dataHandler = this.get('controller'); // Reference to the associated controller.
    const sortableContainerSelector = ".sortable-elements-container";
    const sortableContainer = this.$(sortableContainerSelector);

    // Initialize jQuery UI Sortable plugin on the designated container.
    sortableContainer.sortable({
      // Event handler for when the sorting order is updated by user interaction.
      update: function(domEvent, uiDetails) {
        // Object to store the new visual sequence of items.
        const calculatedPositions = {};
        const currentSortableElement = $(this); // The current sortable DOM element.

        // Iterate over each child item to determine its new index.
        currentSortableElement.find('.draggable-item').each(function(visualIndex) {
          const itemDomElement = $(this);
          const itemUniqueId = itemDomElement.data('identifier'); // Get unique ID from data attribute.

          // Store the visual index mapped to the item's unique ID.
          if (itemUniqueId) {
            calculatedPositions[itemUniqueId] = visualIndex;
          } else {
            console.warn('Draggable item missing data-identifier attribute.');
          }
        });

        // Revert the visual change immediately to let the controller manage the state.
        // This prevents flicker and ensures the DOM state reflects the data state precisely.
        currentSortableElement.sortable('cancel');

        // Pass the new positions to the controller for data model updates.
        dataHandler.applyNewArrangement(calculatedPositions);
      }
    });
  }
});

SortableApplication.PathResolver.map(function() {
  // Routes are intentionally left undefined for this demonstration.
  // The application relies on Ember's default 'index' route.
});