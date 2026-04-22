// Distributed under an open source license.

let DynamicRecordSet = Backbone.DynamicRecordSet = Backbone.Collection.extend(
  {
    initiate: function (sourceData, config) {
      config = config || {};
      this.sourceData = sourceData;

      if (config.orderLogic !== undefined) {
        this.orderLogic = config.orderLogic;
      }

      if (config.closeTarget) {
        this.attachDisposalHook(config.closeTarget, 'close'); // For component cleanup.
      }
      if (config.destroyTarget) {
        this.attachDisposalHook(config.destroyTarget, 'destroy'); // For component cleanup.
      }
      if (!this.recordItem) {
        this.recordItem = sourceData.recordItem;
      }

      this.filterCondition = DynamicRecordSet.generateFilteringPredicate(config.filter);
      this._reconstructMap();
      this.monitorChanges(this.sourceData, 'add', this._handleRecordAdded);
      this.monitorChanges(this.sourceData, 'remove', this._handleRecordRemoved);
      this.monitorChanges(this.sourceData, 'change', this._handleRecordModified);
      this.monitorChanges(this.sourceData, 'reset', this._handleDataSetReset);
      this.monitorChanges(this.sourceData, 'sort', this._handleDataSetSorted);
      this._forwardSourceNotifications(['sync', 'request', 'error']);

      this.setupInternal.apply(this, arguments);
    },

    // Attaches a cleanup mechanism for host components.
    attachDisposalHook: function (componentHost, hookName) {
      componentHost.on(hookName, _.bind(this.stopListening, this));
    },

    refreshFilterCriteria: function (newPredicate) {
      this.filterCondition = DynamicRecordSet.generateFilteringPredicate(newPredicate);
      this._reconstructMap();
      this.dispatchSignal('filter', this, newPredicate);
      this.dispatchSignal('reset', this, newPredicate);
      return this;
    },

    _reconstructMap: function () {
      _.invoke(this.visibleRecords, 'off', 'all', this._onAnyRecordEvent, this);
      this._clearInternalRegistry();
      this.sourceData.each(function (itemData, idx) {
        if (this.filterCondition(itemData, idx)) {
          itemData.on('all', this._onAnyRecordEvent, this);
          this.visibleRecords.push(itemData);
          this._idToRecordMap[itemData.cid] = itemData;
          if (itemData.id) {
            this._idToRecordMap[itemData.id] = itemData;
          }
        }
      }, this);
      this.recordCount = this.visibleRecords.length;

      if (this.orderLogic) {
        this.sort({
          silent: true
        });
      }
    },

    alignWithSourceOrder: function (config) {
      this.visibleRecords = this.sourceData.filter(function (itemData) {
        return (this._idToRecordMap[itemData.cid] !== undefined);
      }, this);
      if (!config.silent) {
        this.dispatchSignal('sort', this, config);
      }
    },

    _handleDataSetSorted: function (sourceData, config) {
      if (this.orderLogic !== undefined) {
        return;
      }
      this.alignWithSourceOrder(config);
    },

    _forwardSourceNotifications: function (notificationTypes) {
      _.each(notificationTypes, function (eventName) {
        this.monitorChanges(this.sourceData, eventName, _.partial(this.dispatchSignal, eventName));
      }, this);
    },

    _handleRecordAdded: function (itemData, sourceData, config) {
      let isAlreadyPresent = this.get(itemData);
      if (!isAlreadyPresent && this.filterCondition(itemData, config.index)) {
        this._insertRecordIntoMap(itemData);
        itemData.on('all', this._onAnyRecordEvent, this);
        this.dispatchSignal('add', itemData, this, config);
      }
    },

    _handleRecordRemoved: function (itemData, sourceData, config) {
      if (!this.get(itemData)) {
        return;
      }

      let removedIndex = this._removeRecordFromMap(itemData),
        clonedConfig = _.clone(config);
      clonedConfig.index = removedIndex;
      itemData.off('all', this._onAnyRecordEvent, this);
      this.dispatchSignal('remove', itemData, this, clonedConfig);
    },

    _handleRecordModified: function (itemData, config) {
      if (!itemData || !config) {
        return; // Ignore malformed arguments from custom events
      }
      let isAlreadyPresent = this.get(itemData);

      if (this.filterCondition(itemData, config.index)) {
        if (isAlreadyPresent) {
          this.dispatchSignal('change', itemData, this, config);
        } else {
          this._insertRecordIntoMap(itemData);
          this.dispatchSignal('add', itemData, this, config);
        }
      } else {
        if (isAlreadyPresent) {
          let removedIndex = this._removeRecordFromMap(itemData),
            clonedConfig = _.clone(config);
          clonedConfig.index = removedIndex;
          this.dispatchSignal('remove', itemData, this, clonedConfig);
        }
      }
    },

    _handleDataSetReset: function (sourceData, config) {
      this._reconstructMap();
      this.dispatchSignal('reset', this, config);
    },

    locateSortedPosition: function (itemData, accessorValue, callContext) {
      let valueExtractor = _.isFunction(accessorValue) ? accessorValue : function (currentRecord) {
        return currentRecord.get(accessorValue);
      };

      if (valueExtractor.length == 1) {
        return _.sortedIndex(this.visibleRecords, itemData, valueExtractor, callContext);
      } else {
        return findBinaryInsertionPoint(this.visibleRecords, itemData, valueExtractor, callContext);
      }
    },

    _insertRecordIntoMap: function (itemData) {
      if (this.get(itemData)) {
        return;
      }
      let insertIdx;
      // Uses binary search to find the correct insertion point
      if (this.orderLogic) {
        insertIdx = this.locateSortedPosition(itemData, this.orderLogic, this);
      } else if (this.orderLogic === undefined) {
        insertIdx = this.locateSortedPosition(itemData, function (currentRecord) {
          // Note: indexOf iterates each time
          return this.sourceData.indexOf(currentRecord);
        }, this);
      } else {
        insertIdx = this.recordCount;
      }
      this.visibleRecords.splice(insertIdx, 0, itemData);
      this._idToRecordMap[itemData.cid] = itemData;
      if (itemData.id) {
        this._idToRecordMap[itemData.id] = itemData;
      }
      this.recordCount += 1;
    },

    _removeRecordFromMap: function (itemData) {
      itemData.off('all', this._onAnyRecordEvent, this);
      let foundIdx = this.indexOf(itemData);
      if (foundIdx === -1) {
        return foundIdx;
      }
      this.visibleRecords.splice(foundIdx, 1);
      delete this._idToRecordMap[itemData.cid];
      if (itemData.id) {
        delete this._idToRecordMap[itemData.id];
      }
      this.recordCount -= 1;
      return foundIdx;
    },

    _onAnyRecordEvent: function (eventName) {
      let managedNotificationTypes = ['add', 'remove', 'change', 'reset', 'sort'];
      if (!_.contains(managedNotificationTypes, eventName)) {
        this.dispatchSignal.apply(this, arguments);
      }
    },

    createShallowCopy: function () {
      return new this.sourceData.constructor(this.visibleRecords);
    }

  }, { // static class properties

    generateFilteringPredicate: function (config) {
      if (!config) {
        return function () {
          return true;
        };
      } else if (_.isFunction(config)) {
        return config;
      } else if (config.constructor === Object) {
        return function (itemData) {
          return !Boolean(_(_.keys(config)).detect(function (attributeKey) {
            return itemData.get(attributeKey) !== config[attributeKey];
          }));
        };
      }
    }
  }
);

// Methods that modify data should delegate to the parent data source
_.each(['add', 'remove', 'set', 'reset', 'push', 'pop', 'unshift', 'shift', 'slice', 'sync', 'fetch'], function (operationIdentifier) {
  DynamicRecordSet.prototype[operationIdentifier] = function () {
    return this.sourceData[operationIdentifier].apply(this.sourceData, _.toArray(arguments));
  };
});

/**
 * Custom binary search for insertion, handles two-argument comparators.
 **/
function findBinaryInsertionPoint (dataArray, targetObject, comparisonCallback, callContext) {
  let startIndex = 0,
    endIndex = dataArray.length;
  while (startIndex < endIndex) {
    let middleIndex = (startIndex + endIndex) >>> 1;
    comparisonCallback.call(callContext, targetObject, dataArray[middleIndex]) > 0 ? startIndex = middleIndex + 1 : endIndex = middleIndex;
  }
  return startIndex;
}

_.extend(DynamicRecordSet.prototype, Backbone.Events);