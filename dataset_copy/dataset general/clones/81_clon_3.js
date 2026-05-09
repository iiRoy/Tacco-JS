(function(jqAlias) {
    "use strict"; // Enforce stricter parsing and error handling

    /**
     * @file jquery.flow-pane.js
     * @description A versatile jQuery plugin for creating carousels and image galleries.
     * @version 2.0.1
     * @license MIT License
     * @author CodeSculptor
     * @date 2023-10-27
     */

    jqAlias.fn.FlowPane = function(initialSettings) {
        // Ensure the plugin is called on a valid jQuery object
        if (!this.length) {
            console.warn('FlowPane: No elements found for initialization.');
            return this;
        }

        // Default configuration options for the carousel instance
        const defaultSettings = {
            nextControlSelector: '.next-item-btn',
            prevControlSelector: '.prev-item-btn',
            autoHideControls: false,
            presentationMode: 'standard', // 'standard' or 'gallery'
            enforceEqualHeight: false,
            animationSpeedMs: 750, // Animation duration in milliseconds
            enableDebugLogging: false,
            isTransitionActive: false, // Internal state: is an animation currently running
            loopCarousel: false, // Enable continuous looping
            initialSlideIndex: 0, // Start carousel at a specific item
            itemMarginPx: 10 // Additional margin between items for calculation
        };

        // Iterate over each selected element to apply the plugin
        return this.each(function() {
            const $thisElement = jqAlias(this); // Reference to the current DOM element wrapped in jQuery
            let widgetData = {}; // Object to hold all instance-specific variables

            // Merge user settings with defaults
            widgetData.configuration = jqAlias.extend(true, {}, defaultSettings, initialSettings);

            // Initialize core DOM references and state variables
            widgetData.hasBeenInitialized = false;
            widgetData.$contentList = $thisElement.find('ul:first');
            widgetData.$contentItems = widgetData.$contentList.find('li');
            widgetData.currentItemIndex = widgetData.configuration.initialSlideIndex;
            widgetData.uniqueContainerId = $thisElement.attr('id') || `flowpane-instance-${Math.random().toString(36).substr(2, 9)}`;
            $thisElement.attr('id', widgetData.uniqueContainerId); // Ensure an ID exists

            widgetData.$nextButton = jqAlias(widgetData.configuration.nextControlSelector, $thisElement);
            widgetData.$prevButton = jqAlias(widgetData.configuration.prevControlSelector, $thisElement);

            // Dimension-related variables
            widgetData.maxItemDisplayHeight = 0;
            widgetData.totalListScrollWidth = 0; // Not actively used but kept for potential future expansion
            widgetData.currentViewportWidth = 0;
            widgetData.itemsInViewInteger = 0; // Number of whole items visible
            widgetData.itemsInViewFractional = 0; // Fractional number of items visible
            widgetData.singleItemWidth = 0; // Width of a single content item

            // --- Core Widget Initialization Function ---
            const setupWidgetLayout = function() {
                if (widgetData.hasBeenInitialized) {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.log(`FlowPane [${widgetData.uniqueContainerId}]: Layout already set up.`);
                    }
                    return;
                }

                widgetData.hasBeenInitialized = true;
                if (widgetData.configuration.enableDebugLogging) {
                    console.info(`FlowPane [${widgetData.uniqueContainerId}]: Initializing carousel layout.`);
                    console.log(`FlowPane [${widgetData.uniqueContainerId}]: Current settings:`, widgetData.configuration);
                }

                // Apply essential CSS to the main container
                $thisElement.css({
                    'overflow': 'hidden',
                    'position': 'relative',
                    'box-sizing': 'border-box'
                });

                // Apply essential CSS to the unordered list container
                widgetData.$contentList.css({
                    'list-style': 'none',
                    'overflow': 'hidden', // This should actually be on $thisElement for a sliding effect
                    'position': 'relative',
                    'float': 'left', // Ensure items are floated correctly
                    'width': '99999px', // Sufficiently large width to prevent wrapping
                    'padding': '0',
                    'margin': '0'
                });

                // Calculate available viewport width for items
                widgetData.currentViewportWidth = $thisElement.innerWidth() - widgetData.$nextButton.outerWidth(true) - widgetData.$prevButton.outerWidth(true);

                if (widgetData.configuration.enableDebugLogging) {
                    console.log(`FlowPane [${widgetData.uniqueContainerId}]: Container inner width: ${$thisElement.innerWidth()}px`);
                    console.log(`FlowPane [${widgetData.uniqueContainerId}]: Next button width: ${widgetData.$nextButton.outerWidth(true)}px`);
                    console.log(`FlowPane [${widgetData.uniqueContainerId}]: Prev button width: ${widgetData.$prevButton.outerWidth(true)}px`);
                    console.log(`FlowPane [${widgetData.uniqueContainerId}]: Calculated viewport for items: ${widgetData.currentViewportWidth}px`);
                }

                // Process each individual list item
                let currentItemCount = 0;
                widgetData.$contentItems.each(function() {
                    const $item = jqAlias(this);
                    // Determine maximum item height for consistent display if enabled
                    widgetData.maxItemDisplayHeight = Math.max(widgetData.maxItemDisplayHeight, $item.outerHeight(true));

                    // Apply base CSS to each item
                    $item.css({
                        'list-style': 'none',
                        'position': 'relative',
                        'float': 'left',
                        'margin-right': `${widgetData.configuration.itemMarginPx}px` // Add configurable margin
                    });

                    // Handle 'gallery' presentation mode specifics
                    if (widgetData.configuration.presentationMode === 'gallery') {
                        $item.addClass(`flowpane-gallery-item-${widgetData.uniqueContainerId}`);
                        // Store a unique identifier for gallery items, e.g., for navigation
                        $item.attr('data-gallery-idx', `fp_${widgetData.uniqueContainerId}_${currentItemCount}`);
                        $item.css('cursor', 'pointer');
                        $item.on('click', handleGalleryItemClick);
                        currentItemCount++;
                    }
                });

                // If 'enforceEqualHeight' is true, set container height
                if (widgetData.configuration.enforceEqualHeight && widgetData.maxItemDisplayHeight > 0) {
                    $thisElement.css('min-height', widgetData.maxItemDisplayHeight + 'px');
                }

                // Recalculate visible item counts based on item dimensions
                recalculateDisplayMetrics();

                // Initial state for navigation controls
                updateNavigationControls();
            };

            // --- Recalculate Visible Items and Dimensions ---
            const recalculateDisplayMetrics = function() {
                if (widgetData.$contentItems.length === 0) {
                    widgetData.singleItemWidth = 0;
                    widgetData.itemsInViewInteger = 0;
                    widgetData.itemsInViewFractional = 0;
                    return;
                }
                // Get the width of the first visible item (assuming uniform width)
                widgetData.singleItemWidth = widgetData.$contentItems.first().outerWidth(true);
                if (widgetData.singleItemWidth === 0) {
                    // Fallback or error handling if item width is zero
                    if (widgetData.configuration.enableDebugLogging) {
                        console.warn(`FlowPane [${widgetData.uniqueContainerId}]: Item width is zero. Check CSS.`);
                    }
                    return;
                }

                widgetData.itemsInViewFractional = widgetData.currentViewportWidth / widgetData.singleItemWidth;
                widgetData.itemsInViewInteger = Math.floor(widgetData.itemsInViewFractional);

                if (widgetData.configuration.enableDebugLogging) {
                    console.log(`FlowPane [${widgetData.uniqueContainerId}]: Single item width: ${widgetData.singleItemWidth}px`);
                    console.log(`FlowPane [${widgetData.uniqueContainerId}]: Items visible (integer): ${widgetData.itemsInViewInteger}`);
                    console.log(`FlowPane [${widgetData.uniqueContainerId}]: Items visible (fractional): ${widgetData.itemsInViewFractional}`);
                }
            };

            // --- Update Navigation Button Visibility ---
            const updateNavigationControls = function() {
                if (widgetData.configuration.autoHideControls && !widgetData.configuration.loopCarousel) {
                    // Hide prev button if at the beginning
                    if (widgetData.currentItemIndex === 0) {
                        widgetData.$prevButton.hide();
                    } else {
                        widgetData.$prevButton.show();
                    }

                    // Hide next button if at the end
                    const totalItems = widgetData.$contentItems.length;
                    const lastPossibleIndex = totalItems - widgetData.itemsInViewInteger;
                    if (widgetData.currentItemIndex >= lastPossibleIndex) {
                        widgetData.$nextButton.hide();
                    } else {
                        widgetData.$nextButton.show();
                    }
                } else {
                    // If not auto-hiding or looping, always show buttons
                    widgetData.$nextButton.show();
                    widgetData.$prevButton.show();
                }
            };

            // --- Advance to Next Item ---
            const advanceCarousel = function() {
                if (widgetData.configuration.isTransitionActive || !widgetData.hasBeenInitialized) {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.log(`FlowPane [${widgetData.uniqueContainerId}]: Next blocked (animating or not initialized).`);
                    }
                    return false;
                }

                const totalItems = widgetData.$contentItems.length;
                if (totalItems <= widgetData.itemsInViewInteger && !widgetData.configuration.loopCarousel) {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.log(`FlowPane [${widgetData.uniqueContainerId}]: Not enough items to scroll next.`);
                    }
                    return false;
                }

                widgetData.configuration.isTransitionActive = true;

                let targetIndex = widgetData.currentItemIndex + 1;
                if (targetIndex >= totalItems - widgetData.itemsInViewInteger + 1) { // Check if we're at the end
                    if (widgetData.configuration.loopCarousel) {
                        // For looping, move the first item to the end without animation
                        widgetData.$contentItems.first().appendTo(widgetData.$contentList).css('left', '0px');
                        widgetData.currentItemIndex = 0; // Reset index after repositioning
                        targetIndex = 1; // Then advance to the first actual slide
                    } else {
                        widgetData.configuration.isTransitionActive = false;
                        updateNavigationControls();
                        if (widgetData.configuration.enableDebugLogging) {
                            console.log(`FlowPane [${widgetData.uniqueContainerId}]: Reached end, not looping.`);
                        }
                        return false;
                    }
                }

                const newPosition = -targetIndex * widgetData.singleItemWidth;

                widgetData.$contentList.animate({
                    left: newPosition + 'px'
                }, widgetData.configuration.animationSpeedMs, function() {
                    widgetData.currentItemIndex = targetIndex;
                    widgetData.configuration.isTransitionActive = false;
                    updateNavigationControls();
                    if (widgetData.configuration.enableDebugLogging) {
                        console.log(`FlowPane [${widgetData.uniqueContainerId}]: Advanced to index ${widgetData.currentItemIndex}`);
                    }
                });

                return false; // Prevent default button action
            };


            // --- Retreat to Previous Item ---
            const retreatCarousel = function() {
                if (widgetData.configuration.isTransitionActive || !widgetData.hasBeenInitialized) {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.log(`FlowPane [${widgetData.uniqueContainerId}]: Prev blocked (animating or not initialized).`);
                    }
                    return false;
                }

                const totalItems = widgetData.$contentItems.length;
                if (totalItems <= widgetData.itemsInViewInteger && !widgetData.configuration.loopCarousel) {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.log(`FlowPane [${widgetData.uniqueContainerId}]: Not enough items to scroll prev.`);
                    }
                    return false;
                }

                widgetData.configuration.isTransitionActive = true;

                let targetIndex = widgetData.currentItemIndex - 1;
                if (targetIndex < 0) {
                    if (widgetData.configuration.loopCarousel) {
                        // For looping, move the last item to the beginning without animation
                        widgetData.$contentItems.last().prependTo(widgetData.$contentList).css('left', '-100%'); // Temporarily position it
                        widgetData.currentItemIndex = totalItems - 1; // Update index to the new last item
                        targetIndex = totalItems - 2; // Target the item before it
                    } else {
                        widgetData.configuration.isTransitionActive = false;
                        updateNavigationControls();
                        if (widgetData.configuration.enableDebugLogging) {
                            console.log(`FlowPane [${widgetData.uniqueContainerId}]: Reached beginning, not looping.`);
                        }
                        return false;
                    }
                }

                const newPosition = -targetIndex * widgetData.singleItemWidth;

                widgetData.$contentList.animate({
                    left: newPosition + 'px'
                }, widgetData.configuration.animationSpeedMs, function() {
                    widgetData.currentItemIndex = targetIndex;
                    widgetData.configuration.isTransitionActive = false;
                    updateNavigationControls();
                    if (widgetData.configuration.enableDebugLogging) {
                        console.log(`FlowPane [${widgetData.uniqueContainerId}]: Retreated to index ${widgetData.currentItemIndex}`);
                    }
                });

                return false; // Prevent default button action
            };


            // --- Modal Overlay Functions for Gallery Mode ---
            const showModalOverlay = function(modalOptions, contentHtml, onModalReady) {
                const modalDefaults = {
                    modalWidth: 'auto',
                    modalHeight: 'auto',
                    canClose: true,
                    modalType: 'standard', // 'standard' or 'gallery'
                    customStyle: '',
                    currentGalleryIndex: null
                };
                const currentModalOpts = jqAlias.extend({}, modalDefaults, modalOptions);

                let closeButtonHtml = '';
                let nextNavHtml = '';
                let prevNavHtml = '';

                if (currentModalOpts.modalType === 'gallery') {
                    nextNavHtml = `<div id="fpModalNavNext" class="fp-modal-nav-arrow fp-modal-nav-next" data-gallery-idx="${currentModalOpts.currentGalleryIndex}"></div>`;
                    prevNavHtml = `<div id="fpModalNavPrev" class="fp-modal-nav-arrow fp-modal-nav-prev" data-gallery-idx="${currentModalOpts.currentGalleryIndex}"></div>`;
                }
                if (currentModalOpts.canClose) {
                    closeButtonHtml = '<button id="fpModalCloseBtn" class="fp-modal-close-button" title="Close Modal">&times;</button>';
                }

                // Append modal backdrop if it doesn't exist
                if (jqAlias('#fpModalBackdrop').length === 0) {
                    jqAlias('body').append('<div id="fpModalBackdrop" class="fp-modal-backdrop"></div>');
                }
                // Append modal content box if it doesn't exist
                if (jqAlias('#fpModalContentBox').length === 0) {
                    jqAlias('body').append(`<div id="fpModalContentBox" class="fp-modal-content-box" style="display:none; width:${currentModalOpts.modalWidth}; height:${currentModalOpts.modalHeight}; ${currentModalOpts.customStyle}"></div>`);
                }

                // Update content and style if box already exists
                const $modalBox = jqAlias('#fpModalContentBox');
                $modalBox.css({
                    width: currentModalOpts.modalWidth,
                    height: currentModalOpts.modalHeight
                }).html(`${contentHtml}${closeButtonHtml}${nextNavHtml}${prevNavHtml}`);

                attachModalEventHandlers(currentModalOpts, onModalReady);
            };

            const attachModalEventHandlers = function(opts, callbackFn) {
                const $modalBox = jqAlias('#fpModalContentBox');

                // Center the modal box dynamically
                const centerModal = function() {
                    $modalBox.css({
                        'top': '50%',
                        'left': '50%',
                        'transform': 'translate(-50%, -50%)',
                        'margin-top': '', // Clear old margin-top
                        'margin-left': '' // Clear old margin-left
                    });
                };
                centerModal(); // Initial centering

                // Re-center on window resize (debounced for performance)
                let resizeTimer;
                jqAlias(window).off('resize.fpModal').on('resize.fpModal', function() {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(centerModal, 100);
                });

                if (opts.canClose) {
                    jqAlias('#fpModalBackdrop').off('click.fpModal').on('click.fpModal', hideModalOverlay);
                    jqAlias('#fpModalCloseBtn').off('click.fpModal').on('click.fpModal', hideModalOverlay);
                }
                if (opts.modalType === 'gallery') {
                    jqAlias('#fpModalNavNext').off('click.fpModal').on('click.fpModal', navigateGalleryNext);
                    jqAlias('#fpModalNavPrev').off('click.fpModal').on('click.fpModal', navigateGalleryPrev);
                }

                // Show modal with animation
                if ($modalBox.is(':hidden')) {
                    $modalBox.fadeIn(200, function() {
                        if (typeof callbackFn === 'function') {
                            callbackFn();
                        }
                    });
                } else {
                    if (typeof callbackFn === 'function') {
                        callbackFn();
                    }
                }
            };

            const hideModalOverlay = function() {
                jqAlias(window).off('resize.fpModal'); // Clean up resize handler
                jqAlias('#fpModalBackdrop').fadeOut(200, function() {
                    jqAlias(this).remove();
                });
                jqAlias('#fpModalContentBox').fadeOut(200, function() {
                    jqAlias(this).remove();
                });
            };

            // --- Gallery Specific Logic ---
            const handleGalleryItemClick = function() {
                const $clickedItem = jqAlias(this);
                const imageSource = $clickedItem.find('img').attr('data-full-src') || $clickedItem.find('img').attr('src');
                const galleryIdentifier = $clickedItem.attr('data-gallery-idx');
                if (imageSource) {
                    loadImageInModal(galleryIdentifier, imageSource);
                } else {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.warn(`FlowPane [${widgetData.uniqueContainerId}]: Image source not found for gallery item.`, $clickedItem);
                    }
                }
            };

            const getGalleryItemIdentifiers = function() {
                const identifiers = [];
                jqAlias(`.flowpane-gallery-item-${widgetData.uniqueContainerId}`).each(function() {
                    identifiers.push(jqAlias(this).attr('data-gallery-idx'));
                });
                return identifiers;
            };

            const navigateGalleryPrev = function() {
                const currentIdentifier = jqAlias(this).attr('data-gallery-idx');
                const allIdentifiers = getGalleryItemIdentifiers();
                let currentIdxInList = allIdentifiers.indexOf(currentIdentifier);

                if (currentIdxInList === -1) {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.error(`FlowPane [${widgetData.uniqueContainerId}]: Current gallery item identifier not found.`);
                    }
                    return;
                }

                const prevIdx = (currentIdxInList - 1 + allIdentifiers.length) % allIdentifiers.length;
                const targetIdentifier = allIdentifiers[prevIdx];
                const $targetItem = jqAlias(`li[data-gallery-idx="${targetIdentifier}"]`, widgetData.$contentList);
                const targetImageSrc = $targetItem.find('img').attr('data-full-src') || $targetItem.find('img').attr('src');

                if (targetImageSrc) {
                    loadImageInModal(targetIdentifier, targetImageSrc);
                } else {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.warn(`FlowPane [${widgetData.uniqueContainerId}]: Previous image source not found.`);
                    }
                }
            };

            const navigateGalleryNext = function() {
                const currentIdentifier = jqAlias(this).attr('data-gallery-idx');
                const allIdentifiers = getGalleryItemIdentifiers();
                let currentIdxInList = allIdentifiers.indexOf(currentIdentifier);

                if (currentIdxInList === -1) {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.error(`FlowPane [${widgetData.uniqueContainerId}]: Current gallery item identifier not found.`);
                    }
                    return;
                }

                const nextIdx = (currentIdxInList + 1) % allIdentifiers.length;
                const targetIdentifier = allIdentifiers[nextIdx];
                const $targetItem = jqAlias(`li[data-gallery-idx="${targetIdentifier}"]`, widgetData.$contentList);
                const targetImageSrc = $targetItem.find('img').attr('data-full-src') || $targetItem.find('img').attr('src');

                if (targetImageSrc) {
                    loadImageInModal(targetIdentifier, targetImageSrc);
                } else {
                    if (widgetData.configuration.enableDebugLogging) {
                        console.warn(`FlowPane [${widgetData.uniqueContainerId}]: Next image source not found.`);
                    }
                }
            };

            const loadImageInModal = function(galleryIdentifier, imageUrl) {
                const loadingHtml = '<div style="text-align:center; padding:40px; color:#555;">Loading image...</div>';
                const initialModalOpts = {
                    customStyle: 'padding:20px;',
                    canClose: false // Temporarily disable close during loading
                };

                // Show a loading state in the modal
                showModalOverlay(initialModalOpts, loadingHtml, function() {
                    const tempImage = new Image();
                    tempImage.onload = function() {
                        const finalModalOpts = {
                            modalWidth: `${this.width}px`,
                            modalHeight: `${this.height}px`,
                            modalType: 'gallery',
                            currentGalleryIndex: galleryIdentifier,
                            canClose: true
                        };
                        showModalOverlay(finalModalOpts, `<img src="${this.src}" alt="Gallery Image" style="display:block; max-width:100%; height:auto;">`);
                    };
                    tempImage.onerror = function() {
                        const errorModalOpts = {
                            modalWidth: '300px',
                            modalHeight: '150px',
                            canClose: true
                        };
                        showModalOverlay(errorModalOpts, '<div style="text-align:center; padding:20px; color:red;">Error loading image.</div>');
                        if (widgetData.configuration.enableDebugLogging) {
                            console.error(`FlowPane [${widgetData.uniqueContainerId}]: Failed to load image: ${imageUrl}`);
                        }
                    };
                    // Add a cache-busting parameter to the image URL
                    tempImage.src = `${imageUrl}?v=${new Date().getTime()}`;
                });
            };

            // --- Event Bindings ---
            widgetData.$nextButton.on('click', advanceCarousel);
            widgetData.$prevButton.on('click', retreatCarousel);

            // Initialize layout once the window has fully loaded all assets
            jqAlias(window).on('load', setupWidgetLayout);

            // Optionally, re-calculate layout on window resize (debounced)
            let resizeTimeout;
            jqAlias(window).on('resize', function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    if (widgetData.hasBeenInitialized) {
                        widgetData.currentViewportWidth = $thisElement.innerWidth() - widgetData.$nextButton.outerWidth(true) - widgetData.$prevButton.outerWidth(true);
                        recalculateDisplayMetrics();
                        updateNavigationControls();
                        // Adjust current position if necessary after resize, to prevent empty space
                        const newPosition = -widgetData.currentItemIndex * widgetData.singleItemWidth;
                        widgetData.$contentList.css('left', newPosition + 'px');
                        if (widgetData.configuration.enableDebugLogging) {
                            console.log(`FlowPane [${widgetData.uniqueContainerId}]: Layout re-calculated on resize.`);
                        }
                    }
                }, 250); // 250ms debounce
            });
        });
    };
})(jQuery);