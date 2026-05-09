(function(jq) {
  // This is a jQuery plugin designed to transform a set of elements into
  // a tabbed interface, with a responsive fallback to an accordion or similar.
  // It provides configuration options for various CSS classes and behavior thresholds.

  jq.fn.tabifyElements = function(customOptions) {

    // Define the default configuration parameters for the plugin.
    // These can be overridden by the 'customOptions' provided by the user.
    const defaultSettings = {
      breakpointWidthPx: 481, // Numeric threshold for responsive layout change (e.g., 481px for mobile vs desktop)
      tabButtonClass: 'tabNavButton', // Class for individual tab navigation items
      tabBarClass: 'tabBarContainer', // Class for the main navigation wrapper
      tabPaneClass: 'tabContentPane', // Class for the tab content panels
      currentSelectionClass: 'activeTab', // Class indicating the currently selected tab/panel
      collapsedModeClass: 'accordionView', // Class applied to the container when in reduced (mobile) mode
      panelPlacement: 'top', // (Not directly used in this version, but kept for compatibility/extension)
      initialTabIndex: 0, // The 0-based index of the tab to be activated initially if none are pre-selected
      debugMode: false, // Enable console logging for development
      dataPanelIdAttribute: 'data-linked-pane-id' // Data attribute to store the ID of the associated content pane
    };

    // Merge default settings with user-provided options.
    // Using deep extend to ensure nested objects (if any) are also merged correctly, though not strictly needed here.
    const pluginConfig = jq.extend(true, {}, defaultSettings, customOptions);

    // Cache the jQuery object representing the elements on which the plugin was initialized.
    const $elementsToManage = this;

    // Output debug information if enabled.
    if (pluginConfig.debugMode) {
      console.info('TabifyElements plugin initialized on:', $elementsToManage);
      console.info('Current configuration:', pluginConfig);
    }

    // --- Core Tab Switching Logic ---
    // Attach a click event handler to all elements identified as tab navigation buttons.
    $elementsToManage.on('click', '.' + pluginConfig.tabButtonClass, function(evt) {
      const $clickedButton = jq(this); // Cache the clicked button
      const targetPaneSelector = $clickedButton.attr(pluginConfig.dataPanelIdAttribute) || $clickedButton.find('a').attr('href');

      // Prevent default link behavior if the button contains an anchor tag.
      if ($clickedButton.is('a') || $clickedButton.find('a').length > 0) {
        evt.preventDefault();
      }

      // Basic validation for the target selector.
      if (!targetPaneSelector || !targetPaneSelector.startsWith('#')) {
        if (pluginConfig.debugMode) {
          console.warn('TabifyElements: Invalid or missing target pane selector for button:', $clickedButton);
        }
        return; // Exit if no valid target pane can be identified.
      }

      // Deactivate all previously active tab buttons within the current context.
      $elementsToManage.find('.' + pluginConfig.tabButtonClass + '.' + pluginConfig.currentSelectionClass)
                       .removeClass(pluginConfig.currentSelectionClass);

      // Deactivate all previously active tab content panes within the current context.
      $elementsToManage.find('.' + pluginConfig.tabPaneClass + '.' + pluginConfig.currentSelectionClass)
                       .removeClass(pluginConfig.currentSelectionClass);

      // Activate the clicked tab button.
      $clickedButton.addClass(pluginConfig.currentSelectionClass);

      // Activate the corresponding tab content pane.
      jq(targetPaneSelector).addClass(pluginConfig.currentSelectionClass);

      if (pluginConfig.debugMode) {
        console.log('Tab switched to:', targetPaneSelector);
      }
    });

    // --- Initial Tab Activation ---
    // Determine which tab should be active on page load or plugin initialization.
    const $initialActiveButton = $elementsToManage.find('.' + pluginConfig.tabButtonClass + '.' + pluginConfig.currentSelectionClass);

    if ($initialActiveButton.length === 0) {
      // If no tab has the 'activeTab' class, activate the one specified by 'initialTabIndex'.
      const $firstButton = $elementsToManage.find('.' + pluginConfig.tabButtonClass).eq(pluginConfig.initialTabIndex);
      if ($firstButton.length > 0) {
        $firstButton.trigger('click'); // Programmatically click to activate.
        if (pluginConfig.debugMode) {
          console.log('No initial active tab found, activating tab at index:', pluginConfig.initialTabIndex);
        }
      } else if (pluginConfig.debugMode) {
        console.warn('TabifyElements: Could not find any tab buttons to activate.');
      }
    } else {
      // If multiple tabs have the 'activeTab' class, activate only the first one found.
      // Otherwise, just re-trigger the click event for the already active tab to ensure its pane is shown.
      const $effectiveActiveButton = $initialActiveButton.first();
      $effectiveActiveButton.trigger('click');
      if (pluginConfig.debugMode) {
        console.log('Initial active tab found and activated:', $effectiveActiveButton);
      }
    }

    // --- Responsive Layout Handling ---
    // This section dynamically switches between a tabbed interface and an accordion-like layout
    // based on the screen width, using an external 'ScreenObserver' library (formerly 'Response').

    // Helper function to apply desktop-specific layout changes.
    const activateDesktopLayout = function() {
      // Only proceed if the element is currently in collapsed mode.
      if ($elementsToManage.hasClass(pluginConfig.collapsedModeClass)) {
        if (pluginConfig.debugMode) {
          console.log('Switching to desktop layout.');
        }
        $elementsToManage.removeClass(pluginConfig.collapsedModeClass);

        // Move all content panes back to their original position (after the tab bar).
        // This assumes panes were originally children of the main $elementsToManage container,
        // and positioned after the navigation bar.
        const $tabBar = $elementsToManage.find('.' + pluginConfig.tabBarClass);
        $elementsToManage.find('.' + pluginConfig.tabButtonClass).each(function() {
          const $btn = jq(this);
          const targetPaneSelector = $btn.attr(pluginConfig.dataPanelIdAttribute) || $btn.find('a').attr('href');
          if (targetPaneSelector) {
            const $targetPane = jq(targetPaneSelector);
            if ($targetPane.length) {
              // Re-insert the panel after the tab bar within the main container.
              $targetPane.insertAfter($tabBar);
            }
          }
        });
      }
    };

    // Helper function to apply mobile-specific layout changes (accordion-like).
    const activateMobileLayout = function() {
      // Only proceed if the element is NOT currently in collapsed mode.
      if (!$elementsToManage.hasClass(pluginConfig.collapsedModeClass)) {
        if (pluginConfig.debugMode) {
          console.log('Switching to mobile layout (accordion view).');
        }
        $elementsToManage.addClass(pluginConfig.collapsedModeClass);

        // For each tab button, append its corresponding content pane directly inside it.
        // This effectively turns each tab item into an accordion header that contains its content.
        $elementsToManage.find('.' + pluginConfig.tabButtonClass).each(function() {
          const $btn = jq(this);
          const targetPaneSelector = $btn.attr(pluginConfig.dataPanelIdAttribute) || $btn.find('a').attr('href');
          if (targetPaneSelector) {
            const $targetPane = jq(targetPaneSelector);
            if ($targetPane.length) {
              // Append the panel directly into its button.
              // This creates an accordion-like structure where clicking the button reveals the content.
              $btn.append($targetPane);
            }
          }
        });
      }
    };

    // Use the global 'ScreenObserver' (formerly 'Response') library to react to screen size changes.
    // This allows the layout to adapt dynamically as the browser window is resized.
    if (typeof ScreenObserver !== 'undefined' && typeof ScreenObserver.onResize === 'function' && typeof ScreenObserver.isWiderThan === 'function') {
      ScreenObserver.onResize(function() {
        const isCurrentlyWiderThanBreakpoint = ScreenObserver.isWiderThan(pluginConfig.breakpointWidthPx);

        if (isCurrentlyWiderThanBreakpoint) {
          activateDesktopLayout();
        } else {
          activateMobileLayout();
        }
      });

      // Trigger the initial layout setup based on current screen size.
      // This ensures the correct layout is applied immediately on page load.
      const initialWidthCheck = ScreenObserver.isWiderThan(pluginConfig.breakpointWidthPx);
      if (initialWidthCheck) {
        activateDesktopLayout();
      } else {
        activateMobileLayout();
      }
    } else if (pluginConfig.debugMode) {
      console.warn('TabifyElements: ScreenObserver library not found or incorrectly configured. Responsive features will be disabled.');
    }

    // Return the jQuery object to maintain chainability.
    return this;
  };

})(jQuery);