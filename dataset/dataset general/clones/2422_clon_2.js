// This file is part of the Communication System Framework.
//
// Copyright (c) 2023, GlobalComm Solutions.
// All rights reserved.
//
// This software is provided under the terms of the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/*
  Global utility references (assuming these are externally provided):
  global utilFxns, globalEnv, socketIoClient, urlFormatter, hashAlg
*/
( function() {

  // Define a simple utility functions object to mimic underscore/lodash where used
  var utilFxns = {
    isUndefined: function( value ) {
      return typeof value === 'undefined';
    },
    keys: function( obj ) {
      return Object.keys( obj );
    }
  };

  // Declarations for various application state variables and configurations
  var hostAddress, hostPort, clientAuthToken,
    wasConnectedEver = false,
    submitBtnLinked = false,
    activeSecret,
    secretSetFromExisting = false,
    initiateConnections, connectionContainer = {},
    reconnectAttempts, reconnectTimer,
    messageLog = [], logPointer = 0,
    pendingTransmissions = {}, transmissionSeqNum = 1,
    lastAliasChangeTime = 0, lastTransmissionTime = 0,
    initialBottomMargin,
    isDeactivated,
    permitVisualAlerts = true, isTitlePulsing = false, titlePulseTimer,
    defaultChannelAddressText = "[ loading channel name ]",
    currentChannelAddress = defaultChannelAddressText,
    participantIdentifier,
    isFreshSession = true, freshSessionTimer,
    secretEntryMode = false,
    appCore = {}; // Main application logic container

  // Initialize network parameters from global environment variables
  hostAddress = globalEnv.__communicationHost;
  hostPort = globalEnv.__communicationPort ? parseInt( globalEnv.__communicationPort, 10 ) : 80;
  clientAuthToken = globalEnv.__clientAuthToken;

  // Function to display a system-generated message to the user interface
  appCore.displaySystemMessage = function( textContent ) {
    appCore.processIncomingData( JSON.stringify( {
      alias: "system",
      identifier: 0,
      timestamp: new Date().getTime(),
      content: textContent
    } ) );
  };

  // Main handler for processing all incoming data from the server
  appCore.processIncomingData = function( rawMessageEnvelope ) {
    var receivedData = JSON.parse( rawMessageEnvelope );

    // Handle server shutdown notification
    if ( receivedData.closing ) {
      if ( connectionContainer.socket ) {
        connectionContainer.socket.disconnect();
      }
      if ( reconnectTimer ) {
        globalEnv.clearInterval( reconnectTimer );
      }
      reconnectTimer = globalEnv.setInterval( initiateConnections, 2000 );
      appCore.displaySystemMessage(
        "Server is shutting down. Attempting to reconnect once available." );
      return;
    }

    // Handle password authentication failure
    if ( receivedData.passwordFailed ) {
      if ( activeSecret && !secretSetFromExisting ) {
        appCore.transmitConnectionPayload( activeSecret );
        secretSetFromExisting = true;
      }
      else {
        appCore.requestSecurityCode();
      }
      return;
    }
    secretSetFromExisting = false;

    // Update channel URL if provided
    if ( receivedData.channelUrl ) {
      currentChannelAddress = receivedData.channelUrl;
    }

    // Assign participant ID and manage fresh session state
    if ( receivedData.participantId ) {
      participantIdentifier = receivedData.participantId;
      isFreshSession = true;
      if ( freshSessionTimer ) {
        globalEnv.clearTimeout( freshSessionTimer );
      }
      freshSessionTimer = globalEnv.setTimeout( function() {
        isFreshSession = false;
      }, 5000 );
    }

    // Configure visual alerts preference
    if ( !utilFxns.isUndefined( receivedData.alertSetting ) ) {
      permitVisualAlerts = receivedData.alertSetting === true;
    }

    // Set application language
    if ( receivedData.languageCode ) {
      appCore.configureLocale( receivedData );
    }

    // Display observer count
    if ( receivedData.observerCount ) {
      appCore.renderActiveObservers( receivedData );
    }

    // Display popular URLs
    if ( receivedData.topUrls ) {
      appCore.populateTopLinksDisplay( receivedData );
    }

    // Display active participants
    if ( receivedData.participants ) {
      appCore.presentParticipants( receivedData );
    }

    // If no message content, then just process control data
    if ( !receivedData.content ) {
      return;
    }

    // Write the message content to the DOM
    appCore.appendToMessageFeed( receivedData );
  };

  // Function to prompt the user for a password input
  appCore.requestSecurityCode = function() {
    var inputFieldElement, parentContainer, passwordInput;

    // Display a message indicating password requirement
    appCore.displaySystemMessage( "Please provide your security code" );

    inputFieldElement = globalEnv.document.getElementById( "comm_input_field" );
    inputFieldElement.style.display = "none";

    parentContainer = globalEnv.document.getElementById( "comm_input_container" );
    passwordInput = globalEnv.document.createElement( "input" );
    passwordInput.type = "password";
    passwordInput.id = "comm_secret_input";
    parentContainer.appendChild( passwordInput );

    // Attach event listener for 'keypress' on the password field
    passwordInput.addEventListener( "keypress", function( keyEvent ) {
      if ( keyEvent.which === 13 ) {
        parentContainer.removeChild( passwordInput );
        inputFieldElement.style.display = "";
        if ( connectionContainer.socket && connectionContainer.socket.connected ) {
          activeSecret = hashAlg.SHA256( passwordInput.value );
          appCore.transmitConnectionPayload( activeSecret );
        }
        else {
          appCore.displaySystemMessage( "Cannot send security code while disconnected." );
        }
        inputFieldElement.focus();
      }
    }, false );
    passwordInput.focus();
  };

  // Function to set the selected language in the UI dropdown
  appCore.configureLocale = function( settingsData ) {
    var languageSelector, selectedLang, optionsList, currentOption, iLoop, jLoop;

    languageSelector = globalEnv.document.getElementById( "comm_locale_selector" );
    selectedLang = settingsData.languageCode;
    optionsList = languageSelector.options;

    // Iterate through options to find and select the matching language
    for ( iLoop = 0, jLoop = optionsList.length; iLoop < jLoop; iLoop += 1 ) {
      currentOption = optionsList[ iLoop ];
      if ( currentOption.value === selectedLang ) {
        currentOption.selected = true;
        break;
      }
    }
  };

  // Function to display the count of active observers in the top bar
  appCore.renderActiveObservers = function( statusData ) {
    var mainTextSpan, linkElement, headerDisplayArea;

    headerDisplayArea = globalEnv.document.getElementById( "comm_header_display" );

    // Clear existing content in the header display
    while ( headerDisplayArea.hasChildNodes() ) {
      headerDisplayArea.removeChild( headerDisplayArea.lastChild );
    }

    mainTextSpan = globalEnv.document.createElement( "span" );
    mainTextSpan.textContent = statusData.observerCount + " Participants viewing ";

    linkElement = globalEnv.document.createElement( "a" );
    linkElement.textContent = currentChannelAddress;
    linkElement.href = "http://" + hostAddress + ":" + hostPort + "/log/" +
      globalEnv.encodeURIComponent( currentChannelAddress ) + "?offset=0";
    linkElement.target = "_blank";

    headerDisplayArea.appendChild( mainTextSpan );
    headerDisplayArea.appendChild( linkElement );
  };

  // Function to display a list of active participants in the info panel
  appCore.presentParticipants = function( participantData ) {
    var participantList, infoPanelBody;

    infoPanelBody = globalEnv.document.getElementById( "comm_info_body" );

    // Clear previous entries in the info panel
    while ( infoPanelBody.hasChildNodes() ) {
      infoPanelBody.removeChild( infoPanelBody.lastChild );
    }

    participantList = participantData.participants;

    // Iterate over participant data and create table rows
    utilFxns.keys( participantList ).forEach( function( userAlias ) {
      var tableRow, identifierValue, nameCell;

      tableRow = globalEnv.document.createElement( "tr" );
      tableRow.className = "comm_info_row";
      infoPanelBody.appendChild( tableRow );

      identifierValue = globalEnv.document.createElement( "td" );
      identifierValue.className = "comm_info_row_users";
      tableRow.appendChild( identifierValue );

      nameCell = globalEnv.document.createElement( "td" );
      nameCell.className = "comm_info_row_address";
      tableRow.appendChild( nameCell );

      identifierValue.textContent = participantList[ userAlias ];
      nameCell.textContent = userAlias;
    } );
  };

  // Function to display popular URLs in the info panel
  appCore.populateTopLinksDisplay = function( urlData ) {
    var infoPanelBody = globalEnv.document.getElementById( "comm_info_body" );

    // Clear existing entries
    while ( infoPanelBody.hasChildNodes() ) {
      infoPanelBody.removeChild( infoPanelBody.lastChild );
    }

    // Process each URL entry
    urlData.topUrls.forEach( function( linkInfo ) {
      var tableRow, linkAddressCell, linkElement, userCountCell;

      tableRow = globalEnv.document.createElement( "tr" );
      tableRow.className = "comm_info_row";
      infoPanelBody.appendChild( tableRow );

      userCountCell = globalEnv.document.createElement( "td" );
      userCountCell.className = "comm_info_row_users";
      tableRow.appendChild( userCountCell );

      linkAddressCell = globalEnv.document.createElement( "td" );
      linkAddressCell.className = "comm_info_row_address";
      tableRow.appendChild( linkAddressCell );

      linkElement = globalEnv.document.createElement( "a" );
      linkElement.className = "comm_info_row_address_link";
      linkAddressCell.appendChild( linkElement );

      userCountCell.textContent = linkInfo[ 1 ];
      linkElement.href = linkInfo[ 0 ];
      linkElement.textContent = linkInfo[ 0 ];
    } );
  };

  // Function to append a new message entry to the main message feed
  appCore.appendToMessageFeed = function( messageEntry ) {
    var isScrolledToBottom, feedParent, feedBody, entryRow, aliasCell,
      idCell, timeCell, messageContentCell;

    feedParent = globalEnv.document.getElementById( "comm_feed_container" );
    if ( !feedParent ) {
      return; // If the container is not found, the interface might be closed
    }

    feedBody = globalEnv.document.getElementById( "comm_feed_body" );
    entryRow = globalEnv.document.createElement( "tr" );
    aliasCell = globalEnv.document.createElement( "td" );
    idCell = globalEnv.document.createElement( "td" );
    timeCell = globalEnv.document.createElement( "td" );
    messageContentCell = globalEnv.document.createElement( "td" );

    // Remove message from pending transmissions if its sequence number matches
    if ( pendingTransmissions[ messageEntry.sequence ] ) {
      delete pendingTransmissions[ messageEntry.sequence ];
    }

    // Assign CSS classes for styling
    aliasCell.className = "comm_alias_cell";
    idCell.className = "comm_id_cell";
    timeCell.className = "comm_timestamp_cell";
    messageContentCell.className = "comm_message_cell";

    // Populate cell content
    aliasCell.textContent = messageEntry.alias;
    idCell.textContent = messageEntry.identifier;
    timeCell.textContent = new Date( messageEntry.timestamp ).toLocaleTimeString();
    timeCell.title = new Date( messageEntry.timestamp ).toLocaleDateString();
    appCore.formatAndAppendContent( messageContentCell, messageEntry.content );

    // Handle original message content for translated messages
    if ( messageEntry.originalContent ) {
      messageContentCell.title = messageEntry.originalContent;
      messageContentCell.className += " comm_translated_content";
    }
    entryRow.className = "comm_feed_entry";

    // Check if user is scrolled near the bottom before adding new message
    isScrolledToBottom = ( feedParent.scrollHeight - feedParent.clientHeight ) <
      ( feedParent.scrollTop + 5 );

    // Append elements to the DOM
    feedBody.appendChild( entryRow );
    entryRow.appendChild( aliasCell );
    entryRow.appendChild( idCell );
    entryRow.appendChild( timeCell );
    entryRow.appendChild( messageContentCell );

    // Scroll to bottom if user was already near the bottom
    if ( isScrolledToBottom ) {
      feedParent.scrollTop = feedParent.scrollHeight - feedParent.clientHeight;
    }

    // Trigger title flashing for new messages from other users
    if ( !isFreshSession && ( messageEntry.identifier !== 0 ) && ( messageEntry.identifier !== participantIdentifier ) ) {
      isTitlePulsing = true;
      appCore.animatePageTitle( false );
    }
  };

  // Helper function to format message content and append to a DOM element
  appCore.formatAndAppendContent = function( targetElement, messageText ) {
    urlFormatter( messageText, {
      callback: function( segmentText, segmentHref ) {
        var newElement;
        if ( segmentHref ) {
          newElement = globalEnv.document.createElement( "a" );
          newElement.href = segmentHref;
          newElement.target = "_blank";
          newElement.textContent = appCore.truncateLinkDisplay( segmentText );
          newElement.title = segmentText;
        }
        else {
          newElement = globalEnv.document.createElement( "span" );
          newElement.textContent = segmentText = appCore.breakLongWordsInMessage( segmentText );
        }
        targetElement.appendChild( newElement );
      }
    } );
  };

  // Truncates long link text for display purposes
  appCore.truncateLinkDisplay = function( rawLink ) {
    var processedText;
    if ( rawLink.length > 30 ) {
      processedText = rawLink.substring( 0, 15 ) + "\u2026" +
        rawLink.substring( rawLink.length - 15 );
    }
    else {
      processedText = rawLink;
    }
    return processedText;
  };

  // Processes message text to break long words with zero-width spaces
  appCore.breakLongWordsInMessage = function( rawTextContent ) {
    var transformedText;
    transformedText = rawTextContent.split( ' ' ).map( appCore.insertZeroWidthSpace ).join( ' ' );
    return transformedText;
  };

  // Inserts zero-width spaces into very long words to allow wrapping
  appCore.insertZeroWidthSpace = function( singleWord ) {
    var resultString = "";
    while ( singleWord.length > 10 ) {
      if ( singleWord.length > 20 ) {
        resultString += singleWord.substring( 0, 10 ) + "\u200B";
        singleWord = singleWord.substring( 10 );
      }
      else {
        resultString += singleWord;
        singleWord = "";
      }
    }
    resultString += singleWord;
    return resultString;
  };

  // Animates the browser tab title to alert the user of new activity
  appCore.animatePageTitle = function( alreadyFlashed ) {
    if ( permitVisualAlerts && isTitlePulsing && !titlePulseTimer ) {
      titlePulseTimer = globalEnv.setTimeout( function() {
        titlePulseTimer = null;
        globalEnv.document.title = "*!" +
          ( alreadyFlashed ? globalEnv.document.title.substring( 2 ) : globalEnv.document.title );
        titlePulseTimer = globalEnv.setTimeout( function() {
          titlePulseTimer = null;
          globalEnv.document.title = "* " + globalEnv.document.title.substring( 2 );
          appCore.animatePageTitle( true );
        }, 1000 );
      }, alreadyFlashed ? 1000 : ( 10 * 1000 ) );
    }
    else if ( !isTitlePulsing ) {
      globalEnv.clearTimeout( titlePulseTimer );
      if ( ( globalEnv.document.title.substring( 0, 2 ) === "*!" ) ||
        ( globalEnv.document.title.substring( 0, 2 ) === "* " ) ) {
        globalEnv.document.title = globalEnv.document.title.substring( 2 );
      }
    }
  };

  // Binds event listeners to the input field and send button
  appCore.linkInputControls = function() {
    if ( submitBtnLinked ) {
      return;
    }
    submitBtnLinked = true;

    var dispatchContent = function() {
      var inputElement = globalEnv.document.getElementById( "comm_input_field" ),
        outgoingMessage = {},
        messageText = inputElement.value,
        sequenceNumber,
        shouldSendText = true,
        shouldSendMessage = true;

      if ( messageText.trim().length === 0 ) {
        return;
      }

      // Command handling logic
      if ( messageText.match( /^set alias:/ ) ) {
        shouldSendText = false;
        appCore.extractAlias( outgoingMessage, messageText.substring( 10 ) );
      }
      else if ( messageText.match( /^\/name / ) ) {
        shouldSendText = false;
        appCore.extractAlias( outgoingMessage, messageText.substring( 6 ) );
      }
      else if ( ( messageText.match( /^\/exit/ ) ) ||
        ( messageText.match( /^\/leave/ ) ) ||
        ( messageText.match( /^\/close_app/ ) ) ) {
        appCore.deactivateInterface();
        return;
      }
      else if ( messageText.match( /^\/clear_log/ ) ) {
        appCore.purgeLog();
        shouldSendMessage = false;
        shouldSendText = false;
      }
      else if ( messageText.match( /^\/refresh/ ) ) {
        appCore.refreshInterface();
        return;
      }
      else if ( messageText.match( /^\/set_url/ ) ) {
        appCore.imposeChannelAddress( outgoingMessage );
        shouldSendText = false;
      }
      else if ( messageText.match( /^set log_depth:/ ) ) {
        shouldSendText = false;
        appCore.parseLogDepth( outgoingMessage, messageText.substring( 16 ) );
      }
      else if ( messageText.match( /^\/log_depth/ ) ) {
        shouldSendText = false;
        appCore.parseLogDepth( outgoingMessage, messageText.substring( 11 ) );
      }
      else if ( messageText.match( /^\/help_info/ ) ) {
        appCore.displayHelpInfo();
        shouldSendMessage = false;
        shouldSendText = false;
      }
      else if ( messageText.match( /^\/active_users/ ) ) {
        appCore.queryParticipants( outgoingMessage );
        shouldSendText = false;
      }
      else if ( messageText.match( /^\/min_size / ) ) {
        appCore.setMinChannelSize( outgoingMessage, messageText.substring( 10 ) );
        shouldSendText = false;
      }
      else if ( messageText.match( /^\/max_size / ) ) {
        appCore.setMaxChannelSize( outgoingMessage, messageText.substring( 10 ) );
        shouldSendText = false;
      }
      else if ( messageText.match( /^\/alerts / ) ) {
        appCore.setVisualAlerts( outgoingMessage, messageText.substring( 8 ) );
        shouldSendText = false;
      }
      else if ( messageText.match( /^\/set_secret/ ) ) {
        appCore.establishSecret();
        inputElement.value = "";
        outgoingMessage.content = messageText;
        messageLog.push( outgoingMessage );
        logPointer = messageLog.length;
        return;
      }
      else {
        appCore.grabMessage( outgoingMessage, messageText );
      }

      if ( shouldSendText ) {
        sequenceNumber = transmissionSeqNum;
        transmissionSeqNum += 1;
        outgoingMessage.sequence = sequenceNumber;
        outgoingMessage.content = messageText;
        pendingTransmissions[ sequenceNumber ] = outgoingMessage;
      }
      messageLog.push( outgoingMessage );
      logPointer = messageLog.length;

      if ( shouldSendMessage ) {
        if ( connectionContainer.socket && connectionContainer.socket.connected ) {
          connectionContainer.socket.send( JSON.stringify( outgoingMessage ) );
        }
      }
      if ( !shouldSendText ) {
        outgoingMessage.content = messageText;
      }
      inputElement.value = "";
      inputElement.focus();
    };

    globalEnv.document.body.addEventListener( "mousemove", function() {
      isTitlePulsing = false;
    }, false );
    globalEnv.document.getElementById( "comm_submit_button" ).addEventListener(
      "click", dispatchContent, false );
    globalEnv.document.getElementById( "comm_input_field" ).addEventListener( "keydown",
      function( keyboardEvent ) {
        var currentInputField = globalEnv.document.getElementById( "comm_input_field" );
        isTitlePulsing = false;
        if ( keyboardEvent.keyCode === 38 ) {
          if ( logPointer > 0 ) {
            logPointer -= 1;
            currentInputField.value = messageLog[ logPointer ].content;
          }
        }
        else if ( keyboardEvent.keyCode === 40 ) {
          if ( logPointer < messageLog.length - 1 ) {
            logPointer += 1;
            currentInputField.value = messageLog[ logPointer ].content;
          }
        }
        keyboardEvent.stopPropagation();
      }, false );
    globalEnv.document.getElementById( "comm_input_field" ).addEventListener( "keyup",
      function( keyboardEvent ) {
        keyboardEvent.stopPropagation();
      }, false );
    globalEnv.document.getElementById( "comm_input_field" ).addEventListener( "keypress",
      function( keyboardEvent ) {
        if ( keyboardEvent.which === 13 ) {
          dispatchContent();
        }
        keyboardEvent.stopPropagation();
      }, false );
  };

  // Function to extract and set the user's alias (name) with rate limiting
  appCore.extractAlias = function( messageObject, aliasText ) {
    var currentTime = new Date().getTime();
    if ( currentTime - lastAliasChangeTime > 10000 ) {
      messageObject.alias = aliasText.trim().substring( 0, 16 );
      lastAliasChangeTime = currentTime;
    }
    else {
      appCore.displaySystemMessage(
        "You can only modify your alias once every 10 seconds. Please wait!" );
    }
  };

  // Function to parse and set the message log depth (history count)
  appCore.parseLogDepth = function( messageObject, depthValueText ) {
    var historyCountString, parsedCountValue;
    historyCountString = depthValueText.trim();
    if ( historyCountString ) {
      parsedCountValue = globalEnv.parseInt( historyCountString, 10 );
      if ( !globalEnv.isNaN( parsedCountValue ) && ( parsedCountValue >= 0 ) ) {
        if ( parsedCountValue > 20 ) {
          parsedCountValue = 20;
        }
        messageObject.logDepthLimit = parsedCountValue;
      }
    }
  };

  // Placeholder functions for operations not fully defined in the original snippet
  appCore.transmitConnectionPayload = function( secret ) {
    // This would typically send a message to the server with connection details.
    globalEnv.console.log( "Transmitting connection payload with secret (placeholder):", secret );
  };

  appCore.grabMessage = function( messageObject, text ) {
    messageObject.content = text;
    globalEnv.console.log( "Grabbing message (placeholder):", text );
  };

  appCore.deactivateInterface = function() {
    globalEnv.console.log( "Deactivating interface (placeholder)" );
  };

  appCore.purgeLog = function() {
    globalEnv.console.log( "Purging log (placeholder)" );
  };

  appCore.refreshInterface = function() {
    globalEnv.console.log( "Refreshing interface (placeholder)" );
    globalEnv.location.reload();
  };

  appCore.imposeChannelAddress = function( msg ) {
    msg.forceChannel = true;
    globalEnv.console.log( "Imposing channel address (placeholder)" );
  };

  appCore.displayHelpInfo = function() {
    appCore.displaySystemMessage( "Available commands: /name, /exit, /clear_log, /refresh, /set_url, /log_depth, /active_users, /min_size, /max_size, /alerts, /set_secret" );
    globalEnv.console.log( "Displaying help info (placeholder)" );
  };

  appCore.queryParticipants = function( msg ) {
    msg.requestParticipants = true;
    globalEnv.console.log( "Querying participants (placeholder)" );
  };

  appCore.setMinChannelSize = function( msg, sizeText ) {
    msg.minSize = globalEnv.parseInt( sizeText, 10 );
    globalEnv.console.log( "Setting min channel size (placeholder):", msg.minSize );
  };

  appCore.setMaxChannelSize = function( msg, sizeText ) {
    msg.maxSize = globalEnv.parseInt( sizeText, 10 );
    globalEnv.console.log( "Setting max channel size (placeholder):", msg.maxSize );
  };

  appCore.setVisualAlerts = function( msg, settingText ) {
    msg.alertsEnabled = ( settingText.toLowerCase() === 'on' );
    globalEnv.console.log( "Setting visual alerts (placeholder):", msg.alertsEnabled );
  };

  appCore.establishSecret = function() {
    appCore.displaySystemMessage( "Please enter your new security code." );
    globalEnv.console.log( "Establishing new secret (placeholder)" );
  };

} )();