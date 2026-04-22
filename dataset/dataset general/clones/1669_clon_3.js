/*
 * Hierarchical Selection Widget
 * A jQuery plugin for interactive tree-like checkbox structures.
 *
 * This component enables users to select items in a nested list,
 * with options for cascading selection behavior and dynamic branch expansion.
 *
 * Inspired by similar collapsible tree implementations.
 *
 * Copyright (c) 2023 Your Name/Company
 * Licensed under the MIT license.
 */

(function ($) {
  "use strict"; // Enforce strict JavaScript syntax

  // Constants for CSS classes to avoid magic strings
  const FOLDED_CLASS = 'node-folded';
  const UNFOLDED_CLASS = 'node-unfolded';
  const HIDDEN_CLASS = 'is-hidden';
  const CHECKBOX_SELECTOR = 'input[type="checkbox"]';
  const BRANCH_TOGGLE_SELECTOR = 'li:has(> ul) > span.branch-indicator';

  /**
   * Represents the core logic for the Hierarchical Selection Widget.
   * @param {HTMLElement} domElement The DOM element to initialize the widget on.
   * @param {object} componentSettings Configuration options for the widget.
   */
  var HierarchicalSelector = function (domElement, componentSettings) {
    // Store a reference to the main container element wrapped by jQuery
    this.$widgetRoot = $(domElement);

    // Merge default settings with user-provided settings, deep copy
    this.config = $.extend(true, {}, $.fn.hierarchicalSelector.defaultSettings, componentSettings);

    // Ensure the root element is valid
    if (!this.$widgetRoot.length) {
      console.warn("HierarchicalSelector: Root element not found.", domElement);
      return this;
    }

    // Initialize the visual structure of the tree
    this.establishDomLayout();
    // Bind all necessary event handlers
    this.attachEventDelegates();
    // Set the initial display state of the branches
    this.configureInitialState();

    // Mark the element as initialized
    this.$widgetRoot.data('hierarchicalSelector', this);
  };

  HierarchicalSelector.prototype = {

    /**
     * Prepares the DOM structure by adding necessary elements.
     * This includes adding visual indicators for collapsible branches.
     * @private
     */
    establishDomLayout: function() {
      // Add a placeholder span for expand/collapse functionality to list items that contain sub-lists.
      // This span will act as the clickable toggle for branches.
      this.$widgetRoot.find("li:has(> ul)").prepend('<span class="branch-indicator">&nbsp;</span>');

      // If initial checking of children is enabled, ensure deeply nested checked items are also marked.
      // This handles cases where the initial HTML might have only top-level items checked.
      if (this.config.cascadeCheckOnLoad) {
        this.$widgetRoot.find(CHECKBOX_SELECTOR + ":checked").each((idx, elem) => {
            // Find all descendant checkboxes within the parent list item and mark them as checked.
            $(elem).closest("li").find(CHECKBOX_SELECTOR).prop('checked', true);
        });
      }
    },

    /**
     * Attaches event listeners to the widget's elements.
     * Uses event delegation for efficiency.
     * @private
     */
    attachEventDelegates: function() {
      // Event handler for checkbox clicks:
      // Uses `bind(this)` to ensure `this` context is the HierarchicalSelector instance.
      this.$widgetRoot.on('click', CHECKBOX_SELECTOR, this.processCheckboxToggle.bind(this));

      // Event handler for branch expand/collapse clicks:
      this.$widgetRoot.on('click', BRANCH_TOGGLE_SELECTOR, this.toggleBranchVisibility.bind(this));
    },

    /**
     * Handles the state change of a checkbox.
     * Manages cascading check/uncheck behavior and updates branch visibility.
     * @param {jQuery.Event} event The click event object.
     * @private
     */
    processCheckboxToggle: function(event) {
      const $currentCheckbox = $(event.currentTarget);
      const $parentListItem = $currentCheckbox.closest("li");
      const isCurrentlyChecked = $currentCheckbox.prop("checked");

      // Stop propagation to prevent parent events if necessary, though not critical here.
      // event.stopPropagation();

      if (isCurrentlyChecked) {
        // If the checkbox was just checked:

        // Optionally, make immediate child branches visible if they were hidden.
        $parentListItem.children("ul").removeClass(HIDDEN_CLASS);

        // Ensure the visual indicator reflects the expanded state for this branch.
        this.unfoldNode($parentListItem.children("span.branch-indicator"));

        // If cascading check is enabled, check all descendant checkboxes.
        if (this.config.cascadeCheckOnSelect) {
          $parentListItem.find(CHECKBOX_SELECTOR).prop('checked', true);
          // Also ensure all descendant sub-lists become visible.
          $parentListItem.find("ul").removeClass(HIDDEN_CLASS);
          // And update all descendant branch indicators to expanded.
          this.unfoldNode($parentListItem.find("span.branch-indicator"));
        }
      } else {
        // If the checkbox was just unchecked:

        // If cascading uncheck is enabled, uncheck all descendant checkboxes.
        if (this.config.cascadeUncheckOnDeselect) {
          $parentListItem.find(CHECKBOX_SELECTOR).prop('checked', false);

          // If configured to hide children when unchecking, do so.
          if(this.config.hideChildrenOnUncheck) {
            $parentListItem.find("ul").addClass(HIDDEN_CLASS);
            // And update relevant branch indicators to collapsed.
            this.foldNode($parentListItem.find("span.branch-indicator"));
          }
        }
      }
      this.signalChange(); // Notify external listeners about the change.
    },

    /**
     * Dispatches a custom event from the widget's root element.
     * @private
     */
    signalChange: function() {
      // Trigger a custom event that consumers can listen to.
      this.$widgetRoot.trigger({
        type: "selectionAltered",
        selectedElements: this.getSelectedValues() // Optionally include data
      });
    },

    /**
     * Handles clicks on the branch indicator to expand or collapse sub-lists.
     * @param {jQuery.Event} event The click event object.
     * @private
     */
    toggleBranchVisibility: function(event) {
      const $indicator = $(event.currentTarget);
      const $parentListItem = $indicator.closest("li");
      const $childList = $parentListItem.children("ul");

      // Prevent default behavior of the span if it were a link or similar.
      event.preventDefault();

      if ($indicator.hasClass(FOLDED_CLASS)) {
        // If the branch was previously folded, expand it.
        if(this.config.allowOnlyOneBranchOpen) {
          // If only one branch can be open, collapse all others first.
          this.foldAllNodes();
        }
        $childList.removeClass(HIDDEN_CLASS);
        this.unfoldNode($indicator);
      } else if ($indicator.hasClass(UNFOLDED_CLASS)) {
        // If the branch was previously unfolded, collapse it.
        $childList.addClass(HIDDEN_CLASS);
        this.foldNode($indicator);
      }
    },

    /**
     * Configures the initial expansion state of the tree based on settings.
     * @private
     */
    configureInitialState: function() {
      // Validate the initial state configuration.
      const validStates = ['expandAll', 'collapseAll', 'default'];
      if (!validStates.includes(this.config.initialDisplayState)) {
        console.warn(`HierarchicalSelector: Invalid initialDisplayState '${this.config.initialDisplayState}'. Defaulting to 'default'.`);
        this.config.initialDisplayState = 'default';
      }

      switch(this.config.initialDisplayState) {
        case 'expandAll':
          this.unfoldAllNodes();
          break;
        case 'collapseAll':
          this.foldAllNodes();
          break;
        default: // 'default' behavior
          this.applyDefaultExpansion();
          break;
      }
    },

    /**
     * Expands all branches in the entire widget.
     * @public
     */
    unfoldAllNodes: function() {
      // Make all sub-lists visible.
      this.$widgetRoot.find("ul").removeClass(HIDDEN_CLASS);
      // Update all branch indicators to the expanded state.
      this.unfoldNode(this.$widgetRoot.find(BRANCH_TOGGLE_SELECTOR));
    },

    /**
     * Collapses all branches in the entire widget.
     * @public
     */
    foldAllNodes: function() {
      // Hide all sub-lists.
      this.$widgetRoot.find("ul").addClass(HIDDEN_CLASS);
      // Update all branch indicators to the collapsed state.
      this.foldNode(this.$widgetRoot.find(BRANCH_TOGGLE_SELECTOR));
    },

    /**
     * Applies a default expansion state, typically showing only top-level items
     * or those explicitly marked for initial display.
     * @private
     */
    applyDefaultExpansion: function() {
      // By default, hide all sub-lists except those directly under the root,
      // effectively showing only the first level.
      this.$widgetRoot.find("ul:not(.root-level)").addClass(HIDDEN_CLASS);

      // If specific branches are configured to be open initially.
      if (Array.isArray(this.config.preOpenedBranches) && this.config.preOpenedBranches.length > 0) {
        // Iterate through the provided selectors and reveal those branches.
        this.config.preOpenedBranches.forEach(selector => {
            const $targetBranch = this.$widgetRoot.find(selector);
            $targetBranch.removeClass(HIDDEN_CLASS);
            // Also ensure parent ULs are visible
            $targetBranch.parents('ul').removeClass(HIDDEN_CLASS);
            // And update associated branch indicators
            this.unfoldNode($targetBranch.closest('li').children('span.branch-indicator'));
        });
      } else {
        // Fallback: If no specific branches, show immediate children of initially checked items.
        this.$widgetRoot.find("li:has(" + CHECKBOX_SELECTOR + ":checked) > ul").removeClass(HIDDEN_CLASS);
      }

      // Update branch indicators based on their current visibility.
      // Mark visible sub-lists as unfolded.
      this.unfoldNode(this.$widgetRoot.find("li:has(> ul:not(." + HIDDEN_CLASS + ")) > span.branch-indicator"));
      // Mark hidden sub-lists as folded.
      this.foldNode(this.$widgetRoot.find("li:has(> ul." + HIDDEN_CLASS + ") > span.branch-indicator"));
    },

    /**
     * Marks all checkboxes within the widget as checked.
     * @public
     */
    markAllSelected: function() {
      this.$widgetRoot.find(CHECKBOX_SELECTOR).prop('checked', true);
      this.signalChange();
    },

    /**
     * Marks all checkboxes within the widget as unchecked.
     * @public
     */
    unmarkAllSelected: function() {
      this.$widgetRoot.find(CHECKBOX_SELECTOR).prop('checked', false);
      this.signalChange();
    },

    /**
     * Adds the expanded class and removes the collapsed class from a jQuery element set.
     * @param {jQuery} $targetElements The jQuery object containing elements to update.
     * @private
     */
    unfoldNode: function($targetElements) {
      $targetElements.removeClass(FOLDED_CLASS).addClass(UNFOLDED_CLASS);
    },

    /**
     * Adds the collapsed class and removes the expanded class from a jQuery element set.
     * @param {jQuery} $targetElements The jQuery object containing elements to update.
     * @private
     */
    foldNode: function($targetElements) {
      $targetElements.removeClass(UNFOLDED_CLASS).addClass(FOLDED_CLASS);
    },

    /**
     * Retrieves the values of all currently checked checkboxes.
     * Assumes checkboxes have a `value` attribute.
     * @returns {Array<string>} An array of values from checked checkboxes.
     * @public
     */
    getSelectedValues: function() {
        return this.$widgetRoot.find(CHECKBOX_SELECTOR + ":checked").map(function() {
            return $(this).val();
        }).get();
    },

    /**
     * Destroys the widget instance, unbinding events and removing data.
     * @public
     */
    destroy: function() {
        this.$widgetRoot.off('click', CHECKBOX_SELECTOR);
        this.$widgetRoot.off('click', BRANCH_TOGGLE_SELECTOR);
        this.$widgetRoot.removeData('hierarchicalSelector');
        // Optionally remove added spans
        this.$widgetRoot.find('span.branch-indicator').remove();
    }
  };

  // jQuery plugin definition
  $.fn.hierarchicalSelector = function (option) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.each(function () {
      var $this = $(this);
      var instance = $this.data('hierarchicalSelector');
      var userOptions = typeof option === 'object' && option;

      if (!instance) {
        // If no instance exists, create a new one.
        $this.data('hierarchicalSelector', (instance = new HierarchicalSelector(this, userOptions)));
      }

      // If option is a string, it's a method call.
      if (typeof option === 'string' && typeof instance[option] === 'function') {
        instance[option].apply(instance, args);
      }
    });
  };

  // Default settings for the plugin.
  $.fn.hierarchicalSelector.defaultSettings = {
    cascadeCheckOnSelect : true, // When a box is checked, all its descendants are also checked.
    cascadeUncheckOnDeselect : true, // When a box is unchecked, all its descendants are also unchecked.
    cascadeCheckOnLoad: false, // On initialization, if a parent is checked, check all its children.
    initialDisplayState : 'default', // Options: 'expandAll' (fully open), 'collapseAll' (fully closed), or 'default'.
    allowOnlyOneBranchOpen: false, // If true, opening a branch collapses all other branches (supports only single level children).
    preOpenedBranches: null, // An array of jQuery selectors (e.g., ['#item1', '.category-a']) for branches to be opened by default.
    hideChildrenOnUncheck: true // If true, unchecking a parent will hide its children.
  };

}(window.jQuery));