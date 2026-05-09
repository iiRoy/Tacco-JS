_jq(document).ready(function(_jq) {
    // This value defines the screen width at which the layout changes; ensure it matches CSS/SCSS.
    var minScreenWidth = 1024;

    // Adjust the primary navigation's placement based on current screen dimensions.
    relocateMenu();
    _jq(window).on('resize', function() {
        // Use requestAnimationFrame for smoother updates if available, otherwise fall back to setTimeout.
        (!window.requestAnimationFrame) ? setTimeout(relocateMenu, 250) : window.requestAnimationFrame(relocateMenu);
    });

    // Handle mobile interactions: opening the side menu via its trigger icon.
    _jq('.cd-nav-trigger').on('click', function(evtObject) {
        evtObject.preventDefault(); // Stop default link behavior.
        if (_jq('.cd-main-content').hasClass('nav-is-visible')) {
            shutMenu(); // Close the active navigation.
            _jq('.cd-overlay').removeClass('is-visible'); // Hide the overlay.
        } else {
            _jq(this).addClass('nav-is-visible'); // Mark trigger as visible.
            _jq('.cd-primary-nav').addClass('nav-is-visible'); // Show primary navigation.
            _jq('.cd-main-header').addClass('nav-is-visible'); // Show header.
            _jq('.cd-main-content').addClass('nav-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
                _jq('body').addClass('overflow-hidden'); // Prevent body scroll during transition.
            });
            manageSearchVisibility('close'); // Ensure search is closed.
            _jq('.cd-overlay').addClass('is-visible'); // Display the overlay.
        }
    });

    // Activate the search input area when its trigger is clicked.
    _jq('.cd-search-trigger').on('click', function(evtObject) {
        evtObject.preventDefault(); // Prevent default link action.
        manageSearchVisibility(); // Toggle search state.
        shutMenu(); // Close any open navigation.
    });

    // Handle gestures for closing the side menu on smaller screens.
    _jq('.cd-overlay').on('swiperight', function() {
        if (_jq('.cd-primary-nav').hasClass('nav-is-visible')) {
            shutMenu(); // Close the menu.
            _jq('.cd-overlay').removeClass('is-visible'); // Hide the overlay.
        }
    });
    // Specific gesture for left-aligned navigation.
    _jq('.nav-on-left .cd-overlay').on('swipeleft', function() {
        if (_jq('.cd-primary-nav').hasClass('nav-is-visible')) {
            shutMenu(); // Close the navigation.
            _jq('.cd-overlay').removeClass('is-visible'); // Remove overlay visibility.
        }
    });
    // Click handler for the overlay to close active UI elements.
    _jq('.cd-overlay').on('click', function() {
        shutMenu(); // Close the primary navigation.
        manageSearchVisibility('close'); // Close the search interface.
        _jq('.cd-overlay').removeClass('is-visible'); // Ensure overlay is hidden.
    });

    // Stop default navigation for top-level menu items that have sub-menus.
    _jq('.cd-primary-nav').children('.has-children').children('a').on('click', function(evtObject) {
        evtObject.preventDefault();
    });
    // Logic for expanding and collapsing sub-menus.
    _jq('.has-children').children('a').on('click', function(evtObject) {
        if (!evaluateViewportWidth()) evtObject.preventDefault(); // Prevent default if not wide screen.
        var currentSelection = _jq(this);
        if (currentSelection.next('ul').hasClass('is-hidden')) {
            // This section is primarily for larger screens.
            currentSelection.addClass('selected').next('ul').removeClass('is-hidden').end().parent('.has-children').parent('ul').addClass('moves-out');
            currentSelection.parent('.has-children').siblings('.has-children').children('ul').addClass('is-hidden').end().children('a').removeClass('selected');
            _jq('.cd-overlay').addClass('is-visible'); // Show the overlay.
        } else {
            currentSelection.removeClass('selected').next('ul').addClass('is-hidden').end().parent('.has-children').parent('ul').removeClass('moves-out');
            _jq('.cd-overlay').removeClass('is-visible'); // Hide the overlay.
        }
        manageSearchVisibility('close'); // Close search form if open.
    });

    // Click handler for "back" links within sub-menus.
    _jq('.go-back').on('click', function() {
        _jq(this).parent('ul').addClass('is-hidden').parent('.has-children').parent('ul').removeClass('moves-out');
    });

    function shutMenu() {
        _jq('.cd-nav-trigger').removeClass('nav-is-visible'); // Reset menu trigger state.
        _jq('.cd-main-header').removeClass('nav-is-visible'); // Hide header elements.
        _jq('.cd-primary-nav').removeClass('nav-is-visible'); // Collapse main navigation.
        _jq('.has-children ul').addClass('is-hidden'); // Hide all sub-menus.
        _jq('.has-children a').removeClass('selected'); // Deselect all sub-menu triggers.
        _jq('.moves-out').removeClass('moves-out'); // Reset parent menu positioning.
        _jq('.cd-main-content').removeClass('nav-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
            _jq('body').removeClass('overflow-hidden'); // Re-enable body scrolling after transition.
        });
    }

    function manageSearchVisibility(visibilityAction) {
        if (visibilityAction === "close") {
            // Deactivate the search interface.
            _jq('.cd-search').removeClass('is-visible');
            _jq('.cd-search-trigger').removeClass('search-is-visible');
            _jq('.cd-overlay').removeClass('search-is-visible');
        } else {
            // Toggle the active state of the search interface.
            _jq('.cd-search').toggleClass('is-visible');
            _jq('.cd-search-trigger').toggleClass('search-is-visible');
            _jq('.cd-overlay').toggleClass('search-is-visible');
            if (_jq(window).width() > minScreenWidth && _jq('.cd-search').hasClass('is-visible')) {
                _jq('.cd-search').find('input[type="search"]').focus();
            }
            // Ensure the overlay state matches the search visibility.
            (_jq('.cd-search').hasClass('is-visible')) ? _jq('.cd-overlay').addClass('is-visible') : _jq('.cd-overlay').removeClass('is-visible');
        }
    }

    function evaluateViewportWidth() {
        // Determine the current width of the browser viewport, including scrollbars.
        var envObj = window,
            sizeProp = 'inner';
        if (!('innerWidth' in window)) {
            sizeProp = 'client';
            envObj = document.documentElement || document.body;
        }
        if (envObj[sizeProp + 'Width'] >= minScreenWidth) {
            return true;
        } else {
            return false;
        }
    }

    function relocateMenu() {
        var menuElement = _jq('.cd-nav');
        var isWideScreen = evaluateViewportWidth(); // Check if current view is desktop-like.
        if (isWideScreen) {
            menuElement.detach(); // Remove from current position.
            menuElement.insertBefore('.cd-header-buttons'); // Place before header buttons.
        } else {
            menuElement.detach(); // Remove from current position.
            menuElement.insertAfter('.cd-main-content'); // Place after main content for mobile.
        }
    }
});