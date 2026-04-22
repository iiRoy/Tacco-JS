/*
 * Core JavaScript functionalities for dynamic UI and external service integration.
 * This script manages header behavior on scroll, smooth page navigation,
 * and the initialization of a custom-styled Google Map.
 */

// Configuration constants for the header behavior on page scroll.
const HEADER_SCROLL_THRESHOLD_PIXELS = 50; // Distance scrolled from top before header changes.
const MAIN_NAVIGATION_BAR_IDENTIFIER = ".main-app-nav"; // Selector for the main navigation element.
const FIXED_PAGE_HEADER_SELECTOR = ".sticky-header-component"; // Selector for the element that receives the scroll class.
const ACTIVATED_SCROLL_CLASS = "header-contracted"; // CSS class applied when scrolled past threshold.

// Guard clause: Ensure jQuery library is loaded before attempting to use it.
if (typeof jQuery !== 'undefined') {

    /**
     * Handles the dynamic styling of the page header based on scroll position.
     * Applies a specific CSS class to a fixed header component when the user
     * scrolls past a defined vertical threshold.
     */
    jQuery(window).on('scroll', function() {
        // Retrieve the current vertical scroll position of the document.
        const currentDocumentScrollY = jQuery(document).scrollTop();

        // Target the specific header component that needs dynamic styling.
        const headerElementToModify = jQuery(FIXED_PAGE_HEADER_SELECTOR);

        // If the target header element is not found, exit the function to prevent errors.
        if (headerElementToModify.length === 0) {
            // console.warn("Fixed header component not found for scroll-based styling:", FIXED_PAGE_HEADER_SELECTOR);
            return;
        }

        // Determine whether the 'scrolled' class should be active.
        const shouldHeaderBeContracted = currentDocumentScrollY > HEADER_SCROLL_THRESHOLD_PIXELS;

        // Add or remove the class based on the scroll state.
        headerElementToModify.toggleClass(ACTIVATED_SCROLL_CLASS, shouldHeaderBeContracted);
    });


    /**
     * Initializes smooth scrolling functionality for anchor links.
     * This feature requires jQuery Easing plugin for 'easeInOutExpo' animation.
     */
    jQuery(document).ready(function() {
        // Animation parameters for smooth scrolling.
        const SCROLL_ANIMATION_DURATION_MS = 1500;
        const SCROLL_EASING_EFFECT = 'easeInOutExpo';
        // Selector for all links intended for smooth page navigation.
        const SMOOTH_ANCHOR_LINKS_SELECTOR = '.scrollable-section-link a';

        // Attach a click event handler to all identified smooth scroll links.
        jQuery(SMOOTH_ANCHOR_LINKS_SELECTOR).on('click', function(eventObject) {
            const clickedAnchorElement = jQuery(this);
            const targetHashIdentifier = clickedAnchorElement.attr('href');

            // Immediately prevent the browser's default jump-to-anchor behavior.
            eventObject.preventDefault();

            // Validate the target: ensure it's a valid hash and not empty.
            if (!targetHashIdentifier || targetHashIdentifier.charAt(0) !== '#') {
                // console.error("Invalid or non-local hash target for smooth scroll:", targetHashIdentifier);
                return; // Abort if target is not a valid local anchor.
            }

            // Find the element corresponding to the hash identifier.
            const destinationElement = jQuery(targetHashIdentifier);

            // Verify that the target element actually exists on the page.
            if (destinationElement.length === 0) {
                // console.warn("Target element for smooth scroll not found:", targetHashIdentifier);
                return; // Abort if the destination element is missing.
            }

            // Calculate the vertical offset of the destination element.
            const scrollDestinationOffset = destinationElement.offset().top;

            // Perform the animated scroll. 'stop(true, true)' clears any previous animations.
            jQuery('html, body').stop(true, true).animate({
                scrollTop: scrollDestinationOffset
            }, SCROLL_ANIMATION_DURATION_MS, SCROLL_EASING_EFFECT);
        });
    });

} else {
    // console.error("jQuery is not loaded. Some UI features will be disabled.");
}

// --- Google Maps Customization and Initialization ---
// This section handles the setup of a Google Map instance with a unique visual theme.
// The custom styles are typically obtained from resources like Snazzy Maps.

// Validate that the Google Maps API has been successfully loaded.
if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {

    // Geographical coordinates for the map's initial center point.
    const MAP_CENTER_LATITUDE = 53.385873;
    const MAP_CENTER_LONGITUDE = -1.471471;
    const INITIAL_MAP_ZOOM = 15; // The default zoom level when the map loads.

    // A utility function to create a Google Maps LatLng object.
    const generateLatLngObject = (latitude, longitude) => new google.maps.LatLng(latitude, longitude);

    // Array defining the custom visual appearance for the Google Map.
    // This theme applies a dark, high-contrast aesthetic.
    const customMapThemeDefinition = [{
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 17
        }]
    }, {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 20
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 17
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 29
        }, {
            "weight": 0.2
        }]
    }, {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 18
        }]
    }, {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 16
        }]
    }, {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 21
        }]
    }, {
        "elementType": "labels.text.stroke",
        "stylers": [{
            "visibility": "on"
        }, {
            "color": "#000000"
        }, {
            "lightness": 16
        }]
    }, {
        "elementType": "labels.text.fill",
        "stylers": [{
            "saturation": 36
        }, {
            "color": "#000000"
        }, {
            "lightness": 40
        }]
    }, {
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 19
        }]
    }, {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 20
        }]
    }, {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 17
        }, {
            "weight": 1.2
        }]
    }];

    // Object containing all necessary configuration options for the map.
    const mapDisplayConfiguration = {
        zoom: INITIAL_MAP_ZOOM,
        center: generateLatLngObject(MAP_CENTER_LATITUDE, MAP_CENTER_LONGITUDE),
        mapTypeId: google.maps.MapTypeId.ROADMAP, // Standard roadmap view.
        disableDefaultUI: true, // Hides all default UI controls (zoom, pan, etc.).
        styles: customMapThemeDefinition // Applies the custom dark theme.
    };

    /**
     * Function responsible for creating and returning a new Google Map instance.
     * It requires a DOM element ID where the map should be rendered.
     * @returns {google.maps.Map|null} The initialized map instance or null if an error occurred.
     */
    function initializeTheCustomGoogleMap() {
        const mapContainerElementId = 'map'; // The ID of the HTML element to host the map.
        const mapRenderTarget = document.getElementById(mapContainerElementId);

        // Perform a crucial check to ensure the target DOM element exists.
        if (!mapRenderTarget) {
            // console.error(`Map container element with ID '${mapContainerElementId}' was not found in the DOM.`);
            return null; // Cannot initialize map without its container.
        }

        // Instantiate and return the new Google Map object.
        return new google.maps.Map(mapRenderTarget, mapDisplayConfiguration);
    }

    // Use jQuery's document ready function to ensure the DOM is fully loaded
    // before attempting to initialize the map, preventing issues with element access.
    jQuery(document).ready(function() {
        // Store the created map instance, potentially for later manipulation.
        window.activeGoogleMapInstance = initializeTheCustomGoogleMap();

        // Optional: Add a check to confirm successful map initialization.
        // if (window.activeGoogleMapInstance) {
        //     console.info("Google Map successfully initialized with custom styling.");
        // } else {
        //     console.error("Failed to initialize Google Map.");
        // }
    });

} else {
    // console.warn("Google Maps API is not available. Map display functionality will be disabled.");
}