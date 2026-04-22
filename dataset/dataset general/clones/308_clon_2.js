// Clone of jQuery Glisse plugin
// Version 1.1.1 Re-imagined
// ---
// @creator: VisionaryCoder
// @creatorpage: http://visionarycoder.dev
// @socialhandle: http://twitter.com/visionarycoder
//
// Derived from a jQuery Plugin Template
//
(function (jQueryRef, documentRef) {
    jQueryRef.viewerModule = function (targetElement, initialOptions) {

        var module = this, // Reference to the plugin instance
            $trigger = jQueryRef(targetElement), // The jQuery object for the element that initiated the viewer
            initialOpts = { // Default configuration settings
                imageSourceAttr: 'data-big-image', // Attribute name for high-res image URL
                animDuration: 300, // Speed for interface element animations (ms)
                transitionDuration: 1000, // Speed for image change transitions (ms)
                visualEffect: 'springy', // Name of the visual effect for image transitions
                isMobileDevice: false, // Flag indicating if the user is on a mobile device
                useFullscreen: false, // Flag to enable native fullscreen mode
                disableContextMenu: false, // Prevent right-click context menu on images
                containerSelector: null // jQuery selector for the parent container of related images
            },
            // Internal variables for state management
            currentImageUrl, // URL of the currently displayed large image
            imageGroup, // Identifier for the group of related images
            isTransitioning = false, // Flag indicating if an image transition is in progress
            touchControls = {}, // Object to store mobile touch event data
            preloadedImages = [], // Cache for preloaded image URLs
            retrieveFullSource = function ($elementRef) { // Function to get the full image URL
                // Check for the custom data attribute first, then fall back to 'src'
                return $elementRef.attr(module.config.imageSourceAttr) || $elementRef.attr('src');
            };

        module.config = {}; // Public configuration settings
        module.domElements = {}; // Publicly accessible DOM elements created by the plugin

        /**
         * Initializes the image viewer module.
         * Sets up configurations and event listeners.
         */
        module.initialize = function () {
            // Merge default options with user-provided options
            module.config = jQueryRef.extend({}, initialOpts, initialOptions);

            // Determine the image group from the 'rel' attribute
            imageGroup = $trigger.attr('rel') || undefined;
            // Detect if the user agent indicates a mobile device
            module.config.isMobileDevice = !!navigator.userAgent.match(/iPhone|iPod|iPad|Android/i);

            // Attach the click event listener to the trigger element
            $trigger.on('click', function () {
                // Get the URL of the image to display
                currentImageUrl = retrieveFullSource($trigger);

                // Build the viewer's HTML structure
                buildInterface();
                // Apply CSS for image transition effects
                applyTransitionStyles();
                // Load and display the current image
                displayImage(currentImageUrl);
                // Update navigation button states (e.g., enable/disable next/prev)
                updateNavigationState();
                // Set the image title/caption (placeholder as original function is missing)
                setImageCaption();
                // Pre-fetch other images in the group for faster browsing
                precacheImages();

                // Bind keyboard events for navigation and closing
                jQueryRef(documentRef).keydown(function(eventObject) {
                    if (eventObject.keyCode.toString() === '27') { deactivateViewer(); } // Escape key
                    if (eventObject.keyCode.toString() === '39') { switchImage('forward'); } // Right arrow
                    if (eventObject.keyCode.toString() === '37') { switchImage('backward'); } // Left arrow
                });

                // Optionally disable the right-click context menu on the viewer content
                if (module.config.disableContextMenu) {
                    module.domElements['contentZone'].on('contextmenu', function(eventObject){
                        return false; // Prevent default context menu
                    });
                }
                // ==== Mobile device specific support setup =================
                if (module.config.isMobileDevice) {
                    touchControls = {
                        isTouching: false, // Flag for active touch
                        nextX: 0, // Next X-coordinate
                        originalX: 0, // Initial X-coordinate at touch start
                        scrollXPosition: null // Current horizontal scroll position
                    };

                    // Attach touch event handlers to the document
                    documentRef.ontouchmove = documentRef.ontouchstart = documentRef.ontouchend = handleTouchEvents;
                }
            });
        };

        // --- Helper functions ---

        /**
         * Placeholder function for setting image caption/title.
         * (Original `setTitle` function was called but not defined.)
         */
        var setImageCaption = function setImageCaption() {
            // Implementation for setting image title/caption would go here.
            // For now, it's an empty placeholder.
        };

        /**
         * Basic utility to get vendor prefix for CSS properties.
         * @param {string} propertyName - The CSS property name (e.g., 'transform').
         * @returns {string} The vendor-prefixed property or an empty string if no prefix.
         */
        var getVendorPrefix = function getVendorPrefix(propertyName) {
            var styles = documentRef.body.style || documentRef.documentElement.style;
            var prefixes = ['webkit', 'moz', 'ms', 'o'];
            var capitalizedProperty = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

            for (var i = 0; i < prefixes.length; i++) {
                if (typeof styles[prefixes[i] + capitalizedProperty] !== 'undefined') {
                    return '-' + prefixes[i] + '-';
                }
            }
            if (typeof styles[propertyName] !== 'undefined') {
                return ''; // No prefix needed
            }
            return ''; // Property not supported or unknown prefix
        };

        /**
         * Checks if the given effect name is valid.
         * (Original `isValidEffect` function was called but not defined.)
         * @param {string} effectName - The name of the animation effect.
         * @returns {boolean} True if the effect is recognized, false otherwise.
         */
        var isValidAnimationEffect = function isValidAnimationEffect(effectName) {
            var validEffects = ['springy', 'fadeLarge', 'simpleFade', 'rotateRoll', 'spinRotate', 'horizontalFlip', 'verticalFlip'];
            return validEffects.indexOf(effectName) !== -1;
        };

        /**
         * Toggles a loading spinner/indicator.
         * @param {boolean} show - True to show the spinner, false to hide.
         */
        var toggleLoadingIndicator = function toggleLoadingIndicator(show) {
            if (show) {
                module.domElements['loadingSpinner'].show(); // Assuming .show() exists for jQuery object
            } else {
                module.domElements['loadingSpinner'].hide(); // Assuming .hide() exists for jQuery object
            }
        };

        /**
         * A simple DOM ready observer utility.
         * (Original `readyElement` was used, this is a basic implementation.)
         * In a real scenario, this would likely be more complex (e.g., polling, MutationObserver).
         * For cloning, we simulate its usage by simply executing the callback.
         */
        var domReadyObserver = {
            observe: function(elementId, callbackFunction) {
                // In a real scenario, this would wait for the element to be in DOM
                // For a Type II clone, we'll assume it's immediately available after append
                // or add a slight delay to simulate async DOM updates.
                setTimeout(callbackFunction, 50); // Small delay to simulate DOM rendering
            }
        };

        /**
         * Handles touch events for mobile navigation.
         * (Original `touchHandler` function was called but not defined.)
         * @param {Event} eventObject - The touch event.
         */
        var handleTouchEvents = function handleTouchEvents(eventObject) {
            // This function would contain the logic for touch-based swiping.
            // Since the original was missing, this is a placeholder.
            // Example structure:
            // switch (eventObject.type) {
            //     case 'touchstart':
            //         touchControls.isTouching = true;
            //         touchControls.originalX = eventObject.touches[0].pageX;
            //         break;
            //     case 'touchmove':
            //         if (touchControls.isTouching) {
            //             touchControls.nextX = eventObject.touches[0].pageX;
            //             // Calculate delta and move contentZone
            //             // eventObject.preventDefault(); // Prevent scrolling
            //         }
            //         break;
            //     case 'touchend':
            //         if (touchControls.isTouching) {
            //             touchControls.isTouching = false;
            //             var deltaX = touchControls.nextX - touchControls.originalX;
            //             if (deltaX > 50) { // Swipe right
            //                 switchImage('backward');
            //             } else if (deltaX < -50) { // Swipe left
            //                 switchImage('forward');
            //             }
            //         }
            //         break;
            // }
        };

        /**
         * Preloads images belonging to the same group.
         */
        var precacheImages = function precacheImages() {
            var $currentImage, sourceUrls = [], idx;

            // Find all images with the same 'rel' attribute as the current group
            jQueryRef('img[rel="'+imageGroup+'"]').each(function(index, domElement){
                sourceUrls.push(retrieveFullSource(jQueryRef(this))); // Collect all image URLs
            });

            // Callback function when an image has loaded
            function onImageLoaded(loadedUrl){
                preloadedImages.push(loadedUrl); // Add URL to cache
            }

            // Iterate through URLs and create hidden img elements to trigger loading
            for (idx = 0; idx < sourceUrls.length; idx += 1) {
                $currentImage = jQueryRef("<img>").attr("src", sourceUrls[idx]);
                // Attach load event handler
                $currentImage.load(onImageLoaded(sourceUrls[idx]));
            }
        };

        /**
         * Constructs the HTML elements for the image viewer interface.
         */
        var buildInterface = function buildInterface() {
            $trigger.addClass('active-viewer-element'); // Mark the trigger element as active

            var cssProperty = getVendorPrefix('transition')+'transition',
                cssValue = 'opacity '+module.config.animDuration+'ms ease, '+getVendorPrefix('transform')+'transform '+module.config.animDuration+'ms ease';

            // Create core viewer HTML components
            module.domElements['mainContainer'] = jQueryRef(documentRef.createElement('div')).attr('id','image-viewer-container');
            module.domElements['viewerBackdrop'] = jQueryRef(documentRef.createElement('div')).attr('id','viewer-backdrop').css(cssProperty, cssValue);
            module.domElements['loadingSpinner'] = jQueryRef(documentRef.createElement('div')).attr('id','viewer-loading-spinner');
            module.domElements['closeButton'] = jQueryRef(documentRef.createElement('span')).attr('id','viewer-close-button').css(cssProperty, cssValue);
            module.domElements['contentZone'] = jQueryRef(documentRef.createElement('div')).attr('id','viewer-content-zone').css(cssProperty, cssValue)
                                            .css(getVendorPrefix('transform')+'transform', 'scale(0)'); // Initial scale for animation
            module.domElements['navigationControls'] = jQueryRef(documentRef.createElement('div')).attr('id','viewer-navigation-controls').css(cssProperty, cssValue);
            module.domElements['controlForward'] = jQueryRef(documentRef.createElement('span')).attr('class','viewer-next-button')
                                            .append( jQueryRef(documentRef.createElement('a')).html('&#62;').attr("href", "#")); // Next button with right arrow
            module.domElements['controlCaption'] = jQueryRef(documentRef.createElement('span')).attr('class','viewer-image-caption');
            module.domElements['controlBackward'] = jQueryRef(documentRef.createElement('span')).attr('class','viewer-prev-button')
                                            .append(jQueryRef(documentRef.createElement('a')).html('&#60;').attr("href", "#")); // Previous button with left arrow

            // Assemble the structure
            module.domElements['viewerBackdrop'].append(module.domElements['loadingSpinner']);
            module.domElements['navigationControls'].append(
                    module.domElements['controlForward'],
                    module.domElements['controlCaption'],
                    module.domElements['controlBackward']);
            module.domElements['mainContainer'].append(
                    module.domElements['viewerBackdrop'],
                    module.domElements['closeButton'],
                    module.domElements['contentZone'],
                    module.domElements['navigationControls']
                );
            jQueryRef('body').append(module.domElements['mainContainer']);

            // Observe elements and apply initial styles for animation
            domReadyObserver.observe('viewer-backdrop', function(){ module.domElements['viewerBackdrop'].css('opacity',1); });
            domReadyObserver.observe('viewer-close-button', function(){ module.domElements['closeButton'].css('opacity',1); });
            domReadyObserver.observe('viewer-navigation-controls', function(){ module.domElements['navigationControls'].css('opacity',1); });

            // Attach event listeners for controls
            module.domElements['navigationControls'].delegate('a','click', function(eventObject){
                eventObject.preventDefault(); // Prevent default link behavior
                var changeToDirection = (jQueryRef(this).parent().hasClass('viewer-next-button')) ? 'forward' : 'backward';
                switchImage(changeToDirection); // Change the displayed image
            });

            // Close viewer on clicks outside image or on close button
            module.domElements['viewerBackdrop'].on('click', function() { deactivateViewer(); });
            module.domElements['contentZone'].on('click', function() { deactivateViewer(); });
            module.domElements['closeButton'].on('click', function() { deactivateViewer(); });

            // Request fullscreen mode if enabled
            if (module.config.useFullscreen) {
                var documentRoot = documentRef.documentElement;
                if (documentRoot.requestFullscreen) {
                    documentRoot.requestFullscreen();
                }
                else if (documentRoot.mozRequestFullScreen) { // Firefox
                    documentRoot.mozRequestFullScreen();
                }
                else if (documentRoot.webkitRequestFullScreen) { // Chrome, Safari, Opera
                    documentRoot.webkitRequestFullScreen();
                }
            }
        };

        /**
         * Deactivates and removes the image viewer from the DOM.
         */
        var deactivateViewer = function deactivateViewer() {

            // Animate out the viewer elements
            module.domElements['contentZone'].css({opacity: 0}).css(getVendorPrefix('transform')+'transform', 'scale(1.2)');
            module.domElements['viewerBackdrop'].css({opacity: 0});
            module.domElements['closeButton'].css({opacity: 0});
            module.domElements['navigationControls'].css({opacity: 0});

            // Remove viewer elements from the DOM after animation completes
            setTimeout(function(){
                module.domElements['contentZone'].remove();
                module.domElements['viewerBackdrop'].remove();
                module.domElements['closeButton'].remove();
                module.domElements['navigationControls'].remove();
                module.domElements['mainContainer'].remove();
                jQueryRef('#viewer-transition-css').remove(); // Remove dynamically added style sheet
            }, module.config.animDuration);

            $trigger.removeClass('active-viewer-element'); // Deactivate the trigger element

            // Unbind touch and keyboard events
            documentRef.ontouchmove = function(eventObject){ return true; };
            documentRef.ontouchstart = function(eventObject){ return true; };
            documentRef.ontouchend = function(eventObject){ return true; };
            jQueryRef(documentRef).unbind("keydown");

            // Exit fullscreen mode if it was active
            if (module.config.useFullscreen) {
                if (documentRef.exitFullscreen) {
                    documentRef.exitFullscreen();
                }
                else if (documentRef.mozCancelFullScreen) {
                    documentRef.mozCancelFullScreen();
                }
                else if (documentRef.webkitCancelFullScreen) {
                    documentRef.webkitCancelFullScreen();
                }
            }
        };

        /**
         * Displays a new image within the viewer.
         * @param {string} imageSrc - The URL of the image to display.
         */
        var displayImage = function displayImage(imageSrc) {
            toggleLoadingIndicator(true); // Show loading spinner
            // Create a temporary image element to preload the image
            var $imageElement = jQueryRef('<img/>',{src: imageSrc}).appendTo(module.domElements['contentZone']);
            // Set background image for content zone (often used for responsive sizing)
            module.domElements['contentZone'].css({ backgroundImage: 'url("'+imageSrc+'")'});

            // Once the image has loaded
            $imageElement.load(function() {
                $imageElement.remove(); // Remove the temporary image element
                toggleLoadingIndicator(false); // Hide loading spinner
                module.domElements['contentZone'].css({visibility: 'visible', opacity: 1})
                                     .css(getVendorPrefix('transform')+'transform','scale(1)'); // Animate content zone into view
            });
        };

        /**
         * Changes the currently displayed image to the next or previous one in the group.
         * @param {string} flowDirection - 'forward' for next, 'backward' for previous.
         */
        var switchImage = function switchImage(flowDirection) {
            // Find the currently active image trigger element
            var $activeImageTrigger = jQueryRef('img['+module.config.imageSourceAttr+'="'+currentImageUrl+'"][rel='+imageGroup+']'),
                currentImageIndex  = jQueryRef('img[rel='+imageGroup+']').index($activeImageTrigger), // Get its index
                totalImagesInGroup   = jQueryRef('img[rel='+imageGroup+']').length, // Total images in the group
                shouldProceed     = true; // Flag to determine if image change should occur

            // Check if attempting to go beyond the first or last image
            if ((currentImageIndex === 0 && flowDirection === 'backward') || (currentImageIndex === (totalImagesInGroup-1) && flowDirection === 'forward')) {
                shouldProceed = false; // Cannot change image
            }

            // Only proceed if a change is possible and no other transition is active
            if (shouldProceed && isTransitioning === false) {
                isTransitioning = true; // Set transition flag

                // Determine the next image trigger element
                var $nextImageTrigger = (flowDirection === 'forward') ? jQueryRef('img[rel='+imageGroup+']').eq(currentImageIndex+1) : jQueryRef('img[rel='+imageGroup+']').eq(currentImageIndex-1);

                if (module.config.isMobileDevice) {
                    // Mobile specific animation (translateX)
                    if (flowDirection !== 'forward') {
                        module.domElements['contentZone'].css(getVendorPrefix('transform')+'transform', 'translateX(2000px)');
                    } else {
                        module.domElements['contentZone'].css(getVendorPrefix('transform')+'transform', 'translateX(-2000px)');
                    }
                } else {
                    // Desktop animation via CSS classes
                    module.domElements['contentZone'].addClass('viewer-transitionOut-'+flowDirection);
                    var styleProperty = getVendorPrefix('transition')+'transition',
                        styleValue = 'opacity '+module.config.animDuration+'ms ease, '+getVendorPrefix('transform')+'transform '+module.config.animDuration+'ms ease';
                    module.domElements['contentZone'].css(styleProperty, ''); // Clear transition to allow immediate class-based animation
                }

                // Update the current image URL
                currentImageUrl = retrieveFullSource($nextImageTrigger);

                // Show spinner if the next image is not yet cached
                if (jQueryRef.inArray(currentImageUrl, preloadedImages) === -1) {
                    toggleLoadingIndicator(true);
                }

                // Update active class on trigger elements
                $activeImageTrigger.removeClass('active-viewer-element');
                $nextImageTrigger.addClass('active-viewer-element');

                updateNavigationState(); // Refresh navigation button states
                setImageCaption(); // Update image caption

                // Delay for the outgoing animation to complete
                setTimeout(function() {
                    if (module.config.isMobileDevice) {
                        module.domElements['contentZone'].css(getVendorPrefix('transform')+'transform', 'translateX(0px)')
                            .css('display','none'); // Temporarily hide for snap-back
                    }

                    // Create and append the new image
                    var $imageElement = jQueryRef('<img/>',{src: currentImageUrl}).appendTo(module.domElements['contentZone']);
                    module.domElements['contentZone'].css({ backgroundImage: 'url("'+currentImageUrl+'")'});

                    // Once the new image has loaded
                    $imageElement.load(function() {
                        $imageElement.remove(); // Remove temporary image

                        if (jQueryRef.inArray(currentImageUrl, preloadedImages) === -1) {
                            toggleLoadingIndicator(false); // Hide spinner if it was shown
                        }

                        if (module.config.isMobileDevice) {
                            module.domElements['contentZone'].css('display','block'); // Show content zone again
                        }
                        // Apply incoming animation classes
                        module.domElements['contentZone'].removeClass('viewer-transitionOut-'+flowDirection)
                                                    .addClass('viewer-transitionIn-'+flowDirection);
                        // After incoming animation, reset styles and clear transition flag
                        setTimeout(function(){
                            module.domElements['contentZone'].removeClass('viewer-transitionIn-'+flowDirection).css(styleProperty, styleValue);
                            isTransitioning = false;
                        }, module.config.transitionDuration);
                    });
                }, module.config.transitionDuration);
            } else if (shouldProceed === false && isTransitioning === false) {
                // If attempting to navigate beyond bounds, and not currently transitioning
                if (module.config.isMobileDevice) {
                    module.domElements['contentZone'].css(getVendorPrefix('transform')+'transform', 'translateX(0px)'); // Reset mobile position
                }
                module.domElements['contentZone'].addClass('shake-animation'); // Apply a "shake" effect
                setTimeout(function(){
                    module.domElements['contentZone'].removeClass('shake-animation'); // Remove shake effect
                }, 600); // Duration of shake effect
            }
        };

        /**
         * Dynamically generates and applies CSS keyframes for transition effects.
         */
        var applyTransitionStyles = function applyTransitionStyles() {
            var vendorPrefix = getVendorPrefix('transform'),
                animationVendorPrefix = getVendorPrefix('animation'),
                animationKeyframes = [];

            // Ensure a valid effect is selected, default to 'springy'
            if (!isValidAnimationEffect(module.config.visualEffect)) {
                module.config.visualEffect = 'springy';
            }

            // Define keyframes based on the chosen visual effect
            switch (module.config.visualEffect) {
                case 'springy':
                    animationKeyframes = [
                        '@'+animationVendorPrefix+'keyframes viewerOutLeft {',
                            '0% { '+vendorPrefix+'transform: translateX(0);}',
                            '20% { opacity: 1;'+vendorPrefix+'transform: translateX(20px);}',
                            '100% { opacity: 0;'+vendorPrefix+'transform: translateX(-2000px);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInLeft {',
                            '0% {opacity: 0;'+vendorPrefix+'transform: translateX(-2000px);}',
                            '60% {opacity: 1;'+vendorPrefix+'transform: translateX(30px);}',
                            '80% {'+vendorPrefix+'transform: translateX(-10px);}',
                            '100% {'+vendorPrefix+'transform: translateX(0);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerOutRight {',
                            '0% {'+vendorPrefix+'transform: translateX(0);}',
                            '20% {opacity: 1;'+vendorPrefix+'transform: translateX(-20px);}',
                            '100% {opacity: 0;'+vendorPrefix+'transform: translateX(2000px);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInRight {',
                            '0% {opacity: 0;'+vendorPrefix+'transform: translateX(2000px);}',
                            '60% {opacity: 1;'+vendorPrefix+'transform: translateX(-30px);}',
                            '80% {'+vendorPrefix+'transform: translateX(10px);}',
                            '100% {'+vendorPrefix+'transform: translateX(0);}',
                        '}'
                    ].join('\n');
                break;
                case 'fadeLarge':
                     animationKeyframes = [
                        '@'+animationVendorPrefix+'keyframes viewerOutLeft {',
                            '0% { opacity: 1;'+vendorPrefix+'transform: translateX(0);}',
                            '100% {opacity: 0;'+vendorPrefix+'transform: translateX(-2000px);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInLeft {',
                            '0% { opacity: 0;'+vendorPrefix+'transform: translateX(-2000px);}',
                            '100% {opacity: 1;'+vendorPrefix+'transform: translateX(0);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerOutRight {',
                            '0% { opacity: 1;'+vendorPrefix+'transform: translateX(0);}',
                            '100% {opacity: 0;'+vendorPrefix+'transform: translateX(2000px);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInRight {',
                            '0% { opacity: 0;'+vendorPrefix+'transform: translateX(2000px);}',
                            '100% {opacity: 1;'+vendorPrefix+'transform: translateX(0);}',
                        '}'
                    ].join('\n');
                break;
                case 'simpleFade':
                     animationKeyframes = [
                        '@'+animationVendorPrefix+'keyframes viewerOutLeft {',
                            '0% { opacity: 1;'+vendorPrefix+'transform: translateX(0);}',
                            '100% {opacity: 0;'+vendorPrefix+'transform: translateX(-200px);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInLeft {',
                            '0% { opacity: 0;'+vendorPrefix+'transform: translateX(-200px);}',
                            '100% {opacity: 1;'+vendorPrefix+'transform: translateX(0);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerOutRight {',
                            '0% { opacity: 1;'+vendorPrefix+'transform: translateX(0);}',
                            '100% {opacity: 0;'+vendorPrefix+'transform: translateX(200px);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInRight {',
                            '0% { opacity: 0;'+vendorPrefix+'transform: translateX(200px);}',
                            '100% {opacity: 1;'+vendorPrefix+'transform: translateX(0);}',
                        '}'
                    ].join('\n');
                break;
                case 'rotateRoll':
                     animationKeyframes = [
                        '@'+animationVendorPrefix+'keyframes viewerOutLeft {',
                            '0% { opacity: 1;'+vendorPrefix+'transform: translateX(0px) rotate(0deg);}',
                            '100% {opacity: 0;'+vendorPrefix+'transform: translateX(-100%) rotate(-120deg);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInLeft {',
                            '0% { opacity: 0;'+vendorPrefix+'transform: translateX(-100%) rotate(-120deg);}',
                            '100% {opacity: 1;'+vendorPrefix+'transform:  translateX(0px) rotate(0deg);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerOutRight {',
                            '0% { opacity: 1;'+vendorPrefix+'transform:translateX(0px) rotate(0deg);}',
                            '100% {opacity: 0;'+vendorPrefix+'transform:translateX(100%) rotate(120deg);}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInRight {',
                            '0% { opacity: 0;'+vendorPrefix+'transform: translateX(100%) rotate(120deg);}',
                            '100% {opacity: 1;'+vendorPrefix+'transform:  translateX(0px) rotate(0deg);}',
                        '}'
                    ].join('\n');
                break;
                case 'spinRotate':
                     animationKeyframes = [
                        '@'+animationVendorPrefix+'keyframes viewerOutRight {',
                            '0% { opacity: 1;'+vendorPrefix+'transform: rotate(0deg);'+vendorPrefix+'transform-origin:left bottom;}',
                            '100% {opacity: 0;'+vendorPrefix+'transform: rotate(-90deg);'+vendorPrefix+'transform-origin:left bottom;}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInLeft {',
                            '0% { opacity: 0;'+vendorPrefix+'transform: rotate(90deg);'+vendorPrefix+'transform-origin:left bottom;}',
                            '100% {opacity: 1;'+vendorPrefix+'transform: rotate(0deg);'+vendorPrefix+'transform-origin:left bottom;}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerOutLeft {',
                            '0% { opacity: 1;'+vendorPrefix+'transform: rotate(0deg);'+vendorPrefix+'transform-origin:right bottom;}',
                            '100% {opacity: 0;'+vendorPrefix+'transform: rotate(90deg);'+vendorPrefix+'transform-origin:right bottom;}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInRight {',
                            '0% { opacity: 0;'+vendorPrefix+'transform: rotate(-90deg);'+vendorPrefix+'transform-origin:right bottom;}',
                            '100% {opacity: 1;'+vendorPrefix+'transform: rotate(0deg);'+vendorPrefix+'transform-origin:right bottom;}',
                        '}'
                    ].join('\n');
                break;
                case 'horizontalFlip':
                    animationKeyframes = [
                        '@'+animationVendorPrefix+'keyframes viewerOutLeft {',
                            '0% {'+vendorPrefix+'transform: perspective(400px) rotateX(0deg);opacity: 1;}',
                            '100% {'+vendorPrefix+'transform: perspective(400px) rotateX(90deg);opacity: 0;}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInLeft {',
                            '0% {'+vendorPrefix+'transform: perspective(400px) rotateX(90deg);opacity: 0;}',
                            '40% {'+vendorPrefix+'transform: perspective(400px) rotateX(-10deg);}',
                            '70% {'+vendorPrefix+'transform: perspective(400px) rotateX(10deg);}',
                            '100% {'+vendorPrefix+'transform: perspective(400px) rotateX(0deg);opacity: 1;}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerOutRight {',
                            '0% {'+vendorPrefix+'transform: perspective(400px) rotateX(0deg);opacity: 1;}',
                            '100% {'+vendorPrefix+'transform: perspective(400px) rotateX(90deg);opacity: 0;}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInRight {',
                            '0% {'+vendorPrefix+'transform: perspective(400px) rotateX(90deg);opacity: 0;}',
                            '40% {'+vendorPrefix+'transform: perspective(400px) rotateX(-10deg);}',
                            '70% {'+vendorPrefix+'transform: perspective(400px) rotateX(10deg);}',
                            '100% {'+vendorPrefix+'transform: perspective(400px) rotateX(0deg);opacity: 1;}',
                        '}'
                    ].join('\n');
                break;
                case 'verticalFlip':
                    animationKeyframes = [
                        '@'+animationVendorPrefix+'keyframes viewerOutLeft {',
                            '0% {'+vendorPrefix+'transform: perspective(400px) rotateY(0deg);opacity: 1;}',
                            '100% {'+vendorPrefix+'transform: perspective(400px) rotateY(90deg);opacity: 0;}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInLeft {',
                            '0% {'+vendorPrefix+'transform: perspective(400px) rotateY(90deg);opacity: 0;}',
                            '40% {'+vendorPrefix+'transform: perspective(400px) rotateY(-10deg);}',
                            '70% {'+vendorPrefix+'transform: perspective(400px) rotateY(10deg);}',
                            '100% {'+vendorPrefix+'transform: perspective(400px) rotateY(0deg);opacity: 1;}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerOutRight {',
                            '0% {'+vendorPrefix+'transform: perspective(400px) rotateY(0deg);opacity: 1;}',
                            '100% {'+vendorPrefix+'transform: perspective(400px) rotateY(-90deg);opacity: 0;}',
                        '}',
                        '@'+animationVendorPrefix+'keyframes viewerInRight {',
                            '0% {'+vendorPrefix+'transform: perspective(400px) rotateY(90deg);opacity: 0;}',
                            '40% {'+vendorPrefix+'transform: perspective(400px) rotateY(-10deg);}',
                            '70% {'+vendorPrefix+'transform: perspective(400px) rotateY(10deg);}',
                            '100% {'+vendorPrefix+'transform: perspective(400px) rotateY(0deg);opacity: 1;}',
                        '}'
                    ].join('\n');
                break;
            }
            // Define CSS classes for applying the animations
            var transitionClasses = [
                        '.viewer-transitionOut-forward {',
                            animationVendorPrefix+'animation: '+module.config.transitionDuration+'ms ease;',
                            animationVendorPrefix+'animation-name: viewerOutLeft;',
                            animationVendorPrefix+'animation-fill-mode: both;',
                        '}',
                        '.viewer-transitionIn-backward {',
                            animationVendorPrefix+'animation: '+module.config.transitionDuration+'ms ease;',
                            animationVendorPrefix+'animation-name: viewerInLeft;',
                            animationVendorPrefix+'animation-fill-mode: both;',
                        '}',
                        '.viewer-transitionOut-backward {',
                            animationVendorPrefix+'animation: '+module.config.transitionDuration+'ms ease;',
                            animationVendorPrefix+'animation-name: viewerOutRight;',
                            animationVendorPrefix+'animation-fill-mode: both;',
                        '}',
                        '.viewer-transitionIn-forward {',
                            animationVendorPrefix+'animation: '+module.config.transitionDuration+'ms ease;',
                            animationVendorPrefix+'animation-name: viewerInRight;',
                            animationVendorPrefix+'animation-fill-mode: both;',
                        '}'
                    ].join('\n');

            // Append or update the dynamic style sheet in the document head
            if (!documentRef.getElementById('viewer-transition-css')) {
                jQueryRef('<style type="text/css" id="viewer-transition-css">'+animationKeyframes+transitionClasses+'</style>').appendTo('head');
            } else {
                jQueryRef('#viewer-transition-css').html(animationKeyframes+transitionClasses);
            }
        };

        /**
         * Updates the enabled/disabled state of navigation controls based on current image position.
         */
        var updateNavigationState = function updateNavigationState() {
            var $activeSourceElement = jQueryRef('img['+module.config.imageSourceAttr+'="'+currentImageUrl+'"]'),
                $parentItem = module.config.containerSelector ?
                    $activeSourceElement.closest(module.config.containerSelector) :
                    $activeSourceElement.parent(); // Find the parent container of the image

            // Check if there's a next image
            if (!$parentItem.next().find('img[rel='+imageGroup+']').length) {
                module.domElements['navigationControls'].find('.viewer-next-button').addClass('end-of-group');
            } else {
                module.domElements['navigationControls'].find('.viewer-next-button').removeClass('end-of-group');
            }
            // Check if there's a previous image
            if (!$parentItem.prev().find('img[rel='+imageGroup+']').length) {
                module.domElements['navigationControls'].find('.viewer-prev-button').addClass('end-of-group');
            } else {
                module.domElements['navigationControls'].find('.viewer-prev-button').removeClass('end-of-group');
            }
        };

        // Call the initialization method to start the plugin
        module.initialize();
    };
})(jQuery, document);