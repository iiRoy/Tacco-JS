AppScope(document).ready(function(_dom) {
    // This script manages responsive navigation and search functionality.
    // It dynamically adjusts elements based on screen size and user interaction.

    // Configuration constants for selectors and classes to improve maintainability.
    const UX_SETTINGS = {
        domSelectors: {
            menuActivator: '.app-menu-toggle',
            mainLayoutWrapper: '.app-main-content-wrapper',
            screenOverlay: '.app-page-overlay',
            primaryNavigationPanel: '.app-primary-navigation',
            mainSiteHeader: '.app-header-bar',
            searchActivatorBtn: '.app-search-activator',
            searchModulePanel: '.app-search-module',
            navPanelContainer: '.app-sidebar-nav',
            headerButtonArea: '.app-header-actions',
            menuParentItem: '.has-children',
            backNavigationLink: '.go-back-btn',
            searchTextInput: 'input[type="search"]',
            navLeftAligned: '.nav-on-left' // Specific class for left-aligned nav
        },
        cssClasses: {
            menuIsVisible: 'menu-is-active',
            searchIsVisible: 'search-is-active',
            overlayIsActive: 'overlay-visible',
            bodyNoScroll: 'body-no-scroll',
            currentItemHighlighted: 'item-selected',
            submenuIsHidden: 'submenu-hidden',
            parentSectionMoved: 'parent-shifted'
        },
        // Breakpoint for desktop layout (must match CSS/SCSS value).
        desktopBreakpointWidth: 1170,
        // Standard transition end events for cross-browser compatibility.
        transitionEndEventNames: 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend'
    };

    // Global state flags to track the visibility of navigation and search.
    let currentNavState = false; // true if navigation is open
    let currentSearchState = false; // true if search is open

    // Helper function to determine if the current viewport is considered "desktop".
    // This accounts for scrollbars by using appropriate window/document dimensions.
    function isDesktopViewport() {
        let viewportElement = window,
            dimensionProp = 'inner';
        if (!('innerWidth' in window)) {
            dimensionProp = 'client';
            viewportElement = document.documentElement || document.body;
        }
        return viewportElement[dimensionProp + 'Width'] >= UX_SETTINGS.desktopBreakpointWidth;
    }

    // Controls the body's overflow property to prevent scrolling when a modal or menu is open.
    function setBodyOverflow(disableScroll) {
        const { bodyNoScroll } = UX_SETTINGS.cssClasses;
        _dom('body').toggleClass(bodyNoScroll, disableScroll);
    }

    // Function to dynamically reposition the navigation panel based on screen size.
    function updateNavigationPlacement() {
        const { navPanelContainer, headerButtonArea, mainLayoutWrapper } = UX_SETTINGS.domSelectors;
        const navElement = _dom(navPanelContainer);
        const isDesktop = isDesktopViewport();

        if (isDesktop) {
            // For desktop, move nav inside the header buttons area.
            if (!navElement.parent().is(headerButtonArea)) { // Prevent unnecessary DOM manipulation
                navElement.detach().insertBefore(headerButtonArea);
            }
        } else {
            // For mobile, move nav after the main content area.
            if (!navElement.parent().is(mainLayoutWrapper)) {
                navElement.detach().insertAfter(mainLayoutWrapper);
            }
        }
    }

    // Function to close the primary navigation menu.
    function collapsePrimaryNavigation() {
        const { menuActivator, mainSiteHeader, primaryNavigationPanel, menuParentItem, mainLayoutWrapper, screenOverlay } = UX_SETTINGS.domSelectors;
        const { menuIsVisible, currentItemHighlighted, submenuIsHidden, parentSectionMoved, overlayIsActive } = UX_SETTINGS.cssClasses;
        const { transitionEndEventNames } = UX_SETTINGS;

        if (!currentNavState) return; // Only act if menu is actually open

        _dom(menuActivator).removeClass(menuIsVisible);
        _dom(mainSiteHeader).removeClass(menuIsVisible);
        _dom(primaryNavigationPanel).removeClass(menuIsVisible);
        _dom(menuParentItem).children('ul').addClass(submenuIsHidden); // Hide all submenus
        _dom(menuParentItem).children('a').removeClass(currentItemHighlighted); // Deselect all menu items
        _dom('.' + parentSectionMoved).removeClass(parentSectionMoved); // Reset parent sections

        _dom(mainLayoutWrapper).removeClass(menuIsVisible).one(transitionEndEventNames, function() {
            setBodyOverflow(false); // Re-enable body scroll after transition
        });

        _dom(screenOverlay).removeClass(overlayIsActive); // Hide overlay
        currentNavState = false; // Update state flag
    }

    // Function to manage the visibility of the search bar.
    // 'action' can be 'open', 'close', or undefined (for toggle).
    function controlSearchBarVisibility(action) {
        const { searchModulePanel, searchActivatorBtn, screenOverlay, searchTextInput } = UX_SETTINGS.domSelectors;
        const { searchIsVisible, overlayIsActive } = UX_SETTINGS.cssClasses;

        let shouldOpen;
        if (action === 'open') {
            shouldOpen = true;
        } else if (action === 'close') {
            shouldOpen = false;
        } else {
            shouldOpen = !currentSearchState; // Toggle if no action specified
        }

        currentSearchState = shouldOpen; // Update state flag

        _dom(searchModulePanel).toggleClass(searchIsVisible, shouldOpen);
        _dom(searchActivatorBtn).toggleClass(searchIsVisible, shouldOpen);
        _dom(screenOverlay).toggleClass(searchIsVisible, shouldOpen); // Also use overlay as a search background

        // If search is visible on desktop, focus the input.
        if (shouldOpen && isDesktopViewport()) {
            _dom(searchModulePanel).find(searchTextInput).focus();
        }

        // Manage overlay visibility: if search is open, overlay should be active.
        _dom(screenOverlay).toggleClass(overlayIsActive, shouldOpen || currentNavState);
    }

    // --- Initial Setup and Event Bindings ---

    // Ensure jQuery is loaded before proceeding.
    if (typeof _dom === 'undefined' || typeof _dom.fn === 'undefined') {
        console.error("jQuery (or its alias '_dom') is not loaded. Script cannot initialize.");
        return;
    }

    // Initial navigation placement on page load.
    updateNavigationPlacement();

    // Debounce the resize event for performance.
    let resizeTimer;
    _dom(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Use requestAnimationFrame for smoother updates if available, otherwise fallback to setTimeout.
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(updateNavigationPlacement);
            } else {
                updateNavigationPlacement();
            }
        }, 200); // Debounce for 200ms
    });

    // Handle mobile menu toggle button click.
    _dom(UX_SETTINGS.domSelectors.menuActivator).on('click', function(evt) {
        evt.preventDefault();
        const { menuIsVisible, overlayIsActive } = UX_SETTINGS.cssClasses;
        const { mainLayoutWrapper, primaryNavigationPanel, mainSiteHeader, screenOverlay } = UX_SETTINGS.domSelectors;
        const { transitionEndEventNames } = UX_SETTINGS;

        if (currentNavState) { // If menu is open, close it.
            collapsePrimaryNavigation();
            _dom(screenOverlay).removeClass(overlayIsActive); // Ensure overlay is removed
        } else { // If menu is closed, open it.
            _dom(this).addClass(menuIsVisible);
            _dom(primaryNavigationPanel).addClass(menuIsVisible);
            _dom(mainSiteHeader).addClass(menuIsVisible);
            _dom(mainLayoutWrapper).addClass(menuIsVisible).one(transitionEndEventNames, function() {
                setBodyOverflow(true); // Disable body scroll after menu animation
            });
            controlSearchBarVisibility('close'); // Close search if open
            _dom(screenOverlay).addClass(overlayIsActive); // Show overlay
            currentNavState = true; // Update state flag
        }
    });

    // Handle search button click.
    _dom(UX_SETTINGS.domSelectors.searchActivatorBtn).on('click', function(evt) {
        evt.preventDefault();
        controlSearchBarVisibility(); // Toggle search
        collapsePrimaryNavigation(); // Ensure navigation is closed
    });

    // Close lateral menu using overlay interaction (click or swipe).
    const overlayClickHandler = function() {
        collapsePrimaryNavigation();
        controlSearchBarVisibility('close');
        _dom(UX_SETTINGS.domSelectors.screenOverlay).removeClass(UX_SETTINGS.cssClasses.overlayIsActive);
    };

    _dom(UX_SETTINGS.domSelectors.screenOverlay).on('click', overlayClickHandler);

    // Swipe gestures on overlay (requires a jQuery UI/Mobile library for 'swipe' events).
    // If not using jQuery Mobile, these will not fire.
    _dom(UX_SETTINGS.domSelectors.screenOverlay).on('swiperight', function() {
        if (currentNavState && _dom(UX_SETTINGS.domSelectors.navLeftAligned).length === 0) { // Only close if nav is on right
            overlayClickHandler();
        }
    });
    _dom(UX_SETTINGS.domSelectors.screenOverlay).on('swipeleft', function() {
        if (currentNavState && _dom(UX_SETTINGS.domSelectors.navLeftAligned).length > 0) { // Only close if nav is on left
            overlayClickHandler();
        }
    });


    // Prevent default action for direct children of primary nav that have sub-menus (desktop only).
    _dom(UX_SETTINGS.domSelectors.primaryNavigationPanel)
        .children(UX_SETTINGS.domSelectors.menuParentItem)
        .children('a')
        .on('click', function(evt) {
            // Only prevent default on desktop, mobile handles it differently.
            if (isDesktopViewport()) {
                evt.preventDefault();
            }
        });

    // Handle submenu toggle clicks.
    _dom(UX_SETTINGS.domSelectors.menuParentItem).children('a').on('click', function(evt) {
        const selectedLink = _dom(this);
        const targetSubmenu = selectedLink.next('ul');

        // Prevent default only if not on desktop, or if it's a desktop click and submenu exists.
        if (!isDesktopViewport() || (isDesktopViewport() && targetSubmenu.length)) {
            evt.preventDefault();
        }

        // Desktop logic: open/close submenus inline.
        if (isDesktopViewport()) {
            const { currentItemHighlighted, submenuIsHidden, parentSectionMoved } = UX_SETTINGS.cssClasses;
            const { menuParentItem, screenOverlay } = UX_SETTINGS.domSelectors;
            const { overlayIsActive } = UX_SETTINGS.cssClasses;

            if (targetSubmenu.hasClass(submenuIsHidden)) {
                // Open submenu
                selectedLink.addClass(currentItemHighlighted);
                targetSubmenu.removeClass(submenuIsHidden);
                selectedLink.parent(menuParentItem).parent('ul').addClass(parentSectionMoved);

                // Close other open submenus at the same level
                selectedLink.parent(menuParentItem)
                    .siblings(menuParentItem)
                    .children('ul')
                    .addClass(submenuIsHidden)
                    .end()
                    .children('a')
                    .removeClass(currentItemHighlighted);

                _dom(screenOverlay).addClass(overlayIsActive);
            } else {
                // Close submenu
                selectedLink.removeClass(currentItemHighlighted);
                targetSubmenu.addClass(submenuIsHidden);
                selectedLink.parent(menuParentItem).parent('ul').removeClass(parentSectionMoved);
                _dom(screenOverlay).removeClass(overlayIsActive);
            }
        }
        controlSearchBarVisibility('close'); // Always close search when navigating
    });

    // Handle 'Go Back' link in submenus.
    _dom(UX_SETTINGS.domSelectors.backNavigationLink).on('click', function() {
        const { submenuIsHidden, parentSectionMoved } = UX_SETTINGS.cssClasses;
        const currentBackLink = _dom(this);
        currentBackLink.parent('ul') // The submenu itself
            .addClass(submenuIsHidden)
            .parent(UX_SETTINGS.domSelectors.menuParentItem) // The parent li.has-children
            .parent('ul') // The parent ul (main menu or another submenu)
            .removeClass(parentSectionMoved);
    });

}); // End of AppScope(document).ready