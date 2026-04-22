( function ( $ ) {

	// This block of code is designed to provide placeholder functionality
	// for web browsers that do not natively support the 'placeholder' attribute
	// on input elements. It's a polyfill for older browsers.
	//
	// Original author: Dan Bentley
	// License: Apache License 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
	// Source: github.com/danbentley
	//
	// This implementation uses jQuery for DOM manipulation and event handling.

	// First, we check if the browser already supports the 'placeholder' attribute.
	// If it does, there's no need to execute the polyfill, so we return immediately.
	if ( "placeholder" in document . createElement ( "input" ) ) {
		return;
	}

	// Wait for the entire DOM (Document Object Model) to be fully loaded and parsed.
	// This ensures that all elements are available before we try to modify them.
	$ ( document ) . ready ( function ( ) {

		// Select all input elements that have a 'placeholder' attribute,
		// but exclude password fields, as they require a different handling approach.
		$ ( ':input[placeholder]' ) . not ( ':password' ) . each ( function ( ) {
			// For each matched input, initialize its placeholder behavior.
			setupPlaceholder ( $ ( this ) );
		} );

		// Now, handle the password input fields separately.
		$ ( ':password[placeholder]' ) . each ( function ( ) {
			// Set up special placeholder handling for password inputs.
			setupPasswords ( $ ( this ) );
		} );

		// Attach a submit event handler to all forms on the page.
		$ ( 'form' ) . submit ( function ( e ) {
			// Before the form is submitted, clear any placeholder text
			// that might still be present in the input fields.
			clearPlaceholdersBeforeSubmit ( $ ( this ) );
		} );

	} ) ;


	// This function initializes the placeholder behavior for a standard text input.
	function setupPlaceholder ( input ) {

		// Retrieve the actual placeholder text from the input's 'placeholder' attribute.
		var placeholderText = input . attr ( 'placeholder' ) ;

		// Set the placeholder text if the input is empty, or flag it as changed if it has a value.
		setPlaceholderOrFlagChanged ( input , placeholderText ) ;

		// Attach event handlers for 'focus', 'blur', and 'change' events.
		input . focus ( function ( e ) {
			// If the input's value has been changed by the user, do nothing.
			if ( input . data ( 'changed' ) === true ) {
				return ;
			}
			// If the current value is the placeholder text, clear it when focused.
			if ( input . val ( ) === placeholderText ) {
				input . val ( '' ) ;
			}
		} ) . blur ( function ( e ) {
			// When the input loses focus, if it's empty, restore the placeholder text.
			if ( input . val ( ) === '' ) {
				input . val ( placeholderText ) ;
			}
		} ) . change ( function ( e ) {
			// On change, update a data flag indicating whether the user has
			// entered actual content (i.e., it's not the placeholder).
			input . data ( 'changed' , input . val ( ) !== '' ) ;
		} ) ;
	}


	// Helper function to either set the placeholder or mark the input as changed.
	function setPlaceholderOrFlagChanged ( input , text ) {
		// If the input is empty, set its value to the placeholder text.
		// Otherwise, if it already contains data, mark it as 'changed'.
		( input . val ( ) === '' ) ? input . val ( text ) : input . data ( 'changed' , true ) ;
	}


	// This function handles the specific requirements for placeholder functionality
	// in password input fields, which cannot directly show placeholder text.
	function setupPasswords ( input ) {
		// Create a new text input element that will act as the visible placeholder.
		var passwordPlaceholder = createPasswordPlaceholder ( input ) ;
		// Insert the newly created placeholder element immediately after the actual password input.
		input . after ( passwordPlaceholder ) ;

		// Determine initial visibility: if password input is empty, show placeholder; otherwise, hide placeholder.
		( input . val ( ) === '' ) ? input . hide ( ) : passwordPlaceholder . hide ( ) ;

		// Attach a blur event handler to the actual password input.
		$ ( input ) . blur ( function ( e ) {
			// If the password field has a value, do nothing.
			if ( input . val ( ) !== '' ) {
				return ;
			}
			// If it's empty, hide the password field and show the placeholder.
			input . hide ( ) ;
			passwordPlaceholder . show ( ) ;
		} ) ;

		// Attach a focus event handler to the placeholder input.
		$ ( passwordPlaceholder ) . focus ( function ( e ) {
			// When the placeholder is focused, hide it, show the actual password input, and focus it.
			input . show ( ) . focus ( ) ;
			passwordPlaceholder . hide ( ) ;
		} ) ;
	}


	// Generates a read-only text input that serves as a visual placeholder for password fields.
	function createPasswordPlaceholder ( input ) {
		return $ ( '<input>' ) . attr ( {
			// Copy the placeholder text from the original password input.
			placeholder : input . attr ( 'placeholder' ) ,
			// Set the value to be the placeholder text initially.
			value : input . attr ( 'placeholder' ) ,
			// Copy the ID from the original input (optional, but good for accessibility/labels).
			id : input . attr ( 'id' ) ,
			// Make this placeholder input read-only to prevent user input directly into it.
			readonly : true
		} ) . addClass ( input . attr ( 'class' ) ) ; // Copy existing CSS classes.
	}


	// This function is called before a form is submitted to ensure that
	// placeholder text is not submitted as actual user data.
	function clearPlaceholdersBeforeSubmit ( form ) {
		// Find all input fields within the form that have a 'placeholder' attribute.
		form . find ( ':input[placeholder]' ) . each ( function ( ) {
			// If the field's value has been changed by the user, leave it as is.
			if ( $ ( this ) . data ( 'changed' ) === true ) {
				return ;
			}
			// If the current value is still the placeholder text, clear it.
			if ( $ ( this ) . val ( ) === $ ( this ) . attr ( 'placeholder' ) ) {
				$ ( this ) . val ( '' ) ;
			}
		} ) ;
	}

} ) ( jQuery ) ;