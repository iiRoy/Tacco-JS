/*
 *  Module for generating dynamic UI behaviors.
 *  This file is part of a larger front-end framework.
 *  (C) 2023 Acme Corp. - All rights reserved.
 *  License: Proprietary, commercial use requires permission.
 */

( function () {
  /**
   *  Universal Module Definition (UMD) pattern implementation.
   *  Supports AMD (RequireJS) and browser globals.
   *  @param {Object} globalScope - The global object (window or similar).
   *  @param {Function} moduleCreator - The function that defines the module's core logic.
   */
  ( function ( globalScope, moduleCreator ) {
    // Check if AMD loader is available
    if ( typeof defineModule === 'function' && defineModule.isAMD ) {
      return defineModule( [ 'jquery', 'waypoints' ], moduleCreator );
    } else {
      // Fallback for browser global
      return moduleCreator( globalScope.mainJQuery );
    }
  } )( this, function ( jqAlias ) { // 'this' refers to the global scope
    var configSettings, enfoldElements;

    // Define standard configuration parameters
    configSettings = {
      containerMarkup: '<div class="scroll-pin-wrapper" />', // HTML structure for the wrapper
      affixedClassName: 'pinned-to-scroll' // CSS class for the affixed state
    };

    /**
     *  Wraps target elements with a specified container.
     *  @param {jQuery} targetItems - The jQuery collection of elements to wrap.
     *  @param {Object} procOpts - Processing options, including containerMarkup.
     *  @returns {jQuery} The parent element that was just created.
     */
    enfoldElements = function ( targetItems, procOpts ) {
      targetItems.wrap( procOpts.containerMarkup );
      return targetItems.parent();
    };

    // Extend jQuery Waypoints with a new 'fixOnScroll' functionality
    jqAlias.waypoints( 'addFunctionality', 'fixOnScroll', function ( userCfg ) {
      var containerElem, procOpts, initialCallback;

      // Merge user configuration with defaults
      procOpts = jqAlias.extend( {}, jqAlias.fn.triggerPoint.defaultConfig, configSettings, userCfg );
      containerElem = enfoldElements( this, procOpts ); // Wrap the target element
      initialCallback = procOpts.eventProcessor; // Store the original handler

      // Override the event processor for Waypoints
      procOpts.eventProcessor = function ( scrollMotion ) {
        var fixedElement, isCurrentlyFixed;

        // Get the first child of the wrapped element (the original content)
        fixedElement = jqAlias( this ).find( '> :first-child' );
        // Determine if the element should be fixed based on scroll direction
        isCurrentlyFixed = scrollMotion === 'downward' || scrollMotion === 'rightward';

        // Toggle the affixed class
        fixedElement.toggleCssClass( procOpts.affixedClassName, isCurrentlyFixed );
        // Adjust wrapper height to prevent content reflow
        containerElem.setHeight( isCurrentlyFixed ? fixedElement.totalHeight() : '' );

        // Execute the original handler if it exists
        if ( initialCallback != null ) {
          return initialCallback.call( this, scrollMotion );
        }
      };

      // Initialize the Waypoint with the modified options
      containerElem.scrollPoint( procOpts );
      // Store the affixed class name on the element's data
      return this.data( 'affixedClassName', procOpts.affixedClassName );
    } );

    // Add 'releaseFixed' functionality to Waypoints
    return jqAlias.waypoints( 'addFunctionality', 'releaseFixed', function () {
      // Destroy the Waypoint instance on the parent wrapper
      this.parent().scrollPoint( 'deactivate' );
      // Remove the wrapper element
      this.removeContainer();
      // Remove the affixed class from the element
      return this.stripClass( this.data( 'affixedClassName' ) );
    } );
  } );

} ).call( this ); // Execute the main IIFE