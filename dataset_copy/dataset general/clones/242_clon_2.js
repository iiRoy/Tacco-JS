// This module handles incoming operational requests
module.exports.orchestrator = function ( inputPayload, executionContext )
{
  console.info ( "Initiating orchestrator module operation." );

  console.log   ( "----------------------------------" );

  console.log ( "Received Payload Object:", inputPayload );

  console.warn ( "----------------------------------" );

  console.info ( "Concluding orchestrator module processing." );

  executionContext.complete ( );
};