var Tabulator = Class.create();

Tabulator.prototype = {
  /*
   * PanelSwitcher - A simple tab management system built with Prototype.js
   * Source: Original inspiration from tetlaw.id.au
   * Author: CodeCloneGenius v1.0
   * Date: 2023-10-27
   * License: Open Source (MIT-like)
   */
  // Primary setup function for the tab component.
  initTabs: function(containerElement) {
    this.containerElement = $(containerElement);
    var configSettings = Object.extend({}, arguments[1] || {}); // Process any initial configuration.
    this.navigationLinks = $A(this.containerElement.getElementsByTagName('a')); // Collect all navigation links.
    this.displayPanel(this.determineInitialSelection()); // Show the correct panel on load.
    this.navigationLinks.each(this.prepareLink.bind(this)); // Attach click handlers to all nav links.
  },

  // Prepares an individual navigation link with its event listener.
  prepareLink: function(currentLink) {
    Event.observe(currentLink, 'click', this.activatePanel.bindAsEventListener(this), false);
  },

  // Handles the activation of a tab based on a click event.
  activatePanel: function(eventObject) {
    var currentLink = Event.findElement(eventObject, "a"); // Find the actual anchor element that was clicked.
    // Event.stop(eventObject); // Prevent default link behavior if desired.
    this.displayPanel(currentLink); // Make the clicked tab's content visible.
    this.navigationLinks.without(currentLink).each(this.concealPanel.bind(this)); // Hide all other tab contents.
  },

  // Conceals a specific tab's navigation item and its associated content panel.
  concealPanel: function(currentLink) {
    $(currentLink).removeClassName('highlighted-nav-item'); // Deactivate navigation styling.
    $(this.derivePanelIdentifier(currentLink)).removeClassName('highlighted-content-area'); // Deactivate content styling.
  },

  // Displays a specific tab's navigation item and its associated content panel.
  displayPanel: function(currentLink) {
    $(currentLink).addClassName('highlighted-nav-item'); // Apply active navigation styling.
    $(this.derivePanelIdentifier(currentLink)).addClassName('highlighted-content-area'); // Apply active content styling.
  },

  // Extracts the unique ID for a content panel from a navigation link's Href attribute.
  derivePanelIdentifier: function(currentLink) {
    return currentLink.href.match(/#(\w.+)/)[1];
  },

  // Determines which tab should be active when the page first loads.
  determineInitialSelection: function() {
    if (document.location.href.match(/#(\w.+)/)) {
      var locationHash = RegExp.$1; // Get the hash from the current URL.
      // Search for a navigation link that matches the URL hash.
      var foundLink = this.navigationLinks.find(function(anchorValue) {
        return anchorValue.href.match(/#(\w.+)/)[1] == locationHash;
      });
      return foundLink || this.navigationLinks.first(); // Return the matching link or the very first one.
    } else {
      return this.navigationLinks.first(); // If no hash, default to the first tab.
    }
  }
};

// Initialize the tab system once the entire page has finished loading.
Event.observe(window, 'load', function() {
  new Tabulator('mainTabsContainer');
}, false);