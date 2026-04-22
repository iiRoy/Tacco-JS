(function (jQuery) {
  // Ensure Drupal.behaviors is properly initialized.
  if (typeof Drupal.behaviors === 'undefined') {
    Drupal.behaviors = {};
  }

  /**
   * Drupal behavior for displaying viewport dimensions.
   * This module provides a small, fixed panel at the bottom-left of the screen
   * to show the current browser viewport width and height. It can be collapsed
   * and expanded by user interaction.
   *
   * @file viewport_monitor.js
   * @module Drupal.behaviors.viewportMonitor
   */
  Drupal.behaviors.viewportMonitor = {
    /**
     * Attaches the viewport monitoring functionality to the DOM.
     * This function is invoked by Drupal's AJAX system or on initial page load.
     *
     * @param {HTMLElement} domContext The context element for this behavior.
     *                                 Typically the document or a specific region.
     */
    attach: function (domContext) {
      // Use jQuery as '$' within this scope for convenience.
      const $ = jQuery;

      // Define constant identifiers for CSS classes and element IDs.
      // This improves maintainability and reduces magic strings.
      const debugPanelClass = 'responsive-debug-panel';
      const currentWidthClass = 'rdp-current-width';
      const currentHeightClass = 'rdp-current-height';
      const toggleExpandId = 'rdp-btn-expand';
      const toggleCollapseId = 'rdp-btn-collapse';
      const contentWrapperClass = 'rdp-content-wrapper';

      // Prevent re-initialization if the debug panel already exists in the DOM.
      // This is a guard clause to ensure idempotence.
      if ($(`.${debugPanelClass}`, domContext).length) {
        return;
      }

      // Capture the initial dimensions of the browser viewport when the page loads.
      const initialClientWidth = $(window).width();
      const initialClientHeight = $(window).height();

      // HTML markup for the main container of the responsive debug panel.
      // Using template literals for multi-line string and embedded expressions.
      const panelBaseMarkup = `
        <div class="${debugPanelClass}" style="
          border: 1px solid #1a4d7d;
          background-color: #EBF2F8;
          position: fixed;
          left: 0;
          bottom: 0;
          padding: 7px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11px;
          color: #2c3e50;
          z-index: 9999; /* Ensure panel is always visible on top */
          box-shadow: 0 -3px 6px rgba(0,0,0,0.12);
          border-top-right-radius: 4px;
        "></div>
      `;

      // HTML markup for the button displayed when the panel is in its collapsed state.
      const minimizedToggleMarkup = `
        <a href="#" id="${toggleExpandId}" style="
          color: #0069d9;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.1em;
          line-height: 1;
        " title="Show detailed viewport information"> &#x25B2;</a> <!-- Up-pointing triangle -->
      `;

      // HTML markup for the detailed content, including width/height displays and collapse button.
      const maximizedDisplayMarkup = `
        <div class="${contentWrapperClass}">
          <strong style="padding-right:4px;">W:</strong>
          <span class="${currentWidthClass}"></span>
          <span>px</span><br />
          <strong style="padding-right:4px;">H:</strong>
          <span class="${currentHeightClass}"></span>
          <span>px</span>
          <a href="#" id="${toggleCollapseId}" style="
            color: #d9534f;
            text-decoration: none;
            position: absolute;
            top: 1px;
            right: 4px;
            font-size: 1.2em;
            line-height: 1;
            padding: 0 3px;
          " title="Hide detailed viewport information"> &times;</a> <!-- Multiplication sign for 'x' -->
        </div>
      `;

      // Append the main panel container to the document body.
      $('body').append(panelBaseMarkup);
      const $debugPanel = $(`.${debugPanelClass}`); // Cache the jQuery object for the panel.

      // --- Core Functionality Helpers ---

      /**
       * Updates the displayed width and height values within the panel.
       * This function centralizes the logic for rendering dimensions.
       *
       * @param {number} newWidth The width value to be displayed.
       * @param {number} newHeight The height value to be displayed.
       */
      function updateDimensionReadouts(newWidth, newHeight) {
        $debugPanel.find(`.${currentWidthClass}`).text(newWidth);
        $debugPanel.find(`.${currentHeightClass}`).text(newHeight);
      }

      /**
       * Collapses the information panel, displaying only the expand button.
       * This changes the panel's content and its visual styling.
       */
      function collapsePanelDisplay() {
        $debugPanel
          .css('padding', '4px') // Adjust padding for collapsed state
          .html(minimizedToggleMarkup); // Replace content with expand button

        // Remove any existing click handlers on the collapse button (if present)
        $debugPanel.off('click', `#${toggleCollapseId}`);
        // Bind click handler for the newly rendered expand button.
        $debugPanel.on('click', `#${toggleExpandId}`, function (event) {
          event.preventDefault(); // Prevent default link navigation
          expandPanelDisplay();
        });
        // Update a data attribute to reflect the current state of the panel.
        $debugPanel.attr('data-panel-state', 'collapsed');
      }

      /**
       * Expands the information panel, showing detailed dimensions.
       * This restores the full content and original styling.
       */
      function expandPanelDisplay() {
        $debugPanel
          .css('padding', '7px') // Restore padding for expanded state
          .html(maximizedDisplayMarkup); // Restore detailed content

        // Remove any existing click handlers on the expand button (if present)
        $debugPanel.off('click', `#${toggleExpandId}`);
        // Bind click handler for the newly rendered collapse button.
        $debugPanel.on('click', `#${toggleCollapseId}`, function (event) {
          event.preventDefault(); // Prevent default link navigation
          collapsePanelDisplay();
        });
        // Immediately update displayed dimensions upon expansion.
        updateDimensionReadouts($(window).width(), $(window).height());
        // Update the data attribute to reflect the current state.
        $debugPanel.attr('data-panel-state', 'expanded');
      }

      // --- Initial Setup and Event Listeners ---

      // Initialize the panel with detailed content and initial dimensions.
      $debugPanel.html(maximizedDisplayMarkup);
      updateDimensionReadouts(initialClientWidth, initialClientHeight);

      // Attach the click handler for the initial collapse button.
      // Using event delegation on the panel itself for robustness.
      $debugPanel.on('click', `#${toggleCollapseId}`, function (event) {
        event.preventDefault();
        collapsePanelDisplay();
      });

      // Initialize the panel state as expanded.
      $debugPanel.attr('data-panel-state', 'expanded');

      // Set up a debounced resize listener for performance.
      // This prevents the dimension updates from firing too rapidly during resizing.
      let resizeTimeoutHandler;
      $(window).on('resize', function() {
        // Only update dimensions if the panel is currently in its expanded state.
        if ($debugPanel.attr('data-panel-state') === 'expanded') {
          clearTimeout(resizeTimeoutHandler);
          resizeTimeoutHandler = setTimeout(function() {
            updateDimensionReadouts($(window).width(), $(window).height());
          }, 150); // Debounce delay of 150 milliseconds
        }
      });
    }
  };
})(jQuery);