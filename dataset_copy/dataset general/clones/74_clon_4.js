const pageInteractor = (function() {
    const layoutBoundary = 1170;
    const applicationState = {
        mainMenuOpen: false,
        searchFormOpen: false
    };

    const uiElementCache = new Map();

    // --- Core DOM Utility Functions ---
    const fetchElement = (selector) => document.querySelector(selector);
    const fetchAllElements = (selector) => Array.from(document.querySelectorAll(selector));

    const applyClass = (element, className) => element && element.classList.add(className);
    const removeClass = (element, className) => element && element.classList.remove(className);
    const toggleClass = (element, className) => element && element.classList.toggle(className);
    const hasClass = (element, className) => element && element.classList.contains(className);

    const attachEvent = (element, eventType, handler, options) => {
        element && element.addEventListener(eventType, handler, options);
    };
    const detachEvent = (element, eventType, handler, options) => {
        element && element.removeEventListener(eventType, handler, options);
    };

    // Custom 'one' event listener for multiple transition events
    const attachTransitionEndOnce = (element, handler) => {
        const transitionEvents = ['webkitTransitionEnd', 'otransitionend', 'oTransitionEnd', 'msTransitionEnd', 'transitionend'];
        const temporaryHandler = (event) => {
            if (event.target === element) { // Ensure the event is on the element itself, not a child
                handler(event);
                transitionEvents.forEach(evtType => detachEvent(element, evtType, temporaryHandler));
            }
        };
        transitionEvents.forEach(evtType => attachEvent(element, evtType, temporaryHandler));
    };

    const insertBeforeElement = (targetElement, referenceElement) => {
        if (targetElement && referenceElement && referenceElement.parentNode) {
            referenceElement.parentNode.insertBefore(targetElement, referenceElement);
        }
    };
    const insertAfterElement = (targetElement, referenceElement) => {
        if (targetElement && referenceElement && referenceElement.parentNode) {
            referenceElement.parentNode.insertBefore(targetElement, referenceElement.nextSibling);
        }
    };
    const deleteElement = (element) => element && element.parentNode && element.parentNode.removeChild(element);

    const getCurrentViewportWidth = () => {
        let currentWindow = window;
        let dimensionProperty = 'inner';
        if (!('innerWidth' in window)) {
            dimensionProperty = 'client';
            currentWindow = document.documentElement || document.body;
        }
        return currentWindow[`${dimensionProperty}Width`];
    };

    // --- State-driven Rendering ---
    const renderVisualState = () => {
        const menuActivator = uiElementCache.get('menuActivator');
        const mainNavPanel = uiElementCache.get('mainNavPanel');
        const headerSection = uiElementCache.get('headerSection');
        const contentContainer = uiElementCache.get('contentContainer');
        const searchInputForm = uiElementCache.get('searchInputForm');
        const searchTrigger = uiElementCache.get('searchTrigger');
        const overlayScreen = uiElementCache.get('overlayScreen');

        // Main Menu Visibility
        if (applicationState.mainMenuOpen) {
            applyClass(menuActivator, 'menuActive');
            applyClass(mainNavPanel, 'menuActive');
            applyClass(headerSection, 'menuActive');
            applyClass(contentContainer, 'menuActive');
        } else {
            removeClass(menuActivator, 'menuActive');
            removeClass(mainNavPanel, 'menuActive');
            removeClass(headerSection, 'menuActive');
            removeClass(contentContainer, 'menuActive');
            // Reset submenu display state when main menu closes
            fetchAllElements('.parentalMenuItem ul').forEach(el => applyClass(el, 'hiddenDisplay'));
            fetchAllElements('.parentalMenuItem a').forEach(el => removeClass(el, 'currentlyChosen'));
            fetchAllElements('.shiftedAside').forEach(el => removeClass(el, 'shiftedAside'));
        }

        // Search Form Visibility
        if (applicationState.searchFormOpen) {
            applyClass(searchInputForm, 'activeDisplay');
            applyClass(searchTrigger, 'searchActive');
        } else {
            removeClass(searchInputForm, 'activeDisplay');
            removeClass(searchTrigger, 'searchActive');
        }

        // Overlay Screen Visibility
        const isAnySubmenuOpen = fetchAllElements('.parentalMenuItem ul:not(.hiddenDisplay)').some(ul => ul.closest('.mainNavPanel'));
        if (applicationState.mainMenuOpen || applicationState.searchFormOpen || isAnySubmenuOpen) {
            applyClass(overlayScreen, 'activeDisplay');
        } else {
            removeClass(overlayScreen, 'activeDisplay');
        }

        // Specific overlay class for search (original had this separate)
        if (applicationState.searchFormOpen) {
            applyClass(overlayScreen, 'searchActive');
        } else {
            removeClass(overlayScreen, 'searchActive');
        }
    };

    // --- Functional Logic ---
    const updateNavigationPosition = () => {
        const navigationBlock = uiElementCache.get('navigationBlock');
        const headerButtons = uiElementCache.get('headerButtons');
        const contentContainer = uiElementCache.get('contentContainer');

        if (!navigationBlock || !headerButtons || !contentContainer) return;

        // Detach element first to ensure smooth re-insertion
        if (navigationBlock.parentNode) {
            deleteElement(navigationBlock);
        }

        if (getCurrentViewportWidth() >= layoutBoundary) {
            insertBeforeElement(navigationBlock, headerButtons);
        } else {
            insertAfterElement(navigationBlock, contentContainer);
        }
        renderVisualState(); // Apply state after structural change
    };

    const closePrimaryNavigation = () => {
        applicationState.mainMenuOpen = false;
        renderVisualState();
        // Remove body scroll lock after transition finishes
        attachTransitionEndOnce(uiElementCache.get('contentContainer'), () => removeClass(document.body, 'noScroll'));
    };

    const manageSearchInterface = (action) => {
        if (action === "close") {
            applicationState.searchFormOpen = false;
        } else {
            applicationState.searchFormOpen = !applicationState.searchFormOpen;
        }
        renderVisualState();

        if (applicationState.searchFormOpen && getCurrentViewportWidth() >= layoutBoundary) {
            const searchInput = uiElementCache.get('searchInputForm') && uiElementCache.get('searchInputForm').querySelector('input[type="search"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
    };

    // --- Event Handlers ---
    const handleMenuActivationClick = (evt) => {
        evt.preventDefault();
        if (applicationState.mainMenuOpen) {
            closePrimaryNavigation();
        } else {
            applicationState.mainMenuOpen = true;
            manageSearchInterface("close"); // Close search when menu opens
            renderVisualState();
            // Apply body scroll lock after transition finishes
            attachTransitionEndOnce(uiElementCache.get('contentContainer'), () => applyClass(document.body, 'noScroll'));
        }
    };

    const handleSearchTriggerClick = (evt) => {
        evt.preventDefault();
        manageSearchInterface();
        closePrimaryNavigation(); // Close nav when search opens/toggles
    };

    const handleOverlayClick = () => {
        if (applicationState.mainMenuOpen) {
            closePrimaryNavigation();
        }
        manageSearchInterface("close");
        renderVisualState();
    };

    const handleSubmenuLinkClick = (evt) => {
        const clickedLink = evt.currentTarget;
        const parentListItem = clickedLink.closest('.parentalMenuItem');
        const childSubmenu = clickedLink.nextElementSibling;

        if (!childSubmenu || !hasClass(parentListItem, 'parentalMenuItem')) return;

        if (getCurrentViewportWidth() < layoutBoundary) {
            evt.preventDefault(); // Prevent default on mobile for submenu links
        }

        if (hasClass(childSubmenu, 'hiddenDisplay')) {
            // Open submenu
            applyClass(clickedLink, 'currentlyChosen');
            removeClass(childSubmenu, 'hiddenDisplay');
            const containingList = parentListItem.parentElement;
            if (containingList) applyClass(containingList, 'shiftedAside');

            // Close other submenus at the same level
            fetchAllElements('.parentalMenuItem').forEach(item => {
                if (item !== parentListItem && item.parentElement === containingList) {
                    removeClass(item.querySelector('a'), 'currentlyChosen');
                    applyClass(item.querySelector('ul'), 'hiddenDisplay');
                }
            });
        } else {
            // Close submenu
            removeClass(clickedLink, 'currentlyChosen');
            applyClass(childSubmenu, 'hiddenDisplay');
            const containingList = parentListItem.parentElement;
            if (containingList) removeClass(containingList, 'shiftedAside');
        }
        renderVisualState();
        manageSearchInterface("close"); // Close search on submenu interaction
    };

    const handleSubmenuReturnClick = (evt) => {
        const returnButton = evt.currentTarget;
        const currentSubmenu = returnButton.parentElement; // This is the UL
        const parentListItem = currentSubmenu.closest('.parentalMenuItem'); // This is the LI
        const containingList = parentListItem.parentElement; // This is the parent UL

        applyClass(currentSubmenu, 'hiddenDisplay');
        if (parentListItem) removeClass(parentListItem.querySelector('a'), 'currentlyChosen');
        if (containingList) removeClass(containingList, 'shiftedAside');

        renderVisualState();
    };

    // --- Initialization ---
    const setupApplication = () => {
        // Cache DOM references
        uiElementCache.set('menuActivator', fetchElement('.cd-nav-trigger'));
        uiElementCache.set('contentContainer', fetchElement('.cd-main-content'));
        uiElementCache.set('mainNavPanel', fetchElement('.cd-primary-nav'));
        uiElementCache.set('headerSection', fetchElement('.cd-main-header'));
        uiElementCache.set('overlayScreen', fetchElement('.cd-overlay'));
        uiElementCache.set('searchTrigger', fetchElement('.cd-search-trigger'));
        uiElementCache.set('searchInputForm', fetchElement('.cd-search'));
        uiElementCache.set('navigationBlock', fetchElement('.cd-nav'));
        uiElementCache.set('headerButtons', fetchElement('.cd-header-buttons'));

        // Perform initial layout adjustment
        updateNavigationPosition();

        // Register global event listeners
        attachEvent(window, 'resize', () => {
            if (!window.requestAnimationFrame) {
                setTimeout(updateNavigationPosition, 300);
            } else {
                window.requestAnimationFrame(updateNavigationPosition);
            }
        });

        attachEvent(uiElementCache.get('menuActivator'), 'click', handleMenuActivationClick);
        attachEvent(uiElementCache.get('searchTrigger'), 'click', handleSearchTriggerClick);
        attachEvent(uiElementCache.get('overlayScreen'), 'click', handleOverlayClick);

        // Submenu event listeners
        fetchAllElements('.mainNavPanel > .parentalMenuItem > a').forEach(link => {
            attachEvent(link, 'click', (evt) => evt.preventDefault()); // Prevent default for top-level parent links
        });
        fetchAllElements('.parentalMenuItem > a').forEach(link => {
            attachEvent(link, 'click', handleSubmenuLinkClick);
        });
        fetchAllElements('.returnToParent').forEach(button => {
            attachEvent(button, 'click', handleSubmenuReturnClick);
        });

        // Note: Original code includes jQuery swipe events. Replicating robust native swipe detection
        // is complex and outside the scope of a Type IV clone focusing on general functionality replication
        // with divergent syntax. The click handler for the overlay provides the core "close" functionality.
    };

    // Public API to start the application
    return {
        initiate: setupApplication
    };
})();

// Start the application once the entire DOM is loaded
document.addEventListener('DOMContentLoaded', pageInteractor.initiate);