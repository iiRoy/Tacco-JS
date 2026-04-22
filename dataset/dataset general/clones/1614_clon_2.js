// This module handles interaction with the external trading service.

let   exchangeConnector   =    require("./exchange_connector.js" ) ;

// Initialize the client with user-specific authentication details.
exchangeConnector.initClient( userIdentifier , accessKey , secretToken ) ;

/*
 * Request current account financial summary.
 * The provided callback will process the returned data structure.
 */
exchangeConnector.getFundsSummary( function ( financialOverview ) {
  console.log( financialOverview ) ;
} ) ;