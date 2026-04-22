/*
 *  CheckboxTree - A jQuery Plugin for Bootstrap Checkbox Tree
 *
 *  Project Repository:
 *    https://github.com/mikkolehtinen/bootstrap-checkbox-tree
 *
 *  Initial inspiration and base derived from:
 *    https://github.com/antihero/Collapsible-Checkbox-Tree-jQuery-Plugin
 *
 *  Copyright (c) 2012 Mikko Lehtinen.
 *  This software is distributed under the MIT License.
 *  Please refer to the LICENSE file for full details.
 */

/* Self-executing anonymous function to encapsulate the plugin and avoid global conflicts */
! function ( $ ) {

  "use strict"; // Enforce strict mode for cleaner and safer code

  // Define the CheckboxTree constructor function
  var CheckboxTree = function ( element, options ) {

    // Store the jQuery-wrapped DOM element associated with this instance
    this.$element = $( element );

    // Merge default options with user-provided options, performing a deep merge
    this.options = $.extend( true, $.fn.checkboxTree.defaults, options );

    // Initialize the visual markup of the tree structure
    this.initMarkup();

    // Attach a click event handler to all checkboxes within the tree
    // The handler is bound to the instance for proper context ('this')
    this.$element
      .find( "input[type='checkbox']" )
      .on( 'click', $.proxy( this.checkboxTicked, this ) );

    // Attach a click event handler to the expand/collapse span elements
    // These spans are found within list items that contain a 'ul' (i.e., have children)
    this.$element
      .find( "li:has(> ul) span" )
      .on( 'click', $.proxy( this.expandOrCollapseBranch, this ) );

    // Determine the initial state of the tree based on the 'initialState' option
    switch ( this.options.initialState ) {
      case 'expand':
        this.expandAll(); // Fully expand all branches in the tree
        break;
      case 'collapse':
        this.collapseAll(); // Fully collapse all branches in the tree
        break;
      default:
        this.defaultExpand(); // Apply the default expansion logic
    }

    // Return the instance, though constructors typically don't explicitly return
    return this;
  };

  // Define methods for the CheckboxTree prototype to extend its functionality
  CheckboxTree.prototype = {

    // Method to initialize the tree's HTML markup for interactivity
    initMarkup: function () {
      // Prepend a span element to each list item; this span will serve as the collapse/expand toggle
      this.$element.find( "li" ).prepend( '<span>&nbsp;</span>' );

      // If the 'checkChildren' option is enabled, ensure all children of initially checked items are also checked
      if ( this.options.checkChildren ) {
        this.$element
          .find( "input:checked" )
          .parent( "li" )
          .find( "input[type='checkbox']" )
          .attr( 'checked', true );
      }
    },

    // Event handler for when a checkbox is clicked (ticked or unticked)
    checkboxTicked: function ( e ) {
      var $cb = $( e.currentTarget ); // Get the jQuery object for the clicked checkbox
      var parent = $cb.parent( "li" ); // Get the parent list item of the checkbox

      // Check if the checkbox is currently in a checked state
      if ( $cb.is( ":checked" ) ) {
        // If checked, show the immediate children (the first 'ul' descendant) of the parent
        parent.find( "> ul" ).removeClass( 'hide' );

        // Update the visual state of the tree branch to expanded
        this.expandEl( parent.find( "> span.collapsed" ) );

        // If 'checkChildren' option is true, proceed to check all child checkboxes
        if ( this.options.checkChildren ) {
          parent.find( "input[type='checkbox']" ).attr( 'checked', true );
          // Also ensure all children (not just immediate) are visible
          parent.find( "ul" ).removeClass( 'hide' );

          // Expand the entire subtree visually by updating relevant spans
          this.expandEl( parent.find( "span.collapsed" ) );
        }

      // If the checkbox was unchecked...
      } else {
        // If 'uncheckChildren' option is true, uncheck all child checkboxes
        if ( this.options.uncheckChildren ) {
          parent.find( "input[type='checkbox']" ).attr( 'checked', false );
          // If 'hideChildrenWhenUnchecking' is true, hide the children's 'ul' elements
          if ( this.options.hideChildrenWhenUnchecking ) {
            parent.find( "ul" ).addClass( 'hide' );
            // Collapse the tree branch visually by updating relevant spans
            this.collapseEl( parent.find( "span.expanded" ) );
          }
        }
      }
      // Notify any registered listeners about the checkbox state change
      this.notifyListeners();
    },

    // Method to trigger a custom event on the main element when a checkbox state changes
    notifyListeners: function () {
      // Trigger a custom 'checkboxTicked' event, allowing other scripts to react
      this.$element.trigger( {
        type: "checkboxTicked" // The name of the custom event
      } );
    },

    // Event handler for expanding or collapsing a tree branch
    expandOrCollapseBranch: function ( e ) {
      var $el = $( e.currentTarget ); // The span element that was clicked

      // If the branch was previously collapsed (indicated by the 'collapsed' class)
      if ( $el.is( ".collapsed" ) ) {
        // If 'singleBranchOpen' option is enabled, collapse all other branches first
        if ( this.options.singleBranchOpen ) {
          this.collapseAll();
        }

        // ... then expand the current branch's children by removing the 'hide' class
        $( "> ul", $el.parent( "li" ) ).removeClass( 'hide' );
        this.expandEl( $el ); // Update the visual state of the span to 'expanded'

      // If the branch was previously expanded (indicated by the 'expanded' class)
      } else if ( $el.is( ".expanded" ) ) {

        // ... then collapse the current branch's children by adding the 'hide' class
        $( "> ul", $el.parent( "li" ) ).addClass( 'hide' );
        this.collapseEl( $el ); // Update the visual state of the span to 'collapsed'
      }
    },

    // Method to expand all branches throughout the entire tree
    expandAll: function () {
      // Show all 'ul' elements (children) within the tree by removing the 'hide' class
      this.$element.find( "ul" ).removeClass( 'hide' );
      // Update the visual state of all relevant span elements to 'expanded'
      this.expandEl( this.$element.find( "li:has(> ul) > span" ) );
    },

    // Method to collapse all branches throughout the entire tree
    collapseAll: function () {
      // Hide all 'ul' elements (children) within the tree by adding the 'hide' class
      this.$element.find( "ul" ).addClass( 'hide' );
      // Update the visual state of all relevant span elements to 'collapsed'
      this.collapseEl( this.$element.find( "li:has(> ul) > span" ) );
    },

    // Method to set the default expansion state based on configuration options
    defaultExpand: function () {
      // Initially hide all 'ul' elements that are not at the root level
      this.$element.find( "ul:not(.root)" ).addClass( 'hide' );

      // If 'openBranches' selectors are provided, expand those specific branches
      if ( this.options.openBranches ) {
        var openBranches = this.$element.find( this.options.openBranches.join( ',' ) );
        openBranches.removeClass( 'hide' ); // Show these specified branches
      } else {
        // Otherwise, show children of checked items and their immediate descendants
        this.$element.find( "li:has(input:checked) > ul" ).removeClass( 'hide' );
      }

      // Update the visual state of currently expanded branches
      this.expandEl( this.$element.find( "li:has(> ul:not(.hide)) > span" ) );
      // Update the visual state of currently collapsed branches
      this.collapseEl( this.$element.find( "li:has(> ul.hide) > span" ) );
    },

    // Method to check all checkboxes within the tree
    checkAll: function () {
      this.$element.find( "input[type='checkbox']" ).attr( 'checked', true );
      this.notifyListeners(); // Notify listeners of the change
    },

    // Method to uncheck all checkboxes within the tree
    uncheckAll: function () {
      this.$element.find( "input[type='checkbox']" ).attr( 'checked', false );
      this.notifyListeners(); // Notify listeners of the change
    },

    // Helper method to visually expand an element by managing CSS classes
    expandEl: function ( $el ) {
      $el.removeClass( "collapsed" ).addClass( "expanded" );
    },

    // Helper method to visually collapse an element by managing CSS classes
    collapseEl: function ( $el ) {
      $el.removeClass( "expanded" ).addClass( "collapsed" );
    }
  }; // End of CheckboxTree.prototype definition

  // jQuery plugin definition: $.fn.checkboxTree
  $.fn.checkboxTree = function ( options ) {
    // Iterate over the matched elements (the 'this' context in a jQuery plugin)
    // and return a new CheckboxTree instance for each
    return new CheckboxTree( this, options );
  };

  // Define default options for the CheckboxTree plugin
  $.fn.checkboxTree.defaults = {
    checkChildren: true, // Option: When a parent checkbox is checked, all its children are also checked.
    uncheckChildren: true, // Option: When a parent checkbox is unchecked, all its children are also unchecked.
    initialState: 'default', // Option: Sets the initial display state ('expand', 'collapse', or 'default').
    singleBranchOpen: false, // Option: If true, only one branch can be open at a time (best for single-level hierarchies).
    openBranches: null // Option: An array of jQuery selectors to specify branches that should be initially expanded.
  };

// Pass the jQuery object (window.jQuery) to the self-executing function
}( window.jQuery );