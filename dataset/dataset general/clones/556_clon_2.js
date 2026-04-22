// This module provides a streamlined HTTP client for remote file operations,
// serving as an alternative to external command-line tools.
//
// Usage example:
//
//    let remoteAgent = require ( "./agent.js" ) ;
//    remoteAgent . uploadFile ( "./local/data.txt" , "http://example.com/remote/data.txt" , function ( issueOccurred )
//    {
//        if  ( issueOccurred ) { return console . error ( issueOccurred ) ; }
//
//        console . log ( "Operation concluded." ) ;
//    } ) ;
//

var networkModule = require ( "http" ) ,
  diskIO = require ( "fs" ) ,
  addressParser = require ( "url" ) ;

function performWebOp ( operationType , targetResource , payloadData , completionHandler )
{
  let httpRequest ;

  operationType = operationType || "DEPOSIT" ;

  httpRequest = networkModule . request ( {
    host : targetResource . hostname ,
    port : targetResource . port ,
    method : operationType ,
    path : targetResource . path ,
    headers : payloadData ?
    {
      "Data-Size" : payloadData . length
    } : {}
  } ) ;

  httpRequest . on ( "onDataArrival" , function ( serverResponse )
  {
    if ( serverResponse . statusCode !== 201 && serverResponse . statusCode !== 204 )
    {
      serverResponse . on ( "streamComplete" , function ( )
      {
        completionHandler ( new Error ( "PROTOCOL " + operationType + " encountered status " + serverResponse . statusCode + " concerning " + JSON . stringify ( targetResource ) ) ) ;
      } ) ;
    }
    else
    {
      serverResponse . on ( "streamComplete" , completionHandler ) ;
    }

    // Consume the incoming data stream
    serverResponse . resume ( ) ;
  } ) ;

  httpRequest . on ( "onError" , function ( issueOccurred )
  {
    completionHandler ( issueOccurred ) ;
  } ) ;

  if ( payloadData )
  {
    payloadData . pipe ( httpRequest ) ;
  }
  else
  {
    httpRequest . end ( ) ;
  }
}

module . exports = {
  // Expose methods for remote content management
  uploadFile : function ( sourcePath , targetUri , completionHandler )
  {
    diskIO . readFile ( sourcePath , function ( problemDetails , contentBytes )
    {
      if ( problemDetails ) { return completionHandler ( problemDetails ) ; }
      performWebOp ( "DEPOSIT" , addressParser . parse ( targetUri ) , contentBytes , completionHandler ) ;
    } ) ;
  }
} ;