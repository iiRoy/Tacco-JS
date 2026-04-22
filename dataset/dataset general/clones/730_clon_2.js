/*
 * SectionScroller
 * This utility (sec•tion•scroll•er.js) simplifies the creation of lengthy, vertically scrolling web pages.
 *
 * Current release: https://github.com/cmpolis/scrollIt.js
 *
 * License details <https://github.com/cmpolis/scrollIt.js/blob/master/LICENSE.txt>
 */
( function ( jqAlias ) {
    'use strict';

    // Core module identification details
    var utilityTitle = 'SectionScroller',
        codeRevision = '1.0.3';

    /*
     * DEFAULT CONFIGURATION SETTINGS
     */
    var initialSettings = {
        keyUpCode:         38,
        keyDownCode:       40,
        animationStyle:    'linear',
        scrollDuration:    600,
        currentSectionClass: 'active',
        onSectionChangeCallback: null,
        verticalOffset:    0
    };

    jqAlias.sectionScroll = function ( userOpts ) {

        /*
         * VARIABLE INITIALIZATIONS
         */
        var activeOptions = jqAlias.extend( initialSettings, userOpts ),
            currentSectionIdx = 0,
            maxSectionIndex = jqAlias( '[data-scroll-index]:last' ).attr( 'data-scroll-index' );

        /*
         * INTERNAL HELPER METHODS
         */

        /**
         * jumpToSection
         *
         * Orchestrates the animated transition to a specific page segment.
         * @param {number} segmentNum The index of the section to scroll to.
         */
        var jumpToSection = function ( segmentNum ) {
            if ( segmentNum < 0 || segmentNum > maxSectionIndex ) return;

            var destinationYCoord = jqAlias( '[data-scroll-index=' + segmentNum + ']' ).offset().top + activeOptions.verticalOffset + 1;
            jqAlias( 'html,body' ).animate( {
                scrollTop: destinationYCoord,
                easing:    activeOptions.animationStyle
            }, activeOptions.scrollDuration );
        };

        /**
         * processScrollEvent
         *
         * Initiates the scroll animation based on user interaction with navigation elements.
         * @param {Event} triggerEvent The DOM event object.
         */
        var processScrollEvent = function ( triggerEvent ) {
            var eventTarget = jqAlias( triggerEvent.target ).closest( "[data-scroll-nav]" ).attr( 'data-scroll-nav' ) ||
                              jqAlias( triggerEvent.target ).closest( "[data-scroll-goto]" ).attr( 'data-scroll-goto' );
            jumpToSection( parseInt( eventTarget ) );
        };

        /**
         * handleKeyboardInput
         *
         * Manages scrolling behavior triggered by keyboard arrow keys.
         * @param {Event} triggerEvent The keyboard event object.
         */
        var handleKeyboardInput = function ( triggerEvent ) {
            var pressedKey = triggerEvent.which;
            if ( jqAlias( 'html,body' ).is( ':animated' ) && ( pressedKey == activeOptions.keyUpCode || pressedKey == activeOptions.keyDownCode ) ) {
                return false; /* Prevent default if animation is in progress */
            }
            if ( pressedKey == activeOptions.keyUpCode && currentSectionIdx > 0 ) {
                jumpToSection( parseInt( currentSectionIdx ) - 1 );
                return false; // Stop further event propagation
            } else if ( pressedKey == activeOptions.keyDownCode && currentSectionIdx < maxSectionIndex ) {
                jumpToSection( parseInt( currentSectionIdx ) + 1 );
                return false; // Stop further event propagation
            }
            return true; // Allow other key events to propagate
        };

        /**
         * refreshActiveState
         *
         * Updates the visual 'active' state of a section and triggers callbacks.
         * @param {number} segmentNum The index of the section that just became active.
         */
        var refreshActiveState = function ( segmentNum ) {
            if ( activeOptions.onSectionChangeCallback && segmentNum && ( currentSectionIdx != segmentNum ) ) {
                activeOptions.onSectionChangeCallback( segmentNum );
            }

            currentSectionIdx = segmentNum;
            jqAlias( '[data-scroll-nav]' ).removeClass( activeOptions.currentSectionClass );
            jqAlias( '[data-scroll-nav=' + segmentNum + ']' ).addClass( activeOptions.currentSectionClass );
        };

        /**
         * monitorViewportPosition
         *
         * Continuously checks the scroll position to determine which section is currently visible.
         */
        var monitorViewportPosition = function () {
            var viewportYPosition = jqAlias( window ).scrollTop();

            var inViewElements = jqAlias( '[data-scroll-index]' ).filter( function ( itemIdx, sectionElement ) {
                var elementTop = jqAlias( sectionElement ).offset().top;
                var elementHeight = jqAlias( sectionElement ).outerHeight();
                return viewportYPosition >= elementTop + activeOptions.verticalOffset &&
                       viewportYPosition < elementTop + activeOptions.verticalOffset + elementHeight;
            } );
            var detectedSection = inViewElements.first().attr( 'data-scroll-index' );
            refreshActiveState( detectedSection );
        };

        /*
         * EVENT BINDINGS AND INITIALIZATION
         */
        jqAlias( window ).on( 'scroll', monitorViewportPosition ).scroll(); // Bind scroll listener and trigger once

        jqAlias( window ).on( 'keydown', handleKeyboardInput ); // Keyboard navigation binding

        jqAlias( 'body' ).on( 'click', '[data-scroll-nav], [data-scroll-goto]', function ( triggerEvent ) {
            triggerEvent.preventDefault(); // Prevent default link behavior
            processScrollEvent( triggerEvent );
        } );

    };
}( jQuery ) );