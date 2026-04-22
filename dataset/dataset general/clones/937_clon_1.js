/*
 * ==========================================================
 *     Bootstrap Transition Component - Version 2.1.1
 *     Official Source: http://twitter.github.com/bootstrap/javascript.html#transitions
 * ==========================================================
 *
 *     Copyright 2012 Twitter, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 * ============================================================
 */

// Self-executing anonymous function to encapsulate the plugin
! function ( $ ) {

    // Ensure strict mode for better code quality and error checking
    "use strict" ; // jshint ;_;

    // Document ready handler for initial setup
    $( function () {

        // --- CSS TRANSITION SUPPORT DETECTION (borrowed from Modernizr) ---
        // --- Refer to: http://www.modernizr.com/ ---

        $.support.transition = ( function () {

            // Inner function to determine the correct transition end event name
            var transitionEnd = ( function () {

                var el = document.createElement( 'bootstrap' ) // Create a dummy element
                    , transEndEventNames = { // Define potential transition end event names
                        'WebkitTransition' : 'webkitTransitionEnd'
                        , 'MozTransition' : 'transitionend'
                        , 'OTransition' : 'oTransitionEnd otransitionend'
                        , 'transition' : 'transitionend'
                    }
                    , name; // Loop variable

                // Iterate through the event names to find the supported one
                for ( name in transEndEventNames ) {
                    if ( el.style[ name ] !== undefined ) { // Check if the style property exists
                        return transEndEventNames[ name ] ; // Return the corresponding event name
                    }
                }

            }() ) ; // Immediately invoke the inner function

            // Return the detected transition end event or null if not supported
            return transitionEnd && {
                end : transitionEnd
            } ;

        } )() ; // Immediately invoke the outer function

    } ) ; // End of document ready

}( window.jQuery ) ; // Pass jQuery object to the function

/*
 * =========================================================
 *     Bootstrap Modal Plugin - Version 2.1.1
 *     Source: http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 *
 *     Copyright 2012 Twitter, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 * =========================================================
 */


! function ( $ ) {

    "use strict" ; // jshint ;_;

    /*
     *  MODAL CLASS DEFINITION
     *  ======================
     */

    var Modal = function ( element , options ) {
        this.options = options ; // Store options
        this.$element = $( element )
            // Delegate click event for dismiss button
            .delegate( '[data-dismiss="modal"]' , 'click.dismiss.modal' , $.proxy( this.hide , this ) ) ;
        // Load remote content into modal body if remote option is provided
        this.options.remote && this.$element.find( '.modal-body' ).load( this.options.remote ) ;
    } ;

    Modal.prototype = {

        constructor : Modal // Set constructor property

        , toggle : function () {
            // Toggles modal visibility based on current state
            return this[ ! this.isShown ? 'show' : 'hide' ]() ;
        }

        , show : function () {
            var that = this ; // Cache 'this' for callbacks
            var e = $.Event( 'show' ) ; // Create a custom 'show' event

            this.$element.trigger( e ) ; // Trigger the 'show' event

            // If modal is already shown or event is prevented, do nothing
            if ( this.isShown || e.isDefaultPrevented() ) return ;

            $( 'body' ).addClass( 'modal-open' ) ; // Add class to body to prevent scrolling

            this.isShown = true ; // Update state

            this.escape() ; // Enable escape key handling

            // Handle backdrop and show the modal
            this.backdrop( function () {
                var transition = $.support.transition && that.$element.hasClass( 'fade' ) ;

                // Append modal to body if it's not already a child
                if ( ! that.$element.parent().length ) {
                    that.$element.appendTo( document.body ) ; // Don't move modals dom position
                }

                that.$element.show() ; // Make modal visible

                // Force reflow for CSS transitions
                if ( transition ) {
                    that.$element[ 0 ].offsetWidth ; // force reflow
                }

                that.$element
                    .addClass( 'in' ) // Add 'in' class for animation
                    .attr( 'aria-hidden' , false ) // Set ARIA attribute
                    .focus() ; // Focus the modal

                that.enforceFocus() ; // Enforce focus within the modal

                // Trigger 'shown' event after transition or immediately
                transition ?
                    that.$element.one( $.support.transition.end , function () { that.$element.trigger( 'shown' ) } ) :
                    that.$element.trigger( 'shown' ) ;

            } ) ; // End of backdrop callback
        }

        , hide : function ( e ) {
            e && e.preventDefault() ; // Prevent default event action if present

            var that = this ; // Cache 'this' for callbacks

            e = $.Event( 'hide' ) ; // Create a custom 'hide' event

            this.$element.trigger( e ) ; // Trigger the 'hide' event

            // If modal is not shown or event is prevented, do nothing
            if ( ! this.isShown || e.isDefaultPrevented() ) return ;

            this.isShown = false ; // Update state

            $( 'body' ).removeClass( 'modal-open' ) ; // Remove body class

            this.escape() ; // Disable escape key handling

            $( document ).off( 'focusin.modal' ) ; // Remove focus enforcement

            this.$element
                .removeClass( 'in' ) // Remove 'in' class for animation
                .attr( 'aria-hidden' , true ) ; // Set ARIA attribute

            // Determine whether to hide with transition or immediately
            $.support.transition && this.$element.hasClass( 'fade' ) ?
                this.hideWithTransition() :
                this.hideModal() ;
        }

        , enforceFocus : function () {
            var that = this ; // Cache 'this'
            $( document ).on( 'focusin.modal' , function ( e ) {
                // If focus is not on the modal or its children, return focus to modal
                if ( that.$element[ 0 ] !== e.target && ! that.$element.has( e.target ).length ) {
                    that.$element.focus() ;
                }
            } ) ;
        }

        , escape : function () {
            var that = this ; // Cache 'this'
            // If modal is shown and keyboard option is enabled, handle escape key
            if ( this.isShown && this.options.keyboard ) {
                this.$element.on( 'keyup.dismiss.modal' , function ( e ) {
                    e.which == 27 && that.hide() ; // If escape key (27) is pressed, hide the modal
                } ) ;
            } else if ( ! this.isShown ) {
                // If modal is not shown, remove the keyup event handler
                this.$element.off( 'keyup.dismiss.modal' ) ;
            }
        }

        , hideWithTransition : function () {
            var that = this ; // Cache 'this'
            var timeout = setTimeout( function () {
                that.$element.off( $.support.transition.end ) ; // Remove transition end event
                that.hideModal() ; // Call the actual hide method
            } , 500 ) ; // Set a timeout as a fallback

            // Listen for transition end event
            this.$element.one( $.support.transition.end , function () {
                clearTimeout( timeout ) ; // Clear the fallback timeout
                that.hideModal() ; // Call the actual hide method
            } ) ;
        }

        , hideModal : function ( that ) { // 'that' parameter is unused here, seems like a leftover from refactoring
            this.$element
                .hide() // Hide the modal element
                .trigger( 'hidden' ) ; // Trigger the 'hidden' event

            this.backdrop() ; // Remove backdrop
        }

        , removeBackdrop : function () {
            this.$backdrop.remove() ; // Remove the backdrop element from DOM
            this.$backdrop = null ; // Clear reference
        }

        , backdrop : function ( callback ) {
            var that = this ; // Cache 'this'
            var animate = this.$element.hasClass( 'fade' ) ? 'fade' : '' ; // Determine if fade animation is used

            // If modal is shown and backdrop option is enabled
            if ( this.isShown && this.options.backdrop ) {
                var doAnimate = $.support.transition && animate ; // Check if animation is supported

                // Create backdrop element and append to body
                this.$backdrop = $( '<div class="modal-backdrop ' + animate + '" />' )
                    .appendTo( document.body ) ;

                // If backdrop is not static, enable click to hide
                if ( this.options.backdrop != 'static' ) {
                    this.$backdrop.click( $.proxy( this.hide , this ) ) ;
                }

                // Force reflow for CSS transitions
                if ( doAnimate ) this.$backdrop[ 0 ].offsetWidth ; // force reflow

                this.$backdrop.addClass( 'in' ) ; // Add 'in' class for animation

                // Call callback after transition or immediately
                doAnimate ?
                    this.$backdrop.one( $.support.transition.end , callback ) :
                    callback() ;

            } else if ( ! this.isShown && this.$backdrop ) {
                // If modal is hidden and backdrop exists, remove it
                this.$backdrop.removeClass( 'in' ) ; // Remove 'in' class

                // Remove backdrop after transition or immediately
                $.support.transition && this.$element.hasClass( 'fade' ) ?
                    this.$backdrop.one( $.support.transition.end , $.proxy( this.removeBackdrop , this ) ) :
                    this.removeBackdrop() ;

            } else if ( callback ) {
                // If no backdrop is needed but a callback is provided, execute it
                callback() ;
            }
        }
    } ; // End of Modal.prototype


    /*
     *  MODAL PLUGIN DEFINITION
     *  =======================
     */

    $.fn.modal = function ( option ) {
        return this.each( function () {
            var $this = $( this ) ; // Current element
            var data = $this.data( 'modal' ) ; // Get existing modal instance
            var options = $.extend( {} , $.fn.modal.defaults , $this.data() , typeof option == 'object' && option ) ;

            // If no modal instance, create a new one
            if ( ! data ) $this.data( 'modal' , ( data = new Modal( this , options ) ) ) ;
            // Call method or show modal based on option
            if ( typeof option == 'string' ) data[ option ]() ;
            else if ( options.show ) data.show() ;
        } ) ;
    } ;

    // Default options for modal
    $.fn.modal.defaults = {
        backdrop : true
        , keyboard : true
        , show : true
    } ;

    // Expose Modal constructor
    $.fn.modal.Constructor = Modal ;


    /*
     *  MODAL DATA-API
     *  ==============
     */

    $( function () {
        $( 'body' ).on( 'click.modal.data-api' , '[data-toggle="modal"]' , function ( e ) {
            var $this = $( this ) ; // The clicked element
            var href = $this.attr( 'href' ) ; // Get href attribute
            // Determine target element from data-target or href
            var $target = $( $this.attr( 'data-target' ) || ( href && href.replace( /.*(?=#[^\s]+$)/ , '' ) ) ) ; // strip for ie7
            // Determine option for modal initialization
            var option = $target.data( 'modal' ) ? 'toggle' : $.extend( { remote : ! /#/.test( href ) && href } , $target.data() , $this.data() ) ;

            e.preventDefault() ; // Prevent default link behavior

            $target
                .modal( option ) // Initialize or toggle modal
                .one( 'hide' , function () { // Focus the trigger element after modal hides
                    $this.focus() ;
                } ) ;
        } ) ;
    } ) ;

}( window.jQuery ) ;

/*
 * ============================================================
 *     Bootstrap Dropdown Component - Version 2.1.1
 *     Source: http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * ============================================================
 *
 *     Copyright 2012 Twitter, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 * ============================================================
 */


! function ( $ ) {

    "use strict" ; // jshint ;_;

    /*
     *  DROPDOWN CLASS DEFINITION
     *  =========================
     */

    var toggle = '[data-toggle=dropdown]' ; // Selector for dropdown toggles
    var Dropdown = function ( element ) {
        var $el = $( element ).on( 'click.dropdown.data-api' , this.toggle ) ; // Attach toggle handler
        // Close dropdown when clicking anywhere else on the document
        $( 'html' ).on( 'click.dropdown.data-api' , function () {
            $el.parent().removeClass( 'open' ) ;
        } ) ;
    } ;

    Dropdown.prototype = {

        constructor : Dropdown // Set constructor property

        , toggle : function ( e ) {
            var $this = $( this ) ; // The clicked dropdown toggle
            var $parent ; // Parent dropdown container
            var isActive ; // Flag for active state

            // Do nothing if the toggle is disabled
            if ( $this.is( '.disabled, :disabled' ) ) return ;

            $parent = getParent( $this ) ; // Get the parent dropdown element

            isActive = $parent.hasClass( 'open' ) ; // Check if dropdown is currently open

            clearMenus() ; // Close all other open dropdowns

            // If the current dropdown was not active, open it
            if ( ! isActive ) {
                $parent.toggleClass( 'open' ) ; // Toggle 'open' class
                $this.focus() ; // Focus the toggle
            }

            return false ; // Prevent default action and event bubbling
        }

        , keydown : function ( e ) {
            var $this ; // The current element
            var $items ; // Dropdown menu items
            var $active ; // Currently focused item
            var $parent ; // Parent dropdown container
            var isActive ; // Flag for active state
            var index ; // Index of focused item

            // Only respond to up (38), down (40), and escape (27) keys
            if ( ! /(38|40|27)/.test( e.keyCode ) ) return ;

            $this = $( this ) ; // Current element is the dropdown toggle

            e.preventDefault() ; // Prevent default browser behavior
            e.stopPropagation() ; // Stop event propagation

            // Do nothing if the toggle is disabled
            if ( $this.is( '.disabled, :disabled' ) ) return ;

            $parent = getParent( $this ) ; // Get the parent dropdown element

            isActive = $parent.hasClass( 'open' ) ; // Check if dropdown is open

            // If not active, or if active and escape key pressed, click the toggle to close
            if ( ! isActive || ( isActive && e.keyCode == 27 ) ) return $this.click() ;

            // Get all focusable menu items
            $items = $( '[role=menu] li:not(.divider) a' , $parent ) ;

            // If no items, do nothing
            if ( ! $items.length ) return ;

            // Get index of currently focused item
            index = $items.index( $items.filter( ':focus' ) ) ;

            // Handle arrow keys for navigation
            if ( e.keyCode == 38 && index > 0 ) index-- ; // Up arrow: move up
            if ( e.keyCode == 40 && index < $items.length - 1 ) index++ ; // Down arrow: move down
            if ( ! ~ index ) index = 0 ; // If no item focused, focus the first one

            // Focus the selected item
            $items
                .eq( index )
                .focus() ;
        }

    } ; // End of Dropdown.prototype

    // Helper function to close all open dropdown menus
    function clearMenus () {
        getParent( $( toggle ) )
            .removeClass( 'open' ) ;
    }

    // Helper function to get the parent dropdown element
    function getParent ( $this ) {
        var selector = $this.attr( 'data-target' ) ; // Get target from data-target attribute
        var $parent ; // Variable to store parent element

        // If no data-target, use href
        if ( ! selector ) {
            selector = $this.attr( 'href' ) ;
            // Strip hash for IE7 compatibility
            selector = selector && /#/.test( selector ) && selector.replace( /.*(?=#[^\s]*$)/ , '' ) ;
        }

        $parent = $( selector ) ; // Find parent by selector
        $parent.length || ( $parent = $this.parent() ) ; // If not found, use immediate parent

        return $parent ;
    }


    /*
     *  DROPDOWN PLUGIN DEFINITION
     *  ==========================
     */

    $.fn.dropdown = function ( option ) {
        return this.each( function () {
            var $this = $( this ) ; // Current element
            var data = $this.data( 'dropdown' ) ; // Get existing dropdown instance
            // If no instance, create a new one
            if ( ! data ) $this.data( 'dropdown' , ( data = new Dropdown( this ) ) ) ;
            // If option is a string, call the corresponding method
            if ( typeof option == 'string' ) data[ option ].call( $this ) ;
        } ) ;
    } ;

    // Expose Dropdown constructor
    $.fn.dropdown.Constructor = Dropdown ;


    /*
     *  APPLY TO STANDARD DROPDOWN ELEMENTS
     *  ===================================
     */

    $( function () {
        $( 'html' )
            // Close menus on click/touchstart outside
            .on( 'click.dropdown.data-api touchstart.dropdown.data-api' , clearMenus ) ;
        $( 'body' )
            // Stop propagation for forms inside dropdowns
            .on( 'click.dropdown touchstart.dropdown.data-api' , '.dropdown form' , function ( e ) { e.stopPropagation() } )
            // Handle clicks/touches on dropdown toggles
            .on( 'click.dropdown.data-api touchstart.dropdown.data-api' , toggle , Dropdown.prototype.toggle )
            // Handle keyboard navigation for toggles and menu items
            .on( 'keydown.dropdown.data-api touchstart.dropdown.data-api' , toggle + ', [role=menu]' , Dropdown.prototype.keydown ) ;
    } ) ;

}( window.jQuery ) ;

/*
 * =============================================================
 *     Bootstrap Scrollspy Component - Version 2.1.1
 *     Source: http://twitter.github.com/bootstrap/javascript.html#scrollspy
 * =============================================================
 *
 *     Copyright 2012 Twitter, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 * ==============================================================
 */


! function ( $ ) {

    "use strict" ; // jshint ;_;


    /*
     *  SCROLLSPY CLASS DEFINITION
     *  ==========================
     */

    function ScrollSpy ( element , options ) {
        var process = $.proxy( this.process , this ) ; // Create a proxy for the process method
        var $element = $( element ).is( 'body' ) ? $( window ) : $( element ) ; // Determine scroll element
        var href ; // Variable for href attribute

        this.options = $.extend( {} , $.fn.scrollspy.defaults , options ) ; // Merge options
        this.$scrollElement = $element.on( 'scroll.scroll-spy.data-api' , process ) ; // Attach scroll event listener

        // Construct the selector for navigation items
        this.selector = ( this.options.target
            || ( ( href = $( element ).attr( 'href' ) ) && href.replace( /.*(?=#[^\s]+$)/ , '' ) ) // Strip for IE7
            || '' ) + ' .nav li > a' ; // Append default nav item selector

        this.$body = $( 'body' ) ; // Reference to the body element
        this.refresh() ; // Initialize targets and offsets
        this.process() ; // Perform initial processing
    }

    ScrollSpy.prototype = {

        constructor : ScrollSpy // Set constructor property

        , refresh : function () {
            var self = this ; // Cache 'this' for use in callbacks
            var $targets ; // Variable to hold target elements

            this.offsets = $( [] ) ; // Initialize offsets as an empty jQuery object