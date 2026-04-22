/*
 * Panel Toggle Pro Plugin 1.0
 * Copyright 2023, Your Name/Company
 * Licensed under the MIT license.
 * https://opensource.org/licenses/MIT
*/

(function($) {

    $.fn.panelTogglePro = function(userOptions) {
        // Configure default behavior and merge with user-defined options.
        const config = $.extend({
            fadeLevel: 0.2, // Opacity for non-selected elements
            adjustRowTop: false, // Should the parent row's margin-top be adjusted?
            initialTopMargin: '0px', // Base margin-top for the main container
            topMarginStep: -100, // Increment for margin-top adjustment per row
            transitionDuration: 200, // Animation speed in milliseconds
            innerContentLink: '.inner-link-ref', // Selector for links within panels that should reload
            instantSwap: false // If true, switch panels without closing animation first
        }, userOptions);

        let isAnimating = false; // Flag to prevent rapid clicks during animation

        // Helper function to animate opacity of all panel triggers except the current one.
        const animateOtherTriggers = (currentTrigger, targetOpacity, duration) => {
            $('.mainWrapper').find('.panelTrigger').not(currentTrigger).fadeTo(duration, targetOpacity);
        };

        // Helper function to adjust the margin-top of the main container.
        const setParentContainerMargin = (triggerElement, duration) => {
            if (!config.adjustRowTop) {
                return; // No margin-top adjustment needed
            }
            const parentWrapper = triggerElement.closest('.mainWrapper');
            const containingRow = triggerElement.closest('.sectionRow');
            if (containingRow.length && parentWrapper.length) {
                const rowIndex = containingRow.index('.sectionRow');
                // Calculate new margin-top based on base and step per row.
                const calculatedRowMargin = parseInt(config.initialTopMargin) + (config.topMarginStep * rowIndex);
                parentWrapper.animate({ marginTop: calculatedRowMargin + 'px' }, duration);
            }
        };

        // Helper function to update the URL hash without causing the page to scroll.
        const updateUrlFragment = (elementId) => {
            const currentHash = window.location.hash.substring(1);
            if (currentHash === elementId) return; // Hash is already set to target

            const fragmentTarget = $('#' + elementId);
            if (fragmentTarget.length) {
                fragmentTarget.attr('id', ''); // Temporarily remove ID to prevent browser auto-scroll
            }
            window.location.hash = elementId;
            if (fragmentTarget.length) {
                fragmentTarget.attr('id', elementId); // Restore ID after hash is set
            }
        };

        // Helper function to clear the URL hash without a full page reload.
        const clearUrlFragment = () => {
            if (window.location.hash) {
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
        };

        // Helper function to reset all panel states to their initial configuration.
        const resetAllPanelStates = (duration) => {
            $('.togglePanelArea').slideUp(duration); // Collapse all open content panels
            $('.currentSelection').removeClass('currentSelection'); // Deactivate all triggers
            $('.mainWrapper .panelTrigger').fadeTo(duration, 1.00); // Restore full opacity to all triggers
            $('.mainWrapper').animate({ marginTop: config.initialTopMargin }, duration); // Reset main container margin
            clearUrlFragment(); // Clear the URL hash
        };

        // Iterate over each selected element to apply the plugin logic.
        return this.each(function() {
            // Initially hide all content areas that are part of the toggle system.
            $('.togglePanelArea').hide();

            // Event handler for clicking a panel trigger element.
            $(document).on('click', '.panelTrigger', function(event) {
                event.preventDefault(); // Prevent default link/button action

                if (isAnimating) return; // Prevent interaction during an ongoing animation
                isAnimating = true; // Set animation flag

                const currentTriggerElement = $(this);
                const targetSectionId = currentTriggerElement.attr('id');
                const sectionContentElement = $(`.togglePanelArea.${targetSectionId}`);
                const isSectionContentVisible = sectionContentElement.is(':visible'); // Check if the target panel is currently visible

                const mainContainer = currentTriggerElement.closest('.mainWrapper');
                const currentlyActiveTrigger = mainContainer.find('.currentSelection');
                const hasActivePanel = currentlyActiveTrigger.length > 0;

                let animDuration = config.transitionDuration;

                // Case 1: No panel is currently active. Open the clicked panel.
                if (!hasActivePanel) {
                    const containingRow = currentTriggerElement.closest('.sectionRow');
                    containingRow.after(sectionContentElement); // Position content panel after its row
                    currentTriggerElement.addClass('currentSelection'); // Mark trigger as active
                    sectionContentElement.slideDown(animDuration, () => { isAnimating = false; }); // Animate panel opening
                    animateOtherTriggers(currentTriggerElement, config.fadeLevel, animDuration); // Fade non-active triggers
                    setParentContainerMargin(currentTriggerElement, animDuration); // Adjust parent margin if configured
                    updateUrlFragment(targetSectionId); // Update URL hash
                }
                // Case 2: A panel is already active.
                else {
                    // Case 2a: The clicked panel is already active (i.e., user wants to close it).
                    if (isSectionContentVisible) {
                        currentTriggerElement.removeClass('currentSelection');
                        sectionContentElement.slideUp(animDuration, () => { isAnimating = false; });
                        animateOtherTriggers(currentTriggerElement, 1.00, animDuration); // Restore full opacity to all triggers
                        mainContainer.animate({ marginTop: config.initialTopMargin }, animDuration); // Reset main container margin
                        clearUrlFragment();
                    }
                    // Case 2b: An inactive panel was clicked, but another panel is currently active.
                    else {
                        if (config.instantSwap) {
                            // If the active trigger is different from the one clicked, and instant swap is enabled.
                            if (currentlyActiveTrigger[0] !== currentTriggerElement[0]) {
                                animDuration = 0; // Perform the swap instantly visually
                            }

                            resetAllPanelStates(animDuration); // Close the currently active panel and reset states

                            // Now, open the newly clicked panel.
                            const containingRow = currentTriggerElement.closest('.sectionRow');
                            containingRow.after(sectionContentElement);
                            currentTriggerElement.addClass('currentSelection');
                            sectionContentElement.slideDown(config.transitionDuration, () => { isAnimating = false; }); // Use original duration for opening
                            animateOtherTriggers(currentTriggerElement, config.fadeLevel, config.transitionDuration);
                            setParentContainerMargin(currentTriggerElement, config.transitionDuration);
                            updateUrlFragment(targetSectionId);

                        } else {
                            // Instant swap is not enabled: Close the currently active panel first.
                            resetAllPanelStates(animDuration);
                            isAnimating = false; // Animation ends after closing, user can then click another
                        }
                    }
                }
            });

            // Event handler for the close button within a panel.
            $(document).on('click', '.closePanelBtn', function(event) {
                event.preventDefault();

                if (isAnimating) return;
                isAnimating = true;

                const closeButton = $(this);
                const parentPanel = closeButton.closest('.togglePanelArea');
                // Extract the ID from the panel's class list, assuming ID is also a class.
                const triggerId = parentPanel.attr('class').split(' ').find(cls => cls !== 'togglePanelArea' && cls !== 'jaf-internal');
                const correspondingTrigger = $(`#${triggerId}`);

                if (correspondingTrigger.length) {
                    correspondingTrigger.removeClass('currentSelection');
                }
                parentPanel.slideUp(config.transitionDuration, () => { isAnimating = false; });
                animateOtherTriggers(null, 1.00, config.transitionDuration); // Restore full opacity to all triggers
                closeButton.closest('.mainWrapper').animate({ marginTop: config.initialTopMargin }, config.transitionDuration);
                clearUrlFragment();
            });

            // Handle panel opening based on URL hash on page load.
            const initialHash = window.location.hash.substring(1);
            if (initialHash) {
                const initialTrigger = $(`#${initialHash}`);
                // Ensure the element found by hash is a valid panel trigger.
                if (initialTrigger.length && initialTrigger.hasClass('panelTrigger')) {
                    const initialContent = $(`.togglePanelArea.${initialHash}`);
                    const initialContainingRow = initialTrigger.closest('.sectionRow');
                    
                    if (initialContainingRow.length && initialContent.length) {
                        initialContainingRow.after(initialContent);
                        initialTrigger.addClass('currentSelection');
                        initialContent.delay(200).slideDown(config.transitionDuration); // Add slight delay for better visual load
                        animateOtherTriggers(initialTrigger, config.fadeLevel, 0); // Instant fade for other triggers
                        setParentContainerMargin(initialTrigger, 0); // Instant margin adjustment
                        $('html, body').animate({scrollTop:0}, 0); // Ensure page is scrolled to top instantly
                    }
                }
            }

            // Event handler for internal links within content panels.
            $(document).on('click', config.innerContentLink, function(event) {
                const navigateToLink = $(this).attr('href');
                if (navigateToLink) {
                    window.location.href = navigateToLink;
                    // Note: window.location.href assignment often triggers a page reload itself.
                    // Explicit window.location.reload() is typically not needed unless specific caching issues.
                }
                event.preventDefault(); // Prevent default browser navigation behavior
            });

        }); // End of each function
    };
})(jQuery);