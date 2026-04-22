/*
 * This is a Type I clone of the original JavaScript code.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the source.
 *
 * Extensive modifications have been made to whitespace (indentation, spacing,
 * blank lines) and comments to achieve visual difference while maintaining
 * identical logical and structural integrity.
 */
( function ( ) {
  // Enforcing strict mode for cleaner code and error prevention
  "use strict";


  /*
   * Declare the main module for simple pagination functionalities.
   * It depends on no other Angular modules.
   */
  var paginationModule = angular . module ( 'simplePagination' , [ ] ) ;


  /*
   * Define the 'Pagination' factory service.
   * This factory provides methods to create and manage pagination objects.
   */
  paginationModule . factory ( 'Pagination' , function ( ) {

    // The core pagination object that will be returned by the factory.
    var pagination = { } ;


    /**
     * Creates a new paginator instance with a specified number of items per page.
     * @param {number} perPage - The number of items to display per page.
     *                         Defaults to 5 if not provided.
     * @returns {object} A paginator object with navigation methods.
     */
    pagination . getNew = function ( perPage ) {

      // Default to 5 items per page if 'perPage' is undefined.
      perPage = perPage === undefined ? 5 : perPage ;

      /*
       * Initialize the paginator object.
       * numPages will be calculated dynamically based on total items.
       * page is the current zero-based page index.
       */
      var paginator = {
        numPages : 1 ,   // Total number of pages (initially 1)
        perPage : perPage , // Items per page
        page : 0       // Current page index (zero-based)
      } ;


      /**
       * Navigates to the previous page, if available.
       */
      paginator . prevPage = function ( ) {
        // Check if the current page is not the first page.
        if ( paginator . page > 0 ) {
          paginator . page -= 1 ; // Decrement page number.
        }
      } ;


      /**
       * Navigates to the next page, if available.
       */
      paginator . nextPage = function ( ) {
        // Check if the current page is not the last page.
        if ( paginator . page < paginator . numPages - 1 ) {
          paginator . page += 1 ; // Increment page number.
        }
      } ;


      /**
       * Navigates directly to a specified page ID.
       * @param {number} id - The zero-based index of the page to navigate to.
       */
      paginator . toPageId = function ( id ) {
        // Ensure the target page ID is within valid bounds.
        if ( id >= 0 && id <= paginator . numPages - 1 ) {
          paginator . page = id ; // Set the current page to the target ID.
        }
      } ;

      // Return the newly created paginator instance.
      return paginator ;
    } ;

    // Return the pagination service object.
    return pagination ;
  } ) ;


  /*
   * Define the 'startFrom' filter.
   * This filter is used to slice an array, starting from a specific index.
   */
  paginationModule . filter ( 'startFrom' , function ( ) {
    return function ( input , start ) {
      // If the input is undefined, return it as is.
      if ( input === undefined ) {
        return input ;
      } else {
        // Otherwise, slice the array from the 'start' index.
        // The '+' operator ensures 'start' is treated as a number.
        return input . slice ( + start ) ;
      }
    } ;
  } ) ;


  /*
   * Define the 'range' filter.
   * This filter generates a sequence of numbers from 0 up to (but not including) 'total'.
   */
  paginationModule . filter ( 'range' , function ( ) {
    return function ( input , total ) {
      // Ensure 'total' is an integer.
      total = parseInt ( total ) ;
      // Loop from 0 up to 'total' and push each number into the input array.
      for ( var i = 0 ; i < total ; i ++ ) {
        input . push ( i ) ;
      }
      // Return the modified input array containing the range.
      return input ;
    } ;
  } ) ;

} ) ( ) ; // Immediately-invoked function expression ends here.