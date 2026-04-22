/*
 * ModalContentViewer - A jQuery Plugin for displaying various content types in a modal dialog.
 * Version: 2.1.0 (Refactored and enhanced from an earlier version)
 * @requires jQuery
 *
 * This plugin provides a flexible lightbox solution, supporting images, iframes, inline HTML,
 * AJAX content, and popular video platforms like YouTube and Vimeo.
 *
 * For usage examples and documentation, please refer to: [your_new_documentation_link_here]
 * License: MIT License (https://opensource.org/licenses/MIT)
 * Copyright (c) 2023 [Your Name/Organization]
 */
(function($){

    // Module-level variables to manage the state and elements of the modal viewer.
    // These are initialized or updated during the modal's lifecycle.
    let isMobileSafariAgent, isOldInternetExplorer, currentBackdropColor, modalBackdropElement,
        desiredContentWidth, contentBoundaryPadding, contentBackgroundColor, desiredContentHeight,
        verticalCenteringOffset, renderedContentHeight, availableViewportHeight,
        shouldShowPaginationCounter, pageContentContainer, contentDisplayHost, galleryLoopEnabled,
        actualContentDisplayArea, generatedModalHTML, targetContentSource, initialDocumentScrollY,
        firstLoadedImage, resolvedContentType, currentGalleryIdentifier, activeGalleryItems,
        nextGalleryItemRef, previousGalleryItemRef, contentTitleString, canNavigateToNext,
        canNavigateToPrevious, keyboardNavigationBlocked, titleElementDisplay,
        paginationElementDisplay, excludedClickNextArea, excludedClickPrevArea,
        excludedClickContentArea, excludedChildElements, userDefinedOverlayClass,
        currentTriggeringElement;

    // Pre-cached jQuery objects for frequently accessed DOM elements, enhancing performance.
    const $htmlElement = $('html');
    const $documentObject = $(document);
    const $windowObject = $(window);
    const $bodyElement = $('body');

    // Utility function to extract video identification from a given URL.
    const getVideoIdentifier = (urlLink) => {
        const urlSegments = urlLink.split('/');
        // Extract the last segment and remove any query parameters or hash fragments.
        return urlSegments[urlSegments.length - 1].split('?')[0].split('&')[0].split('#')[0];
    };

    // Manages the scroll behavior of the main page to prevent background scrolling
    // when the modal is active.
    const preventPageScrolling = () => {
        initialDocumentScrollY = $windowObject.scrollTop();
        $htmlElement.css('overflow', 'hidden'); // Hide scrollbar on HTML
        $bodyElement.css({
            'overflow': 'hidden',
            'position': 'fixed',
            'top': -initialDocumentScrollY + 'px', // Fix body at current scroll position
            'width': '100%' // Maintain body width
        });
    };

    // Restores the original scroll behavior and position of the main page.
    const restorePageScrolling = () => {
        $htmlElement.css('overflow', ''); // Remove overflow styling
        $bodyElement.css({
            'overflow': '',
            'position': '',
            'top': '',
            'width': ''
        });
        $windowObject.scrollTop(initialDocumentScrollY); // Restore original scroll position
    };

    // Dynamically adjusts and positions the modal content within the viewport.
    const adjustContentPlacement = (preventScrollToTop = false) => {
        // Option to skip resetting scroll to top, useful for AJAX content which might have its own scroll.
        if (!preventScrollToTop) {
            $windowObject.scrollTop(0);
        }

        // Update and display the content title.
        if (contentTitleString) {
            titleElementDisplay.html(contentTitleString).fadeIn();
        } else {
            titleElementDisplay.fadeOut();
        }

        // Apply styling to the direct child of the content area.
        actualContentDisplayArea.children().first().addClass('modal-inner-element').css({
            'width': desiredContentWidth || 'auto',
            'height': desiredContentHeight || 'auto',
            'padding': contentBoundaryPadding,
            'background': contentBackgroundColor
        });

        renderedContentHeight = actualContentDisplayArea.outerHeight();
        availableViewportHeight = $windowObject.height();

        // Calculate vertical margins for centering, ensuring a minimum offset.
        if (renderedContentHeight + 80 < availableViewportHeight) {
            verticalCenteringOffset = (availableViewportHeight - renderedContentHeight) / 2;
            actualContentDisplayArea.css({
                'margin-top': verticalCenteringOffset,
                'margin-bottom': verticalCenteringOffset
            });
        } else {
            actualContentDisplayArea.css({
                'margin-top': '40px', // Fixed top margin for larger content
                'margin-bottom': '40px' // Fixed bottom margin
            });
        }

        // Animate the content into view.
        actualContentDisplayArea.animate({ 'opacity': '1' }, 'slow');
    };

    // Centralized function to load different types of content into the modal.
    const loadModalContent = (itemReference) => {
        resolvedContentType = itemReference.data('modal-options').contentType;
        targetContentSource = itemReference.attr('href');

        // Guard clause for missing content source.
        if (!targetContentSource) {
            console.warn('ModalViewer: Trigger element is missing "href" attribute.', itemReference);
            actualContentDisplayArea.html('<div class="modal-inline-content"><p>Error: Content URL not found.</p></div>');
            adjustContentPlacement(true);
            return;
        }

        // Clear previous content and hide while loading new content.
        actualContentDisplayArea.html('').css('opacity', '0');

        switch (resolvedContentType) {
            case 'iframe':
                actualContentDisplayArea.html(`<iframe class="modal-iframe-element" src="${targetContentSource}" frameborder="0" allowfullscreen></iframe>`);
                adjustContentPlacement();
                break;
            case 'inline':
                const inlineHtmlContent = $(targetContentSource).html();
                actualContentDisplayArea.html(`<div class="modal-inline-content">${inlineHtmlContent}</div>`);
                adjustContentPlacement();
                break;
            case 'ajax':
                $.ajax({
                    url: targetContentSource,
                    cache: false
                }).done(function(responseData) {
                    actualContentDisplayArea.html(`<div class="modal-inline-content">${responseData}</div>`);
                    adjustContentPlacement(true); // AJAX might have its own scroll, so prevent window scroll to top
                }).fail(function() {
                    actualContentDisplayArea.html('<div class="modal-inline-content"><p>Failed to retrieve content. Please check the source or network.</p></div>');
                    adjustContentPlacement(true);
                });
                break;
            case 'vimeo':
                const vimeoVideoId = getVideoIdentifier(targetContentSource);
                if (vimeoVideoId) {
                    actualContentDisplayArea.html(`<iframe class="modal-iframe-element" src="//player.vimeo.com/video/${vimeoVideoId}?autoplay=1&title=0&byline=0&portrait=0" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`);
                    adjustContentPlacement();
                } else {
                    actualContentDisplayArea.html('<div class="modal-inline-content"><p>Invalid Vimeo video URL provided.</p></div>');
                    adjustContentPlacement(true);
                }
                break;
            case 'youtube':
                const youtubeVideoId = getVideoIdentifier(targetContentSource);
                if (youtubeVideoId) {
                    actualContentDisplayArea.html(`<iframe class="modal-iframe-element" src="//www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&showinfo=0" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`);
                    adjustContentPlacement();
                } else {
                    actualContentDisplayArea.html('<div class="modal-inline-content"><p>Invalid YouTube video URL provided.</p></div>');
                    adjustContentPlacement(true);
                }
                break;
            default: // Default to image content if type is not specified or recognized
                actualContentDisplayArea.html(`<img src="${targetContentSource}" alt="${contentTitleString || 'Lightbox image'}">`);
                firstLoadedImage = actualContentDisplayArea.find('img');
                // Ensure image is loaded before adjusting layout.
                firstLoadedImage.one('load', function() {
                    adjustContentPlacement();
                }).each(function() {
                    if (this.complete) $(this).trigger('load'); // Handle cached images
                });
                break;
        }
    };

    // Main plugin function definition, extending jQuery's prototype.
    $.fn.extend({
        modalContentViewer: function(clientOptions) {

            // Define the default configuration settings for the modal viewer.
            const defaultViewerSettings = {
                preferredWidth: '', // Desired width of the content area (e.g., '800px', '50%')
                preferredHeight: '', // Desired height of the content area
                contentBoundaryPadding: '0', // Padding around the content, inside the frame
                contentBackgroundColor: '#fff', // Background color of the content area
                titleAttributeName: 'title', // HTML attribute to extract the content title from
                showCounter: false, // Display "1/5" pagination counter for galleries
                infiniteLoop: false, // Enable infinite looping for gallery navigation
                closeOnBackdropClick: true, // Allow closing the modal by clicking outside the content
                transitionSpeed: 300, // Duration of modal opening/closing animations in milliseconds
                contentType: 'image', // Default content type if not specified by data-type attribute
                customOverlayClass: '' // Additional CSS class for the overlay element
            };

            // Merge default settings with client-provided options. Deep merge is used
            // to ensure nested objects are correctly combined.
            const mergedOptions = $.extend(true, {}, defaultViewerSettings, clientOptions);

            // Iterate over each selected element to apply the plugin.
            return this.each(function() {
                const triggeringElement = $(this);

                // Prevent plugin from being initialized multiple times on the same element.
                if (triggeringElement.data('modal-initialized')) {
                    return true;
                }

                // Apply a specific class and store merged options on the element.
                triggeringElement.addClass('modal-trigger-item');
                triggeringElement.data('modal-options', mergedOptions);
                triggeringElement.data('modal-initialized', true);

                // Detect browser environment for specific handling (e.g., iOS fixed positioning, IE9 transitions).
                isMobileSafariAgent = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
                isOldInternetExplorer = (document.all && !window.atob); // Simple check for IE9 and below

                // Attach the primary click event handler to each triggering element.
                triggeringElement.on('click', function(event) {
                    event.stopPropagation(); // Prevent event bubbling
                    event.preventDefault(); // Prevent default link behavior

                    currentTriggeringElement = $(this);
                    const currentElementOptions = currentTriggeringElement.data('modal-options');

                    // Retrieve dynamic options from data attributes or fall back to global options.
                    currentBackdropColor = currentTriggeringElement.data('overlay-color') || '#333';
                    desiredContentWidth = currentElementOptions.preferredWidth;
                    desiredContentHeight = currentElementOptions.preferredHeight;
                    contentBoundaryPadding = currentElementOptions.contentBoundaryPadding;
                    contentBackgroundColor = currentElementOptions.contentBackgroundColor;
                    shouldShowPaginationCounter = currentElementOptions.showCounter;
                    galleryLoopEnabled = currentElementOptions.infiniteLoop;
                    userDefinedOverlayClass = currentElementOptions.customOverlayClass;

                    keyboardNavigationBlocked = false; // Reset navigation lock state.
                    targetContentSource = currentTriggeringElement.attr('href'); // Get the content URL.

                    // Essential check: If no href is present, log a warning and exit.
                    if (!targetContentSource) {
                        console.warn('ModalViewer: Trigger element lacks an "href" attribute, cannot open modal.', currentTriggeringElement);
                        return;
                    }

                    // Prevent background page scrolling while the modal is open.
                    preventPageScrolling();

                    // Generate the full HTML structure for the modal dynamically.
                    generatedModalHTML = `
                        <div class="modal-overlay-background ${userDefinedOverlayClass}" style="background:${currentBackdropColor};">
                            <div class="modal-loader-spinner">Loading...</div>
                            <div class="modal-content-wrapper">
                                <div class="modal-display-area"></div>
                            </div>
                            <div class="modal-title-display"></div>
                            <div class="modal-pagination-info">0/0</div>
                            <button type="button" class="modal-close-button" aria-label="Close Modal">X</button>
                            <button type="button" class="modal-nav-next" aria-label="Next Content Item">Next</button>
                            <button type="button" class="modal-nav-prev" aria-label="Previous Content Item">Prev</button>
                        </div>`;

                    // Append the modal structure to the body.
                    $bodyElement.append(generatedModalHTML);

                    // Cache references to the newly created modal DOM elements.
                    modalBackdropElement = $('.modal-overlay-background');
                    contentDisplayHost = $('.modal-content-wrapper');
                    actualContentDisplayArea = $('.modal-display-area');
                    paginationElementDisplay = $('.modal-pagination-info');
                    titleElementDisplay = $('.modal-title-display');

                    // Set initial minimum height for the overlay to cover the entire viewport.
                    modalBackdropElement.css('min-height', $windowObject.outerHeight());

                    // Function to handle the final steps of opening the modal after transition.
                    const finalizeModalOpening = () => {
                        modalBackdropElement.css({
                            'min-height': $windowObject.outerHeight(),
                            'height': 'auto' // Allow height to adjust dynamically
                        });
                        loadModalContent(currentTriggeringElement); // Load the content.
                    };

                    // Handle modal backdrop appearance based on browser capabilities (IE vs. modern).
                    if (isOldInternetExplorer) {
                        modalBackdropElement.animate({ opacity: 1 }, currentElementOptions.transitionSpeed, finalizeModalOpening);
                    } else {
                        // Use CSS transitions for modern browsers.
                        modalBackdropElement.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(event) {
                            // Ensure the transition event is for the backdrop itself, not its children.
                            if (event.target !== event.currentTarget) return;
                            $(this).off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"); // Unbind after first use.
                            finalizeModalOpening();
                        });
                        modalBackdropElement.css('opacity', '1');
                    }

                    // Wrap body content to enable fixed positioning during modal display.
                    pageContentContainer = $bodyElement.children('.page-content-container');
                    if (pageContentContainer.length === 0) {
                       $bodyElement.wrapInner('<div class="page-content-container"></div>');
                       pageContentContainer = $('.page-content-container');
                    }

                    // Apply fixed positioning to the page content container.
                    pageContentContainer.css({
                        'position': 'fixed',
                        'top': -initialDocumentScrollY + 'px',
                        'width': '100%'
                    }).data('original-top-offset', initialDocumentScrollY); // Store original scroll position.

                    // Update navigation controls and title based on current item.
                    refreshNavigationState();
                });

                /* -------- NAVIGATION STATE REFRESH -------- */
                // Determines the visibility and state of navigation elements (prev/next buttons, pagination).
                const refreshNavigationState = () => {
                    const currentElementOptions = currentTriggeringElement.data('modal-options');
                    currentGalleryIdentifier = currentTriggeringElement.data('gallery-id'); // Use 'data-gallery-id' for gallery grouping.
                    activeGalleryItems = $(`.modal-trigger-item[data-gallery-id="${currentGalleryIdentifier}"]`);

                    // Update pagination counter if it's a gallery and enabled.
                    if (currentGalleryIdentifier && shouldShowPaginationCounter && activeGalleryItems.length > 1) {
                        paginationElementDisplay.html(`${activeGalleryItems.index(currentTriggeringElement) + 1} / ${activeGalleryItems.length}`).fadeIn();
                    } else {
                        paginationElementDisplay.fadeOut();
                    }

                    nextGalleryItemRef = activeGalleryItems.eq(activeGalleryItems.index(currentTriggeringElement) + 1);
                    previousGalleryItemRef = activeGalleryItems.eq(activeGalleryItems.index(currentTriggeringElement) - 1);

                    // Retrieve and display the content title.
                    contentTitleString = currentTriggeringElement.attr(currentElementOptions.titleAttributeName) || '';
                    if (contentTitleString) {
                        titleElementDisplay.html(contentTitleString).fadeIn();
                    } else {
                        titleElementDisplay.fadeOut();
                    }

                    // Control visibility and behavior of next/prev buttons.
                    const $nextButton = $('.modal-nav-next');
                    const $prevButton = $('.modal-nav-prev');

                    if (currentGalleryIdentifier && activeGalleryItems.length > 1) { // Only show navigation for galleries with multiple items.
                        if (galleryLoopEnabled) {
                            canNavigateToNext = true;
                            canNavigateToPrevious = true;
                            // Loop to first item if at end, or to last item if at beginning.
                            if (!nextGalleryItemRef.length) nextGalleryItemRef = activeGalleryItems.eq(0);
                            if (activeGalleryItems.index(currentTriggeringElement) < 1) previousGalleryItemRef = activeGalleryItems.eq(activeGalleryItems.length - 1);
                        } else {
                            canNavigateToNext = nextGalleryItemRef.length > 0;
                            canNavigateToPrevious = previousGalleryItemRef.length > 0;
                        }
                        $nextButton.toggle(canNavigateToNext);
                        $prevButton.toggle(canNavigateToPrevious);
                    } else {
                        $nextButton.hide();
                        $prevButton.hide();
                        canNavigateToNext = false;
                        canNavigateToPrevious = false;
                    }
                };

                /* -------- GALLERY NAVIGATION CONTROLS -------- */
                // Object encapsulating navigation methods.
                const contentNavigationManager = {
                    initiateContentTransition: function(direction) {
                        if (keyboardNavigationBlocked) return; // Prevent rapid navigation.
                        keyboardNavigationBlocked = true; // Block navigation during transition.

                        const targetContentItem = (direction === 'next') ? nextGalleryItemRef : previousGalleryItemRef;
                        if (!targetContentItem || !targetContentItem.length) {
                            keyboardNavigationBlocked = false;
                            return; // No item to navigate to.
                        }

                        // Retrieve options for the target content item.
                        const targetItemOptions = targetContentItem.data('modal-options');
                        currentBackdropColor = targetContentItem.data('overlay-color') || '#333';
                        desiredContentWidth = targetItemOptions.preferredWidth;
                        desiredContentHeight = targetItemOptions.preferredHeight;
                        contentBoundaryPadding = targetItemOptions.contentBoundaryPadding;
                        contentBackgroundColor = targetItemOptions.contentBackgroundColor;

                        modalBackdropElement.css('min-height', $windowObject.outerHeight());

                        // Animate current content out, then load new content and animate it in.
                        actualContentDisplayArea.animate({ opacity: 0 },
                            currentTriggeringElement.data('modal-options').transitionSpeed,
                            function() {
                                modalBackdropElement.css('min-height', $windowObject.outerHeight()).css('background', currentBackdropColor);
                                loadModalContent(targetContentItem); // Load new content.
                                currentTriggeringElement = targetContentItem; // Update the reference to the current item.
                                refreshNavigationState(); // Update navigation controls for the new item.
                                keyboardNavigationBlocked = false; // Unlock navigation.
                            }
                        );
                    }
                };

                /* -------- GLOBAL KEYBOARD SHORTCUTS -------- */
                $documentObject.on('keydown.modalviewer', function(event) {
                    if (modalBackdropElement && modalBackdropElement.is(':visible')) { // Only respond if modal is open.
                        if (event.keyCode === 37 && canNavigateToPrevious) { // Left arrow key
                            contentNavigationManager.initiateContentTransition('prev');
                        } else if (event.keyCode === 39 && canNavigateToNext) { // Right arrow key
                            contentNavigationManager.initiateContentTransition('next');
                        } else if (event.keyCode === 27) { // Escape key
                            closeModalViewer();
                        }
                    }
                });

                /* -------- MODAL DISMISSAL MECHANISM -------- */
                const closeModalViewer = () => {
                    $documentObject.off('keydown.modalviewer'); // Unbind keyboard listener.

                    const performClosureActions = () => {
                        modalBackdropElement.remove(); // Remove the modal from the DOM.
                        restorePageScrolling(); // Restore original page scroll.
                        pageContentContainer.children().unwrap(); // Remove the temporary page wrapper.
                        currentTriggeringElement.focus(); // Return focus to the element that opened the modal.
                        keyboardNavigationBlocked = false; // Ensure navigation is unlocked.
                    };

                    // Handle modal backdrop disappearance based on browser (IE vs. modern).
                    if (isOldInternetExplorer) {
                        modalBackdropElement.animate({ opacity: 0 }, currentTriggeringElement.data('modal-options').transitionSpeed, performClosureActions);
                    } else {
                        modalBackdropElement.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(event) {
                            if (event.target !== event.currentTarget) return;
                            $(this).off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
                            performClosureActions();
                        });
                        modalBackdropElement.css('opacity', '0');
                    }
                };

                /* -------- CLICK HANDLERS FOR NAVIGATION AND CLOSING -------- */
                $documentObject.on('click', '.modal-nav-prev', function() {
                    contentNavigationManager.initiateContentTransition('prev');
                });

                $documentObject.on('click', '.modal-nav-next', function() {
                    contentNavigationManager.initiateContentTransition('next');
                });

                // Unified click handler for closing the modal.
                $documentObject.on('click', '.modal-close-button, .modal-overlay-background', function(event) {
                    const currentElementOptions = currentTriggeringElement.data('modal-options');
                    const clickedDomElement = $(event.target);

                    // Define areas within the modal that should NOT trigger a close action when clicked.
                    excludedClickContentArea = '.modal-display-area, .modal-inner-element, .modal-iframe-element, .modal-inline-content';
                    excludedClickPrevArea = '.modal-nav-prev';
                    excludedClickNextArea = '.modal-nav-next';
                    excludedChildElements = '.modal-display-area *'; // Any child element of the content area.

                    const isClickWithinContent = clickedDomElement.is(excludedClickContentArea) || clickedDomElement.is(excludedChildElements);
                    const isClickOnNavControl = clickedDomElement.is(excludedClickPrevArea) || clickedDomElement.is(excludedClickNextArea);
                    const isCloseButtonInteraction = clickedDomElement.is('.modal-close-button');

                    // Close the modal if it's the dedicated close button,
                    // or if it's the overlay and backdrop click closing is enabled,
                    // AND the click did not occur on the content or navigation buttons.
                    if (isCloseButtonInteraction || (currentElementOptions.closeOnBackdropClick && !isClickWithinContent && !isClickOnNavControl)) {
                        closeModalViewer();
                    }
                });
            }); // End of .each loop for plugin initialization.
        } // End of modalContentViewer function.
    }); // End of $.fn.extend.

})(jQuery);