/* ====================================================================================================
 *
 * This file contains the JavaScript code for Bootstrap's transition component.
 * Original source: http://twitter.github.com/bootstrap/javascript.html#transitions
 *
 * Version: v2.0.1
 *
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==================================================================================================== */

// Immediately-invoked function expression (IIFE) to encapsulate the code,
// passing jQuery as the '$' argument.
! function ( $ )
  {

  // Ensure the DOM is fully loaded before executing.
  $(function ()
    {

    // Enable strict mode for better error handling and cleaner code.
    "use strict"

    /*
     * CSS TRANSITION SUPPORT DETECTION
     *
     * This section detects if the browser supports CSS3 transitions.
     * Based on a gist by @mdo: https://gist.github.com/373874
     * ==================================================================== */

    $.support.transition = ( function ()
      {
      // Get a reference to the document body or document element for style checking.
      var thisBody    = document.body || document.documentElement
        , thisStyle   = thisBody.style
        // Check for various vendor-prefixed transition properties.
        , support     = thisStyle.transition        !== undefined
                     || thisStyle.WebkitTransition  !== undefined
                     || thisStyle.MozTransition     !== undefined
                     || thisStyle.MsTransition      !== undefined
                     || thisStyle.OTransition       !== undefined

      // If transition support is detected, return an object indicating the
      // correct transition end event name.
      return support && {
        end: ( function ()
          {
          var transitionEnd = "TransitionEnd" // Default W3C event name.

          // Determine the correct event name based on the browser.
          if      ( $.browser.webkit ) { transitionEnd = "webkitTransitionEnd" }
          else if ( $.browser.mozilla ) { transitionEnd = "transitionend"     }
          else if ( $.browser.opera )   { transitionEnd = "oTransitionEnd"    }

          return transitionEnd
          }() ) // Immediately invoke this inner function.
      }
      }() ) // Immediately invoke the outer function.

    }) // End of document ready function.

  }( window.jQuery ); // Pass window.jQuery to the IIFE.

/* ====================================================================================================
 *
 * This file contains the JavaScript code for Bootstrap's modal component.
 * Original source: http://twitter.github.com/bootstrap/javascript.html#modals
 *
 * Version: v2.0.1
 *
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==================================================================================================== */


// IIFE for modal functionality.
! function ( $ )
  {

  // Strict mode for the modal module.
  "use strict"

 /*
  * MODAL CLASS DEFINITION
  * ==================================================================== */

  // The Modal constructor function.
  var Modal = function ( content, options )
    {
    this.options = options
    this.$element = $(content)
      // Attach a click handler to dismiss the modal when elements with data-dismiss="modal" are clicked.
      . delegate ( '[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy( this.hide, this ) )
    }

  // Modal prototype methods.
  Modal.prototype =
    {

      constructor: Modal // Set the constructor property.

    , toggle: function ()
        {
        // Toggles the modal's visibility (show or hide) based on its current state.
        return this [ ! this.isShown ? 'show' : 'hide' ] ()
        }

    , show: function ()
        {
        var that = this // Cache 'this' for use in callbacks.

        // If the modal is already shown, do nothing.
        if ( this.isShown ) return

        // Add a class to the body to prevent scrolling when the modal is open.
        $( 'body' ) . addClass ( 'modal-open' )

        this.isShown = true // Update the modal's state.
        this.$element . trigger ( 'show' ) // Trigger the 'show' event.

        escape.call ( this ) // Enable keyboard escape functionality.
        backdrop.call ( this, function ()
          {
          // Determine if a CSS transition should be applied.
          var transition = $.support.transition && that.$element.hasClass ( 'fade' )

          // If the modal is not already in the DOM, append it to the body.
          // This prevents issues with moving elements that might lose their event handlers.
          ! that.$element.parent().length && that.$element.appendTo ( document.body )

          that.$element
            . show () // Display the modal element.

          // Force a reflow to ensure transitions are applied correctly.
          if ( transition )
            {
            that.$element [ 0 ] . offsetWidth
            }

          that.$element . addClass ( 'in' ) // Add 'in' class to trigger the transition.

          // If transitions are supported, wait for the transition to end before triggering 'shown'.
          transition ?
            that.$element . one ( $.support.transition.end, function () { that.$element . trigger ( 'shown' ) } ) :
            that.$element . trigger ( 'shown' ) // Otherwise, trigger 'shown' immediately.

          }) // End of backdrop callback.
        } // End of show function.

    , hide: function ( e )
        {
        // Prevent default action if an event object is provided.
        e && e.preventDefault ()

        // If the modal is not shown, do nothing.
        if ( ! this.isShown ) return

        var that = this // Cache 'this'.
        this.isShown = false // Update the modal's state.

        // Remove the 'modal-open' class from the body.
        $( 'body' ) . removeClass ( 'modal-open' )

        escape.call ( this ) // Disable keyboard escape functionality.

        this.$element
          . trigger ( 'hide' ) // Trigger the 'hide' event.
          . removeClass ( 'in' ) // Remove 'in' class to start the transition out.

        // If transitions are supported and the modal has the 'fade' class,
        // use hideWithTransition; otherwise, use hideModal immediately.
        $.support.transition && this.$element.hasClass ( 'fade' ) ?
          hideWithTransition.call ( this ) :
          hideModal.call ( this )
        } // End of hide function.

    } // End of Modal.prototype.


 /*
  * MODAL PRIVATE METHODS
  * ==================================================================== */

  // Handles hiding the modal with a CSS transition.
  function hideWithTransition ()
    {
    var that    = this // Cache 'this'.
      , timeout = setTimeout ( function ()
          {
          that.$element.off ( $.support.transition.end ) // Remove the transition end event listener.
          hideModal.call ( that ) // Call hideModal after the timeout.
          }, 500 ) // Timeout duration (should match CSS transition duration).

    // Listen for the transition end event to ensure the modal is fully hidden.
    this.$element.one ( $.support.transition.end, function ()
      {
      clearTimeout ( timeout ) // Clear the timeout if the transition finishes early.
      hideModal.call ( that ) // Call hideModal.
      })
    }

  // Handles the final steps of hiding the modal.
  function hideModal ( that )
    {
    this.$element
      . hide () // Hide the modal element.
      . trigger ( 'hidden' ) // Trigger the 'hidden' event.

    backdrop.call ( this ) // Remove the backdrop.
    }

  // Manages the modal backdrop.
  function backdrop ( callback )
    {
    var that    = this // Cache 'this'.
      , animate = this.$element.hasClass ( 'fade' ) ? 'fade' : '' // Determine if animation class is needed.

    // If the modal is shown and a backdrop is desired.
    if ( this.isShown && this.options.backdrop )
      {
      var doAnimate = $.support.transition && animate // Check if backdrop should animate.

      // Create and append the backdrop element.
      this.$backdrop = $( '<div class="modal-backdrop ' + animate + '" />' )
        . appendTo ( document.body )

      // If the backdrop is not 'static', attach a click handler to hide the modal.
      if ( this.options.backdrop != 'static' )
        {
        this.$backdrop . click ( $.proxy ( this.hide, this ) )
        }

      // Force a reflow for the backdrop transition.
      if ( doAnimate ) this.$backdrop [ 0 ] . offsetWidth

      this.$backdrop . addClass ( 'in' ) // Add 'in' class to trigger backdrop transition.

      // If animating, wait for backdrop transition to end; otherwise, call callback immediately.
      doAnimate ?
        this.$backdrop . one ( $.support.transition.end, callback ) :
        callback ()

      } // End of if (this.isShown && this.options.backdrop).
    // If the modal is not shown and a backdrop exists.
    else if ( ! this.isShown && this.$backdrop )
      {
      this.$backdrop . removeClass ( 'in' ) // Remove 'in' class to start backdrop transition out.

      // If animating, wait for backdrop transition to end; otherwise, remove immediately.
      $.support.transition && this.$element.hasClass ( 'fade' ) ?
        this.$backdrop . one ( $.support.transition.end, $.proxy ( removeBackdrop, this ) ) :
        removeBackdrop.call ( this )

      } // End of else if (!this.isShown && this.$backdrop).
    // If no backdrop is involved, just call the callback if it exists.
    else if ( callback )
      {
      callback ()
      }
    }

  // Removes the backdrop element from the DOM.
  function removeBackdrop ()
    {
    this.$backdrop . remove ()
    this.$backdrop = null
    }

  // Manages keyboard escape functionality for the modal.
  function escape ()
    {
    var that = this // Cache 'this'.
    // If the modal is shown and keyboard interaction is enabled.
    if ( this.isShown && this.options.keyboard )
      {
      // Attach a keyup event listener to close the modal on 'escape' key (keyCode 27).
      $( document ) . on ( 'keyup.dismiss.modal', function ( e )
        {
        e.which == 27 && that.hide ()
        })
      }
    // If the modal is not shown, remove the keyup event listener.
    else if ( ! this.isShown )
      {
      $( document ) . off ( 'keyup.dismiss.modal' )
      }
    }


 /*
  * MODAL PLUGIN DEFINITION
  * ==================================================================== */

  // jQuery plugin definition for modals.
  $.fn.modal = function ( option )
    {
    return this.each ( function ()
      {
      var $this   = $(this)
        , data    = $this.data ( 'modal' )
        // Merge default options with data attributes and any provided options.
        , options = $.extend ( {}, $.fn.modal.defaults, $this.data (), typeof option == 'object' && option )
      // If a modal instance doesn't exist for this element, create one and store it.
      if ( ! data ) $this.data ( 'modal', ( data = new Modal ( this, options ) ) )
      // If option is a string, call the corresponding method on the modal instance.
      if ( typeof option == 'string' ) data [ option ] ()
      // Otherwise, if 'show' option is true, display the modal.
      else if ( options.show ) data.show ()
      })
    }

  // Default options for modals.
  $.fn.modal.defaults =
    {
      backdrop: true // Show a backdrop.
    , keyboard: true // Allow keyboard interaction (escape key).
    , show:     true // Show the modal immediately upon initialization.
    }

  // Expose the Modal constructor for external access.
  $.fn.modal.Constructor = Modal


 /*
  * MODAL DATA-API
  * ==================================================================== */

  // Attach event handlers for data-api modals on document ready.
  $(function ()
    {
    $( 'body' ) . on ( 'click.modal.data-api', '[data-toggle="modal"]', function ( e )
      {
      var $this   = $(this)
        , href    // Variable to store href.
        // Determine the target element for the modal.
        , $target = $( $this.attr ( 'data-target' )
                    || ( href = $this.attr ( 'href' ) )
                    && href.replace ( /.*(?=#[^\s]+$)/, '' ) ) // Strip for IE7 compatibility.
        // Determine the option to pass to the modal plugin.
        , option  = $target.data ( 'modal' ) ? 'toggle' : $.extend ( {}, $target.data (), $this.data () )

      e.preventDefault () // Prevent the default link behavior.
      $target.modal ( option ) // Initialize or toggle the modal.
      })
    })

  }( window.jQuery ); // Pass window.jQuery to the IIFE.

/* ====================================================================================================
 *
 * This file contains the JavaScript code for Bootstrap's dropdown component.
 * Original source: http://twitter.github.com/bootstrap/javascript.html#dropdowns
 *
 * Version: v2.0.1
 *
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==================================================================================================== */


// IIFE for dropdown functionality.
! function ( $ )
  {

  // Strict mode for the dropdown module.
  "use strict"

 /*
  * DROPDOWN CLASS DEFINITION
  * ==================================================================== */

  // Selector for dropdown toggles.
  var toggle = '[data-toggle="dropdown"]'
    // Dropdown constructor function.
    , Dropdown = function ( element )
        {
        var $el = $(element) . on ( 'click.dropdown.data-api', this.toggle )
        // Close dropdowns when clicking anywhere else on the document.
        $( 'html' ) . on ( 'click.dropdown.data-api', function ()
          {
          $el.parent().removeClass ( 'open' )
          })
        }

  // Dropdown prototype methods.
  Dropdown.prototype =
    {

    constructor: Dropdown // Set the constructor property.

  , toggle: function ( e )
      {
      var $this    = $(this)
        , selector = $this.attr ( 'data-target' ) // Get target selector from data-target attribute.
        , $parent  // Variable to hold the parent dropdown element.
        , isActive // Flag to check if the dropdown is currently open.

      // If no data-target, use href as selector.
      if ( ! selector )
        {
        selector = $this.attr ( 'href' )
        selector = selector && selector.replace ( /.*(?=#[^\s]*$)/, '' ) // Strip for IE7 compatibility.
        }

      $parent = $(selector)
      // If no parent found via selector, use the immediate parent of the toggle.
      $parent.length || ( $parent = $this.parent () )

      isActive = $parent.hasClass ( 'open' ) // Check if the dropdown is open.

      clearMenus () // Close any other open dropdowns.
      ! isActive && $parent.toggleClass ( 'open' ) // If not active, open this dropdown.

      return false // Prevent default link behavior.
      }

    } // End of Dropdown.prototype.

  // Helper function to close all open dropdown menus.
  function clearMenus ()
    {
    $( toggle ) . parent () . removeClass ( 'open' )
    }


  /*
   * DROPDOWN PLUGIN DEFINITION
   * ==================================================================== */

  // jQuery plugin definition for dropdowns.
  $.fn.dropdown = function ( option )
    {
    return this.each ( function ()
      {
      var $this = $(this)
        , data  = $this.data ( 'dropdown' )
      // If a dropdown instance doesn't exist, create one and store it.
      if ( ! data ) $this.data ( 'dropdown', ( data = new Dropdown ( this ) ) )
      // If option is a string, call the corresponding method.
      if ( typeof option == 'string' ) data [ option ] . call ( $this )
      })
    }

  // Expose the Dropdown constructor for external access.
  $.fn.dropdown.Constructor = Dropdown


  /*
   * APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================================================== */

  // Attach event handlers for dropdowns on document ready.
  $(function ()
    {
    // Close dropdowns when clicking anywhere on the HTML document.
    $( 'html' ) . on ( 'click.dropdown.data-api', clearMenus )
    // Toggle dropdowns when clicking on elements with data-toggle="dropdown".
    $( 'body' ) . on ( 'click.dropdown.data-api', toggle, Dropdown.prototype.toggle )
    })

  }( window.jQuery ); // Pass window.jQuery to the IIFE.

/* ====================================================================================================
 *
 * This file contains the JavaScript code for Bootstrap's scrollspy component.
 * Original source: http://twitter.github.com/bootstrap/javascript.html#scrollspy
 *
 * Version: v2.0.1
 *
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==================================================================================================== */

// IIFE for scrollspy functionality.
! function ( $ )
  {

  // Strict mode for the scrollspy module.
  "use strict"

  /*
   * SCROLLSPY CLASS DEFINITION
   * ==================================================================== */

  // ScrollSpy constructor function.
  function ScrollSpy ( element, options )
    {
    var process    = $.proxy ( this.process, this ) // Create a proxied version of the process method.
      , $element   = $(element) . is ( 'body' ) ? $(window) : $(element) // Determine the scrollable element.
      , href       // Variable to hold href attribute.

    this.options = $.extend ( {}, $.fn.scrollspy.defaults, options ) // Merge default options.
    // Attach scroll event listener to the scrollable element.
    this.$scrollElement = $element . on ( 'scroll.scroll.data-api', process )
    // Determine the selector for navigation items.
    this.selector = ( this.options.target
      || ( ( href = $(element).attr ( 'href' ) ) && href.replace ( /.*(?=#[^\s]+$)/, '' ) ) // Strip for IE7.
      || '' ) + ' .nav li > a'
    // Attach click event listener to navigation items.
    this.$body = $( 'body' ) . on ( 'click.scroll.data-api', this.selector, process )
    this.refresh () // Initial refresh to set up targets and offsets.
    this.process () // Initial processing to set active item.
    }

  // ScrollSpy prototype methods.
  ScrollSpy.prototype =
    {

      constructor: ScrollSpy // Set the constructor property.

    , refresh: function ()
        {
        var _this = this; // Cache 'this' for use in map callback.

        // Map navigation item hrefs to actual target elements.
        this.targets = this.$body
          . find ( this.selector )
          . map ( function ()
            {
            var href = $(this) . attr ( 'href' )
            // Return href only if it's an anchor link and the target element exists.
            return /^#\w/.test ( href ) && $(href).length ? href : null
            })
          .get(); // Convert jQuery object to a plain array.

        // Map target elements to their top offset positions.
        this.offsets = $.map ( this.targets, function ( id )
          {
          return $(id) . position () . top
          })
        }

    , process: function ()
        {
        var scrollTop    = this.$scrollElement.scrollTop () + this.options.offset // Current scroll position + offset.
          , offsets      = this.offsets
          , targets      = this.targets
          , activeTarget = this.activeTarget
          , i            // Loop counter.

        // Iterate through targets to find the currently active one.
        for ( i = offsets.length; i--; )
          {
          // Check if the current target is different from the active one,
          // and if scroll position is within the bounds of the current target.
          activeTarget != targets[i]
            && scrollTop >= offsets[i]
            && ( ! offsets[i + 1] || scrollTop <= offsets[i + 1] )
            && this.activate ( targets[i] ) // Activate the target.
          }
        }

    , activate: function ( target )
        {
        var active // Variable to hold the active navigation item.

        this.activeTarget = target // Set the currently active target.

        // Remove 'active' class from previously active navigation items.
        this.$body
          . find ( this.selector ) . parent ( '.active' )
          . removeClass ( 'active' )

        // Add 'active' class to the current navigation item.
        active = this.$body
          . find ( this.selector + '[href="' + target + '"]' )
          . parent ( 'li' )
          . addClass ( 'active' )

        // If the active item is within a dropdown, activate the parent dropdown.
        if ( active.parent ( '.dropdown-menu' ) )
          {
          active.closest ( 'li.dropdown' ) . addClass ( 'active' )
          }
        }

    } // End of ScrollSpy.prototype.


 /*
  * SCROLLSPY PLUGIN DEFINITION
  * ==================================================================== */

  // jQuery plugin definition for scrollspy.
  $.fn.scrollspy = function ( option )
    {
    return this.each ( function ()
      {
      var $this   = $(this)
        , data    = $this.data ( 'scrollspy' )
        , options = typeof option == 'object' && option // Get options if provided.
      // If a scrollspy instance doesn't exist, create one and store it.
      if ( ! data ) $this.data ( 'scrollspy', ( data = new ScrollSpy ( this, options ) ) )
      // If option is a string, call the corresponding method.
      if ( typeof option == 'string' ) data [ option ] ()
      })
    }

  // Expose the ScrollSpy constructor for external access.
  $.fn.scrollspy.Constructor = ScrollSpy

  // Default options for scrollspy.
  $.fn.scrollspy.defaults =
    {
      offset: 10 // Offset in pixels to adjust scroll position.
    }


 /*
  * SCROLLSPY DATA-API
  * ==================================================================== */

  // Attach event handlers for data-api scrollspy elements on document ready.
  $(function ()
    {
    // Iterate over elements with data-spy="scroll".
    $( '[data-spy="scroll"]' ) . each ( function ()
      {
      var $spy = $(this)
      // Initialize scrollspy with data attributes as options.
      $spy.scrollspy ( $spy.data () )
      })
    })

  }( window.jQuery ); // Pass window.jQuery to the IIFE.

/* ====================================================================================================
 *
 * This file contains the JavaScript code for Bootstrap's tab component.
 * Original source: http://twitter.github.com/bootstrap/javascript.html#tabs
 *
 * Version: v2.0.1
 *
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==================================================================================================== */


! function ( $ )
  {