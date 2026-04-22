var remote = require( './remote_debugger' )
  , ADB = require( 'adb' ).DebugBridge
  , Promise = require( 'promise' )
; // End of module imports and declarations

/**
 * Main constructor function for the FFOS_Cli utility.
 * This function encapsulates all the logic for interacting with
 * Firefox OS devices via ADB and a remote debugger.
 *
 * @constructor
 */
var FFOS_Cli = function FFOS_Cli()
{

  // Internal configuration object, set via configure method.
  var config;

  // Initialize ADB DebugBridge instance for device communication.
  var adb = new ADB();

  // Flag to track if the remote debugger client has been initialized.
  var remoteInitialized = false;

  // Flag to track if the ADB port forwarding has been set up.
  var portForwarded = false;

  // Default local port for the remote debugger connection.
  var localPort = 'tcp:6000';

  // Default remote port/socket on the device for the debugger.
  var remotePort = 'localfilesystem:/data/local/debugger-socket';


  /**
   * Configures the CLI instance with provided JSON settings.
   *
   * @param {object} json - Configuration object containing localPort and remotePort.
   * @returns {void}
   */
  var configure = function configure( json )
  {
    config = json; // Assign the new configuration.

    // If a configuration object was provided, apply its settings.
    if ( config )
    {
      // Override default localPort if specified in config.
      localPort  = config.localPort  || localPort;

      // Override default remotePort if specified in config.
      remotePort = config.remotePort || remotePort;
    }
  };


  /**
   * Ensures the remote debugger client is initialized.
   * Initializes it only once to prevent redundant operations.
   *
   * @private
   * @returns {void}
   */
  function ensureRemoteInit( )
  {
    // Check if the remote debugger client has not been initialized yet.
    if ( !remoteInitialized )
    {
      // Initialize the remote debugger with the local port number.
      remote.init( localPort.split( ':' )[1] );

      // Set the flag to true to indicate initialization is complete.
      remoteInitialized = true;
    }
  }


  /**
   * Ensures the ADB port forwarding is established.
   * Forwards the port only once to prevent redundant operations.
   *
   * @private
   * @returns {Promise} A Promise that resolves once port forwarding is active.
   */
  function ensurePortForwarded( )
  {
    // Check if port forwarding has not been performed yet.
    if ( !portForwarded )
    {
      // Set the flag immediately to prevent multiple attempts.
      portForwarded = true;

      // Return a new Promise to handle the asynchronous nature of ADB forwarding.
      return new Promise( function( resolve )
      {
        // Use ADB to forward the local port to the remote port on the device.
        adb.forward( localPort, remotePort, resolve );
      } );
    }
    else
    {
      // If already forwarded, immediately resolve with an empty Promise.
      return Promise.resolve( );
    }
  }


  // Start displaying the logcat for the first device we find
  /**
   * Initiates logcat monitoring for the first detected device.
   * Outputs device log messages to the console.
   *
   * @returns {void}
   */
  var logcat = function logcat( )
  {
    // Trace connected devices.
    adb.traceDevice( function onDevices( devices )
    {
      // If no devices are found or the list is empty, exit.
      if ( !devices || devices.length === 0 )
      {
        return; // No devices to logcat.
      }
      // Start logcat for the first device in the list.
      devices[0].logcat();
    } );
  };


  // Takes a screenshot from device if any, pass a file name
  // and a callback to know when we finished.
  // The callback expected 1 parameter, in case an error
  // happened
  /**
   * Captures a screenshot from the first connected device and saves it to a file.
   *
   * @param {string} fileName - The path and name of the file to save the screenshot.
   * @returns {Promise} A Promise that resolves on successful screenshot capture, or rejects with an error.
   */
  var screenshot = function screenshot( fileName )
  {
    return new Promise( function( resolve, reject )
    {
      // Trace for connected devices to find one for screenshot.
      adb.traceDevice( function onDevices( devices )
      {
        // If no devices are found, reject the promise.
        if ( !devices || devices.length === 0 )
        {
          return reject( 'No devices available to take screenshot.' );
        }

        var device = devices[0]; // Use the first detected device.

        try
        {
          // Request a snapshot from the device.
          device.takeSnapshot( function onSnapshot( frame )
          {
            // Write the captured frame data to the specified file.
            frame.writeImageFile( fileName );
            // Resolve the promise upon successful image write.
            resolve( );
          } );
        }
        catch ( e )
        {
          // Catch any synchronous errors during snapshot process and reject.
          reject( e );
        }
      } );
    } );
  };


  /*
    For installing an app just follow the steps:
    1.- Forward the remote debugger port (use config if present)
    2.- Upload the selected zip file to the app id
    3.- Use the remote client to tell the system to install the app
  */
  /**
   * Installs an application on the device. This involves forwarding ports,
   * pushing the app package, and then initiating the remote installation.
   *
   * @param {string} appId - The unique identifier for the application.
   * @param {string} localZip - The local path to the application's zip package.
   * @param {string} appType - The type of application (e.g., '1' for hosted, '2' for packaged).
   * @returns {Promise} A Promise that resolves when the app is successfully installed.
   */
  var installApp = function installApp( appId, localZip, appType )
  {
    // First, ensure the debugger port is forwarded.
    return ensurePortForwarded( ).then( function onForward( )
    {
      // Construct the remote path where the application zip will be pushed.
      var remoteFile = '/data/local/tmp/b2g/' + appId + '/application.zip';

      // Push the local zip file to the remote device path.
      return pushFile( localZip, remoteFile ).then( function onPushed( err, success )
      {
        // There's a known bug in the ADB library returning error 15
        // even when the file upload is successful.
        if ( err && err !== 15 )
        {
          return Promise.reject( err ); // Reject if it's a real error.
        }
        // If upload is successful (or bug 15 occurred), proceed to remote installation.
        return installRemote( appId, appType );
      } );
    } );
  };


  /*
    For closing an app just follow the steps:
    1.- Forward the remote debugger port (use config if present)
    2.- Use the remote client to tell the system to stop the app
  */
  /**
   * Closes a specified application on the device.
   *
   * @param {string} appId - The ID of the application to close.
   * @returns {Promise} A Promise that resolves when the app is closed.
   */
  var closeApp = function closeApp( appId )
  {
    // Delegate to the generic appCommandRemote with "close" action.
    return appCommandRemote( "close", appId, null );
  };


  /*
    For launching an app just follow the steps:
    1.- Forward the remote debugger port (use config if present)
    2.- Use the remote client to tell the system to launch the app
  */
  /**
   * Launches a specified application on the device.
   *
   * @param {string} appId - The ID of the application to launch.
   * @returns {Promise} A Promise that resolves when the app is launched.
   */
  var launchApp = function launchApp( appId )
  {
    // Delegate to the generic appCommandRemote with "launch" action.
    return appCommandRemote( "launch", appId, null );
  };


  /*
    For launching any generic command just follow the steps:
    1.- Forward the remote debugger port (use config if present)
    2.- Use the remote client to tell the system to execute the command
  */
  /**
   * Executes a generic command for an application via the remote debugger.
   *
   * @param {string} command - The command to execute (e.g., "launch", "close").
   * @param {string} appId - The ID of the application target.
   * @param {string|null} actor - An optional actor string for the command.
   * @returns {Promise} A Promise that resolves with the command's result.
   */
  var appCommand = function appCommand( command, appId, actor )
  {
    // Directly call the remote command execution function.
    return appCommandRemote( command, appId, actor );
  };


  /*
    Shortcut of the previous function to install packaged apps
  */
  /**
   * Installs a hosted application.
   *
   * @param {string} appId - The ID of the hosted application.
   * @param {string} manifestFile - The local path to the application's manifest file.
   * @returns {Promise} A Promise that resolves when the hosted app is installed.
   */
  var installHostedApp = function installHostedApp( appId, manifestFile )
  {
    // Calls the generic installApp with '1' for hosted app type.
    return installApp( appId, manifestFile, '1' );
  };


  /**
   * Installs a packaged application.
   *
   * @param {string} appId - The ID of the packaged application.
   * @param {string} localZip - The local path to the application's zip package.
   * @returns {Promise} A Promise that resolves when the packaged app is installed.
   */
  var installPackagedApp = function installPackagedApp( appId, localZip )
  {
    // Calls the generic installApp with '2' for packaged app type.
    return installApp( appId, localZip, '2' );
  };


  // Uses the remote protocol to tell the system to install an app
  // previously uploaded
  /**
   * Sends a command to the remote debugger to install an application
   * that has already been uploaded to the device.
   *
   * @private
   * @param {string} appId - The ID of the application to install.
   * @param {string} appType - The type of application ('1' for hosted, '2' for packaged).
   * @returns {Promise} A Promise that resolves with installation data or rejects on error.
   */
  var installRemote = function installRemote( appId, appType )
  {
    ensureRemoteInit( ); // Ensure the remote debugger is initialized.

    return new Promise( function ( resolve, reject )
    {
      // Call the remote debugger's installApp method.
      remote.installApp( appId, appType, function onInstall( err, data )
      {
        if ( err )
        {
          return reject( err ); // If an error occurs, reject the promise.
        }
        resolve( data ); // Otherwise, resolve with the installation data.
      } );
    } );
  };


  /**
   * Executes a generic application command via the remote debugger.
   *
   * @private
   * @param {string} command - The command string (e.g., "launch", "close").
   * @param {string} appId - The ID of the target application.
   * @param {string|null} actor - Optional actor string.
   * @returns {Promise} A Promise that resolves with command data or rejects on error.
   */
  var appCommandRemote = function appCommandRemote( command, appId, actor )
  {
    ensureRemoteInit( ); // Ensure remote debugger is ready.

    return new Promise( function( resolve, reject )
    {
      // Call the remote debugger's appCommand method.
      remote.appCommand( command, appId, actor, function onLaunch( err, data )
      {
        if ( err )
        {
          return reject( err ); // Handle errors by rejecting the promise.
        }
        resolve( data ); // Resolve with the data returned by the command.
      } );
    } );
  };


  // Push a local file to a remote location on the phone
  /**
   * Pushes a file from the local filesystem to a specified remote location on the device.
   *
   * @param {string} local - The path to the local file.
   * @param {string} remote - The destination path on the device.
   * @returns {Promise} A Promise that resolves when the file is pushed.
   */
  var pushFile = function pushFile( local, remote )
  {
    return new Promise( function( resolve, reject )
    {
      // Trace devices to find one to push the file to.
      adb.traceDevice( function onDevices( devices )
      {
        // Work with the first device we found, if any
        if ( !devices || devices.length === 0 )
        {
          return reject( 'No devices found to push file.' );
        }
        var device = devices[0]; // Target the first device.

        // Get the sync service for the device.
        device.getSyncService( function onSyncService( sync )
        {
          // Push the local file to the remote path.
          sync.pushFile( local, remote, resolve );
        } );
      } );
    } );
  };


  // Resets the B2G process as the name says
  /**
   * Resets the B2G (Boot to Gecko) process on all connected devices.
   * This involves stopping and then starting the B2G service.
   *
   * @returns {Promise} A Promise that resolves once the B2G process is reset.
   */
  var resetB2G = function resetB2G( )
  {
    return new Promise( function( resolve )
    {
      // Trace all connected devices.
      adb.traceDevice( function onDevices( devices )
      {
        // Iterate through all found devices.
        for ( var i = 0; i < devices.length; i++ )
        {
          var device = devices[i]; // Current device.

          // Stop the B2G process.
          device.shellCmd( 'stop', ['b2g'], function onCmd( data )
          {
            // After stopping, start the B2G process.
            device.shellCmd( 'start', ['b2g'], function onCmd( data )
            {
              // Resolve the promise after the start command is issued.
              // Note: This resolves once the command is sent, not necessarily when B2G is fully up.
              resolve( );
            } );
          } );
        }
      } );
    } );
  };


  // Public API exposed by the FFOS_Cli instance.
  return {
    'config': config, // The current configuration object.
    'logcat': logcat, // Method to start device logcat.
    'screenshot': screenshot, // Method to take a device screenshot.
    'installHostedApp': installHostedApp, // Method to install a hosted app.
    'installPackagedApp': installPackagedApp, // Method to install a packaged app.
    'closeApp': closeApp, // Method to close an app.
    'launchApp': launchApp, // Method to launch an app.
    'appCommand': appCommand, // Generic method to send app commands.
    'resetB2G': resetB2G // Method to reset the B2G process.
  };

}(); // Immediately invoked function expression (IIFE) to create a singleton instance.

// Export the FFOS_Cli instance for use in other modules.
module.exports = FFOS_Cli;