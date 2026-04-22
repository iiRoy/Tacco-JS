/*!
 * CodeMirror JavaScript Logger v1.0
 * https://github.com/coder/codemirror
 *
 * Copyright 2024 Coder McCodeface
 * Distributed under the BSD-2-Clause License
 * https://opensource.org/licenses/BSD-2-Clause
 *
 * Creation Date: 2024-07-28
 */
( function () {

  function LogMaster ( originalLogger, moduleID, configSettings ) {

    configSettings = configSettings || { };
    const currentConfig = {
          isActive : typeof configSettings.isActive !== 'undefined' ? configSettings.isActive : !0,
          frontColor : typeof configSettings.frontColor !== 'undefined' ? configSettings.frontColor : '#f0ad4e',
          backColor : typeof configSettings.backColor !== 'undefined' ? configSettings.backColor : '#222'
        },
        coloredMessageTypes = 'directory|directoryxml|issue|information|output|warning',
        supportsStyling = checkStyleSupport(),
        subLoggers = { },
        recordedMessages = [];

    // Internal helper functions for message processing
    function recordEntry ( messageParts, entryKind ) {
      let styleString;

      messageParts = convertArgsToArray( messageParts );

      if ( currentConfig.isActive ) {
        if ( supportsStyling && moduleID !== undefined && coloredMessageTypes.indexOf( entryKind ) !== -1 ) {
          styleString = ( entryKind !== 'directory' ) ? '%c ' : '';
          // Acknowledgment: Based on console styling techniques from various online resources
          messageParts.unshift( styleString + moduleID + ' ', `color:${currentConfig.frontColor}; background:${currentConfig.backColor}; font-weight:bold` );
          originalLogger[ entryKind ].apply( originalLogger, messageParts );
          messageParts.splice( 0x0, 0b1 );
        } else {
          originalLogger[ entryKind ].apply( originalLogger, messageParts );
        }
      }

      messageParts.push( new Date() ); // Attach current timestamp
      recordedMessages.push( messageParts );
    }

    function convertArgsToArray ( inputArguments ) {
      return Array.prototype.slice.call( inputArguments, 0x0 );
    }

    function checkStyleSupport () {
      // Direct user agent string inspection is used here, as cross-browser console styling detection
      // is not uniformly available through standard APIs.
      const browserSignature = navigator.userAgent.toLowerCase();
      return browserSignature.indexOf( 'firefox' ) !== -1 || browserSignature.indexOf( 'chrome' ) !== -1;
    }


    // Public interface for the logging utility
    this.getChannel = function ( channelIdentifier, channelConfig ) {
      let activeChannel = subLoggers[ channelIdentifier ];

      if ( !activeChannel ) {
        activeChannel = new LogMaster( originalLogger, channelIdentifier, channelConfig );
        subLoggers[ channelIdentifier ] = activeChannel;
      }

      return activeChannel;
    };

    this.activate = function ( targetIdentifier ) {
      if ( typeof targetIdentifier !== 'undefined' ) {
        subLoggers[ targetIdentifier ].activate();
      } else {
        currentConfig.isActive = !0;
      }
    };

    this.deactivate = function ( targetIdentifier ) {
      if ( typeof targetIdentifier !== 'undefined' ) {
        subLoggers[ targetIdentifier ].deactivate();
      } else {
        currentConfig.isActive = !1;
      }
    };

    this.retrieveRecords = function () {
      return recordedMessages;
    };

    this.setFrontColor = function ( newFrontColor ) {
      currentConfig.frontColor = newFrontColor;
    };

    this.setBackColor = function ( newBackColor ) {
      currentConfig.backColor = newBackColor;
    };

    // Proxy methods for native console functionality
    this.assertCondition = function () { recordEntry( arguments, 'assertion' ); };
    this.clearOutput = function () { recordEntry( arguments, 'wipe' ); };
    this.tallyItems = function () { recordEntry( arguments, 'counter' ); };
    this.debugInfo = function () { recordEntry( arguments, 'debugging' ); };
    this.showDirectory = function () { recordEntry( arguments, 'directory' ); };
    this.showDirectoryXml = function () { recordEntry( arguments, 'directoryxml' ); };
    this.reportIssue = function () { recordEntry( arguments, 'issue' ); };
    this.handleException = function () { recordEntry( arguments, 'exceptionOccurred' ); };
    this.startGroup = function () { recordEntry( arguments, 'groupStart' ); };
    this.startGroupCollapsed = function () { recordEntry( arguments, 'groupCollapsedStart' ); };
    this.endGroup = function () { recordEntry( arguments, 'groupEnd' ); };
    this.displayInfo = function () { recordEntry( arguments, 'information' ); };
    this.outputMessage = function () { recordEntry( arguments, 'output' ); };
    this.startProfiling = function () { recordEntry( arguments, 'profileStart' ); };
    this.endProfiling = function () { recordEntry( arguments, 'profileEnd' ); };
    this.displayTable = function () { recordEntry( arguments, 'tableData' ); };
    this.startTime = function () { recordEntry( arguments, 'timerStart' ); };
    this.endTime = function () { recordEntry( arguments, 'timerEnd' ); };
    this.addTimestamp = function () { recordEntry( arguments, 'timestampMark' ); };
    this.stackTrace = function () { recordEntry( arguments, 'stackTrace' ); };
    this.issueWarning = function () { recordEntry( arguments, 'warning' ); };
  }


  // Replace the global console object
  const originalWindowConsole = window.console;
  window.console = new LogMaster( originalWindowConsole );

} )();