(function(jQ) {
  // Module for managing hierarchical DOM structures in tables.
  // This library enables dynamic tree-like views within standard HTML tables.
  // Original project: jQuery treetable Plugin, adapted and heavily modified.

  let HierarchicalItem, StructureManager, pluginActions;

  // Represents a single row in the hierarchical table, acting as a node.
  HierarchicalItem = (function() {
    // Private static counter for debugging item IDs if not provided.
    let _itemCounter = 0;

    /**
     * Constructs a new HierarchicalItem instance.
     * @param {jQuery} itemElement - The jQuery-wrapped table row (TR) element.
     * @param {Object.<string, HierarchicalItem>} itemRegistry - The global registry of all items by ID.
     * @param {Object} itemConfig - Configuration settings for the hierarchical view.
     */
    function HierarchicalItem(itemElement, itemRegistry, itemConfig) {
      // Basic validation for the DOM element.
      if (!itemElement || !itemElement.length || itemElement[0].tagName !== 'TR') {
        console.warn("Attempted to create HierarchicalItem with an invalid DOM element.", itemElement);
        throw new Error("Invalid DOM element provided for HierarchicalItem construction.");
      }

      this.domElement = itemElement;
      this.itemRegistry = itemRegistry;
      this.itemConfig = itemConfig;

      // Extract item ID from data attribute, ensuring it's a string.
      // Fallback to a generated ID if not found, for robustness.
      this.uniqueId = String(this.domElement.data(this.itemConfig.itemIdAttribute) || `generated-id-${_itemCounter++}`);

      // Extract parent ID, ensuring it's a string if present.
      const parentIdentifier = this.domElement.data(this.itemConfig.parentRefAttribute);
      if (parentIdentifier !== null && parentIdentifier !== undefined && parentIdentifier !== "") {
        this.parentRefId = String(parentIdentifier);
      } else {
        this.parentRefId = null; // Explicitly null for root items
      }

      // Identify the cell where the tree controls will be inserted.
      this.treeDisplayCell = jQ(this.domElement.children(this.itemConfig.displayCellSelector)[this.itemConfig.displayColumnIndex]);
      // Create the expand/collapse toggle control and indentation spacer.
      this.toggleControl = jQ(this.itemConfig.expanderMarkup);
      this.levelSpacer = jQ(this.itemConfig.indenterMarkup);
      this.descendants = []; // Direct children of this item.
      this.isReady = false; // Flag to indicate if initial setup is complete.

      // Prepend the visual spacer to the tree cell.
      this.treeDisplayCell.prepend(this.levelSpacer);

      // Add a tabindex for accessibility if it's an expandable node.
      if (this.itemConfig.isExpandable) {
        this.domElement.attr('tabindex', 0);
      }
    }

    /**
     * Appends a child item to this item's list of descendants.
     * @param {HierarchicalItem} childItem - The item to add as a child.
     * @returns {number} The new length of the descendants array.
     */
    HierarchicalItem.prototype.appendDescendant = function(childItem) {
      if (childItem && childItem.uniqueId && childItem.uniqueId === this.uniqueId) {
        console.warn("Attempted to add an item as its own descendant.", childItem);
        return this.descendants.length;
      }
      return this.descendants.push(childItem);
    };

    /**
     * Retrieves all ancestral items, from immediate parent up to the root.
     * @returns {Array<HierarchicalItem>} An array of ancestors.
     */
    HierarchicalItem.prototype.getLineage = function() {
      const ancestorsList = [];
      let currentItem = this;
      // Traverse upwards until no parent is found.
      while (currentItem = currentItem.retrieveParent()) {
        ancestorsList.unshift(currentItem); // Add to the beginning to maintain order from root to parent.
      }
      return ancestorsList;
    };

    /**
     * Folds (collapses) the current item, hiding its descendants.
     * @returns {HierarchicalItem} The current item instance.
     */
    HierarchicalItem.prototype.foldBranch = function() {
      if (this.isFolded()) {
        return this; // Already folded, no action needed.
      }
      if (!this.hasChildrenOrFlag()) {
        return this; // Cannot fold a leaf node.
      }

      this.domElement.removeClass("is-unfolded").addClass("is-folded");
      this._concealDescendants();
      this.toggleControl.attr("title", this.itemConfig.textExpand);

      if (this.isReady && typeof this.itemConfig.onItemFolded === 'function') {
        this.itemConfig.onItemFolded.apply(this);
      }
      return this;
    };

    /**
     * Checks if the item is currently folded (collapsed).
     * @returns {boolean} True if folded, false otherwise.
     */
    HierarchicalItem.prototype.isFolded = function() {
      return this.domElement.hasClass("is-folded");
    };

    /**
     * Unfolds (expands) the current item, revealing its direct descendants.
     * @returns {HierarchicalItem} The current item instance.
     */
    HierarchicalItem.prototype.unfoldBranch = function() {
      if (this.isUnfolded()) {
        return this; // Already unfolded, no action needed.
      }
      if (!this.hasChildrenOrFlag()) {
        return this; // Cannot unfold a leaf node.
      }

      this.domElement.removeClass("is-folded").addClass("is-unfolded");

      if (this.isReady && typeof this.itemConfig.onItemUnfolded === 'function') {
        this.itemConfig.onItemUnfolded.apply(this);
      }

      // Only reveal children if the parent row itself is visible.
      if (this.domElement.is(":visible")) {
        this._revealDescendants();
      }

      this.toggleControl.attr("title", this.itemConfig.textCollapse);
      return this;
    };

    /**
     * Checks if the item is currently unfolded (expanded).
     * @returns {boolean} True if unfolded, false otherwise.
     */
    HierarchicalItem.prototype.isUnfolded = function() {
      return this.domElement.hasClass("is-unfolded");
    };

    /**
     * Hides the current item and all its descendants.
     * @returns {HierarchicalItem} The current item instance.
     */
    HierarchicalItem.prototype.conceal = function() {
      this._concealDescendants();
      this.domElement.hide();
      return this;
    };

    /**
     * Determines if the item should be considered a branch (has children or is flagged as such).
     * @returns {boolean} True if it's a branch, false if it's a leaf.
     */
    HierarchicalItem.prototype.hasChildrenOrFlag = function() {
      return this.descendants.length > 0 || this.domElement.data(this.itemConfig.branchFlagAttribute) === true;
    };

    /**
     * Updates the CSS classes ('node-branch' or 'node-leaf') based on whether it's a branch or leaf.
     */
    HierarchicalItem.prototype.refreshNodeTypeClass = function() {
      this.domElement.removeClass('node-branch node-leaf');
      this.domElement.addClass(this.hasChildrenOrFlag() ? 'node-branch' : 'node-leaf');
    };

    /**
     * Calculates the hierarchical depth level of the item.
     * @returns {number} The depth level (0 for root items).
     */
    HierarchicalItem.prototype.getDepthLevel = function() {
      return this.getLineage().length;
    };

    /**
     * Retrieves the parent HierarchicalItem instance.
     * @returns {HierarchicalItem|null} The parent item, or null if it's a root item.
     */
    HierarchicalItem.prototype.retrieveParent = function() {
      return this.parentRefId ? this.itemRegistry[this.parentRefId] || null : null;
    };

    /**
     * Removes a specified child item from this item's descendant list.
     * @param {HierarchicalItem} childItem - The item to remove.
     * @returns {Array<HierarchicalItem>} An array containing the removed item (or empty if not found).
     */
    HierarchicalItem.prototype.removeDescendant = function(childItem) {
      const itemIndex = this.descendants.indexOf(childItem);
      return itemIndex > -1 ? this.descendants.splice(itemIndex, 1) : [];
    };

    /**
     * Renders or updates the visual elements for the item, such as expander and indentation.
     * @returns {HierarchicalItem} The current item instance.
     */
    HierarchicalItem.prototype.displayVisuals = function() {
      const config = this.itemConfig;

      // Only add expander if the feature is enabled and it's a branch node.
      if (config.isExpandable && this.hasChildrenOrFlag()) {
        const eventHandler = (evt) => {
          // Find the treetable instance and the specific node, then toggle.
          jQ(evt.currentTarget).parents("table").data("hierarchicalViewInstance")
            .toggleItem(jQ(evt.currentTarget).parents("tr").data(config.itemIdAttribute));
          evt.preventDefault();
        };

        this.levelSpacer.html(this.toggleControl); // Place expander inside indenter.
        const interactionTarget = config.isClickableHeaders ? this.treeDisplayCell : this.toggleControl;

        // Clear previous event handlers to prevent duplication.
        interactionTarget.off("click.hierarchicalView").on("click.hierarchicalView", eventHandler);
        interactionTarget.off("keydown.hierarchicalView").on("keydown.hierarchicalView", (evt) => {
          if (evt.keyCode === 13) { // Enter key
            eventHandler.apply(this, [evt]);
          }
        });
      } else {
        // If not expandable or not a branch, ensure no expander is present.
        this.levelSpacer.empty();
      }

      // Set padding for indentation based on depth level.
      this.levelSpacer[0].style.paddingLeft = `${this.getDepthLevel() * config.indentSize}px`;

      return this;
    };

    /**
     * Reveals the current item and ensures all its ancestors are also revealed and expanded.
     * @returns {HierarchicalItem} The current item instance.
     */
    HierarchicalItem.prototype.unfoldAncestors = function() {
      const parent = this.retrieveParent();
      if (parent) {
        parent.unfoldAncestors(); // Recursively reveal parents.
      }
      return this.unfoldBranch(); // Then unfold self.
    };

    /**
     * Assigns a new parent to this item, updating relationships and DOM data.
     * @param {HierarchicalItem} newParentItem - The new parent item.
     * @returns {HierarchicalItem} The current item instance.
     */
    HierarchicalItem.prototype.assignParent = function(newParentItem) {
      // Remove from old parent's children list if exists.
      if (this.parentRefId && this.itemRegistry[this.parentRefId]) {
        this.itemRegistry[this.parentRefId].removeDescendant(this);
      }

      this.parentRefId = newParentItem.uniqueId;
      this.domElement.data(this.itemConfig.parentRefAttribute, newParentItem.uniqueId);
      newParentItem.appendDescendant(this); // Add to new parent's children.
      return this;
    };

    /**
     * Displays the current item and its visible descendants.
     * @returns {HierarchicalItem} The current item instance.
     */
    HierarchicalItem.prototype.revealSelf = function() {
      if (!this.isReady) {
        this._performInitialSetup();
      }
      this.domElement.show();
      if (this.isUnfolded()) {
        this._revealDescendants();
      }
      return this;
    };

    /**
     * Toggles the folded/unfolded state of the item.
     * @returns {HierarchicalItem} The current item instance.
     */
    HierarchicalItem.prototype.toggleVisibility = function() {
      return this.isUnfolded() ? this.foldBranch() : this.unfoldBranch();
    };

    /**
     * Recursively hides all direct and indirect descendants of this item.
     * @private
     */
    HierarchicalItem.prototype._concealDescendants = function() {
      this.descendants.forEach(child => child.conceal());
    };

    /**
     * Performs the initial setup for the item, including rendering and initial state.
     * @private
     */
    HierarchicalItem.prototype._performInitialSetup = function() {
      if (this.isReady) {
        return; // Already initialized.
      }

      this.displayVisuals(); // Render the visual components.

      // Apply initial state (folded or unfolded).
      if (this.itemConfig.isExpandable && this.itemConfig.initialDisplayState === "folded") {
        this.foldBranch();
      } else {
        this.unfoldBranch();
      }

      this.isReady = true; // Mark as initialized.

      if (typeof this.itemConfig.onItemInitialized === 'function') {
        this.itemConfig.onItemInitialized.apply(this);
      }
    };

    /**
     * Recursively shows all direct and indirect descendants of this item.
     * @private
     */
    HierarchicalItem.prototype._revealDescendants = function() {
      this.descendants.forEach(child => child.revealSelf());
    };

    /**
     * Cleans up the item by removing event handlers and DOM elements.
     * @private
     */
    HierarchicalItem.prototype.cleanup = function() {
      this.toggleControl.off(".hierarchicalView");
      this.treeDisplayCell.off(".hierarchicalView");
      this.domElement.removeData(this.itemConfig.itemIdAttribute);
      this.domElement.removeData(this.itemConfig.parentRefAttribute);
      this.domElement.removeData(this.itemConfig.branchFlagAttribute);
      this.levelSpacer.remove();
      this.toggleControl.remove();
      this.domElement.removeClass("is-unfolded is-folded node-branch node-leaf hierarchical-item");
      this.domElement.removeAttr('tabindex');
    };

    return HierarchicalItem;
  })();

  // Manages the overall hierarchical structure of items within a table.
  StructureManager = (function() {
    /**
     * Constructs a new StructureManager instance.
     * @param {HTMLElement} targetTableElement - The raw HTML table element.
     * @param {Object} configSettings - Configuration settings for the hierarchical view.
     */
    function StructureManager(targetTableElement, configSettings) {
      this.targetTable = jQ(targetTableElement);
      this.configSettings = configSettings;
      this.itemRegistry = {}; // Stores HierarchicalItem instances by their uniqueId.
      this.allItems = []; // Array of all HierarchicalItem instances.
      this.topLevelItems = []; // Array of root HierarchicalItem instances.

      // Add a class to the table for styling purposes.
      this.targetTable.addClass('hierarchical-view-table');
    }

    /**
     * Folds (collapses) all items in the hierarchy.
     * @returns {Array<HierarchicalItem>} An array of folded items.
     */
    StructureManager.prototype.foldAll = function() {
      return this.allItems.map(item => item.foldBranch());
    };

    /**
     * Unfolds (expands) all items in the hierarchy.
     * @returns {Array<HierarchicalItem>} An array of unfolded items.
     */
    StructureManager.prototype.unfoldAll = function() {
      return this.allItems.map(item => item.unfoldBranch());
    };

    /**
     * Finds the deepest child item within a given branch.
     * @param {HierarchicalItem} startItem - The item to start searching from.
     * @returns {HierarchicalItem} The deepest child item.
     */
    StructureManager.prototype.findDeepestChild = function(startItem) {
      if (!startItem) {
        return null;
      }
      if (startItem.descendants.length === 0) {
        return startItem;
      }
      // Recursively find the deepest child of the last direct descendant.
      return this.findDeepestChild(startItem.descendants[startItem.descendants.length - 1]);
    };

    /**
     * Ingests table rows, creating HierarchicalItem instances and building the tree structure.
     * @param {HTMLCollection} rowElements - A collection of HTML table row elements.
     * @returns {StructureManager} The current manager instance.
     */
    StructureManager.prototype.ingestElements = function(rowElements) {
      if (!rowElements || rowElements.length === 0) {
        console.warn("No row elements provided for ingestion.");
        return this;
      }

      // Convert HTMLCollection to Array for easier iteration.
      Array.from(rowElements).forEach(rowElement => {
        const jQRow = jQ(rowElement);
        const itemRefId = jQRow.data(this.configSettings.itemIdAttribute);

        // Validate item ID presence.
        if (itemRefId === null || itemRefId === undefined || itemRefId === "") {
          console.warn(`Skipping row due to missing or empty item ID:`, rowElement);
          return; // Skip this row if no valid ID.
        }

        // Prevent duplicate item IDs.
        if (this.itemRegistry[itemRefId]) {
          console.warn(`Duplicate item ID '${itemRefId}' found. Skipping row:`, rowElement);
          return;
        }

        const newItem = new HierarchicalItem(jQRow, this.itemRegistry, this.configSettings);
        this.allItems.push(newItem);
        this.itemRegistry[newItem.uniqueId] = newItem;

        // Establish parent-child relationships.
        if (newItem.parentRefId && this.itemRegistry[newItem.parentRefId]) {
          this.itemRegistry[newItem.parentRefId].appendDescendant(newItem);
        } else {
          this.topLevelItems.push(newItem); // This is a root item.
        }
      });

      // After all items are loaded, update their branch/leaf status.
      this.allItems.forEach(item => item.refreshNodeTypeClass());

      return this;
    };

    /**
     * Repositions an item within the hierarchy, moving it under a new parent.
     * @param {HierarchicalItem} itemToMove - The item to be moved.
     * @param {HierarchicalItem} destinationItem - The new parent item for the itemToMove.
     * @returns {StructureManager} The current manager instance.
     */
    StructureManager.prototype.repositionItem = function(itemToMove, destinationItem) {
      // Guard clauses for invalid moves.
      if (!itemToMove || !destinationItem || itemToMove.uniqueId === destinationItem.uniqueId) {
        console.warn("Invalid item or destination for repositioning.", {itemToMove, destinationItem});
        return this;
      }

      const oldParent = itemToMove.retrieveParent();

      // Ensure the destination is not the item's current parent and not an ancestor of itself.
      const isSelfAncestor = destinationItem.getLineage().some(ancestor => ancestor.uniqueId === itemToMove.uniqueId);
      if (destinationItem.uniqueId !== itemToMove.parentRefId && !isSelfAncestor) {
        itemToMove.assignParent(destinationItem);
        this._shiftElements(itemToMove, destinationItem);

        // If the new parent had no children before, its visual representation (expander) needs updating.
        if (destinationItem.descendants.length === 1) {
          destinationItem.displayVisuals();
        }
      } else {
        console.warn("Repositioning attempt failed: destination is current parent or an ancestor.", {itemToMove, destinationItem});
      }

      // Update branch/leaf classes for affected items.
      oldParent?.refreshNodeTypeClass(); // Use optional chaining for oldParent.
      itemToMove.retrieveParent()?.refreshNodeTypeClass();
      itemToMove.refreshNodeTypeClass();

      return this;
    };

    /**
     * Removes an item and all its descendants from the hierarchy and the DOM.
     * @param {HierarchicalItem} itemToPurge - The item to remove.
     * @returns {StructureManager} The current manager instance.
     */
    StructureManager.prototype.purgeItem = function(itemToPurge) {
      if (!itemToPurge || !this.itemRegistry[itemToPurge.uniqueId]) {
        console.warn("Attempted to purge a non-existent item.", itemToPurge);
        return this;
      }

      // Recursively remove all descendants first.
      this.clearBranch(itemToPurge);

      // Remove item from DOM.
      itemToPurge.domElement.remove();

      // Remove item from parent's descendant list.
      const parent = itemToPurge.retrieveParent();
      if (parent) {
        parent.removeDescendant(itemToPurge);
        parent.refreshNodeTypeClass(); // Parent might become a leaf now.
      } else {
        // If it was a root item, remove from topLevelItems.
        const rootIndex = this.topLevelItems.indexOf(itemToPurge);
        if (rootIndex > -1) {
          this.topLevelItems.splice(rootIndex, 1);
        }
      }

      // Clean up HierarchicalItem instance.
      itemToPurge.cleanup();

      // Remove from global registry and allItems array.
      delete this.itemRegistry[itemToPurge.uniqueId];
      const itemIndex = this.allItems.indexOf(itemToPurge);
      if (itemIndex > -1) {
        this.allItems.splice(itemIndex, 1);
      }

      return this;
    };

    /**
     * Renders the entire hierarchical view, ensuring all root items are displayed correctly.
     * @returns {StructureManager} The current manager instance.
     */
    StructureManager.prototype.renderView = function() {
      this.topLevelItems.forEach(rootItem => {
        // Naming is confusing (show/render). `revealSelf` handles both rendering visuals and showing.
        rootItem.revealSelf();
      });
      return this;
    };

    /**
     * Sorts the direct descendants of a given item based on a provided comparison function.
     * @param {HierarchicalItem} parentItem - The item whose children need sorting.
     * @param {Function} sortComparator - A comparison function for sorting children.
     * @returns {StructureManager} The current manager instance.
     */
    StructureManager.prototype.arrangeDescendants = function(parentItem, sortComparator) {
      if (!parentItem || parentItem.descendants.length === 0) {
        return this;
      }

      // First, sort the internal array of children.
      parentItem.descendants.sort(sortComparator);

      // Next, reorder the rows in the DOM to reflect the sorted order.
      this._reorderChildElements(parentItem);

      return this;
    };

    /**
     * Removes all descendants of a given item from the hierarchy and DOM.
     * @param {HierarchicalItem} parentItem - The item whose branch is to be cleared.
     * @returns {StructureManager} The current manager instance.
     */
    StructureManager.prototype.clearBranch = function(parentItem) {
      // Work on a copy of the descendants array to avoid issues with modification during iteration.
      const childrenCopy = parentItem.descendants.slice();

      childrenCopy.forEach(child => this.purgeItem(child));

      // Reset the parent's collection of children (should be empty after purging).
      parentItem.descendants = [];
      parentItem.refreshNodeTypeClass(); // Update parent's class if it's now a leaf.

      return this;
    };

    /**
     * Recursively moves DOM elements to their correct positions after a hierarchy change.
     * @param {HierarchicalItem} itemToShift - The item whose row is to be moved.
     * @param {HierarchicalItem} targetItem - The item after which `itemToShift` should be inserted.
     * @private
     */
    StructureManager.prototype._shiftElements = function(itemToShift, targetItem) {
      if (!itemToShift || !targetItem || !itemToShift.domElement || !targetItem.domElement) {
        console.warn("Invalid item or target for element shifting.", {itemToShift, targetItem});
        return;
      }

      itemToShift.domElement.insertAfter(targetItem.domElement);
      itemToShift.displayVisuals(); // Ensure visuals are updated after DOM move.

      // Loop backwards through children to ensure they are inserted in the correct visual order.
      for (let i = itemToShift.descendants.length - 1; i >= 0; i--) {
        this._shiftElements(itemToShift.descendants[i], itemToShift);
      }
    };

    /**
     * Special case of _shiftElements to force reordering of children for a parent.
     * @param {HierarchicalItem} parentItem - The parent whose children need reordering.
     * @private
     */
    StructureManager.prototype._reorderChildElements = function(parentItem) {
      // By moving children relative to their own parent, they get re-inserted in the sorted order.
      this._shiftElements(parentItem, parentItem);
    };

    /**
     * Destroys the StructureManager instance and cleans up the DOM.
     */
    StructureManager.prototype.destroy = function() {
      // Iterate through all items and clean them up.
      this.allItems.forEach(item => item.cleanup());

      // Remove the class from the table.
      this.targetTable.removeClass('hierarchical-view-table');

      // Clear internal collections.
      this.itemRegistry = {};
      this.allItems = [];
      this.topLevelItems = [];
    };

    return StructureManager;
  })();

  // jQuery Plugin Interface
  pluginActions = {
    /**
     * Initializes the hierarchical view on the selected table(s).
     * @param {Object} [userOptions] - User-defined configuration options.
     * @param {boolean} [forceReinit=false] - Force re-initialization even if already setup.
     * @returns {jQuery} The jQuery object for chaining.
     */
    init: function(userOptions, forceReinit = false) {
      // Default configuration settings.
      const defaultSettings = {
        branchFlagAttribute: "tree-is-branch", // maps to data-tree-is-branch
        isClickableHeaders: false,
        displayColumnIndex: 0,
        displayCellSelector: "td", // i.e. 'td', 'th' or 'td,th'
        isExpandable: false,
        expanderMarkup: "<a href='#' class='tree-toggle'>&nbsp;</a>",
        indentSize: 19,
        indenterMarkup: "<span class='tree-indenter'></span>",
        initialDisplayState: "folded", // "folded" or "unfolded"
        itemIdAttribute: "tree-item-id", // maps to data-tree-item-id
        parentRefAttribute: "tree-parent-id", // maps to data-tree-parent-id
        textExpand: "Expand Branch",
        textCollapse: "Collapse Branch",

        // Event callbacks
        onViewInitialized: null,
        onItemFolded: null,
        onItemUnfolded: null,
        onItemInitialized: null
      };

      const finalConfig = Object.assign({}, defaultSettings, userOptions);

      return this.each(function() {
        const currentElement = jQ(this);
        let currentManager = currentElement.data("hierarchicalViewInstance");

        if (currentManager && !forceReinit) {
          console.info("Hierarchical view already initialized on this element. Use 'destroy' first or 'forceReinit: true'.", this);
          return currentElement;
        }

        // If forceReinit is true or it's a first init, destroy existing instance first.
        if (currentManager) {
          currentManager.destroy();
          currentElement.removeData("hierarchicalViewInstance");
        }

        // Check if the element contains any rows.
        if (this.rows.length === 0) {
          console.warn("Cannot initialize hierarchical view on table with no rows.", this);
          return currentElement;
        }

        currentManager = new StructureManager(this, finalConfig);
        currentManager.ingestElements(this.rows).renderView();

        currentElement.addClass("hierarchical-view-active").data("hierarchicalViewInstance", currentManager);

        if (typeof finalConfig.onViewInitialized === 'function') {
          finalConfig.onViewInitialized.apply(currentManager);
        }

        return currentElement;
      });
    },

    /**
     * Destroys the hierarchical view instance(s) on the selected table(s).
     * @returns {jQuery} The jQuery object for chaining.
     */
    destroy: function() {
      return this.each(function() {
        const currentElement = jQ(this);
        const currentManager = currentElement.data("hierarchicalViewInstance");

        if (currentManager) {
          currentManager.destroy();
          currentElement.removeData("hierarchicalViewInstance").removeClass("hierarchical-view-active");
        }
      });
    },

    /**
     * Collapses all items in the hierarchical view.
     * @returns {jQuery} The jQuery object for chaining.
     */
    collapseAllItems: function() {
      this.data("hierarchicalViewInstance")?.foldAll();
      return this;
    },

    /**
     * Collapses a specific item by its ID.
     * @param {string} itemId - The unique ID of the item to collapse.
     * @returns {jQuery} The jQuery object for chaining.
     * @throws {Error} If the specified item ID is unknown.
     */
    collapseItem: function(itemId) {
      const item = this.data("hierarchicalViewInstance")?.itemRegistry[itemId];

      if (item) {
        item.foldBranch();
      } else {
        throw new Error(`Unknown item ID for collapse: '${itemId}'`);
      }
      return this;
    },

    /**
     * Expands all items in the hierarchical view.
     * @returns {jQuery} The jQuery object for chaining.
     */
    expandAllItems: function() {
      this.data("hierarchicalViewInstance")?.unfoldAll();
      return this;
    },

    /**
     * Expands a specific item by its ID.
     * @param {string} itemId - The unique ID of the item to expand.
     * @returns {jQuery} The jQuery object for chaining.
     * @throws {Error} If the specified item ID is unknown.
     */
    expandItem: function(itemId) {
      const item = this.data("hierarchicalViewInstance")?.itemRegistry[itemId];

      if (item) {
        item.unfoldBranch();
      } else {
        throw new Error(`Unknown item ID for expand: '${itemId}'`);
      }
      return this;
    },

    /**
     * Toggles the folded/unfolded state of a specific item by its ID.
     * @param {string} itemId - The unique ID of the item to toggle.
     * @returns {jQuery} The jQuery object for chaining.
     * @throws {Error} If the specified item ID is unknown.
     */
    toggleItem: function(itemId) {
      const item = this.data("hierarchicalViewInstance")?.itemRegistry[itemId];

      if (item) {
        item.toggleVisibility();
      } else {
        throw new Error(`Unknown item ID for toggle: '${itemId}'`);
      }
      return this;
    },

    /**
     * Retrieves a HierarchicalItem instance by its ID.
     * @param {string} itemId - The unique ID of the item.
     * @returns {HierarchicalItem|null} The HierarchicalItem instance, or null if not found.
     */
    getItem: function(itemId) {
      return this.data("hierarchicalViewInstance")?.itemRegistry[itemId] || null;
    },

    /**
     * Moves an item to be a child of another item.
     * @param {string} itemId - The ID of the item to move.
     * @param {string} destinationId - The ID of the item that will become the new parent.
     * @returns {jQuery} The jQuery object for chaining.
     * @throws {Error} If either item ID is unknown.
     */
    moveItem: function(itemId, destinationId) {
      const manager = this.data("hierarchicalViewInstance");
      const itemToMove = manager?.itemRegistry[itemId];
      const destinationItem = manager?.itemRegistry[destinationId];

      if (!itemToMove) throw new Error(`Item to move not found: '${itemId}'`);
      if (!destinationItem) throw new Error(`Destination item not found: '${destinationId}'`);

      manager.repositionItem(itemToMove, destinationItem);
      return this;
    },

    /**
     * Removes an item and all its descendants.
     * @param {string} itemId - The ID of the item to remove.
     * @returns {jQuery} The jQuery object for chaining.
     * @throws {Error} If the item ID is unknown.
     */
    removeItem: function(itemId) {
      const manager = this.data("hierarchicalViewInstance");
      const itemToPurge = manager?.itemRegistry[itemId];

      if (!itemToPurge) throw new Error(`Item to remove not found: '${itemId}'`);

      manager.purgeItem(itemToPurge);
      return this;
    },

    /**
     * Sorts the children of a given item.
     * @param {string} parentId - The ID of the parent item whose children will be sorted.
     * @param {Function} sortFunction - A comparison function (like Array.prototype.sort).
     * @returns {jQuery} The jQuery object for chaining.
     * @throws {Error} If the parent item ID is unknown.
     */
    sortChildren: function(parentId, sortFunction) {
      const manager = this.data("hierarchicalViewInstance");
      const parentItem = manager?.itemRegistry[parentId];

      if (!parentItem) throw new Error(`Parent item for sorting not found: '${parentId}'`);
      if (typeof sortFunction !== 'function') throw new Error("Sort function must be provided for sortChildren.");

      manager.arrangeDescendants(parentItem, sortFunction);
      return this;
    },

    /**
     * Clears all descendants of a given item.
     * @param {string} parentId - The ID of the parent item whose branch will be cleared.
     * @returns {jQuery} The jQuery object for chaining.
     * @throws {Error} If the parent item ID is unknown.
     */
    clearItemBranch: function(parentId) {
      const manager = this.data("hierarchicalViewInstance");
      const parentItem = manager?.itemRegistry[parentId];

      if (!parentItem) throw new Error(`Parent item for branch clearing not found: '${parentId}'`);

      manager.clearBranch(parentItem);
      return this;
    },

    /**
     * Reveals an item and all its ancestors, expanding them as needed.
     * @param {string} itemId - The ID of the item to reveal.
     * @returns {jQuery} The jQuery object for chaining.
     * @throws {Error} If the item ID is unknown.
     */
    revealItemAndAncestors: function(itemId) {
      const item = this.data("hierarchicalViewInstance")?.itemRegistry[itemId];

      if (item) {
        item.unfoldAncestors();
      } else {
        throw new Error(`Unknown item ID for revealing: '${itemId}'`);
      }
      return this;
    }
  };

  // Attach the plugin to jQuery.
  jQ.fn.hierarchicalView = function(action) {
    if (pluginActions[action]) {
      // Call a specific action method.
      // `this` refers to the jQuery object the method was called on.
      return pluginActions[action].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof action === 'object' || !action) {
      // If no action is specified or an options object is passed, initialize the plugin.
      return pluginActions.init.apply(this, arguments);
    } else {
      // Handle unknown actions.
      jQ.error(`Action '${action}' does not exist on jQuery.hierarchicalView.`);
    }
  };

})(jQuery);