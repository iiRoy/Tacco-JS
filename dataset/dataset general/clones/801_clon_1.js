// This file contains JavaScript code for kodango.com functionality.

/*
 *  Class: SidebarFollow
 *
 *  @author    : mg12 [http://www.neoease.com/]
 *  @lastUpdate: 2012 / 12 / 05
 *  @version   : 1.0.0
 *
 *  Handles the sticky sidebar behavior.
 */

SidebarFollow = function ( ) {

  // Configuration settings for the sidebar follow behavior.
  this.config = {
    element:       null, // The DOM element to be processed.
    distanceToTop: 0     // Initial distance from the element's top to the page's top.
  };

  // Cache object to store frequently accessed values and elements.
  this.cache = {
    originalToTop: 0,                   // Stores the element's original distance to the top.
    prevElement:   null,                // Reference to the previous sibling element.
    parentToTop:   0,                   // Distance from the parent element's top to the page's top.
    placeholder:   jQuery ( '<div>' )   // A placeholder div to maintain layout when the element is fixed.
  }
};

SidebarFollow.prototype = {

  /*
   *  Method: init
   *  Initializes the SidebarFollow component.
   *
   *  Parameters:
   *    config - An object containing configuration options to override defaults.
   */
  init: function ( config ) {

    // Merge provided configuration with default settings.
    this.config = config || this.config;

    // Store a reference to 'this' for use in nested functions.
    var _self = this;

    // Select the target element using jQuery.
    var element = jQuery ( _self.config.element );

    // If the target element is not found in the DOM, exit early.
    if ( element.length <= 0 ) {
      return;
    }

    // Determine the preceding visible sibling element.
    var prevElement = element.prev ( );
    while ( prevElement.is ( ':hidden' ) ) {
      prevElement = prevElement.prev ( );
      // If no more previous elements, break the loop.
      if ( prevElement.length <= 0 ) {
        break;
      }
    }
    // Cache the determined previous element.
    _self.cache.prevElement = prevElement;


    // Calculate the total offset from the parent's top edge to the document's top.
    var parent          = element.parent ( );
    var parentToTop     = parent.offset ( ).top;
    var parentBorderTop = parseFloat ( parent.css ( 'border-top-width' ), 10 );
    var parentPaddingTop= parseFloat ( parent.css ( 'padding-top' ), 10 );

    // Store the computed parent's top offset in cache.
    _self.cache.parentToTop = parentToTop + parentBorderTop + parentPaddingTop;


    // Attach scroll event handler to the window.
    jQuery ( window ).scroll ( function ( ) {
      // Trigger the screen scrolling logic.
      _self._scrollScreen ( { element: element, _self: _self } );
    } );


    // Attach resize event handler to the window.
    jQuery ( window ).resize ( function ( ) {
      // Trigger the screen scrolling logic, ensuring correct positioning after resize.
      _self._scrollScreen ( { element: element, _self: _self } );
    } );
  },

  /*
   *  Method: _scrollScreen
   *  Adjusts the position of the sidebar element based on scroll position.
   *
   *  Parameters:
   *    args - An object containing 'element' (the target DOM element) and '_self' (reference to 'this').
   */
  _scrollScreen: function ( args ) {
    var _self       = args._self;
    var element     = args.element;
    var prevElement = _self.cache.prevElement;

    // If the element is currently hidden, no action is needed.
    if ( element.is ( ':hidden' ) ) {
      return;
    }

    // Retrieve the configured distance from the top.
    var toTop = _self.config.distanceToTop;

    // Account for any 'top' offset applied to the body, often used by admin bars.
    var bodyToTop = parseFloat ( jQuery ( 'body' ).css ( 'top' ), 10 );
    if ( ! isNaN ( bodyToTop ) ) {
      toTop += bodyToTop;
    }

    // Calculate the absolute scroll position where the element should become fixed.
    var elementToTop = element.offset ( ).top - toTop;

    // Determine the reference point for resetting the element's position.
    var referenceToTop = 0;
    if ( prevElement && prevElement.length === 1 ) {
      // If a previous element exists, use its bottom edge as the reference.
      referenceToTop = prevElement.offset ( ).top + prevElement.outerHeight ( );
    } else {
      // Otherwise, use the parent's calculated top offset.
      referenceToTop = _self.cache.parentToTop - toTop;
    }

    // Check if the current scroll position is past the point where the element should become fixed.
    if ( jQuery ( document ).scrollTop ( ) > elementToTop ) {

      // Insert a placeholder to prevent content reflow when the element becomes fixed.
      var elementHeight = element.outerHeight ( );
      _self.cache.placeholder.css ( 'height', elementHeight ).insertBefore ( element );

      // Record the original top position for later comparison.
      _self.cache.originalToTop = elementToTop;

      // Apply fixed positioning to the element.
      element.css ( {
        top:      toTop + 'px',
        position: 'fixed'
      } );

    }
    // Check if the element should return to its original, static position.
    else if ( _self.cache.originalToTop > elementToTop || referenceToTop > elementToTop ) {

      // Remove the placeholder element.
      _self.cache.placeholder.remove ( );

      // Revert the element to static positioning.
      element.css ( {
        position: 'static'
      } );
    }
  }
};

// This block executes once the DOM is fully loaded, using jQuery's ready function.
jQuery ( function ( $ ) {

  // --- Scroll Back to Top Button Handler ---
  // Attaches a click event to elements with the class 'backtop'.
  $ ( ".backtop" ).click ( function ( event ) {
    // Prevent the default anchor link behavior.
    event.preventDefault ( );
    // Animate the scrolling of the HTML and body elements to the very top.
    $ ( 'html,body' ).animate ( { scrollTop: 0 }, 'fast' );
  } );


  // --- Sidebar Tabber Widget Functionality ---
  // Handles clicks on list items within '.tabber-title'.
  $ ( '.tabber-title li' ).click ( function ( ) {
    // If the clicked tab is already selected, do nothing.
    if ( this.className == 'selected' ) {
      return;
    }

    // Get the current clicked tab and its parent tabber widget.
    var $cur_tab = $ ( this );
    var $tabber  = $cur_tab.parents ( '.widget-tabber' );

    // Update the 'selected' class for tabs.
    $cur_tab.addClass ( "selected" )
            .siblings ( ).removeClass ( "selected" );

    // Hide all tabber content lists and show the one corresponding to the clicked tab.
    $tabber.find ( '.tabber-content ul' )
           .slideUp ( 'fast' )
           .eq ( $tabber.find ( '.tabber-title li' ).index ( this ) )
           .slideDown ( 'fast' );
  } );


  // --- Comment Tabber Functionality ---
  // Attaches a click event handler to anchor tags within '#comments-tabber'.
  $ ( '#comments-tabber a' ).on ( 'click', function ( ) {
    // If the clicked tab is already active, do nothing.
    if ( this.className == 'curtab' ) {
      return;
    }

    // Set the 'curtab' class for the clicked tab and 'tab' for its siblings.
    $ ( this ).attr ( 'class', 'curtab' )
              .siblings ( ).attr ( 'class', 'tab' );

    // Toggle the visibility of elements immediately following the comments tabber.
    $ ( '#comments-tabber' ).nextAll ( ).toggle ( );
  } );


  // --- Sidebar Follow Initialization ---
  // Creates a new instance of SidebarFollow and initializes it.
  ( new SidebarFollow ( ) ).init ( {
    element:       '#sidebar-follow', // The target element for the sticky sidebar.
    distanceToTop: 70                 // Offset from the top of the viewport when fixed.
  } );


  // --- Mobile Menu Switcher ---
  // Handles clicks on the mobile menu toggle button.
  $ ( '#mobile-menu' ).click ( function ( ) {
    var $header    = $ ( '#header' );
    var $menu      = $header.find ( '.header-menu' );
    var $searchbox = $header.find ( '.search-box' );

    // Toggle the fade animation for the search box.
    $searchbox.fadeToggle ( );

    // Check if the header has been clicked previously (menu is open).
    if ( $header.hasClass ( 'clicked' ) ) {
      // Slide up the menu and then remove the 'clicked' class from the header.
      $menu.slideToggle ( function ( ) {
        $header.removeClass ( 'clicked' );
      } );
    } else {
      // Add the 'clicked' class to the header and slide down the menu.
      $header.addClass ( 'clicked' );
      $menu.slideToggle ( );
    }
  } );


  // --- Toggle Comment Author Information ---
  // Delegates click events for '#toggle-author' within '#comments'.
  $ ( '#comments' ).on ( 'click', '#toggle-author', function ( ) {
    // Slide toggle the author information panel.
    $ ( '#author-info' ).slideToggle ( function ( ) {
      // Callback function executed after slide toggle completes.
      if ( $ ( this ).is ( ':hidden' ) ) {
        // If the panel is now hidden:
        // Update the author name in the welcome message.
        $ ( '#welcome-login strong' ).html ( $ ( '#author' ).val ( ) );
        // Change the toggle action text to '更改' (Change).
        $ ( '#toggle-author u' ).html ( '更改' );
      } else {
        // If the panel is now visible:
        // Change the toggle action text to '隐藏' (Hide).
        $ ( '#toggle-author u' ).html ( '隐藏' );
      }
    } );
  } );

} );