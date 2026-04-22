;(function($){
    // Configuration defaults for the tab flow management system
    const defaultConfiguration = {
        animationDuration: 100, // Time in milliseconds for scroll animations
        canCloseTabs: false, // Flag to enable/disable close buttons on tabs
        canAdjustContainer: false, // Flag to enable/disable resizing of the main container
        adjustmentHandles: 'e,s,se', // Directions for resizing (jQuery UI Resizable format)
        initialScrollToEnd: false, // If true, scrolls to the last tab on initialization
        animationCurve: 'swing' // Easing function for animations
    };

    // Class to manage the scrolling and interactions of a tab interface
    class TabFlowManager {
        constructor(hostElementReference, options) {
            this.config = $.extend({}, defaultConfiguration, options);

            this.mainHostElement = $(hostElementReference); // The original element, e.g., #tabs
            this.tabNavigationElement = this.mainHostElement.find('.ui-tabs-nav'); // The <ul> containing the tabs

            // Construct the main structural wrappers
            this.outerContainerDiv = $('<div/>').addClass('tabFlowFrame').css({
                position: 'relative',
                padding: '2px'
            });
            this.tabNavigationElement.css('overflow', 'hidden').wrapInner('<div class="tabFlowContentStrip" style="width:30000px"><span class="tabFlowWidthProbe"/></div>');
            this.mainHostElement.wrap(this.outerContainerDiv); // Place the host element inside our outer container

            this.contentStripDiv = this.mainHostElement.find('.tabFlowContentStrip'); // The inner div holding the tabs
            this.widthProbeSpan = this.mainHostElement.find('.tabFlowWidthProbe'); // A helper span to measure total tab width

            // Adjust the width of the outer frame
            this.outerContainerDiv.width(this.mainHostElement.outerWidth(true));
            if ($.browser && $.browser.safari) {
                this.outerContainerDiv.width(this.mainHostElement.width() + 6);
            }

            // Implement resizable functionality if enabled and plugin is present
            if (this.config.canAdjustContainer) {
                if (!!$.fn.resizable) {
                    this.outerContainerDiv.resizable({
                        minWidth: this.outerContainerDiv.width(),
                        maxWidth: this.outerContainerDiv.width() * 2,
                        minHeight: this.outerContainerDiv.height(),
                        maxHeight: this.outerContainerDiv.height() * 2,
                        handles: this.config.adjustmentHandles,
                        alsoResize: this.mainHostElement,
                        resize: () => this.mainHostElement.trigger('frameAdjusted') // Custom event for resize
                    });
                } else {
                    console.error('Error: "jQuery.resizable" plugin is not available for container adjustment.');
                }
            }

            // Create and append navigation arrow controls
            this.controlPanelDiv = $('<div/>').addClass('tabFlowControlPanel').css({
                position: 'relative',
                zIndex: 3000,
                display: 'none'
            }).preventTextHighlight();

            const arrowCommonStyle = {
                cursor: 'pointer',
                zIndex: 1000,
                position: 'absolute',
                top: 3,
                height: this.tabNavigationElement.outerHeight() - ($.browser && $.browser.safari ? 2 : 1)
            };
            const arrowVertMargin = Math.floor((this.tabNavigationElement.innerHeight(true) / 2) - 8);

            this.priorPageArrow = $('<span/>').addClass('ui-state-active ui-corner-tl ui-corner-bl tabFlowPrior tabFlowPager')
                .css({ ...arrowCommonStyle, left: 3 })
                .attr('title', 'Previous page')
                .preventTextHighlight()
                .append($('<span/>').addClass('ui-icon ui-icon-carat-1-w').html('Previous page').css('margin-top', arrowVertMargin))
                .on('click', () => this.goToPriorTab());

            this.nextPageArrow = $('<span/>').addClass('ui-state-active ui-corner-tr ui-corner-br tabFlowNext tabFlowPager')
                .css({ ...arrowCommonStyle, right: 3 })
                .attr('title', 'Next page')
                .preventTextHighlight()
                .append($('<span/>').addClass('ui-icon ui-icon-carat-1-e').html('Next page').css('margin-top', arrowVertMargin))
                .on('click', () => this.goToNextTab());

            this.controlPanelDiv.append(this.priorPageArrow, this.nextPageArrow);
            this.outerContainerDiv.prepend(this.controlPanelDiv);

            // Bind all necessary internal and external events
            this.bindEssentialEvents();

            // Perform initial setup actions
            this.addTerminationButtons();
            this.attachTabActivationListeners();
            this.assessLayoutRequirements();
            this.updatePagingControlStates();
            
            // Scroll to last tab if configured
            if (this.config.initialScrollToEnd) {
                setTimeout(() => this.tabNavigationElement.find('li:last a').trigger('click'), this.config.animationDuration);
            }
        }

        // --- Core Functionality Methods ---

        // Scrolls the tab navigation view to make a specific tab visible
        shiftViewToTab(targetTabItem, actionSource, visibilitySide) {
            const target = targetTabItem ? $(targetTabItem) : this.tabNavigationElement.find('li.ui-tabs-selected');
            if (!target.length) return;

            const controlPanelWidth = this.controlPanelDiv.is(':visible') ? this.priorPageArrow.outerWidth(true) : 0;
            let desiredScrollPosition = 0;

            const navVisibleWidth = this.tabNavigationElement.width();
            const tabPositionRelativeToNav = target.position().left;
            const tabTotalWidth = target.outerWidth(true);

            if (actionSource === 'tabActivated' && visibilitySide === 'left') {
                desiredScrollPosition = tabPositionRelativeToNav - controlPanelWidth;
            } else if (actionSource === 'tabActivated' && visibilitySide === 'right') {
                desiredScrollPosition = tabPositionRelativeToNav + tabTotalWidth - (navVisibleWidth - controlPanelWidth);
            } else { // Default: ensure the selected tab is fully within the visible area
                const currentScroll = this.tabNavigationElement.scrollLeft();
                const effectiveLeftBoundary = currentScroll + controlPanelWidth;
                const effectiveRightBoundary = currentScroll + navVisibleWidth - controlPanelWidth;

                if (tabPositionRelativeToNav < effectiveLeftBoundary) { // Tab starts before the effective left boundary
                    desiredScrollPosition = tabPositionRelativeToNav - controlPanelWidth;
                } else if (tabPositionRelativeToNav + tabTotalWidth > effectiveRightBoundary) { // Tab ends after the effective right boundary
                    desiredScrollPosition = tabPositionRelativeToNav + tabTotalWidth - (navVisibleWidth - controlPanelWidth);
                } else { // Tab is already fully visible
                    desiredScrollPosition = currentScroll;
                }
            }
            
            desiredScrollPosition = Math.max(0, desiredScrollPosition); // Ensure scroll position is not negative
            
            this.tabNavigationElement.animate({
                scrollLeft: desiredScrollPosition
            }, this.config.animationDuration, this.config.animationCurve);
        }

        // Updates the enabled/disabled state of the navigation arrows
        updatePagingControlStates() {
            setTimeout(() => {
                const currentlySelectedTab = this.tabNavigationElement.find('.ui-tabs-selected');
                if (!currentlySelectedTab.length) return;

                const isLastTab = currentlySelectedTab.is(':last-child');
                const isFirstTab = currentlySelectedTab.is(':first-child');

                if (isLastTab) {
                    this.priorPageArrow.removeClass('ui-state-disabled');
                    this.nextPageArrow.addClass('ui-state-disabled');
                } else if (isFirstTab) {
                    this.nextPageArrow.removeClass('ui-state-disabled');
                    this.priorPageArrow.addClass('ui-state-disabled');
                } else {
                    this.nextPageArrow.removeClass('ui-state-disabled');
                    this.priorPageArrow.removeClass('ui-state-disabled');
                }
            }, this.config.animationDuration);
        }

        // Determines whether navigation arrows are needed and shows/hides them
        assessLayoutRequirements() {
            if (this.widthProbeSpan.width() > this.tabNavigationElement.width()) {
                this.controlPanelDiv.show();
                this.tabNavigationElement.find('li:first').css('margin-left', this.priorPageArrow.outerWidth(true));
            } else {
                this.controlPanelDiv.hide();
                this.tabNavigationElement.find('li:first').css('margin-left', 0);
            }
        }

        // Adds close buttons to tabs if configured
        addTerminationButtons() {
            if (!this.config.canCloseTabs) return;

            this.tabNavigationElement.find('li').each((index, listItem) => {
                const currentListItem = $(listItem);
                if (currentListItem.find('.tabFlowTerminator').length > 0) return; // Already has a close button

                const closeButtonTopMargin = Math.floor((currentListItem.innerHeight() / 2) - 8);
                const closeButton = $('<span/>').addClass('tabFlowTerminator ui-icon ui-icon-close')
                    .css({
                        float: 'left',
                        cursor: 'pointer',
                        margin: `${closeButtonTopMargin}px 2px 0 -11px`
                    })
                    .attr('title', 'Terminate this tab')
                    .preventTextHighlight()
                    .on('click', (e) => {
                        e.stopPropagation(); // Prevent tab activation when clicking close
                        const tabIndexToRemove = currentListItem.prevAll().length;
                        this.mainHostElement.tabs('remove', tabIndexToRemove);

                        if (this.mainHostElement.tabs('length') === 1) {
                            this.tabNavigationElement.find('.tabFlowTerminator').hide();
                        } else {
                            this.tabNavigationElement.find('.tabFlowTerminator').show();
                        }
                        if ($.isFunction(this.config.onTabClose)) {
                            this.config.onTabClose();
                        }
                        return false;
                    });
                currentListItem.append(closeButton);
            });
            this.tabNavigationElement.find('.tabFlowTerminator').show(); // Ensure all close buttons are visible
        }

        // Attaches click listeners to tab links to handle scrolling on activation
        attachTabActivationListeners() {
            this.tabNavigationElement.find('a').off('click.tabFlow').on('click.tabFlow', (e) => {
                const activatedTab = $(e.currentTarget).parents('li');
                const controlWidth = this.controlPanelDiv.find('.tabFlowPrior').outerWidth(true);

                const tabLeftPosition = activatedTab.position().left;
                const tabWidth = activatedTab.outerWidth();
                const navViewportWidth = this.tabNavigationElement.width();

                if ((tabLeftPosition - controlWidth) < 0) { // Tab is hidden on the left
                    this.shiftViewToTab(activatedTab, 'tabActivated', 'left');
                } else if ((tabLeftPosition + tabWidth) > (navViewportWidth - controlWidth)) { // Tab is hidden on the right
                    this.shiftViewToTab(activatedTab, 'tabActivated', 'right');
                }
                this.updatePagingControlStates(); // Update arrow states after click
            });
        }

        // --- Navigation Arrow Actions ---
        goToPriorTab() {
            if (this.priorPageArrow.hasClass('ui-state-disabled')) return;
            const currentActive = this.tabNavigationElement.find('li.ui-tabs-selected');
            const previousIndex = currentActive.prevAll().length;
            this.tabNavigationElement.find('li').eq(previousIndex - 1).find('a').trigger('click');
        }

        goToNextTab() {
            if (this.nextPageArrow.hasClass('ui-state-disabled')) return;
            const currentActive = this.tabNavigationElement.find('li.ui-tabs-selected');
            const nextIndex = currentActive.prevAll().length + 1;
            this.tabNavigationElement.find('li').eq(nextIndex).find('a').trigger('click');
        }

        // --- Event Binding ---
        bindEssentialEvents() {
            // Event triggered when a tab is removed
            this.mainHostElement.on('tabsremove', () => {
                this.shiftViewToTab();
                this.assessLayoutRequirements();
                this.updatePagingControlStates();
            });

            // Event triggered when a tab is added
            this.mainHostElement.on('tabsadd', (event, ui) => {
                const newlyAddedTabLi = $(ui.tab);
                
                // Fix for potential extra span in tab title
                const anchorInTab = newlyAddedTabLi.find('a');
                if (anchorInTab.find('span').length > 0) {
                    anchorInTab.html(anchorInTab.find('span').html());
                }

                // Move the newly added tab into the scrollable content strip
                this.contentStripDiv.append(newlyAddedTabLi);

                this.addTerminationButtons();
                this.attachTabActivationListeners();
                this.assessLayoutRequirements();
                this.shiftViewToTab(newlyAddedTabLi); // Scroll to the new tab
            });

            // Custom event to add a new tab and its content
            this.mainHostElement.on('addContentPane', (event, tabLabel, tabContent) => {
                const generatedId = 'contentPane-' + (Math.floor(Math.random() * 100000));
                $('body').append($('<div id="' + generatedId + '"/>').append(tabContent));
                this.mainHostElement.tabs('add', '#' + generatedId, tabLabel);
            });
            
            // Event triggered when the container is resized
            this.mainHostElement.on('frameAdjusted', () => {
                this.assessLayoutRequirements();
                this.shiftViewToTab(); // Scroll to the currently selected tab
            });

            // Event triggered when a tab is selected (not necessarily by click)
            this.mainHostElement.on('tabsselect', () => {
                this.updatePagingControlStates();
                this.shiftViewToTab();
            });
        }
    }

    // jQuery plugin wrapper
    $.fn.tabFlow = function(options){
        return this.each(function(){
            if (!$.data(this, 'tabFlowManagerInstance')) {
                $.data(this, 'tabFlowManagerInstance', new TabFlowManager(this, options));
            }
        });
    };

    // Custom jQuery utility method to prevent text selection
    $.fn.preventTextHighlight = function() {
        return this.attr('unselectable', 'on')
            .css('user-select', 'none')
            .on('selectstart', () => false);
    };

})(jQuery);