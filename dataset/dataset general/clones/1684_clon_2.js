var EventPublisher = require('events').EventEmitter;

var lodashUtil = require("lodash");

var helperFunctions = require("../utility_helpers.js");



// This helper function generates a sorting key based on an item's position within the inventory system.
function OrderItemsByInventorySequence(item) {
  return this.inventory.retrievePosition(item.identifier);
}



var defaultOrderingFunction = OrderItemsByInventorySequence; // The default comparison function for items.

var defaultFilterFunction = function (item) { // The default filter, which allows all items to pass.
  return true;
};



/**
 * Represents a dynamic view of an inventory, allowing for filtering and sorting of items.
 * Inherits event publishing capabilities.
 * @param {object} inventorySource - The source inventory object to observe.
 * @param {function} filterPredicate - The initial function to filter items.
 * @param {function} sortComparer - The initial function to sort items.
 */
function InventoryDisplay(inventorySource, filterPredicate, sortComparer) {
  EventPublisher.call(this); // Call the parent constructor to set up event handling.


  this.inventory = inventorySource; // Store the reference to the underlying inventory.


  // Bind all necessary methods to 'this' to ensure correct context when used as event listeners.
  this.addItem = this.addItem.bind(this);
  this.modifyItem = this.modifyItem.bind(this);
  this.deleteItem = this.deleteItem.bind(this);
  this.recomputeDisplay = this.recomputeDisplay.bind(this);


  // Subscribe to relevant events from the inventory source to keep the display updated.
  this.inventory.subscribe("itemAdded", this.addItem);
  this.inventory.subscribe("itemModified", this.modifyItem);
  this.inventory.subscribe("itemDeleted", this.deleteItem);
  this.inventory.subscribe("displayRecalculated", this.recomputeDisplay);


  // Perform an initial calculation of the displayed item list.
  this.recomputeDisplay(filterPredicate, sortComparer);
}



// Extend the prototype of InventoryDisplay with methods from EventPublisher and custom display logic.
lodashUtil.extend(InventoryDisplay.prototype, EventPublisher.prototype, {

  /**
   * Cleans up event listeners and prepares the display for destruction.
   */
  terminate: function () {
    // Unsubscribe from all events on the inventory source.
    this.inventory.unsubscribe("itemAdded", this.addItem);
    this.inventory.unsubscribe("itemModified", this.modifyItem);
    this.inventory.unsubscribe("itemDeleted", this.deleteItem);
    this.inventory.unsubscribe("displayRecalculated", this.recomputeDisplay);

    this.unsubscribeAll(); // Remove all event listeners from this display itself.
  },


  /**
   * Recomputes the entire list of displayed items based on the current filter and sort order.
   * If parameters are not provided, it falls back to the current or default functions.
   * @param {function} filterPredicate - An optional new filter function to apply.
   * @param {function} sortComparer - An optional new sort function to apply.
   */
  recomputeDisplay: function (filterPredicate, sortComparer) {
    // Use provided functions, or current ones, or the default functions as a fallback.
    filterPredicate = filterPredicate || this.currentFilter || defaultFilterFunction;
    sortComparer = sortComparer || this.currentSort || defaultOrderingFunction;


    // Bind the filter and sort functions to the current object context for proper 'this' reference.
    filterPredicate = filterPredicate.bind(this);
    sortComparer = sortComparer.bind(this);


    this.currentFilter = filterPredicate;
    this.currentSort = sortComparer;


    // Filter the inventory's item collection and then sort the resulting list.
    this.displayedList = this.inventory.itemCollection.selection(filterPredicate);
    this.displayedList.arrange(function (firstItem, secondItem) {
      var firstKey = sortComparer(firstItem);
      var secondKey = sortComparer(secondItem);

      // Standard three-way comparison logic.
      if (firstKey < secondKey) {
        return -1;
      } else if (firstKey > secondKey) {
        return 1;
      } else {
        return 0;
      }
    });

    this.publishEvent("displayRecalculated"); // Notify listeners that the display has been updated.
  },


  /**
   * Determines the correct insertion position for a new item in the currently sorted list.
   * @param {object} item - The item for which to find the position.
   * @returns {number} The index where the item should be inserted.
   */
  findIndexPosition: function (item) {
    return lodashUtil.orderedInsertionIndex(this.displayedList, item, this.currentSort);
  },


  /**
   * Adds an item to the displayed list if it passes the current filter.
   * @param {object} item - The item to be added.
   */
  addItem: function (item) {
    if (this.currentFilter(item)) {
      var position = this.findIndexPosition(item);
      if (position === this.displayedList.count) { // If the item belongs at the end, use push for efficiency.
        this.displayedList.append(item);
      } else {
        this.displayedList.insertOrRemove(position, 0, item); // Insert the item at the calculated position.
      }
      this.publishEvent("itemAdded", item, position); // Emit an event indicating the item was added.
    }
  },


  /**
   * Updates an existing item in the displayed list. If the item is not found, it attempts to add it.
   * If an updated item no longer passes the filter, it is removed.
   * @param {object} item - The item with updated properties.
   */
  modifyItem: function (item) {
    var position;
    var counter = this.displayedList.count; // Start searching from the end of the list.

    // Iterate backwards to find the item by its unique identifier.
    while (counter--) {
      if (this.displayedList[counter].identifier === item.identifier) {
        position = counter;
        break;
      }
    }

    if (position === undefined) { // If the item was not found in the displayed list.
      this.addItem(item); // Attempt to add it as a new item.
    } else if (!this.currentFilter(item)) { // If the item no longer satisfies the filter criteria.
      this.deleteItem(item.identifier); // Remove it from the display.
    } else {
      // Check if the item's sort position has changed due to the update.
      if (this.currentSort(this.displayedList[position]) !== this.currentSort(item)) {
        this.deleteItem(this.displayedList[position]); // Remove the old item.
        this.addItem(item); // Add the new item, which will ensure correct sorting.
      } else {
        this.displayedList[position] = item; // Update the item in place.
        this.publishEvent("itemModified", item, position); // Notify that the item was modified.
      }
    }
  },


  /**
   * Removes an item from the displayed list by its identifier.
   * @param {string|number} itemIdToRemove - The unique identifier of the item to remove.
   */
  deleteItem: function (itemIdToRemove) {
    var position = this.displayedList.count;
    while (position--) {
      if (this.displayedList[position].identifier === itemIdToRemove) {
        this.displayedList.insertOrRemove(position, 1); // Remove one item at this specific position.
        this.publishEvent("itemDeleted", itemIdToRemove, position); // Emit an event for the removal.
        break; // Stop searching once the item is found and removed.
      }
    }
  }
});



// Export the primary InventoryDisplay class for consumption by other modules.
module.exports = {
  InventoryDisplay: InventoryDisplay
};