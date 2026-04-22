$(function() {
    // Kicks off the main application enhancements once the DOM is fully loaded.
    AppEnhancer.initiateSystem();
});

//
// This module provides various enhancements and dynamic behaviors for the web page.
// It uses an Immediately Invoked Function Expression (IIFE) for scope management.
//
const AppEnhancer = (function(jq, globalWin, docObj) {
    // Feature detection for touch input capabilities.
    const hasTouchSupport = ('ontouchstart' in globalWin) || (globalWin.navigator.maxTouchPoints > 0);

    // Configuration constants for layout adjustments.
    const MINIMUM_WIDE_VIEWPORT = 1024; // Minimum width for non-portrait layout behavior.
    const BASE_HEADER_FOOTER_HEIGHT = 46; // Standard height for single-row headers/footers.

    /**
     * Safely executes a collection of setup functions.
     * Each function is called within a try-catch block to prevent a single error
     * from halting all subsequent initializations.
     * @param {object} routineCollection - An object where keys are routine names and values are functions.
     */
    function runSetupRoutines(routineCollection) {
        for (const routineKey in routineCollection) {
            if (Object.prototype.hasOwnProperty.call(routineCollection, routineKey) && typeof routineCollection[routineKey] === 'function') {
                try {
                    routineCollection[routineKey]();
                } catch (err) {
                    console.error(`[AppEnhancer] Failed to execute routine '${routineKey}':`, err);
                }
            }
        }
    }

    // The public interface of the AppEnhancer module.
    return {
        // The primary entry point to begin all page-level enhancements.
        initiateSystem: function() {
            runSetupRoutines(this.systemRoutines);
        },

        // An object containing all the individual setup functions.
        systemRoutines: {
            // Ensures textareas and specific input fields extend to their container's full width.
            normalizeInputWidths: function() {
                const affectedInputs = jq('textarea.fluid-input, .input-full-width-control');
                if (affectedInputs.length === 0) {
                    return; // Exit if no target elements are found.
                }

                affectedInputs.each(function() {
                    const currentElement = jq(this);
                    // Wrap each matching element in a span for consistent styling.
                    currentElement.wrap('<span class="adaptive-input-wrapper"></span>');
                    // Add a flag to prevent re-processing.
                    currentElement.addClass('width-adjusted');
                });
            },

            // Implements placeholder functionality for browsers that lack native support.
            enableFallbackPlaceholders: function() {
                const nativePlaceholdersSupported = 'placeholder' in docObj.createElement('input');
                const fieldsWithPlaceholder = jq('input[placeholder], textarea[placeholder]');

                if (fieldsWithPlaceholder.length === 0 || nativePlaceholdersSupported) {
                    return; // Skip if no placeholders or if native support is present.
                }

                fieldsWithPlaceholder.each(function() {
                    const inputField = jq(this);
                    const originalPlaceholder = inputField.attr('placeholder');

                    // If the field is initially empty, display the placeholder text.
                    if (inputField.val().trim().length === 0) {
                        inputField.val(originalPlaceholder).addClass('placeholder-text-active');
                    }

                    inputField.on('focus.ph_polyfill', function() {
                        // Clear placeholder on focus if it's currently displayed.
                        if (inputField.val() === originalPlaceholder) {
                            inputField.val('').removeClass('placeholder-text-active');
                        }
                    }).on('blur.ph_polyfill', function() {
                        // Restore placeholder on blur if the field is empty.
                        if (inputField.val().trim().length === 0) {
                            inputField.val(originalPlaceholder).addClass('placeholder-text-active');
                        }
                    });

                    // Store the original placeholder value as data attribute for robustness.
                    inputField.data('ph-original-value', originalPlaceholder);
                });
            },

            // Adapts the page layout based on device orientation and viewport width.
            adjustLayoutOnOrientation: function() {
                const applyLayoutChanges = () => {
                    const currentDeviceAngle = globalWin.orientation; // 0, 90, 180, -90
                    const mainPageBody = jq('body');
                    const currentViewportWidth = mainPageBody.outerWidth();
                    const sideNavigationPanel = jq('#appSidePanel'); // Renamed from #sidebar

                    // Determine if the current view is considered "narrow" (portrait or small landscape).
                    const isNarrowOrientation = (currentDeviceAngle === 0 || currentDeviceAngle === 180 || currentViewportWidth < MINIMUM_WIDE_VIEWPORT);

                    if (isNarrowOrientation) {
                        mainPageBody.addClass('orientation-portrait');
                        jq('#menuToggleButton').removeClass('is-active-btn'); // Renamed from #button_navigation
                        sideNavigationPanel.hide(); // Direct hide/show for simplicity, could be toggleClass.
                    } else {
                        mainPageBody.removeClass('orientation-portrait');
                        sideNavigationPanel.show();
                    }
                };

                // Execute once on load.
                applyLayoutChanges();

                // Attach event listener for orientation and resize changes, with debouncing.
                let resizeDebounceTimer;
                jq(globalWin).on('resize orientationchange', function() {
                    clearTimeout(resizeDebounceTimer);
                    resizeDebounceTimer = setTimeout(applyLayoutChanges, 200); // Debounce to prevent rapid calls.
                });
            },

            // Configures the interactive behavior for the main sidebar toggle button.
            setupSidebarActivation: function() {
                const toggleButton = jq('#sidebarToggleBtn'); // Renamed from #button_navigation
                if (toggleButton.length === 0) {
                    return; // No button, no action.
                }

                toggleButton.on('click', function(event) {
                    event.preventDefault(); // Stop default link behavior.

                    const targetPanel = jq('#appSidePanel'); // Renamed from #sidebar

                    // Use jQuery's slideToggle for a smooth animation effect.
                    targetPanel.slideToggle(250, function() {
                        // Toggle active class on the button based on panel's final visibility.
                        if (targetPanel.is(':visible')) {
                            toggleButton.addClass('is-active-btn');
                        } else {
                            toggleButton.removeClass('is-active-btn');
                        }
                    });
                });
            },

            // Manages the expansion/collapse of multi-level menu items within the sidebar.
            handleSidebarMenuDynamics: function() {
                const primarySideMenu = jq('#mainSidebarNav'); // Renamed from #sidebar_menu
                if (primarySideMenu.length === 0) {
                    return; // No menu, no dynamics.
                }

                // Determine the most appropriate click event for user interaction.
                const menuInteractionEvent = hasTouchSupport ? 'click' : 'mousedown';

                // Prepend an interactive indicator to parent menu items.
                primarySideMenu.find('li').each(function() {
                    // Check if the list item directly contains a 'ul' (submenu).
                    if (jq(this).children('ul').first().length) {
                        jq(this).children('a').first().prepend('<span class="menu-expand-indicator"></span>');
                    }
                });

                // Delegate event handling for all anchor tags within the sidebar menu.
                primarySideMenu.on(menuInteractionEvent, 'a', function(evt) {
                    const activatedLink = jq(this);
                    const parentListElement = activatedLink.parent('li');
                    const childSubmenu = parentListElement.children('ul').first();

                    // If the link's href is just '#', prevent its default action.
                    if (activatedLink.attr('href') === '#') {
                        evt.preventDefault();
                    }

                    if (childSubmenu.length) { // Only proceed if a submenu exists.
                        if (childSubmenu.is(':hidden')) {
                            // Expand the current submenu.
                            parentListElement.addClass('menu-item-open');
                            childSubmenu.slideDown(200);

                            // Collapse and hide other top-level sibling menu items, excluding the 'home' item.
                            parentListElement.siblings('li').each(function() {
                                const siblingLi = jq(this);
                                if (siblingLi.attr('id') !== 'mainSidebarNav-home') { // Renamed from #sidebar_menu_home
                                    siblingLi.find('ul').slideUp(150).end().removeClass('menu-item-open'); // Collapse any open sub-sub-menus
                                    siblingLi.slideUp(150);
                                }
                            });
                        } else {
                            // Collapse the current submenu and all its descendants.
                            childSubmenu.slideUp(200, function() {
                                parentListElement.removeClass('menu-item-open');
                                // Ensure all nested expanded items are also collapsed.
                                parentListElement.find('.menu-item-open').removeClass('menu-item-open').children('ul').hide();
                            });

                            // Show all sibling menu items that might have been hidden.
                            parentListElement.siblings('li').slideDown(150);
                        }
                        return false; // Prevent further bubbling for menu items with submenus.
                    }
                    // For links without submenus, allow normal navigation.
                    return true;
                });
            },

            // Dynamically sets top and bottom CSS offsets for main content areas.
            positionMainContentRegions: function() {
                const contentContainers = jq('#primaryViewArea, #secondaryViewArea'); // Renamed from #main_content, #sidebar_content
                if (contentContainers.length === 0) {
                    return;
                }

                contentContainers.each(function() {
                    const currentContainer = jq(this);
                    let computedTopOffset = 0;
                    let computedBottomOffset = 0;

                    // Calculate top offset based on header presence.
                    const hasPrimaryHeader = currentContainer.siblings('.header-primary-bar').length;
                    const hasSecondaryHeader = currentContainer.siblings('.header-secondary-bar').length;

                    if (hasPrimaryHeader) {
                        computedTopOffset += BASE_HEADER_FOOTER_HEIGHT;
                    }
                    if (hasSecondaryHeader) {
                        computedTopOffset += BASE_HEADER_FOOTER_HEIGHT;
                    }

                    // Calculate bottom offset based on footer presence.
                    const hasPrimaryFooter = currentContainer.siblings('.footer-primary-bar').length;
                    const hasSecondaryFooter = currentContainer.siblings('.footer-secondary-bar').length;

                    if (hasPrimaryFooter) {
                        computedBottomOffset += BASE_HEADER_FOOTER_HEIGHT;
                    }
                    if (hasSecondaryFooter) {
                        computedBottomOffset += BASE_HEADER_FOOTER_HEIGHT;
                    }

                    // Apply the calculated offsets using template literals for clarity.
                    currentContainer.css({
                        top: `${computedTopOffset}px`,
                        bottom: `${computedBottomOffset}px`
                    });
                });
            },

            // Initializes custom scrolling solutions (e.g., iScroll) for designated areas.
            activateCustomScrollbars: function() {
                const scrollableInnerAreas = jq('#mainScrollWrapper, #sideScrollWrapper'); // Renamed from #main_content_inner, #sidebar_content_inner
                if (scrollableInnerAreas.length === 0) {
                    return;
                }

                // Check for the global availability of the iScroll library.
                if (typeof globalWin.iScroll !== 'undefined') {
                    scrollableInnerAreas.each(function() {
                        const elementId = jq(this).attr('id');
                        if (elementId) {
                            try {
                                // Instantiate iScroll for each identified scrollable element.
                                new globalWin.iScroll(elementId);
                            } catch (error) {
                                console.warn(`[AppEnhancer] Could not initialize iScroll for ID '${elementId}':`, error.message);
                            }
                        }
                    });
                } else {
                    console.warn('[AppEnhancer] iScroll library not detected. Custom scrolling features will be unavailable.');
                }
            }
        }
    };
// Pass jQuery, window, and document objects as arguments for better module isolation.
})(jQuery, window, document);