'use strict';

// This module handles dynamic tag input functionality
angular.module(  'tagInputModule' , [ ]  )
	.filter(  'extractField'  ,   function ( )  {
		return function ( collection ,   fieldName  ) {
			// Ensure collection is valid before mapping
			return collection  && collection.map ( function ( element ) {
				return element[fieldName];
			}  ) .join ( ',' ) ;
		} ;
	} )
	.directive (  'autoFocus'  ,  [ '$timeout' ,   '$parse' ,   function ( delayService ,   parserService ) {
		return {
			link: function (   currentScope  ,   domElement  ,   attributes  )  {
				var parsedExpression  = parserService ( attributes.autoFocus ) ;

				// Watch the specified model for changes to trigger focus
				currentScope.$watch( parsedExpression ,  function ( currentValue )  {
					if ( currentValue  ===  true )  {
						delayService ( function ( )  {
							domElement [ 0 ] .focus ( ) ; // Apply focus to the native element
						} ) ;
					}
				} ) ;

				// Blur event handler to reset focus state
				domElement.bind (  'blur'  ,  function ( )  {
					currentScope.$apply ( parsedExpression.assign ( currentScope ,   false ) ) ;
				} ) ;
			}
		};
	} ] )
	.directive (  'itemTagInput'  ,   function ( )  {
		return {
			restrict: 'AE' ,
			/* No ngModel requirement here, direct binding */
			scope: {
				itemsList: '=ngModel' // Bind the list of items
			} ,
			replace: true ,
			templateUrl: 'taggingWidget.html' , // Path to the template for this component
			controller: [  '$scope'  ,   '$attrs'  ,   '$element'  ,   '$http'  ,   '$filter'  ,
				function ( localScope ,   componentAttributes ,   componentElement ,   httpClient ,   dataProcessor )  {

					localScope.settings = [ ] ; // Initialize configuration array
					localScope.settings.displayField = componentAttributes.outputField  ||  'label' ;
					localScope.settings.dataSource = componentAttributes.fetchUrl  ||  'data_suggestions.php?q=' ;
					localScope.settings.inputPrompt = componentAttributes.promptText  ||  'Type new entry...' ;
					localScope.settings.remoteOnly = componentAttributes.remoteSourceOnly  ||  0 ;
					localScope.queryText = '' ;

					// Monitor changes in the search input for fetching suggestions
					localScope.$watch ( 'queryText' ,   function ( )  {
						httpClient.get ( localScope.settings.dataSource  +  localScope.queryText ) .success ( function ( apiResponse )  {
							localScope.availableResults  =  apiResponse.data ; // Store fetched suggestions
							// console.info("API response received:", apiResponse);
						} ) ;
					} ) ;

					// Function to append a new item to the list
					localScope.appendItem  =  function ( itemId ,   itemLabel )  {
						localScope.itemsList.push ( { 'ident': itemId ,   'label': itemLabel } ) ;
						localScope.queryText  =  '' ; // Clear the input field
						localScope.$apply ( ) ;
					} ;

					// Function to remove an item by its position
					localScope.removeItemAt  =  function ( itemPosition )  {
						localScope.itemsList.splice ( itemPosition ,   1 ) ;
					} ;

					// Handle keyboard events on the input field
					componentElement.find ( 'input' ) .on ( 'keydown' ,   function ( keyboardEvent )  {
						var importantKeys  =  [ 8 ,   13 ,   32 ] ; // Backspace, Enter, Space
						if ( importantKeys.indexOf ( keyboardEvent.which )  !==  -1 )  {
							if ( keyboardEvent.which  ==  8 )  { /* Backspace key pressed */
								if ( localScope.queryText.length  ===  0  &&  localScope.itemsList.length )  {
									localScope.itemsList.pop ( ) ; // Remove the last item
									keyboardEvent.preventDefault ( ) ; // Prevent default backspace behavior
								}
							}
							else if ( keyboardEvent.which  ==  32  ||  keyboardEvent.which  ==  13 )  { /* Space or Enter key */
								if ( localScope.queryText.length  &&  !localScope.settings.remoteOnly )  {
									// Add as a new item if not in API-only mode
									localScope.appendItem ( null ,   localScope.queryText ) ;
									keyboardEvent.preventDefault ( ) ; // Prevent form submission or space insertion
								}
							}
							localScope.$apply ( ) ; // Ensure scope updates reflect immediately
						}
					} ) ;

				} ]
		} ;
	} ) ;