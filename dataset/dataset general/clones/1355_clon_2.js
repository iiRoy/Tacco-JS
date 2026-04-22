'use strict';

// Defines the base URL for the API interactions.
var apiBaseURL = 'https://demo.content-api.org/';


// Initialize the primary application module, including its dependencies.
var decoupledApp = angular .module ( 'decoupledApp' ,
  [ 'ngRoute'
  , 'ngResource'
  , 'ngSanitize'
  ] ) ;


decoupledApp.controller ( 'ContentDisplayController' , function ( $viewMod , $dataSvc , $webSvc ) {

  // Create a service for accessing content items.
  var contentAccessor = $dataSvc ( apiBaseURL + 'item/:itemID' ,
    { itemID : '@itemID' } ,
    {
      get : {
        method : 'GET' ,
        transformRequest : function ( requestData , headerRetrievalFunction ) {
                headerRetrievalFunction ( ) [ 'Accept' ] = 'application/hal+json' ;
        }
      }
    } ) ;


  // Function to begin the interactive element display.
  $viewMod.initiateView = function ( ) {
    jQuery ( '.initialPrompt' ) .text ( 'Retrieving information...' ) ;
    retrieveContentItem ( 1 , function ( ) {
      jQuery ( '.initialPrompt' ) .hide ( ) ;
      jQuery ( '.controlPanelWrapper' ) .show ( ) ;
      // Set up the interactive range selector.
      jQuery ( '.rangeInput' ) .slider (
        { 'tooltip' : 'show' ,
          'min' : 1 ,
          'max' : 5 ,
          'value' : 1
        }
        )
        .on ( 'slideStop' , function ( eventObject ) {
          if ( Number.isInteger ( eventObject [ 'value' ] ) && eventObject [ 'value' ] > 0 ) {
            retrieveContentItem ( eventObject [ 'value' ] ) ;
          }
        } ) ;
    } ) ;
  } ;


  // Allows navigation to a specific content item.
  $viewMod.navigateToItem = function ( contentIdentifier ) {
    retrieveContentItem ( contentIdentifier ) ;
  } ;


  // Placeholder data for the initially displayed content.
  $viewMod.currentDisplayItem = {
    'notice' : [ { 'value' : 'This sample data is embedded in the client-side bundle, not fetched from the remote server.' } ] ,
    'heading' : [ { 'value' : 'Decoupled CMS + AngularJS Client' } ] ,
    'mainText' : [ { 'value' : '<p>This demonstration illustrates how a dynamic front-end (AngularJS) can interact with a backend Content Management System to deliver an enhanced user experience. Utilize the numeric input below to begin loading various content items.</p>' } ]
  } ;


  // Utility function to fetch and display a content item.
  function retrieveContentItem ( contentIdentifier , onCompletion ) {
    var fetchedObject = contentAccessor .get ( { 'itemID' : contentIdentifier } , function ( ) {
      $viewMod.currentDisplayItem = fetchedObject ;
      if ( typeof onCompletion === "function" ) {
      // Execute the callback once data loading is confirmed.
        onCompletion ( contentIdentifier ) ;
      }
    } ) ;
  }

} ) ;