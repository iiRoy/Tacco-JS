/*
 * Licensed under a permissive open-source license.
 * This code is a dynamic view component for managing subsets of larger collections.
 */

var DynamicSubCollection = window.Synapse.DynamicSubCollection = Synapse.BaseCollection.extend({

  // Initializes the filtered collection instance.
  constructor: function (sourceData, configuration) {
    // Ensure configuration parameters are always an object.
    const effectiveConfig = configuration || {};
    this.parentCollection = sourceData; // Store a reference to the main data source.

    // Apply custom comparison logic if provided.
    if (effectiveConfig.itemComparator !== undefined) {
      this.comparator = effectiveConfig.itemComparator;
    }

    // Set up cleanup handlers based on lifecycle events of an owning view component.
    if (effectiveConfig.cleanupOnClose) {
      this.attachLifecycleHandler(effectiveConfig.cleanupOnClose, 'close'); // Legacy Marionette v1.x support
    }
    if (effectiveConfig.cleanupOnDestroy) {
      this.attachLifecycleHandler(effectiveConfig.cleanupOnDestroy, 'destroy'); // Modern Marionette v2.x+ support
    }

    // Inherit the model type from the parent collection if not explicitly set.
    if (!this.model) {
      this.model = sourceData.model;
    }

    // Establish the predicate function for determining item inclusion.
    this.itemAcceptancePredicate = DynamicSubCollection.generateInclusionFilter(effectiveConfig.dataFilter);

    // Populate the initial set of models based on the filter.
    this._refreshInternalCache();

    // Bind to relevant events on the parent collection to maintain synchronization.
    this.listenTo(this.parentCollection, 'add', this._handleItemAdded);
    this.listenTo(this.parentCollection, 'remove', this._handleItemRemoved);
    this.listenTo(this.parentCollection, 'change', this._handleItemModified);
    this.listenTo(this.parentCollection, 'reset', this._handleParentReset);
    this.listenTo(this.parentCollection, 'sort', this._handleParentSort);

    // Forward specific events from the parent collection to this instance.
    this._delegateUpstreamEvents(['sync', 'request', 'error']);

    // Invoke the custom initialization logic if defined in derived classes.
    this.initialize.apply(this, arguments);
  },

  // Establishes a listener on a view component to stop listening to events on destruction.
  attachLifecycleHandler: function (component, eventToListen) {
    if (!component || !eventToListen) {
      console.warn('Skipping lifecycle attachment due to missing component or event.');
      return;
    }
    component.on(eventToListen, _.bind(this.stopListening, this));
  },

  // Updates the filtering criteria for this collection view.
  updateInclusionCriterion: function (newCriterion) {
    this.itemAcceptancePredicate = DynamicSubCollection.generateInclusionFilter(newCriterion);
    this._refreshInternalCache(); // Re-evaluate all items against the new filter.
    this.trigger('filter:updated', this, newCriterion);
    this.trigger('reset', this, newCriterion); // Also trigger a generic reset event.
    return this;
  },

  // Rebuilds the internal array of models and their lookup map based on the current filter.
  _refreshInternalCache: function () {
    // Unsubscribe from all model-specific events for currently held models.
    this.cachedItems.forEach(item => item.off('all', this._bubbleModelEvent, this));

    // Clear the existing internal state.
    this._reset();

    // Iterate through the parent collection, applying the filter.
    let currentLength = 0;
    this.parentCollection.forEach((itemModel, itemIndex) => {
      // If the model passes the acceptance predicate, add it to this collection.
      if (this.itemAcceptancePredicate(itemModel, itemIndex)) {
        itemModel.on('all', this._bubbleModelEvent, this); // Listen for all events on accepted models.
        this.cachedItems.push(itemModel);
        this._idMap[itemModel.cid] = itemModel; // Store by client ID.
        if (itemModel.id) {
          this._idMap[itemModel.id] = itemModel; // Store by server ID if available.
        }
        currentLength++;
      }
    });
    this.length = currentLength; // Update the collection's length property.

    // If a custom comparator is set, re-sort the collection silently.
    if (this.comparator) {
      this.sort({
        silent: true
      });
    }
  },

  // Reorders items to match the parent collection's sort order, if applicable.
  synchronizeOrderWithParent: function (sortConfig) {
    // Filter the parent collection to only include models that are currently in this sub-collection.
    this.cachedItems = this.parentCollection.filter(itemModel => {
      return (this._idMap[itemModel.cid] !== undefined);
    });

    // Trigger a sort event unless explicitly suppressed.
    if (!sortConfig || !sortConfig.silent) {
      this.trigger('sort', this, sortConfig);
    }
  },

  // Handles the 'sort' event from the parent collection.
  _handleParentSort: function (parentCollection, sortOptions) {
    // If this collection has its own comparator, it manages its own sorting, so skip parent's sort.
    if (this.comparator !== undefined) {
      return;
    }
    this.synchronizeOrderWithParent(sortOptions);
  },

  // Delegates specified events from the parent collection to this instance.
  _delegateUpstreamEvents: function (eventList) {
    eventList.forEach(currentEvent => {
      this.listenTo(this.parentCollection, currentEvent, (...args) => {
        // Prepend the event name to the arguments before triggering.
        this.trigger(currentEvent, ...args);
      });
    });
  },

  // Handles an 'add' event from the parent collection.
  _handleItemAdded: function (addedItem, sourceCollection, addOptions) {
    const isAlreadyPresent = this.get(addedItem);
    const addedAtIndex = addOptions ? addOptions.index : undefined;

    // Only add if not already present and passes the current filter.
    if (!isAlreadyPresent && this.itemAcceptancePredicate(addedItem, addedAtIndex)) {
      this._insertIntoIndex(addedItem);
      addedItem.on('all', this._bubbleModelEvent, this);
      this.trigger('add', addedItem, this, addOptions);
    }
  },

  // Handles a 'remove' event from the parent collection.
  _handleItemRemoved: function (removedItem, sourceCollection, removalOptions) {
    // If the item was not in this sub-collection, there's nothing to do.
    if (!this.get(removedItem)) {
      return;
    }

    const removalPosition = this._removeFromIndex(removedItem);
    removedItem.off('all', this._bubbleModelEvent, this); // Stop listening to events on the removed model.

    // Clone options to prevent modifying the original and add the removal index.
    const clonedRemovalOptions = { ...removalOptions,
      index: removalPosition
    };
    this.trigger('remove', removedItem, this, clonedRemovalOptions);
  },

  // Handles a 'change' event from a model in the parent collection.
  _handleItemModified: function (changedItem, changeOptions) {
    // Basic validation for arguments.
    if (!changedItem || !changeOptions) {
      console.warn('Received malformed change event arguments.');
      return;
    }

    const wasPreviouslyIncluded = this.get(changedItem);
    const modelIndexInParent = changeOptions.index; // Index might be useful for filter evaluation.

    if (this.itemAcceptancePredicate(changedItem, modelIndexInParent)) {
      // Item now passes the filter.
      if (wasPreviouslyIncluded) {
        // It was already here and still passes, just trigger change.
        this.trigger('change', changedItem, this, changeOptions);
      } else {
        // It was not here before but now passes, so add it.
        this._insertIntoIndex(changedItem);
        this.trigger('add', changedItem, this, changeOptions);
      }
    } else {
      // Item no longer passes the filter.
      if (wasPreviouslyIncluded) {
        // It was here but now fails the filter, so remove it.
        const removedIdx = this._removeFromIndex(changedItem);
        const clonedChangeOptions = { ...changeOptions,
          index: removedIdx
        };
        this.trigger('remove', changedItem, this, clonedChangeOptions);
      }
      // If it was not previously included and still doesn't pass, do nothing.
    }
  },

  // Handles a 'reset' event from the parent collection.
  _handleParentReset: function (sourceCollection, resetOptions) {
    this._refreshInternalCache(); // Rebuild the entire internal state.
    this.trigger('reset', this, resetOptions);
  },

  // Finds the sorted index for a model using a custom iterator or comparator.
  determineSortedPosition: function (targetEntity, sortKeyOrFn, execContext) {
    const comparisonFn = _.isFunction(sortKeyOrFn) ? sortKeyOrFn : function (model) {
      return model.get(sortKeyOrFn);
    };

    // Use Backbone's built-in sortedIndex for single-argument iterators.
    if (comparisonFn.length === 1) {
      return _.sortedIndex(this.cachedItems, targetEntity, comparisonFn, execContext);
    } else {
      // Use a custom binary search for two-argument comparators.
      return binarySearchTwoArg(this.cachedItems, targetEntity, comparisonFn, execContext);
    }
  },

  // Adds a model to the internal index, maintaining sort order if a comparator exists.
  _insertIntoIndex: function (itemToAdd) {
    // Prevent adding duplicates.
    if (this.get(itemToAdd)) {
      console.warn(`Attempted to add item ${itemToAdd.cid} that is already present.`);
      return;
    }

    let insertionPoint;
    // Determine the correct insertion point using binary search if sorted.
    if (this.comparator) {
      insertionPoint = this.determineSortedPosition(itemToAdd, this.comparator, this);
    } else if (this.comparator === undefined) {
      // If no custom comparator, try to respect parent collection's order.
      insertionPoint = this.determineSortedPosition(itemToAdd, (modelTarget) => {
        return this.parentCollection.indexOf(modelTarget); // Note: This can be inefficient for large parent collections.
      }, this);
    } else {
      // If comparator is null, just append to the end.
      insertionPoint = this.length;
    }

    // Insert the model into the cached items array.
    this.cachedItems.splice(insertionPoint, 0, itemToAdd);
    this._idMap[itemToAdd.cid] = itemToAdd;
    if (itemToAdd.id) {
      this._idMap[itemToAdd.id] = itemToAdd;
    }
    this.length += 1;
  },

  // Removes a model from the internal index and returns its former position.
  _removeFromIndex: function (itemToRemove) {
    // Ensure the model exists before attempting removal.
    if (!this.get(itemToRemove)) {
      console.warn(`Attempted to remove item ${itemToRemove.cid} that is not in this collection.`);
      return -1;
    }

    itemToRemove.off('all', this._bubbleModelEvent, this); // Unsubscribe from model events.

    const removalPosition = this.indexOf(itemToRemove);
    if (removalPosition < 0) {
      return removalPosition; // Should not happen if get(itemToRemove) was true, but good safeguard.
    }

    this.cachedItems.splice(removalPosition, 1); // Remove from array.
    delete this._idMap[itemToRemove.cid]; // Remove from client ID map.
    if (itemToRemove.id) {
      delete this._idMap[itemToRemove.id]; // Remove from server ID map.
    }
    this.length -= 1;
    return removalPosition;
  },

  // Bubbles up events from models within this collection, excluding internal Backbone events.
  _bubbleModelEvent: function (triggeredEventName) {
    const excludedInternalEvents = ['add', 'remove', 'change', 'reset', 'sort'];
    // Only re-trigger events that are not handled explicitly by the collection itself.
    if (!excludedInternalEvents.includes(triggeredEventName)) {
      this.trigger.apply(this, arguments);
    }
  },

  // Creates a new instance of the parent collection's type, populated with the current models.
  createCopy: function () {
    const parentConstructor = this.parentCollection.constructor;
    return new parentConstructor(this.cachedItems);
  }

}, { // Static properties and methods for DynamicSubCollection

  // Generates a filter function based on various input types.
  generateInclusionFilter: function (filterConfig) {
    if (!filterConfig) {
      // If no filter is provided, all items are accepted.
      return function () {
        return true;
      };
    } else if (_.isFunction(filterConfig)) {
      // If it's already a function, use it directly.
      return filterConfig;
    } else if (filterConfig && typeof filterConfig === 'object' && filterConfig.constructor === Object) {
      // If it's a plain object, create a filter that matches all key-value pairs.
      const filterKeys = Object.keys(filterConfig);
      return function (model) {
        // If any key-value pair doesn't match, the model is rejected.
        return !filterKeys.some(key => model.get(key) !== filterConfig[key]);
      };
    }
    // Fallback for unsupported filter types.
    return function () {
      return true;
    };
  }
});

// Helper function for a two-argument binary search, similar to _.sortedIndex.
// Used when the comparator function takes both the target and an element from the array.
function binarySearchTwoArg(dataArray, targetObj, compFn, thisContext) {
  let lowerBound = 0;
  let upperBound = dataArray.length; // Exclusive upper bound.

  while (lowerBound < upperBound) {
    const midPoint = (lowerBound + upperBound) >>> 1; // Efficient integer division.
    // If the target is "greater than" the middle element (according to compFn),
    // search in the upper half. Otherwise, search in the lower half.
    if (compFn.call(thisContext, targetObj, dataArray[midPoint]) > 0) {
      lowerBound = midPoint + 1;
    } else {
      upperBound = midPoint;
    }
  }
  return lowerBound; // The insertion point.
}

// These methods operate directly on the parent collection and should be proxied.
const parentProxyMethods = ['add', 'remove', 'set', 'reset', 'push', 'pop', 'unshift', 'shift', 'slice', 'sync', 'fetch'];

parentProxyMethods.forEach(proxyMethod => {
  DynamicSubCollection.prototype[proxyMethod] = function (...args) {
    // Call the corresponding method on the parent collection with all arguments.
    return this.parentCollection[proxyMethod].apply(this.parentCollection, args);
  };
});

// Mix in Backbone.Events functionality to enable event triggering and listening.
_.extend(DynamicSubCollection.prototype, Synapse.EventMixin);