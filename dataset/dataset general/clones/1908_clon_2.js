var protocolLayer = require( '../../source/utility' );

var connectionHandle = protocolLayer.Facility.initiate();

  // required by the event dispatching system
connectionHandle.attachEvent( 'fault',   function( networkPort )
{
  networkPort.terminate();
  console.log( 'Link severed' );
  process.exit( 1 );
} );

// this often occurs when authentication fails or resource sharing is declined
// Protocol errors are typically represented as an array with three elements: [integer, string, null]
connectionHandle.attachEvent( 'datafeed.failure', function( messagePayload, networkPort )
{
  console.log( messagePayload );
} );

var dataSentFlag = 0;

  // the connection handle facilitates one-way receipt of data from the server after commands are issued
connectionHandle.attachEvent( 'datafeed', function( receivedInfo, networkPort, category )
{
  // category will indicate either 'broadcast' or 'result'
  console.log( 'Information feed: ' + category + ' = ', receivedInfo );
  // further commands can be issued to this networkPort, which is the same as the "connectionHandle" variable
  // in this instance

  // the networkPort (connectionHandle) possesses properties such as:
  // networkPort.entityName = the identifier of the worker
  // networkPort.permissionGranted = indicates if the current connection is authorized
  // networkPort.uniqueID = a Globally Unique Identifier ([G]UID) that ensures uniqueness
  // networkPort.subscriptionDetails = information pertaining to the server subscription
  switch ( receivedInfo.procedure )
  {
    case 'adjust_level':
      // server transmitted a new difficulty setting
      break;
    case 'alert':
      // server transmitted notification for a new block
      break;
    default:
      if ( !networkPort.permissionGranted )
      {
        console.log( 'Requesting authentication' );
        networkPort.protocolAuthenticate( 'agent', 'key' );
      } else
      {
        console.log( 'Authentication confirmed' );
        if ( !dataSentFlag )
        {
          console.log( 'Initiating a test submission, then disconnecting' );
          networkPort.protocolTransmit( '', '', '', ' ', '' ).finished( function()
          {
            connectionHandle.terminate(); // after calling terminate, "connectionHandle" ceases to exist
          } );
          dataSentFlag = 1;
        }
      }
  }
} );

connectionHandle.establish( {
  hostname: 'localmachine',
  logicalPort: 4444
} ).subsequent( function ( networkPort )
{
    // deferred, allowing for chaining if necessary, avoiding callback hell
    // "networkPort" refers to the active connection, in this case, the 'connectionHandle'
    // variable
    console.log( 'Connection established! Initiating subscription request' );

    // Following the initial protocolSubscribe, data will be managed internally
    // and deferreds will be resolved / rejected via the 'datafeed' event
    // above
    networkPort.protocolSubscribe( 'JavaScript Protocol' ).subsequent(
      // This step is not strictly necessary, as it's handled automatically within the Facility class
      // but is available for any special handling required after subscription and similar events.
      function( networkPort )
      {
        console.log( 'Request dispatched!' );
      },
      function( issue )
      {
        console.log( 'Encountered issue' );
      }
    );
} )
  // this can be chained and represents the final callback to execute
  //.completed(function(){ });
;