/*
 *  This is a slightly altered version of the original Tiny Queue implementation.
 *  It maintains the exact same functionality and structure,
 *  but with different formatting and comments.
 *
 *  Queue Constructor
 *  @constructor
 */
clippy  .  Queue =  function  (  onEmptyCallback  )
{
    // Initialize the internal queue as an empty array.
    this  .  _queue  =  [  ]  ;

    // Store the callback to be invoked when the queue becomes empty.
    this  .  _onEmptyCallback  =  onEmptyCallback  ;
}  ;


clippy  .  Queue  .  prototype  =
{
    /**
     *    Adds a function to the queue.
     *    If the queue was empty and not active, it starts processing immediately.
     *
     *    @param  {function(Function)}  func  -  The function to be queued. It should accept a callback argument.
     *    @returns  {jQuery.Deferred}          -  (Note: Original comment, not actually returning Deferred here)
     */
    queue  :  function  (  func  )
    {
        // Add the provided function to the end of the queue.
        this  .  _queue  .  push  (  func  )  ;

        // If this is the first item in the queue AND nothing is currently being processed,
        // then initiate the queue processing.
        if  (  this  .  _queue  .  length  ===  1  &&  !  this  .  _active  )
        {
            this  .  _progressQueue  (  )  ; // Start processing the queue
        }
    }  ,


    //  Internal helper method to advance the queue.
    _progressQueue  :  function  (  )
    {
        // Stop processing if there are no more items left in the queue.
        if  (  !  this  .  _queue  .  length  )
        {
            // If the queue is truly empty, invoke the registered callback.
            this  .  _onEmptyCallback  (  )  ;
            return  ; // Exit the function as nothing more to do.
        }


        // Retrieve the first function from the queue.
        var  f  =  this  .  _queue  .  shift  (  )  ;

        // Mark the queue as active, indicating a function is currently being processed.
        this  .  _active  =  true  ;

        // Prepare the 'completeFunction' which will be called by 'f' when it finishes.
        // This 'completeFunction' will trigger the next item in the queue.
        var  completeFunction  =  $  .  proxy  (  this  .  next  ,  this  )  ;

        // Execute the function that was just retrieved from the queue,
        // passing it the 'completeFunction' as its argument.
        f  (  completeFunction  )  ;
    }  ,


    /**
     *    Clears all pending functions from the queue immediately.
     */
    clear  :  function  (  )
    {
        // Reset the queue to an empty array, discarding all pending functions.
        this  .  _queue  =  [  ]  ;
    }  ,


    //  Method to proceed to the next item in the queue.
    //  This is typically called by the currently executing function when it completes.
    next  :  function  (  )
    {
        // Mark the queue as no longer active, as the current function has finished.
        this  .  _active  =  false  ;

        // Attempt to process the next item in the queue.
        this  .  _progressQueue  (  )  ;
    }
}  ;