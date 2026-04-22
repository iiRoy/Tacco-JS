"use strict"
; /* Enable strict mode for better error handling */
var   inventoryApp   =    window.ng.module (   "inventoryAppModule"   ,   [ ]   )  ;

inventoryApp.controller (    "ProductListingController"    ,    [   "viewScope"   ,   "dataFilter"   ,   "productInfoService"   ,
    function (    viewScope    ,    dataFilter    )    {

        // Assign the product data to the view's scope
        viewScope.inventory    =    productInfoService.fetchData ( )   ;


        viewScope.getDisplayedProductCount    =    function ( )    {
            /*
             * This function computes the total number of products currently visible
             * after applying all filters, sorting, and pagination.
             *
             * The calculation involves several dataFilter operations:
             * 1. Filter by searchCriteria
             * 2. Order by ordering.criteria and ordering.descending
             * 3. Start from the current page's offset (activePage * itemsPerPage)
             * 4. Limit to the number of items per page
             * Finally, get the length of the resulting array.
             */
            return    dataFilter ( "limitTo" ) (    dataFilter ( "startFrom" ) (    dataFilter ( "orderBy" ) (    dataFilter ( "filter" ) (    viewScope.inventory.items    ,    viewScope.inventory.searchCriteria    )    ,    viewScope.inventory.ordering.criteria    ,    viewScope.inventory.ordering.descending    )    ,    viewScope.inventory.activePage    *    viewScope.inventory.itemsPerPage    )    ,    viewScope.inventory.itemsPerPage    ) . length    ;
        } ;

        /*
         * Monitor changes in the search query to reset pagination.
         * If the user types a new search term, we should go back to the first page
         * to show results from the beginning of the filtered list.
         */
        viewScope.$watch (    "inventory.searchCriteria"    ,    function (    currentVal    ,    previousVal    )    {
            // Only perform the reset if the search value has genuinely changed.
            // Avoid resetting the page during the initial setup or when navigating
            // back to this view from elsewhere, which might cause currentPage to incorrectly
            // revert to zero.
            if    (    currentVal    !==    previousVal    )    {
                viewScope.inventory.activePage    =    0    ;
            }
        } ) ;
    }
] ) ;

inventoryApp.directive (    "itemDisplayList"    ,    [ function ( )    {
    return    {
        restrict    :    "E"    , // This directive is used as an HTML element
        templateUrl    :    "/admin-panel/js/modules/inventory/productListView.html"
    }    ;
} ] ) ;


inventoryApp.directive (    "itemPagingComponent"    ,    [   "productInfoService"   ,
    function (    productInfoService    )    {
        return    {
            restrict    :    "E"    , // This directive is used as an HTML element
            templateUrl    :    "/admin-panel/js/modules/inventory/pagingControlView.html"    ,
            connect    :    function (    displayScope    )    {
                displayScope.inventory    =    productInfoService.fetchData ( )   ;

                displayScope.goToPage    =    function (    actionEvt    ,    targetPageNum    )    {
                    actionEvt.preventDefault ( )   ; // Prevent default link behavior

                    // Check if the pagination step is disabled before proceeding
                    if    (    window.jQuery (    actionEvt.target    ) . closest (    ".step"    ) . is (    ".disabled"    )    )    {
                        return    ;
                    }

                    displayScope.inventory.activePage    =    targetPageNum    ; // Update the current page
                } ;

                displayScope.getTotalPageCount    =    function ( )    {
                    // Calculate the total number of pages required for the current inventory
                    var    totalPagesCalculated    =    Math.ceil (    displayScope.inventory.items.length    /    displayScope.inventory.itemsPerPage    )    ;
                    // Return 0 if the calculation results in NaN, otherwise return the calculated number
                    return    isNaN (    totalPagesCalculated    )    ?    0    :    totalPagesCalculated    ;
                } ;

                displayScope.getFilteredResultRange    =    function (    count    )    {
                    // Ensure the input count is a valid number, defaulting to 0 if not
                    var    processedCount    =    isNaN (    count    )    ?    0    :    count    ;
                    // Create an array of appropriate length for UI rendering (e.g., for ng-repeat)
                    return    new    Array (    Math.ceil (    processedCount    )    )    ;
                } ;
            }
        } ;
    }
] ) ;