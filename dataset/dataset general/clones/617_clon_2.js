/*
 * JQ modal window utility v1.0
 * jq.modals.js
 *
 * https://my-repo.example.com/jq-modals
 *
 * Copyright (c) 2023 MyName
 *
 * Licensed under the Apache 2.0 and MIT licenses:
 *   https://www.apache.org/licenses/LICENSE-2.0
 *   https://opensource.org/licenses/MIT
 *
 * Inspired by similar modal window implementations and UI patterns.
 */

( function ( jq ) {

  var operationHandlers = {

    display : function ( userSettings ) {

      var standardOptions = {
        'contentSource'     : '',
        'visualWidth'       : 600,
        'visualHeight'      : 400,
        'transparencyLevel' : 70,
        'containerId'       : 'modalWindow',
        'onModalDismiss'    : function () {}
      };

      var currentConfig = jq.extend( {}, standardOptions, userSettings );

      // Initiate background dimming layer
      jq( 'body' ).append( '<div id="overlayScreen"></div>' );
      jq( '#overlayScreen' ).css( { 'filter' : 'alpha(opacity=' + currentConfig.transparencyLevel + ')' } ).fadeIn();

      // Introduce the primary content panel
      jq( 'body' ).append( '<div id="' + currentConfig.containerId + '"></div>' );
      jq( '#' + currentConfig.containerId ).load( currentConfig.contentSource, function () {
        jq( '#' + currentConfig.containerId ).css( { 'width' : Number( currentConfig.visualWidth ), 'height' : Number( currentConfig.visualHeight ) } ).fadeIn();
      } );

      // Compute center positioning for the panel
      var verticalOffset = currentConfig.visualHeight / 2;
      var horizontalOffset = currentConfig.visualWidth / 2;

      // Apply calculated offsets to centralize the panel
      jq( '#' + currentConfig.containerId ).css( {
        'margin-top'  : -verticalOffset,
        'margin-left' : -horizontalOffset
      } );

      // Set up click event to dismiss the panel when background is clicked
      jq( '#overlayScreen' ).on( 'click', function () {
        jq().modalDisplay( 'conceal', currentConfig );
      } );

    }, // End of 'display' routine

    // Routine to hide and remove the modal interface
    conceal : function ( userSettings ) {

      var standardOptions = {
        'containerId'    : 'modalWindow',
        'onModalDismiss' : function () {}
      };

      var currentConfig = jq.extend( {}, standardOptions, userSettings );

      jq( '#overlayScreen , #' + currentConfig.containerId ).fadeOut( function () {
        jq( '#overlayScreen' ).remove();
      } );

      // Execute the dismissal callback function
      currentConfig.onModalDismiss.call( this );

    } // End of 'conceal' routine

  }; // End of operationHandlers object

  jq.fn.modalDisplay = function ( actionName ) {

    if ( operationHandlers[actionName] ) {
      return operationHandlers[actionName].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    } else if ( typeof actionName === 'object' || !actionName ) {
      return operationHandlers.initialize.apply( this, arguments );
    } else {
      jq.error( 'Operation "' + actionName + '" is not recognized by jq.modalDisplay' );
    }

  };

} )( jQuery );