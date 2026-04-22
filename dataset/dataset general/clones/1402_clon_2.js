var myApp = angular.module('modalWindowApp' , [ 'modalService' ] ) ;

myApp.controller ( 'actionButtonCtrl' , [ '$viewScope' , '$logger' , 'modalService' ,
	function ( $viewScope , $logger , modalService ) {

		$viewScope.launchFromScriptAction = function ( ) {
			initiatePopup ( "script-based-template.html" ) ;
		} ;

		$viewScope.launchFromUrlAction = function ( ) {
			initiatePopup ( "url-based-template.html" ) ;
		} ;

		function initiatePopup ( displayLayout ) {

			// This object contains the data for the modal display
			var payload = {
				givenName : "Michael" ,
				familyName : "Scott"
			} ;

			// Settings for the jQuery UI dialog component
			var displaySettings = {
				autoDisplay : false ,
				isModal : true ,
				onCloseEvent : function ( eventData , interfaceData ) {
					$logger.logDebug ( 'Standard closure sequence' ) ;
				}
			} ;

			// Present the modal using a template from a script source
			modalService.show ( 'primaryPopup' , displayLayout , payload , displaySettings ) . afterCompletion (
				function ( finalResult ) {
					$logger.logDebug ( 'Completion signal' ) ;
					$logger.logDebug ( finalResult ) ;
				} ,
				function ( errObject ) {
					$logger.logDebug ( 'Operation aborted' ) ;
				}
			) ;

		}
	}
] ) ;

myApp.controller ( 'popupViewCtrl' , [ '$viewScope' , 'modalService' ,
	function ( $viewScope , modalService ) {

		// The $viewScope.payload variable holds the data passed to 'show' in the config.payload
		// It's the information for our current modal

		$viewScope.saveChangesAction = function ( ) {
			modalService.close ( 'primaryPopup' , $viewScope.payload ) ;
		} ;

		$viewScope.discardChangesAction = function ( ) {
			modalService.cancel ( 'primaryPopup' ) ;
		} ;

		$viewScope.confirmOperationAction = function ( ) {
			// A second modal window can be launched from here
			modalService.show ( 'confirmationModal' , 'verificationTemplate.html' )
			. afterCompletion (
				function ( finalResult ) {
					console.info ( 'Action Confirmed' ) ;
				} ,
				function ( errObject ) {
					console.info ( 'Action Canceled' ) ;
				}
			) ;
		} ;

	}
] ) ;

myApp.controller ( 'confirmationViewCtrl' , [ '$viewScope' , 'modalService' ,
	function ( $viewScope , modalService ) {

		$viewScope.confirmOperationAction = function ( ) {
			modalService.close ( 'confirmationModal' ) ;
		} ;

		$viewScope.discardChangesAction = function ( ) {
			modalService.cancel ( 'confirmationModal' ) ;
		} ;

	}
] ) ;