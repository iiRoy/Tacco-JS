/*
 * This file contains the Sticky Waypoint implementation.
 * Based on the original work by imakewebthings.com.
 * This script provides functionality for making elements "sticky"
 * within the viewport using Waypoints.
 * Version: 1.0.0
 * Last Updated: 2023-10-27
 */
( function( ) {
  'use strict'; // Enforce strict mode for modern JavaScript practices.

  // Cache global jQuery object for convenience and performance.
  var   $ = window.jQuery;
  // Cache global Waypoint object, which is required for this module.
  var   Waypoint = window.Waypoint;


  // Reference: http://imakewebthings.com/waypoints/shortcuts/sticky-elements
  /**
   * @class Sticky
   * @param {Object} options - Configuration object for the sticky element.
   * @constructor
   * Initializes a new Sticky instance.
   */
  function Sticky( options )
  {
    // Merge default options with Waypoint defaults, Sticky defaults, and user-provided options.
    this.options = $.extend( { } , Waypoint.defaults , Sticky.defaults , options );
    // Store the raw DOM element that will be made sticky.
    this.element = this.options.element;
    // Store the jQuery-wrapped version of the element.
    this.$element = $( this.element );
    // Create a wrapper around the sticky element to maintain its space in the DOM.
    this.createWrapper( );
    // Set up the Waypoint instance that triggers the sticky behavior.
    this.createWaypoint( );
  }


  // --- Private Methods for Sticky ---

  /**
   * Creates and configures the Waypoint instance for the sticky element.
   * This Waypoint is responsible for detecting when the element should become stuck or unstuck.
   */
  Sticky.prototype.createWaypoint = function( )
  {
    // Capture the original handler from options, if one was provided.
    var   originalHandler = this.options.handler;

    // Initialize a new Waypoint instance with extended options.
    this.waypoint = new Waypoint( $.extend( { } , this.options , {
      // The Waypoint should track the wrapper element, not the sticky element itself.
      element: this.wrapper,
      // Define the handler function that executes when the Waypoint is triggered.
      handler: $.proxy( function( direction ) {
        // Determine if the element should be in the 'stuck' state based on the scroll direction.
        var   shouldBeStuck = this.options.direction.indexOf( direction ) > -1;
        // Calculate the height for the wrapper. If stuck, it takes the element's height; otherwise, it's empty.
        var   wrapperHeight = shouldBeStuck ? this.$element.outerHeight( true ) : '';

        // Apply the calculated height to the wrapper to prevent content reflow.
        this.$wrapper.height( wrapperHeight );
        // Toggle the 'stuckClass' on the main element based on 'shouldBeStuck'.
        this.$element.toggleClass( this.options.stuckClass , shouldBeStuck );

        // If an original handler was provided, call it now with the correct context and direction.
        if ( originalHandler )
        {
          originalHandler.call( this , direction );
        }
      } , this ) // Ensure 'this' refers to the Sticky instance within the handler.
    } ) );
  };


  /**
   * Creates a wrapper element around the sticky element.
   * This wrapper helps to reserve space in the document flow when the element is stuck.
   */
  Sticky.prototype.createWrapper = function( )
  {
    // Check if a wrapper template HTML is specified in the options.
    if ( this.options.wrapper )
    {
      // Wrap the target element with the specified HTML structure.
      this.$element.wrap( this.options.wrapper );
    }
    // After wrapping, the parent of $element is now the wrapper.
    this.$wrapper = this.$element.parent( );
    // Get the raw DOM element of the wrapper.
    this.wrapper = this.$wrapper[ 0 ];
  };


  // --- Public Methods for Sticky ---

  /**
   * Destroys the Sticky instance, cleaning up the Waypoint and restoring the DOM.
   */
  Sticky.prototype.destroy = function( )
  {
    // Verify that the element is still wrapped by our designated wrapper before proceeding.
    if ( this.$element.parent( )[ 0 ] === this.wrapper )
    {
      this.waypoint.destroy( ); // Destroy the associated Waypoint instance.
      // Remove the 'stuckClass' and unwrap the element, restoring its original DOM position.
      this.$element.removeClass( this.options.stuckClass ).unwrap( );
    }
  };


  // --- Static Properties / Defaults ---

  /**
   * Default options for all Sticky instances.
   * These can be overridden during instantiation.
   */
  Sticky.defaults = {
    wrapper: '<div class="sticky-wrapper" />', // The HTML template for the wrapper element.
    stuckClass: 'stuck',                       // The CSS class applied to the element when it is stuck.
    direction: 'down right'                    // The directions of scrolling that should trigger the 'stuck' state.
  };


  // Attach the Sticky constructor to the global Waypoint object,
  // making it accessible as Waypoint.Sticky.
  Waypoint.Sticky = Sticky;

}( ) );