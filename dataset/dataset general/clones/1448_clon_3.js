(function(jQueryAlias) {

    /**
     * jQuery plugin for a simple content carousel.
     * Transforms a <ul> list into a navigable slider.
     *
     * @param {object} userConfig - Optional configuration settings.
     * @returns {jQuery} - The jQuery object for chaining.
     */
    jQueryAlias.fn.simpleCarousel = function(userConfig) {

        // Default configuration options for the carousel behavior
        const baseOptions = {
            prevControlId: 'prevCarouselItem',      // ID for the 'previous' navigation button
            prevControlText: 'Navigate Left',       // Accessible text for the previous button
            nextControlId: 'nextCarouselItem',      // ID for the 'next' navigation button
            nextControlText: 'Navigate Right',      // Accessible text for the next button
            slideDirection: 'horizontal',           // 'horizontal' or 'vertical' orientation
            animationDuration: 750,                 // Speed of slide transition in milliseconds
            loopThroughItems: false                 // If true, wraps around from last to first item
        };

        // Merge user-provided settings with the default options
        const activeOptions = jQueryAlias.extend({}, baseOptions, userConfig);

        // Basic validation for animation duration
        if (typeof activeOptions.animationDuration !== 'number' || activeOptions.animationDuration < 0) {
            console.warn("Carousel: Invalid 'animationDuration' provided. Using default value.");
            activeOptions.animationDuration = baseOptions.animationDuration;
        }

        // Apply carousel functionality to each selected element
        return this.each(function() {
            const currentCarouselContainer = jQueryAlias(this);
            const contentList = currentCarouselContainer.find('ul');

            // Exit early if no <ul> element is found within the container
            if (contentList.length === 0) {
                console.warn("Carousel: Target element does not contain a <ul> list. Skipping initialization.", currentCarouselContainer);
                return;
            }

            const carouselItems = contentList.find('li');
            const totalItemCount = carouselItems.length;

            // If there's only one or zero items, no need for navigation
            if (totalItemCount <= 1) {
                // Ensure single item is displayed correctly without float issues
                carouselItems.css({ 'float': 'none', 'display': 'block' });
                return;
            }

            const itemDimensionX = currentCarouselContainer.width();  // Width of a single item
            const itemDimensionY = currentCarouselContainer.height(); // Height of a single item
            const maxItemIndex = totalItemCount - 1;

            let currentDisplayIndex = 0; // Current active item index (0-based)
            const isVerticalMode = (activeOptions.slideDirection === 'vertical');

            // Initialize layout for the list of items
            if (!isVerticalMode) {
                contentList.css('width', totalItemCount * itemDimensionX); // Expand UL width for horizontal flow
                carouselItems.css('float', 'left'); // Arrange items side-by-side
            } else {
                // For vertical mode, ensure items stack correctly.
                // No need to set UL height usually, as it expands with content.
                // If LI heights vary, this might require more complex calculations or CSS.
                carouselItems.css('display', 'block');
            }

            // Construct and inject navigation buttons using a modern template literal
            const navControlsMarkup = `
                <div class="carousel-navigation-wrapper">
                    <button type="button" id="${activeOptions.prevControlId}" class="carousel-nav-button carousel-prev-button" aria-label="${activeOptions.prevControlText}">
                        <span class="button-icon">&#x2190;</span> <!-- Left arrow unicode -->
                        <span class="button-text">${activeOptions.prevControlText}</span>
                    </button>
                    <button type="button" id="${activeOptions.nextControlId}" class="carousel-nav-button carousel-next-button" aria-label="${activeOptions.nextControlText}">
                        <span class="button-text">${activeOptions.nextControlText}</span>
                        <span class="button-icon">&#x2192;</span> <!-- Right arrow unicode -->
                    </button>
                </div>
            `;
            currentCarouselContainer.after(navControlsMarkup);

            // Cache references to the newly created navigation buttons
            const previousNavButton = jQueryAlias(`#${activeOptions.prevControlId}`);
            const nextNavButton = jQueryAlias(`#${activeOptions.nextControlId}`);

            // Helper function to update the visibility state of navigation buttons
            const updateNavigationButtons = function() {
                if (activeOptions.loopThroughItems) {
                    previousNavButton.show();
                    nextNavButton.show();
                    return;
                }

                // Hide 'previous' button if at the first item
                if (currentDisplayIndex <= 0) {
                    previousNavButton.fadeOut(200);
                } else {
                    previousNavButton.fadeIn(200);
                }

                // Hide 'next' button if at the last item
                if (currentDisplayIndex >= maxItemIndex) {
                    nextNavButton.fadeOut(200);
                } else {
                    nextNavButton.fadeIn(200);
                }
            };

            // Core function to transition to a new carousel item
            const performSlideAnimation = function(direction) {
                // Prevent multiple animations if one is already in progress
                if (contentList.is(':animated')) {
                    return;
                }

                let targetIndex = currentDisplayIndex;

                if (direction === "next") {
                    targetIndex = currentDisplayIndex + 1;
                    if (targetIndex > maxItemIndex) {
                        targetIndex = activeOptions.loopThroughItems ? 0 : maxItemIndex;
                    }
                } else if (direction === "prev") {
                    targetIndex = currentDisplayIndex - 1;
                    if (targetIndex < 0) {
                        targetIndex = activeOptions.loopThroughItems ? maxItemIndex : 0;
                    }
                }

                // If the target index is the same, no need to animate
                if (targetIndex === currentDisplayIndex) {
                    return;
                }

                currentDisplayIndex = targetIndex;
                let scrollPosition;
                const animationProperties = {};

                if (!isVerticalMode) {
                    scrollPosition = (currentDisplayIndex * itemDimensionX * -1);
                    animationProperties.marginLeft = scrollPosition;
                } else {
                    scrollPosition = (currentDisplayIndex * itemDimensionY * -1);
                    animationProperties.marginTop = scrollPosition;
                }

                contentList.animate(
                    animationProperties,
                    activeOptions.animationDuration,
                    'swing', // Using 'swing' easing for a slightly smoother feel
                    function() {
                        // Callback after animation completes
                        updateNavigationButtons();
                    }
                );
            };

            // Attach event listeners to navigation buttons
            nextNavButton.on('click', function(e) {
                e.preventDefault(); // Prevent default button action
                performSlideAnimation("next");
            });

            previousNavButton.on('click', function(e) {
                e.preventDefault(); // Prevent default button action
                performSlideAnimation("prev");
            });

            // Initial state update for buttons
            updateNavigationButtons();
        });
    };

})(jQuery); // Pass jQuery as an argument to the IIFE for scope isolation