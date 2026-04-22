// Custom script for dynamic content presentation initialization.
// This module sets up multiple image carousels using jQuery and the Cycle plugin,
// ensuring a smooth user experience upon document readiness.

jQuery(function($) { // Standard jQuery document ready shorthand, aliasing jQuery to $
    // Centralized configuration object for carousel plugin options.
    // This promotes reusability and simplifies updates across multiple instances.
    const sharedCarouselOptions = {
        transitionEffect: 'fade', // Defines the visual transition between slides (e.g., 'fade', 'scrollLeft', etc.)
        adjustContainerSize: false, // Prevents the carousel container from resizing based on slide dimensions
        displayWidth: '100%', // Ensures the carousel occupies the full width of its parent container
        fitToParent: true, // Scales slides to fit within the carousel's dimensions
        // Function to generate the HTML markup for each navigation anchor within the pager.
        navigationLinkGenerator: function(entryIndex, domElementRef) {
            // The base URL for the navigation link. This could be dynamically generated if needed.
            const destinationPageSegment = 'cpage_7#';
            return '<li><a href="' + destinationPageSegment + '"></a></li>';
        }
    };

    // Data structure defining each distinct image gallery to be initialized.
    // Each object specifies the target element and its corresponding navigation pager ID.
    const galleryConfigurations = [
        {
            mainElementSelector: '#imageGalleryAlpha', // Unique identifier for the first image gallery
            associatedPagerId: 'navContainerAlpha'    // Unique identifier for the first gallery's navigation pager
        },
        {
            mainElementSelector: '#imageGalleryBeta',  // Unique identifier for the second image gallery
            associatedPagerId: 'navContainerBeta'     // Unique identifier for the second gallery's navigation pager
        },
        {
            mainElementSelector: '#imageGalleryGamma', // Unique identifier for the third image gallery
            associatedPagerId: 'navContainerGamma'    // Unique identifier for the third gallery's navigation pager
        }
    ];

    // Iterate through each defined gallery configuration to set up its carousel instance.
    galleryConfigurations.forEach(function(currentGalleryDef) {
        const galleryTarget = $(currentGalleryDef.mainElementSelector);
        const pagerMarkupString = '<ul id="' + currentGalleryDef.associatedPagerId + '"></ul>';

        // Implement a basic guard clause to ensure the target element exists before attempting initialization.
        if (galleryTarget.length > 0) {
            // Append the pager container immediately after the main gallery element.
            // Then, initialize the Cycle plugin on the gallery, merging shared options with specific pager linkage.
            galleryTarget
                .after(pagerMarkupString)
                .cycle(Object.assign({}, sharedCarouselOptions, {
                    // Explicitly link the carousel to its newly created pager element.
                    pager: '#' + currentGalleryDef.associatedPagerId
                }));
        } else {
            // Log a warning if a specified gallery element cannot be found in the DOM.
            console.warn('Initialization skipped: Target element not found for selector "' + currentGalleryDef.mainElementSelector + '".');
        }
    });

    // Note: Original commented-out options (e.g., prev, next) have been removed
    // to streamline the configuration and reflect a more focused implementation.
});