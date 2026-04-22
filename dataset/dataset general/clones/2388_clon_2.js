//
// Dynamic Gallery Component
//
// (c) 2023 by Alex Johnson
//
// Implemented as a jQuery extension.
//

(function(jq) {

    jq.fn.vividCarousel = function(config) {

        var
            preferences = jq.extend({ // Default configuration parameters
                displayType: "fill",    // "fill" or "fit"
                panelWidth: '100%',     // Set 'auto' to match window dimensions, otherwise use 'px' or '%'
                panelHeight: '100%',    // Similarly for height
                overlayDesign: "grid",  // "grid", "block", "band" or "absent"
                backColor: "#111",
                autoAdvance: 5000,      // Zero to disable auto-play, positive number for interval in milliseconds
                randomizeOrder: false,  // Set true to randomize the sequence of visuals
                reveal: {visualEffect: 'dissolve', animationDuration: 1200}, // Effect details from jQuery UI
                conceal: {visualEffect: 'dissolve', animationDuration: 1200} // 'expand' or 'fall' are other options
            }, config),
            itemElements = this.find('li'),
            totalItems = itemElements.length,
            activeItemIndex = 0,
            advanceCarousel = function(actionData) {
                var moveDelta = 1;

                if (actionData) {
                    actionData.preventDefault();
                    moveDelta = actionData.data.moveDelta;
                }

                if (preferences.randomizeOrder) {
                    moveDelta = Math.floor(Math.random() * (totalItems - 1) + 1);
                }

                jq(itemElements[activeItemIndex]).hide(preferences.conceal);
                activeItemIndex = (((activeItemIndex + moveDelta) % totalItems) + totalItems) % totalItems;

                // Ensure element is visible before calculating dimensions
                jq(itemElements[activeItemIndex]).css({display: 'block'});
                adjustImageDimensions();
                jq(itemElements[activeItemIndex]).css({display: 'none'});
                jq(itemElements[activeItemIndex]).show(preferences.reveal);
            },
            browserWindow = jq(window),
            displayArea = this;

        // Apply background color to the main container
        displayArea.css('background-color', preferences.backColor);

        // Configure the overlay graphic
        this.find('.mask').css('background-image', preferences.overlayDesign == 'absent' ? 'none' : 'url(./assets/' + preferences.overlayDesign + '.png)');

        // Set up navigation buttons
        this.find('.nav.next').click({moveDelta: 1}, advanceCarousel);
        this.find('.nav.prev').click({moveDelta: -1}, advanceCarousel);

        // Initialize automatic progression if configured
        if (preferences.autoAdvance > 0)
            setInterval(advanceCarousel, preferences.autoAdvance);

        /**
         * Logic for adapting background image sizes.
         */
        function adjustImageDimensions() {

            // Determine dimensions for the gallery panel
            displayArea.width(preferences.panelWidth == 'auto' ? browserWindow.width() : preferences.panelWidth);
            displayArea.height(preferences.panelHeight == 'auto' ? browserWindow.height() : preferences.panelHeight);

            var areaWidth = displayArea.width();
            var areaHeight = displayArea.height();
            var areaProportion = areaWidth / areaHeight;

            var currentImage = jq(itemElements[activeItemIndex]).find("img"); // The currently visible image

            var executeResizing = function() {

                var imageProportion = currentImage.width() / currentImage.height();

                if ((areaProportion < imageProportion && preferences.displayType == 'fit') || (areaProportion >= imageProportion && preferences.displayType == 'fill')) {

                    currentImage.removeClass('tallest').addClass('widest').css({
                        // Calculate new vertical position
                        top: (areaHeight - areaWidth / imageProportion) / 2,
                        left: 0
                    });

                } else {

                    currentImage.removeClass('widest').addClass('tallest').css({
                        // Calculate new horizontal position
                        top: 0,
                        left: (areaWidth - imageProportion * areaHeight) / 2
                    });
                }
            };

            // Execute resizing directly if image is loaded, otherwise wait for load event
            currentImage.get(0).complete ? executeResizing() : currentImage.load(executeResizing);
        }

        // Attach resize handler to window and trigger it initially
        browserWindow.resize(adjustImageDimensions).trigger('resize');

        // Allow method chaining
        return this;
    };
}(jQuery));