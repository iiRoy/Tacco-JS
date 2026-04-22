/* This is a self-executing anonymous function to encapsulate the application logic. */
( function () {

    var client, sys ; // Declare variables for client and system utilities.

    sys    = require ( 'sys' ) ; // Load the 'sys' module, which provides system-related utilities.

    client = require ( '../lib/beanstalk_client' ) . Client ; // Load the Beanstalk client library and get its Client constructor.

    /*
     * This section of code implements the producer logic.
     * It connects to the Beanstalk server and attempts to put a new job into a tube.
     */
    client . connect ( null , function ( err , conn ) { // Attempt to connect to the Beanstalk server.

        if ( err ) { // Check if there was an error during the connection attempt.

            // If an error occurred, log the producer connection error along with the error details.
            sys . puts ( 'Producer connection error:' , sys , inspect ( err ) ) ;

        } else {

            // No error, connection was successful.
            // Further producer operations will be performed here.
        }

        sys . puts ( 'Producer connected' ) ; // Inform that the producer has successfully connected.

        return conn . use ( 'test' , function () { // Instruct the connection to use the 'test' tube for subsequent operations.

            return conn . put ( 0 , 0 , 1 , 'hiben' , function ( err , job_id ) { // Put a job: priority 0, delay 0, TTR 1 second, data 'hiben'.

                // After putting the job, log the ID assigned to the new job.
                return sys . puts ( 'Producer sent job: ' + job_id ) ;

            } ) ; // End of conn.put callback.

        } ) ; // End of conn.use callback.

    } ) ; // End of producer client.connect callback.


    /*
     * This section of code implements the consumer logic.
     * It connects to the Beanstalk server, watches a specific tube, reserves a job, processes it, and then destroys it.
     */
    client . connect ( null , function ( err , conn ) { // Attempt to connect to the Beanstalk server for the consumer.

        if ( err ) { // Check for connection errors.

            // If an error occurred, log the consumer connection error and return.
            return sys . puts ( 'Consumer connection error:' , sys , inspect ( err ) ) ;

        } else {

            sys . puts ( 'Consumer connected' ) ; // Inform that the consumer has successfully connected.

            return conn . watch ( 'test' , function ( err ) { // Instruct the connection to watch the 'test' tube for jobs.

                return conn . reserve ( function ( err , job_id , data ) { // Reserve a job from the watched tube.

                    sys . puts ( 'Consumer got job: ' + job_id ) ; // Log the ID of the job that was reserved.
                    sys . puts ( '  job data: ' + data ) ; // Log the data payload of the reserved job.

                    return conn . destroy ( job_id , function ( err ) { // Destroy the job after it has been processed.

                        // Log that the job has been successfully destroyed.
                        return sys . puts ( 'Consumer destroyed job: ' + job_id ) ;

                    } ) ; // End of conn.destroy callback.

                } ) ; // End of conn.reserve callback.

            } ) ; // End of conn.watch callback.

        } // End of else block for consumer connection.

    } ) ; // End of consumer client.connect callback.

} ) ( ) ; // Invoke the anonymous function immediately after its definition. This completes the script execution.