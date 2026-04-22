var app = angular.module( 'dialogApp', [ 'dialogService' ] ) ; // Initialize the main Angular application module

// Controller for handling button clicks and initiating dialogs
app.controller( 'buttonCtrl', [ '$scope', '$log', 'dialogService',

	function ( $scope, $log, dialogService ) {

		// Function to open a dialog using a template from a script tag
		$scope.openFromScriptClick = function () {
			doDialog( "template-from-script.html" ) ;
		} ;

		// Function to open a dialog using a template loaded from a URL
		$scope.openFromUrlClick = function () {
			doDialog( "template-from-url.html" ) ;
		} ;


		/**
		 * Helper function to open a generic dialog.
		 * @param {string} template - The path or ID of the template to use for the dialog.
		 */
		function doDialog( template ) {

			// Define the data model for the dialog content
			var model = {
				firstName : "Jason",
				lastName  : "Stadler"
			} ;

			// Configure jQuery UI dialog options
			var options = {
				autoOpen : false, // Dialog will not open automatically
				modal    : true,  // Dialog will be modal (user must interact with it)

				// Callback function executed when the dialog is closed
				close    : function ( event, ui ) {
					$log.debug( "Predefined close handler activated." ) ;
				}
			} ;

			// Use the dialogService to open the dialog
			dialogService.open( "myDialog", template, model, options )
				.then(
					// Success callback for when the dialog is closed successfully
					function ( result ) {
						$log.debug( "Dialog closed with success." ) ;
						$log.debug( result ) ; // Log the result passed from the dialog
					},
					// Error callback for when the dialog is cancelled
					function ( error ) {
						$log.debug( "Dialog operation cancelled." ) ;
					}
				) ;

		} /* End of doDialog function */

	} // End of buttonCtrl controller function
] ) ;


// Controller for managing actions within the main dialog itself
app.controller( 'dialogCtrl', [ '$scope', 'dialogService',

	function ( $scope, dialogService ) {

		// Note: $scope.model automatically contains the object passed to dialogService.open as config.model

		// Action to save changes and close the dialog
		$scope.saveClick = function () {
			dialogService.close( "myDialog", $scope.model ) ; // Close with the current model state
		} ;


		// Action to cancel the dialog operation
		$scope.cancelClick = function () {
			dialogService.cancel( "myDialog" ) ; // Cancel the dialog
		} ;


		// Action to open a confirmation dialog
		$scope.confirmClick = function () {
			// This will open a nested confirmation dialog
			dialogService.open( "myConfirm", "confirmTemplate.html" )
				.then(
					function ( result ) {
						console.log( "Confirmation dialog confirmed." ) ;
					},
					function ( error ) {
						console.log( "Confirmation dialog cancelled." ) ;
					}
				) ;
		} ;

	} // End of dialogCtrl controller function
] ) ;


// Controller specifically for the confirmation dialog
app.controller( 'confirmCtrl', [ '$scope', 'dialogService',

	function ( $scope, dialogService ) {

		// Action to confirm and close the confirmation dialog
		$scope.confirmClick = function () {
			dialogService.close( "myConfirm" ) ; // Close the confirmation dialog
		} ;


		// Action to cancel the confirmation dialog
		$scope.cancelClick = function () {
			dialogService.cancel( "myConfirm" ) ; // Cancel the confirmation dialog
		} ;

	} // End of confirmCtrl controller function
] ) ;