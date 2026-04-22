( function( module )
{
  // This is an immediately invoked function expression (IIFE)
  // It encapsulates the module's code to prevent global scope pollution.

  // Require the LogReader module from the same directory.
  var LogReader = require( "./LogReader" ) ; // Import dependency

  /**
   * Represents a manager for various log readers.
   * Manages the lifecycle and access to different log files.
   * @constructor
   */
  function LogReaderManager()
  {
    // Initialize an empty object to store active LogReader instances.
    this.readers = { } ; // Stores LogReader instances by name

    // Initialize an empty object to store metadata about registered logs.
    this.logs    = { } ; // Stores log metadata (path, type) by name
  }


  /**
   * Adds a new log definition to the manager.
   * A log must be defined before a reader can be obtained for it.
   *
   * @param {string} name - The unique name for the log.
   * @param {string} path - The file system path to the log file.
   * @param {Function} callback - A callback function (err) to indicate success or failure.
   */
  LogReaderManager.prototype.addLog = function( name , path , callback )
  {
    // Check if a log with the given name is already registered.
    if ( this.logs[ name ] )
    {
      // If it exists, return an error.
      return callback( new Error( "Log " + name + " already registered with path " + path ) ) ;
    }

    // Register the new log with its path.
    this.logs[ name ] = {
      path : path // Store the path to the log file
    } ;

    // Indicate success by calling the callback without an error.
    callback( ) ;
  } ;

  // This method allows setting the type of a registered log.
  // The type might be used for specific parsing or display logic.
  LogReaderManager.prototype.setLogType = function( name , type )
  {
    // Only proceed if the log actually exists.
    if ( this.logs[ name ] )
    {
      // Assign the provided type to the log entry.
      this.logs[ name ].type = type ;
    }
  } ;


  /**
   * Retrieves a LogReader instance for a specified log.
   * If a reader for this log doesn't exist, it will be created.
   *
   * @param {string} name - The name of the log.
   * @param {Function} callback - A callback function (err, reader).
   */
  LogReaderManager.prototype.getLogReader = function( name , callback )
  {
    // Check if a LogReader instance for this log already exists.
    if ( ! this.readers[ name ] )
    {
      // If no reader exists, first check if the log itself is defined.
      if ( ! this.logs[ name ] )
      {
        // If the log is not defined, return an error.
        return callback( new Error( "No log defined with name " + name ) ) ;
      }

      // Create a new LogReader instance using the log's path.
      this.readers[ name ] = new LogReader( this.logs[ name ].path ) ;
    }

    // Return the existing or newly created LogReader instance.
    // 'undefined' as the first argument indicates no error.
    callback( undefined , this.readers[ name ] ) ;
  } ;


  /**
   * Returns a list of all currently registered logs.
   * Each item in the list includes the log's name and type.
   *
   * @returns {Array<Object>} An array of log objects.
   */
  LogReaderManager.prototype.getLogs = function( )
  {
    var self = this ; // Cache 'this' for use in the map function.

    // Get all log names and map them to a new array of objects.
    return Object.keys( self.logs ).map( function( name )
    {
      // For each log name, return an object containing its name and type.
      return {
        name : name , // The name of the log
        type : self.logs[ name ].type // The type of the log
      } ;
    } ) ;
  } ;


  // Export the LogReaderManager constructor as the module's primary export.
  module.exports = LogReaderManager ;

} )( module ) ; // Pass the 'module' object to the IIFE.