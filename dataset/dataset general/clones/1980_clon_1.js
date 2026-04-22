// This file is part of the Bootstrap JavaScript library.
// Original source: http://twitter.github.com/bootstrap/javascript.html#transitions
// Version: v2.1.1
/*
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Immediately-invoked function expression (IIFE) to encapsulate the code
! function ( $ ) {

    // Document ready handler
    $( function () {

        "use strict" ; // Enforce strict mode for better error checking.

        // CSS TRANSITION SUPPORT (based on Modernizr)
        // This section detects the browser's specific transition end event name.
        $.support.transition = ( function () {

            var transitionEnd = ( function () {

                var el = document.createElement( 'bootstrap' ) ;
                // Object mapping CSS transition properties to their respective event names
                var transEndEventNames = {
                    'WebkitTransition' : 'webkitTransitionEnd' ,
                    'MozTransition'    : 'transitionend'       ,
                    'OTransition'      : 'oTransitionEnd otransitionend' ,
                    'transition'       : 'transitionend'
                } ;
                var name ; // Loop variable

                // Iterate over possible transition properties
                for ( name in transEndEventNames ) {
                    // Check if the browser supports this transition property
                    if ( el.style[ name ] !== undefined ) {
                        return transEndEventNames[ name ] ; // Return the corresponding event name
                    }
                }
                // If no transition support is found, return nothing (undefined)

            } ) ( ) ; // Self-executing function to determine transitionEnd event

            // Return the transition end event name if found, otherwise false
            return transitionEnd && { end : transitionEnd } ;

        } ) ( ) ; // Self-executing function to set $.support.transition

    } ) ; // End of document ready

} ( window.jQuery ) ; // Pass jQuery object to the IIFE
// File: bootstrap-alert.js
// Version: 2.1.1
// Source: http://twitter.github.com/bootstrap/javascript.html#alerts
//
// Copyright 2012 Twitter, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

! function ( $ ) {

    "use strict" ; // Enable strict mode.

    // ALERT CLASS DEFINITION
    // ======================

    var dismiss = '[data-dismiss="alert"]' ; // Selector for dismiss buttons
    var Alert = function ( el ) {
        // Attach click event to dismiss button within the alert element
        $( el ).on( 'click' , dismiss , $.proxy( this.close, this ) ) ;
    } ;

    Alert.prototype.close = function ( e ) {
        var $this = $( this ) ;
        var selector = $this.attr( 'data-target' ) ;
        var $parent ; // Declare $parent here

        // If no data-target attribute, try the href attribute
        if ( ! selector ) {
            selector = $this.attr( 'href' ) ;
            // Strip the hash from the href for IE7 compatibility
            selector = selector && selector.replace( /.*(?=#[^\s]*$)/ , '' ) ;
        }

        $parent = $( selector ) ; // Get the parent element to close

        // Prevent default event if it exists (e.g., link click)
        e && e.preventDefault( ) ;

        // If $parent is not found by selector, determine it based on context
        $parent.length || ( $parent = $this.hasClass( 'alert' ) ? $this : $this.parent( ) ) ;

        // Trigger the 'close' event on the parent
        $parent.trigger( e = $.Event( 'close' ) ) ;

        // If event default is prevented by a handler, stop here
        if ( e.isDefaultPrevented( ) ) return ;

        $parent.removeClass( 'in' ) ; // Remove 'in' class for transition effect

        // Function to remove the element after any transition completes
        function removeElement ( ) {
            $parent
                .trigger( 'closed' ) // Trigger a 'closed' event
                .remove( ) ; // Finally remove the element from the DOM
        }

        // Check for CSS transition support and 'fade' class for animation
        $.support.transition && $parent.hasClass( 'fade' )
            ? $parent.on( $.support.transition.end , removeElement ) // Use transition end event if supported
            : removeElement( ) ; // Otherwise, remove immediately

    } ; // End of Alert.prototype.close method


    // ALERT PLUGIN DEFINITION
    // =======================

    $.fn.alert = function ( option ) {
        return this.each( function ( ) {
            var $this = $( this ) ;
            var data = $this.data( 'alert' ) ;
            // Initialize the Alert instance if it doesn't exist
            if ( ! data ) $this.data( 'alert' , ( data = new Alert( this ) ) ) ;
            // If option is a string, call the corresponding method on the instance
            if ( typeof option == 'string' ) data[ option ].call( $this ) ;
        } ) ;
    } ;

    $.fn.alert.Constructor = Alert ; // Assign Constructor property to the plugin


    // ALERT DATA-API
    // ==============

    $( function ( ) {
        // Attach click handler for alerts using data-api attributes
        $( 'body' ).on( 'click.alert.data-api' , dismiss , Alert.prototype.close ) ;
    } ) ;

} ( window.jQuery ) ; // Pass jQuery to the IIFE
// Bootstrap Button Plugin
// Version 2.1.1
// Documentation: http://twitter.github.com/bootstrap/javascript.html#buttons
//
// Copyright 2012 Twitter, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

! function ( $ ) {

    "use strict" ; // Enforce strict JavaScript parsing and execution.


    // BUTTON PUBLIC CLASS DEFINITION
    // ==============================

    var Button = function ( element , options ) {
        this.$element = $( element ) ; // Store the jQuery wrapped element
        this.options = $.extend( { } , $.fn.button.defaults , options ) ; // Merge default options with provided ones
    } ;

    Button.prototype.setState = function ( state ) {
        var d = 'disabled' ; // Variable for the 'disabled' attribute/class string
        var $el = this.$element ;
        var data = $el.data( ) ; // Get data attributes
        var val = $el.is( 'input' ) ? 'val' : 'html' ; // Determine whether to use .val() for input or .html() for other elements

        state = state + 'Text' ; // Append 'Text' to the state for dynamic property access (e.g., 'loadingText')
        // Store original text if not already stored in data-reset-text
        data.resetText || $el.data( 'resetText' , $el[ val ] ( ) ) ;

        // Set the button text based on the current state or default options
        $el[ val ] ( data[ state ] || this.options[ state ] ) ;

        // Use setTimeout to push the state change to the event loop,
        // allowing forms to submit before the button is visually disabled.
        setTimeout( function ( ) {
            state == 'loadingText'
                ? $el.addClass( d ).attr( d , d ) // If loading state, add disabled class and attribute
                : $el.removeClass( d ).removeAttr( d ) ; // Otherwise, remove disabled class and attribute
        } , 0 ) ;
    } ;

    Button.prototype.toggle = function ( ) {
        // Find the closest parent with data-toggle="buttons-radio" for group behavior
        var $parent = this.$element.closest( '[data-toggle="buttons-radio"]' ) ;

        // If inside a button group, remove 'active' class from siblings
        $parent && $parent
            .find( '.active' )
            .removeClass( 'active' ) ;

        this.$element.toggleClass( 'active' ) ; // Toggle 'active' class on the current element
    } ;


    // BUTTON PLUGIN DEFINITION
    // ========================

    $.fn.button = function ( option ) {
        return this.each( function ( ) {
            var $this = $( this ) ;
            var data = $this.data( 'button' ) ;
            var options = typeof option == 'object' && option ;
            // Initialize the Button instance if it doesn't exist
            if ( ! data ) $this.data( 'button' , ( data = new Button( this , options ) ) ) ;
            // Execute method based on the option provided
            if ( option == 'toggle' ) data.toggle( ) ;
            else if ( option ) data.setState( option ) ;
        } ) ;
    } ;

    $.fn.button.defaults = {
        loadingText : 'loading...' // Default text for the loading state
    } ;

    $.fn.button.Constructor = Button ; // Set the constructor property for the plugin


    // BUTTON DATA-API
    // ===============

    $( function ( ) {
        // Attach click handler for buttons using data-api attributes
        $( 'body' ).on( 'click.button.data-api' , '[data-toggle^=button]' , function ( e ) {
            var $btn = $( e.target ) ;
            // If the clicked element is not the button itself, find the closest button
            if ( ! $btn.hasClass( 'btn' ) ) $btn = $btn.closest( '.btn' ) ;
            $btn.button( 'toggle' ) ; // Call the toggle method on the button
        } ) ;
    } ) ;

} ( window.jQuery ) ; // Pass jQuery to the IIFE
// Carousel Plugin for Bootstrap
// v2.1.1
// Reference: http://twitter.github.com/bootstrap/javascript.html#carousel
//
// Copyright (c) 2012 Twitter, Inc.
//
// This software is licensed under the Apache License, Version 2.0 (the "License").
// You may obtain a copy of the License at:
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

! function ( $ ) {

    "use strict" ; // Use strict mode for better code quality.


    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function ( element , options ) {
        this.$element = $( element ) ; // Store the jQuery element of the carousel
        this.options = options ; // Store options provided
        // If 'slide' option is present, initiate slide to that index
        this.options.slide && this.slide( this.options.slide ) ;
        // If 'pause' option is 'hover', bind mouse events for pausing/cycling
        this.options.pause == 'hover' && this.$element
            .on( 'mouseenter' , $.proxy( this.pause , this ) )
            .on( 'mouseleave' , $.proxy( this.cycle , this ) ) ;
    } ;

    Carousel.prototype = {

        constructor : Carousel // Explicitly set constructor for proper inheritance

        , cycle : function ( e ) {
            if ( ! e ) this.paused = false ; // If no event, ensure not in a paused state
            // Start interval if option is set and not paused
            this.options.interval
                && ! this.paused
                && ( this.interval = setInterval( $.proxy( this.next , this ) , this.options.interval ) ) ;
            return this ; // Return the instance for chaining
        }

        , to : function ( pos ) {
            var $active = this.$element.find( '.item.active' ) ; // Current active carousel item
            var children = $active.parent( ).children( ) ; // All carousel items (siblings of active)
            var activePos = children.index( $active ) ; // Index of the currently active item
            var that = this ; // Cache 'this' for use in callbacks

            // Validate target position: must be within bounds
            if ( pos > ( children.length - 1 ) || pos < 0 ) return ;

            // If a slide is already in progress, wait for it to complete
            if ( this.sliding ) {
                return this.$element.one( 'slid' , function ( ) {
                    that.to( pos ) ; // Then call 'to' again with the target position
                } ) ;
            }

            // If the target position is the same as the current active position,
            // just pause and then resume cycling.
            if ( activePos == pos ) {
                return this.pause( ).cycle( ) ;
            }

            // Determine slide direction and initiate the slide
            return this.slide( pos > activePos ? 'next' : 'prev' , $( children[ pos ] ) ) ;
        }

        , pause : function ( e ) {
            if ( ! e ) this.paused = true ; // If no event, explicitly set paused state
            // If there's an ongoing transition animation, trigger its end
            if ( this.$element.find( '.next, .prev' ).length && $.support.transition.end ) {
                this.$element.trigger( $.support.transition.end ) ;
                this.cycle( ) ; // Re-cycle after transition ends
            }
            clearInterval( this.interval ) ; // Clear the auto-cycling interval
            this.interval = null ; // Reset the interval reference
            return this ;
        }

        , next : function ( ) {
            if ( this.sliding ) return ; // Prevent new slide if already sliding
            return this.slide( 'next' ) ; // Initiate slide to the next item
        }

        , prev : function ( ) {
            if ( this.sliding ) return ; // Prevent new slide if already sliding
            return this.slide( 'prev' ) ; // Initiate slide to the previous item
        }

        , slide : function ( type , next ) {
            var $active = this.$element.find( '.item.active' ) ; // Currently active item
            var $next = next || $active[ type ] ( ) ; // Next item to slide to, or find it using 'next()' or 'prev()'
            var isCycling = this.interval ; // Check if auto-cycling is currently active
            var direction = type == 'next' ? 'left' : 'right' ; // CSS class for slide direction
            var fallback = type == 'next' ? 'first' : 'last' ; // Fallback method if next/prev not found (wrap around)
            var that = this ; // Cache 'this' for use in callbacks
            var e = $.Event( 'slide' , {
                relatedTarget : $next[ 0 ] // Event object with related target element
            } ) ;

            this.sliding = true ; // Set sliding flag to true

            isCycling && this.pause( ) ; // Pause auto-cycling if it was active

            // If $next is empty (e.g., at the end/beginning), wrap around to first/last item
            $next = $next.length ? $next : this.$element.find( '.item' )[ fallback ] ( ) ;

            // If the chosen next item is already active, do nothing
            if ( $next.hasClass( 'active' ) ) return ;

            // Check for transition support and the 'slide' class for animated transitions
            if ( $.support.transition && this.$element.hasClass( 'slide' ) ) {
                this.$element.trigger( e ) ; // Trigger custom 'slide' event
                if ( e.isDefaultPrevented( ) ) return ; // Stop if event default is prevented
                $next.addClass( type ) ; // Add slide direction class (e.g., 'next' or 'prev')
                $next[ 0 ].offsetWidth ; // Force reflow for CSS transition to apply
                $active.addClass( direction ) ; // Add direction class to active item
                $next.addClass( direction ) ; // Add direction class to next item
                this.$element.one( $.support.transition.end , function ( ) {
                    // On transition end:
                    $next.removeClass( [ type , direction ].join( ' ' ) ).addClass( 'active' ) ; // Set next item as active
                    $active.removeClass( [ 'active' , direction ].join( ' ' ) ) ; // Remove active from previous item
                    that.sliding = false ; // Reset sliding flag
                    setTimeout( function ( ) { that.$element.trigger( 'slid' ) } , 0 ) ; // Trigger 'slid' event asynchronously
                } ) ;
            } else {
                // Fallback for browsers without transition support or if 'slide' class is absent
                this.$element.trigger( e ) ; // Trigger custom 'slide' event
                if ( e.isDefaultPrevented( ) ) return ; // Stop if event default is prevented
                $active.removeClass( 'active' ) ; // Remove active class from current item
                $next.addClass( 'active' ) ; // Add active class to next item
                this.sliding = false ; // Reset sliding flag
                this.$element.trigger( 'slid' ) ; // Trigger 'slid' event
            }

            isCycling && this.cycle( ) ; // Resume auto-cycling if it was active

            return this ; // Return instance for chaining
        }

    } ; // End of Carousel.prototype


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    $.fn.carousel = function ( option ) {
        return this.each( function ( ) {
            var $this = $( this ) ;
            var data = $this.data( 'carousel' ) ;
            var options = $.extend( { } , $.fn.carousel.defaults , typeof option == 'object' && option ) ;
            var action = typeof option == 'string' ? option : options.slide ;
            // Initialize the Carousel instance if it doesn't exist
            if ( ! data ) $this.data( 'carousel' , ( data = new Carousel( this , options ) ) ) ;
            // Handle different option types: number (to index), string (method name), or interval (cycle)
            if ( typeof option == 'number' ) data.to( option ) ;
            else if ( action ) data[ action ] ( ) ;
            else if ( options.interval ) data.cycle( ) ;
        } ) ;
    } ;

    $.fn.carousel.defaults = {
        interval : 5000 , // Default interval for auto-cycling (5 seconds)
        pause : 'hover' // Default pause behavior on hover
    } ;

    $.fn.carousel.Constructor = Carousel ; // Assign the constructor to the plugin


    // CAROUSEL DATA-API
    // =================

    $( function ( ) {
        // Attach click handler for data-api usage (elements with data-slide attribute)
        $( 'body' ).on( 'click.carousel.data-api' , '[data-slide]' , function ( e ) {
            var $this = $( this ) ;
            var href ;
            // Determine target element from data-target attribute or href
            var $target = $( $this.attr( 'data-target' ) || ( href = $this.attr( 'href' ) ) && href.replace( /.*(?=#[^\s]+$)/ , '' ) ) ; // Strip hash for IE7
            // Extend options with data attributes from target and clicked element
            var options = ! $target.data( 'modal' ) && $.extend( { } , $target.data( ) , $this.data( ) ) ;
            $target.carousel( options ) ; // Call carousel plugin on the target
            e.preventDefault( ) ; // Prevent default link behavior
        } ) ;
    } ) ;

} ( window.jQuery ) ; // Pass jQuery to the IIFE
// Bootstrap Collapse Plugin - v2.1.1
// Source: http://twitter.github.com/bootstrap/javascript.html#collapse
//
// Copyright (c) 2012 Twitter, Inc.
//
// This software is licensed under the Apache License, Version 2.0 (the "License").
// You may obtain a copy of the License at:
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

! function ( $ ) {

    "use strict" ; // Activate strict mode.


    // COLLAPSE PUBLIC CLASS DEFINITION
    // ================================

    var Collapse = function ( element , options ) {
        this.$element = $( element ) ; // The jQuery wrapped element that is collapsing
        this.options = $.extend( { } , $.fn.collapse.defaults , options ) ; // Merge default options with provided ones

        // If a parent selector is provided, cache the parent element
        if ( this.options.parent ) {
            this.$parent = $( this.options.parent ) ;
        }

        // If 'toggle' option is true, call the toggle method immediately
        this.options.toggle && this.toggle( ) ;
    } ;

    Collapse.prototype = {

        constructor : Collapse // Explicitly set constructor for proper inheritance

        , dimension : function ( ) {
            // Determine if the collapse is width-based or height-based
            var hasWidth = this.$element.hasClass( 'width' ) ;
            return hasWidth ? 'width' : 'height' ;
        }

        , show : function ( ) {
            var dimension ; // Stores 'width' or 'height' property name
            var scroll ; // Stores 'scrollWidth' or 'scrollHeight' property name
            var actives ; // Collection of currently active (open) collapse elements in the parent
            var hasData ; // Flag to check if active element has collapse data

            if ( this.transitioning ) return ; // Do nothing if already transitioning

            dimension = this.dimension( ) ; // Get the dimension for collapse (e.g., 'height')
            // Construct the corresponding scroll property name (e.g., 'scrollHeight')
            scroll = $.camelCase( [ 'scroll' , dimension ].join( '-' ) ) ;
            // Find active accordion groups within the specified parent
            actives = this.$parent && this.$parent.find( '> .accordion-group > .in' ) ;

            // If there are other active elements in the parent, hide them first
            if ( actives && actives.length ) {
                hasData = actives.data( 'collapse' ) ; // Get collapse instance data from active element
                if ( hasData && hasData.transitioning ) return ; // If active element is transitioning, stop
                actives.collapse( 'hide' ) ; // Hide the active element
                hasData || actives.data( 'collapse' , null ) ; // Clear data if no instance existed (cleanup)
            }

            this.$element[ dimension ] ( 0 ) ; // Set initial dimension to 0 for animation start
            // Start the transition process to show the element
            this.transition( 'addClass' , $.Event( 'show' ) , 'shown' ) ;
            // If transition supported, animate to the full scroll dimension
            $.support.transition && this.$element[ dimension ] ( this.$element[ 0 ][ scroll ] ) ;
        }

        , hide : function ( ) {
            var dimension ; // Stores 'width' or 'height' property name
            if ( this.transitioning ) return ; // Do nothing if already transitioning
            dimension = this.dimension( ) ; // Get the dimension for collapse
            this.reset( this.$element[ dimension ] ( ) ) ; // Store current dimension before hiding for reset
            // Start the transition process to hide the element
            this.transition( 'removeClass' , $.Event( 'hide' ) , 'hidden' ) ;
            this.$element[ dimension ] ( 0 ) ; // Animate dimension to 0
        }

        , reset : function ( size ) {