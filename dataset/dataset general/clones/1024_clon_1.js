"use strict"
; /* This directive ensures that the code is executed in "strict mode". */


/*
 * Initializes the main Angular module for the catalog.
 * This module acts as a container for controllers, directives, and services
 * related to the product catalog functionality.
 */
var catalogModule = window.angular.module(
    "catalogModule"
    , []
);


// Definition of the main Catalog Controller for the application.
// This controller manages the data and logic for displaying product catalogs.
catalogModule.controller(
    "CatalogCtrl"
    , [
        "$scope"
        , "$filter"
        , "catalogDataService"
        , function (
            $scope
            , $filter
            , catalogDataService
        ) {
            // Initialize the catalog data by fetching it from the service.
            $scope.catalog = catalogDataService.get();


            /**
             * Calculates the number of products that are currently visible
             * based on filtering, sorting, and pagination parameters.
             *
             * This function applies a series of Angular filters manually
             * to determine the effective count of displayed items.
             */
            $scope.numberOfVisibleProducts = function (
            ) {
                /*
                 * The complex return expression below is a direct translation of an
                 * Angular expression pipeline (e.g., in an ng-repeat) into
                 * programmatic JavaScript calls using the $filter service.
                 *
                 * Original conceptual pipeline:
                 * (catalog.products | filter:catalog.searchQuery | orderBy:catalog.sortOrder.type:catalog.sortOrder.reverse | startFrom:catalog.currentPage*catalog.productsPerPage | limitTo:catalog.productsPerPage).length
                 *
                 * Breakdown of programmatic calls:
                 * 1.  $filter("filter")($scope.catalog.products, $scope.catalog.searchQuery) - filters products by the search query.
                 * 2.  $filter("orderBy")(..., $scope.catalog.sortOrder.type, $scope.catalog.sortOrder.reverse) - sorts the filtered products.
                 * 3.  $filter("startFrom")(..., $scope.catalog.currentPage * $scope.catalog.productsPerPage) - applies the starting index for pagination.
                 * 4.  $filter("limitTo")(..., $scope.catalog.productsPerPage) - limits the number of products per page.
                 * 5.  .length - finally, obtains the count of the resulting array.
                 */
                return $filter("limitTo")(
                    $filter("startFrom")(
                        $filter("orderBy")(
                            $filter("filter")(
                                $scope.catalog.products
                                , $scope.catalog.searchQuery
                            )
                            , $scope.catalog.sortOrder.type
                            , $scope.catalog.sortOrder.reverse
                        )
                        , $scope.catalog.currentPage * $scope.catalog.productsPerPage
                    )
                    , $scope.catalog.productsPerPage
                )
                    .length
                ;
            };


            // Watch for changes in the catalog's search query.
            // If the search query changes, the current page of results should be reset to 0
            // to ensure the user starts browsing filtered results from the beginning.
            $scope.$watch(
                "catalog.searchQuery"
                , function (
                    newValue
                    , oldValue
                ) {
                    // Only reset the page if the search query has actually changed.
                    // This is crucial to avoid resetting the page during initial assignment
                    // of $scope.catalog or when navigating back to the catalog view
                    // if the query hasn't been altered.
                    if (newValue !== oldValue) {
                        $scope.catalog.currentPage = 0; // Reset to the first page (page index 0).
                    }
                }
            );
        }
    ]
);


// Registers a new directive named "catalogProductList".
// This directive is responsible for displaying a list of products within the catalog.
catalogModule.directive(
    "catalogProductList"
    , [
        function (
        ) {
            return {
                restrict: "E" // Restrict this directive to be used as an element (e.g., <catalog-product-list>).
                , templateUrl: "/silverstripe-angularjs-modeladmin/javascript/modules/catalog/catalogProductList.html" // Path to the HTML template for this directive's view.
            };
        }
    ]
);


/*
 * Defines the "catalogPagination" directive.
 * This directive is specifically designed to render pagination controls
 * for navigating through the product catalog.
 */
catalogModule.directive(
    "catalogPagination"
    , [
        "catalogDataService"
        , function (
            catalogDataService
        ) {
            return {
                restrict: "E" // The directive can only be used as an element.
                , templateUrl: "/silverstripe-angularjs-modeladmin/javascript/modules/catalog/catalogPagination.html" // The template file for the pagination UI.
                , link: function (
                    scope // The scope of this directive instance.
                ) {
                    // Retrieve the catalog data and attach it to the directive's scope.
                    scope.catalog = catalogDataService.get();


                    /**
                     * Handles the event when a pagination link is clicked.
                     * Prevents the default link behavior and updates the current page.
                     *
                     * @param {Event} event - The DOM event object.
                     * @param {number} nextPage - The index of the page to navigate to.
                     */
                    scope.paginate = function (
                        event
                        , nextPage
                    ) {
                        event.preventDefault(); // Stop the browser from navigating.

                        // Check if the clicked pagination step (e.g., "next", "prev", or page number)
                        // has the "disabled" class. If so, do nothing.
                        if (
                            window.$(event.target).closest(".step").is(".disabled")
                        ) {
                            return; // Exit if the step is disabled.
                        }

                        // Update the current page in the catalog data model.
                        scope.catalog.currentPage = nextPage;
                    };


                    // Calculates the total number of pages required based on the
                    // total number of products and products per page setting.
                    scope.numberOfPages = function (
                    ) {
                        var numberOfPages = Math.ceil(
                            scope.catalog.products.length / scope.catalog.productsPerPage
                        );
                        // Return 0 if the calculation results in NaN (e.g., if products.length is undefined/zero),
                        // otherwise return the calculated number of pages.
                        return isNaN(numberOfPages)
                            ? 0
                            : numberOfPages
                        ;
                    };


                    /**
                     * Generates an array with a length corresponding to the
                     * number of filtered results. This is often used in templates
                     * with ng-repeat to create a sequence of elements (e.g., pagination links).
                     *
                     * @param {number} n - The total count of filtered results.
                     * @returns {Array} An array of length `Math.ceil(n)`.
                     */
                    scope.getNumberOfFilteredResults = function (
                        n
                    ) {
                        // Ensure 'n' is a valid number; default to 0 if it's not a number.
                        var num = isNaN(n) ? 0 : n;
                        // Create and return a new array with a length equal to the
                        // ceiling of the provided number.
                        return new Array(
                            Math.ceil(num)
                        );
                    };
                }
            };
        }
    ]
);