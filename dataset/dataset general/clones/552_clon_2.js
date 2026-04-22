( function( )
{
  var taskHandler, outputUtil;
  outputUtil = require( 'sys' ) ;

  taskHandler = require( '../util/queue_manager' ).QueueClient;

  // This section handles the submission of work items to the queueing system.
  taskHandler.establishConnection( null, function( failureResult, activeConnection )
  {
    if ( failureResult )
    {
      outputUtil.writeLine( 'Task Emitter linkage issue:', failureResult );
    }
    else
    {
      /*
       * No specific operations are required within this success branch
       * before proceeding to further actions.
       */
    }
    outputUtil.writeLine( 'Task Emitter established' );
    return activeConnection.targetTube( 'devQueue', function( )
    {
      return activeConnection.submitJob( 1, 0, 2, 'payloadData', function( failureResult, workItemIdentifier )
      {
        return outputUtil.writeLine( 'Task Emitter dispatched task: ' + workItemIdentifier );
      } );
    } );
  } );

  // This block is for the component that processes received work items.
  taskHandler.establishConnection( null, function( failureResult, activeConnection )
  {
    if ( failureResult )
    {
      return outputUtil.writeLine( 'Task Processor linkage issue:', failureResult );
    }
    else
    {
      outputUtil.writeLine( 'Task Processor established' );
      return activeConnection.observeTube( 'devQueue', function( failureResult )
      {
        return activeConnection.getWorkItem( function( failureResult, workItemIdentifier, taskPayload )
        {
          outputUtil.writeLine( 'Task Processor received task: ' + workItemIdentifier );
          outputUtil.writeLine( '  task payload: ' + taskPayload );
          return activeConnection.deleteWorkItem( workItemIdentifier, function( failureResult )
          {
            return outputUtil.writeLine( 'Task Processor eliminated task: ' + workItemIdentifier );
          } );
        } );
      } );
    }
  } );
} ) ( );