(function (jq, docObj) {
    jq.imageViewer = function (initialTarget, configOptions) {

        const viewerModule = this;
        const jqTrigger = jq(initialTarget);

        // Standard configuration defaults
        const standardOptions = {
            imageSourceAttr: 'data-full-image', // Renamed from dataName
            transitionDuration: 300,            // Renamed from speed
            animationDuration: 1000,            // Renamed from changeSpeed
            visualEffect: 'bounce',             // Renamed from effect
            isMobileDevice: false,              // Renamed from mobile
            isFullScreenEnabled: false,         // Renamed from fullscreen
            disableRightClick: false,           // Renamed from disablindRightClick (typo fixed)
            containerSelector: null             // Renamed from parent
        };

        // Internal state variables
        let currentImageUrl;
        let imageGroupIdentifier;
        let isTransitioning = false; // Renamed from isChange
        const mobileInteractionState = {}; // Renamed from mobile
        const touchEventData = {};        // Renamed from touch (not fully used in original, keeping for structure)
        const preloadedImages = [];       // Renamed from cache

        // Utility function to get the full image URL
        const getImageSourceUrl = ($elementRef) => {
            return $elementRef.attr(viewerModule.config.imageSourceAttr) || $elementRef.attr('src');
        };

        viewerModule.config = {};
        viewerModule.domElements = {}; // Renamed from plugin.els

        /**
         * Initializes the image viewer module.
         */
        viewerModule.initialize = function () {
            // Merge user-provided options with standard defaults
            viewerModule.config = jq.extend({}, standardOptions, configOptions);

            // Determine image group and mobile status
            imageGroupIdentifier = jqTrigger.attr('rel') || null;
            viewerModule.config.isMobileDevice = !!navigator.userAgent.match(/iPhone|iPod|iPad|Android/i);

            // Bind click event to the trigger element
            jqTrigger.on('click', function (evt) {
                evt.preventDefault(); // Prevent default link behavior
                currentImageUrl = getImageSourceUrl(jqTrigger);

                buildViewerUI();
                applyTransitionStyles();
                displayImage(currentImageUrl);
                updateNavigationStatus();
                setImageCaption(); // Placeholder for a title/caption function
                preLoadGroupImages();

                // Bind keyboard navigation events
                jq(docObj).on('keydown.imageViewer', function(event) { // Namespaced event
                    switch (event.keyCode.toString()) {
                        case '27': closeImageViewer(); break; // Escape key
                        case '39': navigateImage('next'); break; // Right arrow
                        case '37': navigateImage('prev'); break; // Left arrow
                    }
                });

                // Disable right-click if configured
                if (viewerModule.config.disableRightClick) {
                    viewerModule.domElements['mainContent'].on('contextmenu.imageViewer', function(e){
                        return false;
                    });
                }

                // Initialize mobile touch support
                if (viewerModule.config.isMobileDevice) {
                    Object.assign(mobileInteractionState, {
                        isDragging: false,
                        currentX: 0,
                        initialX: 0,
                        scrollPositionX: null
                    });
                    // Bind touch event handlers to the document
                    docObj.ontouchmove = docObj.ontouchstart = docObj.ontouchend = handleTouchEvents;
                }
            });
        };

        /**
         * Placeholder for touch event handling on mobile devices.
         * (Original `touchHandler` was not defined, adding a minimal one.)
         */
        const handleTouchEvents = function(event) {
            // Basic touch event logic (can be expanded for swipe gestures)
            if (event.type === 'touchstart') {
                mobileInteractionState.isDragging = true;
                mobileInteractionState.initialX = event.touches[0].clientX;
            } else if (event.type === 'touchmove' && mobileInteractionState.isDragging) {
                mobileInteractionState.currentX = event.touches[0].clientX;
                // Prevent default scrolling during horizontal drag
                // event.preventDefault();
            } else if (event.type === 'touchend' && mobileInteractionState.isDragging) {
                mobileInteractionState.isDragging = false;
                const deltaX = mobileInteractionState.currentX - mobileInteractionState.initialX;
                if (Math.abs(deltaX) > 50) { // Threshold for swipe
                    if (deltaX < 0) {
                        navigateImage('next');
                    } else {
                        navigateImage('prev');
                    }
                }
            }
        };

        /**
         * Preloads all images belonging to the current group.
         */
        const preLoadGroupImages = function () {
            const groupImageUrls = [];
            jq(`img[rel="${imageGroupIdentifier}"]`).each(function () {
                groupImageUrls.push(getImageSourceUrl(jq(this)));
            });

            const imageLoadedCallback = (imageUrl) => {
                if (preloadedImages.indexOf(imageUrl) === -1) {
                    preloadedImages.push(imageUrl);
                }
            };

            for (let i = 0; i < groupImageUrls.length; i++) {
                const tempImage = new Image(); // Use native Image object for preloading
                tempImage.src = groupImageUrls[i];
                tempImage.onload = () => imageLoadedCallback(groupImageUrls[i]);
            }
        };

        /**
         * Dynamically generates and inserts necessary CSS for prefixed properties.
         * @param {string} property The CSS property (e.g., 'transform').
         * @returns {string} The vendor-prefixed property or the original.
         */
        const getCssPrefix = function (property) {
            const prefixes = ['webkit', 'moz', 'ms', 'o'];
            const testElement = docObj.createElement('div').style;
            if (property in testElement) return ''; // No prefix needed

            for (let i = 0; i < prefixes.length; i++) {
                const prefixedProperty = prefixes[i] + property.charAt(0).toUpperCase() + property.slice(1);
                if (prefixedProperty in testElement) {
                    return '-' + prefixes[i] + '-';
                }
            }
            return ''; // Should not happen for common properties
        };

        /**
         * Builds the main viewer UI elements and appends them to the DOM.
         */
        const buildViewerUI = function () {
            jqTrigger.addClass('active-viewer-trigger'); // Renamed class

            const transformPrefix = getCssPrefix('transform');
            const transitionPrefix = getCssPrefix('transition');
            const transitionProp = transitionPrefix + 'transition';
            const transitionValue = `opacity ${viewerModule.config.transitionDuration}ms ease, ${transformPrefix}transform ${viewerModule.config.transitionDuration}ms ease`;

            // Create all necessary DOM elements
            viewerModule.domElements['mainWrapper'] = jq('<div/>', { id: 'image-viewer-wrapper' }); // Renamed from wrapper
            viewerModule.domElements['viewerOverlay'] = jq('<div/>', { id: 'image-viewer-overlay' }).css(transitionProp, transitionValue); // Renamed from overlay
            viewerModule.domElements['loadingSpinner'] = jq('<div/>', { id: 'image-viewer-spinner' }); // Renamed from spinner
            viewerModule.domElements['closeButton'] = jq('<span/>', { id: 'image-viewer-close' }).css(transitionProp, transitionValue); // Renamed from close
            viewerModule.domElements['mainContent'] = jq('<div/>', { id: 'image-viewer-content' }) // Renamed from content
                                                      .css(transitionProp, transitionValue)
                                                      .css(transformPrefix + 'transform', 'scale(0)');
            viewerModule.domElements['navigationControls'] = jq('<div/>', { id: 'image-viewer-controls' }).css(transitionProp, transitionValue); // Renamed from controls
            viewerModule.domElements['nextControl'] = jq('<span/>', { class: 'viewer-nav-next' }) // Renamed from controlNext
                                                      .append(jq('<a/>', { href: '#' }).html('&gt;'));
            viewerModule.domElements['captionDisplay'] = jq('<span/>', { class: 'viewer-caption' }); // Renamed from controlLegend
            viewerModule.domElements['prevControl'] = jq('<span/>', { class: 'viewer-nav-prev' }) // Renamed from controlPrev
                                                      .append(jq('<a/>', { href: '#' }).html('&lt;'));

            // Assemble the structure
            viewerModule.domElements['viewerOverlay'].append(viewerModule.domElements['loadingSpinner']);
            viewerModule.domElements['navigationControls'].append(
                viewerModule.domElements['nextControl'],
                viewerModule.domElements['captionDisplay'],
                viewerModule.domElements['prevControl']
            );
            viewerModule.domElements['mainWrapper'].append(
                viewerModule.domElements['viewerOverlay'],
                viewerModule.domElements['closeButton'],
                viewerModule.domElements['mainContent'],
                viewerModule.domElements['navigationControls']
            );
            jq('body').append(viewerModule.domElements['mainWrapper']);

            // Animate elements into view (simplified from original's readyElement.observe)
            setTimeout(() => {
                viewerModule.domElements['viewerOverlay'].css('opacity', 1);
                viewerModule.domElements['closeButton'].css('opacity', 1);
                viewerModule.domElements['navigationControls'].css('opacity', 1);
            }, 50); // Small delay to ensure elements are in DOM before transition

            // Bind control events
            viewerModule.domElements['navigationControls'].on('click.imageViewer', 'a', function(e){
                e.preventDefault();
                const direction = (jq(this).parent().hasClass('viewer-nav-next')) ? 'next' : 'prev';
                navigateImage(direction);
            });

            viewerModule.domElements['viewerOverlay'].on('click.imageViewer', closeImageViewer);
            viewerModule.domElements['mainContent'].on('click.imageViewer', closeImageViewer);
            viewerModule.domElements['closeButton'].on('click.imageViewer', closeImageViewer);

            // Handle fullscreen request
            if (viewerModule.config.isFullScreenEnabled) {
                const docElm = docObj.documentElement;
                if (docElm.requestFullscreen) {
                    docElm.requestFullscreen();
                } else if (docElm.mozRequestFullScreen) { // Firefox
                    docElm.mozRequestFullScreen();
                } else if (docElm.webkitRequestFullScreen) { // Chrome, Safari, Opera
                    docElm.webkitRequestFullScreen();
                } else if (docElm.msRequestFullscreen) { // IE/Edge
                    docElm.msRequestFullscreen();
                }
            }
        };

        /**
         * Closes the image viewer and cleans up DOM elements and event bindings.
         */
        const closeImageViewer = function () {
            // Hide viewer elements
            viewerModule.domElements['mainContent'].css({ opacity: 0 }).css(getCssPrefix('transform') + 'transform', 'scale(1.2)');
            viewerModule.domElements['viewerOverlay'].css({ opacity: 0 });
            viewerModule.domElements['closeButton'].css({ opacity: 0 });
            viewerModule.domElements['navigationControls'].css({ opacity: 0 });

            // Remove elements from DOM after transition
            setTimeout(function(){
                for (const key in viewerModule.domElements) {
                    if (viewerModule.domElements.hasOwnProperty(key)) {
                        viewerModule.domElements[key].remove();
                    }
                }
                jq('#viewer-dynamic-styles').remove(); // Renamed from glisse-transition-css
            }, viewerModule.config.transitionDuration);

            jqTrigger.removeClass('active-viewer-trigger');

            // Unbind all namespaced events
            jq(docObj).off('keydown.imageViewer');
            viewerModule.domElements['mainContent'].off('contextmenu.imageViewer');
            viewerModule.domElements['navigationControls'].off('click.imageViewer');
            viewerModule.domElements['viewerOverlay'].off('click.imageViewer');
            viewerModule.domElements['closeButton'].off('click.imageViewer');


            // Reset touch handlers
            docObj.ontouchmove = docObj.ontouchstart = docObj.ontouchend = null;

            // Exit fullscreen if enabled
            if (viewerModule.config.isFullScreenEnabled) {
                if (docObj.exitFullscreen) {
                    docObj.exitFullscreen();
                } else if (docObj.mozCancelFullScreen) {
                    docObj.mozCancelFullScreen();
                } else if (docObj.webkitCancelFullScreen) {
                    docObj.webkitCancelFullScreen();
                } else if (docObj.msExitFullscreen) {
                    docObj.msExitFullscreen();
                }
            }
        };

        /**
         * Toggles the visibility of the loading spinner.
         * @param {boolean} show True to show, false to hide.
         */
        const toggleLoadingSpinner = function (show) { // Renamed from spinner
            viewerModule.domElements['loadingSpinner'].css('display', show ? 'block' : 'none');
        };

        /**
         * Displays a new image in the viewer.
         * @param {string} imageUrl The URL of the image to display.
         */
        const displayImage = function (imageUrl) { // Renamed from addImage
            if (!imageUrl) {
                console.error("No image URL provided for display.");
                return;
            }

            toggleLoadingSpinner(true);
            // Create a temporary image element to wait for load event
            const tempImgLoader = new Image();
            tempImgLoader.src = imageUrl;

            tempImgLoader.onload = function() {
                viewerModule.domElements['mainContent'].css({
                    backgroundImage: `url("${imageUrl}")`,
                    visibility: 'visible',
                    opacity: 1
                }).css(getCssPrefix('transform') + 'transform', 'scale(1)');
                toggleLoadingSpinner(false);
            };

            tempImgLoader.onerror = function() {
                console.error(`Failed to load image: ${imageUrl}`);
                toggleLoadingSpinner(false);
                // Optionally display an error message
            };
        };

        /**
         * Navigates to the next or previous image in the group.
         * @param {string} direction 'next' or 'prev'.
         */
        const navigateImage = function (direction) { // Renamed from changePicture
            const allGroupImages = jq(`img[rel="${imageGroupIdentifier}"]`);
            const currentActiveImage = jq(`img[${viewerModule.config.imageSourceAttr}="${currentImageUrl}"][rel="${imageGroupIdentifier}"]`);
            const currentIndex = allGroupImages.index(currentActiveImage);
            const totalGroupImages = allGroupImages.length;

            let nextIndex;
            if (direction === 'next') {
                nextIndex = currentIndex + 1;
            } else {
                nextIndex = currentIndex - 1;
            }

            const canChange = (nextIndex >= 0 && nextIndex < totalGroupImages);

            if (canChange && !isTransitioning) {
                isTransitioning = true;
                const nextImageElement = allGroupImages.eq(nextIndex);
                const newImageUrl = getImageSourceUrl(nextImageElement);

                // Apply transition effects
                if (viewerModule.config.isMobileDevice) {
                    const mobileTransform = (direction === 'next') ? 'translateX(-2000px)' : 'translateX(2000px)';
                    viewerModule.domElements['mainContent'].css(getCssPrefix('transform') + 'transform', mobileTransform);
                } else {
                    viewerModule.domElements['mainContent']
                        .addClass(`viewer-transition-out-${direction}`)
                        .css(getCssPrefix('transition') + 'transition', ''); // Temporarily remove explicit transition for animation
                }

                currentImageUrl = newImageUrl;
                currentActiveImage.removeClass('active-viewer-trigger');
                nextImageElement.addClass('active-viewer-trigger');

                updateNavigationStatus();
                setImageCaption();

                // Preload if not cached
                if (preloadedImages.indexOf(currentImageUrl) === -1) {
                    toggleLoadingSpinner(true);
                }

                setTimeout(function() {
                    if (viewerModule.config.isMobileDevice) {
                        viewerModule.domElements['mainContent']
                            .css(getCssPrefix('transform') + 'transform', 'translateX(0px)')
                            .css('display', 'none');
                    }

                    const tempImgForLoad = new Image();
                    tempImgForLoad.src = currentImageUrl;

                    tempImgForLoad.onload = function() {
                        viewerModule.domElements['mainContent'].css({ backgroundImage: `url("${currentImageUrl}")` });

                        if (preloadedImages.indexOf(currentImageUrl) === -1) {
                            toggleLoadingSpinner(false);
                        }

                        if (viewerModule.config.isMobileDevice) {
                            viewerModule.domElements['mainContent'].css('display', 'block');
                        }

                        viewerModule.domElements['mainContent']
                            .removeClass(`viewer-transition-out-${direction}`)
                            .addClass(`viewer-transition-in-${direction}`);

                        setTimeout(function(){
                            viewerModule.domElements['mainContent']
                                .removeClass(`viewer-transition-in-${direction}`)
                                .css(getCssPrefix('transition') + 'transition', `opacity ${viewerModule.config.transitionDuration}ms ease, ${getCssPrefix('transform')}transform ${viewerModule.config.transitionDuration}ms ease`);
                            isTransitioning = false;
                        }, viewerModule.config.animationDuration);
                    };
                }, viewerModule.config.animationDuration);

            } else if (!canChange && !isTransitioning) {
                // If at start/end and trying to navigate further, show a "shake" effect
                if (viewerModule.config.isMobileDevice) {
                    viewerModule.domElements['mainContent'].css(getCssPrefix('transform') + 'transform', 'translateX(0px)');
                }
                viewerModule.domElements['mainContent'].addClass('viewer-shake-effect');
                setTimeout(function(){
                    viewerModule.domElements['mainContent'].removeClass('viewer-shake-effect');
                }, 600);
            }
        };

        /**
         * Checks if the provided effect name is valid.
         * @param {string} effectName The name of the effect.
         * @returns {boolean} True if valid, false otherwise.
         */
        const isValidAnimationEffect = function (effectName) { // Renamed from isValidEffect
            const validEffects = ['bounce', 'fadeBig', 'fade', 'roll', 'rotate', 'flipX', 'flipY'];
            return validEffects.includes(effectName);
        };

        /**
         * Applies dynamic CSS keyframe animations for image transitions.
         */
        const applyTransitionStyles = function () { // Renamed from setChangeStyle
            const transformPrefix = getCssPrefix('transform');
            const animationPrefix = getCssPrefix('animation');
            let effectKeyframes = [];

            if (!isValidAnimationEffect(viewerModule.config.visualEffect)) {
                viewerModule.config.visualEffect = 'bounce'; // Fallback to default
            }

            switch (viewerModule.config.visualEffect) {
                case 'bounce':
                    effectKeyframes = [
                        `@${animationPrefix}keyframes slideOutLeft {`,
                            `0% { ${transformPrefix}transform: translateX(0); }`,
                            `20% { opacity: 1; ${transformPrefix}transform: translateX(20px); }`,
                            `100% { opacity: 0; ${transformPrefix}transform: translateX(-2000px); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInLeft {`,
                            `0% { opacity: 0; ${transformPrefix}transform: translateX(-2000px); }`,
                            `60% { opacity: 1; ${transformPrefix}transform: translateX(30px); }`,
                            `80% { ${transformPrefix}transform: translateX(-10px); }`,
                            `100% { ${transformPrefix}transform: translateX(0); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideOutRight {`,
                            `0% { ${transformPrefix}transform: translateX(0); }`,
                            `20% { opacity: 1; ${transformPrefix}transform: translateX(-20px); }`,
                            `100% { opacity: 0; ${transformPrefix}transform: translateX(2000px); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInRight {`,
                            `0% { opacity: 0; ${transformPrefix}transform: translateX(2000px); }`,
                            `60% { opacity: 1; ${transformPrefix}transform: translateX(-30px); }`,
                            `80% { ${transformPrefix}transform: translateX(10px); }`,
                            `100% { ${transformPrefix}transform: translateX(0); }`,
                        `}`
                    ].join('\n');
                    break;
                case 'fadeBig':
                    effectKeyframes = [
                        `@${animationPrefix}keyframes slideOutLeft {`,
                            `0% { opacity: 1; ${transformPrefix}transform: translateX(0); }`,
                            `100% { opacity: 0; ${transformPrefix}transform: translateX(-2000px); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInLeft {`,
                            `0% { opacity: 0; ${transformPrefix}transform: translateX(-2000px); }`,
                            `100% { opacity: 1; ${transformPrefix}transform: translateX(0); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideOutRight {`,
                            `0% { opacity: 1; ${transformPrefix}transform: translateX(0); }`,
                            `100% { opacity: 0; ${transformPrefix}transform: translateX(2000px); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInRight {`,
                            `0% { opacity: 0; ${transformPrefix}transform: translateX(2000px); }`,
                            `100% { opacity: 1; ${transformPrefix}transform: translateX(0); }`,
                        `}`
                    ].join('\n');
                    break;
                case 'fade':
                    effectKeyframes = [
                        `@${animationPrefix}keyframes slideOutLeft {`,
                            `0% { opacity: 1; ${transformPrefix}transform: translateX(0); }`,
                            `100% { opacity: 0; ${transformPrefix}transform: translateX(-200px); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInLeft {`,
                            `0% { opacity: 0; ${transformPrefix}transform: translateX(-200px); }`,
                            `100% { opacity: 1; ${transformPrefix}transform: translateX(0); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideOutRight {`,
                            `0% { opacity: 1; ${transformPrefix}transform: translateX(0); }`,
                            `100% { opacity: 0; ${transformPrefix}transform: translateX(200px); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInRight {`,
                            `0% { opacity: 0; ${transformPrefix}transform: translateX(200px); }`,
                            `100% { opacity: 1; ${transformPrefix}transform: translateX(0); }`,
                        `}`
                    ].join('\n');
                    break;
                case 'roll':
                    effectKeyframes = [
                        `@${animationPrefix}keyframes slideOutLeft {`,
                            `0% { opacity: 1; ${transformPrefix}transform: translateX(0px) rotate(0deg); }`,
                            `100% { opacity: 0; ${transformPrefix}transform: translateX(-100%) rotate(-120deg); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInLeft {`,
                            `0% { opacity: 0; ${transformPrefix}transform: translateX(-100%) rotate(-120deg); }`,
                            `100% { opacity: 1; ${transformPrefix}transform: translateX(0px) rotate(0deg); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideOutRight {`,
                            `0% { opacity: 1; ${transformPrefix}transform: translateX(0px) rotate(0deg); }`,
                            `100% { opacity: 0; ${transformPrefix}transform: translateX(100%) rotate(120deg); }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInRight {`,
                            `0% { opacity: 0; ${transformPrefix}transform: translateX(100%) rotate(120deg); }`,
                            `100% { opacity: 1; ${transformPrefix}transform: translateX(0px) rotate(0deg); }`,
                        `}`
                    ].join('\n');
                    break;
                case 'rotate':
                    effectKeyframes = [
                        `@${animationPrefix}keyframes slideOutRight {`,
                            `0% { opacity: 1; ${transformPrefix}transform: rotate(0deg); ${transformPrefix}transform-origin: left bottom; }`,
                            `100% { opacity: 0; ${transformPrefix}transform: rotate(-90deg); ${transformPrefix}transform-origin: left bottom; }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInLeft {`,
                            `0% { opacity: 0; ${transformPrefix}transform: rotate(90deg); ${transformPrefix}transform-origin: left bottom; }`,
                            `100% { opacity: 1; ${transformPrefix}transform: rotate(0deg); ${transformPrefix}transform-origin: left bottom; }`,
                        `}`,
                        `@${animationPrefix}keyframes slideOutLeft {`,
                            `0% { opacity: 1; ${transformPrefix}transform: rotate(0deg); ${transformPrefix}transform-origin: right bottom; }`,
                            `100% { opacity: 0; ${transformPrefix}transform: rotate(90deg); ${transformPrefix}transform-origin: right bottom; }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInRight {`,
                            `0% { opacity: 0; ${transformPrefix}transform: rotate(-90deg); ${transformPrefix}transform-origin: right bottom; }`,
                            `100% { opacity: 1; ${transformPrefix}transform: rotate(0deg); ${transformPrefix}transform-origin: right bottom; }`,
                        `}`
                    ].join('\n');
                    break;
                case 'flipX':
                    effectKeyframes = [
                        `@${animationPrefix}keyframes slideOutLeft {`,
                            `0% { ${transformPrefix}transform: perspective(400px) rotateX(0deg); opacity: 1; }`,
                            `100% { ${transformPrefix}transform: perspective(400px) rotateX(90deg); opacity: 0; }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInLeft {`,
                            `0% { ${transformPrefix}transform: perspective(400px) rotateX(90deg); opacity: 0; }`,
                            `40% { ${transformPrefix}transform: perspective(400px) rotateX(-10deg); }`,
                            `70% { ${transformPrefix}transform: perspective(400px) rotateX(10deg); }`,
                            `100% { ${transformPrefix}transform: perspective(400px) rotateX(0deg); opacity: 1; }`,
                        `}`,
                        `@${animationPrefix}keyframes slideOutRight {`,
                            `0% { ${transformPrefix}transform: perspective(400px) rotateX(0deg); opacity: 1; }`,
                            `100% { ${transformPrefix}transform: perspective(400px) rotateX(90deg); opacity: 0; }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInRight {`,
                            `0% { ${transformPrefix}transform: perspective(400px) rotateX(90deg); opacity: 0; }`,
                            `40% { ${transformPrefix}transform: perspective(400px) rotateX(-10deg); }`,
                            `70% { ${transformPrefix}transform: perspective(400px) rotateX(10deg); }`,
                            `100% { ${transformPrefix}transform: perspective(400px) rotateX(0deg); opacity: 1; }`,
                        `}`
                    ].join('\n');
                    break;
                case 'flipY':
                    effectKeyframes = [
                        `@${animationPrefix}keyframes slideOutLeft {`,
                            `0% { ${transformPrefix}transform: perspective(400px) rotateY(0deg); opacity: 1; }`,
                            `100% { ${transformPrefix}transform: perspective(400px) rotateY(90deg); opacity: 0; }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInLeft {`,
                            `0% { ${transformPrefix}transform: perspective(400px) rotateY(90deg); opacity: 0; }`,
                            `40% { ${transformPrefix}transform: perspective(400px) rotateY(-10deg); }`,
                            `70% { ${transformPrefix}transform: perspective(400px) rotateY(10deg); }`,
                            `100% { ${transformPrefix}transform: perspective(400px) rotateY(0deg); opacity: 1; }`,
                        `}`,
                        `@${animationPrefix}keyframes slideOutRight {`,
                            `0% { ${transformPrefix}transform: perspective(400px) rotateY(0deg); opacity: 1; }`,
                            `100% { ${transformPrefix}transform: perspective(400px) rotateY(-90deg); opacity: 0; }`,
                        `}`,
                        `@${animationPrefix}keyframes slideInRight {`,
                            `0% { ${transformPrefix}transform: perspective(400px) rotateY(90deg); opacity: 0; }`,
                            `40% { ${transformPrefix}transform: perspective(400px) rotateY(-10deg); }`,
                            `70% { ${transformPrefix}transform: perspective(400px) rotateY(10deg); }`,
                            `100% { ${transformPrefix}transform: perspective(400px) rotateY(0deg); opacity: 1; }`,
                        `}`
                    ].join('\n');
                    break;
            }

            const transitionClasses = [
                `.viewer-transition-out-next {`,
                    `${animationPrefix}animation: ${viewerModule.config.animationDuration}ms ease;`,
                    `${animationPrefix}animation-name: slideOutLeft;`,
                    `${animationPrefix}animation-fill-mode: both;`,
                `}`,
                `.viewer-transition-in-prev {`,
                    `${animationPrefix}animation: ${viewerModule.config.animationDuration}ms ease;`,
                    `${animationPrefix}animation-name: slideInLeft;`,
                    `${animationPrefix}animation-fill-mode: both;`,
                `}`,
                `.viewer-transition-out-prev {`,
                    `${animationPrefix}animation: ${viewerModule.config.animationDuration}ms ease;`,
                    `${animationPrefix}animation-name: slideOutRight;`,
                    `${animationPrefix}animation-fill-mode: both;`,
                `}`,
                `.viewer-transition-in-next {`,
                    `${animationPrefix}animation: ${viewerModule.config.animationDuration}ms ease;`,
                    `${animationPrefix}animation-name: slideInRight;`,
                    `${animationPrefix}animation-fill-mode: both;`,
                `}`,
                `.viewer-shake-effect {`,
                    `${animationPrefix}animation: 0.6s ease;`,
                    `${animationPrefix}animation-name: shake-it-off;`,
                `}`,
                `@${animationPrefix}keyframes shake-it-off {`,
                    `0%, 100% { ${transformPrefix}transform: translateX(0); }`,
                    `10%, 30%, 50%, 70%, 90% { ${transformPrefix}transform: translateX(-10px); }`,
                    `20%, 40%, 60%, 80% { ${transformPrefix}transform: translateX(10px); }`,
                `}`
            ].join('\n');

            const fullCss = effectKeyframes + transitionClasses;
            let styleTag = jq('#viewer-dynamic-styles');
            if (!styleTag.length) {
                styleTag = jq('<style type="text/css" id="viewer-dynamic-styles"></style>').appendTo('head');
            }
            styleTag.html(fullCss);
        };

        /**
         * Updates the enabled/disabled state of navigation controls based on current image position.
         */
        const updateNavigationStatus = function () { // Renamed from setChangeStatus
            const currentActiveImage = jq(`img[${viewerModule.config.imageSourceAttr}="${currentImageUrl}"]`);
            // Find current image within its group or parent structure
            const targetContainer = viewerModule.config.containerSelector ?
                currentActiveImage.closest(viewerModule.config.containerSelector) :
                currentActiveImage.parent();

            // Check for next image
            const hasNext = targetContainer.next().find(`img[rel="${imageGroupIdentifier}"]`).length > 0;
            if (!hasNext) {
                viewerModule.domElements['navigationControls'].find('.viewer-nav-next').addClass('disabled-control');
            } else {
                viewerModule.domElements['navigationControls'].find('.viewer-nav-next').removeClass('disabled-control');
            }

            // Check for previous image
            const hasPrev = targetContainer.prev().find(`img[rel="${imageGroupIdentifier}"]`).length > 0;
            if (!hasPrev) {
                viewerModule.domElements['navigationControls'].find('.viewer-nav-prev').addClass('disabled-control');
            } else {
                viewerModule.domElements['navigationControls'].find('.viewer-nav-prev').removeClass('disabled-control');
            }
        };

        /**
         * Placeholder function to set the image caption/title.
         * (Original `setTitle` was called but not defined.)
         */
        const setImageCaption = function () { // Renamed from setTitle
            // For example, retrieve title from data attribute of current image
            const currentImageEl = jq(`img[${viewerModule.config.imageSourceAttr}="${currentImageUrl}"]`);
            const imageTitle = currentImageEl.attr('title') || currentImageEl.attr('alt') || '';
            viewerModule.domElements['captionDisplay'].text(imageTitle);
        };

        // Initialize the plugin instance
        viewerModule.initialize();
    };

    // jQuery plugin boilerplate setup
    jq.fn.glisse = function (options) { // Keep original plugin name for compatibility, but internally use new names
        return this.each(function () {
            if (!jq.data(this, 'glissePlugin')) {
                jq.data(this, 'glissePlugin', new jq.imageViewer(this, options));
            }
        });
    };
})(jQuery, document);