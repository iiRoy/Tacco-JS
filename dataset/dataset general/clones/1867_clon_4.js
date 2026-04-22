(function(jQ) {

    // Centralized state repository, replacing direct DOM data attributes
    const globalMotionRegistry = {
        _activeEntry: false,
        _activeExit: false,
        _elementChain: [], // Stores references to elements or class names in their entry order
        _entryOrderSequence: [], // Represents the 'alphain' sequence (a, b, c...)
        _exitOrderSequence: [], // Represents the 'alphaout' sequence (reversed entry order)
        _modeType: 'class', // 'class' or 'children'
        _speedFactor: 500, // Animation duration
        _motionEase: 'linear', // Easing function
        _displayRule: 'block', // CSS display style for shown elements
        _containerReference: null // Reference to the main jQuery object
    };

    // Default configuration values for the visual transition mechanism
    const standardVisuals = {
        visualMode: 'class', // Determines if elements are identified by class ('class') or direct children ('children')
        transitionSpeed: 500, // Duration of individual fade animations in milliseconds
        easingFunction: 'linear', // Easing function for animations
        displayStyle: 'block', // CSS display property for elements once faded in
        showOverlay: true, // Boolean to control preloader visibility
        overlayImage: 'loading.gif', // Path to the preloader image
        overlayWidth: 50, // Width of the preloader image/container
        overlayHeight: 50, // Height of the preloader image/container
        customOverlayMarkup: '', // Custom HTML string for the preloader, overrides image settings
        onFinish: '' // Callback string or function to execute upon completion of entry animation
    };

    // Main plugin function, extending jQuery's prototype
    jQ.fn.visualTransition = function(settings) {
        // Merge provided settings with defaults using Object.assign for divergence
        const currentConfig = Object.assign({}, standardVisuals, settings);

        // Populate the global state repository with current configuration
        globalMotionRegistry._modeType = currentConfig.visualMode;
        globalMotionRegistry._speedFactor = currentConfig.transitionSpeed;
        globalMotionRegistry._motionEase = currentConfig.easingFunction;
        globalMotionRegistry._displayRule = currentConfig.displayStyle;
        globalMotionRegistry._containerReference = this; // Store the jQuery object that the plugin was called on

        // Generate the alphabetical sequence (a-z) for 'class' mode
        globalMotionRegistry._entryOrderSequence = Array.from({length: 26}, (_, i) => String.fromCharCode(97 + i));

        // Construct and display the preloader if enabled
        if (currentConfig.showOverlay) {
            let overlayHtml;
            if (currentConfig.customOverlayMarkup === '') {
                overlayHtml = `<div class="visual-preloader" style="position:absolute;top:50%;left:50%;width:${currentConfig.overlayWidth}px;height:${currentConfig.overlayHeight}px; margin:-${Math.round(currentConfig.overlayHeight/2)}px 0 0 -${Math.round(currentConfig.overlayWidth/2)}px;"><img src="${currentConfig.overlayImage}" border="0" width="${currentConfig.overlayWidth}" height="${currentConfig.overlayHeight}" /></div>`;
            } else {
                overlayHtml = currentConfig.customOverlayMarkup;
            }
            jQ('body').prepend(overlayHtml);
        }

        // Recursive function to sequentially fade in elements
        function commenceEntry(idx, completionCallback) {
            // Only proceed if no exit animation is currently active
            if (globalMotionRegistry._activeExit === false) {
                globalMotionRegistry._activeEntry = true; // Set entry animation flag
                const nextIdx = idx + 1;
                let targetElement;
                let elementIdentifier; // Stores either class name (for 'class' mode) or DOM element (for 'children' mode)

                if (globalMotionRegistry._modeType === 'children') {
                    // In 'children' mode, target is a direct child element
                    targetElement = jQ(globalMotionRegistry._elementChain[idx]);
                    elementIdentifier = globalMotionRegistry._elementChain[idx]; // Store the DOM element reference
                } else {
                    // In 'class' mode, target is an element with a specific class from the sequence
                    elementIdentifier = globalMotionRegistry._entryOrderSequence[idx];
                    targetElement = globalMotionRegistry._containerReference.find('.' + elementIdentifier);
                }

                // If a target element is found, animate its opacity
                if (targetElement.length > 0) {
                    targetElement.css('opacity', '0').css('display', globalMotionRegistry._displayRule);
                    targetElement.animate({ opacity: 1 }, globalMotionRegistry._speedFactor, globalMotionRegistry._motionEase, function() {
                        commenceEntry(nextIdx, completionCallback); // Recurse for the next element
                    });
                    globalMotionRegistry._exitOrderSequence.push(elementIdentifier); // Store for later fade-out
                } else {
                    // No more elements to fade in, animation is complete
                    globalMotionRegistry._exitOrderSequence.reverse(); // Reverse the order for fade-out
                    globalMotionRegistry._activeEntry = false; // Reset entry animation flag

                    // Execute the completion callback, mimicking original's eval behavior
                    if (typeof completionCallback === 'string' && completionCallback !== '') {
                        try {
                            (new Function(completionCallback))();
                        } catch (e) {
                            console.error("Error executing onFinish callback:", e);
                        }
                    } else if (typeof completionCallback === 'function') {
                        completionCallback();
                    }
                    return; // Exit recursion
                }
            }
        }

        // Attach event listener for window load, using vanilla JS for divergence
        window.addEventListener('load', function() {
            jQ('.visual-preloader').remove(); // Remove the preloader once content is loaded

            if (globalMotionRegistry._modeType === 'children') {
                // Collect direct children (excluding script and br tags)
                const directChildren = globalMotionRegistry._containerReference.children(':not(script,br)');
                globalMotionRegistry._elementChain = Array.from(directChildren); // Convert jQuery object to array
                commenceEntry(0, currentConfig.onFinish); // Start entry animation
            } else {
                // For 'class' mode, the element chain is implied by the alphabetical sequence
                commenceEntry(0, currentConfig.onFinish); // Start entry animation
            }
        });
    };

    // Public method to trigger the fade-out animation
    jQ.fn.visualTransition.terminate = function(targetUrl) {
        // Only proceed if no entry or exit animation is currently active
        if (globalMotionRegistry._activeEntry === false && globalMotionRegistry._activeExit === false) {
            globalMotionRegistry._activeExit = true; // Set exit animation flag

            // Recursive function to process the exit sequence
            function processExitSequence(pos) {
                if (pos < globalMotionRegistry._exitOrderSequence.length) {
                    const currentItem = globalMotionRegistry._exitOrderSequence[pos];
                    let elementToFade;

                    if (globalMotionRegistry._modeType === 'children') {
                        elementToFade = jQ(currentItem); // currentItem is a DOM element reference
                    } else {
                        elementToFade = jQ('.' + currentItem); // currentItem is a class name string
                    }

                    if (elementToFade.length > 0) {
                        elementToFade.animate({ opacity: 0 }, globalMotionRegistry._speedFactor, globalMotionRegistry._motionEase, function() {
                            jQ(this).css('display', 'none'); // Hide element after fading out
                            processExitSequence(pos + 1); // Recurse for the next element
                        });
                    } else {
                        // If element is not found, proceed to the next in sequence
                        processExitSequence(pos + 1);
                    }
                } else {
                    // All elements have faded out
                    globalMotionRegistry._activeExit = false; // Reset exit animation flag
                    if (targetUrl) {
                        document.location.href = targetUrl; // Redirect if a URL is provided
                    }
                }
            }
            processExitSequence(0); // Start the exit animation from the first element
        }
    };

    // Attach default options to the plugin function for external access
    jQ.fn.visualTransition.defaults = standardVisuals;

})(jQuery);