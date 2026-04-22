"use strict";

// This file defines the core module for the product display application.
var productDisplayApp = window.angular.module("productDisplayApp", []);

// Optional: A configuration block for application-wide settings or service decorations.
productDisplayApp.config(['$provide', function($provide) {
    // This section can be used to register decorators, constants, or other configuration.
    // For instance, one might decorate the $log service or configure error handling.
    // As a structural change, it serves as an example of adding a new fragment.
    /*
    $provide.decorator('$log', ['$delegate', function($delegate) {
        function enhancedLog(message) {
            $delegate.log('APP_LOG: ' + message);
        }
        enhancedLog.debug = $delegate.debug;
        enhancedLog.info = $delegate.info;
        enhancedLog.warn = $delegate.warn;
        enhancedLog.error = $delegate.error;
        return enhancedLog;
    }]);
    */
}]);

// Main controller responsible for managing product data and display logic.
productDisplayApp.controller("ProductViewerController", ["$scope", "$filter", "inventoryService",
    function ($scope, $filter, inventoryService) {
        // Initialize the view model for the product display with data retrieved from the service.
        $scope.viewModel = inventoryService.fetchCurrentInventory();

        // Determines the actual number of products visible on the current page after all filters and pagination.
        $scope.calculateVisibleItemCount = function () {
            const sourceItems = $scope.viewModel.items;
            // Guard clause: Return zero if the item collection is not available or empty.
            if (!Array.isArray(sourceItems) || sourceItems.length === 0) {
                return 0;
            }

            // Step 1: Apply filtering based on the user's search query.
            const temporarilyFilteredItems = $filter("filter")(sourceItems, $scope.viewModel.queryInput);

            // Step 2: Apply sorting according to the configured attribute and direction.
            const sortedCollection = $filter("orderBy")(
                temporarilyFilteredItems,
                $scope.viewModel.sortingConfig.attribute,
                $scope.viewModel.sortingConfig.isDescending
            );

            // Calculate the starting index for the current page.
            const itemsPerPage = $scope.viewModel.itemsPerPageCount;
            const currentPageIndex = $scope.viewModel.activePageIndex;
            const startIndex = currentPageIndex * itemsPerPage;

            // Step 3: Apply pagination by starting from the calculated index.
            const paginatedStartingItems = $filter("startFrom")(sortedCollection, startIndex);

            // Step 4: Limit the items to display only the quantity for the current page.
            const finalDisplayedItems = $filter("limitTo")(paginatedStartingItems, itemsPerPage);

            // The count of items in the final, rendered list.
            return finalDisplayedItems.length;
        };

        // Monitors changes in the search input field to automatically reset the current page.
        $scope.$watch("viewModel.queryInput", function (currentSearchValue, previousSearchValue) {
            // Only perform a reset if the search value has genuinely changed,
            // preventing unintended resets during initial controller loading or view navigation.
            if (currentSearchValue !== previousSearchValue) {
                // Introduce a temporary constant for clarity in resetting the page index.
                const firstPageIndex = 0;
                $scope.viewModel.activePageIndex = firstPageIndex;
            }
        });

        // A new utility function to check if the data has been successfully loaded and is ready for display.
        $scope.isDataLoadedAndAvailable = function() {
            return $scope.viewModel && Array.isArray($scope.viewModel.items) && $scope.viewModel.items.length > 0;
        };
    }
]);

// Directive for rendering the main product list.
productDisplayApp.directive("itemListingComponent", [function () {
    // This directive is responsible for structuring and displaying the individual product entries.
    return {
        restrict: "E", // Defined as an element directive.
        templateUrl: "/app/components/inventory/productListingView.html", // Custom template path.
        // An isolated scope is added as a structural change, even if currently empty.
        // This signifies a more component-oriented approach.
        scope: {},
        // An inline controller for the directive, providing a placeholder for directive-specific logic.
        controller: function($scope) {
            // Placeholder: Directive-specific initialization or state management can go here.
            $scope.componentReady = true;
        }
    };
}]);

// Directive for pagination controls.
productDisplayApp.directive("itemPagingControl", ["inventoryService",
    function (inventoryService) {
        // This directive provides interactive pagination elements for navigating through product pages.
        return {
            restrict: "A", // Changed from element 'E' to attribute 'A' for variety.
            templateUrl: "/app/components/inventory/paginationControls.html", // Updated template path.
            link: function (currentScope) { // Renamed the scope parameter for differentiation.
                // Access the shared view model from the inventory service.
                currentScope.viewModel = inventoryService.fetchCurrentInventory();

                // Function to handle clicks on pagination links, updating the active page.
                currentScope.handlePageNavigation = function (domEvent, requestedPageIndex) {
                    // Ensure the default browser behavior for the event is prevented.
                    if (domEvent && typeof domEvent.preventDefault === 'function') {
                        domEvent.preventDefault();
                    } else {
                        // Log a warning if the event object is unexpectedly missing or malformed.
                        console.warn("DOM event object was not valid in handlePageNavigation.");
                        return; // Exit early to prevent errors.
                    }

                    // Check if the clicked element (or its closest parent representing a page step) is marked as disabled.
                    const targetElement = window.$(domEvent.target);
                    const containingStep = targetElement.closest(".page-nav-button"); // Changed class name.
                    if (containingStep.hasClass("is-inactive")) { // Changed class name.
                        return; // Do not proceed if the button is disabled.
                    }

                    // Validate the requested page index to ensure it's a non-negative number.
                    if (typeof requestedPageIndex === 'number' && requestedPageIndex >= 0) {
                        currentScope.viewModel.activePageIndex = requestedPageIndex;
                    } else {
                        console.error("Invalid page index provided for navigation:", requestedPageIndex);
                    }
                };

                // Calculates and returns the total number of pages required for the entire product list.
                currentScope.computeTotalPageCount = function () {
                    const totalProductCount = currentScope.viewModel.items.length;
                    const productsPerPageSetting = currentScope.viewModel.itemsPerPageCount;

                    // Robust check for invalid or zero values to prevent division by zero or NaN results.
                    if (!productsPerPageSetting || productsPerPageSetting <= 0 || !Number.isFinite(totalProductCount)) {
                        return 0;
                    }

                    let calculatedPages = Math.ceil(totalProductCount / productsPerPageSetting);
                    // Ensure the page count is always a non-negative integer.
                    return Math.max(0, Math.floor(calculatedPages));
                };

                // Generates an array of page numbers suitable for iteration in a template (e.g., [1, 2, 3]).
                currentScope.constructPaginationIndices = function (totalPagesValue) {
                    let numericPageCount = parseInt(totalPagesValue, 10);
                    // Guard against non-numeric or negative input values for totalPagesValue.
                    if (isNaN(numericPageCount) || numericPageCount < 0) {
                        return [];
                    }

                    const pageNumberArray = [];
                    for (let i = 0; i < numericPageCount; i++) {
                        pageNumberArray.push(i + 1); // Populate with 1-based page numbers.
                    }
                    return pageNumberArray;
                };

                // New helper function: Checks if a given page number corresponds to the currently active page.
                currentScope.isThisTheActivePage = function(pageNumberForCheck) {
                    // Remember that 'activePageIndex' is 0-based, while 'pageNumberForCheck' is typically 1-based.
                    return (currentScope.viewModel.activePageIndex + 1) === pageNumberForCheck;
                };
            }
        };
    }
]);