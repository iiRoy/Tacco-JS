(function() {
    'use strict';

    // A registry holding the configurations for various social media platforms.
    // Each key identifies a platform, and its value contains a function to build the share URL
    // and an object specifying the dimensions for the popup window.
    const platformRegistry = new Map([
        ['pinterest', {
            urlConstructor: ({ externalLink, subjectText, mediaContent, sourceAffiliation }) => {
                let generatedAddress = 'http://pinterest.com/pin/create/button/?';
                if (externalLink) generatedAddress += `url=${encodeURIComponent(externalLink)}&`;
                if (mediaContent) generatedAddress += `media=${encodeURIComponent(mediaContent)}&`;
                if (subjectText) generatedAddress += `description=${encodeURIComponent(subjectText)}`;
                return generatedAddress;
            },
            portalDimensions: { horizontal: 685, vertical: 500 }
        }],
        ['facebook', {
            urlConstructor: ({ externalLink, mainTitle, subjectText, mediaContent, sourceAffiliation }) => {
                let generatedAddress = 'https://www.facebook.com/sharer/sharer.php?s=100';
                if (mainTitle) generatedAddress += `&p[title]=${encodeURIComponent(mainTitle)}`;
                if (subjectText) generatedAddress += `&p[summary]=${encodeURIComponent(subjectText)}`;
                if (externalLink) generatedAddress += `&p[url]=${encodeURIComponent(externalLink)}`;
                if (mediaContent) generatedAddress += `&p[images][0]=${encodeURIComponent(mediaContent)}`;
                return generatedAddress;
            },
            portalDimensions: { horizontal: 626, vertical: 436 }
        }],
        ['twitter', {
            urlConstructor: ({ externalLink, subjectText, sourceAffiliation }) => {
                let generatedAddress = 'https://twitter.com/share?';
                if (externalLink) generatedAddress += `url=${encodeURIComponent(externalLink)}&`;
                if (sourceAffiliation) generatedAddress += `via=${encodeURIComponent(sourceAffiliation)}&`;
                if (subjectText) generatedAddress += `text=${encodeURIComponent(subjectText)}`;
                return generatedAddress;
            },
            portalDimensions: { horizontal: 685, vertical: 500 }
        }],
        ['googleplus', { // Note: Google+ is deprecated, but cloning original functionality
            urlConstructor: ({ externalLink }) => {
                let generatedAddress = 'https://plus.google.com/share?';
                if (externalLink) generatedAddress += `url=${encodeURIComponent(externalLink)}`;
                return generatedAddress;
            },
            portalDimensions: { horizontal: 600, vertical: 600 }
        }],
        ['linkedin', {
            urlConstructor: ({ externalLink, mainTitle, subjectText, sourceAffiliation }) => {
                let generatedAddress = 'https://www.linkedin.com/shareArticle?mini=true';
                if (externalLink) generatedAddress += `&url=${encodeURIComponent(externalLink)}`;
                if (mainTitle) generatedAddress += `&title=${encodeURIComponent(mainTitle)}`;
                if (subjectText) generatedAddress += `&summary=${encodeURIComponent(subjectText)}`;
                if (sourceAffiliation) generatedAddress += `&source=${encodeURIComponent(sourceAffiliation)}`;
                return generatedAddress;
            },
            portalDimensions: { horizontal: 600, vertical: 600 }
        }]
    ]);

    // Function to launch a new browser window, centering it on the screen.
    const launchAuxiliaryDisplay = (dimensions, targetUrl) => {
        const leftPosition = (window.innerWidth / 2) - (dimensions.horizontal / 2);
        const topPosition = (window.innerHeight / 2) - (dimensions.vertical / 2);

        const windowFeatures = [
            'toolbar=no', 'location=no', 'directories=no', 'status=no', 'menubar=no',
            'scrollbars=no', 'resizable=no', 'copyhistory=no',
            `width=${dimensions.horizontal}`, `height=${dimensions.vertical}`,
            `top=${topPosition}`, `left=${leftPosition}`
        ].join(', ');

        return window.open(targetUrl, '', windowFeatures);
    };

    // The primary function to initialize social sharing functionality on selected elements.
    // It takes a CSS selector string to identify the elements.
    window.activateSocialLinks = (elementSelector = '[data-type]') => {
        const targetElements = document.querySelectorAll(elementSelector);

        if (targetElements.length === 0) {
            console.warn('No DOM elements found for social link activation using selector:', elementSelector);
            return;
        }

        targetElements.forEach(currentElement => {
            const channelIdentifier = currentElement.dataset.type;
            const activeChannel = platformRegistry.get(channelIdentifier);

            if (!activeChannel) {
                console.error(`Unknown social channel type "${channelIdentifier}" for element:`, currentElement);
                return;
            }

            const dataPayload = {
                externalLink: currentElement.dataset.url || '',
                mainTitle: currentElement.dataset.title || '',
                subjectText: currentElement.dataset.description || '',
                mediaContent: currentElement.dataset.media || '',
                sourceAffiliation: currentElement.dataset.via || ''
            };

            const finalShareUrl = activeChannel.urlConstructor(dataPayload);

            // State variable to distinguish between a tap/click and a drag/scroll gesture.
            let wasMovementDetected = false;

            currentElement.addEventListener('pointerdown', () => {
                wasMovementDetected = false; // Reset on initial touch/mouse press
            });

            currentElement.addEventListener('pointermove', () => {
                wasMovementDetected = true; // Mark as movement if pointer moves
            });

            currentElement.addEventListener('pointerup', event => {
                if (wasMovementDetected) {
                    return; // If movement occurred, it was a drag/scroll, not a tap, so do nothing.
                }
                event.preventDefault(); // Prevent default navigation/click behavior.
                launchAuxiliaryDisplay(activeChannel.portalDimensions, finalShareUrl);
            });

            // A fallback click handler, primarily for non-pointer event environments or keyboard interaction.
            // It also ensures that if a `pointerup` didn't prevent default (e.g., if `wasMovementDetected` was true),
            // this `click` event won't trigger an unwanted share.
            currentElement.addEventListener('click', event => {
                if (wasMovementDetected) {
                    event.preventDefault(); // If it was a drag, prevent the click from acting.
                    return;
                }
                event.preventDefault();
                launchAuxiliaryDisplay(activeChannel.portalDimensions, finalShareUrl);
            });
        });
    };

    // The user would call `window.activateSocialLinks('.my-share-button-class');`
    // or `window.activateSocialLinks();` if the default selector `[data-type]` is sufficient.

})();