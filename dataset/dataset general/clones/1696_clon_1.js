/*
*
*
*    BootstrapForLimeSurvey
*    A Responsive LimeSurvey Template Based On Bootstrap
*    (c) 2013 mofog (http://mofog.github.io/BootstrapForLimeSurvey)
*
*    This file contains various JavaScript utilities for the template.
*
*/

(function waitForBfls( ) {

	// Set a timeout to allow the 'bfls' object to be defined.
	setTimeout( function( ) {

		// Check if the 'bfls' object is available globally.
		if ( ! ( typeof bfls === 'undefined' ) ) {

			// If bfls is defined, proceed with document ready.
			bfls( document ).ready( function( ) {

				// --- Setup Dialogs ---
				// Initialize the alert dialog functionality.
				setupAlertDialog( );
				// Initialize the confirmation dialog functionality.
				setupConfirmDialog( );

				// --- Fix LimeSurvey's CSS and JS ---
				// Apply necessary UI fixes and styling adjustments.
				fixUi( );

				// --- Progressbar Initialization ---
				// Configure and display the progress bar.
				setupProgressbar( );

				// --- Question Index Setup ---
				// Organize and style the question index.
				setupQuestionIndex( );

				// --- Question Groups Styling ---
				// Apply styling to question groups.
				setupQuestionGroups( );

				// --- Answers Formatting ---
				// Format and style the answer options.
				setupAnswers( );

				// --- Reset Form Handling ---
				// Prepare the reset form functionality.
				setupResetForm( );

				// --- Privacy Information Display ---
				// Arrange and display privacy-related information.
				setupPrivacyInfo( );

				// --- Save Form Configuration ---
				// Set up the save form interface.
				setupSaveForm( );

				// --- Load Form Configuration ---
				// Set up the load form interface.
				setupLoadForm( );

				// --- Registration Form Setup ---
				// Prepare the registration form.
				setupRegistrationForm( );

				// --- Surveylist Enhancements ---
				// Apply enhancements to the survey list.
				setupSurveylist( );

				// --- Error messages, e.g., survey has expired ---
				// Handle and display token messages or errors.
				setupTokenMessage( );

				// Show the main content area after all elements have been rendered.
				bfls( '.bflsMainContent' ).show( );

				// Check if there are any mandatory error messages.
				if ( bfls( '.errormandatory' ).length > 0 ) {
					// Scroll to the first mandatory error message.
					bfls( 'html, body' ).animate( {
						scrollTop: bfls( ".errormandatory" ).parent( ).parent( ).parent( ).parent( ).offset( ).top - 50
					}, 0 );
				}
				else {
					// Otherwise, scroll to the top of the page.
					bfls( 'html, body' ).animate( {
						scrollTop: 1
					}, 0 );
				}
			} );
		}
		else {
			// If bfls is not yet defined, retry after a delay.
			waitForBfls( );
		}
	}, 100 ); // Wait for 100 milliseconds before retrying.
})( ); // Immediately invoke the function.


// Function to apply various UI fixes and styling adjustments.
function fixUi( ) {

	// Handle 'moveprevbtn' button.
	value = bfls( '#moveprevbtn' ).text( );
	disabled = ( bfls( '#moveprevbtn' ).attr( 'aria-disabled' ) == 'true' ) ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
	bfls( '#moveprevbtn' ).replaceWith( '<button type="submit" id="moveprevbtn" value="moveprev" name="moveprev" accesskey="p" class="submit btn btn-default navbar-btn" role="button" ' + disabled + '>' + value + '</button>' );

	// Handle 'movenextbtn' button.
	value = bfls( '#movenextbtn' ).text( );
	disabled = ( bfls( '#movenextbtn' ).attr( 'aria-disabled' ) == 'true' ) ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
	bfls( '#movenextbtn' ).replaceWith( '<button type="submit" id="movenextbtn" value="movenext" name="movenext" accesskey="n" class="submit btn btn-default btn-primary navbar-btn" role="button" ' + disabled + '>' + value + '</button>' );

	// Handle 'movesubmitbtn' button.
	value = bfls( '#movesubmitbtn' ).text( );
	disabled = ( bfls( '#movesubmitbtn' ).attr( 'aria-disabled' ) == 'true' ) ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
	bfls( '#movesubmitbtn' ).replaceWith( '<button type="submit" id="movesubmitbtn" value="movesubmit" name="movesubmit" accesskey="l" class="submit btn btn-default btn-success navbar-btn" role="button" ' + disabled + '>' + value + '</button>' );

	// Handle submit button with name 'move'.
	if ( bfls( ':button[value="movesubmit"][name="move"]' ).length > 0 ) {
		value = bfls( ':button[value="movesubmit"][name="move"]' ).eq( 0 ).text( );
		disabled = ( bfls( ':button[value="movesubmit"][name="move"]' ).eq( 0 ).attr( 'aria-disabled' ) == 'true' ) ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
		bfls( ':button[value="movesubmit"][name="move"]' ).replaceWith( '<button type="submit" value="movesubmit" name="move" class="submit btn btn-default btn-success btn-block" role="button" ' + disabled + '>' + value + '</button>' );
	}

	/*
	// This block is commented out in the original code and remains so.
	value = bfls('a.clearall span').text();
	tmp2 = bfls('a.clearall').attr('href');
	tmp3 = bfls('a.clearall').attr('title');
	bfls('a.clearall').replaceWith('<a href="'+ tmp2 +'" class="clearall btn btn-default navbar-btn" title="'+ tmp3 +'" role="button">'+ value +'</a>');
	bfls('a.clearall').click(function(event){
		event.preventDefault();
		confirm(tmp3);
	});
	*/

	// Handle 'clearall' button.
	value = bfls( '#clearall' ).text( );
	disabled = ( bfls( '#clearall' ).attr( 'aria-disabled' ) == 'true' ) ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
	bfls( '#clearall' ).replaceWith( '<button type="submit" id="clearall" value="clearall" name="clearall" class="clearall btn btn-default navbar-btn" role="button" data-confirmedby="confirm-clearall" ' + disabled + '>' + value + '</button>' );

	// Handle 'loadallbtn' button.
	value = bfls( '#loadallbtn' ).text( );
	disabled = ( bfls( '#loadallbtn' ).attr( 'aria-disabled' ) == 'true' ) ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
	bfls( '#loadallbtn' ).replaceWith( '<button type="submit" id="loadallbtn" value="loadall" name="loadall" class="saveall btn btn-default navbar-btn" role="button" ' + disabled + '>' + value + '</button>' );

	// Handle 'saveallbtn' button.
	value = bfls( '#saveallbtn' ).text( );
	disabled = ( bfls( '#saveallbtn' ).attr( 'aria-disabled' ) == 'true' ) ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
	bfls( '#saveallbtn' ).replaceWith( '<button type="submit" id="saveallbtn" value="saveall" name="saveall" class="saveall btn btn-default navbar-btn" role="button" ' + disabled + '>' + value + '</button>' );

	// Add Bootstrap classes to various elements.
	bfls( ':button' ).addClass( 'btn btn-default' );
	bfls( 'select' ).addClass( 'form-control' );
	bfls( 'textarea' ).addClass( 'form-control' );

	bfls( '.languagechanger' ).addClass( 'navbar-btn' );

	bfls( '.navbar-header.pull-left' ).css( 'padding-top', '0px' );
	bfls( '.navbar-toggle' ).css( 'z-index', '9999' );
	bfls( '.navbar :button' ).addClass( 'navbar-btn' );

	// Reformat error paragraphs.
	bfls( 'p.error' ).replaceWith( '<p class="text-warning">' + bfls( 'p.error' ).html( ) + '</p>' );
}


// Function to set up and update the progress bar.
function setupProgressbar( ) {

	// Hide the progress wrapper initially.
	bfls( '#progress-wrapper' ).hide( );

	// Define a self-invoking function to update the progress bar.
	(function updateProgressbar( n ) {
		setTimeout( function( ) {
			// Check if the progress bar has been initialized by jQuery UI.
			if ( bfls( '#progress-wrapper #progressbar' ).hasClass( 'ui-progressbar' ) ) {
				// Get the current value of the progress bar.
				progressBarValue = bfls( '#progress-wrapper #progressbar' ).attr( 'aria-valuenow' );

				// Update Bootstrap progress bar attributes and style.
				bfls( '.progress .progress-bar' ).attr( 'aria-valuenow', progressBarValue );
				bfls( '.progress .progress-bar' ).css( 'width', progressBarValue + '%' );
				bfls( '.progress .progress-bar span.sr-only' ).html( progressBarValue + '% Complete' );
				// If progress is greater than 0, display the percentage.
				if ( progressBarValue > 0 ) {
					bfls( '.progress .progress-bar' ).append( '<span>' + progressBarValue + '%</span>' );
				}

				// Show the progress bar.
				bfls( '.progress' ).show( );

				// Adjust padding for the index if present.
				if ( bfls( '#index' ).length > 0 ) {
					bfls( '#index' ).css( 'padding-top', '40px' );
				}
			} else {
				// If not initialized, retry if 'n' is greater than 0.
				if ( n > 0 ) updateProgressbar( --n );
			}
		}, 10 ); // Retry every 10 milliseconds.
	})( 4 ); // Call with an initial retry count of 4.
}


// Function to set up the question index.
function setupQuestionIndex( ) {
	// Check if the question index exists.
	if ( bfls( '#index' ).length > 0 ) {
		// Unwrap the limesurvey container.
		bfls( '#limesurvey' ).unwrap( );
		// Wrap children of limesurvey into a content column.
		bfls( '#limesurvey' ).children( ).wrapAll( '<div class="col-md-8 content-col"></div>' );
		// Add an index column after the content column.
		bfls( '#limesurvey .content-col' ).after( '<div class="col-md-4 index-col"></div>' );
		// Move the index to the new index column.
		bfls( '#index' ).appendTo( '.index-col' );
		// Replace h2 with h1 in the index.
		bfls( '#index h2' ).replaceWith( '<h1>' + bfls( '#index h2' ).html( ) + '</h1>' );
		// Modify the container for panel styling.
		bfls( '#index .container' ).addClass( 'panel-body' ).removeClass( 'container' ).wrap( '<div class="panel panel-default"></div>' );
		// Remove 'row' class from specific divs.
		bfls( '#index div div.row' ).removeClass( 'row' );
		bfls( '#index div div ol li.row' ).removeClass( 'row' );
		// Add 'text-success' to list items.
		bfls( '#index div div ol li' ).addClass( 'text-success' );
		// Change styling for missing items.
		bfls( '#index div div ol li.missing' ).removeClass( 'text-success' ).addClass( 'text-muted' );
		// Change styling for current item.
		bfls( '#index div div ol li.current' ).removeClass( 'text-success' ).removeClass( 'text-danger' ).addClass( 'text-primary' );
		// Append a dot to header.
		bfls( '#index .hdr' ).append( '. ' );
		// Add 'text-success' to spans.
		bfls( '#index span' ).addClass( 'text-success' );
		// Change styling for current item spans.
		bfls( '#index .current span' ).removeClass( 'text-success' ).addClass( 'text-primary' );
		bfls( '#index .current span' ).next( ).removeClass( 'text-success' ).addClass( 'text-primary' );
		// Hide input elements in the index.
		bfls( '#index input' ).hide( );

		// Prevent the user from jumping around in a survey if question index mode is set to "complete",
		// since this appears to be buggy in LimeSurvey 2.05+.
		bfls( '#index button' ).remove( );
	}
}


// Function to set up question groups.
function setupQuestionGroups( ) {
	//bfls('.group .panel-body br').remove(); // Example of a commented out line.
	//bfls('.group :nth-child(n) span').removeAttr('style'); // Another commented out line.

	// Clear specific font styles from spans within groups.
	bfls( '.group :nth-child(n) span' ).css( 'font', '' ).css( 'font-family', '' ).css( 'font-variant', '' ).css( 'font-size', '' ).css( 'font-stretch', '' );

	// Append a dot to question numbers if they exist.
	if ( bfls( '.group .question-number' ).html( ) ) {
		bfls( '.group .question-number' ).append( '. ' );
	}
	// Add 'badge' class to question codes if they exist.
	if ( bfls( '.group .question-code' ).html( ) ) {
		bfls( '.group .question-code' ).addClass( 'badge' );
	}
}


// Function to set up answer elements.
function setupAnswers( ) {

	// Add styling to tips within answers.
	bfls( '.answer .tip' ).addClass( 'text-muted small' );
	// Add 'list-unstyled' class to answer unordered lists.
	bfls( '.answer .answer ul' ).addClass( 'list-unstyled' );

	// Iterate through each answer unordered list.
	bfls( '.answer .answer ul' ).each( function( index ) {
		var columnWidth; // Declare columnWidth.
		// Determine column width based on the number of list items.
		if ( bfls( '.answer .answer ul' ).eq( index ).children( 'li' ).length < 13 ) {
			columnWidth = Math.floor( 12 / bfls( '.answer .answer ul' ).eq( index ).children( 'li' ).length );
		}
		else {
			columnWidth = 12;
		}

		// Wrap list items in a row and then in columns.
		bfls( '.answer .answer ul' ).eq( index ).children( ).wrapAll( '<div class="row"></div>' );
		bfls( '.answer .answer ul' ).eq( index ).children( 'div' ).children( 'li' ).wrap( '<div class="col-md-' + columnWidth + '"></div>' );
	} );

	// Process radio button lists.
	bfls( '.answer .radio-list .radio-item' ).each( function( index ) {
		// Add 'othertext' class to labels for 'othertext' inputs.
		bfls( '.answer .radio-list .radio-item' ).eq( index ).children( 'label[for$="othertext"]' ).addClass( "othertext" );
		// Remove class attribute from input elements.
		bfls( '.answer .radio-list .radio-item' ).eq( index ).children( 'input' ).removeAttr( 'class' );
		// Prepend input to its corresponding label.
		bfls( '.answer .radio-list .radio-item' ).eq( index ).children( 'input' ).prependTo( bfls( '.answer .radio-list .radio-item' ).eq( index ).children( 'label[class!="othertext"]' ) );
		// Wrap labels in a 'radio' div.
		bfls( '.answer .radio-list .radio-item' ).eq( index ).children( 'label' ).wrap( '<div class="radio" style="padding-right: 20px;"></div>' );
	} );

	// Remove text nodes from hidden radio labels.
	bfls( '.answer .radio-list .radio-item div.radio label.hide' ).contents( ).filter( function( ) {
		return this.nodeType == 3;
	} ).remove( );
	// Unwrap input elements within hidden radio labels.
	bfls( '.answer .radio-list .radio-item div.radio label.hide input' ).unwrap( );

	// Add 'form-control' class to text input fields.
	bfls( '.answer input:text' ).addClass( 'form-control' );
	// Wrap tables in a responsive div.
	bfls( '.answer table' ).wrap( '<div class="table-responsive"></div>' );
	// Add Bootstrap table classes.
	bfls( '.answer table' ).addClass( 'table table-striped table-hover table-condensed' );
	// Replace table header cells with new th elements.
	bfls( '.answer table thead tr td' ).replaceWith( '<th>&nbsp;</th>' );
	// Replace help images with Bootstrap glyphicons.
	bfls( '.survey-question-help > img' ).replaceWith( '<span class="glyphicon glyphicon-info-sign pull-left">&nbsp;</span>' );

	// Unwrap strong tags within errormandatory elements.
	bfls( '.answer strong .errormandatory' ).unwrap( );
	// Add 'text-danger' class to errormandatory elements.
	bfls( '.answer .errormandatory' ).addClass( 'text-danger' );
	// Remove break tags within text-danger elements.
	bfls( '.answer .text-danger br' ).remove( );

	/*
	// This block is commented out in the original code.
	if (bfls('.answer .text-danger strong').length > 0) {
		bfls('.answer .text-danger strong').each(function(index){
			// This does not work, do not uncomment without adjustment.
			bfls('.answer .text-danger').append(bfls('.answer .text-danger strong span').html());
			bfls('.answer .text-danger strong').remove();
		});
	}
	*/

	/*
	// Function to fix emoticons, commented out in original.
	(function fixEmoticons(n){
		setTimeout(function(){
			if (bfls('.emoticon-2').length > 0) {
				bfls('.emoticon-2').css('margin-top', '0px');
			} else {
				if (n>0) fixEmoticons(--n);
			}
		}, 500);
	})(4);


	// Function to fix slider, commented out in original.
	(function fixSlider(n){
		setTimeout(function(){
			if (bfls('.slider-labels').length > 0) {
				bfls('.slider-labels').css('margin-bottom', '15px');
				bfls('.slider-labels').css('margin-left', '12px');
			} else {
				if (n>0) fixSlider(--n);
			}
		}, 500);
	})(4);


	// Function to update datepicker, commented out in original.
	(function updateDatepicker(n){
		setTimeout(function(){
			if (bfls('.ui-datepicker-trigger').length > 0) {
				bfls('.ui-datepicker-trigger').hide();
			} else {
				if (n>0) updateDatepicker(--n);
			}
		}, 500);
	})(4);
	*/


	// Handle upload button styling.
	if ( bfls( '.upload' ).length > 0 ) {
		bfls( '.upload' ).unwrap( '<h2>' );
		bfls( '.upload' ).addClass( 'btn btn-primary' );
	}

	// Process subquestions lists.
	if ( bfls( '.subquestions-list' ).length > 0 ) {
		bfls( '.subquestions-list li' ).each( function( index ) {
			// Move inputs inside their labels.
			bfls( '.subquestions-list li' ).eq( index ).children( 'input' ).appendTo( bfls( '.subquestions-list li' ).eq( index ).children( 'label' ) );
			// Wrap labels (not slider labels) in a checkbox div.
			bfls( '.subquestions-list li' ).eq( index ).children( 'label[class!="slider-label"]' ).wrap( '<div class="checkbox"></div>' );

			// Process options within subquestions.
			bfls( '.subquestions-list li' ).eq( index ).children( 'span.option' ).children( 'input' ).prependTo( bfls( '.subquestions-list li' ).eq( index ).children( 'span.option' ).children( 'label' ) );
			bfls( '.subquestions-list li' ).eq( index ).children( 'span.option' ).children( 'label' ).wrap( '<div class="checkbox"></div>' );
		} );
	}
}


// Function to set up the reset form.
function setupResetForm( ) {
	// Add Bootstrap button classes to reset links.
	bfls( '.clearall-results-restart a' ).addClass( 'btn btn-primary btn-lg' );
	bfls( '.clearall-results-close a' ).addClass( 'btn btn-danger btn-lg' );
}


// Function to set up privacy information display.
function setupPrivacyInfo( ) {
	// Move content from panel body span to panel heading h3.
	bfls( 'div.privacy .panel-heading h3' ).html( bfls( 'div.privacy .panel-body span' ).html( ) );
	// Remove the original span and break tags.
	bfls( 'div.privacy .panel-body span' ).remove( );
	bfls( 'div.privacy .panel-body br' ).remove( );
	// Get privacy content, clear panel body, and re-add wrapped in a paragraph.
	privacyTmp = bfls( 'div.privacy .panel-body' ).html( );
	bfls( 'div.privacy .panel-body' ).empty( );
	bfls( 'div.privacy .panel-body' ).append( '<p>' + privacyTmp + '</p>' );
}


// Function to set up the save form.
function setupSaveForm( ) {
	// Add form-control class to text and password inputs.
	bfls( '.save-form input:text' ).addClass( 'form-control' );
	bfls( '.save-form input:password' ).addClass( 'form-control' );
	// Add btn-primary class to save button.
	bfls( '.save-form #savebutton' ).addClass( 'btn btn-primary' );
	// Insert a new div for Bootstrap styled form.
	bfls( '.save-form' ).after( '<div class="save-form-bootstrap"></div>' );
	// Iterate through table rows to reformat form elements.
	bfls( '.save-form tr' ).each( function( index ) {
		// Extract label and field content.
		labelTmp = bfls( '.save-form tr' ).eq( index ).children( 'td' ).eq( 0 ).html( ).slice( 0, -1 );
		fieldTmp = bfls( '.save-form tr' ).eq( index ).children( 'td' ).eq( 1 ).html( );
		// If valid content, append to the new Bootstrap form div.
		if ( labelTmp.indexOf( '<img' ) == -1 && fieldTmp ) {
			bfls( '.save-form-bootstrap' ).append( '<div class="form-group group' + index + '"></div>' );
			bfls( '.save-form-bootstrap .form-group.group' + index ).append( labelTmp );
			bfls( '.save-form-bootstrap .form-group.group' + index ).append( fieldTmp );
		}
	} );
	// Remove the original save form.
	bfls( '.save-form' ).remove( );
}


// Function to set up the load form.
function setupLoadForm( ) {
	// Add form-control class to text and password inputs.
	bfls( '.load-form input:text' ).addClass( 'form-control' );
	bfls( '.load-form input:password' ).addClass( 'form-control' );
	// Add btn-primary class to load button.
	bfls( '.load-form #loadbutton' ).addClass( 'btn btn-primary' );
	// Insert a new div for Bootstrap styled form.
	bfls( '.load-form' ).after( '<div class="load-form-bootstrap"></div>' );
	// Iterate through table rows to reformat form elements.
	bfls( '.load-form tr' ).each( function( index ) {
		// Extract label and field content.
		labelTmp = bfls( '.load-form tr' ).eq( index ).children( 'td' ).eq( 0 ).html( ).slice( 0, -1 );
		fieldTmp = bfls( '.load-form tr' ).eq( index ).children( 'td' ).eq( 1 ).html( );
		// If valid content, append to the new Bootstrap form div.
		if ( labelTmp.indexOf( '<img' ) == -1 && fieldTmp ) {
			bfls( '.load-form-bootstrap' ).append( '<div class="form-group group' + index + '"></div>' );
			bfls( '.load-form-bootstrap .form-group.group' + index ).append( labelTmp );
			bfls( '.load-form-bootstrap .form-group.group' + index ).append( fieldTmp );
		}
	} );
	// Remove the original load form.
	bfls( '.load-form' ).remove( );
}


// Function to set up the registration form.
function setupRegistrationForm( ) {
	// Add form-control class to text and password inputs.
	bfls( '.register-form input:text' ).addClass( 'form-control' );
	bfls( '.register-form input:password' ).addClass( 'form-control' );
	// Add btn-primary class to register continue button.
	bfls( '.register-form #registercontinue' ).addClass( 'btn btn-primary' );
	// Append a new div for Bootstrap styled form.
	bfls( '.register-form form' ).append( '<div class="register-form-bootstrap"></div>' );
	// Iterate through table rows to reformat form elements.
	bfls( '.register-form tr' ).each( function( index ) {
		// Extract label and field content.
		labelTmp = bfls( '.register-form tr' ).eq( index ).children( 'td' ).eq( 0 ).html( ).slice( 0, -1 );
		fieldTmp = bfls( '.register-form tr' ).eq( index ).children( 'td' ).eq( 1 ).html( );
		// If valid content, append to the new Bootstrap form div.
		if ( labelTmp.indexOf( '<img' ) == -1 && fieldTmp ) {
			bfls( '.register-form-bootstrap' ).append( '<div class="form-group group' + index + '"></div>' );
			bfls( '.register-form-bootstrap .form-group.group' + index ).append( labelTmp );
			bfls( '.register-form-bootstrap .form-group.group' + index ).append( fieldTmp );
		}
	} );
	// Remove the original registration table.
	bfls( '.register-form table.register' ).remove( );
}


// Function to set up the survey list.
function setupSurveylist( ) {
	// If survey contact information exists, clean up parentheses spacing.
	if ( bfls( '.survey-list-table .survey-contact' ).length > 0 ) {
		bfls( '.survey-list-table .survey-contact' ).html( bfls( '.survey-list-table .survey-contact' ).html( ).replace( '( ', '(' ).replace( ' )', ')' ) );
	}
}


// Function to set up token messages.
function setupTokenMessage( ) {
	// Check if a token message paragraph exists.
	if ( bfls( 'p#tokenmessage' ).length > 0 ) {
		// Wrap the message in a 'well' div for styling.
		bfls( 'p#tokenmessage' ).wrap( '<div class="well"></div>' );
		// Replace the error span with an h1 containing its content.
		bfls( 'p#tokenmessage span.error' ).replaceWith( '<h1>' + bfls( 'p#tokenmessage span.error' ).html( ) + '</h1>' );
		// Remove redundant break tags.
		bfls( 'p#tokenmessage h1 + br' ).remove( );
		bfls( 'p#tokenmessage h1 + br' ).remove( );
		bfls( 'p#tokenmessage br + br' ).remove( );

		// Clean up parentheses spacing in the token message HTML.
		bfls( 'p#tokenmessage' ).html( bfls( 'p#tokenmessage' ).html( ).replace( '( ', '(' ).replace( ' )', ')' ) );
	}
}


// Function to set up a custom alert dialog using Bootstrap modal.
function setupAlertDialog( ) {
	// Override the native window.alert function.
	window.alert = function( message ) {
		console.log( message ); // Log the message to console.
		var id = new Date( ).getTime( ); // Generate a unique ID for the modal.
		// Append the modal HTML structure to the body.
		bfls( 'body' ).append( ' \
			<div class="modal fade" id="alertModal' + id + '"> \
			  <div class="modal-dialog"> \
			    <div class="modal-content"> \
			      <div class="modal-header"> \
			        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
			        <h4 class="modal-title">Info</h4> \
			      </div> \
			      <div class="modal-body"> \
			        <p>' + message + '</p> \
			      </div> \
			      <div class="modal-footer"> \
			        <button type="button" class="btn btn-default" data-dismiss="modal">Okay</button> \
			      </div> \
			    </div><!-- /.modal-content --> \
			  </div><!-- /.modal-dialog --> \
			</div><!-- /.modal --> \
		' );
		// Show the newly created modal.
		bfls( '#alertModal' + id ).modal( 'show' );
	};
}


// Function to set up a custom confirm dialog using Bootstrap modal.
function setupConfirmDialog( ) {
	// Override the native window.confirm function.
	window.confirm = function( message ) {
		console.log( message ); // Log the message to console.
		var id = new Date( ).getTime( ); // Generate a unique ID for the modal.
		// Append the modal HTML structure to the body.
		bfls( 'body' ).append( ' \
			<div class="modal fade" id="alertModal' + id + '"> \
			  <div class="modal-dialog"> \
			    <div class="modal-content"> \
			      <div class="modal-header"> \
			        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
			        <h4 class="modal-title">Mhh...</h4> \
			      </div> \
			      <div class="modal-body"> \
			        <p>' + message + '</p> \
			      </div> \
			      <div class="modal-footer"> \
			        <button type="button" class="btn btn-default" data-dismiss="modal">&nbsp;&nbsp;<span class="glyphicon glyphicon-thumbs-down"></span>&nbsp;&nbsp;</button> \
							<button type="button" class="btn btn-primary" onclick="window.location=\'index/sid/' + bfls( '#sid' ).attr( 'value' ) + '/newtest/Y\';">&nbsp;&nbsp;<span class="glyphicon glyphicon-thumbs-up"></span>&nbsp;&nbsp;</button> \
			      </div> \
			    </div><!-- /.modal-content --> \
			  </div><!-- /.modal-dialog --> \
			</div><!-- /.modal --> \
		' );
		// Show the newly created modal.
		bfls( '#alertModal' + id ).modal( 'show' );
	};
}