(function($) {

    "use strict";

    function adaptableGrid(userConfiguration) {

        const baseSettings = {
            collapseBreakpoint: 900,
            primaryGridClass: 'responsive-grid-main',
            outerContainerClass: 'responsive-grid-container',
            scrollableContentClass: 'responsive-grid-scroll',
            fixedHeaderClass: 'responsive-grid-fixed-pane'
        };

        const currentSettings = Object.assign({}, baseSettings, userConfiguration);

        const debounce = (operation, delayDuration) => {
            let timerId;
            return function(...args) {
                const context = this;
                clearTimeout(timerId);
                timerId = setTimeout(() => operation.apply(context, args), delayDuration);
            };
        };

        const createSplitView = (targetElementRef, config) => {
            if (targetElementRef.data('layout-state') === 'collapsed') {
                return;
            }

            const outerContainerDiv = $('<div>').addClass(config.outerContainerClass);
            const fixedHeaderDiv = $('<div>').addClass(config.fixedHeaderClass);
            const scrollableContentDiv = $('<div>').addClass(config.scrollableContentClass);

            const staticPane = targetElementRef.clone();
            fixedHeaderDiv.append(staticPane);

            scrollableContentDiv.append(targetElementRef.detach());

            outerContainerDiv
                .append(fixedHeaderDiv)
                .append(scrollableContentDiv);

            targetElementRef.before(outerContainerDiv);

            targetElementRef.data('layout-state', 'collapsed');
        };

        const restoreSingleView = (targetElementRef, config) => {
            if (targetElementRef.data('layout-state') !== 'collapsed') {
                return;
            }

            const currentContainer = targetElementRef.closest('.' + config.outerContainerClass);
            if (currentContainer.length === 0) {
                targetElementRef.data('layout-state', 'expanded');
                return;
            }

            targetElementRef.detach();

            currentContainer.replaceWith(targetElementRef);

            targetElementRef.data('layout-state', 'expanded');
        };

        const layoutManager = (elementToManage, configurationSet) => {
            const currentWindowWidth = $(window).width();
            const breakpoint = configurationSet.collapseBreakpoint;

            const actions = {
                shouldCollapse: () => createSplitView(elementToManage, configurationSet),
                shouldExpand: () => restoreSingleView(elementToManage, configurationSet),
                noChange: () => {}
            };

            const actionKey = (currentWindowWidth < breakpoint)
                ? 'shouldCollapse'
                : 'shouldExpand';

            actions[actionKey]();
        };

        return this.each(function() {
            const currentElement = $(this);

            currentElement.addClass(currentSettings.primaryGridClass);

            currentElement.data('layout-state', 'expanded');

            layoutManager(currentElement, currentSettings);

            const debouncedLayoutAdjuster = debounce(() => {
                layoutManager(currentElement, currentSettings);
            }, 150);

            $(window).on("resize", debouncedLayoutAdjuster);
        });
    }

    $.fn.adaptableGrid = adaptableGrid;

})(jQuery);