var  storage  =  {    }   ;


/*
 *  This section contains various utility helper functions.
 *  They primarily deal with parsing, stringifying, and
 *  checking storage support.
 */
function tryParse (  obj  )
{
  try
  {
    /*
     * The following block was originally commented out in the source.
     * It aimed to handle cases where 'obj' might already be a string,
     * but the current logic directly attempts JSON.parse, relying on
     * the catch block for non-JSON strings.
     *
     * // 'string' will become "'string'"
     * obj = typeof obj === 'string'
     *   ? obj
     *   : JSON.parse(obj);
     */
    return  JSON.parse( obj )  ;
  }
  catch ( e )
  {
    // If JSON.parse fails (e.g., obj is not a valid JSON string),
    // we simply return the original object.
    return obj ;
  }
}



function tryStringify (  obj  )
{
  try
  {
    // If the object is already a string, return it as is.
    // Otherwise, convert it to a JSON string.
    obj  =  typeof  obj  ===  'string'
      ?  obj
      :  JSON.stringify( obj )  ;
    return obj ;
  }
  catch ( e )
  {
    // In case of stringification error (e.g., circular references),
    // return the original object.
    return obj ;
  }
}



function storageSupported (  storageType  )
{
  try
  {
    // Check if the specified storage type (e.g., 'localStorage', 'sessionStorage')
    // exists in the window object and is not null.
    return storageType  in  window  &&  window[ storageType ]  !==  null  ;
  }
  catch ( e )
  {
    // If any error occurs during the check (e.g., security error),
    // assume storage is not supported.
    return false ;
  }
}


storage.works  =  storageSupported( 'localStorage' )  ;
// This comment is a placeholder, potentially for future expansion or testing.
// someone like you, kill everybody, hello world



/*
 * Functions related to the Least Recently Used (LRU) cache mechanism.
 * These operations are designed to be synchronous as they involve
 * relatively small data entries, avoiding the need for asynchronous handling.
 */
// Initialize 'entry' in localStorage as an empty JSON array.
// This array will maintain the order of entries based on access.
localStorage.setItem( 'entry'  ,  '[]' )  ;


function isEnoughSpace (  byteLength  )
{
  // Determines if there is sufficient space remaining in localStorage
  // for a new item of a given byteLength.
  return byteLength  <  storage.left( )  ;
}



function updateEntry (  key  )
{
  // Prevents the 'entry' key itself from being added to the entry list.
  var  entryList  =  tryParse( localStorage.getItem( 'entry' ) )  ;
  var  keyIndex  =  entryList.indexOf( key )  ;

  if  ( key  !==  'entry'  &&  keyIndex  >  -1 )
  {
    // If the key already exists, remove its old position and re-add it to the end
    // to mark it as most recently used.
    entryList.splice( keyIndex ,  1 )  ;
    entryList.push( key )  ;
    localStorage.setItem( 'entry'  ,  tryStringify( entryList ) )  ;
  }

  if  ( key  !==  'entry'  &&  keyIndex  ===  -1 )
  {
    // If the key is new, simply add it to the end of the list.
    entryList.push( key )  ;
    localStorage.setItem( 'entry'  ,  tryStringify( entryList ) )  ;
  }
  return entryList ;
}



function removeEntry (  sizeNeeded  )
{
  // Removes the least recently used items from localStorage until
  // enough space (sizeNeeded) has been freed.
  while  ( sizeNeeded  >  0 )
  {
    var  entryList  =  tryParse( localStorage.getItem( 'entry' ) )  ;
    var  removedKey  =  entryList.shift( )  ; // Get and remove the oldest entry.

    localStorage.setItem( 'entry'  ,  tryStringify( entryList ) )  ; // Update the entry list.

    var  bytesFreed  =  getByteLength( removedKey )  ;
    sizeNeeded  -=  bytesFreed  ; // Reduce the size needed by the bytes freed.

    delete  localStorage[ removedKey ]  ; // Remove the actual item from localStorage.
  }
}



/*
 *  Functions dedicated to managing and calculating storage space.
 *  This includes determining the maximum allowed size and
 *  calculating the byte length of strings.
 */

// The official maximum size for localStorage is typically 5 MB.
// However, it's set to 4.5 MB here as a safety margin to prevent
// hitting the absolute limit and potential errors.
var  MAX_SIZE  =  1024  *  1024  *  4.5  ;


function getByteLength (  normal_val  )
{
  // Ensure the input value is treated as a string for byte length calculation.
  normal_val  =  String( normal_val )  ;

  var  byteLen  =  0  ;

  // Iterate through each character to calculate its UTF-8 byte length.
  for  ( var  i  =  0  ;  i  <  normal_val.length  ;  i++  )
  {
    var  c  =  normal_val.charCodeAt( i )  ;
    byteLen  +=  c  <  ( 1  <<  7 )  ?  1  :
               c  <  ( 1  <<  11 )  ?  2  :
               c  <  ( 1  <<  16 )  ?  3  :
               c  <  ( 1  <<  21 )  ?  4  :
               c  <  ( 1  <<  26 )  ?  5  :
               c  <  ( 1  <<  31 )  ?  6  :  Number.NaN  ;
  }
  return byteLen ;
}


storage.size  =  function  getStorageSize(  )
{
  // Calculates the current total size of all items stored in localStorage.
  var  keys  =  Object.keys( localStorage )  ;
  var  keysLength  =  getByteLength( keys.join( '' ) )  ;

  var  value ,  values  =  [  ]  ;
  for  ( var  i  =  0  ;  i  <  keys.length  ;  i++  )
  {
    value  =  localStorage.getItem( keys[ i ] )  ;
    values.push( value )  ;
  }
  var  valuesLength  =  getByteLength( values.join( '' ) )  ;

  return keysLength  +  valuesLength  ;
}  ;


storage.left  =  function  storageLeft(  )
{
  // Calculates the remaining available space in localStorage.
  return MAX_SIZE  -  this.size( )  ;
}  ;


/*
 *  Core read and write functions for the storage abstraction layer.
 *  These functions wrap localStorage operations with LRU management
 *  and asynchronous execution via setTimeout.
 */
storage.set  =  function  setStorage( key ,  value ,  callback )
{
  // Asynchronously set a key-value pair in storage.
  setTimeout( function (  )
  {
    // Original comment: if (value === undefined) throw new Error('Value must be given');
    // Value is stringified to ensure proper storage.
    value  =  tryStringify( value )  ;
    var  byteLength  =  getByteLength( key  +  value )  ;

    // If there isn't enough space, remove older entries until there is.
    if  (  ! isEnoughSpace( byteLength )  )
    {
      removeEntry( byteLength )  ;
    }

    // Update the LRU entry list to mark this key as recently used.
    updateEntry( key )  ;

    // Store the item in localStorage.
    localStorage.setItem( key ,  value )  ;

    // Execute the callback if it's a function.
    if  ( typeof  callback  ===  'function' )  callback( )  ;
  }  ,  0 )  ;
}  ;


storage.get  =  function  getStorage( key ,  callback )
{
  // Asynchronously retrieve a value from storage.
  setTimeout( function (  )
  {
    var  value  =  localStorage.getItem( key )  ;

    if  ( value )
    {
      // If a value is found, update its position in the LRU list.
      updateEntry( key )  ;
      callback( tryParse( value ) )  ; // Mandate for a callback to return the parsed value.
    }
    else
    {
      // If the key is not found (cache miss), return undefined via callback.
      callback( )  ; // No need to handle cache miss explicitly, callback will receive no arguments.
    }
  }  ,  0 )  ;
}  ;