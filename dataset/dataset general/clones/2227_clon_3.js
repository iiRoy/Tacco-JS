(function() {
  "use strict";

  // This IIFE encapsulates the module definition to prevent global variable pollution.

  // Define an Angular module specifically for managing page navigation components.
  // Renamed: 'paginationModule' to 'pageNavigationSystem'
  // Renamed: 'simplePagination' to 'angularPageNav'
  const pageNavigationSystem = angular.module('angularPageNav', []);

  /**
   * @ngdoc service
   * @name angularPageNav.service:PageNavigatorService
   * @description
   * Provides a comprehensive utility for managing pagination state and operations.
   * It allows creation of independent page controller instances.
   */
  pageNavigationSystem.factory('PageNavigatorService', function() {

    // An internal object to hold all public methods exposed by this factory service.
    // Renamed: 'pagination' to 'pagerUtility'
    const pagerUtility = {};

    /**
     * Initializes and returns a new page controller instance.
     * This controller manages the state and actions for a single paginated data set.
     *
     * @param {number} [elementsPerView=5] - The desired number of items to display on each page.
     *                                       Defaults to 5 if not specified or invalid.
     * @returns {object} An object representing a page controller with its state and navigation functions.
     * Renamed: 'getNew' to 'createPageController'
     * Renamed: 'perPage' to 'elementsPerView'
     */
    pagerUtility.createPageController = function(elementsPerView = 5) { // Type III: Using default parameter

      // Ensure that 'elementsPerView' is a valid positive integer. If not, default to 5.
      const itemsPerSegment = Math.max(1, parseInt(elementsPerView, 10) || 5); // Type III: Robust validation and renaming

      // The core object that holds the state of the current pagination instance.
      // Renamed: 'paginator' to 'pageHandler'
      const pageHandler = {
        // Renamed: 'numPages' to 'totalAvailablePages'
        totalAvailablePages: 0, // This will be calculated dynamically based on total items.
        // Renamed: 'perPage' to 'itemsPerSegment'
        itemsPerSegment: itemsPerSegment,
        // Renamed: 'page' to 'currentActivePageIndex'
        currentActivePageIndex: 0, // Represents the 0-indexed number of the currently active page.
        // Type III: Added a new property to store the total count of items.
        totalRecordCount: 0
      };

      /**
       * Recalculates the total number of available pages based on the total items and items per segment.
       * This method should be called whenever the total number of items changes.
       *
       * @param {number} totalCount - The absolute total number of items in the entire dataset.
       * @param {number} [overrideItemsPerSegment] - Optional: If provided, this value temporarily overrides
       *                                           the instance's 'itemsPerSegment' for this calculation.
       * Type III: This is a new method added to enhance the paginator's functionality.
       */
      pageHandler.setTotalRecordCount = function(totalCount, overrideItemsPerSegment) {
        const effectiveItemsPerSegment = overrideItemsPerSegment !== undefined ?
          Math.max(1, parseInt(overrideItemsPerSegment, 10) || 1) :
          pageHandler.itemsPerSegment;

        pageHandler.totalRecordCount = Math.max(0, parseInt(totalCount, 10) || 0);
        pageHandler.totalAvailablePages = Math.ceil(pageHandler.totalRecordCount / effectiveItemsPerSegment);

        // Adjust the current page index if it now exceeds the new total number of pages.
        if (pageHandler.currentActivePageIndex >= pageHandler.totalAvailablePages) {
          pageHandler.currentActivePageIndex = Math.max(0, pageHandler.totalAvailablePages - 1);
        }
      };

      /**
       * Decrements the current page index, moving to the previous page, if one exists.
       * The page index will not go below 0.
       * Renamed: 'prevPage' to 'navigateBackward'
       */
      pageHandler.navigateBackward = function() {
        // Type III: Using Math.max to ensure the page index never drops below zero.
        pageHandler.currentActivePageIndex = Math.max(0, pageHandler.currentActivePageIndex - 1);
      };

      /**
       * Increments the current page index, moving to the next page, if one exists.
       * The page index will not exceed the maximum available page.
       * Renamed: 'nextPage' to 'navigateForward'
       */
      pageHandler.navigateForward = function() {
        // Type III: Using Math.min to ensure the page index doesn't go beyond the last page.
        pageHandler.currentActivePageIndex = Math.min(pageHandler.totalAvailablePages - 1, pageHandler.currentActivePageIndex + 1);
      };

      /**
       * Directs the page controller to a specific page number.
       *
       * @param {number} pageNumber - The 0-indexed page number to jump to.
       * Renamed: 'toPageId' to 'jumpToSpecificPage'
       */
      pageHandler.jumpToSpecificPage = function(pageNumber) {
        const targetPage = parseInt(pageNumber, 10); // Type III: Explicit radix for parseInt

        // Type III: Enhanced validation to ensure the target page number is valid.
        if (!isNaN(targetPage) && targetPage >= 0 && targetPage < pageHandler.totalAvailablePages) {
          pageHandler.currentActivePageIndex = targetPage;
        } else {
          // Type III: Added an optional console warning for invalid page attempts.
          console.warn(`PageNavigatorService: Attempted to navigate to an invalid page number: ${pageNumber}. Current total pages: ${pageHandler.totalAvailablePages}`);
        }
      };

      /**
       * Extracts and returns the subset of data items corresponding to the current active page.
       *
       * @param {Array} completeDataset - The full array of all data items available.
       * @returns {Array} An array containing only the items that belong to the current page.
       * Type III: This is a new method added for direct data retrieval.
       */
      pageHandler.getVisiblePageItems = function(completeDataset) {
        // Type III: Guard clause to ensure input is an array.
        if (!Array.isArray(completeDataset)) {
          console.error("PageNavigatorService.getVisiblePageItems expects an array as its 'completeDataset' argument.");
          return [];
        }

        const initialSliceIndex = pageHandler.currentActivePageIndex * pageHandler.itemsPerSegment;
        const finalSliceIndex = Math.min(initialSliceIndex + pageHandler.itemsPerSegment, completeDataset.length);
        return completeDataset.slice(initialSliceIndex, finalSliceIndex);
      };

      return pageHandler;
    };

    return pagerUtility;
  });

  /**
   * @ngdoc filter
   * @name angularPageNav.filter:dataOffsetFilter
   * @function
   * @description
   * Filters an array by returning a slice of it, starting from a specified numerical index.
   * This is useful for implementing pagination where you need to display items from a certain offset.
   * Renamed: 'startFrom' to 'dataOffsetFilter'
   */
  pageNavigationSystem.filter('dataOffsetFilter', function() {
    return function(sourceArray, offsetPosition) { // Renamed: 'input' to 'sourceArray', 'start' to 'offsetPosition'
      // Type III: More robust check: ensure the input is an actual array before attempting to slice.
      if (!Array.isArray(sourceArray)) {
        return sourceArray; // If not an array, return it as is (consistent with original filter's undefined check).
      }

      const parsedOffset = parseInt(offsetPosition, 10); // Type III: Explicit radix for parseInt.
      // Type III: Add a guard clause for invalid or negative offset values.
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return sourceArray; // If offset is invalid, return the original array.
      }

      return sourceArray.slice(parsedOffset);
    };
  });

  /**
   * @ngdoc filter
   * @name angularPageNav.filter:numericalRangeGenerator
   * @function
   * @description
   * Populates an array with a sequence of numbers, starting from 0 up to (but not including) a specified count.
   * This is commonly used to generate an array of page numbers for pagination controls (e.g., [0, 1, 2, 3]).
   * Renamed: 'range' to 'numericalRangeGenerator'
   */
  pageNavigationSystem.filter('numericalRangeGenerator', function() {
    return function(targetList, count) { // Renamed: 'input' to 'targetList', 'total' to 'count'
      // Type III: Ensure 'targetList' is an array. If not, initialize a new empty array.
      let listToPopulate = Array.isArray(targetList) ? targetList : [];

      const limit = parseInt(count, 10); // Type III: Explicit radix for parseInt.
      // Type III: Add a guard clause for invalid or non-positive count values.
      if (isNaN(limit) || limit <= 0) {
        return listToPopulate; // Return the (potentially empty) list immediately if count is invalid.
      }

      // Type III: Changed 'var i' to 'let idx' for modern JavaScript scoping and renaming.
      for (let idx = 0; idx < limit; idx++) {
        listToPopulate.push(idx);
      }
      return listToPopulate;
    };
  });

})();