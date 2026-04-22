/*global jq:false, jQuery:false*/
/*
 * Column Reordering Script v.0.1.3
 * Developed by Alex Nikitin (a.nikitin@i.ua)
 * Project repository: https://github.com/alexshnur/drag-n-drop-table-columns
 */
(function (jq, globalObj) {
  var columnElements,
    sourceItem = null,
    targetItem = null,
    reorderableCols,
    instanceRef;

  // Helper function to insert an element after another
  function placeElementAfter(elemToMove, referenceElem) {
    return referenceElem.parentNode.insertBefore(elemToMove, referenceElem.nextSibling);
  }

  // Detects if the browser is Internet Explorer and its version
  function checkInternetExplorerVersion() {
    var browserAgent = globalObj.navigator.userAgent.toLowerCase();
    return (browserAgent.indexOf('msie') !== -1) ? parseInt(browserAgent.split('msie')[1], 10) : false;
  }

  reorderableCols = (function () {
    var currentTable;

    // Constructor for the ColumnReorderer
    function ColumnReorderer(targetTable, configSettings) {
      instanceRef = this;
      currentTable = targetTable;
      instanceRef.settings = jq.extend({}, instanceRef.settings, configSettings);

      if (instanceRef.settings.enableDragging) {
        // Special handling for IE9
        if (checkInternetExplorerVersion() === 9) {
          currentTable.find('thead tr th').each(function () {
            if (jq(this).find('.drag-ie').length === 0) {
              jq(this).html(jq('<a>').html(jq(this).html()).attr('href', '#').addClass('drag-ie'));
            }
          });
        }

        columnElements = currentTable.find('thead tr th');

        // Ensure dataTransfer property is available in jQuery event object
        jQuery.event.props.push('dataTransfer');

        // Attach drag-and-drop event listeners to each column header
        [].forEach.call(columnElements, function (currentCol) {
          currentCol.setAttribute('draggable', true);

          jq(currentCol).on('dragstart', instanceRef.onDragInitiated);
          jq(currentCol).on('dragenter', instanceRef.onDragEntered);
          jq(currentCol).on('dragover', instanceRef.onDragHovered);
          jq(currentCol).on('dragleave', instanceRef.onDragExited);
          jq(currentCol).on('drop', instanceRef.onItemDropped);
          jq(currentCol).on('dragend', instanceRef.onDragFinished);
        });
      }
    }

    // Prototype methods for ColumnReorderer
    ColumnReorderer.prototype = {
      // Default configuration options
      settings: {
        enableDragging: true,
        draggingClass: 'is-dragging',
        hoveredClass: 'is-hovered',
        rowContentSelector: '.reorder-content' // Selector for row elements to be reordered
      },

      // Handler for when dragging starts
      onDragInitiated: function (eventObj) {
        jq(this).addClass(instanceRef.settings.draggingClass);
        sourceItem = this; // Store the element being dragged
        eventObj.dataTransfer.effectAllowed = 'copy';
        eventObj.dataTransfer.setData('text/html', this.id); // Set data for transfer
      },

      // Handler for when an element is dragged over a valid drop target
      onDragHovered: function (eventObj) {
        if (eventObj.preventDefault) {
          eventObj.preventDefault(); // Prevent default to allow drop
        }
        eventObj.dataTransfer.dropEffect = 'copy';
        return false;
      },

      // Handler for when a dragged element enters a valid drop target
      onDragEntered: function (eventObj) {
        targetItem = this; // Store the target element
        // Remove hover class from all columns
        [].forEach.call(columnElements, function (colHeader) {
          jq(colHeader).removeClass(instanceRef.settings.hoveredClass);
        });
        jq(this).addClass(instanceRef.settings.hoveredClass); // Add hover class to current target
        return false;
      },

      // Handler for when a dragged element leaves a valid drop target
      onDragExited: function (eventObj) {
        // The original implementation had a condition 'dragSrcEnter !== e' which seems incorrect.
        // It likely intended to check if 'this' (the element being left) was the same as 'dragSrcEnter'.
        // Keeping the structure but noting the potential original bug.
        if (targetItem !== eventObj) {
          // jq(this).removeClass(instanceRef.settings.hoveredClass);
        }
      },

      // Handler for when an element is dropped
      onItemDropped: function (eventObj) {
        if (eventObj.stopPropagation) {
          eventObj.stopPropagation(); // Stop event propagation
        }
        // If the source and target are different, perform the column move
        if (sourceItem !== eventObj) {
          instanceRef.relocateColumns(jq(sourceItem).index(), jq(this).index());
        }
        return false;
      },

      // Handler for when dragging ends (either dropped or cancelled)
      onDragFinished: function (eventObj) {
        // Clean up hover classes from all columns
        [].forEach.call(columnElements, function (colHeader) {
          jq(colHeader).removeClass(instanceRef.settings.hoveredClass);
        });
        jq(sourceItem).removeClass(instanceRef.settings.draggingClass); // Remove dragging class from source
        return false;
      },

      // Logic to move the actual column data in the table rows
      relocateColumns: function (startIndex, endIndex) {
        var affectedRows = currentTable.find(instanceRef.settings.rowContentSelector);
        for (var idx = 0; idx < affectedRows.length; idx++) {
          if (endIndex > startIndex) {
            // Move column to the right
            placeElementAfter(affectedRows[idx].children[startIndex], affectedRows[idx].children[endIndex]);
          } else if (endIndex < currentTable.find('thead tr th').length - 1) {
            // Move column to the left
            affectedRows[idx].insertBefore(affectedRows[idx].children[startIndex], affectedRows[idx].children[endIndex]);
          }
        }
      }
    };

    return ColumnReorderer; // Return the constructor
  })();

  // Extend jQuery's prototype to add the plugin
  return jq.fn.extend({
    makeColsReorderable: function () {
      var pluginConfig = (arguments[0]);
      return this.each(function () {
        var targetElement = jq(this);
        new reorderableCols(targetElement, pluginConfig); // Initialize the column reorderer
      });
    }
  });

})(window.jQuery, window);