/*
 * qworker.js
 *
 * This file contains the core implementation of the QWorker,
 * a JavaScript worker process designed for managing and executing
 * tasks received from a client controller (qclient).
 *
 * The worker's primary function is to:
 * 1. Initialize and bind a message handler to listen for instructions.
 * 2. Enter a cycle of downloading work, processing it, and uploading results.
 * 3. This cycle continues until a 'stop' command is explicitly received.
 *
 * Tracing the execution from the `messageHandler` is the recommended
 * approach for understanding the worker's operational flow.
 *
 * Author: Richard Revis (http://theplanis.com)
 * Version: 1.0.1
 */

function QWorker ( )
{

    // --- Configuration and State Variables ---

    // The base URL for queue operations (downloading tasks, uploading results).
    this . queueURL        =  '/queue/' ;

    // Counter to track consecutive download failures.
    // Exceeding a certain threshold will halt the worker.
    this . failureCounter  =  0 ;

    // Default configuration options for the worker.
    // These can be overridden by messages from the client.
    this . options         =  { 'delaybetweenrequests' : '2000' } ;


    // --- Core Worker Methods ---

    /**
     * Handles incoming messages from the main thread (qclient controller).
     * This is the primary entry point for controlling the worker's behavior.
     *
     * @param {string} message - The JSON string message received from the client.
     */
    this . messageHandler  =  function ( message )
    {
        // Example message structure:
        // { 'type': 'start', 'options': { 'delaybetweenrequests': '5000' } }

        // Parse the incoming JSON string into a JavaScript object.
        message = JSON . parse ( message ) ;

        // Determine the action based on the message type.
        switch ( message . type )
        {
            case 'start':
                // The client has instructed the worker to begin or resume operations.
                this . stopped        =  false ;          // Ensure worker is not flagged as stopped.
                this . failureCounter =  0     ;          // Reset failure count upon a new start.

                postMessage ( 'Workload manager starting' ) ; // Notify the client that startup is underway.
                this . workloadManager ( ) ;                  // Initiate the workload management loop.
                break ;                                       // Exit the switch.

            case 'stop':
                // The client has requested the worker to halt all activity.
                postMessage ( 'Workload manager stopping' ) ; // Inform the client about the impending stop.

                if ( this . rq )
                {
                    // If an XMLHttpRequest is currently active (e.g., downloading work),
                    // abort it to prevent further network activity or processing.
                    this . rq . abort ( ) ;
                }

                this . stopped = true ; // Set the flag to prevent further workload execution.
                break ;                // Exit the switch.
        }

        // Check if the message includes updated configuration options.
        if ( message . options )
        {
            // Update the 'delaybetweenrequests' option.
            // If message.options.delaybetweenrequests is provided, use it;
            // otherwise, retain the current value.
            this . options . delaybetweenrequests =
                  message . options . delaybetweenrequests
               || this . options . delaybetweenrequests ;
        }
    } ; // End of messageHandler function.


    /**
     * Manages the worker's workload by attempting to download new tasks.
     * This function is called periodically or when the worker is idle.
     */
    this . workloadManager = function ( )
    {
        // If the worker has been instructed to stop, gracefully exit.
        if ( this . stopped )
        {
            return false ;
        }

        // Check if the failure limit has been reached.
        if ( this . failureCounter > 5 )
        {
            postMessage ( 'Download failure limit reached' ) ; // Notify client of excessive failures.
        }
        else
        {
            // Store a reference to 'this' (the QWorker instance) for use within callbacks.
            var qw = this ;

            // Create a new XMLHttpRequest object for fetching work.
            var rq = new XMLHttpRequest ( ) ;

            // Set up the callback for when the request's state changes.
            rq . onreadystatechange = function ( )
            {
                // Check if the request is complete (readyState 4).
                if ( rq . readyState == 4 )
                {
                    // Check if the HTTP status code indicates success (200 OK).
                    if ( rq . status == 200 )
                    {
                        // If successful, process the received data packet.
                        qw . packetHandler ( rq . responseText ) ;
                    }
                    else
                    {
                        // If the request failed (non-200 status), handle the download failure.
                        qw . downloadFailure ( ) ;
                    }
                }
            } ;

            // Open an asynchronous GET request to the queue URL.
            rq . open ( "GET" , this . queueURL , true ) ;

            // Send the request. For GET, the body is null.
            rq . send ( null ) ;

            // Store the XMLHttpRequest object on the worker instance.
            // This allows it to be aborted if a 'stop' message is received.
            this . rq = rq ;
        }
    } ; // End of workloadManager function.


    /**
     * Increments the failure counter and schedules the next workload attempt
     * after a delay. Called when a download request fails.
     */
    this . downloadFailure = function ( )
    {
        this . failureCounter += 1 ; // Increment the count of consecutive failures.

        var qw = this ; // Reference to the worker instance.

        // Schedule the next attempt to download work after the configured delay.
        setTimeout ( "qworker.workloadManager()" , this . options . delaybetweenrequests ) ;
    } ; // End of downloadFailure function.


    /**
     * Processes a downloaded data packet, executes the contained task,
     * and uploads the result back to the server.
     *
     * @param {string} responseData - The JSON string containing the task packet.
     */
    this . packetHandler = function ( responseData )
    {
        // If the worker has been stopped, do not process any new packets.
        if ( this . stopped )
        {
            return false ;
        }

        // Parse the incoming JSON response data.
        var rjs = JSON . parse ( responseData ) ;

        // Check for special server notifications (e.g., 'retry').
        if ( rjs . code )
        {
            if ( rjs . code == 'retry' )
            {
                // The server indicates no data is currently available and requests a retry after a period.
                postMessage ( 'Retry delay of ' + rjs . period + 'ms requested.' ) ;

                // Schedule the workload manager to run again after the specified retry period.
                setTimeout ( "qworker.workloadManager()" , parseInt ( rjs . period ) ) ;
            }
        }
        else
        {
            // Regular task packet received. Extract details.
            var pktid = rjs . uid   ;      // Unique packet identifier.
            var fnstr = unescape ( rjs . fnstr ) ; // Function string (unescaped).
            var data  = unescape ( rjs . data  ) ; // Data for the function (unescaped).

            // IMPORTANT: The 'eval' function is used here.
            // This assumes that the 'fnstr' (function string) is obtained from
            // a trusted and secure source to prevent arbitrary code execution vulnerabilities.
            eval ( 'var fn = ' + fnstr ) ;

            // Store a reference to 'this' (the QWorker instance).
            var qw = this ;

            // Define an 'inprocess' function that will execute the task
            // and handle the result upload.
            this . inprocess = function ( )
            {
                // Execute the supplied function (`fn`) with the provided `data`.
                var result = fn ( data ) ;

                // Prepare the parameters for uploading the result, including packet ID and result.
                var params = "{'pktid':'" + pktid + "','result':'" + result + "'}" ;

                // Create a new XMLHttpRequest for uploading the result.
                var rq = new XMLHttpRequest ( ) ;

                // This URL should point to your queue server's endpoint for result uploads.
                rq . open ( 'POST' , '/queue/' , true ) ;

                // Set necessary HTTP headers for a JSON POST request.
                rq . setRequestHeader ( "Content-type"   , "application/json" ) ;
                rq . setRequestHeader ( "Content-length" , params . length    ) ;
                rq . setRequestHeader ( "Connection"     , "close"            ) ;

                // Send the result parameters to the server.
                rq . send ( params ) ;

                // After sending the result, schedule the workload manager to
                // fetch the next task after the configured delay.
                setTimeout ( "qworker.workloadManager()" , this . options . delaybetweenrequests ) ;

                // Clear the 'inprocess' reference as this task is now complete.
                qw . inprocess = null ;
            } ;

            // Immediately execute the 'inprocess' function to handle the current task.
            this . inprocess ( ) ;
        }
    } ; // End of packetHandler function.

} ; // End of QWorker constructor.


// Instantiate the QWorker globally in the worker's scope.
qworker = new QWorker ( ) ;

// Define the global `onmessage` handler for the Web Worker.
// This function is automatically called when the worker receives a message
// from its parent thread.
onmessage = function ( event )
{
    // Delegate the message handling to the QWorker instance.
    qworker . messageHandler ( event . data ) ;
} ; // End of onmessage handler.