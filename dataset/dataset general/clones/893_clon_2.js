// Utility function to bind a method to an object's execution context
var _bindMethod = function(methodRef, objectContext) {
  return function() {
    return methodRef.apply(objectContext, arguments);
  };
};

// Helper for slicing array-like objects, such as `arguments`
var _arraySection = [].slice;

(function(jQ, globalObj) { // Self-executing function to encapsulate the plugin logic
  var ColumnAdjuster, extractDimensionValue, updateDimensionValue, getCoordinateX; // Declaration of main class and utility functions

  // Retrieves a floating point number from an element's style width property
  extractDimensionValue = function(elementNode) {
    return parseFloat(elementNode.style.width.replace('%', ''));
  };

  // Assigns a percentage width to an element, ensuring non-negativity and two decimal places
  updateDimensionValue = function(elementNode, newSize) {
    newSize = newSize.toFixed(2);
    newSize = newSize > 0 ? newSize : 0;
    return elementNode.style.width = "" + newSize + "%";
  };

  // Extracts the X-coordinate from a mouse or touch event object
  getCoordinateX = function(eventObject) {
    if (eventObject.type.indexOf('touch') === 0) {
      return (eventObject.originalEvent.touches[0] || eventObject.originalEvent.changedTouches[0]).pageX;
    }
    return eventObject.pageX;
  };

  // Definition of the ColumnAdjuster class for dynamic table column sizing
  ColumnAdjuster = (function() {

    // Default configuration options for the column adjustment mechanism
    ColumnAdjuster.prototype.defaultSettings = {
      headerSelector: 'tr th:visible', // Selector for target header elements
      persistenceStore: globalObj.localStorage, // Storage mechanism for dimensions (using localStorage as a concrete example)
      synchronizeHandles: true, // Whether to update grabber positions during resize
      adjustTableBody: true, // If grabbers should span the entire table height
      maximumDimension: null, // Upper bound for column width
      minimumDimension: null // Lower bound for column width
    };

    // Constructor for ColumnAdjuster instances
    function ColumnAdjuster(targetTableElement, configuration) {
      this.handlePointerPress = _bindMethod(this.handlePointerPress, this);
      this.restrictDimension = _bindMethod(this.restrictDimension, this);
      this.configOptions = jQ.extend({}, this.defaultSettings, configuration);
      this._targetTable = targetTableElement;

      this.setupHeaders();
      this.retrieveStoredDimensions();
      this.alignHandlePositions();

      // Attaches a resize listener to the window to realign grabbers
      jQ(globalObj).on('resize.coladj', ((function(selfReference) {
        return function() {
          return selfReference.alignHandlePositions();
        };
      })(this)));

      // Binds custom event handlers from the configuration options
      if (this.configOptions.onStartResize) {
        this._targetTable.bind('column:adjust:begin.coladj', this.configOptions.onStartResize);
      }
      if (this.configOptions.onDuringResize) {
        this._targetTable.bind('column:adjust:progress.coladj', this.configOptions.onDuringResize);
      }
      if (this.configOptions.onEndResize) {
        this._targetTable.bind('column:adjust:finish.coladj', this.configOptions.onEndResize);
      }
    }

    // Method to trigger a custom event on the associated table element
    ColumnAdjuster.prototype.emitCustomEvent = function(eventName, payloadArguments, originalSourceEvent) {
      var generatedEvent;
      generatedEvent = jQ.Event(eventName);
      generatedEvent.originalEvent = jQ.extend({}, originalSourceEvent);
      return this._targetTable.trigger(generatedEvent, [this].concat(payloadArguments || []));
    };

    // Constructs a unique identifier for a column for data storage
    ColumnAdjuster.prototype.getUniqueColumnId = function(columnElement) {
      return this._targetTable.data('adjustable-cols-id') + '-' + columnElement.data('adjustable-col-element-id');
    };

    // Sets up the table headers and initializes the resize grabbers
    ColumnAdjuster.prototype.setupHeaders = function() {
      this._tableHeadElements = this._targetTable.find(this.configOptions.headerSelector);
      this.allocateRelativeDimensions();
      return this.generateGrabbers();
    };

    // Disposes of the ColumnAdjuster instance, removing all event listeners and DOM elements
    ColumnAdjuster.prototype.destroyInstance = function() {
      var initialTable;
      jQ(this._targetTable.attr('ownerDocument')).off('.coladj');
      this._grabberContainer.find('.crc-grabber').each((function(selfReference) {
        return function(_, handleElem) {
          var currentHandle;
          currentHandle = jQ(handleElem);
          currentHandle.removeData('headerRef');
          return currentHandle.off('mousedown touchstart');
        };
      })(this));
      this._grabberContainer.remove();
      this._grabberContainer = null;
      this._targetTable.removeData('columnAdjuster');
      this._targetTable.add(globalObj).off('.coladj');
      this._tableHeadElements = null;
      initialTable = this._targetTable;
      this._targetTable = null;
      return initialTable;
    };

    // Calculates and applies percentage widths to all table headers
    ColumnAdjuster.prototype.allocateRelativeDimensions = function() {
      return this._tableHeadElements.each((function(selfReference) {
        return function(_, elementItem) {
          var currentHeaderElement;
          currentHeaderElement = jQ(elementItem);
          return updateDimensionValue(currentHeaderElement[0], currentHeaderElement.outerWidth() / selfReference._targetTable.width() * 100);
        };
      })(this));
    };

    // Creates the visual resize handles (grabbers) and inserts them into the DOM
    ColumnAdjuster.prototype.generateGrabbers = function() {
      var containerRef;
      if ((containerRef = this._grabberContainer) != null) {
        containerRef.remove();
      }
      this._targetTable.before((this._grabberContainer = jQ("<div class='crc-grabber-container' />")));
      this._tableHeadElements.each((function(selfReference) {
        return function(idx, elementItem) {
          var newGrabber;
          // Skips creating a grabber for the last column or if resizing is explicitly disabled
          if (selfReference._tableHeadElements.eq(idx + 1).length === 0 || (selfReference._tableHeadElements.eq(idx).attr('data-no-dimension-adjust') != null) || (selfReference._tableHeadElements.eq(idx + 1).attr('data-no-dimension-adjust') != null)) {
            return;
          }
          newGrabber = jQ("<div class='crc-grabber' />");
          newGrabber.data('headerRef', jQ(elementItem));
          return newGrabber.attachTo(selfReference._grabberContainer);
        };
      })(this));
      return this._grabberContainer.on('mousedown touchstart', '.crc-grabber', this.handlePointerPress);
    };

    // Adjusts the position and height of all resize grabbers to match column boundaries
    ColumnAdjuster.prototype.alignHandlePositions = function() {
      return this._grabberContainer.width(this._targetTable.width()).find('.crc-grabber').each((function(selfReference) {
        return function(_, handleElem) {
          var currentHandleElement;
          currentHandleElement = jQ(handleElem);
          return currentHandleElement.css({
            left: currentHandleElement.data('headerRef').outerWidth() + (currentHandleElement.data('headerRef').offset().left - selfReference._grabberContainer.offset().left),
            height: selfReference.configOptions.adjustTableBody ? selfReference._targetTable.height() : selfReference._targetTable.find('thead').height()
          });
        };
      })(this));
    };

    // Saves the current percentage widths of columns to the configured persistence store
    ColumnAdjuster.prototype.storeColumnDimensions = function() {
      return this._tableHeadElements.each((function(selfReference) {
        return function(_, elementItem) {
          var currentHeaderElement;
          currentHeaderElement = jQ(elementItem);
          if (currentHeaderElement.attr('data-no-dimension-adjust') == null) {
            if (selfReference.configOptions.persistenceStore != null) {
              return selfReference.configOptions.persistenceStore.setItem(selfReference.getUniqueColumnId(currentHeaderElement), extractDimensionValue(currentHeaderElement[0]));
            }
          }
        };
      })(this));
    };

    // Retrieves and applies stored column widths from the persistence store
    ColumnAdjuster.prototype.retrieveStoredDimensions = function() {
      return this._tableHeadElements.each((function(selfReference) {
        return function(_, elementItem) {
          var currentHeaderElement, storedSize;
          currentHeaderElement = jQ(elementItem);
          if ((selfReference.configOptions.persistenceStore != null) && (storedSize = selfReference.configOptions.persistenceStore.getItem(selfReference.getUniqueColumnId(currentHeaderElement)))) {
            return updateDimensionValue(currentHeaderElement[0], parseFloat(storedSize));
          }
        };
      })(this));
    };

    // Calculates the sum of all column widths (in percentages)
    ColumnAdjuster.prototype.calculateTotalColumnDimensions = function() {
      var totalSum;
      totalSum = 0;
      this._tableHeadElements.each((function(selfReference) {
        return function(_, elementItem) {
          return totalSum += parseFloat(jQ(elementItem)[0].style.width.replace('%', ''));
        };
      })(this));
      return totalSum;
    };

    // Enforces minimum and maximum width constraints on a given dimension value
    ColumnAdjuster.prototype.restrictDimension = function(inputSize) {
      if (this.configOptions.minimumDimension != null) {
        inputSize = Math.max(this.configOptions.minimumDimension, inputSize);
      }
      if (this.configOptions.maximumDimension != null) {
        inputSize = Math.min(this.configOptions.maximumDimension, inputSize);
      }
      return inputSize;
    };

    // Primary event handler for when a resize grabber is activated (pointer down)
    ColumnAdjuster.prototype.handlePointerPress = function(eventObject) {
      var _documentRef, initialPosition, _activeGrabber, _leftHeader, _rightHeader, initialDimensions, currentDimensions;
      eventObject.preventDefault(); // Prevents default browser behavior like text selection
      _documentRef = jQ(eventObject.currentTarget.ownerDocument);
      initialPosition = getCoordinateX(eventObject);
      _activeGrabber = jQ(eventObject.currentTarget);
      _leftHeader = _activeGrabber.data('headerRef');
      _rightHeader = this._tableHeadElements.eq(this._tableHeadElements.index(_leftHeader) + 1); // The header to the right
      initialDimensions = {
        left: extractDimensionValue(_leftHeader[0]),
        right: extractDimensionValue(_rightHeader[0])
      };
      currentDimensions = {
        left: initialDimensions.left,
        right: initialDimensions.right
      };

      this._grabberContainer.add(this._targetTable).addClass('crc-table-adjusting');
      _leftHeader.add(_rightHeader).add(_activeGrabber).addClass('crc-column-adjusting');
      this.emitCustomEvent('column:adjust:begin', [_leftHeader, _rightHeader, currentDimensions.left, currentDimensions.right], eventObject);

      // Attaches event listeners for pointer movement and release
      _documentRef.on('mousemove.coladj touchmove.coladj', (function(selfReference) {
        return function(moveEvent) {
          var deltaValue;
          deltaValue = (getCoordinateX(moveEvent) - initialPosition) / selfReference._targetTable.width() * 100;
          updateDimensionValue(_leftHeader[0], currentDimensions.left = selfReference.restrictDimension(initialDimensions.left + deltaValue));
          updateDimensionValue(_rightHeader[0], currentDimensions.right = selfReference.restrictDimension(initialDimensions.right - deltaValue));
          if (selfReference.configOptions.synchronizeHandles != null) {
            selfReference.alignHandlePositions();
          }
          return selfReference.emitCustomEvent('column:adjust:progress', [_leftHeader, _rightHeader, currentDimensions.left, currentDimensions.right], moveEvent);
        };
      })(this));

      // Registers a one-time listener for pointer release to finalize the resize
      return _documentRef.one('mouseup.coladj touchend.coladj', (function(selfReference) {
        return function() {
          _documentRef.off('mousemove.coladj touchmove.coladj'); // Detaches move listeners
          selfReference._grabberContainer.add(selfReference._targetTable).removeClass('crc-table-adjusting');
          _leftHeader.add(_rightHeader).add(_activeGrabber).removeClass('crc-column-adjusting');
          selfReference.alignHandlePositions(); // Final handle alignment
          selfReference.storeColumnDimensions(); // Persist new dimensions
          return selfReference.emitCustomEvent('column:adjust:finish', [_leftHeader, _rightHeader, currentDimensions.left, currentDimensions.right], eventObject);
        };
      })(this));
    };

    return ColumnAdjuster; // Returns the class constructor

  })();

  // Extends jQuery's prototype to add the columnAdjuster plugin
  return jQ.fn.addMethods({
    columnAdjuster: function() {
      var pluginOption, methodArgs;
      pluginOption = arguments[0], methodArgs = _arraySection.call(arguments, 1);
      return this.each(function() {
        var _currentTable, instanceData;
        _currentTable = jQ(this);
        instanceData = _currentTable.data('columnAdjuster'); // Retrieve existing instance or create new
        if (!instanceData) {
          _currentTable.data('columnAdjuster', (instanceData = new ColumnAdjuster(_currentTable, pluginOption)));
        }
        if (typeof pluginOption === 'string') { // If a method name is passed, call it on the instance
          return instanceData[pluginOption].apply(instanceData, methodArgs);
        }
      });
    }
  });

})(window.jQuery, window);