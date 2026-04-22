var MessageCannon = ( function ( ) {
 var mc = {};
 var apiEndpoint = "https://api.pushbullet.com/v2/";
 var pushEndpoint = apiEndpoint + "pushes";
 var contactEndpoint = apiEndpoint + "contacts";
 var deviceEndpoint = apiEndpoint + "devices";
 var userEndpoint = apiEndpoint + "users/me";
 var uploadRequestEndpoint = apiEndpoint + "upload-request";

 var requestComplete = 4;
 var responseOK = 200;
 var responseNoContent = 204;

 mc.accessCredential = null;

 mc.sendTransmission = function ( transmissionKind, destinationId, recipientEmail, payloadContent, responseHandler ) {
  var requestParams = {
   type: transmissionKind.toLowerCase()
  };

  if ( recipientEmail && destinationId ) {
   var errorObject = new Error( "Cannot transmit to both device and contact" );
   if ( responseHandler ) {
    return responseHandler( errorObject );
   } else {
    throw errorObject;
   }
  } else if ( recipientEmail ) {
   requestParams.email = recipientEmail;
  } else if ( destinationId ) {
   requestParams.device_iden = destinationId;
  }

  switch ( transmissionKind.toLowerCase() ) {
   case "note":
    requestParams.title = payloadContent.title;
    requestParams.body = payloadContent.body;
    break;
   case "link":
    requestParams.title = payloadContent.title;
    requestParams.url = payloadContent.url;
    if ( payloadContent.body ) {
     requestParams.body = payloadContent.body;
    }
    break;
   case "address":
    requestParams.name = payloadContent.name;
    requestParams.address = payloadContent.address;
    break;
   case "list":
    requestParams.title = payloadContent.title;
    requestParams.items = payloadContent.items;
    break;
   default:
    var errorObject = new Error( "Invalid transmission kind" );
    if ( responseHandler ) {
     return responseHandler( errorObject );
    } else {
     throw errorObject;
    }
    break;
  }
  var resultData = performXHR( pushEndpoint, "POST", requestParams, false, responseHandler );
  if ( !responseHandler ) {
   return resultData;
  }
 };

 mc.dispatchFile = function ( targetId, targetEmail, fileBlob, messageBody, completionCallback ) {
  var fileTypeParam = "file_type=" + encodeURIComponent( fileBlob.type );
  var fileNameParam = "file_name=" + encodeURIComponent( fileBlob.name );
  var uploadReqURL = uploadRequestEndpoint + "?" + fileTypeParam + "&" + fileNameParam;

  var uploadReqProcessor = !completionCallback ? null : function ( issueObj, outcomeData ) {
   if ( issueObj ) {
    return completionCallback( issueObj );
   } else {
    try {
     processFileUpload( outcomeData, targetId, targetEmail, fileBlob, messageBody, completionCallback );
    } catch ( secondaryIssue ) {
     return completionCallback( secondaryIssue );
    }
   }
  };
  var outcomeData = performXHR( uploadReqURL, "GET", null, false, uploadReqProcessor );
  if ( !completionCallback ) {
   return processFileUpload( outcomeData, targetId, targetEmail, fileBlob, messageBody );
  }
 };

 var processFileUpload = function ( xhrResponse, targetDeviceId, targetEmailAddress, fileDescriptor, messageText, finalCallback ) {
  var formDataObject = new FormData();
  formDataObject.append( "awsaccesskeyid", xhrResponse.data.awsaccesskeyid );
  formDataObject.append( "acl", xhrResponse.data.acl );
  formDataObject.append( "key", xhrResponse.data.key );
  formDataObject.append( "signature", xhrResponse.data.signature );
  formDataObject.append( "policy", xhrResponse.data.policy );
  formDataObject.append( "content-type", fileDescriptor.type );
  formDataObject.append( "file", fileDescriptor );

  performXHR( xhrResponse.upload_url, "POST", formDataObject, true, null );

  var transmissionParameters = {
   file_name: fileDescriptor.name,
   file_type: fileDescriptor.type,
   file_url: xhrResponse.file_url,
   type: "file"
  };

  if ( messageText ) {
   transmissionParameters.body = messageText;
  }

  if ( targetEmailAddress && targetDeviceId ) {
   var errorInstance = new Error( "Cannot transmit to both device and contact" );
   if ( finalCallback ) {
    return finalCallback( errorInstance );
   } else {
    throw errorInstance;
   }
  } else if ( targetEmailAddress ) {
   transmissionParameters.email = targetEmailAddress;
  } else if ( targetDeviceId ) {
   transmissionParameters.device_iden = targetDeviceId;
  } else {
   var anotherError = new Error( "Must transmit to either device or contact" );
   if ( finalCallback ) {
    return finalCallback( anotherError );
   } else {
    throw anotherError;
   }
  }
  var operationResult = performXHR( pushEndpoint, "POST", transmissionParameters, false, finalCallback );
  if ( !finalCallback ) {
   return operationResult;
  }
 };

 mc.removeTransmission = function ( transmissionIdentifier, completionHandler ) {
  var operationResult = performXHR( pushEndpoint + "/" + transmissionIdentifier, "DELETE", null, false, completionHandler );
  if ( !completionHandler ) {
   return operationResult;
  }
 };

 mc.fetchTransmissionLog = function ( alteredSince, paginationCursor, resultCallback ) {
  if ( typeof alteredSince === 'function' ) {
   resultCallback = alteredSince;
   alteredSince = null;
  } else if ( typeof paginationCursor === 'function' ) {
   resultCallback = paginationCursor;
   paginationCursor = null;
  }

  var queryParameters = null;
  if ( alteredSince ) {
   queryParameters = {
    modified_after: alteredSince
   };
  }
  if ( paginationCursor ) {
   queryParameters = queryParameters || {};
   queryParameters.cursor = paginationCursor;
  }
  var retrievedData = performXHR( pushEndpoint, "GET", queryParameters, false, resultCallback );
  if ( !resultCallback ) {
   return retrievedData;
  }
 };

 mc.listDevices = function ( devCallback ) {
  var devResult = performXHR( deviceEndpoint, "GET", null, false, devCallback );
  if ( !devCallback ) {
   return devResult;
  }
 };

 mc.deactivateDevice = function ( deviceIdToDelete, deleteDevCallback ) {
  var deleteDevResult = performXHR( deviceEndpoint + "/" + deviceIdToDelete, "DELETE", null, false, deleteDevCallback );
  if ( !deleteDevCallback ) {
   return deleteDevResult;
  }
 };

 mc.listContacts = function ( contactCallback ) {
  var contactResult = performXHR( contactEndpoint, "GET", null, false, contactCallback );
  if ( !contactCallback ) {
   return contactResult;
  }
 };

 mc.removeContact = function ( contactIdToRemove, deleteContactCallback ) {
  var deleteContactResult = performXHR( contactEndpoint + "/" + contactIdToRemove, null, false, deleteContactCallback );
  if ( !deleteContactCallback ) {
   return deleteContactResult;
  }
 };

 mc.getUserProfile = function ( userCallback ) {
  var userResult = performXHR( userEndpoint, "GET", null, false, userCallback );
  if ( !userCallback ) {
   return userResult;
  }
 };

 var performXHR = function ( resourceURL, httpMethod, requestPayload, isFileTransfer, asyncCompletion ) {
  if ( !mc.accessCredential ) {
   var errorObj = new Error( "Access credential for MessageCannon not set" );
   if ( asyncCompletion ) {
    return asyncCompletion( errorObj );
   } else {
    throw errorObj;
   }
  } else {
   var xhrObject = new XMLHttpRequest();
   var isAsynchronous = false;
   if ( asyncCompletion ) {
    isAsynchronous = true;
    xhrObject.onreadystatechange = function () {
     if ( xhrObject.readyState === requestComplete ) {
      var xhrResult = null;
      try {
       xhrResult = processResponse( xhrObject );
      } catch ( errorParsing ) {
       return asyncCompletion( errorParsing );
      }
      return asyncCompletion( null, xhrResult );
     }
    };
   }
   if ( httpMethod === "GET" ) {
    var urlParams = [];
    for ( var paramKey in requestPayload ) {
     urlParams.push( paramKey + '=' + requestPayload[ paramKey ] );
    }
    var finalQueryString = urlParams.join( "&" );
    resourceURL += "?" + finalQueryString;
    requestPayload = null;
   }
   xhrObject.open( httpMethod, resourceURL, isAsynchronous );
   if ( !isFileTransfer ) {
    xhrObject.setRequestHeader( "Authorization", "Basic " + window.btoa( mc.accessCredential + ":" ) );
    xhrObject.setRequestHeader( "Content-Type", "application/json" );
    requestPayload = JSON.stringify( requestPayload );
   }
   if ( requestPayload ) {
    xhrObject.send( requestPayload );
   } else {
    xhrObject.send();
   }

   if ( !isAsynchronous ) {
    return processResponse( xhrObject );
   }
  }
 };

 var processResponse = function ( xhrInstance ) {
  if ( xhrInstance.status !== responseOK && xhrInstance.status !== responseNoContent ) {
   throw new Error( xhrInstance.status + ": " + xhrInstance.response );
  }
  try {
   return JSON.parse( xhrInstance.response );
  } catch ( parseError ) {
   return xhrInstance.response;
  }
 };

 return mc;
}() );