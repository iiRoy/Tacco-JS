/*
 *  jQuery.ScrollerTabs - Dynamic Tab Management and Scrolling Utility
 *  @license MIT & GPL - Dual licensed for flexibility and broad adoption.
 *  @author Code Architect - An evolution from existing scrollable tab patterns.
 *  @version 2.1.0 - Enhanced scrolling, improved UI responsiveness, and modular design.
 *  @date 2023-10-27
 *  This utility provides advanced horizontal scrolling and management for jQuery UI tabs,
 *  offering features such as dynamic navigation buttons, container resizability,
 *  and user-closable tabs. It aims to improve user experience in applications
 *  with a large number of open tabs.
 */
;(function(jqInstance){ // Renamed $ to jqInstance to avoid global $ conflicts and for clarity.

    // Core configuration for the tab scroller module.
    // These default values define the plugin's behavior and can be
    // selectively overridden by user-provided options during initialization.
    const scrollerDefaults = { // Renamed 'settings' to 'scrollerDefaults', changed var to const.
        'scrollAnimationDuration' : 150, // Time in milliseconds for smooth scroll transitions.
        'canCloseTabs' : false, // Boolean: If true, a close button will appear on each tab.
        'enableContainerResizing' : false, // Boolean: Allows the entire tab container to be resized by the user.
        'resizeHandleConfiguration' : 'e,s,se', // Specifies active resize handles (e.g., 'east', 'south', 'southeast').
        'activateLastTabOnLoad': false, // If true, the last tab added will be selected and scrolled into view upon plugin initialization.
        'animationEasingStyle':'easeInOutSine', // Easing function for scroll animations (requires jQuery UI effects).
        'onTabCloseCallback': null // A function to be executed after a tab has been successfully closed.
    };

    // The main plugin definition. Attaches the functionality to jQuery's prototype.
    jqInstance.fn.scrollerTabs = function(inputOptions){ // Renamed scrollabletab to scrollerTabs, options to inputOptions.
        // Pre-flight check: Ensure jQuery UI Tabs plugin is available, as it's a fundamental dependency.
        if (!jqInstance.fn.tabs) {
            console.error("ScrollerTabs Error: The 'jQuery UI Tabs' plugin is a required dependency but was not detected.");
            return this; // Return the jQuery object to maintain chainability.
        }

        // Iterate over each selected DOM element to apply the plugin.
        return this.each(function(){
            // Merge user-provided options with our default settings.
            // Using Object.assign for a modern, shallow merge.
            const operationalOptions = Object.assign({}, scrollerDefaults, inputOptions); // Renamed 'o' to 'operationalOptions'.

            const $tabHostContainer = jqInstance(this); // Renamed '$tabs' to '$tabHostContainer'.
            const $tabHeaderNav = $tabHostContainer.find('.ui-tabs-nav'); // Renamed '$tabsNav' to '$tabHeaderNav'.
            let $navButtonsWrapper; // Will store the jQuery object for navigation controls. Renamed '$nav'.

            // --- Initial DOM Structure & Styling Adjustments ---
            // Apply base CSS for proper positioning and overflow management.
            $tabHostContainer.css({ 'padding': '2px', 'position': 'relative', 'overflow': 'hidden' });

            // Wrap the main tab host in a parent div for layout control and resizability.
            // Then, wrap the inner content of the navigation header to create a scrollable track.
            $tabHostContainer.wrap('<div class="scroller-tabs-host-wrapper" style="position:relative;"/>'); // New class name.
            $tabHeaderNav.css('overflow', 'hidden')
                         .wrapInner('<div class="scroller-tabs-scroll-track" style="width:30000px"><span class="width-measurement-probe"/></div>'); // New classes.

            // Cache references to newly created/wrapped DOM elements.
            const $widthProbeElement = $tabHostContainer.find('.width-measurement-probe'); // Renamed '$widthChecker'.
            const $scrollTrackElement = $tabHostContainer.find('.scroller-tabs-scroll-track'); // Renamed '$itemContainer'.
            const $mainHostWrapper = $tabHostContainer.parents('.scroller-tabs-host-wrapper'); // Renamed '$tabsWrapper'.

            // Ensure the main wrapper's width initially matches the tab container's outer width.
            $mainHostWrapper.width($tabHostContainer.outerWidth(true));

            // --- Resizability Feature Integration ---
            if (operationalOptions.enableContainerResizing) {
                // Verify if jQuery UI Resizable plugin is loaded.
                if (jqInstance.fn.resizable) {
                    $mainHostWrapper.resizable({
                        minWidth : $mainHostWrapper.width(),
                        maxWidth : $mainHostWrapper.width() * 2.5, // Allow for greater horizontal expansion.
                        minHeight : $mainHostWrapper.height(),
                        maxHeight : $mainHostWrapper.height() * 2,
                        handles : operationalOptions.resizeHandleConfiguration,
                        alsoResize: $tabHostContainer, // Ensure the tab container resizes along with its wrapper.
                        resize: function() {
                            // Trigger a custom event to signal that the layout has changed.
                            $tabHostContainer.trigger('containerLayoutChanged'); // Renamed 'resized' to 'containerLayoutChanged'.
                        }
                    });
                } else {
                    console.warn('ScrollerTabs Warning: Resizing is enabled, but the "jQuery UI Resizable" plugin was not found.');
                }
            }

            // --- Dynamic Navigation Control Buttons Setup ---
            const iconStandardHeight = 16; // Assumed standard height for UI icons.
            const headerOverallHeight = $tabHeaderNav.innerHeight(); // Get the total height of the navigation bar.
            const iconVerticalAlignment = Math.floor((headerOverallHeight / 2) - (iconStandardHeight / 2)); // Calculate top margin to vertically center icons.
            const sharedArrowButtonStyles = { // Common CSS properties for both previous and next buttons.
                'cursor': 'pointer',
                'zIndex': 1000,
                'position': 'absolute',
                'top': '3px', // Consistent top alignment.
                'height': headerOverallHeight - 1 // Adjust height slightly for visual fit.
            };

            // Construct and prepend the navigation buttons wrapper to the main host wrapper.
            $mainHostWrapper.prepend(
                $navButtonsWrapper = jqInstance('<div/>')
                    .addClass('scroller-tab-nav-controls') // Distinct class for the navigation controls.
                    .css({'position':'relative','zIndex':3000,'display':'none'}) // Initially hidden.
                    .append(
                        // Previous Tab Button
                        jqInstance('<span/>')
                            .attr('title','Scroll to the previous tab') // Reworded title.
                            .css(sharedArrowButtonStyles)
                            .addClass('ui-state-active ui-corner-tl ui-corner-bl scroller-prev-btn scroller-nav-arrow') // Renamed classes.
                            .css('left', '3px')
                            .append(jqInstance('<span/>').addClass('ui-icon ui-icon-carat-1-w').text('Previous tab').css('margin-top',iconVerticalAlignment))
                            .on('click', function(){ // Using .on() for event binding.
                                // Guard: Do nothing if the button is disabled.
                                if (jqInstance(this).hasClass('ui-state-disabled')) {
                                    return false;
                                }
                                const currentActiveTab = $tabHeaderNav.find('li.ui-tabs-selected');
                                const previousTabItem = currentActiveTab.prev('li');
                                if (previousTabItem.length) { // Ensure a previous tab exists before triggering click.
                                    previousTabItem.find('a').trigger('click');
                                }
                                return false; // Prevent default hyperlink action.
                            }),
                        // Next Tab Button
                        jqInstance('<span/>')
                            .attr('title','Scroll to the next tab') // Reworded title.
                            .css(sharedArrowButtonStyles)
                            .addClass('ui-state-active ui-corner-tr ui-corner-br scroller-next-btn scroller-nav-arrow') // Renamed classes.
                            .css({'right':'3px'})
                            .append(jqInstance('<span/>').addClass('ui-icon ui-icon-carat-1-e').text('Next tab').css('margin-top',iconVerticalAlignment))
                            .on('click', function(){
                                const currentActiveTab = $tabHeaderNav.find('li.ui-tabs-selected');
                                const nextTabItem = currentActiveTab.next('li');
                                if (nextTabItem.length) { // Ensure a next tab exists.
                                    nextTabItem.find('a').trigger('click');
                                }
                                return false;
                            })
                    )
            );

            // --- Custom Event Handlers for Tab Management and Scrolling ---
            $tabHostContainer
            .on('tabsremove', function(){ // Using .on() instead of .bind().
                // When a tab is removed, re-evaluate the layout, scroll to the new active tab, and update navigation state.
                jqInstance(this).trigger('recalculateScrollPosition').trigger('updateNavButtonVisibility').trigger('refreshNavButtonState'); // Renamed events.
            })
            .on('attachTabCloseFeature', function(){ // Renamed 'addCloseButton' to 'attachTabCloseFeature'.
                // If the 'canCloseTabs' option is not enabled, exit this function.
                if (!operationalOptions.canCloseTabs) {
                    return;
                }
                const firstListItem = $tabHeaderNav.find('li:first');
                if (firstListItem.length === 0) return; // Guard: No tabs present.

                const closeButtonTopMargin = Math.floor((firstListItem.innerHeight() / 2) - 8); // Calculate vertical centering for close icon.

                $tabHeaderNav.find('li').each(function(){
                    const $currentTabListItem = jqInstance(this);
                    // Add a close button only if one doesn't already exist for this tab.
                    if ($currentTabListItem.find('.tab-close-action-icon').length === 0) { // Renamed class.
                        $currentTabListItem.append(
                            jqInstance('<span style="float:right;cursor:pointer;margin:'+closeButtonTopMargin+'px 2px 0 2px" class="tab-close-action-icon ui-icon ui-icon-close" title="Close this tab"></span>')
                                .on('click', function(event){ // Using .on().
                                    event.stopPropagation(); // Prevent tab selection from occurring when clicking the close button.
                                    const tabNumericalIndex = $currentTabListItem.index();
                                    $tabHostContainer.tabs('remove', tabNumericalIndex); // Use jQuery UI's remove method.

                                    // Adjust visibility of close buttons: hide if only one tab remains.
                                    if ($tabHostContainer.tabs('length') <= 1) { // Condition changed to <= 1.
                                        $tabHeaderNav.find('.tab-close-action-icon').hide();
                                    } else {
                                        $tabHeaderNav.find('.tab-close-action-icon').show();
                                    }

                                    // Execute the custom callback function if provided.
                                    if (typeof operationalOptions.onTabCloseCallback === 'function') { // Renamed option.
                                        operationalOptions.onTabCloseCallback.call($tabHostContainer[0], tabNumericalIndex); // Pass tab index to callback.
                                    }
                                    return false;
                                })
                        );
                    }
                });
                // After potentially adding buttons, ensure visibility is correct based on tab count.
                if ($tabHostContainer.tabs('length') > 1) {
                    $tabHeaderNav.find('.tab-close-action-icon').show();
                } else {
                    $tabHeaderNav.find('.tab-close-action-icon').hide();
                }
            })
            .on('tabsadd', function(event, ui){ // Using the 'ui' object from jQuery UI's tabsadd event.
                // Automatically select the newly added tab.
                $tabHostContainer.tabs('select', $tabHostContainer.tabs('length') - 1);

                // Adjust the DOM structure of the newly added tab item.
                const $newlyAddedTabItem = jqInstance(ui.tab).parent('li'); // Get the <li> element from ui.tab.
                // Clean up any extraneous span tags that jQuery UI might add to the tab link.
                if($newlyAddedTabItem.find('a > span').length > 0) {
                    $newlyAddedTabItem.find('a').html($newlyAddedTabItem.find('a > span').html());
                }
                // Move the <li> element into the scrollable track.
                $newlyAddedTabItem.appendTo($scrollTrackElement);

                // Trigger subsequent actions to update the UI components.
                jqInstance(this)
                    .trigger('attachTabCloseFeature')
                    .trigger('bindInteractiveTabClicks') // Renamed 'bindTabClick'.
                    .trigger('updateNavButtonVisibility')
                    .trigger('recalculateScrollPosition');
            })
            .on('createDynamicContentTab', function(event, panelLabel, panelContent, uniqueTabIdentifier){ // Renamed 'addTab'.
                // Generate a unique ID for the new tab's content panel.
                const contentPanelID = uniqueTabIdentifier || 'dynamicTabPanel-' + Math.floor(Math.random() * 100000); // Added custom ID option.
                
                // Create the content panel div and append it to the document body.
                jqInstance('<div id="'+contentPanelID+'"/>').append(panelContent).appendTo('body');
                
                // Add the tab using the standard jQuery UI tabs method.
                $tabHostContainer.tabs('add', '#'+contentPanelID, panelLabel);
            })
            .on('bindInteractiveTabClicks', function(){ // Renamed 'bindTabClick'.
                // Attach click handlers to individual tab links to manage scrolling when a tab is selected manually.
                $tabHeaderNav.find('a').off('click.scrollerTabs').on('click.scrollerTabs', function(e){ // Namespaced event, using off/on.
                    const $clickedTabListItem = jqInstance(this).parent('li');
                    const navControlsTotalWidth = $navButtonsWrapper.is(':visible') ? $navButtonsWrapper.find('.scroller-prev-btn').outerWidth(true) : 0; // Renamed class.

                    // Determine if the clicked tab is outside the visible area and requires scrolling.
                    const clickedTabLeftPosition = $clickedTabListItem.position().left;
                    const clickedTabOuterWidth = $clickedTabListItem.outerWidth(true); // Include margins.
                    const visibleContainerWidth = $tabHostContainer.width() - navControlsTotalWidth;

                    if (clickedTabLeftPosition < navControlsTotalWidth) { // Tab is partially or fully hidden to the left.
                        $tabHostContainer.trigger('recalculateScrollPosition', [$clickedTabListItem, 'alignLeft']); // Changed direction param.
                    } else if ((clickedTabLeftPosition + clickedTabOuterWidth) > visibleContainerWidth) { // Tab is hidden to the right.
                        $tabHostContainer.trigger('recalculateScrollPosition', [$clickedTabListItem, 'alignRight']); // Changed direction param.
                    }
                    // Always refresh the state of navigation buttons after a tab click.
                    $tabHostContainer.trigger('refreshNavButtonState');
                    // Note: We don't return false here, allowing jQuery UI's default tab selection behavior to proceed.
                });
            })
            .on('recalculateScrollPosition', function(event, $scrollTargetTab, scrollBehavior){ // Renamed 'scrollToTab'.
                // Identify the tab to scroll to; defaults to the currently selected tab if none is specified.
                const $effectiveScrollTarget = ($scrollTargetTab && $scrollTargetTab.length) ? $scrollTargetTab : $tabHeaderNav.find('li.ui-tabs-selected');
                if ($effectiveScrollTarget.length === 0) return; // Guard: No valid target tab.

                const navigationAreaWidth = $navButtonsWrapper.is(':visible') ? $navButtonsWrapper.find('.scroller-prev-btn').outerWidth(true) : 0;
                let desiredScrollOffset = 0; // The final horizontal scroll position.

                const currentTrackScrollLeft = Math.abs(parseInt($scrollTrackElement.css('left'), 10) || 0); // Get current scroll position.

                const targetTabLeftEdge = $effectiveScrollTarget.position().left;
                const targetTabRightEdge = targetTabLeftEdge + $effectiveScrollTarget.outerWidth(true);
                const visibleAreaStart = navigationAreaWidth;
                const visibleAreaEnd = $tabHostContainer.width() - navigationAreaWidth;

                // Determine the scroll offset based on the requested behavior or current visibility.
                if (scrollBehavior === 'alignLeft') {
                    desiredScrollOffset = targetTabLeftEdge - navigationAreaWidth;
                } else if (scrollBehavior === 'alignRight') {
                    desiredScrollOffset = targetTabRightEdge - visibleAreaEnd;
                } else { // Default behavior: ensure the selected tab is fully visible within the view.
                    if (targetTabLeftEdge < visibleAreaStart + currentTrackScrollLeft) { // Tab is hidden to the left.
                        desiredScrollOffset = targetTabLeftEdge - navigationAreaWidth;
                    } else if (targetTabRightEdge > visibleAreaEnd + currentTrackScrollLeft) { // Tab is hidden to the right.
                        desiredScrollOffset = targetTabRightEdge - visibleAreaEnd;
                    } else {
                        // Tab is already fully visible, no scrolling needed.
                        return;
                    }
                }

                // Clamp the scroll offset to valid boundaries.
                desiredScrollOffset = Math.max(0, desiredScrollOffset); // Cannot scroll past the very beginning.
                const maxScrollableLeft = $scrollTrackElement[0].scrollWidth - ($tabHostContainer.width() - navigationAreaWidth);
                desiredScrollOffset = Math.min(desiredScrollOffset, maxScrollableLeft); // Cannot scroll past the very end.

                // Perform the animated scroll. Using .stop(true, true) to prevent animation queuing.
                $scrollTrackElement.stop(true, true).animate({
                    scrollLeft: desiredScrollOffset // Animate the scrollLeft property directly.
                }, operationalOptions.scrollAnimationDuration, operationalOptions.animationEasingStyle);
            })
            .on('refreshNavButtonState', function(){ // Renamed 'navEnabler'.
                // Delay the state update slightly to allow any ongoing scroll animation to complete.
                setTimeout(function(){
                    const $previousNavButton = $mainHostWrapper.find('.scroller-prev-btn'); // Renamed.
                    const $nextNavButton = $mainHostWrapper.find('.scroller-next-btn'); // Renamed.

                    const currentScrollPosition = $scrollTrackElement.scrollLeft();
                    const maximumScrollPosition = $scrollTrackElement[0].scrollWidth - $scrollTrackElement[0].clientWidth;

                    // Enable/disable the 'Previous' button based on scroll position.
                    if (currentScrollPosition <= 5) { // Small tolerance for "at the very beginning".
                        $previousNavButton.addClass('ui-state-disabled');
                    } else {
                        $previousNavButton.removeClass('ui-state-disabled');
                    }

                    // Enable/disable the 'Next' button based on scroll position.
                    if (currentScrollPosition >= maximumScrollPosition - 5) { // Small tolerance for "at the very end".
                        $nextNavButton.addClass('ui-state-disabled');
                    } else {
                        $nextNavButton.removeClass('ui-state-disabled');
                    }
                }, operationalOptions.scrollAnimationDuration + 50); // Delay after scroll animation.
            })
            .on('updateNavButtonVisibility', function(){ // Renamed 'navHandler'.
                // Compare the total width of all tabs against the visible navigation area.
                // Show navigation buttons if tabs overflow; hide them otherwise.
                const aggregateTabsWidth = $widthProbeElement.width(); // Sum of all tab widths.
                const visibleNavigationWidth = $tabHeaderNav.width(); // The current visible width of the tab header.

                if (aggregateTabsWidth > visibleNavigationWidth) {
                    $navButtonsWrapper.show();
                    // Add left padding to the first tab to prevent it from being obscured by the 'Previous' button.
                    $tabHeaderNav.find('li:first').css('padding-left', $navButtonsWrapper.find('.scroller-prev-btn').outerWidth(true) + 5);
                } else {
                    $navButtonsWrapper.hide();
                    // Remove padding if navigation buttons are not visible.
                    $tabHeaderNav.find('li:first').css('padding-left', '0px');
                }
                // Always refresh the state of navigation buttons after a visibility change.
                $tabHostContainer.trigger('refreshNavButtonState');
            })
            // .on('tabsselect', function() { /* This event is generally not needed for scroll management; 'tabsactivate' is more modern. */ })
            .on('containerLayoutChanged', function() { // Renamed 'resized'.
                // When the container's size changes, update navigation visibility and scroll to the active tab.
                jqInstance(this).trigger('updateNavButtonVisibility');
                jqInstance(this).trigger('recalculateScrollPosition', [$tabHeaderNav.find('li.ui-tabs-selected')]);
            });

            // --- Initial Plugin Setup: Trigger necessary events on load ---
            // Apply close buttons to any tabs already existing in the DOM.
            $tabHostContainer.trigger('attachTabCloseFeature');
            // Bind click handlers for scrolling behavior to existing tabs.
            $tabHostContainer.trigger('bindInteractiveTabClicks');
            // Determine and set the initial visibility of navigation arrows.
            $tabHostContainer.trigger('updateNavButtonVisibility');
            // Set the initial enabled/disabled state for navigation arrows.
            $tabHostContainer.trigger('refreshNavButtonState');

            // --- Optional: Activate and Scroll to the Last Tab on Initialization ---
            if (operationalOptions.activateLastTabOnLoad) {
                // Introduce a slight delay to ensure all DOM elements are rendered and widths accurately calculated.
                setTimeout(function(){
                    const $lastTabElement = $tabHeaderNav.find('li:last');
                    if ($lastTabElement.length) {
                        $lastTabElement.find('a').trigger('click'); // Programmatically click the last tab.
                    }
                }, operationalOptions.scrollAnimationDuration + 100); // Slightly increased delay.
            }
        }); // End of .each() iteration.
    }; // End of jqInstance.fn.scrollerTabs plugin definition.

    // Note: The original jQuery.ScrollTo plugin was embedded here.
    // For a Type III clone focused on the 'scrollabletab' functionality,
    // it's assumed that `jqInstance.fn.scrollTo` (or direct `animate({scrollLeft: ...})`)
    // is available, either natively or via a separate, external dependency.
    // The embedded ScrollTo library has been removed from this cloned output.

})(jQuery); // Pass jQuery object into the IIFE.