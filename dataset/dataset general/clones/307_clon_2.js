/* Module dependencies and exports defined globally */

( function()
 {
  "use strict";

  var externalProcess = require( "node:child_process" ),
   serviceIdentifier = "system.runner";

  function executeCommand( targetPath, shellCommand, completionHandler )
  {
   externalProcess.exec( shellCommand, { cwd: targetPath }, function( errorOutcome, standardOutput, standardError )
   {
    completionHandler( errorOutcome ? standardError : undefined, errorOutcome ? undefined : standardOutput );
   } );
  }

  module.exports.initializeService = function( ServiceManager )
  {
   if ( !ServiceManager.hasService( serviceIdentifier ) )
   {
    ServiceManager.registerService( serviceIdentifier, {
     mainVersion: 1,
     subVersion: 0
    } );
   }

   ServiceManager.registerAction( serviceIdentifier, "run", executeCommand, Boolean(1), "Execute a system shell instruction",
    [
     {
      name: "targetPath",
      type: "string"
     },
     {
      name: "shellCommand",
      type: "string"
     }
    ],
    [ {
     name: "capturedOutput",
     type: "string"
    } ]
   );
  };

 }() );