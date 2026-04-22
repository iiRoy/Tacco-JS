/*
 * Panel Management System - Prototype-based Content Switching
 * http://example.com/project/content-switcher
 * Developed by Alistair T.
 * Version 2.0.1, last updated 2023-10-27
 * Licensed under MIT.
 */
var ContentSwitcher = Class.create();

ContentSwitcher.prototype = {

    // Internal configuration for CSS classes
    _config: {
        activeTabClass: 'active-nav-item',
        activePanelClass: 'visible-content-panel'
    },

    /**
     * Initializes the content switching component.
     * @param {string|HTMLElement} hostElement - The ID or reference to the container DOM element.
     */
    configureComponent: function(hostElement) {
        this.rootNode = $(hostElement);

        // Basic validation for the host element
        if (!this.rootNode) {
            console.error("ContentSwitcher: Host element not found. Aborting initialization.");
            return;
        }

        // Collect all navigation links within the root element
        this.navigationItems = $A(this.rootNode.getElementsByTagName('a'));

        // If there are no navigation items, log a warning and exit
        if (this.navigationItems.length === 0) {
            console.warn("ContentSwitcher: No navigation links found within the host element. Component may not function.");
            return;
        }

        // Display the initially selected panel
        var initialPanelLink = this.determineInitialSelection();
        this.displayTargetPanel(initialPanelLink);

        // Attach click handlers to all navigation items
        this.navigationItems.each(this.attachEventHandler.bind(this));
    },

    /**
     * Extracts the hash fragment from a given URL string.
     * @private
     * @param {string} urlString - The URL to parse.
     * @returns {string|null} The hash fragment without '#', or null if not found.
     */
    _extractHashFragment: function(urlString) {
        var matchResult = urlString.match(/#(\w.+)/);
        return matchResult ? matchResult[1] : null;
    },

    /**
     * Sets up the click event listener for a single navigation item.
     * @param {HTMLElement} navLink - The anchor element representing a tab.
     */
    attachEventHandler: function(navLink) {
        Event.observe(navLink, 'click', this.activatePanel.bindAsEventListener(this), false);
    },

    /**
     * Handles the click event on a navigation item, activating its corresponding panel.
     * @param {Event} clickEvent - The DOM event object for the click.
     */
    activatePanel: function(clickEvent) {
        var clickedNavLink = Event.findElement(clickEvent, "a");

        // Prevent default browser behavior for the anchor link
        clickEvent.stop();

        if (!clickedNavLink) {
            console.warn("ContentSwitcher: Could not identify the clicked navigation link.");
            return;
        }

        // Reveal the panel associated with the clicked link
        this.displayTargetPanel(clickedNavLink);

        // Deactivate all other panels
        this.navigationItems.each(function(singleNavLink) {
            if (singleNavLink !== clickedNavLink) {
                this.deactivatePanel(singleNavLink);
            }
        }.bind(this));
    },

    /**
     * Conceals a content panel and its associated navigation item.
     * @param {HTMLElement} navItem - The navigation link whose panel should be hidden.
     */
    deactivatePanel: function(navItem) {
        var panelId = this.resolveContentId(navItem);
        if (panelId) {
            $(navItem).removeClassName(this._config.activeTabClass);
            $(panelId).removeClassName(this._config.activePanelClass);
        }
    },

    /**
     * Reveals a content panel and highlights its associated navigation item.
     * @param {HTMLElement} navItem - The navigation link whose panel should be shown.
     */
    displayTargetPanel: function(navItem) {
        var panelId = this.resolveContentId(navItem);
        if (panelId) {
            $(navItem).addClassName(this._config.activeTabClass);
            $(panelId).addClassName(this._config.activePanelClass);
        } else {
            console.warn("ContentSwitcher: Could not resolve content ID for navigation item:", navItem);
        }
    },

    /**
     * Determines the ID of the content panel associated with a given navigation link.
     * @param {HTMLElement} navItem - The navigation link element.
     * @returns {string|null} The ID of the content panel, or null if not found.
     */
    resolveContentId: function(navItem) {
        return this._extractHashFragment(navItem.href);
    },

    /**
     * Determines which navigation item should be active upon component initialization.
     * Checks URL hash first, then defaults to the first navigation item.
     * @returns {HTMLElement} The navigation link element to be initially active.
     */
    determineInitialSelection: function() {
        var urlAnchor = this._extractHashFragment(document.location.href);

        if (urlAnchor) {
            var foundLink = this.navigationItems.find(function(linkReference) {
                return this._extractHashFragment(linkReference.href) === urlAnchor;
            }.bind(this)); // Bind 'this' for _extractHashFragment

            if (foundLink) {
                return foundLink;
            }
        }

        // Fallback to the very first navigation item if no hash or no match
        var defaultLink = this.navigationItems.first();
        if (!defaultLink) {
            console.error("ContentSwitcher: No default navigation item found. Ensure your structure is correct.");
        }
        return defaultLink;
    }
};

// Global initialization call once the DOM is fully loaded.
Event.observe(window, 'load', function() {
    // Instantiate and configure our content switching mechanism for the element with ID 'main-sections'.
    new ContentSwitcher('main-sections');
}, false);