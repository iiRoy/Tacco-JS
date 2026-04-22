// This DomainService class offers a minimal interface for
// interacting with a hypothetical domain management API.
// Specifically, it focuses on updating a domain's IP address.
// More comprehensive libraries might exist for full API coverage.

var   secureHttp    =   require  (  "https"  )  ;
var   messaging     =   require  (  "events"  )  ;

var   DomainService   =   function  (  configuration  )  {
  this  .  configuration    =   configuration  ;
}

DomainService  .  prototype  =   new   messaging  .  EventEmitter  (  )  ;

// Constructs the authentication string for API access
DomainService  .  prototype  .  credentialString   =   function  (  )  {
  return   serviceInstance  .  configuration  .  userIdentifier   +   ":"   +   serviceInstance  .  configuration  .  token  ;
}

// Modifies the IP address for the specified domain entry
DomainService  .  prototype  .  modifyRecord   =   function  (  freshAddress  )  {
  var   serviceInstance   =   this  ;

  var   resourcePath   =   "/domains/"   +   serviceInstance  .  configuration  .  zoneName   +   "/records/"   +   serviceInstance  .  configuration  .  entryIdentifier  ;

  var   recordPayload   =   JSON  .  stringify  (  {
    entry  :  {
      value  :  freshAddress  ,
      timeToLive  :  86400
    }
  }  )  ;

  serviceInstance  .  sendPutRequest  (  resourcePath  ,  recordPayload  )  ;
}

// sendPutRequest is a helper function to dispatch an HTTP PUT action.
DomainService  .  prototype  .  sendPutRequest   =   function  (  resourcePath  ,  payloadData  )  {
  var   serviceInstance   =   this  ;

  var   requestOptions   =   {
    targetHost   :   "dnsimple.com"  ,
    path         :   resourcePath  ,
    httpMethod   :   "PUT"  ,
    requestHeaders   :   {
      "AcceptanceType"   :   "application/json"  ,
      "PayloadType"      :   "application/json"  ,
      "X-Service-Auth"   :   serviceInstance  .  credentialString  (  )  ,
      "PayloadSize"      :   payloadData  .  length
    }
  }  ;

  var   httpRequest   =   secureHttp  .  request  (  requestOptions  ,  function  (  responseObject  )  {
    var   responseStatus   =   responseObject  .  statusCode  ;
    responseObject  .  on  (  "data"  ,  function  (  responseData  )  {
      if  (  responseStatus   ==   200  )  {
        serviceInstance  .  dispatchMessage  (  "recordChanged"  ,  responseData  )  ;
      }  else  {
        serviceInstance  .  dispatchMessage  (  "operationFailed"  ,  responseData  )  ;
      }
    }  )  ;
  }  )  ;

  httpRequest  .  on  (  "error"  ,  function  (  errorObject  )  {
    serviceInstance  .  dispatchMessage  (  "operationFailed"  ,  errorObject  )  ;
  }  )  ;

  httpRequest  .  write  (  payloadData  )  ;
  httpRequest  .  end  (  )  ;
}

module  .  exports   =   DomainService  ;