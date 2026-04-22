"use strict"; // Preserving strict mode, a good practice for modern JavaScript.

// Define application-wide configuration constants. This is a new fragment for better organization.
const APP_CONSTANTS = {
  ACTIVE_NAV_CLASS: "is-active", // Renamed from "active"
  DEFAULT_NAV_ID: "home-panel", // New fragment: provides a fallback ID
  NAV_ITEM_SELECTOR: ".navigation-list li", // Renamed selector for clarity
  NAV_LINK_DATA_ATTR: "data-view-id" // Changed from textContent to a custom data attribute
};

// Main application bootstrapping module. Renamed from "navbarapp" to "coreApplicationModule".
// The dependency array is also updated to reflect the new module name.
angular.module("coreApplicationModule", ["appComponentModules"])
  // Define a custom navigation component directive. Renamed from "bootstrapNavbar" to "appNavigationComponent".
  .directive("appNavigationComponent", function() {
    return {
      restrict: "E", // Element restriction is maintained.
      // Removed 'replace: true' and 'transclude: true' as Type III deletions, simplifying the directive's behavior.
      templateUrl: "application/templates/mainNavigation.html", // Renamed template path for modularity.

      // The compile function is retained, but its internal logic is heavily modified
      // to demonstrate Type III changes (rewriting, additions, different DOM manipulation).
      compile: function(componentRootElement, componentConfigurationAttributes) {
        // New fragment: Add a console log for debugging or lifecycle tracing.
        console.group("App Navigation Component Compilation");
        console.log("Starting compilation for appNavigationComponent...");

        // Retrieve the identifier for the currently active panel from attributes.
        // New fragment: Uses a helper variable and a guard clause with a default fallback.
        const currentActivePanelIdentifier = componentConfigurationAttributes.activeViewId || APP_CONSTANTS.DEFAULT_NAV_ID;

        // Use Angular's jQLite for DOM selection, demonstrating a different approach than direct jQuery.
        // Rewritten: changed selector and method of finding elements.
        const allNavigationItems = angular.element(componentRootElement[0]).find(APP_CONSTANTS.NAV_ITEM_SELECTOR);

        // New fragment: Guard clause to handle cases where no navigation items are found.
        if (allNavigationItems.length === 0) {
          console.warn("No navigation items located in the component template.");
          console.groupEnd();
          return; // Exit early if nothing to process.
        }

        // Rewrite the loop using a modern Array.forEach pattern.
        // Introduce more intermediate variables for clarity.
        Array.from(allNavigationItems).forEach(function(navListItem) {
          const anchorElement = angular.element(navListItem).find("a"); // Find the anchor link within the list item.

          // New fragment: Guard clause to ensure an anchor element exists.
          if (anchorElement.length === 0) {
            console.warn("Skipping navigation item as no anchor tag was found:", navListItem);
            return;
          }

          // Changed how the identifier is retrieved: from textContent to a custom data attribute.
          const elementViewIdentifier = anchorElement[0].getAttribute(APP_CONSTANTS.NAV_LINK_DATA_ATTR);

          // Check if the current list item should be marked as active.
          if (elementViewIdentifier === currentActivePanelIdentifier) {
            angular.element(navListItem).addClass(APP_CONSTANTS.ACTIVE_NAV_CLASS); // Apply the renamed active class.
            console.info(`Successfully activated navigation item for: '${currentActivePanelIdentifier}'`); // New fragment: detailed logging.
          } else {
            // New fragment: Explicitly remove the active class from non-matching items.
            // This ensures only one item is active, even if the template initially had multiple.
            angular.element(navListItem).removeClass(APP_CONSTANTS.ACTIVE_NAV_CLASS);
          }
        });
        console.groupEnd();
      }
    };
  });

// Separate module for application components, including controllers. Renamed from "controllers".
var appComponentModules = angular.module("appComponentModules", []);

// Renamed controllers and their internal properties to demonstrate Type II changes.
// The function declarations are also inlined for brevity.

// Controller for the primary view.
appComponentModules.controller("MainDashboardViewController", function($componentScope) { // Renamed $scope to $componentScope
  $componentScope.pageTitleContent = "Primary Application Dashboard"; // Renamed 'pageName' to 'pageTitleContent'.
  // New fragment: Add an additional property for display.
  $componentScope.lastActivityTimestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
  console.log("MainDashboardViewController initialized."); // New fragment: console log.
});

// Controller for an alternative view.
appComponentModules.controller("AlternativeContentController", function($componentScope) {
  $componentScope.pageTitleContent = "Insights and Analytics Overview";
  // New fragment: Add a boolean flag for conditional rendering.
  $componentScope.isDataLoaded = true;
});

// Controller for a utility or help section.
appComponentModules.controller("UtilitySupportController", function($componentScope) {
  // Rewritten: Instead of a direct string, use an object to hold related information.
  // This changes the data structure/type of the assigned property.
  $componentScope.displayDetails = {
    headerText: "Help & Support Resources",
    versionNumber: "v2.1.0-alpha", // New fragment: added detail.
    contactEmail: "support@example.com"
  };
  // New fragment: Example of a simple validation or check.
  if (!$componentScope.displayDetails.headerText) {
    console.error("UtilitySupportController: Header text is missing!");
  }
});