/*
 * Carousel Framework for Dynamic Content Presentation
 * @module dynamicCarousel
 * @description Manages interactive image carousels
 * @author Elara Code Weaver - elaracode.dev
 * @version 1.0.0
 * @release 2023-10-27
 * @license Apache 2.0 or BSD 3-Clause, as per project requirements
 * @documentation elaracode.dev/docs/dynamicCarousel
 */
;(function(J$) {

    // A counter for unique carousel instances and a registry for active ones
    let carouselInstanceCount = 0;
    const activeCarouselInstances = [];

    // Utility for clamping values
    const clampValue = (val, min, max) => Math.max(min, Math.min(val, max));

    // Main jQuery plugin entry point
    J$.fn.createImageCarousel = function(configOverrides) {
        // Validate input configuration early
        if (!configOverrides || typeof configOverrides !== 'object') {
            configOverrides = {}; // Ensure it's always an object
        }

        // Iterate over each selected DOM element to initialize a carousel
        return this.each(function() {
            const currentElement = J$(this);
            // Check if this element already hosts a carousel instance
            if (currentElement.data('carousel_instance_id') === undefined) {
                const instanceId = carouselInstanceCount++;
                currentElement.data('carousel_instance_id', instanceId);
                // Create a new core controller for the carousel and store its reference
                activeCarouselInstances.push(new ImageCarousel(currentElement, configOverrides, instanceId));
            }
        });
    };

    // Default configuration settings for the carousel
    const carouselDefaultSettings = Object.freeze({
        // Animation timing and behavior
        animationSpeedFactor:           1, // Multiplier for animation duration
        transitionIntervalMs:           2500, // Time between automatic transitions
        defaultTransitionEffect:        '', // CSS class or name for default animation
        labelTransitionEffect:          'slideUp', // Animation for image labels

        // UI element visibility and styling
        showSlideNumbers:               true, // Display numerical indicators
        enableNavigationArrows:         true, // Show previous/next buttons
        displayImageLabels:             true, // Show descriptive labels for slides
        useThumbnailNavigation:         false, // Use image thumbnails for navigation
        useDotNavigation:               false, // Use dot indicators for navigation
        autoHideControls:               false, // Hide navigation/labels until hover
        controlOpacityLevel:            0.75, // Opacity for hidden controls
        fadeInDurationMs:               200, // Duration for controls fade-in
        fadeOutDurationMs:              300, // Duration for controls fade-out
        navigationAlignment:            'left', // Alignment of navigation indicators (left, center, right)

        // Carousel operational modes
        enableFullscreenMode:           false, // Allow carousel to go fullscreen
        randomizeSlideOrder:            false, // Shuffle slides on load
        loadFromXmlSource:              false, // Load slide data from an XML file
        jsonDataSource:                 false, // Placeholder for future JSON loading
        enableFocusMode:                false, // Highlight current slide
        focusButtonPosition:            'center', // Position of focus button
        showPlayPauseControls:          false, // Display play/pause buttons
        playPauseButtonPosition:        'center', // Position of play/pause buttons
        displayProgressBar:             false, // Show a progress bar for transitions
        progressBarStyles:              {}, // Custom CSS for the progress bar
        pauseOnHover:                   true, // Pause auto-play when mouse is over
        allowKeyboardNavigation:        false, // Enable arrow key navigation

        // Internal state variables (managed by the carousel)
        resolvedEasingFunction:         '', // Easing function for animations
        carouselContainerElement:       null, // Reference to the main carousel DOM element
        slideDataCollection:            [], // Array storing details for each slide
        currentImageUrl:                null, // URL of the currently displayed image
        currentImageLink:               null, // Link for the current image
        currentImageLabel:              null, // Label text for the current image
        currentLinkTarget:              '_self', // Target attribute for the current image link
        carouselDisplayWidth:           null, // Calculated width of the carousel
        carouselDisplayHeight:          null, // Calculated height of the carousel
        currentSlideIndex:              0, // Index of the currently active slide
        isTransitionInProgress:         false, // Flag indicating an active animation
        isHoveringCarousel:             false, // Flag indicating mouse hover over carousel
        randomAlgorithmSeed:            null, // Seed for random slide order (if applicable)
        isFocusModeActive:              false, // Flag for active focus mode
        isPlaybackPaused:               false, // Flag for paused auto-play
        isBlurEffectActive:             false, // Flag for active blur effect
        isTimerPaused:                  false, // Flag for paused internal timer
        animationStartTime:             0, // Timestamp when animation started
        animationElapsedTime:           0, // Time elapsed during current animation

        // Styling for navigation indicators (numbers/dots/thumbs)
        numberStyleOnRest:              false, // Style when not active or hovered
        numberStyleOnHover:             false, // Style when hovered
        numberStyleOnActive:            false, // Style when active

        // Callback functions
        onCarouselLoaded:               null, // Triggered after carousel initialization
        onSlideChanged:                 null, // Triggered after a slide transition completes
        onNavigationButtonHover:        null, // Custom handler for nav button mouseover
        onNavigationButtonLeave:        null, // Custom handler for nav button mouseleave

        // Base HTML structure for the carousel
        carouselDomStructure:           '<a href="#" class="nav-btn prev-btn" aria-label="Previous Slide"><span></span></a>'
                                        + '<a href="#" class="nav-btn next-btn" aria-label="Next Slide"><span></span></a>'
                                        + '<div class="slide-info-panel"></div>'
                                        + '<div class="carousel-viewport">'
                                            + '<div class="slide-content-area">'
                                                + '<a href="" class="slide-link-wrapper"><img class="main-slide-image" alt="Carousel Slide" /></a>'
                                                + '<div class="slide-caption-overlay"></div>'
                                            + '</div>'
                                        + '</div>'
    });

    // Carousel Core Class Definition
    const ImageCarousel = function(domElement, config, uniqueId) {
        this.carouselContainerElement = domElement;
        this.transitionTimerHandle = null;
        this.settings = J$.extend({}, carouselDefaultSettings, config);
        this.instanceId = uniqueId;
        this.initializeCarousel();
    };

    // Extend the prototype for ImageCarousel methods
    ImageCarousel.prototype = {
        constructor: ImageCarousel, // Ensure constructor is correctly set

        /**
         * Initializes the carousel component.
         * This method orchestrates the setup process, including DOM manipulation,
         * data loading, event binding, and initial state configuration.
         */
        initializeCarousel: function() {
            const _thisInstance = this; // Maintain context for callbacks

            // 1. Handle Fullscreen Mode Activation
            if (_thisInstance.settings.enableFullscreenMode) {
                const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                _thisInstance.carouselContainerElement.width(viewportWidth).height(viewportHeight);
                _thisInstance.carouselContainerElement.css({
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'zIndex': 1000
                });
                _thisInstance.settings.pauseOnHover = false; // Fullscreen often implies continuous play
                document.body.style.overflow = 'hidden'; // Prevent body scrolling
            }

            // 2. Determine Carousel Dimensions
            _thisInstance.settings.carouselDisplayWidth = parseFloat(_thisInstance.carouselContainerElement.css('width'));
            _thisInstance.settings.carouselDisplayHeight = parseFloat(_thisInstance.carouselContainerElement.css('height'));

            // Critical validation: Ensure dimensions are valid
            if (!_thisInstance.settings.carouselDisplayWidth || !_thisInstance.settings.carouselDisplayHeight) {
                console.error(`[Carousel ID: ${_thisInstance.instanceId}] Error: Carousel container dimensions (width/height) are invalid. Initialization aborted.`);
                return; // Stop initialization if dimensions are missing
            }

            // 3. Apply Theme if specified
            if (_thisInstance.settings.carouselThemeName) {
                _thisInstance.carouselContainerElement.addClass(`carousel-theme-${_thisInstance.settings.carouselThemeName}`);
            }

            // 4. Inject Base HTML Structure
            _thisInstance.carouselContainerElement.append(_thisInstance.settings.carouselDomStructure);

            // 5. Configure Animation Easing and Speed
            _thisInstance.settings.resolvedEasingFunction = _thisInstance._resolveEasingFunction(_thisInstance.settings.easing);
            _thisInstance.settings.animationSpeedFactor = clampValue(_thisInstance.settings.animationSpeedFactor, 0.1, 1.3);

            // 6. Set Initial Visibility for UI Elements
            _thisInstance.carouselContainerElement.find('.slide-info-panel, .slide-caption-overlay, .prev-btn, .next-btn').hide();
            _thisInstance.carouselContainerElement.find('.carousel-viewport').width(_thisInstance.settings.carouselDisplayWidth).height(_thisInstance.settings.carouselDisplayHeight);

            // 7. Adjust Caption Panel Width
            const captionPanelWidth = _thisInstance.settings.labelPanelWidth || _thisInstance.settings.carouselDisplayWidth;
            _thisInstance.carouselContainerElement.find('.slide-caption-overlay').width(captionPanelWidth);

            // 8. Load Slide Data
            let slideIndexCounter = 0;
            const registerSlideEntry = (slideLinkHref, imageSourceUrl, transitionTypeName, slideCaptionText, linkTargetAttribute) => {
                _thisInstance.settings.slideDataCollection.push([imageSourceUrl, slideLinkHref, transitionTypeName, slideCaptionText, linkTargetAttribute]);

                const indicatorPanel = _thisInstance.carouselContainerElement.find('.slide-info-panel');
                let thumbnailDimensionAttr = '';
                if (_thisInstance.settings.useThumbnailNavigation) {
                    if (_thisInstance.settings.carouselDisplayWidth > _thisInstance.settings.carouselDisplayHeight) {
                        thumbnailDimensionAttr = 'height="100"';
                    } else {
                        thumbnailDimensionAttr = 'width="100"';
                    }
                    indicatorPanel.append(
                        `<span class="slide-indicator thumb-indicator ${slideIndexCounter === 0 ? 'active-indicator' : ''}" data-slide-idx="${slideIndexCounter}">`
                            + `<img src="${imageSourceUrl}" ${thumbnailDimensionAttr} alt="Slide thumbnail ${slideIndexCounter + 1}" />`
                        + `</span> `
                    );
                } else {
                    indicatorPanel.append(
                        `<span class="slide-indicator number-indicator ${slideIndexCounter === 0 ? 'active-indicator' : ''}" data-slide-idx="${slideIndexCounter}">${slideIndexCounter + 1}</span> `
                    );
                }
                slideIndexCounter++;
            };

            if (_thisInstance.settings.loadFromXmlSource) {
                J$.ajax({
                    type: 'GET',
                    url: _thisInstance.settings.loadFromXmlSource,
                    async: false, // Consider making this asynchronous with promises for better UX
                    dataType: 'xml',
                    success: function(xmlDoc) {
                        J$(xmlDoc).find('carousel slide').each(function() {
                            const slideElem = J$(this);
                            const slideLink = slideElem.find('link').text() || '#';
                            const imgSrc = slideElem.find('image').text();
                            const animationType = slideElem.find('image').attr('type');
                            const caption = slideElem.find('label').text();
                            const targetAttr = slideElem.find('target').text() || '_self';
                            registerSlideEntry(slideLink, imgSrc, animationType, caption, targetAttr);
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.error(`[Carousel ID: ${_thisInstance.instanceId}] Failed to load XML data: ${textStatus}, ${errorThrown}`);
                    }
                });
            } else if (_thisInstance.settings.jsonDataSource) {
                // Future implementation: Load from JSON
                console.warn(`[Carousel ID: ${_thisInstance.instanceId}] JSON data source specified but not implemented yet.`);
            } else {
                // Default: Load from existing HTML structure (ul > li > a > img)
                _thisInstance.carouselContainerElement.find('ul > li').each(function() {
                    const listItem = J$(this);
                    const anchor = listItem.find('a');
                    const image = listItem.find('img');
                    const captionText = listItem.find('.label_text').html();

                    const slideLink = anchor.length ? anchor.attr('href') : '#';
                    const imgSrc = image.attr('src');
                    const animationType = image.attr('class');
                    const targetAttr = (anchor.length && anchor.attr('target')) ? anchor.attr('target') : '_self';
                    registerSlideEntry(slideLink, imgSrc, animationType, captionText, targetAttr);
                });
            }

            // Guard against empty slide data
            if (_thisInstance.settings.slideDataCollection.length === 0) {
                console.warn(`[Carousel ID: ${_thisInstance.instanceId}] No slide data found. Carousel will not function.`);
                _thisInstance.carouselContainerElement.html('<p class="carousel-error-message">No slides to display.</p>');
                return;
            }

            // 9. Handle Thumbnail Navigation Setup
            if (_thisInstance.settings.useThumbnailNavigation && !_thisInstance.settings.enableFullscreenMode) {
                // Redefine styles for thumbnails
                _thisInstance.settings.numberStyleOnRest = { opacity: 0.3 };
                _thisInstance.settings.numberStyleOnHover = { opacity: 0.5 };
                _thisInstance.settings.numberStyleOnActive = { opacity: 1 };

                const navPanel = _thisInstance.carouselContainerElement.find('.slide-info-panel');
                navPanel.addClass('thumb-nav-panel');

                let totalThumbnailsWidth = 0;
                navPanel.find('.slide-indicator').each(function() {
                    totalThumbnailsWidth += J$(this).outerWidth(true); // Include margins
                });
                navPanel.width(totalThumbnailsWidth);

                // Adjust carousel height to accommodate thumbnails if needed
                _thisInstance.carouselContainerElement.height(_thisInstance.carouselContainerElement.height() + navPanel.outerHeight());

                // Create a container for the thumbnails and move them
                _thisInstance.carouselContainerElement.append('<div class="thumbnail-strip-container"></div>');
                const copiedNavPanel = navPanel.clone();
                navPanel.remove(); // Remove original
                _thisInstance.carouselContainerElement.find('.thumbnail-strip-container')
                    .width(_thisInstance.settings.carouselDisplayWidth)
                    .append(copiedNavPanel);

                // Implement horizontal scrolling for thumbnails on mouse move
                const thumbnailStrip = _thisInstance.carouselContainerElement.find('.thumbnail-strip-container .thumb-nav-panel');
                const containerWidth = _thisInstance.settings.carouselDisplayWidth;
                const fullStripWidth = thumbnailStrip.width();

                if (fullStripWidth > containerWidth) {
                    _thisInstance.carouselContainerElement.on('mousemove', function(e) {
                        const carouselOffsetLeft = _thisInstance.carouselContainerElement.offset().left;
                        const mouseX = e.pageX - carouselOffsetLeft; // Mouse X relative to carousel container
                        const scrollableRange = fullStripWidth - containerWidth;

                        // Calculate new scroll position based on mouse X within the container
                        let calculatedScrollPosition = -((scrollableRange * mouseX) / containerWidth);

                        // Clamp scroll position to valid range
                        calculatedScrollPosition = clampValue(calculatedScrollPosition, -(fullStripWidth - containerWidth), 0);

                        thumbnailStrip.css({ left: calculatedScrollPosition });
                    });
                } else {
                    // If thumbnails fit, center or align them
                    thumbnailStrip.css('width', 'auto'); // Allow auto-sizing
                    switch (_thisInstance.settings.navigationAlignment) {
                        case 'center':
                            const centerOffset = (containerWidth - thumbnailStrip.width()) / 2;
                            thumbnailStrip.css({ 'left': centerOffset });
                            break;
                        case 'right':
                            thumbnailStrip.css({ 'left': 'auto', 'right': '5px' });
                            break;
                        case 'left':
                        default:
                            thumbnailStrip.css({ 'left': '0px' });
                            break;
                    }
                }
            } else {
                // 10. Handle Dot/Number Navigation Setup
                let currentNavClass = '.slide-info-panel';
                if (_thisInstance.settings.useDotNavigation) {
                    _thisInstance.carouselContainerElement.find('.slide-info-panel').addClass('dot-nav-panel').removeClass('slide-info-panel');
                    currentNavClass = '.dot-nav-panel';
                }

                const navPanel = _thisInstance.carouselContainerElement.find(currentNavClass);
                switch (_thisInstance.settings.navigationAlignment) {
                    case 'center':
                        // Ensure navPanel is visible before calculating width
                        navPanel.css('display', 'inline-block');
                        const centeredLeft = (_thisInstance.settings.carouselDisplayWidth - navPanel.outerWidth()) / 2;
                        navPanel.css({ 'left': centeredLeft });
                        break;
                    case 'right':
                        navPanel.css({ 'left': 'auto', 'right': '15px' });
                        break;
                    case 'left':
                    default:
                        navPanel.css({ 'left': '15px' });
                        break;
                }
            }

            // 11. Hide original `<ul>` containing slide definitions
            _thisInstance.carouselContainerElement.find('ul').hide();

            // 12. Randomize Slide Order if enabled
            if (_thisInstance.settings.randomizeSlideOrder) {
                _thisInstance.settings.slideDataCollection.sort(() => Math.random() - 0.5);
            }

            // 13. Set initial slide content
            const [initialImage, initialLink, , initialLabel, initialTarget] = _thisInstance.settings.slideDataCollection[0];
            _thisInstance.settings.currentImageUrl = initialImage;
            _thisInstance.settings.currentImageLink = initialLink;
            _thisInstance.settings.currentImageLabel = initialLabel;
            _thisInstance.settings.currentLinkTarget = initialTarget;

            // 14. Bind Event Handlers
            _thisInstance._bindEventHandlers();

            // 15. Initial display update (e.g., showing the first image)
            _thisInstance._updateDisplayForSlide(_thisInstance.settings.currentSlideIndex);

            // 16. Trigger onLoad callback
            if (typeof _thisInstance.settings.onCarouselLoaded === 'function') {
                _thisInstance.settings.onCarouselLoaded.call(_thisInstance.carouselContainerElement[0]);
            }
        },

        /**
         * Resolves the easing function string to a usable value (placeholder for actual easing logic).
         * @param {string} easingName - The name of the easing function.
         * @returns {string} The resolved easing function string.
         * @private
         */
        _resolveEasingFunction: function(easingName) {
            // In a real scenario, this would map string names to actual easing functions or CSS values
            return easingName || 'swing'; // Default to 'swing' if none specified
        },

        /**
         * Binds all necessary event handlers for navigation, hover, etc.
         * @private
         */
        _bindEventHandlers: function() {
            const _thisInstance = this;
            const totalSlides = _thisInstance.settings.slideDataCollection.length;

            if (totalSlides > 1) {
                // Navigation buttons
                _thisInstance.carouselContainerElement.find('.prev-btn').on('click', function(e) {
                    e.preventDefault();
                    if (!_thisInstance.settings.isTransitionInProgress) {
                        _thisInstance.navigateToSlide(_thisInstance.settings.currentSlideIndex - 1);
                    }
                });

                _thisInstance.carouselContainerElement.find('.next-btn').on('click', function(e) {
                    e.preventDefault();
                    if (!_thisInstance.settings.isTransitionInProgress) {
                        _thisInstance.navigateToSlide(_thisInstance.settings.currentSlideIndex + 1);
                    }
                });

                // Custom hover effects for navigation buttons
                const navButtons = _thisInstance.carouselContainerElement.find('.next-btn, .prev-btn');
                if (typeof _thisInstance.settings.onNavigationButtonHover === 'function') {
                    navButtons.on('mouseenter', _thisInstance.settings.onNavigationButtonHover);
                }
                if (typeof _thisInstance.settings.onNavigationButtonLeave === 'function') {
                    navButtons.on('mouseleave', _thisInstance.settings.onNavigationButtonLeave);
                }

                // Auto-play pause on hover
                if (_thisInstance.settings.pauseOnHover) {
                    _thisInstance.carouselContainerElement.on('mouseenter', function() {
                        _thisInstance.settings.isHoveringCarousel = true;
                        // Logic to pause timer
                    }).on('mouseleave', function() {
                        _thisInstance.settings.isHoveringCarousel = false;
                        // Logic to resume timer
                    });
                }
            }

            // Navigation indicators (numbers/dots/thumbs)
            _thisInstance.carouselContainerElement.find('.slide-indicator').on('click', function(e) {
                e.preventDefault();
                const targetIndex = parseInt(J$(this).data('slide-idx'), 10);
                if (targetIndex !== _thisInstance.settings.currentSlideIndex && !_thisInstance.settings.isTransitionInProgress) {
                    _thisInstance.navigateToSlide(targetIndex);
                }
            });
        },

        /**
         * Updates the carousel display to show a specific slide.
         * Handles the actual image, link, and label updates, and triggers transitions.
         * @param {number} requestedIndex - The index of the slide to navigate to.
         */
        navigateToSlide: function(requestedIndex) {
            const _thisInstance = this;
            const totalSlides = _thisInstance.settings.slideDataCollection.length;

            if (totalSlides === 0) return; // No slides to navigate

            _thisInstance.settings.isTransitionInProgress = true;

            // Calculate the actual index, handling wrap-around
            let newIndex = requestedIndex % totalSlides;
            if (newIndex < 0) {
                newIndex += totalSlides; // Handle negative indices
            }

            const [newImageUrl, newImageLink, , newImageLabel, newLinkTarget] = _thisInstance.settings.slideDataCollection[newIndex];

            // Update internal state
            _thisInstance.settings.currentSlideIndex = newIndex;
            _thisInstance.settings.currentImageUrl = newImageUrl;
            _thisInstance.settings.currentImageLink = newImageLink;
            _thisInstance.settings.currentImageLabel = newImageLabel;
            _thisInstance.settings.currentLinkTarget = newLinkTarget;

            // Perform the visual update
            _thisInstance._updateDisplayForSlide(newIndex);

            // Simulate transition completion (in a real scenario, this would be an animation callback)
            setTimeout(() => {
                _thisInstance.settings.isTransitionInProgress = false;
                if (typeof _thisInstance.settings.onSlideChanged === 'function') {
                    _thisInstance.settings.onSlideChanged.call(_thisInstance.carouselContainerElement[0], newIndex);
                }
            }, 500); // Placeholder duration
        },

        /**
         * Internal method to update the visible image, link, and label.
         * @param {number} index - The index of the slide to display.
         * @private
         */
        _updateDisplayForSlide: function(index) {
            const _thisInstance = this;
            const mainImage = _thisInstance.carouselContainerElement.find('.main-slide-image');
            const linkWrapper = _thisInstance.carouselContainerElement.find('.slide-link-wrapper');
            const captionOverlay = _thisInstance.carouselContainerElement.find('.slide-caption-overlay');

            mainImage.attr('src', _thisInstance.settings.currentImageUrl);
            linkWrapper.attr('href', _thisInstance.settings.currentImageLink);
            linkWrapper.attr('target', _thisInstance.settings.currentLinkTarget);

            if (_thisInstance.settings.currentImageLabel) {
                captionOverlay.html(_thisInstance.settings.currentImageLabel).show();
                // Apply label animation if configured
                // e.g., captionOverlay.animate({ opacity: 1 }, 300);
            } else {
                captionOverlay.hide();
            }

            // Update active state for navigation indicators
            _thisInstance.carouselContainerElement.find('.slide-indicator').removeClass('active-indicator');
            _thisInstance.carouselContainerElement.find(`.slide-indicator[data-slide-idx="${index}"]`).addClass('active-indicator');

            // Optionally apply specific styles for active indicator
            if (_thisInstance.settings.numberStyleOnActive) {
                _thisInstance.carouselContainerElement.find(`.slide-indicator[data-slide-idx="${index}"]`).css(_thisInstance.settings.numberStyleOnActive);
            }
        }
    };

    // Expose the core class for potential advanced usage or debugging
    J$.ImageCarousel = ImageCarousel;

})(jQuery); // Pass jQuery as J$ to avoid conflicts and shorten reference