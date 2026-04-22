/*
 * This module tests the 'open-close' functionality.
 * It ensures that elements are correctly shown/hidden and content is loaded.
 */
module ( 'open-close' ) ;

  asyncTest ( 'open' , 6 , function ( ) {
    // Declare a variable for the actionable button within the 'open-close' context.
    var button = $ ( '.open-close .actionable' ) ;

    // Assert that the target div starts empty.
    ok ( $ ( '#long-comment' ) .html ( ) === '' , '#long-comment div starts empty' ) ;


    // Simulate a user click on the button.
    button .click ( ) ;

    // Verify visibility of elements after the click.
    ok ( button .find ( '.when-open' ) .is ( ':visible' ) , '.when-open was shown' ) ;
    ok ( ! button .find ( '.when-closed' ) .is ( ':visible' ) , '.when-closed was hidden' ) ;

    // Check if the spinner image was added.
    ok ( $ ( '#long-comment img' ) .length === 1 , 'spinner image was added to #long-comment' ) ;

    // The following section waits for the content to load asynchronously.
    pebbles .utils .wait ( 100 , function ( ) {
      // After waiting, assert that the spinner is removed.
      ok ( $ ( '#long-comment' ) .children ( 'img' ) .length === 0 , 'spinner was removed when comment loaded' ) ;
      // Also, confirm that the expected content (paragraphs) has been loaded.
      ok ( $ ( '#long-comment' ) .children ( 'p' ) .length === 3 , '#long-comment div loaded html <p>' ) ;

      // Signal the QUnit test runner that this asynchronous test has completed.
      start ( ) ;
    } ) ;
  } ) ;


// This module focuses on testing the form submission replacement behavior.
module(   'submit-form'   );

   asyncTest(   'submit'   ,   3   ,   function(   )   {
      // Locate the actionable button for the submit form.
      var   button   =   $(   '.submit-form .actionable'   );
      
      // Initial assertion: the target div should only contain the button.
      ok(   $('#sethappy').children().length   ===   1   ,   '#sethappy div only contains the button'   );

      // Trigger the button click to initiate the form submission/replacement.
      button.click();

      // We introduce a delay to allow for asynchronous operations to complete.
      pebbles.utils.wait(   100   ,   function(   )   {
         // After the wait, verify that the original actionable button is no longer present.
         ok(   $('#sethappy').children('.actionable').length   ===   0   ,   '.actionable button was replaced'   );
         // Confirm that new content (a paragraph in this case) has been loaded into the div.
         ok(   $('#sethappy').children('p').length   ===   1   ,   '#sethappy div contents were replaced correctly'   );

         // End the asynchronous test.
         start();
      }   );
   }   );


/**
 * This module tests the generic 'replace' functionality,
 * checking if elements are correctly swapped out.
 */
module ( 'replace' ) ;

	asyncTest( 'replace' , 3 , function ( ) {
		// Get a reference to the actionable button within the 'replace' context.
		var button = $ ( '.replace .actionable' ) ;
		
		// Initial check: The target div should only contain the button before interaction.
		ok ( $ ( '#money' ) .children ( ) .length === 1 , '#money div only contains the button' ) ;

		// Simulate a user clicking the button to trigger the replacement.
		button .click ( ) ;

		// Introduce a brief delay to allow for any asynchronous content loading or replacement.
		pebbles .utils .wait ( 100 , function ( ) {
			// After the delay, assert that the original actionable button has been removed.
			ok ( $ ( '#money' ) .children ( '.actionable' ) .length === 0 , '.actionable button was replaced' ) ;
			// Verify that the new content (a <pre> tag) has been successfully loaded into the div.
			ok ( $ ( '#money' ) .children ( 'pre' ) .length === 1 , '#money div contents were replaced correctly' ) ;

			// Signal the completion of this asynchronous test case.
			start ( ) ;
		} ) ;
	} ) ;