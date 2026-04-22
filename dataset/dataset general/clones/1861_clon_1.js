/*
 * This JavaScript file contains a minimal set of functions
 * designed to manage a simple, in-memory list of data.
 * The primary data structure is a global array.
 */

// Declare and initialize the main data storage array.
// It starts as an empty array object.
var myArray = new Array()


/**
 * getList
 *
 * This function provides a direct reference to the internal
 * array that stores all the items.
 *
 * @returns {Array} The current internal array containing all items.
 */
function getList ( )
{
  // Simply returns the reference to our global 'myArray'.
  return myArray
}


// This function is responsible for adding new data items to the list.
// Each item is expected to have 'x' and 'y' properties.
function addItem ( x , y )
{
  // Pushes a new object literal onto the 'myArray'.
  // The object's properties 'x' and 'y' are populated
  // directly from the function's input parameters.
  myArray . push ( { 'x' : x , 'y' : y } )
}


/**
 * clear
 *
 * This function completely empties the list of items
 * by reassigning the 'myArray' variable to a new, empty array.
 */
function clear ( )
{
  // Re-initializes 'myArray' with a brand new, empty array instance.
  // This effectively discards all previously stored items.
  myArray = [ ] ;
}