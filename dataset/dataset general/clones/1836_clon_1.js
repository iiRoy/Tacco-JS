/*
 *  This file defines the PackageStore class, which provides a
 *  convenient wrapper for interacting with the browser's localStorage.
 *  It supports optional encryption/decryption of stored data
 *  and mimics the standard localStorage API interface.
 */

var PackageStore   =   function ( args )
{
   'use strict'; /* Enforces strict parsing and error handling rules. */

   // Declare internal variables and helper functions at the top scope.
   var   _encrypt       =   function ( str ) { return str; } // Default: no encryption.
      ,  _decrypt       =   function ( str ) { return str; } // Default: no decryption.
      ,  _storageKey    =   'PackageStore'                     // Default key for localStorage entry.
      ,  _getContents   =   function ()
         {
            // Initialize an empty object to hold the retrieved contents.
            var storage_contents   =   {};

            // Check if there's any data stored under our specific key.
            if (   localStorage.getItem( _storageKey )   !==   null   )
            {
               // If data exists, decrypt it first, then parse it from JSON.
               storage_contents   =   JSON.parse( _decrypt( localStorage.getItem( _storageKey ) ) );
            }

            // Return the (possibly empty) object.
            return storage_contents;
         }
   ; // End of internal variable and function declarations.


   // Process constructor arguments to configure the store.
   if (   typeof ( args )   !==   'undefined'   )
   {
      // Allow overriding the default storage key.
      if (   typeof ( args[ 'storageKey' ] )   !==   'undefined'   )
      {
         _storageKey   =   args[ 'storageKey' ];
      }


      // Allow providing a custom encryption function.
      if (   typeof ( args[ 'encrypt' ] )   ===   'function'   )
      {
         _encrypt   =   args[ 'encrypt' ];
      }


      // Allow providing a custom decryption function.
      if (   typeof ( args[ 'decrypt' ] )   ===   'function'   )
      {
         _decrypt   =   args[ 'decrypt' ];
      }
   }


   // Define public methods for the PackageStore instance.

   /**
    * Stores a key-value pair in the PackageStore.
    * The value will be stringified, encrypted, and then saved.
    * @param {string} key - The key under which to store the value.
    * @param {*} value - The value to be stored.
    * @returns {void}
    */
   this.setItem   =   function ( key , value )
   {
      var storage_contents   =   _getContents(); // Retrieve current contents.
      storage_contents[ key ]   =   value;        // Assign or update the new value.

      // Stringify the entire contents object, encrypt it, and save to localStorage.
      return localStorage.setItem( _storageKey , _encrypt( JSON.stringify( storage_contents ) ) );
   };


   /**
    * Retrieves a value associated with a given key from the PackageStore.
    * @param {string} key - The key of the item to retrieve.
    * @returns {*} The stored value, or null if the key is not found.
    */
   this.getItem   =   function ( key )
   {
      var storage_contents   =   _getContents(); // Fetch all items.

      // Return the value if it exists, otherwise return null.
      return typeof ( storage_contents[ key ] )   ===   'undefined'   ?   null   :   storage_contents[ key ];
   };


   /**
    * Removes a specific item from the PackageStore by its key.
    * @param {string} key - The key of the item to remove.
    * @returns {void}
    */
   this.removeItem   =   function ( key )
   {
      var storage_contents   =   _getContents(); // Get the current state of the store.
      delete ( storage_contents[ key ] );         // Use the delete operator to remove the property.

      // Re-save the modified contents after stringification and encryption.
      return localStorage.setItem( _storageKey , _encrypt( JSON.stringify( storage_contents ) ) );
   };


   /**
    * Clears all items from this specific PackageStore instance.
    * This effectively removes the single entry from localStorage.
    * @returns {void}
    */
   this.clear   =   function ()
   {
      // Remove the entire storage entry associated with _storageKey.
      return localStorage.removeItem( _storageKey );
   };


   /**
    * Returns the number of key-value pairs currently stored.
    * @returns {number} The total count of items.
    */
   this.length   =   function ()
   {
      var storage_contents   =   _getContents() // Retrieve all stored contents.
         ,  cnt              =   0               // Initialize a counter for items.
      ;
      // Iterate over each property (key) in the storage_contents object.
      for ( var key in storage_contents )
      {
         // Ensure the property belongs to the object itself, not its prototype chain.
         if ( storage_contents.hasOwnProperty( key ) )
         {
            cnt   +=   1; // Increment the counter for each own property.
         }
      }
      return cnt; // Return the final count.
   };


   /**
    * Returns the name of the key at the specified index.
    * This method is useful for iterating through all keys.
    * @param {number} i - The zero-based index of the key to retrieve.
    * @returns {string|null} The key name if found, otherwise null.
    */
   this.key   =   function ( i )
   {
      var storage_contents   =   _getContents() // Get the stored data.
         ,  cnt              =   0               // Counter to track the current index during iteration.
      ;
      // Loop through all keys present in the storage contents.
      for ( var key in storage_contents )
      {
         // Verify that the property is directly on the object.
         if ( storage_contents.hasOwnProperty( key ) )
         {
            // If the current count matches the requested index 'i'.
            if ( cnt   ===   i )
            {
               return key; // Return the key at this specific index.
            }
            cnt   +=   1; // Move to the next index.
         }
      }
      return null; // If no key is found at the given index, return null.
   };
};

// CommonJS compatibility: Export the PackageStore constructor for Node.js environments.
if (   typeof( module )   !==   'undefined'   )
{
   // If 'module' is defined (e.g., in Node.js), export PackageStore.
   module.exports   =   PackageStore;
}