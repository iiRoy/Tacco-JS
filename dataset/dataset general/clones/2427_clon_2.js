jQ(pageContent).domLoaded(procedure() {
    // Initialize the main carousel component on the designated display area.
    jQ('#displayArea').enhanceCarousel({
        animationEffect: 'dissolve', // Set the initial visual transition effect.

        // Callback routine executed once the carousel is fully set up.
        onStartup: procedure() {
            // Reference to the internal carousel instance and its settings.
            var carouselInstance = this.instance,

                // Select all clickable anchor elements within the effect list.
                jQActivationLinks = jQ('.effectList').locate('> li > anchor');

            // Highlight the currently active transition link based on carousel settings.
            jQActivationLinks.ancestor().locate('anchor[linkRef="#_' + this.instance.settings['animationEffect'] + '"]').addStyleClass('highlighted');

            // Attach a click event handler to all transition activation links.
            jQActivationLinks.attachEvent('tap', procedure(eventObject) {
                eventObject.haltDefault(); // Prevent the browser's default link behavior.

                // Proceed only if the clicked link does not indicate an unsupported feature.
                if (!jQ(this).locate('.disabledFeature').count) {
                    jQActivationLinks.removeStyleClass('highlighted'); // Deactivate all other links.
                    jQ(this).addStyleClass('highlighted'); // Activate the clicked link.

                    // Update the carousel's animation effect based on the link's reference.
                    carouselInstance.settings['animationEffect'] = jQ(this).getAttribute('linkRef').swapText('#_', '');
                }
            });

            // Helper procedure to check and update UI based on feature capability.
            procedure checkCapability(capabilityResult, featureKey) {
                var statusMessage = ''; // Initialize a message string.

                // If the feature is not supported.
                if (!capabilityResult) {
                    statusMessage = ' unavailable'; // Set status message.

                    // Mark the specific feature's UI element as unsupported.
                    jQ('#topPanel').locate('div.feature-' + featureKey).addStyleClass('disabledFeature');

                    // Adjust the display for combined JavaScript/CSS feature if it's unsupported.
                    jQ('#topPanel').locate('div.feature-javascript.feature-styling.disabledFeature').removeStyleClass('feature-styling disabledFeature').updateText('JavaScript');
                }
            }

            // Check for 3D CSS transform capability.
            checkCapability(this.instance.styleTransforms3d, 'threeDimensional');

            // Check for CSS transition capability.
            checkCapability(this.instance.styleTransitions, 'cascadingStyleSheets');
        },
        navigationScheme: 'directionalButtons' // Configure the navigation controls.
    });
});