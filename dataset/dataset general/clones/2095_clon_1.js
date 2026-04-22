// Horizontal Navigation Plugin for jQuery - Version 1.0
// Project URL: https://github.com/sebnitu/horizontalNav
// Developed by Sebastian Nitu, Copyright 2014. All rights reserved.
// Author's Website: http://sebnitu.com
// This script enables responsive horizontal navigation menus.

; ( function ( $ ) {

   $.fn.horizontalNav = function ( options ) {

    'use strict' ; // Enforce strict mode for cleaner code and error prevention.

    // Merge default plugin settings with any user-provided options.
    // The resulting configuration will be stored in 'opts'.
    var opts = $.extend( { } , $.fn.horizontalNav.defaults , options ) ;

    return this.each( function ( ) {

         // Store a reference to the current jQuery object (the element on which the plugin was called).
         var $this = $( this ) ;


         // Build element-specific options. This allows individual elements to override global plugin options
         // via data attributes (e.g., data-responsive="false").
         // 'o' will hold the final, merged options for this specific instance.
         var o = $.meta ? $.extend( { } , opts , $this.data( ) ) : opts ;


         // Determine the appropriate wrapper element.
         // If the plugin is called on a <ul>, its parent is the wrapper.
         // Otherwise, the element itself is considered the wrapper.
         if ( $this.is( 'ul' ) ) {
            var ul_wrap = $this.parent( ) ;
         } else {
            var ul_wrap = $this ;
         }


         // Retrieve necessary DOM elements and apply initial default styling adjustments.
         var ul = $this.is( 'ul' ) ? $this : ul_wrap.find( '> ul' ) ; // The primary unordered list element.
         var li = ul.find( '> li' ) ; // All immediate list items within the 'ul'.
         var li_last = li.last( ) ; // The very last list item in the 'li' collection.
         var li_count = li.size( ) ; // Total number of navigation items.
         var li_a = li.find( '> a' ) ; // Links within the list items, often targeted for padding removal.


         // If a minimum number of items is specified and not met, the plugin will not process.
         // This prevents applying styles to incomplete navigation structures.
         if ( o.minimumItems && o.minimumItems > li_count ) {
            $this.addClass( "horizontalNav-notprocessed" ) ;
            return false ; // Exit the 'each' loop for this element.
         }


         // Check if the responsive feature is enabled.
         if ( o.responsive === true ) {
            // Apply responsive adjustments on browser resize.
            // This specific condition targets older IE versions (IE7 and below)
            // or cases where 'tableDisplay' is explicitly disabled,
            // as they require a different resizing mechanism.
            if ( ( o.tableDisplay != true ) || ( $.browser.msie && parseInt( $.browser.version , 10 ) <= 7 ) ) {
               resizeTrigger( _construct , o.responsiveDelay ) ;
            }
         }


         // Ensure proper clearing of floats within the navigation wrapper.
         // If a clearing element already exists, just apply zoom. Otherwise, create one.
         if ( $ ( '.clearHorizontalNav' ).length ) {
            ul_wrap.css( { 'zoom' : '1' } ) ; // Trigger hasLayout for IE6/7.
         } else {
            ul_wrap.css( { 'zoom' : '1' } ).append( '<div class="clearHorizontalNav">' ) ;
            // Append a dedicated clearing element to the unordered list wrapper.
            // This ensures that floated list items do not break the layout.
            $( '.clearHorizontalNav' ).css( {
               'display'    : 'block' ,
               'overflow'   : 'hidden' ,
               'visibility' : 'hidden' ,
               'width'      : 0 ,
               'height'     : 0 ,
               'clear'      : 'both'
            } ) ;
         }


         // Execute the core construction logic to set up the navigation.
         _construct( ) ;


         // Helper function to calculate the true inner width of an element.
         // This specifically excludes padding from the standard innerWidth() calculation.
         function trueInnerWidth ( element ) {
            return element.innerWidth( ) - (
               parseInt( element.css( 'padding-left' ) ) + parseInt( element.css( 'padding-right' ) )
            ) ;
         }


         // Utility function to debounce a callback on browser window resize events.
         // This prevents excessive function calls during continuous resizing.
         function resizeTrigger ( callback , delay ) {

            // Set a default delay if none is provided.
            delay = delay || 100 ;

            // Initialize a timer variable.
            var resizeTimer ;

            // Attach the resize event handler to the window.
            $( window ).resize( function ( ) {
               clearTimeout( resizeTimer ) ; // Clear any existing timer.
               resizeTimer = setTimeout( function ( ) {
                  callback( ) ; // Execute the callback after the delay.
               } , delay ) ;
            } ) ;
         }


         // The main function responsible for calculating and setting the widths of list items.
         // This is where the core logic of the horizontal navigation plugin resides.
         function _construct ( ) {

            // Conditional logic based on 'tableDisplay' option and IE7 compatibility.
            if ( ( o.tableDisplay != true ) || ( $.browser.msie && parseInt( $.browser.version , 10 ) <= 7 ) ) {

               // This branch handles older browsers (primarily IE7) that do not support
               // the 'display: table' CSS property effectively for this layout.
               // It relies on floating elements and manual width calculations.

               // Apply necessary styles for float-based layout.
               ul.css( { 'float' : 'left' } ) ;
               li.css( { 'float' : 'left' , 'width' : 'auto' } ) ;
               li_a.css( { 'padding-left' : 0 , 'padding-right' : 0 } ) ;


               // Perform calculations to determine available space and distribute it among list items.
               var ul_width = trueInnerWidth( ul ) ; // Inner width of the ul.
               var ul_width_outer = ul.outerWidth( true ) ; // Outer width of the ul, including margin.
               var ul_width_extra = ul_width_outer - ul_width ; // Difference between outer and inner width.

               var full_width = trueInnerWidth( ul_wrap ) ; // The total available width of the wrapper.
               var extra_width = ( full_width - ul_width_extra ) - ul_width ; // Remaining space to distribute.
               var li_padding = Math.floor( extra_width / li_count ) ; // Evenly distribute extra width as padding.


               // Iterate through each list item to adjust its width.
               li.each( function ( index ) {
                  var li_width = trueInnerWidth( $( this ) ) ; // Get the current inner width of the list item.
                  $( this ).css( { 'width' : ( li_width + li_padding ) + 'px' } ) ; // Apply the new calculated width.
               } ) ;


               // Calculate the width for the last list item, accounting for any leftover pixels.
               var li_last_width = trueInnerWidth( li_last ) + ( ( full_width - ul_width_extra ) - trueInnerWidth( ul ) ) ;

               // Special adjustment for browser inconsistencies (Firefox and IE typically).
               // These browsers can sometimes render elements one pixel off, requiring a correction.
               if ( $.browser.mozilla || $.browser.msie ) {
                  li_last_width = li_last_width - 1 ;
               }

               // Apply the adjusted width to the last navigation item.
               li_last.css( { 'width' : li_last_width + 'px' } ) ;

            } else {

               // This block is for modern browsers that fully support CSS 'display: table' and 'display: table-cell'.
               // This method offers a more robust and simpler way to create equal-width columns.
               ul.css( { 'display' : 'table' , 'float' : 'none' , 'width' : '100%' } ) ;
               li.css( { 'display' : 'table-cell' , 'float' : 'none' } ) ;
            }

            // Mark the navigation as processed and remove the "not processed" class.
            $this.addClass( "horizontalNav-processed" ).removeClass( "horizontalNav-notprocessed" ) ;
         }

    } ) ; // End of return this.each() function.

   } ;


   // Define the default options for the horizontalNav plugin.
   // These can be overridden by user-provided options during plugin initialization.
   $.fn.horizontalNav.defaults = {
      responsive      : true ,  // Enable or disable responsive behavior on window resize.
      responsiveDelay : 100 ,   // Delay in milliseconds before recalculating on resize.
      tableDisplay    : true ,  // Use CSS 'display: table' for modern browsers. Set to false for old IE only.
      minimumItems    : 0       // Minimum number of list items required for the plugin to process.
   } ;

} ) ( jQuery ) ; // Execute the plugin definition immediately, passing jQuery as '$'.