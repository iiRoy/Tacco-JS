(function() {
  var createItemHandler, createStructureManager, pluginActions;

  // --- ItemHandler (replaces Node) ---
  // A factory function for creating individual tree item managers.
  createItemHandler = function(domElement, hierarchyController, configOptions) {
    var item = {};

    item.element = domElement;
    item.hierarchy = hierarchyController; // Reference to the main manager
    item.config = configOptions;

    item.uniqueId = item.element.dataset[item.config.itemIdAttribute];

    var parentRef = item.element.dataset[item.config.parentRefAttribute];
    if (parentRef != null && parentRef !== "") {
      item.parentRefId = parentRef;
    }

    // Select the target cell for indentation and expander
    var targetCells = item.element.querySelectorAll(item.config.columnElementType);
    item.displayCell = targetCells[item.config.displayColumn];
    
    // Create elements using vanilla JS
    item.toggleIcon = document.createElement('a');
    item.toggleIcon.href = '#';
    item.toggleIcon.innerHTML = '&nbsp;';
    
    item.indentationSpacer = document.createElement('span');
    item.indentationSpacer.className = 'indentation-spacer';

    item.childRefs = []; // Stores IDs of children
    item.renderedOnce = false;

    // Prepend indenter to displayCell
    if (item.displayCell) {
      item.displayCell.insertBefore(item.indentationSpacer, item.displayCell.firstChild);
    }

    // Methods for ItemHandler
    item.addChildRef = function(childRefId) {
      item.childRefs.push(childRefId);
    };

    item.getAncestors = function() {
      var currentItem = item;
      var ancestorList = [];
      while (currentItem = currentItem.getParentItem()) {
        ancestorList.push(currentItem);
      }
      return ancestorList;
    };

    item.fold = function() {
      if (item.isFolded()) {
        return item;
      }

      item.element.classList.remove("unfolded");
      item.element.classList.add("folded");

      item._concealDescendants();
      item.toggleIcon.setAttribute("title", item.config.textUnfold);

      if (item.renderedOnce && item.config.onItemFolded != null) {
        item.config.onItemFolded.apply(item);
      }

      return item;
    };

    item.isFolded = function() {
      return item.element.classList.contains("folded");
    };

    item.unfold = function() {
      if (item.isUnfolded()) {
        return item;
      }

      item.element.classList.remove("folded");
      item.element.classList.add("unfolded");

      if (item.renderedOnce && item.config.onItemUnfolded != null) {
        item.config.onItemUnfolded.apply(item);
      }

      // Check visibility
      if (item.element.offsetParent !== null && getComputedStyle(item.element).display !== 'none') {
        item._revealDescendants();
      }

      item.toggleIcon.setAttribute("title", item.config.textFold);

      return item;
    };

    item.isUnfolded = function() {
      return item.element.classList.contains("unfolded");
    };

    item.conceal = function() {
      item._concealDescendants();
      item.element.style.display = 'none';
      return item;
    };

    item.hasChildrenOrMarkedBranch = function() {
      if (item.childRefs.length > 0 || item.element.dataset[item.config.branchFlagAttribute] === "true") {
        return true;
      } else {
        return false;
      }
    };

    item.refreshDisplayType = function() {
      item.element.classList.remove('branch-node');
      item.element.classList.remove('leaf-node');
      item.element.classList.add(item.hasChildrenOrMarkedBranch() ? 'branch-node' : 'leaf-node');
    };

    item.depth = function() {
      return item.getAncestors().length;
    };

    item.getParentItem = function() {
      if (item.parentRefId != null) {
        return item.hierarchy.getItemById(item.parentRefId);
      } else {
        return null;
      }
    };

    item.removeChildRef = function(childRefId) {
      var index = item.childRefs.indexOf(childRefId);
      if (index > -1) {
        item.childRefs.splice(index, 1);
      }
    };

    item.composeDisplay = function() {
      var currentConfig = item.config;
      var eventHandler;

      if (currentConfig.canExpandCollapse === true && item.hasChildrenOrMarkedBranch()) {
        eventHandler = function(e) {
          var tableElement = e.target.closest("table");
          var managerInstance = tableElement ? tableElement.customTreeViewData : null;
          if (managerInstance) {
            var targetElement = e.target.closest("tr");
            var targetItemId = targetElement.dataset[currentConfig.itemIdAttribute];
            var targetItem = managerInstance.getItemById(targetItemId);
            if (targetItem) {
              targetItem.flipState();
            }
          }
          e.preventDefault();
        };

        item.indentationSpacer.innerHTML = '';
        item.indentationSpacer.appendChild(item.toggleIcon);

        var eventTarget = currentConfig.clickableItemNames === true ? item.displayCell : item.toggleIcon;

        // Remove existing listeners to prevent duplicates
        eventTarget.removeEventListener("click", eventHandler);
        // Remove the specific keydown listener if it exists
        if (eventTarget._keydownHandler) {
            eventTarget.removeEventListener("keydown", eventTarget._keydownHandler);
            eventTarget._keydownHandler = null;
        }


        // Add new listeners
        eventTarget.addEventListener("click", eventHandler);
        var keydownHandler = function(e) {
          if (e.keyCode == 13) { // Enter key
            eventHandler(e);
          }
        };
        eventTarget.addEventListener("keydown", keydownHandler);
        eventTarget._keydownHandler = keydownHandler; // Store reference to remove later
      }

      item.indentationSpacer.style.paddingLeft = "" + (item.depth() * currentConfig.indentationAmount) + "px";

      return item;
    };

    item.unfoldAncestors = function() {
      if (item.parentRefId != null) {
        item.getParentItem().unfoldAncestors();
      }
      return item.unfold();
    };

    item.reassignParent = function(newParentItem) {
      if (item.parentRefId != null) {
        item.hierarchy.getItemById(item.parentRefId).removeChildRef(item.uniqueId);
      }
      item.parentRefId = newParentItem.uniqueId;
      item.element.dataset[item.config.parentRefAttribute] = newParentItem.uniqueId;
      newParentItem.addChildRef(item.uniqueId);
      return item;
    };

    item.reveal = function() {
      if (!item.renderedOnce) {
        item._prepareDisplay();
      }
      item.element.style.display = ''; // Resets to default display for tr
      if (item.isUnfolded()) {
        item._revealDescendants();
      }
      return item;
    };

    item.flipState = function() {
      if (item.isUnfolded()) {
        item.fold();
      } else {
        item.unfold();
      }
      return item;
    };

    item._concealDescendants = function() {
      item.childRefs.forEach(function(childId) {
        item.hierarchy.getItemById(childId).conceal();
      });
    };

    item._prepareDisplay = function() {
      var currentConfig = item.config;

      item.composeDisplay();

      if (currentConfig.canExpandCollapse === true && currentConfig.initialState === "folded") {
        item.fold();
      } else {
        item.unfold();
      }

      if (currentConfig.onItemPrepared != null) {
        currentConfig.onItemPrepared.apply(item);
      }

      return item.renderedOnce = true;
    };

    item._revealDescendants = function() {
      item.childRefs.forEach(function(childId) {
        item.hierarchy.getItemById(childId).reveal();
      });
    };

    return item;
  };

  // --- StructureManager (replaces Tree) ---
  // A factory function for creating the overall tree structure manager.
  createStructureManager = function(tableElement, configOptions) {
    var manager = {};

    manager.hostTable = tableElement;
    manager.config = configOptions;
    manager.itemRegistry = new Map(); // Stores ItemHandler instances by uniqueId

    manager.allItemIds = []; // Array of all uniqueIds for iteration
    manager.rootItemIds = []; // Array of root uniqueIds

    // Methods for StructureManager
    manager.foldAll = function() {
      manager.allItemIds.forEach(function(itemId) {
        manager.itemRegistry.get(itemId).fold();
      });
      return manager;
    };

    manager.unfoldAll = function() {
      manager.allItemIds.forEach(function(itemId) {
        manager.itemRegistry.get(itemId).unfold();
      });
      return manager;
    };

    manager.findDeepestItem = function(startItemId) {
      var currentItem = manager.itemRegistry.get(startItemId);
      if (!currentItem) return null;

      if (currentItem.childRefs.length > 0) {
        return manager.findDeepestItem(currentItem.childRefs[currentItem.childRefs.length - 1]);
      } else {
        return currentItem;
      }
    };

    manager.ingestElements = function(tableRows) {
      if (tableRows != null) {
        Array.from(tableRows).forEach(function(domRow) {
          if (domRow.dataset[manager.config.itemIdAttribute] != null) {
            var currentItem = createItemHandler(domRow, manager, manager.config);
            manager.allItemIds.push(currentItem.uniqueId);
            manager.itemRegistry.set(currentItem.uniqueId, currentItem);

            if (currentItem.parentRefId != null && manager.itemRegistry.has(currentItem.parentRefId)) {
              manager.itemRegistry.get(currentItem.parentRefId).addChildRef(currentItem.uniqueId);
            } else {
              manager.rootItemIds.push(currentItem.uniqueId);
            }
          }
        });
      }

      manager.allItemIds.forEach(function(itemId) {
        manager.itemRegistry.get(itemId).refreshDisplayType();
      });

      return manager;
    };

    manager.relocateItem = function(sourceItemId, destinationItemId) {
      var sourceItem = manager.itemRegistry.get(sourceItemId);
      var destinationItem = manager.itemRegistry.get(destinationItemId);

      if (!sourceItem || !destinationItem) return manager;

      var sourceParent = sourceItem.getParentItem();

      var isAncestor = destinationItem.getAncestors().some(function(ancestor) {
        return ancestor.uniqueId === sourceItem.uniqueId;
      });

      if (sourceItem.uniqueId !== destinationItem.uniqueId &&
          destinationItem.uniqueId !== sourceItem.parentRefId &&
          !isAncestor) {

        sourceItem.reassignParent(destinationItem);
        manager._shiftElements(sourceItem, destinationItem);

        if (sourceItem.getParentItem().childRefs.length === 1) {
          sourceItem.getParentItem().composeDisplay();
        }
      }

      if (sourceParent) {
        sourceParent.refreshDisplayType();
      }
      if (sourceItem.getParentItem()) {
        sourceItem.getParentItem().refreshDisplayType();
      }
      sourceItem.refreshDisplayType();
      return manager;
    };

    manager.removeItem = function(itemIdToRemove) {
      var itemToRemove = manager.itemRegistry.get(itemIdToRemove);
      if (!itemToRemove) return manager;

      manager.clearDescendantBranch(itemToRemove);

      itemToRemove.element.remove();

      if (itemToRemove.parentRefId != null) {
        manager.itemRegistry.get(itemToRemove.parentRefId).removeChildRef(itemToRemove.uniqueId);
      } else {
        var rootIndex = manager.rootItemIds.indexOf(itemIdToRemove);
        if (rootIndex > -1) {
          manager.rootItemIds.splice(rootIndex, 1);
        }
      }

      manager.itemRegistry.delete(itemIdToRemove);
      var allItemsIndex = manager.allItemIds.indexOf(itemIdToRemove);
      if (allItemsIndex > -1) {
        manager.allItemIds.splice(allItemsIndex, 1);
      }

      return manager;
    };

    manager.drawHierarchy = function() {
      manager.rootItemIds.forEach(function(rootId) {
        manager.itemRegistry.get(rootId).reveal();
      });
      return manager;
    };

    manager.arrangeChildren = function(parentId, sortFunction) {
      var parentItem = manager.itemRegistry.get(parentId);
      if (!parentItem) return manager;

      parentItem.childRefs.sort(function(idA, idB) {
        var itemA = manager.itemRegistry.get(idA);
        var itemB = manager.itemRegistry.get(idB);
        return sortFunction(itemA, itemB);
      });

      manager._reorderChildElements(parentItem);

      return manager;
    };

    manager.clearDescendantBranch = function(parentItem) {
      var childrenCopy = parentItem.childRefs.slice();

      childrenCopy.forEach(function(childId) {
        manager.removeItem(childId);
      });

      parentItem.childRefs = [];
      parentItem.refreshDisplayType();

      return manager;
    };

    manager._shiftElements = function(sourceItem, destinationItem) {
      var childrenToMove = sourceItem.childRefs;

      destinationItem.element.parentNode.insertBefore(sourceItem.element, destinationItem.element.nextElementSibling);
      sourceItem.composeDisplay();

      for (var i = childrenToMove.length - 1; i >= 0; i--) {
        manager._shiftElements(manager.itemRegistry.get(childrenToMove[i]), sourceItem);
      }
    };

    manager._reorderChildElements = function(parentItem) {
      return manager._shiftElements(parentItem, parentItem);
    };

    manager.getItemById = function(id) {
      return manager.itemRegistry.get(id);
    };

    return manager;
  };

  // --- Plugin Actions (replaces methods) ---
  pluginActions = {
    initialize: function(customOptions, forceReinit) {
      var mergedConfig = Object.assign({}, pluginActions.defaultSettings, customOptions);

      return Array.from(this).map(function(domElement) {
        var currentElement = domElement;
        var existingManager = currentElement.customTreeViewData;

        if (forceReinit || existingManager === undefined) {
          var newManager = createStructureManager(currentElement, mergedConfig);
          newManager.ingestElements(currentElement.rows).drawHierarchy();

          currentElement.classList.add("hierarchy-view");
          currentElement.customTreeViewData = newManager;

          if (mergedConfig.onManagerInitialized != null) {
            mergedConfig.onManagerInitialized.apply(newManager);
          }
          return newManager;
        }
        return existingManager;
      });
    },

    dispose: function() {
      return Array.from(this).map(function(domElement) {
        if (domElement.customTreeViewData) {
          domElement.classList.remove("hierarchy-view");
          delete domElement.customTreeViewData;
        }
        return domElement;
      });
    },

    foldAllItems: function() {
      this.forEach(function(domElement) {
        var manager = domElement.customTreeViewData;
        if (manager) manager.foldAll();
      });
      return this;
    },

    foldSpecificItem: function(uniqueId) {
      this.forEach(function(domElement) {
        var manager = domElement.customTreeViewData;
        if (!manager) return;

        var targetItem = manager.getItemById(uniqueId);
        if (targetItem) {
          targetItem.fold();
        } else {
          console.error("Unknown item '" + uniqueId + "'");
        }
      });
      return this;
    },

    unfoldAllItems: function() {
      this.forEach(function(domElement) {
        var manager = domElement.customTreeViewData;
        if (manager) manager.unfoldAll();
      });
      return this;
    },

    unfoldSpecificItem: function(uniqueId) {
      this.forEach(function(domElement) {
        var manager = domElement.customTreeViewData;
        if (!manager) return;

        var targetItem = manager.getItemById(uniqueId);
        if (targetItem) {
          if (!targetItem.renderedOnce) {
            targetItem._prepareDisplay();
          }
          targetItem.unfold();
        } else {
          console.error("Unknown item '" + uniqueId + "'");
        }
      });
      return this;
    },

    getItem: function(uniqueId) {
      var manager = this[0] ? this[0].customTreeViewData : null;
      return manager ? manager.getItemById(uniqueId) : null;
    },

    moveItem: function(sourceId, destinationId) {
      this.forEach(function(domElement) {
        var manager = domElement.customTreeViewData;
        if (manager) manager.relocateItem(sourceId, destinationId);
      });
      return this;
    },

    removeItem: function(uniqueId) {
      this.forEach(function(domElement) {
        var manager = domElement.customTreeViewData;
        if (manager) manager.removeItem(uniqueId);
      });
      return this;
    },

    sortBranch: function(parentId, sortFunction) {
      this.forEach(function(domElement) {
        var manager = domElement.customTreeViewData;
        if (manager) manager.arrangeChildren(parentId, sortFunction);
      });
      return this;
    },

    unloadBranch: function(parentId) {
      this.forEach(function(domElement) {
        var manager = domElement.customTreeViewData;
        if (manager) {
          var parentItem = manager.getItemById(parentId);
          if (parentItem) manager.clearDescendantBranch(parentItem);
        }
      });
      return this;
    },

    // Default configuration settings
    defaultSettings: {
      branchFlagAttribute: "ttBranch",
      clickableItemNames: false,
      displayColumn: 0,
      columnElementType: "td",
      canExpandCollapse: false,
      toggleIconTemplate: "<a href='#'>&nbsp;</a>",
      indentationAmount: 19,
      indentationSpacerTemplate: "<span class='indentation-spacer'></span>",
      initialState: "folded",
      itemIdAttribute: "ttId",
      parentRefAttribute: "ttParentId",
      textUnfold: "Unfold",
      textFold: "Fold",

      // Events
      onManagerInitialized: null,
      onItemFolded: null,
      onItemUnfolded: null,
      onItemPrepared: null
    }
  };

  // Expose the plugin on the window object
  window.customTreeViewPlugin = function(action) {
    if (pluginActions[action]) {
      return pluginActions[action].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof action === 'object' || !action) {
      return pluginActions.initialize.apply(this, arguments);
    } else {
      console.error("Action '" + action + "' does not exist on customTreeViewPlugin.");
      return this;
    }
  };

  // Extend NodeList, HTMLCollection, and Array prototypes for chainability
  NodeList.prototype.customTreeViewPlugin = HTMLCollection.prototype.customTreeViewPlugin = Array.prototype.customTreeViewPlugin = function() {
    return window.customTreeViewPlugin.apply(this, arguments);
  };

})();