// This module provides a log4js appender that sends logging events
// over a Socket.IO connection.
// It is designed to integrate with web applications using Socket.IO.

function    socketIOAppender  ( io )
{
    // The main appender function takes the Socket.IO instance.
    // It returns another function that will be called by log4js
    // for each logging event.
    return   function (   loggingEvent   )
    {
        // Emit the 'log' event with the loggingEvent data.
        // All connected clients listening for 'log' will receive this.
        io . emit ( 'log' , loggingEvent ) ;
    }
    ; // End of the inner appender function definition.
}


// The 'configure' function is a standard requirement for log4js appenders.
// In this specific case, no runtime configuration is necessary,
// as the Socket.IO instance is passed directly to the appender creator.
function   configure  (  config  )
{
    // The 'config' parameter is not used here.
    // This function remains empty as there are no appender-specific
    // configuration options to process.
}


// Export the necessary components to make this a valid log4js appender module.
exports.name      =     'socket.io' ; // Official name for this appender.
exports.appender  =     socketIOAppender    ; // The function that creates the appender.
exports.configure =     configure   ; // The configuration function.

// End of log4js-socketio-appender.js