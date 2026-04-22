DomUtil( pageContent ) . contentLoaded ( function ( dom ) {

	// Obtain the necessary module responsible for managing section-based annotations.
	var SectionAnnotationManager = obtainModule( 'section-annotations' ) ;

	// Retrieve initial remark data and user profile information from the backend source.
	var segmentRemarks = annotationDataSource . remarks ;
	var currentViewerProfile = annotationDataSource . userInfo ;

	// Extract security tokens and content identifiers required for API interactions.
	var securityKey = annotationDataSource . securityToken ;
	var associatedContentId = annotationDataSource . contentId ;
	var apiServiceEndpoint = annotationDataSource . ajaxEndpoint ;
	var mainContainerQuery = annotationDataSource . targetContainerSelector ;

	// Structure the current viewer's details into the format expected by the annotation library.
	activeUser = {
		identifier : currentViewerProfile . userID ,
		avatarLink : currentViewerProfile . avatarURL ,
		displayAlias : currentViewerProfile . userName
	};

	// Prepare an array to hold the structured data for annotation segments.
	var structuredAnnotationList = [ ] ;
	var segmentIndex ; // An iterator for looping through remark segments.

	// Iterate through all retrieved remark segments and reformat them.
	for ( segmentIndex in segmentRemarks ) {

		// Verify that the property is an own property and represents a valid array index.
		if ( validateArrayIndex ( segmentRemarks , segmentIndex ) ) {

			// Construct an object for each individual annotation segment.
			var annotationSegmentDetails = {
				'segmentId' : segmentIndex ,
				'notes' : segmentRemarks[ segmentIndex ]
			};

			// Add the newly formatted segment to our collection.
			structuredAnnotationList . push ( annotationSegmentDetails ) ;

		} // End of conditional check for valid index.

	} // End of loop for remark segments.

	// Instantiate the SectionAnnotationManager, passing the target DOM element, current user, and existing notes.
	annotationController = new SectionAnnotationManager( mainContainerQuery , activeUser , structuredAnnotationList ) ;

	// Helper function to reliably determine if a property name is a valid array index.
	// (Reference: http://stackoverflow.com/questions/9329446/how-to-do-for-each-over-an-array-in-javascript)
	function validateArrayIndex ( collection , propName ) {
		return collection . hasOwnProperty ( propName ) && /^0$|^[1-9]\d*$/ . test ( propName ) && propName <= 4294967294 ; // Maximum index for a JavaScript array (2^32 - 2).
	}


	var lastAddedNoteIdentifier ; // Variable to store the unique ID of an annotation after it's been successfully added.

	// Set up an event listener to respond when a new annotation is submitted by a user.
	annotationController . attachEventHandler ( 'annotationAdded' , function ( newAnnotation ) {

		// Initiate an asynchronous request to the server to persist the new annotation data.
		dom . ajaxRequest ( {
			targetUrl : apiServiceEndpoint ,
			responseType : 'json' ,
			requestMethod : 'POST' ,
			payloadData : {
				operation : 'submit_annotation' ,
				securityToken : securityKey ,
				contentRefId : associatedContentId ,
				targetSegmentId : newAnnotation . segmentId ,
				annotationText : newAnnotation . contentBody ,
				authorName : newAnnotation . contributorName ,
				authorRefId : newAnnotation . contributorId
			} ,
			onSuccess : function ( serverResponse ) {

				// Evaluate the server's response to confirm the success of the operation.
				if ( serverResponse . outcomeStatus === 'success' ) {

					// Update the local annotation object with the unique ID assigned by the server.
					newAnnotation . identifier = serverResponse . newEntryId ;
					lastAddedNoteIdentifier = serverResponse . newEntryId ;

					// Insert the newly confirmed annotation into the visual interface.
					var insertedNoteReference = annotationController . insertAnnotation ( newAnnotation ) ;

				} else {

					// Log a message if the server indicated a non-successful outcome.
					// console . error ( 'Annotation submission failed: Server did not report success.' , serverResponse ) ;

				}

			} ,
			onError : function ( xhrRequest , statusMessage , thrownError ) {

				// Record detailed error information if the AJAX request itself failed.
				// console . error ( 'AJAX error during annotation submission:' , [ xhrRequest , statusMessage , thrownError ] ) ;

			}
		} ) ; // End of AJAX request for posting annotation.

	} ) ; // End of 'annotationAdded' event listener.

	// Configure an event handler for when an existing annotation is marked for deletion.
	// Please refer to the library's documentation for more comprehensive details on this event.
	annotationController . attachEventHandler ( 'annotationRemoved' , function ( deletedAnnotation ) {

		// Dispatch an AJAX request to the backend to process the deletion of the annotation.
		dom . ajaxRequest ( {
			targetUrl : apiServiceEndpoint ,
			responseType : 'json' ,
			requestMethod : 'POST' ,
			payloadData : {
				operation : 'remove_annotation_entry' ,
				securityToken : securityKey ,
				contentRefId : associatedContentId ,
				entryIdentifier : deletedAnnotation . identifier
			} ,
			onSuccess : function ( serverResponse ) {

				// Confirm that the server's response indicates a successful deletion.
				if ( serverResponse . outcomeStatus === 'success' ) {

					// The segment ID is retained for context during local UI removal.
					deletedAnnotation . segmentId = deletedAnnotation . segmentId ;

					// Proceed to remove the annotation from the displayed user interface.
					annotationController . deleteAnnotationEntry ( deletedAnnotation . segmentId , lastAddedNoteIdentifier ) ;

				} else {

					// Output a message if the server did not confirm the deletion operation.
					console . warn ( 'Annotation removal failed: Server did not respond with success status.' ) ;
					console . log ( serverResponse ) ;

				}

			} ,
			onError : function ( xhrRequest , statusMessage , thrownError ) {
				console . error ( 'Error encountered during annotation removal request:' ) ;
				console . log ( xhrRequest ) ;
				console . log ( statusMessage ) ;
				console . log ( thrownError ) ;
			}
		} ) ; // End of AJAX request for deleting annotation.

		// An illustrative example of a direct HTTP DELETE request (commented out, as in the original).
		// dom . ajaxRequest ( {
		// 	targetUrl : '/annotations/' + noteId ,
		// 	requestMethod : 'DELETE' ,
		// 	onSuccess : function ( operationSuccess ) {
		// 		// Perform actions upon successful deletion.
		// 	}
		// } ) ;

	} ) ; // End of 'annotationRemoved' event handler.


	// Bind a click event to elements designated as 'note-trigger-element' within 'marginal-comment-unit's.
	// This action toggles an 'active-focus' CSS class on the immediate parent annotatable area.
	dom ( ".note-trigger-element" , ".marginal-comment-unit" ) . attachEventHandler ( 'click' , function ( ) {

	 	if ( ! dom ( this ) . parent ( ) . checkClass ( 'active-focus' ) ) {
 	 		dom ( this ) . parent ( ) . parent ( 'div.annotatable-area' ) . applyClass ( 'active-focus' ) ;
 	 	} else {
 	 		dom ( this ) . parent ( ) . parent ( 'div.annotatable-area' ) . clearClass ( 'active-focus' ) ;
 	 	}
 	} ) ; // End of note-trigger-element click handler.


	// Establish a broad click handler on the primary content area or the entire HTML document.
	// This handler's purpose is to remove the 'active-focus' class from any annotatable areas
	// if a click originates outside the boundaries of the annotation interface (containers or triggers).
	dom ( '#mainContentArea, html' ) . attachEventHandler ( 'click' , function ( clickEvent ) {
		var clickedTarget = dom ( clickEvent . target ) ; // Capture the specific DOM element that was clicked.
		if ( clickedTarget . matchesSelector ( '.annotation-area-wrapper, .note-trigger-element' ) || clickedTarget . findAncestors ( ) . matchesSelector ( '.annotation-area-wrapper, .note-trigger-element' ) ) {
			return ; // If the click occurred within the annotation UI, no action is needed.
	   } else { // If the click was external, clear all active annotation views.
	     dom ( ".annotatable-area" ) . clearClass ( "active-focus" ) ;
	   }
	} ) ; // End of global click handler.


	// Attach a click event to all '.note-trigger-element's to enable smooth scrolling functionality.
	// Upon clicking, the browser viewport will smoothly scroll to align with the top of the associated parent element.
	dom ( ".note-trigger-element" ) . handleTap ( function ( ) {
	    dom ( 'html, body' ) . smoothScroll ( {
	        verticalOffset : dom ( this ) . parent ( ) . positionData ( ) . top
	    } , 500 ) ;
	} ) ; // End of note-trigger-element scroll handler.


	// This block applies specialized scroll behavior only when the viewport width exceeds a certain threshold (e.g., for desktop displays).
	if ( dom ( window ) . viewportWidth ( ) > 767 ) {

		// Intercept mousewheel and DOMMouseScroll events on the annotation list within its wrapper.
		// This prevents the main document from scrolling when the user's mouse pointer is hovering over the annotation panel.
		dom ( '.annotation-area-wrapper .annotation-list' ) . attachEvent ( 'mousewheel DOMMouseScroll' , function ( scrollEvent ) {
			var originalScrollEvent = scrollEvent . originalEvent ,
			    scrollDirectionDelta = originalScrollEvent . wheelDelta || - originalScrollEvent . detail ;

			this . scrollTop += ( scrollDirectionDelta < 0 ? 1 : -1 ) * 30 ; // Adjust the scroll position of the annotation panel.
			scrollEvent . haltDefault ( ) ; // Prevent the browser's default scrolling action for the main page.
		} ) ; // End of custom scroll event handler.

	} // End of conditional block for viewport width.

} ) ; // End of DomUtil contentLoaded function.