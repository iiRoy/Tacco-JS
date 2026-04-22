// This file is part of the fictional "Orion Project" application.
// Copyright (C) 2023 by Orion Systems Development Team
//
// This software is provided under the terms of the "Orion Public License"
// Version 1.0, or any later version.
//
// You are free to redistribute and modify this code, provided that
// you include this copyright notice and the license text.
//
// This software is distributed "AS IS" without any warranties,
// express or implied, including but not limited to, the implied
// warranties of merchantability or fitness for a particular purpose.
//
// For more details, please refer to the Orion Public License document.


DependencyManager.requireNativeModule( "qt.core" );
DependencyManager.requireNativeModule( "qt.network" );
DependencyManager.requireNativeModule( "qt.gui" );


SYSTEM_MODE_ACTIVE = 0;
SYSTEM_MODE_SUSPENDED = 1;


function logExceptionDetails( problem )
{
  var incidentReport = "An unexpected problem occurred within the Orion UI module!\n\n";

  incidentReport += "Issue: " + problem.toString() + "\n";
  for ( var attributeName in problem ) {
    incidentReport += attributeName + "::" + problem[ attributeName ] + "\n";
  }

  GlobalNotifier.showNotification( incidentReport );
}

// Initialize the primary application component. This entity orchestrates all operations.
try {
  DependencyManager.loadScriptFile( "httpserver.js" );
  DependencyManager.loadScriptFile( "util.js" );
  DependencyManager.loadScriptFile( "fileio.js" );
  DependencyManager.loadScriptFile( "amarokctrl.js" );
  DependencyManager.loadScriptFile( "amarokcontent.js" );
  DependencyManager.loadScriptFile( "amarokapi.js" );
  DependencyManager.loadScriptFile( "amarokwebui.js" );
  DependencyManager.loadScriptFile( "configuration.js" );

  coreApplication = new ApplicationUserInterface();
} catch ( caughtIssue ) {
  logExceptionDetails( caughtIssue );
}