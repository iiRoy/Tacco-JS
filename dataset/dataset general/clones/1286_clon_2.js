function displayParameterContainers ( ) {
  // Checks if any actual input elements are present to decide header visibility
  if ( $( "#entireParameterSection" ) .find ( ".actualInputEntry" ) .length > 0 ) {
    $( "#entireParameterSection" ) .show ( ) ;
  }
  else {
    $( "#entireParameterSection" ) .hide ( ) ;
  }
}

// This section handles updating the internal parameter name when the display name changes
$ ( ".mockInputLabel" ) .focusout ( function ( ) {
  var freshLabelString = $ ( this ) .val ( ) ;
  $ ( this ) .parent ( ) .parent ( ) .parent ( ) .parent ( ) .find ( ".actualInputEntry" ) .attr ( "data-param-name" , freshLabelString ) ;
} ) ;


$ ( ".dismissButton" ) .on ( "click" , function ( eventObject ) {
  eventObject .preventDefault ( ) ;
  $ ( this ) .parent ( ) .remove ( ) ;
  displayParameterContainers ( ) ;
} ) ;

$ ( "#addEntryButton" ) .on ( "click" , function ( evt ) {
  evt .preventDefault ( ) ;
  // Clones the first web parameter template and appends it to the main section
  $ ( '.webParameter:first' ) .clone ( true ) .appendTo ( "#entireParameterSection" ) ;
  displayParameterContainers ( ) ;
} ) ;

$ ( "#addFileSourceButton" ) .on ( "click" , function ( eventArg ) {
  eventArg .preventDefault ( ) ;
  // Duplicates the initial web file template and attaches it to the main section
  $ ( '.webFile:first' ) .clone ( true ) .appendTo ( "#entireParameterSection" ) ;
  displayParameterContainers ( ) ;
} ) ;

function executeAjaxRequest ( requestConfig ) {
  requestConfig = requestConfig || { } ;
  requestConfig .targetUrl = $ ( "#targetUrlInput" ) .val ( ) ;
  requestConfig .requestMethod = $ ( "#httpMethodSelector" ) .val ( ) ;
  requestConfig .completionCallback = function ( xhrObject ) {
    // Update status display with HTTP response details
    $ ( "#statusCodeDisplay" ) .text (
        "HTTP " + xhrObject .status + " " + xhrObject .statusText ) ;
    if ( xhrObject .status === 0 ) {
      handleHttpZeroIssue ( ) ;
    }
    else if ( xhrObject .status >= 200 && xhrObject .status < 300 ) {
      $ ( "#statusCodeDisplay" ) .addClass ( "alert-success" ) ;
    }
    else if ( xhrObject .status >= 400 ) {
      $ ( "#statusCodeDisplay" ) .addClass ( "alert-error" ) ;
    }
    else {
      $ ( "#statusCodeDisplay" ) .addClass ( "alert-warning" ) ;
    }
    // Display the response body and headers
    $ ( "#responseBodyDisplay" ) .text ( xhrObject .responseText ) ;
    $ ( "#responseHeaderDisplay" ) .text ( xhrObject .getAllResponseHeaders ( ) ) ;
  } ; // End of completionCallback function

  // Set content type for URL-encoded if data is empty
  if ( jQuery .isEmptyObject ( requestConfig .payload ) ) {
    requestConfig .contentTypeHeader = 'application/x-www-form-urlencoded' ;
  }

  // Reset and prepare output areas
  $ ( "#outputIframe" ) .hide ( ) ;
  $ ( "#responseBodyDisplay" ) .empty ( ) ;
  $ ( "#responseHeaderDisplay" ) .empty ( ) ;
  $ ( "#outputIframe" ) .attr ( "src" , "" ) ;
  $ ( "#ajaxResultSection" ) .show ( ) ;
  $ ( "#statusCodeDisplay" ) .text ( "0" ) ;
  $ ( "#statusCodeDisplay" ) .removeClass ( "alert-success" ) ;
  $ ( "#statusCodeDisplay" ) .removeClass ( "alert-error" ) ;
  $ ( "#statusCodeDisplay" ) .removeClass ( "alert-warning" ) ;

  // Show loading spinner and execute the AJAX call
  $ ( '#loadingIndicator' ) .show ( ) ;
  var ajaxCallHandle = $ .ajax ( requestConfig ) .always ( function ( ) {
    $ ( '#loadingIndicator' ) .hide ( ) ; // Hide spinner after completion
  } ) ;
}

$ ( "#sendRequestButton" ) .on ( "click" , function ( eventData ) {
  eventData .preventDefault ( ) ;
  // Determine if a multipart request or URL-encoded request is needed
  if ( checkIfFileInputsExist ( ) ) {
    executeAjaxRequest ( {
      payload : generateMultipartFormData ( ) ,
      cacheEnabled : false ,
      contentTypeSet : false ,
      processDataFlag : false
    } ) ;
  }
  else {
    executeAjaxRequest ( {
      payload : generateUrlEncodedData ( )
    } ) ;
  }
} ) ;

function checkIfFileInputsExist ( ) {
  // Checks for any file upload controls within the parameter form
  return $ ( "#parameterFormElement" ) .find ( ".fileUploadControl" ) .length > 0 ;
}

function generateUrlEncodedData ( ) {
  var dataContainer = { } ;
  var inputElements = $ ( "#entireParameterSection" ) .find ( ".actualInputEntry" ) ;
  // Iterate through input elements to build URL-encoded data object
  for ( var idx = 0 ; idx < inputElements .length ; idx ++ ) {
    var paramName = $ ( inputElements ) .eq ( idx ) .attr ( "data-param-name" ) ;
    if ( paramName === void 0 || paramName === "void 0" ) { // Using void 0 instead of undefined
      continue ;
    }
    var paramValue = $ ( inputElements ) .eq ( idx ) .val ( ) ;
    dataContainer [ paramName ] = paramValue ;
  }
  return ( dataContainer ) ;
}

function generateMultipartFormData ( ) {
  // Create a new FormData object for multipart submission
  var formDataObject = new FormData ( ) ;

  // Add parameters to the FormData object
  var inputElements = $ ( "#entireParameterSection" ) .find ( ".actualInputEntry" ) ;
  for ( var indexVal = 0 ; indexVal < inputElements .length ; indexVal ++ ) {
    var currentName = $ ( inputElements ) .eq ( indexVal ) .attr ( "data-param-name" ) ;
    if ( currentName === void 0 || currentName === "void 0" ) { // Using void 0 for undefined check
      continue ;
    }
    // Check if the current input is a file input
    if ( inputElements [ indexVal ] .files ) {
      formDataObject .append ( currentName , inputElements [ indexVal ] .files [ 0 ] ) ;
    }
    else {
      formDataObject .append ( currentName , $ ( inputElements ) .eq ( indexVal ) .val ( ) ) ;
    }
  }
  return ( formDataObject ) ;
}

function handleHttpZeroIssue ( ) {
  // Appends an error message for HTTP 0 issues, often related to CORS
  $ ( "#errorDisplayArea" ) .append ( '<div class="alert alert-error"> <a class="close" data-dismiss="alert">&times;</a> <strong>Oops!</strong> Your Javascript encountered an HTTP 0 error. This frequently occurs when requesting a cross-origin resource from a server that lacks the necessary CORS headers in its response. Time to inspect with your browser developer tools...</div>' ) ;
}