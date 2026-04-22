/*
 * Enhanced Navigation Widget Core
 * Copyright (c) 2024 Your Name Here
 *
 * This software is provided under the terms of the MIT License:
 *   https://opensource.org/licenses/MIT
 *
 * This implementation offers advanced menu functionalities,
 * including touch support and dynamic path highlighting.
 */

(function (jQ, winGlobal) { // Renamed parameters
    "use strict"; // Keep strict mode

    // Internal module for managing navigation functionalities.
    const navModule = (() => { // Renamed `methods` to `navModule`, changed `var` to `const`

        // Configuration constants for styling classes and special attributes.
        const styleConsts = { // Renamed `c` to `styleConsts`
            breadCrumbClass: 'nav-path-active', // Renamed `bcClass`
            enabledClass: 'nav-active-js', // Renamed `menuClass`
            subIndicatorClass: 'nav-has-sub', // Renamed `anchorClass`
            arrowStyleClass: 'nav-with-arrows' // Renamed `menuArrowClass`
        };

        // Detect if the user agent is an iOS device.
        const isIOS = (() => { // Renamed `ios` to `isIOS`, changed `var` to `const`
            const userAgentString = navigator.userAgent; // Added intermediate variable
            const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgentString);
            if (isAppleMobile) {
                // For iOS, clicks on body children need to be handled to ensure proper bubbling.
                jQ(winGlobal).on('load', () => { // Changed `$(w).load` to `jQ(winGlobal).on('load')`
                    jQ('body').children().on('click', jQ.noop); // Rewritten `$('body').children().on('click', $.noop);`
                });
            }
            return isAppleMobile;
        })();

        // Detect if the browser is Internet Explorer Mobile (WP7).
        const isWp7 = (() => { // Renamed `wp7` to `isWp7`, changed `var` to `const`
            const docStyle = document.documentElement.style; // Renamed `style`
            return ('behavior' in docStyle && 'fill' in docStyle && /iemobile/i.test(navigator.userAgent));
        })();

        // Check for native PointerEvent support without prefixes.
        const hasUnprefixedPointerEvents = (() => { // Renamed `unprefixedPointerEvents`
            return (!!winGlobal.PointerEvent); // Explicitly reference `winGlobal`
        })();

        // Helper to update the main menu's CSS classes based on options.
        const adjustMenuClasses = (targetMenu, currentOpts) => { // Renamed `toggleMenuClasses`
            let activeClasses = styleConsts.enabledClass; // Renamed `classes`
            if (currentOpts.useCssArrows) { // Renamed `cssArrows`
                activeClasses = `${activeClasses} ${styleConsts.arrowStyleClass}`; // Using template literal
            }
            targetMenu.toggleClass(activeClasses);
        };

        // Marks the current path in the menu hierarchy.
        const markActivePath = (rootMenu, currentOpts) => { // Renamed `setPathToCurrent`
            const pathItems = rootMenu.find(`li.${currentOpts.currentPathClass}`); // Renamed `pathClass`
            const relevantItems = pathItems.slice(0, currentOpts.pathDepth); // Renamed `pathLevels`
            return relevantItems
                .addClass(`${currentOpts.activeHoverClass} ${styleConsts.breadCrumbClass}`) // Template literal for classes
                .filter(function () {
                    // Ensure only items that actually have a sub-menu are processed.
                    const subMenu = jQ(this).children(currentOpts.submenuSelector); // Renamed `popUpSelector`
                    return (subMenu.hide().show().length > 0); // Simplified check, inverted to > 0
                })
                .removeClass(currentOpts.currentPathClass);
        };

        // Toggles a specific class on anchor elements within a list item.
        const toggleSubmenuIndicator = (listItem) => { // Renamed `toggleAnchorClass`
            listItem.children('a').toggleClass(styleConsts.subIndicatorClass);
        };

        // Manages the 'touch-action' CSS property for responsive touch behavior.
        const updateTouchAction = (targetMenu) => { // Renamed `toggleTouchAction`
            let msTouchAttribute = targetMenu.css('ms-touch-action'); // Renamed `msTouchAction`
            let standardTouchAttribute = targetMenu.css('touch-action'); // Renamed `touchAction`

            // Normalize touch action attribute.
            let finalTouchAction = standardTouchAttribute || msTouchAttribute; // Combined assignment
            // Toggle between 'pan-y' and 'auto' for touch scrolling.
            finalTouchAction = (finalTouchAction === 'pan-y') ? 'auto' : 'pan-y';

            targetMenu.css({
                'ms-touch-action': finalTouchAction,
                'touch-action': finalTouchAction
            });
        };

        // Attaches event listeners for menu interactions (hover, touch, focus).
        const setupEventDelegation = (menuElement, optionsObj) => { // Renamed `applyHandlers`
            const interactiveTargets = `li:has(${optionsObj.submenuSelector})`; // Renamed `popUpSelector`

            if (jQ.fn.hoverIntent && !optionsObj.disableHoverIntent) { // Renamed `disableHI`
                menuElement.hoverIntent(handleMouseEnter, handleMouseLeave, interactiveTargets); // Renamed handlers
            } else {
                menuElement
                    .on('mouseenter.supernav', interactiveTargets, handleMouseEnter) // Renamed namespace
                    .on('mouseleave.supernav', interactiveTargets, handleMouseLeave); // Renamed namespace
            }

            let pointerEventName = 'MSPointerDown.supernav'; // Renamed `touchevent`
            if (hasUnprefixedPointerEvents) {
                pointerEventName = 'pointerdown.supernav';
            }
            if (!isIOS) {
                pointerEventName += ' touchend.supernav'; // Appended using +=
            }
            if (isWp7) {
                pointerEventName += ' mousedown.supernav'; // Appended using +=
            }

            menuElement
                .on('focusin.supernav', 'li', handleMouseEnter) // Renamed namespace
                .on('focusout.supernav', 'li', handleMouseLeave) // Renamed namespace
                .on(pointerEventName, 'a', optionsObj, handleTouchInteraction); // Renamed handler
        };

        // Handles touch/pointer interactions on menu items.
        const handleTouchInteraction = (eventData) => { // Renamed `touchHandler`
            const currentAnchor = jQ(this); // Renamed `$this`
            const subMenuElement = currentAnchor.siblings(eventData.data.submenuSelector); // Renamed `$ul`, using `eventData.data`

            // Only proceed if a sub-menu exists and is currently hidden.
            if (subMenuElement.length > 0 && subMenuElement.is(':hidden')) {
                currentAnchor.one('click.supernav', false); // Prevent default click
                if (eventData.type === 'MSPointerDown' || eventData.type === 'pointerdown') {
                    currentAnchor.trigger('focus');
                } else {
                    // Use a more direct call for showing the menu.
                    const parentListItem = currentAnchor.parent('li'); // Added intermediate variable
                    handleMouseEnter.call(parentListItem); // Directly call `handleMouseEnter`
                }
            }
        };

        // Event handler for mouse entering a menu item (or focusin).
        const handleMouseEnter = function () { // Renamed `over`
            const currentItem = jQ(this); // Renamed `$this`
            const currentItemOptions = retrieveOptions(currentItem); // Renamed `o`, `getOptions`
            if (!currentItemOptions) return; // Guard clause

            clearTimeout(currentItemOptions.sfTimer); // Clear existing timer
            currentItem.siblings().superNav('hideSubmenus').end().superNav('showSubmenus'); // Renamed `superfish` to `superNav`
        };

        // Event handler for mouse leaving a menu item (or focusout).
        const handleMouseLeave = function () { // Renamed `out`
            const currentItem = jQ(this); // Renamed `$this`
            const currentItemOptions = retrieveOptions(currentItem); // Renamed `o`
            if (!currentItemOptions) return; // Guard clause

            if (isIOS) {
                // Immediately close for iOS devices.
                finalizeClose.call(currentItem, currentItemOptions); // Renamed `close`, used `call`
            } else {
                clearTimeout(currentItemOptions.sfTimer);
                currentItemOptions.sfTimer = setTimeout(() => { // Rewritten `$.proxy` with arrow function
                    finalizeClose.call(currentItem, currentItemOptions);
                }, currentItemOptions.openDelay); // Renamed `delay`
            }
        };

        // Finalizes the closing of a menu item.
        const finalizeClose = function (optionsObject) { // Renamed `close`
            const currentElement = jQ(this); // Added intermediate variable
            optionsObject.retainPath = (optionsObject.$path.indexOf(currentElement[0]) > -1); // Changed `$.inArray` to `indexOf`
            currentElement.superNav('hideSubmenus'); // Renamed `superfish`

            // If the element is no longer part of an active path.
            if (!currentElement.parents(`.${optionsObject.activeHoverClass}`).length) { // Using template literal
                optionsObject.onMenuIdle.call(findRootMenu(currentElement)); // Renamed `onIdle`, `getMenu`
                if (optionsObject.$path.length) {
                    handleMouseEnter.call(optionsObject.$path); // Renamed `over`
                }
            }
        };

        // Finds the root menu element for a given item.
        const findRootMenu = (element) => { // Renamed `getMenu`
            return element.closest(`.${styleConsts.enabledClass}`); // Using template literal
        };

        // Retrieves options associated with a menu element.
        const retrieveOptions = (element) => { // Renamed `getOptions`
            const rootMenu = findRootMenu(element); // Renamed `getMenu`
            return rootMenu.data('nav-options'); // Renamed data key
        };

        return {
            // Public methods exposed by the navigation module.

            // Hides sub-menus.
            hideSubmenus: function (immediate) { // Renamed `hide`
                if (!this.length) { // Added guard for empty jQuery object
                    return this;
                }
                const currentContext = this; // Renamed `$this`
                const opts = retrieveOptions(currentContext); // Renamed `o`
                if (!opts) {
                    return currentContext; // Return original context if no options
                }

                const pathExclusion = (opts.retainPath === true) ? opts.$path : jQ(); // Changed '' to jQ() for consistency
                const submenusToHide = currentContext.find(`li.${opts.activeHoverClass}`).add(currentContext).not(pathExclusion).removeClass(opts.activeHoverClass).children(opts.submenuSelector); // Renamed `$ul`
                let transitionSpeed = opts.hideSpeed; // Renamed `speed`

                if (immediate) {
                    submenusToHide.show(); // Ensure they are visible before hiding instantly
                    transitionSpeed = 0;
                }
                opts.retainPath = false; // Reset path retention after hiding
                opts.onBeforeClose.call(submenusToHide); // Renamed `onBeforeHide`
                submenusToHide.stop(true, true).animate(opts.hideAnimation, transitionSpeed, function () { // Renamed `animationOut`
                    // Changed `var $this = $(this);` to direct `jQ(this)`
                    opts.onClose.call(jQ(this)); // Renamed `onHide`
                });
                return currentContext;
            },

            // Displays sub-menus.
            showSubmenus: function () { // Renamed `show`
                const opts = retrieveOptions(this);
                if (!opts) {
                    return this;
                }
                const targetElement = this.addClass(opts.activeHoverClass); // Renamed `$this`
                const submenuContainer = targetElement.children(opts.submenuSelector); // Renamed `$ul`

                opts.onBeforeOpen.call(submenuContainer); // Renamed `onBeforeShow`
                submenuContainer.stop(true, true).animate(opts.showAnimation, opts.showSpeed, function () { // Renamed `animation`, `speed`
                    opts.onOpen.call(submenuContainer); // Renamed `onShow`
                });
                return this;
            },

            // Destroys the navigation instance, removing all event handlers and classes.
            removeInstance: function () { // Renamed `destroy`
                return this.each(function () {
                    const currentElement = jQ(this); // Renamed `$this`
                    const instanceOptions = currentElement.data('nav-options'); // Renamed `o`
                    let hasSubmenuLIs; // Renamed `$hasPopUp` for clarity

                    if (!instanceOptions) {
                        return true; // Use `true` to continue `each` loop
                    }

                    hasSubmenuLIs = currentElement.find(instanceOptions.submenuSelector).parent('li');
                    clearTimeout(instanceOptions.sfTimer); // Clear any pending timers

                    // Revert all applied changes
                    adjustMenuClasses(currentElement, instanceOptions); // Renamed
                    toggleSubmenuIndicator(hasSubmenuLIs); // Renamed
                    updateTouchAction(currentElement); // Renamed

                    // Detach all relevant event handlers.
                    currentElement.off('.supernav').off('.hoverIntent'); // Renamed namespace

                    // Clear inline display styles from submenus.
                    hasSubmenuLIs.children(instanceOptions.submenuSelector).attr('style', (idx, currentStyle) => { // Using arrow function, renamed params
                        return currentStyle ? currentStyle.replace(/display[^;]+;?/g, '') : ''; // Guard against null style
                    });

                    // Reset path classes and hover states.
                    instanceOptions.$path.removeClass(`${instanceOptions.activeHoverClass} ${styleConsts.breadCrumbClass}`).addClass(instanceOptions.currentPathClass); // Template literal
                    currentElement.find(`.${instanceOptions.activeHoverClass}`).removeClass(instanceOptions.activeHoverClass); // Template literal
                    instanceOptions.onInstanceDestroy.call(currentElement); // Renamed `onDestroy` callback

                    // Remove stored options data.
                    currentElement.removeData('nav-options');
                });
            },

            // Initializes a new navigation instance on the selected elements.
            initialize: function (userConfig) { // Renamed `init`, `op` to `userConfig`
                return this.each(function () {
                    const currentNavElement = jQ(this); // Renamed `$this`

                    // Prevent re-initialization on elements that already have options.
                    if (currentNavElement.data('nav-options')) {
                        return true; // Continue to next element in `each`
                    }

                    // Merge default options with user-provided configuration.
                    const finalOptions = jQ.extend({}, jQ.fn.superNav.defaults, userConfig); // Renamed `o`, `superfish`
                    const listItemsWithSubmenus = currentNavElement.find(finalOptions.submenuSelector).parent('li'); // Renamed `$hasPopUp`

                    // Set up and store the active path.
                    finalOptions.$path = markActivePath(currentNavElement, finalOptions); // Renamed `setPathToCurrent`

                    currentNavElement.data('nav-options', finalOptions); // Store merged options

                    // Apply initial styling and event handlers.
                    adjustMenuClasses(currentNavElement, finalOptions); // Renamed
                    toggleSubmenuIndicator(listItemsWithSubmenus); // Renamed
                    updateTouchAction(currentNavElement); // Renamed
                    setupEventDelegation(currentNavElement, finalOptions); // Renamed

                    // Hide submenus initially, excluding breadcrumb path.
                    listItemsWithSubmenus.not(`.${styleConsts.breadCrumbClass}`).superNav('hideSubmenus', true); // Renamed `superfish`, `hide`

                    finalOptions.onInitCallback.call(this); // Renamed `onInit` callback
                });
            }
        };
    })(); // End of navModule IIFE

    // Extend jQuery's prototype with the new navigation plugin.
    jQ.fn.superNav = function (action, params) { // Renamed `superfish`, `method`, `args`
        // Validate `action` parameter.
        if (typeof action === 'string' && navModule[action]) { // Added type check for `action`
            // If `action` is a string and corresponds to an available method.
            // Call the method with the current jQuery object as context and subsequent arguments.
            const methodArguments = Array.prototype.slice.call(arguments, 1); // Renamed
            return navModule[action].apply(this, methodArguments);
        } else if (typeof action === 'object' || !action) {
            // If `action` is an object (config for init) or undefined (default init).
            // Call the initialization method.
            return navModule.initialize.apply(this, arguments); // Renamed `init`
        } else {
            // Handle unknown or invalid method calls.
            const errorMessage = `Method "${action}" is not available on jQ.fn.superNav.`; // Using template literal
            jQ.error(errorMessage);
            return this; // Return `this` for chaining even on error
        }
    };

    // Default configuration for the superNav plugin.
    jQ.fn.superNav.defaults = { // Renamed `superfish`
        submenuSelector: 'ul, .nav-mega', // Renamed `popUpSelector`, changed value
        activeHoverClass: 'hoverActive', // Renamed `hoverClass`, changed value
        currentPathClass: 'path-marker-class', // Renamed `pathClass`, changed value
        pathDepth: 2, // Renamed `pathLevels`, changed value
        openDelay: 700, // Renamed `delay`, changed value
        showAnimation: {
            opacity: 'toggle',
            height: 'show'
        }, // Renamed `animation`, added `height`
        hideAnimation: {
            opacity: 'hide',
            width: 'hide'
        }, // Renamed `animationOut`, added `width`
        showSpeed: 300, // Renamed `speed`, changed value from string to number
        hideSpeed: 200, // Renamed `speedOut`, changed value from string to number
        useCssArrows: false, // Renamed `cssArrows`, changed default value
        disableHoverIntent: true, // Renamed `disableHI`, changed default value
        onInitCallback: jQ.noop, // Renamed `onInit`
        onBeforeOpen: jQ.noop, // Renamed `onBeforeShow`
        onOpen: jQ.noop, // Renamed `onShow`
        onBeforeClose: jQ.noop, // Renamed `onBeforeHide`
        onClose: jQ.noop, // Renamed `onHide`
        onMenuIdle: jQ.noop, // Renamed `onIdle`
        onInstanceDestroy: jQ.noop // Renamed `onDestroy`
    };

})(jQuery, window); // Pass jQuery and window to the IIFE