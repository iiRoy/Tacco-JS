(function() {
  // Utility for merging objects (similar to jQuery.extend)
  function combineConfigurations(targetObject, sourceObject) {
    for (var propertyKey in sourceObject) {
      if (Object.prototype.hasOwnProperty.call(sourceObject, propertyKey)) {
        targetObject[propertyKey] = sourceObject[propertyKey];
      }
    }
    return targetObject;
  }

  // Global function to initialize content switching behavior
  // It takes a NodeList or an array of DOM elements and an optional configuration object.
  window.initializeContentSwitching = function(targetElementsCollection, providedSettings) {
    var defaultSettings = {
      'layoutBreakpoint': '481', // Threshold width for layout change
      'navigationUnitClass': 'navItemElement',
      'navigationGroupClass': 'navContainerGroup',
      'contentSectionClass': 'panelContentArea',
      'activeSelectionClass': 'currentActive',
      'hoverPreviewClass': 'previewHover',
      'responsiveLayoutClass': 'collapsedLayout', // Class for accordion/select mode
      'contentPlacement': 'top' // Not used in original logic, but kept for consistency
    };

    var currentSettings = combineConfigurations(defaultSettings, providedSettings || {});

    // Iterate over each target element to apply the behavior
    Array.from(targetElementsCollection).forEach(function(rootElement) {
      setupContentSwitcher(rootElement, currentSettings);
    });

    return targetElementsCollection; // Allow for method chaining if desired
  };

  // Internal function to configure a single content switching instance
  function setupContentSwitcher(mainWrapperElement, behaviorSettings) {
    var allNavigationUnits = Array.from(mainWrapperElement.querySelectorAll('.' + behaviorSettings.navigationUnitClass));
    var allContentSections = Array.from(mainWrapperElement.querySelectorAll('.' + behaviorSettings.contentSectionClass));
    var navigationGroupElement = mainWrapperElement.querySelector('.' + behaviorSettings.navigationGroupClass);

    // Helper to retrieve the target content section from a navigation anchor
    function retrieveTargetSection(anchorLinkElement) {
      var targetIdentifier = anchorLinkElement.getAttribute('href');
      if (targetIdentifier && targetIdentifier.startsWith('#')) {
        return document.getElementById(targetIdentifier.substring(1));
      }
      return null;
    }

    // --- Event Handling for Clicks ---
    mainWrapperElement.addEventListener('click', function(eventDetail) {
      var clickedNavigationUnit = eventDetail.target.closest('.' + behaviorSettings.navigationUnitClass);
      if (!clickedNavigationUnit) return; // Not a navigation unit or child of one

      eventDetail.preventDefault(); // Prevent default anchor link behavior

      // Deactivate all navigation units and content sections
      allNavigationUnits.forEach(function(unit) {
        unit.classList.remove(behaviorSettings.activeSelectionClass);
      });
      allContentSections.forEach(function(section) {
        section.classList.remove(behaviorSettings.activeSelectionClass);
      });

      // Activate the clicked navigation unit and its corresponding content section
      clickedNavigationUnit.classList.add(behaviorSettings.activeSelectionClass);
      var anchorElement = clickedNavigationUnit.querySelector('a');
      if (anchorElement) {
        var targetSection = retrieveTargetSection(anchorElement);
        if (targetSection) {
          targetSection.classList.add(behaviorSettings.activeSelectionClass);
        }
      }
    });

    // --- Event Handling for Mouseover ---
    mainWrapperElement.addEventListener('mouseover', function(eventDetail) {
      var hoveredNavigationUnit = eventDetail.target.closest('.' + behaviorSettings.navigationUnitClass);
      if (!hoveredNavigationUnit) return;

      // Remove hover preview from all navigation units
      allNavigationUnits.forEach(function(unit) {
        unit.classList.remove(behaviorSettings.hoverPreviewClass);
      });

      // Hide the currently active content section (if any)
      var currentActiveSection = mainWrapperElement.querySelector('.' + behaviorSettings.contentSectionClass + '.' + behaviorSettings.activeSelectionClass);
      if (currentActiveSection) {
        currentActiveSection.style.display = 'none';
      }

      // Add hover preview to the hovered navigation unit and show its content section
      hoveredNavigationUnit.classList.add(behaviorSettings.hoverPreviewClass);
      var anchorElement = hoveredNavigationUnit.querySelector('a');
      if (anchorElement) {
        var targetSection = retrieveTargetSection(anchorElement);
        if (targetSection) {
          targetSection.classList.add(behaviorSettings.hoverPreviewClass);
          targetSection.style.display = 'block';
        }
      }
    });

    // --- Event Handling for Mouseout ---
    mainWrapperElement.addEventListener('mouseout', function(eventDetail) {
      var exitedNavigationUnit = eventDetail.target.closest('.' + behaviorSettings.navigationUnitClass);
      if (!exitedNavigationUnit) return;

      // Remove hover preview from the exited navigation unit and hide its content section
      exitedNavigationUnit.classList.remove(behaviorSettings.hoverPreviewClass);
      var anchorElement = exitedNavigationUnit.querySelector('a');
      if (anchorElement) {
        var targetSection = retrieveTargetSection(anchorElement);
        if (targetSection) {
          targetSection.classList.remove(behaviorSettings.hoverPreviewClass);
          targetSection.style.display = 'none';
        }
      }

      // Show the active content section again
      var currentActiveSection = mainWrapperElement.querySelector('.' + behaviorSettings.contentSectionClass + '.' + behaviorSettings.activeSelectionClass);
      if (currentActiveSection) {
        currentActiveSection.style.display = 'block';
      }
    });

    // --- Initial State Setup ---
    var initiallyActiveUnit = mainWrapperElement.querySelector('.' + behaviorSettings.navigationUnitClass + '.' + behaviorSettings.activeSelectionClass);
    if (!initiallyActiveUnit) {
      initiallyActiveUnit = allNavigationUnits[0]; // Default to the first unit if none explicitly active
    }

    if (initiallyActiveUnit) {
      // Manually set initial active state without triggering full event flow
      allNavigationUnits.forEach(function(unit) { unit.classList.remove(behaviorSettings.activeSelectionClass); });
      allContentSections.forEach(function(section) { section.classList.remove(behaviorSettings.activeSelectionClass); });

      initiallyActiveUnit.classList.add(behaviorSettings.activeSelectionClass);
      var initialAnchor = initiallyActiveUnit.querySelector('a');
      if (initialAnchor) {
        var initialSection = retrieveTargetSection(initialAnchor);
        if (initialSection) {
          initialSection.classList.add(behaviorSettings.activeSelectionClass);
        }
      }
    }

    // --- Responsive Layout Management ---
    var mediaQueryHandle = window.matchMedia('(min-width: ' + behaviorSettings.layoutBreakpoint + 'px)');

    function adjustLayout(queryMatch) {
      if (queryMatch.matches) { // Wider than breakpoint (tabs mode)
        mainWrapperElement.classList.remove(behaviorSettings.responsiveLayoutClass);
        // Move all content sections to be siblings of the navigation group
        allContentSections.forEach(function(section) {
          if (navigationGroupElement) {
            // Insert after the navigation group
            navigationGroupElement.parentNode.insertBefore(section, navigationGroupElement.nextSibling);
          } else {
            // Fallback: append to the main wrapper if nav group not found
            mainWrapperElement.appendChild(section);
          }
        });
      } else { // Narrower than breakpoint (accordion mode)
        mainWrapperElement.classList.add(behaviorSettings.responsiveLayoutClass);
        // Move each content section inside its corresponding navigation unit
        allNavigationUnits.forEach(function(unit) {
          var anchor = unit.querySelector('a');
          if (anchor) {
            var targetSection = retrieveTargetSection(anchor);
            if (targetSection && targetSection.parentNode !== unit) { // Only move if not already parented
              unit.appendChild(targetSection);
            }
          }
        });
      }

      // Ensure only the active panel is visible after layout adjustments
      allContentSections.forEach(function(section) {
        if (section.classList.contains(behaviorSettings.activeSelectionClass) && !section.classList.contains(behaviorSettings.hoverPreviewClass)) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });
    }

    // Apply layout on initial load
    adjustLayout(mediaQueryHandle);

    // Listen for changes in media query status
    // Use addEventListener for modern browsers, fallback to addListener for older ones
    if (typeof mediaQueryHandle.addEventListener === 'function') {
      mediaQueryHandle.addEventListener('change', adjustLayout);
    } else {
      mediaQueryHandle.addListener(adjustLayout); // Deprecated, but for broader compatibility
    }
  }
})();