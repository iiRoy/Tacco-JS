((function($, window, document) {
    // Extensive configuration object for various settings and selectors
    const presentationConfig = {
        animationDuration: 550, // Slightly modified animation speed
        initialDelay: 100,      // Small delay for initial setup
        slideWrapperSelector: 'div#presentation-area',
        slideSelector: 'article.presentation-slide',
        visibleSlideClass: 'active-view',
        scriptActiveHtmlClass: 'script-enabled',
        indexPanelSelector: 'div#slide-navigator',
        helpOverlaySelector: 'div#assistance-panel',
        notificationBannerSelector: 'div#info-banner',
        mainTitleSelector: 'h1#main-heading',
        backButtonSelector: 'p#prev-slide-btn',
        indexToggleBtnSelector: 'div#show-index-btn',
        slideCounterDisplaySelector: 'h2#page-status-display',
        externalLinkClass: 'external-resource-link',
        pointerIndicatorClass: 'highlight-pointer-active',
        helpContentPath: '../../meta/core/assistance.html', // Path to help content
        defaultNotificationTime: 4000 // How long notifications stay visible
    };

    // --- Core utility functions ---
    let currentSlideIndex = 0;
    let totalSlidesAvailable = 0;
    let notificationTimeoutId = null;

    /**
     * Finds the numerical index of the currently visible slide.
     * @returns {number} The zero-based index of the active slide.
     */
    const getCurrentSlideIdentifier = () => {
        const activeSlideElement = $(presentationConfig.slideSelector + '.' + presentationConfig.visibleSlideClass);
        if (!activeSlideElement.length) {
            console.warn("No active slide found. Defaulting to index 0.");
            return 0;
        }
        // Extract index from data attribute for robustness
        const slideIdxStr = activeSlideElement.data('slide-idx');
        const slideIdx = parseInt(slideIdxStr, 10);
        return isNaN(slideIdx) ? 0 : slideIdx;
    };

    /**
     * Updates the UI to reflect the new active slide.
     * This includes the slide counter, index panel highlighting, and back button visibility.
     */
    const refreshPresentationState = () => {
        currentSlideIndex = getCurrentSlideIdentifier();
        $(presentationConfig.slideCounterDisplaySelector + ' span').text(currentSlideIndex + 1); // Display 1-based index
        
        // Clear previous active highlights in the navigator
        $(presentationConfig.indexPanelSelector + ' a.active-entry').removeClass('active-entry');
        // Highlight the current slide in the navigator
        const currentNavEntry = $(presentationConfig.indexPanelSelector + ` a[data-target-idx="${currentSlideIndex}"]`);
        if (currentNavEntry.length) {
            currentNavEntry.addClass('active-entry');
        } else {
            console.warn(`Navigator entry for index ${currentSlideIndex} not found.`);
        }

        // Toggle back button visibility
        currentSlideIndex === 0 ? $(presentationConfig.backButtonSelector).hide() : $(presentationConfig.backButtonSelector).show();

        // Ensure help and notification are hidden when navigating
        hideAssistancePanel();
        hideNotificationBanner();
    };

    /**
     * Handles the visual transition between slides.
     * @param {jQuery} currentVisibleSlide - The currently displayed slide element.
     * @param {jQuery} targetSlideElement - The slide element to display next.
     */
    const switchPresentationView = (currentVisibleSlide, targetSlideElement) => {
        if (!currentVisibleSlide.length || !targetSlideElement.length) {
            console.error("Invalid slide elements provided for view switch.");
            return;
        }

        // Ensure current slide is not the target slide
        if (currentVisibleSlide[0] === targetSlideElement[0]) {
            console.log("Attempted to switch to the same slide. No action taken.");
            return;
        }
        
        currentVisibleSlide.fadeOut(presentationConfig.animationDuration, function() {
            $(this).removeClass(presentationConfig.visibleSlideClass);
            targetSlideElement.fadeIn(presentationConfig.animationDuration, function() {
                $(this).addClass(presentationConfig.visibleSlideClass);
                refreshPresentationState();
                console.info(`Switched to slide: ${targetSlideElement.attr('id') || targetSlideElement.data('slide-idx')}`);
            });
        });
    };

    /**
     * Advances to the next slide in the presentation.
     */
    const navigateForward = () => {
        $(presentationConfig.indexPanelSelector).hide(); // Close index panel on navigation

        const nextSlideIndex = currentSlideIndex + 1;
        if (nextSlideIndex < totalSlidesAvailable) {
            const currentSlide = $(presentationConfig.slideSelector + '.' + presentationConfig.visibleSlideClass);
            const nextSlide = $(presentationConfig.slideSelector + `[data-slide-idx="${nextSlideIndex}"]`);
            if (nextSlide.length) {
                switchPresentationView(currentSlide, nextSlide);
            } else {
                showNotificationBanner("Error: Next slide not found.");
            }
        } else {
            showNotificationBanner('You are at the last slide of this presentation.');
        }
    };

    /**
     * Retreats to the previous slide in the presentation.
     */
    const navigateBackward = () => {
        $(presentationConfig.indexPanelSelector).hide(); // Close index panel on navigation

        const prevSlideIndex = currentSlideIndex - 1;
        if (prevSlideIndex >= 0) {
            const currentSlide = $(presentationConfig.slideSelector + '.' + presentationConfig.visibleSlideClass);
            const previousSlide = $(presentationConfig.slideSelector + `[data-slide-idx="${prevSlideIndex}"]`);
            if (previousSlide.length) {
                switchPresentationView(currentSlide, previousSlide);
            } else {
                showNotificationBanner("Error: Previous slide not found.");
            }
        } else {
            showNotificationBanner('You are at the first slide of this presentation.');
        }
    };

    /**
     * Displays the help overlay.
     */
    const displayAssistancePanel = () => {
        const helpContainer = $(presentationConfig.helpOverlaySelector);
        if (!helpContainer.length) {
            // Create the help container if it doesn't exist
            $('body').append(`<div id="${presentationConfig.helpOverlaySelector.substring(1)}"></div>`);
            const newlyCreatedHelpContainer = $(presentationConfig.helpOverlaySelector);
            newlyCreatedHelpContainer.hide();

            // Load help content asynchronously
            $.get(presentationConfig.helpContentPath, (data) => {
                const helpArticle = $(data).filter('article.help-content'); // Filter for specific content
                if (helpArticle.length) {
                    newlyCreatedHelpContainer.html(helpArticle.html()); // Insert only the content
                    newlyCreatedHelpContainer.fadeToggle(presentationConfig.animationDuration);
                } else {
                    newlyCreatedHelpContainer.text("Help content could not be loaded.");
                    newlyCreatedHelpContainer.fadeToggle(presentationConfig.animationDuration);
                }
            }).fail(() => {
                newlyCreatedHelpContainer.text("Failed to retrieve help content.");
                newlyCreatedHelpContainer.fadeToggle(presentationConfig.animationDuration);
            });
        } else {
            helpContainer.fadeToggle(presentationConfig.animationDuration); // Toggle visibility if already exists
        }
    };

    /**
     * Hides the help overlay.
     */
    const hideAssistancePanel = () => {
        $(presentationConfig.helpOverlaySelector).fadeOut(presentationConfig.animationDuration);
    };

    /**
     * Shows a temporary notification banner with a given message.
     * @param {string} message - The message to display.
     */
    const showNotificationBanner = (message) => {
        clearTimeout(notificationTimeoutId); // Clear any existing auto-hide timeout
        const banner = $(presentationConfig.notificationBannerSelector);
        if (!banner.length) { // Create if not present
            $('body').append(`<div id="${presentationConfig.notificationBannerSelector.substring(1)}"><p></p></div>`);
            banner = $(presentationConfig.notificationBannerSelector);
            banner.hide();
            banner.on('click', 'p', hideNotificationBanner); // Allow clicking to dismiss
        }
        banner.find('p').text(message);
        banner.stop(true, true).fadeIn(presentationConfig.animationDuration);
        notificationTimeoutId = setTimeout(hideNotificationBanner, presentationConfig.defaultNotificationTime);
    };

    /**
     * Hides the notification banner.
     */
    const hideNotificationBanner = () => {
        clearTimeout(notificationTimeoutId);
        $(presentationConfig.notificationBannerSelector).stop(true, true).fadeOut(presentationConfig.animationDuration);
    };

    // --- Event Handlers and Initializers ---

    // Initial DOM setup once document is ready
    $(document).ready(() => {
        // Add a class to the HTML element to indicate JS is active
        document.documentElement.classList.add(presentationConfig.scriptActiveHtmlClass);

        // Hide all slides except the first one and mark the first as visible
        const allSlides = $(presentationConfig.slideSelector);
        if (allSlides.length > 0) {
            allSlides.not(':first').hide();
            allSlides.first().addClass(presentationConfig.visibleSlideClass);
        } else {
            console.error("No presentation slides found. Please check your HTML structure.");
            return; // Stop further execution if no slides are present
        }

        // Prevent specific elements from triggering global slide advancement
        $('body a, body div#show-index-btn, body p#prev-slide-btn, form, video, audio').on('click', (e) => {
            e.stopPropagation(); // Stop click event propagation
        });

        // Click on any slide to advance (unless event is stopped)
        $(presentationConfig.slideSelector).on('click', () => {
            navigateForward();
        });

        // Initialize total slides count
        totalSlidesAvailable = allSlides.length;

        // Keyboard navigation
        $(document).on('keydown', (event) => {
            // Guard clause for repeated key presses
            if (event.repeat) return;

            hideNotificationBanner(); // Dismiss any active notification

            switch (event.key) {
                case 'ArrowRight': // Right arrow key
                    navigateForward();
                    break;
                case 'ArrowLeft': // Left arrow key
                    navigateBackward();
                    break;
                case ' ': // Spacebar
                    $(presentationConfig.indexPanelSelector).fadeToggle(presentationConfig.animationDuration);
                    hideAssistancePanel();
                    event.preventDefault(); // Prevent page scrolling
                    break;
                case '0': // '0' key (to return to first slide)
                    const firstSlide = $(presentationConfig.slideSelector + `[data-slide-idx="0"]`);
                    if (firstSlide.length) {
                        switchPresentationView($(presentationConfig.slideSelector + '.' + presentationConfig.visibleSlideClass), firstSlide);
                    }
                    hideNotificationBanner();
                    hideAssistancePanel();
                    break;
                case 'c': // 'c' key (for pointer cursor toggle)
                case 'C':
                    $(presentationConfig.slideSelector + '.' + presentationConfig.visibleSlideClass).toggleClass(presentationConfig.pointerIndicatorClass);
                    break;
                case '?': // '?' key (for help)
                case '/':
                    displayAssistancePanel();
                    break;
                default:
                    // Do nothing for other keys
                    return;
            }
        });

        // Click on main title to show help
        $(presentationConfig.mainTitleSelector).on('click', displayAssistancePanel);

        // --- Slide Navigator Panel (Table of Contents) ---
        const navigatorPanel = $(presentationConfig.indexPanelSelector);
        if (!navigatorPanel.length) {
            $('body').append(`<div id="${presentationConfig.indexPanelSelector.substring(1)}"></div>`);
            navigatorPanel = $(presentationConfig.indexPanelSelector);
            navigatorPanel.hide();
        }
        
        // Populate the navigator panel with slide titles
        const slideTitlesContainer = $('<div class="slide-titles-list"></div>');
        $(presentationConfig.slideSelector).each(function(index) {
            const slideTitle = $(this).find('h1:first').text() || `Untitled Slide ${index + 1}`;
            // Add data attributes for navigation targeting
            slideTitlesContainer.append(`<a href="#" data-target-idx="${index}" title="Jump to slide ${index + 1}">${slideTitle}</a>`);
            $(this).attr('id', `slide-${index}`).data('slide-idx', index); // Assign ID and data-idx to slides
        });
        navigatorPanel.append(slideTitlesContainer);

        // Add handler for navigator panel clicks
        navigatorPanel.on('click', 'a', function(e) {
            e.preventDefault();
            const targetIndex = parseInt($(this).data('target-idx'), 10);
            if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < totalSlidesAvailable) {
                const currentActive = $(presentationConfig.slideSelector + '.' + presentationConfig.visibleSlideClass);
                const targetSlide = $(presentationConfig.slideSelector + `[data-slide-idx="${targetIndex}"]`);
                if (targetSlide.length) {
                    navigatorPanel.hide(); // Hide panel after selection
                    switchPresentationView(currentActive, targetSlide);
                } else {
                    showNotificationBanner(`Slide ${targetIndex + 1} not found.`);
                }
            }
        });

        // Adjust navigator panel styling if many entries
        if (totalSlidesAvailable >= 15) {
            navigatorPanel.addClass(presentationConfig.compactIndex);
        }

        // Initialize slide counter display
        $(presentationConfig.slideCounterDisplaySelector + ' strong').text(totalSlidesAvailable);

        // Toggle index panel via button
        $(presentationConfig.indexToggleBtnSelector).on('click', () => {
            hideNotificationBanner();
            navigatorPanel.fadeToggle(presentationConfig.animationDuration);
        });

        // Back button functionality
        $(presentationConfig.backButtonSelector).on('click', () => {
            navigateBackward();
        });

        // --- External Link Handling ---
        $(presentationConfig.slideSelector + ' a[href]').each(function() {
            const linkHref = $(this).attr('href');
            // Only modify links that are not internal anchors or relative paths
            if (linkHref && (linkHref.startsWith('http://') || linkHref.startsWith('https://') || linkHref.startsWith('//'))) {
                $(this).addClass(presentationConfig.externalLinkClass);
                $(this).attr({
                    'target': '_blank',
                    'rel': 'noopener noreferrer' // Security enhancement
                });
            }
        });

        // --- Hash-based Navigation (Deep Linking) ---
        const currentHash = window.location.hash;
        if (currentHash && currentHash.startsWith('#slide-')) {
            const hashIndexStr = currentHash.substring(currentHash.indexOf('-') + 1);
            const hashIndex = parseInt(hashIndexStr, 10);

            if (!isNaN(hashIndex) && hashIndex >= 0 && hashIndex < totalSlidesAvailable) {
                setTimeout(() => { // Small delay to ensure initial setup is complete
                    const initialActiveSlide = $(presentationConfig.slideSelector + '.' + presentationConfig.visibleSlideClass);
                    const targetHashSlide = $(presentationConfig.slideSelector + `[data-slide-idx="${hashIndex}"]`);
                    if (targetHashSlide.length && initialActiveSlide[0] !== targetHashSlide[0]) {
                        switchPresentationView(initialActiveSlide, targetHashSlide);
                    }
                }, presentationConfig.initialDelay);
            } else {
                console.warn(`Invalid slide index in URL hash: ${currentHash}`);
                showNotificationBanner(`Invalid slide specified in URL. Showing first slide.`);
            }
        }

        // Final state update after all initializations
        refreshPresentationState();
    });

})(jQuery, window, document));