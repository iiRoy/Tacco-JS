/*
 *  StoreView Module
 *  Manages a filtered and sorted view of a data store.
 *  Utilizes EventEmitter for event propagation.
 */

var EventEmitter = require('events').EventEmitter ;
var _ = require ( "lodash" ) ;

// Utility functions required by this module
var utils = require ( "../utils.js" ) ;

/**
 *  Default sorting function for elements in the store.
 *  Sorts based on the element's index within the parent store.
 *  @param {Object} elem - The element to sort.
 *  @returns {Number} The index of the element.
 */
function SortByStoreOrder ( elem )
{
  return this.store.index ( elem.id ) ;
}

// Assign the default sorting function
var default_sort = SortByStoreOrder ;

/**
 *  Default filtering function.
 *  Always returns true, meaning all elements are included by default.
 *  @param {Object} elem - The element to filter.
 *  @returns {boolean} Always true.
 */
var default_filt = function ( elem )
{
  return true ;
};

/**
 *  Constructor for StoreView.
 *  Initializes a new StoreView instance.
 *  @param {Object} store - The underlying data store.
 *  @param {Function} filt - The filtering function.
 *  @param {Function} sortfun - The sorting function.
 */
function StoreView ( store , filt , sortfun )
{
  // Call EventEmitter constructor to inherit its capabilities
  EventEmitter.call ( this ) ;

  // Store the reference to the original data store
  this.store = store ;

  // Bind 'this' context to instance methods for event listeners
  this.add = this.add.bind ( this ) ;
  this.update = this.update.bind ( this ) ;
  this.remove = this.remove.bind ( this ) ;
  this.recalculate = this.recalculate.bind ( this ) ;

  // Attach event listeners to the underlying store
  this.store.addListener ( "add" , this.add ) ;
  this.store.addListener ( "update" , this.update ) ;
  this.store.addListener ( "remove" , this.remove ) ;
  this.store.addListener ( "recalculate" , this.recalculate ) ;

  // Perform initial calculation of the view
  this.recalculate ( filt , sortfun ) ;
}

/*
 *  Extend StoreView prototype with EventEmitter prototype and custom methods.
 *  This provides event emission and handling capabilities to StoreView instances.
 */
_.extend ( StoreView.prototype , EventEmitter.prototype , {

  /**
   *  Closes the StoreView.
   *  Removes all event listeners from the underlying store and cleans up its own listeners.
   */
  close : function ( )
  {
    // Remove listeners from the main store to prevent memory leaks
    this.store.removeListener ( "add" , this.add ) ;
    this.store.removeListener ( "update" , this.update ) ;
    this.store.removeListener ( "remove" , this.remove ) ;
    this.store.removeListener ( "recalculate" , this.recalculate ) ;

    // Remove all listeners attached to this StoreView instance
    this.removeAllListeners ( ) ;
  } ,

  /**
   *  Recalculates the filtered and sorted list based on current or new filter/sort functions.
   *  @param {Function} filt - Optional new filtering function.
   *  @param {Function} sortfun - Optional new sorting function.
   */
  recalculate : function ( filt , sortfun )
  {
    // Use provided filter/sort, or current filter/sort, or default filter/sort
    filt = filt || this.filt || default_filt ;
    sortfun = sortfun || this.sortfun || default_sort ;

    // Bind filter and sort functions to the current 'this' context
    filt = filt.bind ( this ) ;
    sortfun = sortfun.bind ( this ) ;

    // Update the instance's filter and sort functions
    this.filt = filt ;
    this.sortfun = sortfun ;

    // Apply the filter to the store's list
    this.list = this.store.list.filter ( filt ) ;

    // Sort the filtered list
    this.list.sort ( function ( a , b )
    {
      // Determine sort keys for comparison
      var akey = sortfun ( a ) ;
      var bkey = sortfun ( b ) ;

      // Compare keys and return appropriate sort order
      if ( akey < bkey )
      {
        return -1 ; // a comes before b
      }
      else if ( akey > bkey )
      {
        return 1 ; // b comes before a
      }
      else
      {
        return 0 ; // a and b are equal in terms of sort order
      }
    } ) ;

    // Emit a 'recalculate' event to notify listeners
    this.emit ( "recalculate" ) ;
  } ,

  /**
   *  Finds the correct insertion index for an element in the sorted list.
   *  @param {Object} elem - The element to find the index for.
   *  @returns {Number} The index where the element should be inserted to maintain sort order.
   */
  index : function ( elem )
  {
    // Uses lodash's sortedIndex to find the insertion point
    return _.sortedIndex ( this.list , elem , this.sortfun ) ;
  } ,

  /**
   *  Adds an element to the view if it passes the filter.
   *  @param {Object} elem - The element to add.
   */
  add : function ( elem )
  {
    // Check if the element passes the current filter
    if ( this.filt ( elem ) )
    {
      var idx = this.index ( elem ) ; // Determine insertion index

      // If the element should be appended to the end, use push for performance
      if ( idx === this.list.length )
      {
        /* This case occurs frequently, so using .push() is more performant. */
        this.list.push ( elem ) ;
      }
      else
      {
        // Otherwise, insert using splice
        this.list.splice ( idx , 0 , elem ) ;
      }

      // Emit an 'add' event with the added element and its index
      this.emit ( "add" , elem , idx ) ;
    }
  } ,

  /**
   *  Updates an element in the view.
   *  Handles cases where the element's filter status or sort position changes.
   *  @param {Object} elem - The updated element.
   */
  update : function ( elem )
  {
    var idx ;
    var i = this.list.length ;

    // Search for the element's current index in the list, starting from the end
    // This is often faster as updates frequently happen to newer items.
    while ( i-- )
    {
      if ( this.list [ i ] .id === elem.id )
      {
        idx = i ;
        break ; // Found the element
      }
    }

    // If element was not found in the list (idx is undefined or -1 if initialized)
    if ( idx === undefined )
    {
      this.add ( elem ) ; // Try to add it (it might now pass the filter)
    }
    // If element is in the list but no longer passes the filter
    else if ( ! this.filt ( elem ) )
    {
      this.remove ( elem.id ) ; // Remove it from the view
    }
    else
    {
      // Element is in the list and still passes the filter
      // Check if its sort position has changed
      if ( this.sortfun ( this.list [ idx ] ) !== this.sortfun ( elem ) )
      {
        this.remove ( this.list [ idx ] ) ; // Remove old element
        this.add ( elem ) ;                 // Add new element (will be inserted at correct position)
      }
      else
      {
        // Sort position has not changed, simply update the element in place
        this.list [ idx ] = elem ;
        this.emit ( "update" , elem , idx ) ; // Emit 'update' event
      }
    }
  } ,

  /**
   *  Removes an element from the view by its ID.
   *  @param {string} elem_id - The ID of the element to remove.
   */
  remove : function ( elem_id )
  {
    var idx = this.list.length ;

    // Iterate backwards to find and remove the element
    while ( idx-- )
    {
      if ( this.list [ idx ] .id === elem_id )
      {
        this.list.splice ( idx , 1 ) ; // Remove the element from the list
        this.emit ( "remove" , elem_id , idx ) ; // Emit 'remove' event
        break ; // Element found and removed, exit loop
      }
    }
  }
} ) ;

/*
 *  Export the StoreView constructor for use in other modules.
 */
module.exports = {
  StoreView : StoreView
} ;