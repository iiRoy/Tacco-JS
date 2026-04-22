/*
 * Core functionality for interactive web components.
 */

class StickyWidgetManager {
    constructor() {
        // Configuration settings for the managed element.
        this.settings = {
            targetSelector: null,    // CSS selector for the DOM element to manage.
            verticalOffset: 0        // Pixels to maintain from the viewport top when sticky.
        };

        // Internal data storage for dynamic calculations and element references.
        this.runtimeData = {
            initialTargetY: 0,           // Original Y-coordinate of the target element.
            adjacentPredecessor: null,   // Reference to the immediately preceding visible sibling.
            containerElementY: 0,        // Top Y-coordinate of the target's parent container.
            spacerPlaceholder: jQuery('<div/>') // An invisible element to prevent layout shifts.
        };
    }

    /**
     * Initializes the sticky behavior for a specific DOM element.
     * @param {object} opts - Configuration options to override defaults.
     * @returns {boolean} True if initialization was successful, false otherwise.
     */
    initializeBehavior(opts) {
        // Apply provided options, overriding defaults.
        Object.assign(this.settings, opts);

        const instanceRef = this; // Capture 'this' for event handlers.
        const managedNode = jQuery(instanceRef.settings.targetSelector);

        // Terminate if the target element does not exist in the DOM.
        if (!managedNode.length) {
            return false; // Indicate initialization failure.
        }

        // Attempt to find the last visible preceding sibling element.
        let currentPredecessor = managedNode.prev();
        while (currentPredecessor.length && currentPredecessor.is(':hidden')) {
            currentPredecessor = currentPredecessor.prev();
        }
        instanceRef.runtimeData.adjacentPredecessor = currentPredecessor.length ? currentPredecessor : null;

        // Determine the absolute top position of the parent container, accounting for its padding and border.
        const containingBlock = managedNode.parent();
        const containerOffset = containingBlock.offset().top;
        const containerBorderTop = parseFloat(containingBlock.css('border-top-width')) || 0;
        const containerPaddingTop = parseFloat(containingBlock.css('padding-top')) || 0;
        instanceRef.runtimeData.containerElementY = containerOffset + containerBorderTop + containerPaddingTop;

        // Attach event listeners for window scroll and resize events.
        // Use a single handler for efficiency and consistency.
        jQuery(window).on('scroll resize', function() {
            instanceRef.evaluatePositionUpdate(managedNode, instanceRef);
        });

        // Trigger an initial position update immediately after setup.
        instanceRef.evaluatePositionUpdate(managedNode, instanceRef);
        return true; // Indicate successful initialization.
    }

    /**
     * Recalculates and applies the necessary CSS to keep the element sticky or return it to its natural flow.
     * @param {jQuery} targetElement The jQuery object representing the element being managed.
     * @param {StickyWidgetManager} managerInstance The current instance of the StickyWidgetManager.
     */
    evaluatePositionUpdate(targetElement, managerInstance) {
        // If the target is not visible, no positioning updates are needed.
        if (targetElement.is(':hidden')) {
            return;
        }

        let effectiveTopMargin = managerInstance.settings.verticalOffset;

        // Account for any potential 'top' CSS property on the body, which might offset the viewport.
        const bodyComputedTop = parseFloat(jQuery('body').css('top')) || 0;
        effectiveTopMargin += bodyComputedTop;

        // Calculate the absolute Y-coordinate where the element would naturally sit,
        // adjusted by the desired vertical offset.
        const elementNaturalY = targetElement.offset().top - effectiveTopMargin;

        // Determine the upper boundary for the sticky behavior.
        // This is either the bottom of the preceding visible sibling, or the parent's top edge.
        let stickyUpperBoundary = 0;
        const precedingNode = managerInstance.runtimeData.adjacentPredecessor;
        if (precedingNode && precedingNode.length) {
            stickyUpperBoundary = precedingNode.offset().top + precedingNode.outerHeight(true); // Include margin
        } else {
            stickyUpperBoundary = managerInstance.runtimeData.containerElementY - effectiveTopMargin;
        }

        const currentScrollPosition = jQuery(document).scrollTop();

        // Check if the element should become sticky.
        if (currentScrollPosition > elementNaturalY) {
            // If not already sticky, transition to fixed positioning.
            if (targetElement.css('position') !== 'fixed') {
                const elementCurrentHeight = targetElement.outerHeight(true); // Include margin for placeholder
                managerInstance.runtimeData.spacerPlaceholder
                    .css({
                        'height': elementCurrentHeight + 'px',
                        'margin-bottom': targetElement.css('margin-bottom') // Preserve original margin
                    })
                    .insertBefore(targetElement);

                managerInstance.runtimeData.initialTargetY = elementNaturalY; // Store original Y for later comparison.

                targetElement.css({
                    top: effectiveTopMargin + 'px',
                    position: 'fixed',
                    width: targetElement.css('width') // Maintain original width
                });
            }
        }
        // Otherwise, if it was sticky or should return to natural flow.
        else if (managerInstance.runtimeData.initialTargetY > elementNaturalY || currentScrollPosition <= stickyUpperBoundary) {
            // Restore to natural document flow if conditions for stickiness are no longer met.
            if (targetElement.css('position') === 'fixed') {
                managerInstance.runtimeData.spacerPlaceholder.remove(); // Remove the placeholder.
                targetElement.css({
                    position: 'static',
                    top: 'auto',
                    width: 'auto'
                });
                managerInstance.runtimeData.initialTargetY = 0; // Reset initial Y.
            }
        }
    }
}

/*
 * Document ready event handler for general page enhancements.
 */
jQuery(document).ready(function($) {
    // Smooth scroll functionality for "back to top" button.
    $('.scroll-to-top-btn').on('click', function(evt) {
        evt.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 600); // Slightly slower animation.
    });

    // Interactive tabbed content for widgets.
    $('.dynamic-tabs-header > li').on('click', function() {
        const currentTabItem = $(this);
        if (currentTabItem.hasClass('active-tab')) {
            return; // Already active, do nothing.
        }

        const tabbedPanel = currentTabItem.closest('.interactive-tab-group'); // More generic parent class.

        currentTabItem.addClass('active-tab')
                      .siblings().removeClass('active-tab');

        // Locate and update the corresponding content panel.
        const contentContainers = tabbedPanel.find('.tab-content-wrapper > ul');
        const clickedTabIndex = tabbedPanel.find('.dynamic-tabs-header > li').index(currentTabItem);

        contentContainers.stop(true, true).slideUp('normal')
                         .eq(clickedTabIndex).slideDown('normal');
    });

    // Comment section navigation tabs.
    $('#discussion-nav a').on('click', function() {
        const selectedCommentTab = $(this);
        if (selectedCommentTab.hasClass('is-active')) {
            return; // Already active.
        }

        selectedCommentTab.addClass('is-active')
                          .siblings().removeClass('is-active');

        // Toggle visibility of comment sections following the nav.
        selectedCommentTab.parent().nextAll('.discussion-section').slideToggle('slow');
    });

    // Initialize the fixed position widget behavior for a specific sidebar element.
    const stickyWidgetInstance = new StickyWidgetManager();
    const initSuccess = stickyWidgetInstance.initializeBehavior({
        targetSelector: '#fixed-sidebar-content', // Renamed ID.
        verticalOffset: 65 // Slightly different offset.
    });

    if (!initSuccess) {
        // Fallback or notification if the sticky widget couldn't be set up.
    }

    // Mobile navigation menu toggle handler.
    $('#mobile-navigation-toggle').on('click', function() {
        const mainHeaderArea = $('#page-header'); // Renamed header ID.
        const primaryNavMenu = mainHeaderArea.find('.main-nav-links'); // Renamed menu class.
        const searchUtilityBar = mainHeaderArea.find('.search-bar-module'); // Renamed search box class.

        searchUtilityBar.fadeToggle(200); // Faster fade.

        if (mainHeaderArea.data('menu-is-expanded')) { // Using data attribute instead of class.
            primaryNavMenu.slideToggle(300, function() { // Slightly different speed.
                mainHeaderArea.data('menu-is-expanded', false);
            });
        } else {
            mainHeaderArea.data('menu-is-expanded', true);
            primaryNavMenu.slideToggle(300);
        }
    });

    // Toggle author information display in comments.
    $('#discussion-area').on('click', '#contributor-profile-toggle', function() {
        const authorDetailsSection = $('#contributor-details');
        const toggleLinkText = $(this).find('span'); // Using span instead of u.

        authorDetailsSection.slideToggle(400, function() { // Different animation speed.
            if (authorDetailsSection.is(':hidden')) {
                // Update greeting message with current author name.
                $('#welcome-user strong').text($('#user-name-input').val()); // Using .text() for safety, renamed selectors.
                toggleLinkText.text('Change'); // New text.
            } else {
                toggleLinkText.text('Hide'); // New text.
            }
        });
    });

    // General error logging for unhandled jQuery errors (added guard clause).
    if ($.fn.jquery) { // Check if jQuery is loaded.
        $(document).ajaxError(function(event, xhr, settings, thrownError) {
            // Log AJAX errors to console for debugging.
        });
    }
});