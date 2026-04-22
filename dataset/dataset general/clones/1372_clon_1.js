/*
 *  Angular Queue Module
 *  @version v0.0.1 - The initial release of this useful component.
 *  @author James Seppi (original developer)
 *  @license MIT License, for more details see http://jseppi.mit-license.org
 *  This file contains the core logic for the Angular Queue service.
 */
( function(  window ,  angular ,  undefined  ) {

    'use strict' ; // Enforce strict mode for better code quality and fewer silent errors.

    // Define the ngQueue module and register the $queue factory.
    angular.module( 'ngQueue', [ ] )
        .factory( '$queue',
            [ '$timeout',
                function(  $timeout  ) {

                    // Default configuration options for new queue instances.
                    var defaults  =  {
                        delay:    100,      // Default delay in milliseconds between processing items.
                        complete: null,     // Callback function executed when the queue is empty.
                        paused:   false     // Flag indicating if the queue should start in a paused state.
                    };

                    /**
                     *  Queue Constructor Function
                     *  This function initializes a new Queue instance.
                     *
                     *  @param {Function} callback - The function to be called for each item in the queue.
                     *  @param {Object} [options] - Configuration options for the queue.
                     */
                    function Queue (  callback ,  options  ) {

                        // Extend default options with provided options.
                        options = angular.extend( {  } ,  defaults ,  options  ) ;

                        // Ensure that a valid callback function is provided.
                        if (  ! angular.isFunction(  callback  )  ) {

                            throw new Error(  'callback must be a function for the Queue to operate correctly'  ) ;
                        }

                        // --- Private Variables ---
                        // Flag to indicate if the queue has been explicitly cleared.
                        var cleared       =  false ;
                        // Stores the promise returned by $timeout for cancellation purposes.
                        var timeoutProm   =  null  ;


                        // --- Public Instance Variables ---
                        this.queue      =  [ ]  ;             // The array holding the items in the queue.
                        this.delay      =  options.delay  ;   // The delay between processing items.
                        this.callback   =  callback  ;        // The function to call for each item.
                        this.complete   =  options.complete  ; // The callback for when the queue is finished.
                        this.paused     =  options.paused  ;  // The current paused state of the queue.


                        // --- Private Methods ---

                        /**
                         *  Stops the current processing cycle of the queue.
                         *  If a timeout is active, it will be cancelled.
                         */
                        var stop  =  function (  ) {

                            if (  timeoutProm  ) {
                                $timeout.cancel(  timeoutProm  ) ;
                            }

                            timeoutProm  =  null  ; // Reset the timeout promise.
                        } ;


                        // --- Public Instance Methods ---

                        /**
                         *  Returns the current number of items in the queue.
                         *
                         *  @returns {Number} The size of the queue.
                         */
                        this.size  =  function (  ) {
                            return  this.queue.length  ;
                        } ;

                        /**
                         *  Adds a single item to the end of the queue.
                         *
                         *  @param {Object} item - The item to be added.
                         *  @returns {Number} The new size of the queue after adding the item.
                         */
                        this.add  =  function (  item  ) {

                            return  this.addEach(  [  item  ]  ) ;
                        } ;

                        /**
                         *  Adds an array of items to the end of the queue.
                         *  If the queue is not paused, it will attempt to start processing.
                         *
                         *  @param {Array} items - An array of items to be added.
                         *  @returns {Number} The new size of the queue after adding the items.
                         */
                        this.addEach  =  function (  items  ) {

                            if (  items  ) {
                                cleared  =  false  ;
                                this.queue  =  this.queue.concat(  items  ) ;
                            }

                            if (  ! this.paused  ) {
                                this.start(  ) ; // Attempt to start processing if not paused.
                            }

                            return  this.size(  ) ;
                        } ;

                        /**
                         *  Clears all items from the queue and immediately stops any ongoing processing.
                         *
                         *  @returns {Array} The array of items that were originally in the queue before clearing.
                         */
                        this.clear  =  function (  ) {

                            var orig  =  this.queue  ; // Store the original queue for return.
                            stop(  )  ;               // Stop any active processing.
                            this.queue  =  [ ]  ;     // Empty the queue array.
                            cleared  =  true  ;       // Mark as cleared.
                            return  orig  ;
                        } ;

                        /**
                         *  Pauses the processing of the queue.
                         *  Any currently scheduled processing will be cancelled.
                         */
                        this.pause  =  function (  ) {

                            stop(  )  ;          // Stop any active $timeout.
                            this.paused  =  true  ; // Set the paused flag.
                        } ;


                        /**
                         *  Initiates or resumes the processing of the queue.
                         *  If the queue is not empty and not currently processing, it will begin.
                         */
                        this.start  =  function (  ) {

                            var _this  =  this ; // Capture 'this' for use within the closure.
                            _this.paused  =  false ; // Ensure the queue is not marked as paused.

                            // Only proceed if there are items and no processing is currently active.
                            if (  _this.size(  )  &&  ! timeoutProm  ) {

                                ( function  loopy (  ) { // Define and immediately invoke a looping function.

                                    var item ; // Variable to hold the item being processed.

                                    stop(  ) ; // Always stop any previous timeout before scheduling a new one.

                                    // If the queue has been paused externally, just return.
                                    if(  _this.paused  )
                                        return ;

                                    // If the queue is now empty, handle completion.
                                    if (  ! _this.size(  )  ) {
                                        cleared  =  true  ; // Mark as cleared implicitly.
                                        if (  angular.isFunction(  _this.complete  )  ) {
                                            _this.complete.call(  _this  ) ; // Call the completion callback.
                                        }
                                        return ; // Exit the loopy function.
                                    }

                                    // Get the next item from the front of the queue.
                                    item  =  _this.queue.shift(  ) ;
                                    // Call the user-defined callback with the item.
                                    _this.callback.call(  _this ,  item  ) ;

                                    // Schedule the next iteration of the loop after the specified delay.
                                    timeoutProm  =  $timeout(  loopy ,
                                        _this.delay  ) ;

                                    return ; // Explicit return.
                                } ) (  ) ; // Execute the loopy function immediately.
                            }
                        } ;

                        /**
                         *  Searches for the first occurrence of an item in the queue.
                         *
                         *  @param {Object} item - The item to search for.
                         *  @returns {Number} The index of the item if found, otherwise -1.
                         */
                        this.indexOf  =  function (  item  ) {

                            // Use native indexOf if available for performance.
                            if (  this.queue.indexOf  )
                                return  this.queue.indexOf(  item  ) ;

                            // Fallback for older browsers without native indexOf.
                            for (  var i  =  0 ;  i  <  this.queue.length ;  i++  ) {
                                if (  item  ===  this.queue[  i  ]  )
                                    return  i  ;
                            }
                            return  -1  ; // Item not found.
                        } ;
                    } // End of Queue constructor.

                    /**
                     *  Static method on the Queue class to create new Queue instances.
                     *  This is a convenience function to simplify queue creation.
                     *
                     *  @param {Function} callback - *Required*. The function to execute for each item.
                     *      It receives the item as an argument and its `this` context is the Queue instance.
                     *  @param {Object} [options] - *Optional*. Configuration object for the new queue.
                     *      @param {Number} [options.delay=100] - The time in milliseconds between processing each item.
                     *      @param {Function} [options.complete=null] - A function called when the queue becomes empty.
                     *          Its `this` context is also the Queue instance.
                     *      @param {Boolean} [options.paused=false] - If `true`, the queue will not start processing
                     *          items immediately after `add` or `addEach` calls. It will wait for an explicit `start()` call.
                     *  @returns {Queue} A newly created Queue instance.
                     */
                    Queue.queue  =  function (  callback ,  options  ) {

                        return  new Queue(  callback ,  options  ) ;
                    } ;

                    // Return the Queue constructor function, which also exposes the static `queue` method.
                    return  Queue  ;
                }
            ] ) ;

} ) (  window ,  window.angular  ) ; // Pass window and angular objects to the IIFE.