/*
 * HierarchicalSelector
 * https://github.com/yournewrepo/hierarchical-selector
 *
 * This implementation is based on a prior collapsible checkbox tree.
 *
 * Copyright (c) 2024 Your Name
 * Licensed under the Apache 2.0 license.
 */

!function(jQ) {
  "use strict";

  // Main component class for handling hierarchical selections
  var HierarchicalSelector = function(targetElement, configSettings) {
    // Store the main DOM element
    this._rootNode = jQ(targetElement);

    // Merge provided settings with default preferences
    this._prefs = jQ.extend(true, jQ.fn.hierarchicalSelector.defaultSettings, configSettings);

    // Prepare the structure of the display
    this._initializeDom();

    // Attach click handlers for selection boxes
    this._rootNode.find("input[type='checkbox']")
      .on('click', jQ.proxy(this._handleBoxClick, this));

    // Attach click handlers for expanding/collapsing branches
    this._rootNode.find("li:has(> ul) label")
      .on('click', jQ.proxy(this._manageBranchDisplay, this));

    // Set initial display state based on configuration
    switch (this._prefs.startState) {
      case 'unfold':
        this._unfoldAll();
        break;
      case 'fold':
        this._foldAll();
        break;
      default:
        this._setInitialVisibility();
    }

    // Return the instance
    return this;
  };

  // Define prototype methods for the HierarchicalSelector
  HierarchicalSelector.prototype = {

    // Prepares the HTML structure for interaction
    _initializeDom: function() {
      // Insert placeholder elements for branch toggles
      this._rootNode.find("li").prepend('<label>&nbsp;</label>');

      // If configured, ensure children of initially checked boxes are also checked
      if (this._prefs.autoSelectChildren) {
        this._rootNode.find("input:checked").parent("li").find("input[type='checkbox']").prop('checked', true);
      }
    },

    // Handles the event when a checkbox is clicked
    _handleBoxClick: function(eventObj) {
      // Get the checkbox that was clicked
      var _clickedBox = jQ(eventObj.currentTarget);
      // Find its immediate parent list item
      var _parentListItem = _clickedBox.parent("li");

      // Logic for when a box is checked
      if (_clickedBox.is(":checked")) {
        // Reveal immediate child lists
        _parentListItem.find("> ul").removeClass('hidden-branch');
        // Update the visual state of the parent branch toggle
        this._revealElement(_parentListItem.find("> label.folded"));

        // If automatic child selection is enabled
        if (this._prefs.autoSelectChildren) {
          // Select all child checkboxes
          _parentListItem.find("input[type='checkbox']").prop('checked', true);
          // Ensure all child lists are visible
          _parentListItem.find("ul").removeClass('hidden-branch');

          // Update visual states of all child branch toggles
          this._revealElement(_parentListItem.find("label.folded"));
        }

      // Logic for when a box is unchecked
      } else {
        // If automatic child deselection is enabled
        if (this._prefs.autoDeselectChildren) {
          // Deselect all child checkboxes
          _parentListItem.find("input[type='checkbox']").prop('checked', false);
          // If configured to hide children upon deselection
          if (this._prefs.concealChildrenOnDeselect) {
            // Hide all child lists
            _parentListItem.find("ul").addClass('hidden-branch');
            // Update visual states of all child branch toggles
            this._concealElement(_parentListItem.find("label.unfolded"));
          }
        }
      }
      // Inform any registered listeners about the change
      this._triggerChangeEvent();
    },

    // Emits a custom event to signal a change in selection
    _triggerChangeEvent: function() {
      // Dispatch a custom event on the root element
      this._rootNode.trigger({
        eventType: "selectionModified"
      });
    },

    // Toggles the visibility of a branch (expands or collapses)
    _manageBranchDisplay: function(eventObj) {
      // Get the clicked toggle element (label)
      var _clickedToggle = jQ(eventObj.currentTarget);

      // If the branch was previously folded
      if (_clickedToggle.is(".folded")) {
        // If only one branch can be open at a time, fold all others
        if (this._prefs.allowSingleOpenBranch) {
          this._foldAll();
        }

        // Reveal the child list
        jQ("> ul", _clickedToggle.parent("li")).removeClass('hidden-branch');
        // Update the toggle's visual state to unfolded
        this._revealElement(_clickedToggle);

      // If the branch was previously unfolded
      } else if (_clickedToggle.is(".unfolded")) {

        // Conceal the child list
        jQ("> ul", _clickedToggle.parent("li")).addClass('hidden-branch');
        // Update the toggle's visual state to folded
        this._concealElement(_clickedToggle);
      }
    },

    // Makes all branches visible and updates their toggle indicators
    _unfoldAll: function() {
      // Show every child list
      this._rootNode.find("ul").removeClass('hidden-branch');
      // Update the visual state of all branch toggles to unfolded
      this._revealElement(this._rootNode.find("li:has(> ul) > label"));
    },

    // Hides all branches and updates their toggle indicators
    _foldAll: function() {
      // Hide every child list
      this._rootNode.find("ul").addClass('hidden-branch');
      // Update the visual state of all branch toggles to folded
      this._concealElement(this._rootNode.find("li:has(> ul) > label"));
    },

    // Sets the initial visibility of branches based on configuration
    _setInitialVisibility: function() {
      // Hide all child lists except for the top-level ones
      this._rootNode.find("ul:not(.base-level)").addClass('hidden-branch');

      // If specific branches are configured to be open
      if (this._prefs.initialOpenBranches) {
        var _designatedBranches = this._rootNode.find(this._prefs.initialOpenBranches.join(','));
        _designatedBranches.removeClass('hidden-branch');
      } else {
        // Otherwise, show children of any initially checked items
        this._rootNode.find("li:has(input:checked) > ul").removeClass('hidden-branch');
      }

      // Update toggle indicators for visible branches
      this._revealElement(this._rootNode.find("li:has(> ul:not(.hidden-branch)) > label"));
      // Update toggle indicators for hidden branches
      this._concealElement(this._rootNode.find("li:has(> ul.hidden-branch) > label"));
    },

    // Selects all checkboxes in the tree
    _selectEntireTree: function() {
      this._rootNode.find("input[type='checkbox']").prop('checked', true);
      this._triggerChangeEvent(); // Notify about the change
    },

    // Deselects all checkboxes in the tree
    _deselectEntireTree: function() {
      this._rootNode.find("input[type='checkbox']").prop('checked', false);
      this._triggerChangeEvent(); // Notify about the change
    },

    // Changes a toggle's visual state to indicate it's open
    _revealElement: function(_targetItem) {
      _targetItem.removeClass("folded").addClass("unfolded");
    },

    // Changes a toggle's visual state to indicate it's closed
    _concealElement: function(_targetItem) {
      _targetItem.removeClass("unfolded").addClass("folded");
    }
  };

  // jQuery plugin definition
  jQ.fn.hierarchicalSelector = function(runtimeOptions) {
    // Create and return a new instance of the HierarchicalSelector
    return new HierarchicalSelector(this, runtimeOptions);
  };

  // Default configuration settings for the plugin
  jQ.fn.hierarchicalSelector.defaultSettings = {
    autoSelectChildren: true, // When a parent box is checked, all children are also checked
    autoDeselectChildren: true, // When a parent box is unchecked, all children are also unchecked
    startState: 'default', // Options: 'unfold' (fully expanded), 'fold' (fully collapsed), or 'default'
    allowSingleOpenBranch: false, // If true, only one branch can be open at a time (best for single-level hierarchies)
    initialOpenBranches: null, // Array of selectors (e.g., ['#branch1', '.category-node']) for branches to be open by default
    concealChildrenOnDeselect: true // If true, children are hidden when their parent is unchecked
  };

}(window.jQuery);