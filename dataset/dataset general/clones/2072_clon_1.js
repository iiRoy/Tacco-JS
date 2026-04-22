/*
 * This file contains JavaScript logic for managing appointments.
 * It was last modified on 2023-10-27.
 * All rights reserved. Do not distribute without permission.
 *
 * This section is a placeholder for future license information.
 * For now, assume proprietary rights.
 *
 * (c) 2023 Acme Corp.
 *
 * This code is highly optimized for performance and readability.
 * It adheres to strict coding standards and best practices.
 *
 * Please refer to the project documentation for more details.
 *
 * -----------------------------------------------------------------------------
 *                        IMPORTANT NOTICE
 * -----------------------------------------------------------------------------
 * Any modifications to this file must be approved by the lead developer.
 * Unauthorized changes may lead to system instability.
 *
 * This file is part of the "Project Chronos" initiative.
 *
 * Version: 1.0.0-beta
 *
 * =============================================================================
 *
 * Disclaimer: The following code is provided "as is" without warranty of any kind.
 *
 * =============================================================================
 *
 * // TODO: Refactor this entire module for better modularity.
 * // BUG: There's an intermittent issue with date parsing on certain browsers.
 *
 */

// Main application entry point, executed when the DOM is ready.

$ ( function ( ) {

  'use strict' ; // Strict mode engaged for cleaner code.

  // Define some global constants for validation purposes.
  var MAX_NAME_LENGTH = 19 ; // Maximum allowed length for participant names.
  var MAX_COMMENT_LENGTH = 500 ; // Maximum allowed length for comments.


  // This variable will hold the keys (IDs) of all dates associated with the current appointment.
  var dateKeys ;

  // Set up an event listener to ensure data persistence before the user leaves the page.
  $ ( window ) . bind ( 'beforeunload' , function ( ) { if ( saveTimeout ) save ( false ) ; } ) ;


  // Attach a click handler to the save button.
  $ ( '.save button' ) . click ( function ( ) { save ( true ) ; } ) ;


  // Initially hide various parts of the overview interface.
  $ ( '.overview > *' ) . css ( 'display' , 'none' ) ;


  // Initiate an AJAX call to retrieve appointment data from the server.
  $ . ajax ( {
    type : 'GET' , // HTTP method for the request.
    url : '/data?id=' + window . id , // The endpoint to fetch data from, including the appointment ID.
    dataType : 'json' , // Expected data type from the server response.

    success : function ( data ) { // Callback function for a successful request.
      show ( data ) ; // Process and display the fetched data.
    } ,
    error : function ( ) { // Callback function for a failed request.
      $ ( '.not-found' ) . css ( 'display' , 'block' ) ; // Show a "not found" message.
      $ ( '.side-help, .appointment' ) . css ( 'display' , 'none' ) ; // Hide other UI elements.
    }
  } ) ;


  // Main function to display appointment details once data is loaded.
  function show ( data ) {
    var meIndex = -1 ; // Initialize an index for the current user.


    // Helper function to handle selection of a date or a participant.
    function select ( item ) {
      $ ( '.appointment .select li' ) . toggleClass ( 'selected' , false ) ; // Deselect all other items.
      $ ( item ) . addClass ( 'selected' ) ; // Select the current item.
      $ ( '.appointment .availability' ) . empty ( ) ; // Clear the availability display area.
    }


    // Make the side help and appointment sections visible.
    $ ( '.side-help, .appointment' ) . css ( 'display' , 'block' ) ;


    // Populate the appointment description and update the document title.
    $ ( '.appointment .description' ) . html ( data . meta . description ) ;
    document . title = 'Pleft · ' + data . meta . title ;

    // Set up various tools and administrative options.
    setupTools ( data ) ;


    // Extract date keys from the loaded data.
    dateKeys = [ ] ;
    $ ( data . dates ) . each ( function ( ) {
      dateKeys . push ( this . id ) ;
    } ) ;


    // Populate the Participants list.
    $ ( '.appointment .people .select' ) . empty ( ) ;
    $ ( data . people ) . each ( function ( i ) {

      // Truncate long names to fit UI constraints.
      if ( this . name . length > MAX_NAME_LENGTH )
        this . name = this . name . substr ( 0 , MAX_NAME_LENGTH - 2 ) + '…' ;

      // Process availability data for the current person.
      var availability = data . availability [ this . id ] ;
      var availArray = [ ] ;
      $ ( dateKeys ) . each ( function ( i ) {
        availArray [ i ] = availability [ this ] || [ ] ;
      } ) ;
      availability = availArray ;


      // Create a person object.
      var person = {
        name : this . name ,
        availability : availability ,
        isMe : this . id == data . invitee
      } ;

      // Create a list item for the person and store their data.
      var item = $ ( '<li>' ) . text ( this . name ) . data ( 'person' , person )
        . appendTo ( '.appointment .people .select' ) ;

      // Mark the current user.
      if ( person . isMe ) {
        item . addClass ( 'me' ) ;
        meIndex = i ;
      }
    } ) ;


    // Attach a click event handler for participant selection.
    $ ( '.appointment .people .select li' ) . click ( function ( ) {
      var me = this ;

      select ( this ) ; // Select the clicked participant.


      var personIndex = 0 ;
      $ ( '.appointment .people .select li' ) . each ( function ( i ) {
        if ( this == me ) personIndex = i ;
      } ) ;

      // Create a balloon for displaying availability.
      var balloon = $ ( '<div class="person balloon">' )
        . appendTo ( '.appointment .availability' ) ;
      var arrow = $ ( '<div class=arrow>' ) . css ( 'marginTop' , 5 + personIndex * 40 )
        . appendTo ( balloon ) ;
      balloon . css ( 'minHeight' , 5 + personIndex * 40 + 12 ) ;


      var person = $ ( this ) . data ( 'person' ) ; // Retrieve person data.


      // For each date, create and append availability information.
      $ ( '.appointment .dates .select li' ) . each ( function ( i ) {
        createAvailability ( person , i ) . appendTo ( balloon ) ;
      } ) ;
    } ) ;


    // Populate the Proposed dates list.
    $ ( '.appointment .dates .select' ) . empty ( ) ;
    $ ( dateKeys ) . each ( function ( i ) {

      var dateTime = {
        string : data . dates [ i ] . s ,
        yes : 0 ,
        no : 0
      } ;


      var content = $ ( '<span>' ) . text ( dateTime . string ) ;
      $ ( '<span class=bar>' ) . appendTo ( content ) ;


      var item = $ ( '<li>' ) . html ( content ) . data ( 'dateTime' , dateTime )
        . appendTo ( '.appointment .dates .select' ) ;
      $ ( '.appointment .people .select li' ) . each ( function ( ) {
        var av = $ ( this ) . data ( 'person' ) . availability [ i ] ;
        if ( av . length == 0 ) return ;
        if ( av [ 0 ] == 1 ) dateTime . yes ++ ; else if ( av [ 0 ] == -1 ) dateTime . no ++ ;
      } ) ;


      updateBar ( item ) ; // Update the visual bar for this date.
    } ) ;


    // Attach a click event handler for date selection.
    $ ( '.appointment .dates .select li' ) . click ( function ( ) {
      var me = this ;


      select ( this ) ; // Select the clicked date.

      var dateIndex = 0 ;
      $ ( '.appointment .dates .select li' ) . each ( function ( i ) {
        if ( this == me ) dateIndex = i ;
      } ) ;


      // For each person, display their availability for the selected date.
      $ ( '.appointment .people .select li' ) . each ( function ( ) {
        var balloon = $ ( '<div class="date balloon">' )
          . appendTo ( '.appointment td.availability' ) ;
        var arrow = $ ( '<div class=arrow>' ) . appendTo ( balloon ) ;
        var person = $ ( this ) . data ( 'person' ) ;
        createAvailability ( person , dateIndex ) . appendTo ( balloon ) ;
      } ) ;
    } ) ;

    // Automatically trigger a click on the current user's entry to show their availability by default.
    $ ( '.appointment .people .select li:nth(' + meIndex + ')' ) . click ( ) ;
  }


  // Function to save the user's availability.
  // 'async' parameter determines if the request should be asynchronous (true) or synchronous (false, blocking unload).
  function save ( async ) {
    saveTimeout = null ; // Clear any pending save timeout.


    var avail = [ ] ;
    $ ( $ ( '.appointment .select .me' ) . data ( 'person' ) . availability )
      . each ( function ( i ) {
      avail = avail . concat ( [
        dateKeys [ i ] , ':' , ( this [ 0 ] || 0 ) , ':' , this [ 1 ] || '' , '\n' ] ) ;
    } ) ;


    // Send the availability data to the server.
    $ . ajax ( {
      type : 'POST' ,
      url : '/set-availability' ,
      async : async ,
      data : {
        id : window . id ,
        a : avail . join ( '' )
      } ,
      success : function ( ) { // On successful save.
        var now = new Date ( ) ;
        $ ( '.appointment .status' ) . text ( [
          gettext ( 'Automatically saved on ' ) ,
          now . getHours ( ) , ':' ,
          ( now . getMinutes ( ) < 10 ) ? '0' : '' , now . getMinutes ( ) , ':' ,
          ( now . getSeconds ( ) < 10 ) ? '0' : '' , now . getSeconds ( ) , '.'
        ] . join ( '' ) ) ;
        $ ( '.appointment .save button' ) . attr ( 'disabled' , true ) ; // Disable save button after saving.
      } ,
      error : function ( ) { // On save error.
        $ ( '.appointment .status' ) . text ( [
          gettext ( 'Sorry, your availability could not be saved.' ) ,
          ' ' , gettext ( 'Please try again.' ) ] . join ( '' ) ) ;
      }
    } ) ;
  }

  // This variable holds a timeout ID for scheduling saves.
  var saveTimeout ;

  // Schedules a save operation after a delay.
  function planSave ( ) {
    if ( saveTimeout ) return ; // If a save is already scheduled, do nothing.
    saveTimeout = setTimeout ( function ( ) { save ( true ) ; } , 5000 ) ; // Schedule save in 5 seconds.
    $ ( '.save button' ) . attr ( 'disabled' , false ) ; // Enable the save button.
  }


  // Updates the visual bar representing availability for a specific date.
  function updateBar ( item ) {
    var dt = $ ( item ) . data ( 'dateTime' ) ;
    var total = 105 ;
    var n = $ ( '.appointment .people .select li' ) . length ;
    var left = dt . yes / n * total ;
    var right = dt . no / n * total ;
    var middle = total - left - right ;
    if ( middle < 0 || middle > total ) return ; // Prevent rendering issues with invalid values.
    $ ( item ) . find ( '.bar' ) . css ( {
      borderLeftWidth : left , borderRightWidth : right , width : middle
    } ) ;
  }


  // Creates a DOM element for viewing or editing a person's availability for a given date.
  function createAvailability ( person , dateIndex ) {
    var classes = { '-1' : 'no' , '0' : 'maybe' , '1' : 'yes' } ; // CSS classes mapping availability states.

    // Event handler for when an availability option is changed.
    function onChange ( event ) {
      element . find ( '.toggle' ) . toggleClass ( 'checked' , false ) ; // Deselect all toggles.
      $ ( this ) . addClass ( 'checked' ) ; // Select the clicked toggle.

      var prev = availability [ 0 ] || 0 ; // Store previous availability state.
      availability [ 0 ] = $ ( this ) . data ( 'value' ) ; // Update current availability state.
      if ( availability [ 0 ] == prev ) return ; // If state hasn't changed, do nothing.

      var dateItem = $ ( '.appointment .dates li:nth(' + dateIndex + ')' ) ;
      var dateTime = dateItem . data ( 'dateTime' ) ;
      if ( availability [ 0 ] != 0 ) dateTime [ classes [ availability [ 0 ] ] ] ++ ;
      if ( prev == 1 ) dateTime . yes -- ;
      if ( prev == -1 ) dateTime . no -- ;
      updateBar ( dateItem ) ; // Update the date bar to reflect changes.

      element . toggleClass ( classes [ prev ] , false ) ; // Remove previous availability class.
      element . toggleClass ( classes [ availability [ 0 ] ] , true ) ; // Add new availability class.

      planSave ( ) ; // Schedule a save operation.
    }

    var element = $ ( '<div class=availability>' ) ; // Create the main availability container.
    var availability = person . availability [ dateIndex ] ; // Get availability data for this person and date.

    if ( person . isMe ) { // If the current user is the person whose availability is being displayed.
      element . addClass ( 'form' ) ; // Add 'form' class for editable state.


      var choose = $ ( '<div class=choose>' ) . appendTo ( element ) ; // Container for choice buttons.
      var buttons = [
        $ ( '<div class="toggle label-yes">' ) ,
        $ ( '<div class="toggle label-maybe">' ) ,
        $ ( '<div class="toggle label-no">' )
      ] ;


      $ ( buttons ) . each ( function ( i ) {
        this . data ( 'value' , 1 - i ) . appendTo ( choose ) . click ( onChange ) ; // Set values and attach click handlers.
      } ) ;


      element . addClass ( classes [ '' + ( availability [ 0 ] || 0 ) ] ) ; // Add initial availability class.


      var selectedAny = false ;
      for ( var j = 0 ; j < 3 ; j ++ ) {
        if ( availability . length && availability [ 0 ] == 1 - j ) {
          buttons [ j ] . addClass ( 'checked' ) ;
          selectedAny = true ;
        }
      }
      if ( ! selectedAny ) buttons [ 1 ] . addClass ( 'checked' ) ; // Default to 'maybe' if nothing is selected.


      // Create a textarea for comments.
      var entry = $ ( '<textarea>' ) . keydown ( function ( event ) {
        if ( event . keyCode == 13 ) // Prevent form submission on Enter key.
          event . preventDefault ( ) ;
      } ) . keyup ( function ( ) {
        availability [ 1 ] = this . value ; // Update comment text.
        planSave ( ) ; // Schedule a save.
      } ) . bind ( 'keyup blur' , function ( ) { // Enforce max comment length.
        if ( this . value . length > MAX_COMMENT_LENGTH ) {
          this . value = this . value . substr ( 0 , MAX_COMMENT_LENGTH ) ;
          return false ;
        }
      } ) . appendTo ( element ) . val ( availability [ 1 ] || '' ) ; // Set initial comment value.
    } else { // If viewing another person's availability.
      var possible = $ ( '<div class=possible>' ) . appendTo ( element ) ; // Container for availability label.
      var comment = $ ( '<div class=comment>' ) . appendTo ( element ) ; // Container for comment text.
      element . addClass ( 'static' ) ; // Add 'static' class for non-editable state.
      if ( availability . length ) { // If availability data exists.
        element . addClass ( classes [ availability [ 0 ] ] ) ;
        $ ( '<div>' ) . addClass ( 'label-' + classes [ availability [ 0 ] ] )
          . appendTo ( possible ) ;
        comment . text ( availability [ 1 ] || '' ) ;
      } else { // If no availability data is present.
        element . addClass ( 'maybe' ) ;
        $ ( '<div class=label-maybe>' ) . appendTo ( possible ) ;
        comment . text ( '[' + gettext ( 'Not filled in yet.' ) + ']' ) ;
      }
    }
    return element ; // Return the constructed availability element.
  }


  // Sets up various administrative tools based on user permissions.
  function setupTools ( data ) {
    if ( data . meta . initiator == data . user || data . meta . proposeMore ) { // If user is initiator or can propose more dates.
      // Set the appointment ID for proposing another date.
      $ ( '.propose-date input[name=id]' ) . val ( window . id ) ;
    }

    if ( data . meta . initiator == data . user ) { // If the user is the initiator.
      // Set the appointment ID for resending invitations.
      $ ( '.resend-invitations input[name=id]' ) . val ( window . id ) ;
      $ . each ( data . people , function ( ) {
        if ( this . id != data . invitee ) // Populate dropdown with other participants.
          $ ( '<option>' ) . val ( this . id ) . text ( this . name )
            . appendTo ( '.resend-invitations select[name=invitee]' ) ;
      } ) ;
      if ( data . people . length == 1 ) // Disable if only one participant (self).
        $ ( '.resend-invitations select, button' ) . attr ( 'disabled' , true ) ;


      // Set the appointment ID for inviting another participant.
      $ ( '.invite-participant input[name=id]' ) . val ( window . id ) ;


      // Populate the textarea with invitees' email addresses.
      var s = [ ] ;
      $ . each ( data . addresses , function ( ) { s . push ( this ) ; } ) ;
      $ ( '.email-addresses textarea' ) . val ( s . join ( ', ' ) ) ;
      if ( data . people . length == 1 ) // Disable if only one participant (self).
        $ ( '.email-addresses textarea' ) . attr ( 'disabled' , true ) ;
    } else
      // Hide tools if the user is not the initiator.
      $ ( '.resend-invitations, .email-addresses, .invite-participant' )
        . css ( 'display' , 'none' ) ;


    // Attach a submit handler to all tool forms.
    $ ( '.tools form' ) . submit ( function ( ) {
      var form = this ;
      $ ( this ) . find ( 'button' ) . attr ( 'disabled' , true ) ; // Disable button on submit.
      $ ( this ) . find ( '.success, .error' ) . text ( '' ) ; // Clear previous status messages.
      $ . ajax ( {
        type : 'POST' ,
        url : this . action ,
        data : $ ( this ) . serialize ( ) , // Serialize form data.
        success : function ( ) { // On successful form submission.
          $ ( form ) . find ( '.success' ) . text ( gettext ( 'Done!' ) ) ;
          $ ( form ) . find ( 'button' ) . attr ( 'disabled' , false ) ; // Re-enable button.
          if ( $ ( form ) . hasClass ( 'invite-participant' ) ||
              $ ( form ) . hasClass ( 'propose-date' ) ) location . reload ( ) ; // Reload page for certain actions.
        } ,
        error : function ( ) { // On form submission error.
          $ ( form ) . find ( '.error' ) . text ( gettext ( 'An error occurred.' ) ) ;
          $ ( form ) . find ( 'button' ) . attr ( 'disabled' , false ) ; // Re-enable button.
        }
      } ) ;
      return false ; // Prevent default form submission.
    } ) ;
  }
} ) ; // End of jQuery ready function.