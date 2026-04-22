// This file contains a collection of utility functions for DOM manipulation and other tasks.
// It's a re-formatted version of the original 'bamboo.js' script.
// Version: 0.9b - Clone Edition

// Global object to hold the TreeWalker instance.
treeWalker = { };

// An array to collect IDs of created elements.
idCollector = [ ] ;

// A pointer to a DOM object, potentially for manipulation.
objPointer = null ;


// Function to generate a random number suitable for indexing DOM elements.
function getRandomObjectNum( seed )
{
  // Calculate a rounded index based on the total number of elements and a seed.
  return Math . round ( document . getElementsByTagName ( '*' ) . length * seed / 100 ) ;
}


// Function to retrieve a random DOM object from the document.
function getRandomObject( seed )
{
  // Gets all elements and then picks one using the random number.
  return document . getElementsByTagName ( '*' ) [ getRandomObjectNum ( seed ) ] ;
}


// Function to initialize the global treeWalker object.
function createTreeWalker ( filter )
{
  /*
   * Initialize a new DOM TreeWalker.
   * Parameters: root, whatToShow, filter, expandEntityReferences (deprecated).
   */
  treeWalker = document . createTreeWalker
  (
    document , // The root node from which to start the walk.
    filter ,   // What types of nodes to show (e.g., NodeFilter.SHOW_ALL).
    {
      // Custom filter function for the TreeWalker.
      acceptNode: function ( node )
      {
        // For this specific case, it always accepts the node.
        return NodeFilter . FILTER_ACCEPT ;
      }
    } ,
    false      // Deprecated parameter, usually false.
  ) ;
}


// Function to create a reference to a random element by assigning it an ID.
function createElementReference( seed , id )
{
  // Select a random element from the document.
  var targetElement = getRandomObject ( seed ) ;

  // Add the newly assigned ID to our collector array.
  idCollector . push ( id ) ;

  // Assign the provided ID to the target element.
  targetElement . id = id ;
}


// Function to retrieve an element that was previously assigned an ID and collected.
function getCollectedElement( seed )
{
  // Calculate an index into the idCollector array using the seed.
  var collectedIndex = Math . round ( idCollector . length * seed / 100 ) ;

  // Get the ID from the collector.
  var elementId = idCollector [ collectedIndex ] ;

  // Retrieve the element by its ID.
  var targetElement = document . getElementById ( elementId ) ;

  // Return the found element.
  return targetElement ;
}


// Core function for manipulating the objPointer based on various parameters.
function movePointer( action , node , clone , nSeed , pSeed , rSeed , sSeed , iMode )
{
  // Declare a variable for the shuffle object.
  var shuffleObject ;

  // Check if iMode is enabled and if there are collected IDs.
  if ( iMode && idCollector . length )
  {
    // If so, get a collected element as the shuffle object.
    shuffleObject = getCollectedElement ( nSeed ) ;
  }
  else
  {
    // Otherwise, get a completely random object.
    shuffleObject = getRandomObject ( nSeed ) ;
  }

  // Check if objPointer is already set.
  if ( objPointer )
  {
    // If objPointer exists, perform an action based on its value.
    switch ( action )
    {
      case 0 : // Action 0: Copy properties from shuffleObject to objPointer.
        for ( p in shuffleObject )
        {
          try
          {
            objPointer [ p ] = shuffleObject [ p ] ; // Attempt to copy property.
          }
          catch ( e ) { /* Ignore errors during property assignment. */ }
        }
      break ; // End of case 0.

      case 1 : // Action 1: Copy properties from objPointer to shuffleObject (seems reversed, but that's the logic).
        for ( p in objPointer )
        {
          try
          {
            objPointer [ p ] = shuffleObject [ p ] ; // Still copying from shuffleObject to objPointer.
          }
          catch ( e ) { /* Silently handle exceptions. */ }
        }
      break ; // End of case 1.

      case 2 : // Action 2: Copy a single random property.
        try
        {
          objPointer [ getRandomObjectNum ( rSeed ) ] = shuffleObject [ getRandomObjectNum ( rSeed ) ] ;
        }
        catch ( e ) { /* Catch and discard any errors. */ }
      break ; // End of case 2.
    }
  }
  else // If objPointer is not set, initialize it.
  {
    if ( treeWalker . currentNode ) // Check if the TreeWalker has a current node.
    {
      var randomNode = null ; // Initialize randomNode.

      // Get a phantom node using a specific seed.
      var phantomNode = getRandomObject ( pSeed ) ;

      // Determine which node to use based on the 'node' parameter.
      switch ( node )
      {
        case 0 : // Case 0: Use the current node of the TreeWalker.
          randomNode = treeWalker . currentNode ;
        break ;

        case 1 : // Case 1: Use the previous sibling node.
          randomNode = treeWalker . previousSibling ( ) ;
        break ;

        case 2 : // Case 2: Use the previous node in the document order.
          randomNode = treeWalker . previousNode ( ) ;
        break ;

        case 3 : // Case 3: Use the previously determined phantomNode.
          randomNode = phantomNode ;
        break ;
      }

      // If cloning is requested, clone the node.
      if ( clone )
      {
        objPointer = randomNode . cloneNode ( true ) ; // Deep clone the node.
      }
      else // Otherwise, just assign the node directly.
      {
        objPointer = randomNode ;
      }
    }
    else // If treeWalker.currentNode is not set, create a new TreeWalker.
    {
      createTreeWalker ( NodeFilter . SHOW_ALL ) ; // Initialize with SHOW_ALL filter.
    }
  }
}


// Function to inject HTML or text content into an element.
function innerHTMLInject ( elem , string , action )
{
  // Perform the injection based on the specified action.
  switch ( action )
  {
    case 0 : // Action 0: Set innerHTML.
      elem . innerHTML = string ;
    break ;

    case 1 : // Action 1: Set textContent.
      elem . textContent = string ;
    break ;

    case 2 : // Action 2: Append to innerHTML.
      elem . innerHTML += string ;
    break ;

    case 3 : // Action 3: Append to textContent.
      elem . textContent += string ;
    break ;

    case 4 : // Action 4: Clear innerHTML.
      elem . innerHTML = null ;
    break ;

    case 5 : // Action 5: Clear textContent.
      elem . textContent = null ;
    break ;
  }
}


// Function to perform a heap spray, often used in exploits.
function heapSpray ( )
{
  // Create a new array to hold the spray objects.
  var spray = new Array ( ) ;

  // Loop a fixed number of times to fill the array.
  for ( i = 0 ; i < 0xFE ; i ++ )
  {
    // Each element is a Uint8Array filled with a specific byte pattern.
    spray [ i ] = new Uint8Array ( [ 0xDE , 0xAD , 0xBE , 0xEF ] ) ;
  }
}


// Function to fire a custom event on a given object.
function fireEvent ( evt , obj )
{
  // Create a new custom Event object.
  event = new Event ( evt ,
  {
    'view' : window ,       // The window object.
    'bubbles' : true ,      // Event bubbles up through the DOM.
    'cancelable' : false    // Event cannot be canceled.
  } ) ;
  // Dispatch the created event on the target object.
  obj . dispatchEvent ( event ) ;
}