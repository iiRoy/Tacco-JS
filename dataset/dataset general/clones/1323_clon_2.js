/*
 * jQuery Mega Menu Plugin
 * Copyright (c) 2024 Code Clone Generator
 *
 * This code is a Type II clone of the Superfish plugin.
 * It maintains identical functionality and structure, but
 * all identifiers, internal data, and presentation aspects
 * have been significantly altered.
 *
 * Licensed under the same MIT and GPL licenses as the original:
 *	https://opensource.org/licenses/mit-license.php
 *	https://www.gnu.org/licenses/gpl.html
 */

(function (jq, globWin) {
	"use strict";

	// Core logic and public API for the plugin
	var pluginLogic = (function () {
		// Internal configuration and utility functions
		var cfg = {
				breadCrumbCls: 'nav-trail', // Class for breadcrumb items
				mainNavCls: 'nav-active', // Class for the main navigation element
				linkHasSubCls: 'has-children-link', // Class for links that have sub-menus
				navArrowCls: 'nav-arrows' // Class to enable CSS-based arrows
			},
			// Check if the current device is an Apple mobile device
			isAppleMobile = (function () {
				var isAppleMobile = /iP(hone|ad|od)/i.test(navigator.userAgent);
				// On iOS, clicks only propagate up to direct body children.
				// This ensures that click events on the body are handled.
				if (isAppleMobile) {
					jq(globWin).on('load', function () {
						jq('body').children().on('click', jq.noop);
					});
				}
				return isAppleMobile;
			})(),
			// Determine if the browser is Internet Explorer Mobile (Windows Phone 7)
			isWinPhone = (function () {
				var browserStyle = document.documentElement.style;
				return ('behavior' in browserStyle && 'fill' in browserStyle && /iE(M|m)obile/i.test(navigator.userAgent));
			})(),
			// Check for native support for Pointer Events
			supportsPointerEvents = (function () {
				return (!!globWin.PointerEvent);
			})(),
			// Function to add/remove main navigation classes
			adjustNavClasses = function (mainMenu, options) {
				var currentClasses = cfg.mainNavCls;
				if (options.useCssArrows) {
					currentClasses += ' ' + cfg.navArrowCls;
				}
				mainMenu.toggleClass(currentClasses);
			},
			// Marks the path to the currently active menu item
			markActivePath = function (mainMenu, options) {
				return mainMenu.find('li.' + options.activePathCls).slice(0, options.activePathDepth)
					.addClass(options.activeStateCls + ' ' + cfg.breadCrumbCls)
						.filter(function () {
							// Show and hide to force a repaint, checking if there's a sub-menu
							return (jq(this).children(options.subnavSelector).hide().show().length);
						}).removeClass(options.activePathCls); // Remove the path class from the now-active items
			},
			// Toggles a class on anchor elements within list items
			modifyLinkIndicator = function (listItem) {
				listItem.children('a').toggleClass(cfg.linkHasSubCls);
			},
			// Adjusts CSS touch-action property for better touch interaction
			updateTouchBehavior = function (mainMenu) {
				var msAction = mainMenu.css('ms-touch-action');
				var currentAction = mainMenu.css('touch-action');
				currentAction = currentAction || msAction; // Fallback for older MS implementations
				// Toggle between 'pan-y' and 'auto' to manage scroll behavior
				currentAction = (currentAction === 'pan-y') ? 'auto' : 'pan-y';
				mainMenu.css({
					'ms-touch-action': currentAction,
					'touch-action': currentAction
				});
			},
			// Attaches various event handlers to the menu
			attachEventHandlers = function (mainMenu, options) {
				var targetElements = 'li:has(' + options.subnavSelector + ')'; // Selects LIs that contain sub-menus
				if (jq.fn.hoverIntent && !options.disableHoverIntent) {
					mainMenu.hoverIntent(handleMouseEnter, handleMouseLeave, targetElements);
				}
				else {
					// Standard mouse events if hoverIntent is not available or disabled
					mainMenu
						.on('mouseenter.megaMenu', targetElements, handleMouseEnter)
						.on('mouseleave.megaMenu', targetElements, handleMouseLeave);
				}
				var touchEventName = 'MSPointerDown.megaMenu';
				// Use standard pointerdown if supported
				if (supportsPointerEvents) {
					touchEventName = 'pointerdown.megaMenu';
				}
				// Add touchend event for non-iOS devices
				if (!isAppleMobile) {
					touchEventName += ' touchend.megaMenu';
				}
				// Add mousedown for Windows Phone 7
				if (isWinPhone) {
					touchEventName += ' mousedown.megaMenu';
				}
				mainMenu
					.on('focusin.megaMenu', 'li', handleMouseEnter) // Handle keyboard focus
					.on('focusout.megaMenu', 'li', handleMouseLeave) // Handle keyboard blur
					.on(touchEventName, 'a', options, handleTouchInteraction); // Handle touch/pointer events on links
			},
			// Handles touch-specific interactions for sub-menus
			handleTouchInteraction = function (eventObj) {
				var currentElem = jq(this),
					subList = currentElem.siblings(eventObj.data.subnavSelector); // Get sibling sub-menu

				// If a sub-menu exists and is currently hidden
				if (subList.length > 0 && subList.is(':hidden')) {
					currentElem.one('click.megaMenu', false); // Prevent default click action once
					if (eventObj.type === 'MSPointerDown' || eventObj.type === 'pointerdown') {
						currentElem.trigger('focus'); // Trigger focus for pointer events
					} else {
						jq.proxy(handleMouseEnter, currentElem.parent('li'))(); // Manually trigger mouse enter
					}
				}
			},
			// Handler for mouse enter event (or equivalent)
			handleMouseEnter = function () {
				var currentElem = jq(this),
					options = retrieveOptions(currentElem);
				clearTimeout(options.sfTimer); // Clear any pending hide timers
				// Hide siblings and then show the current element's sub-menu
				currentElem.siblings().megaMenu('conceal').end().megaMenu('display');
			},
			// Handler for mouse leave event (or equivalent)
			handleMouseLeave = function () {
				var currentElem = jq(this),
					options = retrieveOptions(currentElem);
				if (isAppleMobile) {
					// For iOS, trigger hide immediately
					jq.proxy(hideSubmenus, currentElem, options)();
				}
				else {
					// For other devices, set a timeout to hide the sub-menu
					clearTimeout(options.sfTimer);
					options.sfTimer = setTimeout(jq.proxy(hideSubmenus, currentElem, options), options.hideDelay);
				}
			},
			// Hides the sub-menus for a given element
			hideSubmenus = function (options) {
				// Check if the current element is part of the retained path
				options.retainPath = (jq.inArray(this[0], options.$path) > -1);
				this.megaMenu('conceal'); // Use the public 'conceal' method

				// If no parents have the active class (menu is fully closed)
				if (!this.parents('.' + options.activeStateCls).length) {
					options.onMenuIdle.call(getParentMenu(this)); // Call idle callback
					if (options.$path.length) {
						jq.proxy(handleMouseEnter, options.$path)(); // Re-activate the path if one exists
					}
				}
			},
			// Retrieves the main menu element from a given element
			getParentMenu = function (targetElement) {
				return targetElement.closest('.' + cfg.mainNavCls);
			},
			// Gets the options object associated with a menu element
			retrieveOptions = function (targetElement) {
				return getParentMenu(targetElement).data('mm-settings'); // 'mm-settings' is the new data key
			};

		return {
			// Public method to hide sub-menus
			conceal: function (immediately) {
				if (this.length) {
					var currentElem = this,
						options = retrieveOptions(currentElem);
					if (!options) {
						return this; // No options, not initialized
					}
					// Determine elements to hide: all active items not in the retained path
					var excludedPaths = (options.retainPath === true) ? options.$path : '',
						subList = currentElem.find('li.' + options.activeStateCls).add(this).not(excludedPaths).removeClass(options.activeStateCls).children(options.subnavSelector),
						animSpeed = options.hideSpeed;

					if (immediately) {
						subList.show(); // Show immediately if requested
						animSpeed = 0;
					}
					options.retainPath = false; // Reset path retention
					options.onBeforeSubnavHide.call(subList); // Callback before hide animation
					subList.stop(true, true).animate(options.hideAnimation, animSpeed, function () {
						var currentSub = jq(this);
						options.onSubnavHide.call(currentSub); // Callback after hide animation
					});
				}
				return this;
			},
			// Public method to display sub-menus
			display: function () {
				var options = retrieveOptions(this);
				if (!options) {
					return this; // No options, not initialized
				}
				var currentElem = this.addClass(options.activeStateCls), // Add active class
					subList = currentElem.children(options.subnavSelector); // Get sub-menu

				options.onBeforeSubnavShow.call(subList); // Callback before show animation
				subList.stop(true, true).animate(options.showAnimation, options.showSpeed, function () {
					options.onSubnavShow.call(subList); // Callback after show animation
				});
				return this;
			},
			// Public method to remove plugin functionality
			terminate: function () {
				return this.each(function () {
					var currentElem = jq(this),
						options = currentElem.data('mm-settings'), // Retrieve settings
						elementsWithSubNav;
					if (!options) {
						return false; // Not initialized
					}
					elementsWithSubNav = currentElem.find(options.subnavSelector).parent('li');
					clearTimeout(options.sfTimer); // Clear any pending timers
					adjustNavClasses(currentElem, options); // Remove main menu classes
					modifyLinkIndicator(elementsWithSubNav); // Remove link indicators
					updateTouchBehavior(currentElem); // Reset touch behavior
					// Remove all namespaced event handlers
					currentElem.off('.megaMenu').off('.intentHover');
					// Clear inline display styles from sub-menus
					elementsWithSubNav.children(options.subnavSelector).attr('style', function (indexVal, inlineStyle) {
						return inlineStyle.replace(/display[^;]+;?/g, '');
					});
					// Reset 'current' path classes
					options.$path.removeClass(options.activeStateCls + ' ' + cfg.breadCrumbCls).addClass(options.activePathCls);
					currentElem.find('.' + options.activeStateCls).removeClass(options.activeStateCls);
					options.onPluginDestroy.call(currentElem); // Callback on destruction
					currentElem.removeData('mm-settings'); // Remove stored data
				});
			},
			// Public method to initialize the plugin
			initialize: function (userOpts) {
				return this.each(function () {
					var currentElem = jq(this);
					if (currentElem.data('mm-settings')) {
						return false; // Already initialized
					}
					// Merge default settings with user-provided options
					var options = jq.extend({}, jq.fn.megaMenu.defaultSettings, userOpts),
						elementsWithSubNav = currentElem.find(options.subnavSelector).parent('li');
					options.$path = markActivePath(currentElem, options); // Mark initial active path

					currentElem.data('mm-settings', options); // Store options on the element

					adjustNavClasses(currentElem, options); // Apply main menu classes
					modifyLinkIndicator(elementsWithSubNav); // Apply link indicators
					updateTouchBehavior(currentElem); // Set touch action
					attachEventHandlers(currentElem, options); // Attach all event handlers

					// Hide all sub-menus except those in the breadcrumb path
					elementsWithSubNav.not('.' + cfg.breadCrumbCls).megaMenu('conceal', true);

					options.onPluginInit.call(this); // Callback after initialization
				});
			}
		};
	})();

	// jQuery plugin integration
	jq.fn.megaMenu = function (actionName, actionArguments) {
		// If a specific method name is provided and exists in pluginLogic
		if (pluginLogic[actionName]) {
			// Call the method with 'this' context and arguments
			return pluginLogic[actionName].apply(this, Array.prototype.slice.call(actionArguments, 1));
		}
		// If no method name or an options object is provided, initialize the plugin
		else if (typeof actionName === 'object' || !actionName) {
			return pluginLogic.initialize.apply(this, actionArguments);
		}
		// If an unknown method name is provided
		else {
			return jq.error('Action "' + actionName + '" is not defined for jq.fn.megaMenu');
		}
	};

	// Default configuration settings for the megaMenu plugin
	jq.fn.megaMenu.defaultSettings = {
		subnavSelector: 'ul,.mega-panel', // Selector for sub-navigation elements within a list item
		activeStateCls: 'is-active', // Class applied to active menu items
		activePathCls: 'current-page-ancestor', // Class used to identify the path to the current page
		activePathDepth: 2, // How many levels up the path should be marked
		hideDelay: 750, // Delay in milliseconds before hiding sub-menus on mouseout
		showAnimation: {opacity: 'show'}, // Animation properties for showing sub-menus
		hideAnimation: {opacity: 'hide'}, // Animation properties for hiding sub-menus
		showSpeed: 'normal', // Speed of the show animation
		hideSpeed: 'fast', // Speed of the hide animation
		useCssArrows: true, // Enable/disable CSS-based arrows for sub-menu indicators
		disableHoverIntent: false, // Disable the HoverIntent plugin if true
		onPluginInit: jq.noop, // Callback function fired after plugin initialization
		onBeforeSubnavShow: jq.noop, // Callback before a sub-menu is shown
		onSubnavShow: jq.noop, // Callback after a sub-menu is shown
		onBeforeSubnavHide: jq.noop, // Callback before a sub-menu is hidden
		onSubnavHide: jq.noop, // Callback after a sub-menu is hidden
		onMenuIdle: jq.noop, // Callback when the menu is in an idle state (no sub-menus open)
		onPluginDestroy: jq.noop // Callback after the plugin has been destroyed
	};

})(jQuery, window);