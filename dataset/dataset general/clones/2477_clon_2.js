/*
 * Adaptive Layout Utility v1.0
 * Facilitates the coexistence of an established "full-size" web design with a "responsive design",
 * while also enabling the full-size design to be presented at a different breakpoint on "portable devices" –
 * useful for displaying the full-size site on tablets, for instance.
 *
 * Provides an object containing the full-size (adaptiveLayout.wide) and optional portable (adaptiveLayout.narrow)
 * media queries as string values for dynamic media query handling with JavaScript;
 * for example, by integrating with libraries like enquire.js (http://wickynilliams.github.com/enquire.js).
 *
 *
 * Directions for Use:
 * 1. Configure the viewport with: <meta name="viewport" content="width=device-width, initial-scale=1" />
 * 2. Link to the existing full-size stylesheet using a <link> tag with an appropriate media query,
 *    e.g., media="all and (min-width: 990px)" and class="adaptive-wide"
 * 3. Link to the new responsive stylesheet using a <link> tag with an appropriate media query,
 *    e.g., media="all and (max-width: 989px)" and class="adaptive-narrow"
 * 4. Optionally add a data-break-point-width="XXX" attribute to the full-size stylesheet <link>,
 *    where XXX is the pixel width at which the full-size layout will activate on portable devices –
 *    e.g., 768 for tablet devices.
 * 5. Optionally add a data-view-target-width="XXX" attribute to the full-size stylesheet <link>,
 *    where XXX is the pixel width that the full-size viewport will be configured to on portable devices.
 * 6. Optionally add a data-force-debug="true" attribute to the full-size stylesheet <link>
 *    to activate the custom breakpoint for non-touch devices.
 *
 * Proprietary information (c) 2013 Izilla Partners Pty Ltd
 *
 * http://www.izilla.com.au
 *
 * Distributed under the MIT license
 */
;( function() {
    // Check for essential browser capabilities before proceeding
    if ( !document.querySelector || !document.getElementsByClassName || typeof( document.documentElement.clientWidth ) === 'undefined' ) {
        return;
    }

    // Retrieve key DOM elements and attributes
    var viewportTag = document.querySelector( 'meta[name="viewport"]' ),
        largeScreenLinks = document.getElementsByClassName( 'adaptive-wide' ),
        smallScreenLinks = document.getElementsByClassName( 'adaptive-narrow' );

    // If any required elements are missing, exit gracefully
    if ( !viewportTag || largeScreenLinks.length === 0 || smallScreenLinks.length === 0 ) {
        return;
    }

    // Declare and initialize configuration variables
    var isTouchCapable = 'ontouchstart' in window,
        attributeName = 'content',
        queryAttribute = 'media',
        originalViewContent = viewportTag && viewportTag.getAttribute( attributeName ),
        wideScreenContent = 'width=980',
        delayTime = 250,
        canOrientChange = 'onorientationchange' in window,
        orientationTrigger = canOrientChange ? 'orientationchange' : 'resize',
        wideScreenQuery = largeScreenLinks[0].getAttribute( queryAttribute ),
        narrowScreenQuery = smallScreenLinks[0].getAttribute( queryAttribute ),
        userDefinedBreakpoint = largeScreenLinks[0].getAttribute( 'data-break-point-width' ),
        effectiveBreakpoint,
        userDefinedViewport = largeScreenLinks[0].getAttribute( 'data-view-target-width' ),
        debugOverride = largeScreenLinks[0].getAttribute( 'data-force-debug' ),
        layoutQueries = {};

    // Determine the effective breakpoint based on touch capability or debug flag
    if ( isTouchCapable || debugOverride === 'true' ) {
        if ( userDefinedBreakpoint ) {
            effectiveBreakpoint = userDefinedBreakpoint;
        } else {
            // Extract breakpoint from the wide screen media query
            effectiveBreakpoint = wideScreenQuery.replace( /.*?min-width:\s?(\d*).*/g, '$1' );
        }

        // Adjust viewport content if a user-defined viewport width is provided and valid
        if ( userDefinedViewport && parseInt( userDefinedViewport ) >= parseInt( effectiveBreakpoint ) ) {
            wideScreenContent = wideScreenContent.replace( /\d+/, userDefinedViewport );
        } else {
            // Otherwise, use the effective breakpoint if it's greater than the default
            if ( effectiveBreakpoint > 980 ) {
                wideScreenContent = wideScreenContent.replace( /\d+/, effectiveBreakpoint );
            }
        }
    } else {
        // For non-touch devices without debug override, extract breakpoint from the media query
        effectiveBreakpoint = wideScreenQuery.replace( /.*?min-width:\s?(\d*).*/g, '$1' );
    }

    // Update media query strings with the determined effective breakpoint
    wideScreenQuery = wideScreenQuery.replace( /(min-width:\s?)\d*/g, '$1' + effectiveBreakpoint );
    narrowScreenQuery = narrowScreenQuery.replace( /(max-width:\s?)\d*/g, '$1' + ( parseInt( effectiveBreakpoint ) - 1 ) );

    // Store the finalized media queries in the return object
    layoutQueries.wide = wideScreenQuery;
    layoutQueries.narrow = narrowScreenQuery;

    // Apply updated media queries to the link tags if touch-capable or debug is active
    if ( isTouchCapable || debugOverride === 'true' ) {
        for ( var idx = 0; idx < largeScreenLinks.length; idx++ ) {
            largeScreenLinks[idx].setAttribute( queryAttribute, wideScreenQuery );
        }

        for ( var k = 0; k < smallScreenLinks.length; k++ ) {
            smallScreenLinks[k].setAttribute( queryAttribute, narrowScreenQuery );
        }
    }

    // Set up dynamic viewport switching for touch devices
    if ( isTouchCapable ) {
        function adjustViewportSettings() {
            viewportTag.setAttribute( attributeName, originalViewContent );
            window.setTimeout( function() {
                if ( document.documentElement.clientWidth >= effectiveBreakpoint ) {
                    viewportTag.setAttribute( attributeName, wideScreenContent );
                }
            }, delayTime );
        }

        // Initial adjustment and event listener setup
        adjustViewportSettings();
        window.addEventListener( orientationTrigger, adjustViewportSettings, false );
    }

    // Return the generated media query strings
    return layoutQueries;

}() );