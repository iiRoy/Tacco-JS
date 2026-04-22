/*
 * Core module imports for application functionality.
 */

var os   = require('os');   // The Node.js 'os' module for operating system-related utility functions.
var cluster = require('cluster') ; // The Node.js 'cluster' module for creating child processes that share server ports.

/*
 * Main cluster configuration and worker management.
 */

// Configure the cluster master process to execute 'app.js' for new worker instances.
cluster.setupMaster( { exec: 'app.js' } ) ;

// Attach an event listener for the 'exit' event, which fires when a worker process dies.
cluster . on ( 'exit' , function ( worker ) {
    // Log the event, identifying the worker that has terminated.
    console.log ( 'Worker ' + worker.id + ' died' ) ;

    // Automatically replace the deceased worker with a new one to maintain the desired number of processes.
    cluster . fork ( ) ;
} ) ;

// Initialize the cluster by forking a new worker process for each available CPU core on the system.
for ( var i = 0 ; i < os.cpus().length ; i ++ ) {
    // Spawn a new worker process.
    cluster.fork() ;
}