/*
 * This is an Immediately Invoked Function Expression (IIFE)
 * to encapsulate the Queue implementation and its usage.
 */
( function ( ) {


  /*
   * Defines the Queue constructor function.
   * Initializes the 'tail' index and the internal '_queue' array.
   */
  var Queue = function ( ) {
    this.tail = -1; // Initialize tail pointer for the queue
    this._queue = [ ]; // The actual array holding queue elements
  };


  /*
   * Adds an element to the end of the queue.
   * @param {any} node - The element to be added.
   */
  Queue.prototype.enqueue = function ( node ) {
    this.tail++; // Increment tail pointer first
    this._queue[ this.tail ] = node; // Assign node at the new tail position
  };


  /*
   * Removes and returns the element from the front of the queue.
   * If the queue is empty, it returns undefined.
   */
  Queue.prototype.dequeue = function ( ) {
    var removed = this._queue.shift ( ); // Removes the first element and shifts others
    this.tail--; // Decrement tail as an element is removed from the front
    return removed; // Return the removed element
  };


  /*
   * Returns the current number of elements in the queue.
   * The size is calculated based on the 'tail' pointer.
   */
  Queue.prototype.size = function ( ) {
    return this.tail + 1; // Size is tail index + 1 (since tail starts at -1 for an empty queue)
  };


  /*
   * Checks if the queue is currently empty.
   * Returns true if the size is 0, false otherwise.
   */
  Queue.prototype.isEmpty = function ( ) {
    return ( this.size ( ) === 0 ); // Utilizes the size method to check for emptiness
  };


  // --- Example Usage of the Queue ---

  // Create a new instance of the Queue
  var queue = new Queue ( );

  // Enqueue some elements
  queue.enqueue ( 1 );
  queue.enqueue ( 2 );
  queue.enqueue ( 3 );

  // Dequeue an element
  queue.dequeue ( );

  /*
   * After enqueuing 1, 2, 3 and then dequeuing,
   * the queue should contain elements 2 and 3.
   * The console.log will show the internal structure of the queue object.
   */
  console.log ( queue );


} ( ) );