/*
 * Responsive Off-Canvas Navigation Module
 * Developed: 2023, by a dedicated team (inspired by original work from 2014)
 * This script provides a flexible and customizable sliding menu system.
 * Feel free to adapt and integrate this code into your projects,
 * respecting its functional essence.
 */
(function($, window, document, undefined){

    // Define common class names used throughout the module
    const CssClasses = {
        TOGGLE_BUTTON: 'off-canvas-activator',
        BUTTON_LINE: 'activator-line-segment',
        NAV_PANEL: 'off-canvas-panel',
        OVERLAY: 'off-canvas-backdrop',
        ACTIVE_STATE: 'panel-is-open',
        BODY_SHIFTED: 'body-shifted-for-panel'
    };

    $.fn.slideOutMenu = function(cfgOverrides) {
        // Establish final configuration by merging defaults with user-provided options
        const finalOptions = $.extend({
            // Activator button styling
            activatorBgColor: 'lightgray',
            activatorWidth: '55px',
            activatorHeight: '55px',
            // Link selection and display
            itemSelector: 'li > a',
            itemLabelExtractor: ($linkElement) => $linkElement.text(),
            itemInclusionFilter: ($linkElement, index, $allLinks) => true,
            // Panel positioning and behavior
            isFixedPositioned: true,
            panelBaseZIndex: 1050,
            verticalOffset: 0,
            activatorSpacing: 12, // Margin between multiple buttons
            // Line styling for default button
            lineColor: '#333',
            lineWidth: '32px',
            lineThickness: '6px',
            lineGap: '6px',
            // Menu display logic
            hideOriginalNavigation: true,
            panelOverallWidth: '100%',
            panelOverallHeight: 'auto',
            panelBackgroundColor: '#f8f8f8',
            panelBorderStyling: '1px solid #ccc',
            // Link styling within panel
            itemTextColor: '#333',
            itemBgColor: 'white',
            itemPadding: '12px 15px',
            itemTextDecor: 'none',
            itemBorderBottom: '1px solid #eee',
            omitLastItemBorder: true,
            // Panel slide direction
            slideDirection: 'right', // Can be 'left' or 'right'
            // Keep button adjacent to panel edge
            keepActivatorAdjacent: false,
            // Animation speed in milliseconds
            animationDuration: 200,
            // Interaction settings
            closeOnBodyClick: true,
            // Breakpoint visibility
            displayFromViewportWidth: 0,
            displayUntilViewportWidth: 768,
            // Advanced features
            shiftBodyContent: false, // Translate body when panel is open
            showBackdropOverlay: false, // Overlay background when panel is open
            customPanelContent: null, // Custom HTML content for the panel
            customActivatorButton: null // Custom HTML for the activator button
        }, cfgOverrides);

        // --- Helper Function Declarations ---

        /**
         * Generates the toggle button element for the off-canvas panel.
         * @param {number} instanceIndex - The index of the current plugin instance.
         * @returns {jQuery} The created jQuery button element.
         */
        const generateToggleButton = (instanceIndex) => {
            const $activator = $('<div>')
                .addClass(`${CssClasses.TOGGLE_BUTTON} ${CssClasses.TOGGLE_BUTTON}-${instanceIndex}`);

            const activatorStyles = {
                backgroundColor: finalOptions.activatorBgColor,
                width: finalOptions.activatorWidth,
                height: finalOptions.activatorHeight,
                zIndex: Number(finalOptions.panelBaseZIndex) + 1, // Ensure button is above panel
                position: finalOptions.isFixedPositioned ? 'fixed' : 'absolute',
                top: finalOptions.verticalOffset,
                cursor: 'pointer'
            };

            // Calculate button position based on direction and instance index
            const activatorDimension = Number(finalOptions.activatorWidth.replace('px', ''));
            const activatorSpacingValue = Number(finalOptions.activatorSpacing);
            activatorStyles[finalOptions.slideDirection] = (activatorDimension + activatorSpacingValue) * instanceIndex;
            
            $activator.css(activatorStyles);

            // Populate button with lines or custom content
            if (!finalOptions.customActivatorButton) {
                for (let i = 0; i < 3; i++) {
                    $activator.append(buildLineSegment(i, activatorDimension, Number(finalOptions.activatorHeight.replace('px', ''))));
                }
            } else {
                $activator.append(finalOptions.customActivatorButton);
            }
            
            return $activator;
        };

        /**
         * Creates a single line segment for the default burger button.
         * @param {number} lineIndex - The index of the line (0, 1, or 2).
         * @param {number} parentWidth - The width of the containing button.
         * @param {number} parentHeight - The height of the containing button.
         * @returns {jQuery} The created jQuery line element.
         */
        const buildLineSegment = (lineIndex, parentWidth, parentHeight) => {
            const lineThicknessVal = Number(finalOptions.lineThickness.replace('px', ''));
            const lineGapVal = Number(finalOptions.lineGap.replace('px', ''));
            const lineWidthVal = Number(finalOptions.lineWidth.replace('px', ''));

            // Calculate vertical position to center the lines
            const totalLinesHeight = (lineThicknessVal * 3) + (lineGapVal * 2);
            const initialTopOffset = (parentHeight - totalLinesHeight) / 2;
            const currentLineTop = initialTopOffset + (lineThicknessVal + lineGapVal) * lineIndex;

            return $('<span>')
                .addClass(`${CssClasses.BUTTON_LINE} ${CssClasses.BUTTON_LINE}-${lineIndex}`)
                .css({
                    position: 'absolute',
                    backgroundColor: finalOptions.lineColor,
                    height: finalOptions.lineThickness,
                    width: finalOptions.lineWidth,
                    left: (parentWidth - lineWidthVal) / 2, // Center horizontally
                    top: currentLineTop,
                    display: 'block'
                });
        };

        /**
         * Assembles an individual link element for the off-canvas panel.
         * @param {jQuery} $sourceLink - The original anchor element.
         * @param {number} itemIndex - The index of the link in the list.
         * @param {number} totalItems - Total number of links.
         * @returns {jQuery} The created jQuery link element.
         */
        const assemblePanelLink = ($sourceLink, itemIndex, totalItems) => {
            const $panelLink = $('<a>')
                .attr('href', $sourceLink.prop('href')) // Use prop for native properties
                .text(finalOptions.itemLabelExtractor($sourceLink));

            const linkItemStyles = {
                color: finalOptions.itemTextColor,
                padding: finalOptions.itemPadding,
                background: finalOptions.itemBgColor,
                display: 'block',
                textDecoration: finalOptions.itemTextDecor,
                borderBottom: finalOptions.itemBorderBottom
            };
            
            $panelLink.css(linkItemStyles);
            
            // Apply special styling for the last item if configured
            if (finalOptions.omitLastItemBorder && itemIndex === totalItems - 1) {
                // Ensure there is a border to remove first
                if (finalOptions.itemBorderBottom !== 'none' && finalOptions.itemBorderBottom !== '') {
                    $panelLink.css('borderBottom', 'none');
                }
            }
            
            return $panelLink;
        };

        /**
         * Constructs the off-canvas navigation panel.
         * @param {number} instanceIndex - The index of the current plugin instance.
         * @param {jQuery} $originalNavigation - The initial navigation element.
         * @returns {jQuery} The created jQuery panel element.
         */
        const constructSidePanel = (instanceIndex, $originalNavigation) => {
            const $navPanel = $('<div>')
                .addClass(`${CssClasses.NAV_PANEL} ${CssClasses.NAV_PANEL}-${instanceIndex}`);
            
            const panelBaseStyles = {
                height: finalOptions.panelOverallHeight,
                background: finalOptions.panelBackgroundColor,
                zIndex: Number(finalOptions.panelBaseZIndex),
                position: finalOptions.isFixedPositioned ? 'fixed' : 'absolute',
                border: finalOptions.panelBorderStyling,
                boxSizing: 'border-box',
                overflowY: 'auto' // Allow scrolling if content overflows
            };

            // Adjust panel top position based on activator adjacency setting
            panelBaseStyles.top = finalOptions.keepActivatorAdjacent
                ? finalOptions.verticalOffset // Panel starts at the same top as the button
                : (Number(finalOptions.activatorHeight.replace('px', '')) - 1); // Panel starts just below button

            // Position the panel off-screen initially
            const currentPanelWidth = calculatePanelDimension();
            panelBaseStyles[finalOptions.slideDirection] = `-${currentPanelWidth}`;
            panelBaseStyles.width = currentPanelWidth;
            
            $navPanel.css(panelBaseStyles)
                     .css(`border-${finalOptions.slideDirection}`, 'none'); // Remove border on the slide-out side

            // Populate panel with links or custom content
            if (!finalOptions.customPanelContent) {
                const $allSourceLinks = $originalNavigation.find(finalOptions.itemSelector);
                const linkCount = $allSourceLinks.length;

                $allSourceLinks.each(function(linkIdx) {
                    const $currentLink = $(this);
                    if (finalOptions.itemInclusionFilter($currentLink, linkIdx, $allSourceLinks)) {
                        $navPanel.append(assemblePanelLink($currentLink, linkIdx, linkCount));
                    }
                });
            } else {
                $navPanel.append(finalOptions.customPanelContent);
            }
            
            return $navPanel;
        };

        /**
         * Calculates the effective width of the off-canvas panel,
         * accounting for activator button adjacency.
         * @returns {string} The calculated panel width (e.g., '300px' or '50%').
         */
        const calculatePanelDimension = () => {
            const panelWidthSetting = finalOptions.panelOverallWidth;
            const activatorWidthVal = Number(finalOptions.activatorWidth.replace('px', ''));

            if (finalOptions.keepActivatorAdjacent) {
                if (panelWidthSetting.includes('%')) {
                    const percentage = Number(panelWidthSetting.replace('%', '')) / 100;
                    return ((window.innerWidth * percentage) - activatorWidthVal) + 'px';
                } else {
                    return (Number(panelWidthSetting.replace('px', '')) - activatorWidthVal) + 'px';
                }
            } else {
                return panelWidthSetting;
            }
        };

        /**
         * Toggles the visibility and animation of the off-canvas panel.
         * @param {jQuery} $panelToOperate - The jQuery panel element.
         * @param {boolean} shouldConceal - True to hide the panel, false to show.
         * @param {jQuery} $linkedActivator - The jQuery button element.
         */
        let currentlyOpenPanel = null; // Tracks the last opened panel for single-open logic
        const togglePanelVisibility = ($panelToOperate, shouldConceal, $linkedActivator) => {
            const currentPanelWidth = calculatePanelDimension();
            const animationProps = {};
            const bodyAnimationProps = {};
            const activatorAnimationProps = {};

            // Handle body content shifting
            if (finalOptions.shiftBodyContent) {
                bodyAnimationProps[finalOptions.slideDirection] = shouldConceal ? 0 : currentPanelWidth;
                $('body').animate(bodyAnimationProps, finalOptions.animationDuration)
                         .toggleClass(CssClasses.BODY_SHIFTED, !shouldConceal);
            }
            
            // Animate the panel itself
            animationProps[finalOptions.slideDirection] = shouldConceal ? `-${currentPanelWidth}` : 0;
            $panelToOperate.animate(animationProps, finalOptions.animationDuration);
            
            // Animate the activator button if it needs to stay next to the panel
            if (finalOptions.keepActivatorAdjacent) {
                activatorAnimationProps[finalOptions.slideDirection] = shouldConceal ? 0 : currentPanelWidth;    
                $linkedActivator.animate(activatorAnimationProps, finalOptions.animationDuration);
            }
            
            // Manage backdrop overlay
            if (finalOptions.showBackdropOverlay) {
                if (!shouldConceal) {
                    // Create and animate overlay
                    $('<div>').addClass(CssClasses.OVERLAY)
                        .css({
                            opacity: 0,
                            background: finalOptions.showBackdropOverlay,
                            width: '100%',
                            height: '100%',
                            position: 'fixed',
                            zIndex: Number(finalOptions.panelBaseZIndex) - 1, // Below panel, above content
                            top: 0,
                            left: 0
                        })
                        .appendTo('body')
                        .animate({ opacity: 0.5 }, finalOptions.animationDuration);
                } else {
                    // Fade out and remove overlay
                    $(`.${CssClasses.OVERLAY}`).animate({ opacity: 0 }, finalOptions.animationDuration, function() {
                        $(this).remove();
                    });
                }
            }

            // Ensure only one panel is open at a time
            if (!shouldConceal) {
                if (currentlyOpenPanel && currentlyOpenPanel.get(0) !== $panelToOperate.get(0)) {
                    // Close the previously open panel if it's not the current one
                    const $prevActivator = $(`#${currentlyOpenPanel.data('activator-id')}`); // Assuming activator ID is stored
                    togglePanelVisibility(currentlyOpenPanel, true, $prevActivator);
                }
                currentlyOpenPanel = $panelToOperate;
            } else if (currentlyOpenPanel && currentlyOpenPanel.get(0) === $panelToOperate.get(0)) {
                currentlyOpenPanel = null;
            }
        };

        // --- Main plugin execution loop ---

        return this.each(function(instanceIndex) {
            const $targetElement = $(this); // The original navigation element
            const $panelActivator = generateToggleButton(instanceIndex);
            const $sidePanel = constructSidePanel(instanceIndex, $targetElement);

            // Store activator ID on panel for easy retrieval during close operations
            const activatorId = `panel-activator-${Date.now()}-${instanceIndex}`;
            $panelActivator.attr('id', activatorId);
            $sidePanel.data('activator-id', activatorId);

            /**
             * Attempts to conceal the active panel if it's currently open.
             */
            const attemptToConcealPanel = () => {
                if ($panelActivator.hasClass(CssClasses.ACTIVE_STATE)) {
                    $panelActivator.trigger('click'); // Simulate click to close
                }
            };

            /**
             * Manages the visibility of the activator and panel based on viewport width breakpoints.
             * @param {number} viewportWidth - The current width of the viewport.
             */
            const manageVisibilityByBreakpoint = (viewportWidth) => {
                const isWithinBreakpoint = viewportWidth >= finalOptions.displayFromViewportWidth &&
                                           viewportWidth <= finalOptions.displayUntilViewportWidth;

                if (isWithinBreakpoint) {
                    $panelActivator.show();
                    $sidePanel.show();
                    
                    if (finalOptions.hideOriginalNavigation) {
                        $targetElement.hide();
                    }
                } else {
                    // Ensure panel is closed when outside breakpoint
                    attemptToConcealPanel();

                    $panelActivator.hide();
                    $sidePanel.hide();
                    
                    if (finalOptions.hideOriginalNavigation) {
                        $targetElement.show();
                    }
                }
            };

            // --- Event Handlers and Initial Setup ---

            // Handle activator button clicks
            $panelActivator.on('click', function(evt) {
                evt.stopPropagation(); // Prevent body click from immediately closing
                const isCurrentlyOpen = $(this).hasClass(CssClasses.ACTIVE_STATE);
                
                togglePanelVisibility($sidePanel, isCurrentlyOpen, $panelActivator);
                $(this).toggleClass(CssClasses.ACTIVE_STATE, !isCurrentlyOpen); // Toggle active class
            });

            // Append elements to the body
            $('body').append($panelActivator, $sidePanel);

            // Handle window resize events
            $(window).on('resize.slideOutMenu', function() { // Use namespaced event
                attemptToConcealPanel(); // Close panel on resize for responsiveness

                // Recalculate and apply panel width and off-screen position
                const updatedPanelWidth = calculatePanelDimension();
                const panelResetStyles = { width: updatedPanelWidth };
                panelResetStyles[finalOptions.slideDirection] = `-${updatedPanelWidth}`;
                $sidePanel.css(panelResetStyles);

                manageVisibilityByBreakpoint($(this).width());
            }).trigger('resize.slideOutMenu'); // Trigger initially

            // Hide panel when clicking outside of it
            if (finalOptions.closeOnBodyClick) {
                $('body').on('click.slideOutMenu', function(event) { // Use namespaced event
                    const $clickedElement = $(event.target);
                    // Check if click target is neither the activator, the panel, nor a child of either
                    const isOutsidePanelOrActivator = !$clickedElement.closest(`.${CssClasses.NAV_PANEL}`).length &&
                                                     !$clickedElement.closest(`.${CssClasses.TOGGLE_BUTTON}`).length;

                    if (isOutsidePanelOrActivator) {
                        attemptToConcealPanel();
                    }
                });
            }
            
            // Apply body CSS for translation if enabled
            if (finalOptions.shiftBodyContent) {
                $('body').css({
                    'overflow-x': 'hidden', // Prevent horizontal scrollbar during translation
                    'position': 'relative' // Required for animating left/right properties
                });
            }

            // Basic validation for zIndex
            if (typeof finalOptions.panelBaseZIndex !== 'number' || finalOptions.panelBaseZIndex < 1) {
                console.warn('Off-Canvas Menu: "panelBaseZIndex" should be a positive number. Defaulting to 1050.');
                finalOptions.panelBaseZIndex = 1050; // Correct invalid setting
            }
        });
    };

})(jQuery, window, document);