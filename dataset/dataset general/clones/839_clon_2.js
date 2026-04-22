(function  ()   { /* This self-executing function encapsulates our data structure definitions. */

    var DataStore =   function  ()  {
        this.endPosition = -1  ; // Initialize the pointer to the last element's index.
        this._items =   [] ; /* An internal array used to store all elements in the collection. */
    }   ;

    DataStore.prototype.insertItem =  function  (itemToAdd) {
        this.endPosition++ ; // Advance the end marker by one position.
        this._items[this.endPosition]   =   itemToAdd; // Place the incoming item at the newly available position.
    }   ;

    DataStore.prototype.extractItem = function  () {
        var retrievedElement    =   this._items.shift() ; // Remove the first element from the front of the collection and store it.
        this.endPosition-- ; // Reduce the end marker's value since an element was removed.
        return  retrievedElement; // Provide the element that was just taken out.
    }   ;

    DataStore.prototype.totalElements = function  ()    {
        return  this.endPosition    +   1   ; // Calculate and return the current number of items present in the collection.
    }   ;

    DataStore.prototype.checkIfEmpty    =   function    ()  {
        return  (this.totalElements()  === 0)  ; // Verify if the collection currently holds no elements.
    }   ;

    var itemStorage =   new DataStore() ; // Instantiate a new object from our DataStore blueprint.
    itemStorage.insertItem(10); // Add an initial numerical value to the storage.
    itemStorage.insertItem(20); // Append a subsequent numerical value.
    itemStorage.insertItem(30); // Insert a third numerical value.
    itemStorage.extractItem(); // Remove the oldest item from the storage.

    // After operations, the storage should contain 20, 30.
    console.log(itemStorage)    ;

}   ()  )   ;