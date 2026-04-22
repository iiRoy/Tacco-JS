// This script provides tree-like functionality for HTML tables.
// Version: 3.2.0
// Project page: http://ludo.cubicphuse.nl/jquery-treetable
// (c) 2013, Ludo van den Boom
// Licensed under MIT or GPL v2.

(function(jq) {
  var ElementUnit, StructureGraph, functionalities;

  ElementUnit = (function() {
    function ElementUnit(record, graph, configurations) {
      var masterIdentifier;

      this.record = record;
      this.graph = graph;
      this.configurations = configurations;

      // Ensure that node identifiers are always string representations
      this.uniqueIdentifier = this.record.data(this.configurations.nodeIdAttr);

      // Extract the parent's identifier from the record's data attribute
      masterIdentifier = this.record.data(this.configurations.parentIdAttr);
      if (masterIdentifier !== null && masterIdentifier !== "") {
        this.masterIdentifier = masterIdentifier;
      }

      // Initialize visual components for the tree cell
      this.graphCell = jq(this.record.children(this.configurations.columnElType)[this.configurations.column]);
      this.togglerWidget = jq(this.configurations.expanderTemplate);
      this.alignmentTool = jq(this.configurations.indenterTemplate);
      this.subElements = []; // Store references to child units
      this.isPrepared = false; // Flag to check if the unit has been rendered
      this.graphCell.prepend(this.alignmentTool); // Insert indenter into the cell
    }

    ElementUnit.prototype.appendSubElement = function(subElement) {
      // Adds a child unit to this unit's collection
      return this.subElements.push(subElement);
    };

    ElementUnit.prototype.predecessors = function() {
      var predecessorsList, currentUnitRef;
      currentUnitRef = this;
      predecessorsList = [];
      while (currentUnitRef = currentUnitRef.masterUnit()) {
        predecessorsList.push(currentUnitRef);
      }
      return predecessorsList;
    };

    ElementUnit.prototype.fold = function() {
      // Check if the unit is already in a folded state
      if (this.isFolded()) {
        return this; // No action needed
      }

      // Update CSS classes to reflect the folded state
      this.record.removeClass("expanded").addClass("collapsed");

      // Conceal all direct and indirect sub-elements
      this._concealSubElements();
      this.togglerWidget.attr("title", this.configurations.stringExpand); // Update expander tooltip

      // Trigger the collapse callback if defined and unit is prepared
      if (this.isPrepared && this.configurations.onNodeCollapse != null) {
        this.configurations.onNodeCollapse.apply(this);
      }

      return this; // Return the current unit for chaining
    };

    ElementUnit.prototype.isFolded = function() {
      // Determines if the unit's record has the 'collapsed' class
      return this.record.hasClass("collapsed");
    };

    // This method could be extended to clean up event handlers and DOM elements
    // ElementUnit.prototype.destroyUnit = function() { /* ... */ };

    ElementUnit.prototype.unfold = function() {
      // Check if the unit is already in an unfolded state
      if (this.isUnfolded()) {
        return this; // No action needed
      }

      // Update CSS classes to reflect the unfolded state
      this.record.removeClass("collapsed").addClass("expanded");

      // Trigger the expand callback if defined and unit is prepared
      if (this.isPrepared && this.configurations.onNodeExpand != null) {
        this.configurations.onNodeExpand.apply(this);
      }

      // Only show children if the unit's row is currently visible
      if (jq(this.record).is(":visible")) {
        this._presentSubElements();
      }

      this.togglerWidget.attr("title", this.configurations.stringCollapse); // Update expander tooltip

      return this; // Return the current unit for chaining
    };

    ElementUnit.prototype.isUnfolded = function() {
      // Determines if the unit's record has the 'expanded' class
      return this.record.hasClass("expanded");
    };

    ElementUnit.prototype.conceal = function() {
      this._concealSubElements(); // First hide all sub-elements
      this.record.hide(); // Then hide this unit's own record
      return this;
    };

    ElementUnit.prototype.isDivisibleNode = function() {
      // A unit is considered 'divisible' (a branch) if it has children or is explicitly marked as a branch
      if(this.subElements.length > 0 || this.record.data(this.configurations.branchAttr) === true) {
        return true;
      } else {
        return false;
      }
    };

    ElementUnit.prototype.refreshNodeTypeClasses = function(){
      // Updates the CSS classes 'branch' or 'leaf' based on the unit's type
      this.record.removeClass('branch');
      this.record.removeClass('leaf');
      this.record.addClass(this.isDivisibleNode() ? 'branch' : 'leaf');
    };

    ElementUnit.prototype.depthLevel = function() {
      // Calculates the nesting level by counting its predecessors
      return this.predecessors().length;
    };

    ElementUnit.prototype.masterUnit = function() {
      // Returns the parent unit from the graph using the masterIdentifier
      if (this.masterIdentifier != null) {
        return this.graph[this.masterIdentifier];
      } else {
        return null; // No parent unit exists
      }
    };

    ElementUnit.prototype.removeSubElement = function(subElement) {
      // Removes a specific sub-element from this unit's collection
      var idx = jq.inArray(subElement, this.subElements);
      return this.subElements.splice(idx, 1);
    };

    ElementUnit.prototype.display = function() {
      var eventProcessor,
          configurations = this.configurations,
          interactionTarget;

      // Only add expander/click handlers if the unit is expandable and a branch
      if (configurations.expandable === true && this.isDivisibleNode()) {
        eventProcessor = function(evt) {
          // Toggle the unit's state when its expander or name is clicked
          jq(this).parents("table").treetable("node", jq(this).parents("tr").data(configurations.nodeIdAttr)).toggle();
          return evt.preventDefault();
        };

        this.alignmentTool.html(this.togglerWidget); // Place the toggler inside the indenter
        interactionTarget = configurations.clickableNodeNames === true ? this.graphCell : this.togglerWidget;

        // Attach click event for toggling
        interactionTarget.off("click.treetable").on("click.treetable", eventProcessor);
        // Attach keydown event (Enter key) for accessibility
        interactionTarget.off("keydown.treetable").on("keydown.treetable", function(evt) {
          if (evt.keyCode == 13) { // Enter key
            eventProcessor.apply(this, [evt]);
          }
        });
      }

      // Apply padding for visual indentation based on depth level
      this.alignmentTool[0].style.paddingLeft = "" + (this.depthLevel() * configurations.indent) + "px";

      return this; // Return the current unit for chaining
    };

    ElementUnit.prototype.disclose = function() {
      // Recursively unfolds all parent units up to the root, then unfolds itself
      if (this.masterIdentifier != null) {
        this.masterUnit().disclose();
      }
      return this.unfold();
    };

    ElementUnit.prototype.assignMaster = function(newMasterUnit) {
      // If the unit already has a parent, remove it from that parent's children list
      if (this.masterIdentifier != null) {
        this.graph[this.masterIdentifier].removeSubElement(this);
      }
      this.masterIdentifier = newMasterUnit.uniqueIdentifier; // Update parent ID
      this.record.data(this.configurations.parentIdAttr, newMasterUnit.uniqueIdentifier); // Update data attribute
      return newMasterUnit.appendSubElement(this); // Add this unit to the new parent's children
    };

    ElementUnit.prototype.present = function() {
      // If not yet prepared, perform initial rendering
      if (!this.isPrepared) {
        this._prepareUnit();
      }
      this.record.show(); // Show this unit's record
      if (this.isUnfolded()) {
        this._presentSubElements(); // If unfolded, also show its children
      }
      return this;
    };

    ElementUnit.prototype.flipState = function() {
      // Toggles between folded and unfolded states
      if (this.isUnfolded()) {
        this.fold();
      } else {
        this.unfold();
      }
      return this;
    };

    ElementUnit.prototype._concealSubElements = function() {
      var subElement, idx, totalCount, elementIter, collectedOutcomes;
      elementIter = this.subElements;
      collectedOutcomes = [];
      for (idx = 0, totalCount = elementIter.length; idx < totalCount; idx++) {
        subElement = elementIter[idx];
        collectedOutcomes.push(subElement.conceal()); // Recursively hide sub-elements
      }
      return collectedOutcomes;
    };

    ElementUnit.prototype._prepareUnit = function() {
      var configurations = this.configurations;

      this.display(); // Perform initial rendering of the unit's visual elements

      // Apply initial state (collapsed or expanded) based on configurations
      if (configurations.expandable === true && configurations.initialState === "collapsed") {
        this.fold();
      } else {
        this.unfold();
      }

      // Trigger the initialization callback if defined
      if (configurations.onNodeInitialized != null) {
        configurations.onNodeInitialized.apply(this);
      }

      return this.isPrepared = true; // Mark unit as prepared
    };

    ElementUnit.prototype._presentSubElements = function() {
      var subElement, idx, totalCount, elementIter, collectedOutcomes;
      elementIter = this.subElements;
      collectedOutcomes = [];
      for (idx = 0, totalCount = elementIter.length; idx < totalCount; idx++) {
        subElement = elementIter[idx];
        collectedOutcomes.push(subElement.present()); // Recursively show sub-elements
      }
      return collectedOutcomes;
    };

    return ElementUnit;
  })();

  StructureGraph = (function() {
    function StructureGraph(dataGrid, configurations) {
      this.dataGrid = dataGrid;
      this.configurations = configurations;
      this.graph = {}; // Stores all ElementUnit instances by their uniqueIdentifier

      // Maintain separate lists for all units and root units for easier access
      this.allUnits = [];
      this.baseUnits = [];
    }

    StructureGraph.prototype.foldAllUnits = function() {
      var currentUnit, idx, totalCount, unitList, collectedOutcomes;
      unitList = this.allUnits;
      collectedOutcomes = [];
      for (idx = 0, totalCount = unitList.length; idx < totalCount; idx++) {
        currentUnit = unitList[idx];
        collectedOutcomes.push(currentUnit.fold()); // Fold each unit
      }
      return collectedOutcomes;
    };

    StructureGraph.prototype.unfoldAllUnits = function() {
      var currentUnit, idx, totalCount, unitList, collectedOutcomes;
      unitList = this.allUnits;
      collectedOutcomes = [];
      for (idx = 0, totalCount = unitList.length; idx < totalCount; idx++) {
        currentUnit = unitList[idx];
        collectedOutcomes.push(currentUnit.unfold()); // Unfold each unit
      }
      return collectedOutcomes;
    };

    StructureGraph.prototype.locateLastUnit = function (currentUnit) {
      // Finds the deepest, right-most child of a given unit
      if (currentUnit.subElements.length > 0) {
        return this.locateLastUnit(currentUnit.subElements[currentUnit.subElements.length - 1]);
      } else {
        return currentUnit; // This unit is a leaf
      }
    };

    StructureGraph.prototype.populateDataRows = function(dataRecords) {
      var currentUnit, record, idx;

      if (dataRecords !== null) {
        for (idx = 0; idx < dataRecords.length; idx++) {
          record = jq(dataRecords[idx]);

          // Only process rows that have a valid node identifier
          if (record.data(this.configurations.nodeIdAttr) !== null) {
            currentUnit = new ElementUnit(record, this.graph, this.configurations);
            this.allUnits.push(currentUnit);
            this.graph[currentUnit.uniqueIdentifier] = currentUnit;

            // Assign parent-child relationships
            if (currentUnit.masterIdentifier !== null && this.graph[currentUnit.masterIdentifier]) {
              this.graph[currentUnit.masterIdentifier].appendSubElement(currentUnit);
            } else {
              this.baseUnits.push(currentUnit); // This unit is a root
            }
          }
        }
      }

      // After all units are loaded, update their branch/leaf classes
      for (idx = 0; idx < this.allUnits.length; idx++) {
        this.allUnits[idx].refreshNodeTypeClasses();
      }

      return this; // Return the graph instance for chaining
    };

    StructureGraph.prototype.relocateUnit = function(unitToMove, targetLocation) {
      // Conditions to prevent invalid moves:
      // 1. A unit cannot be moved as a child of itself.
      // 2. A unit cannot be moved to its current parent's location.
      // 3. A unit cannot be moved to a descendant location (creating a circular dependency).
      var unitToMoveMaster = unitToMove.masterUnit();
      if (unitToMove !== targetLocation && targetLocation.uniqueIdentifier !== unitToMove.masterIdentifier && jq.inArray(unitToMove, targetLocation.predecessors()) === -1) {
        unitToMove.assignMaster(targetLocation); // Update parent relationship
        this._relocateRecords(unitToMove, targetLocation); // Physically move the DOM rows

        // If the new parent had no children before, it needs to be re-rendered to show the expander
        if (unitToMove.masterUnit().subElements.length === 1) {
          unitToMove.masterUnit().display();
        }
      }

      // Refresh branch/leaf classes for affected units
      if(unitToMoveMaster){
        unitToMoveMaster.refreshNodeTypeClasses();
      }
      if(unitToMove.masterUnit()){
        unitToMove.masterUnit().refreshNodeTypeClasses();
      }
      unitToMove.refreshNodeTypeClasses();
      return this;
    };

    StructureGraph.prototype.deleteUnit = function(unitToDelete) {
      // Recursively remove all sub-elements of the unit being deleted
      this.depopulateSubGraph(unitToDelete);

      // Remove the unit's DOM row
      unitToDelete.record.remove();

      // Remove the unit from its parent's children list
      if (unitToDelete.masterIdentifier !== null) {
        unitToDelete.masterUnit().removeSubElement(unitToDelete);
      }

      // Clean up the internal graph object and allUnits array
      delete this.graph[unitToDelete.uniqueIdentifier];
      this.allUnits.splice(jq.inArray(unitToDelete, this.allUnits), 1);

      return this; // Return the graph instance
    };

    StructureGraph.prototype.display = function() {
      var baseUnit, idx, totalCount, baseUnitList;
      baseUnitList = this.baseUnits;
      for (idx = 0, totalCount = baseUnitList.length; idx < totalCount; idx++) {
        baseUnit = baseUnitList[idx];

        // The name "show/render" can be confusing. Here, we call 'present' on the unit.
        baseUnit.present();
      }
      return this;
    };

    StructureGraph.prototype.arrangeSubGraph = function(parentUnit, sortingFunction) {
      // First, sort the internal array of children based on the provided function
      parentUnit.subElements.sort(sortingFunction);

      // Then, re-order the DOM rows to reflect the new sorting
      this._arrangeSubRecords(parentUnit);

      return this; // Return the graph instance
    };

    StructureGraph.prototype.depopulateSubGraph = function(parentUnit) {
      // Create a copy of the children array to avoid issues if other functions modify it
      var subElementsCopy = parentUnit.subElements.slice(0),
          idx;

      for (idx = 0; idx < subElementsCopy.length; idx++) {
        this.deleteUnit(subElementsCopy[idx]); // Recursively delete each sub-element
      }

      // Reset the parent unit's children collection
      parentUnit.subElements = [];

      parentUnit.refreshNodeTypeClasses(); // Update its class as it might become a leaf

      return this; // Return the graph instance
    };

    StructureGraph.prototype._relocateRecords = function(unitToMove, targetLocation) {
      var subElements = unitToMove.subElements, idx;

      unitToMove.record.insertAfter(targetLocation.record); // Move the unit's record in the DOM
      unitToMove.display(); // Re-render the unit (e.g., update indentation)

      // Loop backwards through sub-elements to ensure correct order in UI when moving
      for (idx = subElements.length - 1; idx >= 0; idx--) {
        this._relocateRecords(subElements[idx], unitToMove);
      }
    };

    // A specialized case of _relocateRecords used to force sorting of children
    StructureGraph.prototype._arrangeSubRecords = function(parentUnit) {
      return this._relocateRecords(parentUnit, parentUnit);
    };

    return StructureGraph;
  })();

  // jQuery Extension for Tree-like Tables
  functionalities = {
    initializePlugin: function(pluginOptions, forceOverride) {
      var configurations;

      configurations = jq.extend({
        branchAttr: "treeBranch", // Data attribute for marking a branch
        clickableNodeNames: false, // Make the node name clickable to toggle
        column: 0, // Column index for the tree structure
        columnElType: "td", // Type of element for the tree column (e.g., 'td', 'th')
        expandable: false, // Is the tree expandable/collapsible?
        expanderTemplate: "<a href='#'>&nbsp;</a>", // HTML for the expander icon
        indent: 19, // Indentation pixel width per level
        indenterTemplate: "<span class='tree-indenter'></span>", // HTML for the indenter
        initialState: "collapsed", // Default state for nodes: 'collapsed' or 'expanded'
        nodeIdAttr: "data-node-id", // Data attribute for unique node ID
        parentIdAttr: "data-parent-id", // Data attribute for parent node ID
        stringExpand: "Click to Expand", // Tooltip for expander when collapsed
        stringCollapse: "Click to Collapse", // Tooltip for expander when expanded

        // Event callbacks for various actions
        onInitialized: null,
        onNodeCollapse: null,
        onNodeExpand: null,
        onNodeInitialized: null
      }, pluginOptions);

      return this.each(function() {
        var elementRef = jq(this), graphInstance;

        // Initialize only if not already initialized or if forced
        if (forceOverride || elementRef.data("structure-graph") === undefined) {
          graphInstance = new StructureGraph(this, configurations);
          graphInstance.populateDataRows(this.rows).display(); // Load data and render the graph

          elementRef.addClass("tree-grid").data("structure-graph", graphInstance); // Mark element as tree-grid

          // Trigger global initialization callback
          if (configurations.onInitialized !== null) {
            configurations.onInitialized.apply(graphInstance);
          }
        }

        return elementRef; // Return the jQuery element for chaining
      });
    },

    decommissionPlugin: function() {
      return this.each(function() {
        // Remove stored data and CSS class to revert element
        return jq(this).removeData("structure-graph").removeClass("tree-grid");
      });
    },

    foldAllUnits: function() {
      // Call the collapseAll method on the stored graph instance
      this.data("structure-graph").foldAllUnits();
      return this; // Return the jQuery object
    },

    foldSpecificUnit: function(unitId) {
      var unitToFold = this.data("structure-graph").graph[unitId];

      if (unitToFold) {
        unitToFold.fold(); // Fold the specific unit
      } else {
        throw new Error("Cannot find unit with ID: '" + unitId + "'");
      }

      return this; // Return the jQuery object
    },

    unfoldAllUnits: function() {
      // Call the expandAll method on the stored graph instance
      this.data("structure-graph").unfoldAllUnits();
      return this; // Return the jQuery object
    },

    unfoldSpecificUnit: function(unitId) {
      var unitToUnfold = this.data("structure-graph").graph[unitId];

      if (unitToUnfold) {
        if (!unitToUnfold.isPrepared) {
          unitToUnfold._prepareUnit(); // Ensure unit is prepared before unfolding
        }
        unitToUnfold.unfold(); // Unfold the specific unit
      } else {
        throw new Error("Cannot find unit with ID: '" + unitId + "'");
      }

      return this;
    }
  };

  // Attach functionalities to jQuery prototype
  jq.fn.treetable = function(method) {
    if (functionalities[method]) {
      return functionalities[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return functionalities.initializePlugin.apply(this, arguments);
    } else {
      jq.error("Method " + method + " does not exist on jQuery.treetable");
    }
  };

})(jQuery);