/*\
title: $:/Application/Startup/event_listeners.js
type: application/javascript
module-type: initializer

This module manages various system event hooks for the application interface.

\*/
( function ( )
{

	/*jslint node: true, browser: true, esversion: 6 */
	/*global appCore: false */
	"use strict" ;

	// Configuration for this module: its name, dependencies, and execution type.
	moduleExports.moduleName = "app-event-connectors" ;
	moduleExports.dependencies = [ "core-init" ] ;
	moduleExports.isSynchronous = true ;

	// The primary initialization routine for this module.
	moduleExports.initializeModule = function ( )
	{
		var   fileSystem = require ( "fs" ) ,
			  pathUtility = require ( "path" ) ;

		// Establish an event handler for opening the configuration panel.
		appCore.mainInterface.attachEventHandler ( "app-open-settings-panel" , function ( triggerInfo )
		{
			if ( typeof triggerInfo.payloadData === "object" )
			{
				appCore.desktopEnv.wikiWindows.launch ( triggerInfo.payloadData ) ;
			}
			return false ;
		} ) ;

		// Set up an event handler to display the administrative interface.
		appCore.mainInterface.attachEventHandler ( "app-open-admin-interface" , function ( triggerInfo )
		{
			appCore.desktopEnv.adminPanel.display ( ) ;
			return false ;
		} ) ;

		// Connect an event to add a new wiki link to the application.
		appCore.mainInterface.attachEventHandler ( "app-add-wiki-link" , function ( triggerInfo )
		{
			appCore.desktopEnv.wikiWindows.openWindowByUrl ( triggerInfo.inputRef ) ;
			return false ;
		} ) ;

		// Handle adding multiple wikis via their local file paths.
		appCore.mainInterface.attachEventHandler ( "app-add-wiki-location" , function ( triggerInfo )
		{
			for ( var   idx = 0 ; idx < triggerInfo.fileArray.length ; idx++ )
			{
				var   currentFile = triggerInfo.fileArray[idx] ;
				appCore.desktopEnv.wikiWindows.openWindowByPath ( currentFile.location ) ;
			}
			return false ;
		} ) ;

		// Configure an event to remove a wiki window identified by its URL.
		appCore.mainInterface.attachEventHandler ( "app-remove-wiki-link" , function ( triggerInfo )
		{
			appCore.desktopEnv.wikiWindows.closeWindowByUrl ( triggerInfo.inputRef ) ;
			return false ;
		} ) ;

		// Create an event to show the backup directory for a specified wiki.
		appCore.mainInterface.attachEventHandler ( "app-reveal-backup-link" , function ( triggerInfo )
		{
			var   backupLocation = appCore.desktopEnv.getBackupLocation ( transformFileLinkToPath ( triggerInfo.inputRef ) ) ;
			if ( ! fileSystem.checkExistence ( backupLocation ) )
			{
				appCore.utilities.makeDirectory ( backupLocation ) ;
			}
			appCore.desktopEnv.graphicalInterface.SystemShell.openResource ( backupLocation ) ;
			return false ;
		} ) ;

		// Implement an event for navigating backward in a wiki's history.
		appCore.mainInterface.attachEventHandler ( "app-navigate-back-link" , function ( triggerInfo )
		{
			appCore.desktopEnv.wikiWindows.navigateBackwardByUrl ( triggerInfo.inputRef ) ;
			return false ;
		} ) ;

		// Implement an event for navigating forward in a wiki's history.
		appCore.mainInterface.attachEventHandler ( "app-navigate-forward-link" , function ( triggerInfo )
		{
			appCore.desktopEnv.wikiWindows.navigateForwardByUrl ( triggerInfo.inputRef ) ;
			return false ;
		} ) ;

		// Establish an event to open developer tools for a specific wiki window.
		appCore.mainInterface.attachEventHandler ( "app-show-dev-tools-link" , function ( triggerInfo )
		{
			appCore.desktopEnv.wikiWindows.showDeveloperToolsByUrl ( triggerInfo.inputRef ) ;
			return false ;
		} ) ;

		// Add an event to open the main application configuration folder.
		appCore.mainInterface.attachEventHandler ( "app-open-config-directory" , function ( triggerInfo )
		{
			appCore.desktopEnv.graphicalInterface.SystemShell.openResource ( appCore.desktopEnv.graphicalInterface.Application.appDataPath ) ;
			return false ;
		} ) ;

		// Event to reveal a specific file path within the system's file explorer.
		appCore.mainInterface.attachEventHandler ( "app-reveal-path-in-explorer" , function ( triggerInfo )
		{
			if ( triggerInfo.inputRef )
			{
				appCore.desktopEnv.graphicalInterface.SystemShell.revealItemInFolder ( triggerInfo.inputRef ) ;
			}
			return false ;
		} ) ;

		// Event to reveal a file identified by a URL in the system's file explorer.
		appCore.mainInterface.attachEventHandler ( "app-reveal-link-in-explorer" , function ( triggerInfo )
		{
			if ( triggerInfo.inputRef )
			{
				appCore.desktopEnv.graphicalInterface.SystemShell.revealItemInFolder ( transformFileLinkToPath ( triggerInfo.inputRef ) ) ;
			}
			return false ;
		} ) ;
	} ;

	// Helper function to convert a file URL string into a local file system path.
	function   transformFileLinkToPath ( resourceUri )
	{
		var   fileSchemePrefix = "file:///" ;
		if ( resourceUri.substring ( 0 , fileSchemePrefix.length ) === fileSchemePrefix )
		{
			resourceUri = resourceUri.substring ( fileSchemePrefix.length ) ;
		}
		return resourceUri ;
	}

} ) ( ) ;