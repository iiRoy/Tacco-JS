/*
 * This file contains several utility functions for a web application.
 *
 * It includes a jQuery extension for parsing URL query parameters
 * and a modified version of the jQuery Timeago plugin.
 *
 * The `getUrlVars` and `getUrlVar` functions help in retrieving
 * data from the browser's URL query string.
 *
 * The main `$(function() { ... });` block initializes a widget
 * that displays the latest commits from a specified GitHub repository,
 * utilizing the URL parameters for configuration.
 *
 * The Timeago plugin provides dynamic, human-readable timestamps.
 *
 * All code here is logically identical to the original,
 * with only changes to whitespace and comments.
 *
 */

$.extend(
  {
    getUrlVars: function()
    {
       // Declare variables to be used within this function.
      var hash ,
          hashes ,
          i ,
          vars ;

      vars   =   [ ] ; // Initialize an empty array to store variables.
      hash   =   void 0 ; // Initialize hash as undefined.

      // Extract the query string from the URL, split by '&'.
      hashes = window.location.href.slice( window.location.href.indexOf( "?" ) + 1 ).split( "&" ) ;

      i = 0 ; // Initialize loop counter.

      // Loop through each hash (key=value pair).
      while ( i < hashes.length )
      {
        hash = hashes[ i ].split( "=" ) ; // Split the key=value pair.
        vars.push( hash[ 0 ] ) ;         // Add the key to the array.
        vars[ hash[ 0 ] ] = hash[ 1 ] ; // Store the value using the key as an index.
        i ++ ;                           // Increment counter.
      }

      return vars ; // Return the object containing URL variables.
    } ,


    getUrlVar: function( name )
    {
      // Retrieve a specific variable by name using the getUrlVars function.
      return $.getUrlVars()[ name ] ;
    }
  }
) ;


// Document ready function: Executes when the DOM is fully loaded.
$( function( )
{
  // Declare all local variables at the beginning of the scope.
  var branch ,
      callback ,
      container ,
      limit ,
      params ,
      repo ,
      url ,
      username ;

  // Retrieve all URL parameters.
  params    = $.getUrlVars( ) ;

  // Assign specific parameters to descriptive variables.
  username  = params.username ;
  repo      = params.repo ;
  limit     = params.limit ;
  branch    = params.branch ;

  // Select the main container element for the widget.
  container = $( '#latest-commits-widget' ) ;


  // Define the callback function for processing the GitHub API response.
  callback = function( response )
  {
    var index ,
        items ,
        result ,
        ul ,
        _results ; // Used for CoffeeScript-style loop results.

    items = response.data ; // Extract the data array from the response.
    ul    = $( '#commit-history' ) ; // Select the unordered list to populate.

    ul.empty( ) ; // Clear any existing items in the list.

    _results = [ ] ; // Initialize the results array.

    // Iterate over each item (commit) in the response data.
    for ( index in items )
    {
      result = items[ index ] ; // Get the current commit object.

      // Push the result of an immediately invoked function expression (IIFE)
      // which appends a list item for each commit.
      _results.push( ( function( index , result )
      {
        // Only append if the commit has an author.
        if ( result.author != null )
        {
          // Append a new list item with commit details.
          return ul.append( "<li class=\"clearfix\">\n  <div class=\"left\">\n    <img class=\"commit-avatar\" src=\"" + result.author.avatar_url + "\">\n  </div>\n  <div class=\"commit-author-info left\">\n      <a href=\"https://github.com/" + result.author.login + "\"><b class=\"commit-author\">" + result.author.login + "</b></a>\n      <br />\n      <b class=\"commit-date\">" + ( $.timeago( result.commit.committer.date ) ) + "</b><br /><i class=\"commit-sha\">SHA: " + result.sha + "</i>\n      <br />\n      <a class=\"commit-message\" href=\"https://github.com/" + username + "/" + repo + "/commit/" + result.sha + "\" target=\"_blank\">" + result.commit.message + "</a>\n  </div>\n</li>" ) ;
        }
      } )( index , result ) ) ; // Invoke the function with current index and result.
    }
    return _results ; // Return the results array (often ignored in practice for side effects).
  } ;

  // Update the widget's title to show the repository name.
  container.find( 'h4' ).text( "Latest Commits to " + username + "/" + repo ) ;


  // Construct the GitHub API URL.
  url = "https://api.github.com/repos/" + username + "/" + repo + "/commits?callback=callback" ;

  // If a branch is specified in the URL parameters, add it to the API URL.
  if ( params.branch != null )
  {
    url += "&sha=" + branch ;
  }

  // Make an AJAX request to the GitHub API.
  return $.ajax( url , {
    data: {
      per_page: limit // Specify the number of commits per page.
    } ,
    dataType: "jsonp" , // Use JSONP for cross-domain requests.
    type: "get" // HTTP GET method.
  } ).success( function( response )
  {
    // On successful response, call the defined callback function.
    return callback( response ) ;
  } ) ;
} ) ;


/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * This section defines the core functionality and configuration
 * for the Timeago plugin.
 *
 * @name timeago
 * @version 0.11.1
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2011, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */
( function( $ )
{
  // Main timeago function, converts a timestamp into a human-readable string.
  $.timeago = function( timestamp )
  {
    if ( timestamp instanceof Date )
    {
      return inWords( timestamp ) ;
    }
    else if ( typeof timestamp === "string" )
    {
      return inWords( $.timeago.parse( timestamp ) ) ;
    }
    else
    {
      return inWords( $.timeago.datetime( timestamp ) ) ;
    }
  } ;

  var $t = $.timeago ; // Shorthand for $.timeago.

  // Extend the $.timeago object with settings and helper functions.
  $.extend( $.timeago ,
  {
    settings: {
      refreshMillis: 60000 , // How often to refresh timestamps (in milliseconds).
      allowFuture: false ,   // Whether to allow future dates (e.g., "from now").
      strings: {             // Language strings for different time units.
        prefixAgo: null ,
        prefixFromNow: null ,
        suffixAgo: "ago" ,
        suffixFromNow: "from now" ,
        seconds: "less than a minute" ,
        minute: "about a minute" ,
        minutes: "%d minutes" ,
        hour: "about an hour" ,
        hours: "about %d hours" ,
        day: "a day" ,
        days: "%d days" ,
        month: "about a month" ,
        months: "%d months" ,
        year: "about a year" ,
        years: "%d years" ,
        wordSeparator: " " , // Separator between prefix/words/suffix.
        numbers: [ ]         // Custom number words, if any.
      }
    } ,

    // Converts a distance in milliseconds to human-readable words.
    inWords: function( distanceMillis )
    {
      var $l = this.settings.strings ; // Local reference to strings.
      var prefix = $l.prefixAgo ;
      var suffix = $l.suffixAgo ;

      // Adjust prefix/suffix if future dates are allowed and the distance is negative.
      if ( this.settings.allowFuture )
      {
        if ( distanceMillis < 0 )
        {
          prefix = $l.prefixFromNow ;
          suffix = $l.suffixFromNow ;
        }
      }

      // Calculate time units from milliseconds.
      var seconds = Math.abs( distanceMillis ) / 1000 ;
      var minutes = seconds / 60 ;
      var hours   = minutes / 60 ;
      var days    = hours / 24 ;
      var years   = days / 365 ;

      // Helper function to substitute numbers into string templates.
      function substitute( stringOrFunction , number )
      {
        var string = $.isFunction( stringOrFunction ) ? stringOrFunction( number , distanceMillis ) : stringOrFunction ;
        var value  = ( $l.numbers && $l.numbers[ number ] ) || number ;
        return string.replace( /%d/i , value ) ;
      }

      // Determine the appropriate words based on the calculated time units.
      var words = seconds < 45 && substitute( $l.seconds , Math.round( seconds ) ) ||
                  seconds < 90 && substitute( $l.minute , 1 ) ||
                  minutes < 45 && substitute( $l.minutes , Math.round( minutes ) ) ||
                  minutes < 90 && substitute( $l.hour , 1 ) ||
                  hours < 24 && substitute( $l.hours , Math.round( hours ) ) ||
                  hours < 42 && substitute( $l.day , 1 ) ||
                  days < 30 && substitute( $l.days , Math.round( days ) ) ||
                  days < 45 && substitute( $l.month , 1 ) ||
                  days < 365 && substitute( $l.months , Math.round( days / 30 ) ) ||
                  years < 1.5 && substitute( $l.year , 1 ) ||
                  substitute( $l.years , Math.round( years ) ) ;

      // Get the word separator, defaulting to a space.
      var separator = $l.wordSeparator === undefined ? " " : $l.wordSeparator ;

      // Trim and join the parts to form the final string.
      return $.trim( [ prefix , words , suffix ].join( separator ) ) ;
    } ,

    // Parses an ISO 8601 formatted string into a Date object.
    parse: function( iso8601 )
    {
      var s = $.trim( iso8601 ) ;
      s = s.replace( /\.\d\d\d+/ , "" ) ; // remove milliseconds
      s = s.replace( /-/ , "/" ).replace( /-/ , "/" ) ; // replace first two hyphens with slashes
      s = s.replace( /T/ , " " ).replace( /Z/ , " UTC" ) ; // replace T with space and Z with UTC
      s = s.replace( /([\+\-]\d\d)\:?(\d\d)/ , " $1$2" ) ; // -04:00 -> -0400
      return new Date( s ) ;
    } ,

    // Extracts a datetime from an element's attribute.
    datetime: function( elem )
    {
      // Check if the element is a <time> tag (HTML5).
      // jQuery's `is()` doesn't play well with HTML5 in IE, so use tagName.
      var isTime = $( elem ).get( 0 ).tagName.toLowerCase( ) === "time" ; // $(elem).is("time");
      // Get datetime from 'datetime' attribute for <time> or 'title' for others.
      var iso8601 = isTime ? $( elem ).attr( "datetime" ) : $( elem ).attr( "title" ) ;
      return $t.parse( iso8601 ) ;
    }
  } ) ;


  // jQuery plugin definition for .timeago().
  $.fn.timeago = function( )
  {
    var self = this ; // Store reference to the jQuery object.
    self.each( refresh ) ; // Refresh each element immediately.

    var $s = $t.settings ; // Get settings.
    if ( $s.refreshMillis > 0 )
    {
      // Set up an interval to periodically refresh the timestamps.
      setInterval( function( ) { self.each( refresh ) ; } , $s.refreshMillis ) ;
    }
    return self ; // Allow chaining.
  } ;


  // Helper function to refresh the timeago text for a single element.
  function refresh( )
  {
    var data = prepareData( this ) ; // Get element data.
    if ( ! isNaN( data.datetime ) )
    {
      $( this ).text( inWords( data.datetime ) ) ; // Update text if datetime is valid.
    }
    return this ; // Return element for potential chaining.
  }


  // Helper function to prepare and cache datetime data for an element.
  function prepareData( element )
  {
    element = $( element ) ; // Ensure element is a jQuery object.
    if ( ! element.data( "timeago" ) )
    {
      // If no timeago data exists, create it.
      element.data( "timeago" , { datetime: $t.datetime( element ) } ) ;
      var text = $.trim( element.text( ) ) ;
      if ( text.length > 0 )
      {
        element.attr( "title" , text ) ; // Store original text in title attribute.
      }
    }
    return element.data( "timeago" ) ; // Return the cached data.
  }


  // Helper function to convert a Date object to timeago words.
  function inWords( date )
  {
    return $t.inWords( distance( date ) ) ;
  }


  // Helper function to calculate the time distance from now to a given date.
  function distance( date )
  {
    return ( new Date( ).getTime( ) - date.getTime( ) ) ;
  }


  // Fix for IE6 suckage: ensure HTML5 elements are recognized.
  document.createElement( "abbr" ) ;
  document.createElement( "time" ) ;

} )( jQuery ) ; // Pass jQuery into the IIFE.