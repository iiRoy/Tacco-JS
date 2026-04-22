/*
 * This file contains a comprehensive suite of tests for the Message Center module.
 * It specifically focuses on scenarios involving a single message directive instance.
 *
 * All tests are written using a Behavior-Driven Development (BDD) style
 * with 'describe' and 'it' blocks, leveraging the Protractor/Jasmine framework.
 */
describe ('Message Center with single directive' , function ( ) {

  // Before each test in this suite, load the 'MessageCenterModule'.
  // This ensures a clean state for every test case.
  beforeEach ( module ( 'MessageCenterModule' ) ) ;

  /*
   * Navigate to the base index.html page before each test execution.
   * This sets up the initial environment for the UI tests.
   */
  beforeEach ( function ( ) { browser ( ) . navigateTo ( '/index.html' ) ; } ) ;


  // Test case: Initial state verification.
  // Expects the message wrapper to exist but contain no actual messages.
  it ( 'renders an empty ordered list on its initial state' , function ( ) {
    // Check if the main message wrapper element is present in the DOM.
    expect ( element ( 'div#mc-messages-wrapper' ) . count ( ) ) . toBe ( 1 ) ;

    // Verify that there are no alert messages inside the wrapper initially.
    expect ( element ( 'div#mc-messages-wrapper .alert' ) . count ( ) ) . toBe ( 0 ) ;
  } ) ;


  // Nested describe block for tests within the same view context.
  // This group focuses on messages that do not persist across route changes.
  describe ( 'when on the same view' , function ( ) {

    // Before each test in this specific group, click the '#goEdit' element.
    // This action might trigger some initial state or routing pertinent to this group.
    beforeEach ( function ( ) { element ( '#goEdit' ) . click ( ) ; } ) ;

    // Test case: Rendering a single message with the default success level.
    it ( 'renders a message with the default "success" level' , function ( ) {
      // Simulate a user action that triggers a success message.
      element ( '#saveSuccess' ) . click ( ) ;

      // Retrieve all alert messages displayed on the page.
      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;

      // Assert that exactly one message is displayed.
      expect ( messages . count ( ) ) . toBe ( 1 ) ;

      // Verify the CSS class of the message, confirming it's a success alert.
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;

      // Check the text content of the message.
      expect ( messages . text ( ) ) . toMatch ( 'Saved successfully!' ) ;
    } ) ;


    // Test case: Rendering a single message with a custom level and text.
    it ( 'renders a message with the level and text provided' , function ( ) {
      // Trigger a failure message.
      element ( '#saveFailure' ) . click ( ) ;

      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;

      // Expect one message.
      expect ( messages . count ( ) ) . toBe ( 1 ) ;

      // Verify the message class indicates a danger/failure alert.
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-danger fade in' ) ;

      // Verify the specific error message text.
      expect ( messages . text ( ) ) . toMatch ( 'Something went wrong!' ) ;
    } ) ;

    // Test case: Rendering multiple messages, all with default success.
    it ( 'renders multiple messages with the default "success" level and text' , function ( ) {
      // Trigger multiple success messages.
      element ( '#saveMultipleSuccess' ) . click ( ) ;

      // Get the first alert message.
      var yay = element ( 'div#mc-messages-wrapper .alert:first' ) ;

      // Validate the first message's class and text.
      expect ( yay . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( yay . text ( ) ) . toMatch ( 'Yay!' ) ;

      // Get the second alert message.
      var saved = element ( 'div#mc-messages-wrapper .alert:nth-of-type(2)' ) ;

      // Validate the second message's class and text.
      expect ( saved . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( saved . text ( ) ) . toMatch ( 'Saved successfully!' ) ;
    } ) ;


    // Test case: Rendering multiple messages with different levels and texts.
    it ( 'renders multiple messages with the level and text provided' , function ( ) {
      // Trigger a mix of success and failure messages.
      element ( '#saveMultipleTypes' ) . click ( ) ;

      // Check the first message (expected success).
      var yay = element ( 'div#mc-messages-wrapper .alert:first' ) ;
      expect ( yay . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( yay . text ( ) ) . toMatch ( 'Yay!' ) ;

      // Check the second message (expected danger).
      var somethingWrong = element ( 'div#mc-messages-wrapper .alert:nth-of-type(2)' ) ;
      expect ( somethingWrong . prop ( 'className' ) ) . toEqual ( 'alert alert-danger fade in' ) ;
      expect ( somethingWrong . text ( ) ) . toMatch ( 'Something went wrong!' ) ;
    } ) ;
  } ) ;

  // Nested describe block for tests involving navigation to a different view.
  // This group focuses on messages that are intended to be "next messages"
  // and should persist across a single route change.
  describe ( 'when navigating to another view' , function ( ) {

    // Test case: Rendering a default "success" message after navigation.
    it ( 'renders a message with the default "success" level' , function ( ) {
      // Trigger navigation that should display a success message on the new view.
      element ( '#goEditSuccess' ) . click ( ) ;

      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;

      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'You have reached the edit page!' ) ;
    } ) ;

    // Test case: Rendering a custom "danger" message after navigation.
    it ( 'renders a message with the level and text provided' , function ( ) {
      // Trigger navigation that should display a failure message on the new view.
      element ( '#goEditFailure' ) . click ( ) ;

      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;

      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-danger fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'Something went wrong!' ) ;
    } ) ;

    // Test case: Rendering multiple default "success" messages after navigation.
    it ( 'renders multiple messages with the default "success" level and text' , function ( ) {
      // Trigger navigation displaying multiple success messages.
      element ( '#goEditMultipleSuccess' ) . click ( ) ;

      var yay = element ( 'div#mc-messages-wrapper .alert:first' ) ;
      expect ( yay . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( yay . text ( ) ) . toMatch ( 'Yay!' ) ;

      var youveReached = element ( 'div#mc-messages-wrapper .alert:nth-of-type(2)' ) ;
      expect ( youveReached . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( youveReached . text ( ) ) . toMatch ( 'You have reached the edit page!' ) ;
    } ) ;

    // Test case: Rendering multiple messages with mixed types after navigation.
    it ( 'renders multiple messages with the level and text provided' , function ( ) {
      // Trigger navigation displaying mixed message types.
      element ( '#goEditMultipleTypes' ) . click ( ) ;

      var yay = element ( 'div#mc-messages-wrapper .alert:first' ) ;
      expect ( yay . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( yay . text ( ) ) . toMatch ( 'Yay!' ) ;

      var somethingWrong = element ( 'div#mc-messages-wrapper .alert:nth-of-type(2)' ) ;
      expect ( somethingWrong . prop ( 'className' ) ) . toEqual ( 'alert alert-danger fade in' ) ;
      expect ( somethingWrong . text ( ) ) . toMatch ( 'Something went wrong!' ) ;
    } ) ;
  } ) ;

  // Nested describe block for testing permanent messages.
  // Permanent messages should persist across multiple route changes until explicitly closed.
  describe ( 'after navigating to multiple different views with permanent message' , function ( ) {
    // Before each test in this group, navigate to a page that sets a permanent message.
    beforeEach ( function ( ) {
      element ( '#goPermanent' ) . click ( ) ;
    } ) ;

    // Test case: Verifying that a permanent message persists across multiple navigations.
    it ( 'still renders a permanent message' , function ( ) {
      // Initial check after the first navigation.
      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'Showing permanent message!' ) ;

      // Navigate away and back multiple times.
      element ( '#goIndex' ) . click ( ) ;
      element ( '#goPermanent' ) . click ( ) ;
      element ( '#goIndex' ) . click ( ) ;

      // Re-check messages after multiple navigations.
      // The permanent message should still be there.
      messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 2 ) ; // Due to multiple 'goPermanent' clicks

      var message = element ( 'div#mc-messages-wrapper .alert:first' ) ;
      expect ( message . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( message . text ( ) ) . toMatch ( 'Showing permanent message!' ) ;

      messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      message = element ( 'div#mc-messages-wrapper .alert:nth-of-type(2)' ) ;
      expect ( messages . count ( ) ) . toBe ( 2 ) ;
      expect ( message . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( message . text ( ) ) . toMatch ( 'Showing permanent message!' ) ;
    } ) ;

    // Test case: Verifying that a permanent message can be closed.
    it ( 'renders a permanent message and then closes it' , function ( ) {
      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'Showing permanent message!' ) ;

      // Navigate away, the message should still be there.
      element ( '#goIndex' ) . click ( ) ;
      messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'Showing permanent message!' ) ;

      // Close the permanent message.
      element ( 'div#mc-messages-wrapper .alert .close' ) . click ( ) ;
      messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 0 ) ;

      // Navigate away again; the message should remain closed.
      element ( '#goIndex' ) . click ( ) ;
      messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 0 ) ;
    } ) ;
  } ) ;

  // Nested describe block for testing next messages that should clear after one navigation.
  describe ( 'after navigating to multiple different views with next message' , function ( ) {
    // Test case: Verifying that a "next message" clears after subsequent navigation.
    it ( 'clears the next message' , function ( ) {
      // Trigger a message that should persist for one navigation.
      element ( '#goEditSuccess' ) . click ( ) ;

      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'You have reached the edit page!' ) ;

      // Trigger another navigation, which should clear the previous "next message"
      // and potentially display a new one.
      element ( '#saveSuccessGoHome' ) . click ( ) ;

      messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'Saved successfully and went home!' ) ;
    } ) ;
  } ) ;

  // Nested describe block for testing HTML rendering in messages.
  describe ( 'when going to the allowed HTML page' , function ( ) {
    // Before each test in this group, navigate to the page designed for HTML messages.
    beforeEach ( function ( ) { element ( '#goHTML' ) . click ( ) ; } ) ;

    // Test case: Message with HTML content enabled.
    it ( 'renders a message with HTML enabled' , function ( ) {
      // Trigger a message that allows HTML.
      element ( '#allowedHTML' ) . click ( ) ;

      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'HTML is allowed.' ) ; // Note: .text() extracts visible text, HTML tags are rendered.
    } ) ;

    // Test case: Message with HTML content disabled (rendered as plain text).
    it ( 'renders a message with HTML disabled' , function ( ) {
      // Trigger a message that explicitly disables HTML rendering.
      element ( '#plainText' ) . click ( ) ;

      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-warning fade in' ) ;
      // The HTML tags should be displayed literally in the text content.
      expect ( messages . text ( ) ) . toMatch ( '<strong>HTML</strong> <em>is</em> NOT <span>allowed</span>.' ) ;
    } ) ;

  } ) ;

} ) ; // End of 'Message Center with single directive' describe block.



/*
 * This section of the test suite focuses on the Message Center module
 * when it is configured without specific routing capabilities,
 * typically for applications that don't use AngularJS routing or similar.
 */
describe ( 'Message Center' , function ( ) {

  // Load the core MessageCenterModule before each test.
  beforeEach ( module ( 'MessageCenterModule' ) ) ;

  // Navigate to 'index2.html' which represents a non-routed application context.
  beforeEach ( function ( ) { browser ( ) . navigateTo ( '/index2.html' ) ; } ) ;

  // Initial state check: The message wrapper should be present but empty.
  it ( 'renders an empty ordered list on its initial state' , function ( ) {
    expect ( element ( 'div#mc-messages-wrapper' ) . count ( ) ) . toBe ( 1 ) ;
    expect ( element ( 'div#mc-messages-wrapper .alert' ) . count ( ) ) . toBe ( 0 ) ;
  } ) ;

  // Tests for message behavior within the same view, specifically without routing being active.
  describe ( 'when on the same view without routing' , function ( ) {

    // Test case: Default "success" message in a non-routed context.
    it ( 'renders a message with the default "success" level' , function ( ) {
      element ( '#saveSuccess' ) . click ( ) ;
      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'Saved successfully!' ) ;
    } ) ;

    // Test case: Custom "danger" message in a non-routed context.
    it ( 'renders a message with the level and text provided' , function ( ) {
      element ( '#saveFailure' ) . click ( ) ;
      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-danger fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'Something went wrong!' ) ;
    } ) ;

    // Test case: Multiple default "success" messages.
    it ( 'renders multiple messages with the default "success" level and text' , function ( ) {
      element ( '#saveMultipleSuccess' ) . click ( ) ;
      var yay = element ( 'div#mc-messages-wrapper .alert:first' ) ;
      expect ( yay . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( yay . text ( ) ) . toMatch ( 'Yay!' ) ;
      var saved = element ( 'div#mc-messages-wrapper .alert:nth-of-type(2)' ) ;
      expect ( saved . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( saved . text ( ) ) . toMatch ( 'Saved successfully!' ) ;
    } ) ;

    // Test case: Multiple messages with mixed types.
    it ( 'renders multiple messages with the level and text provided' , function ( ) {
      element ( '#saveMultipleTypes' ) . click ( ) ;
      var yay = element ( 'div#mc-messages-wrapper .alert:first' ) ;
      expect ( yay . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( yay . text ( ) ) . toMatch ( 'Yay!' ) ;
      var somethingWrong = element ( 'div#mc-messages-wrapper .alert:nth-of-type(2)' ) ;
      expect ( somethingWrong . prop ( 'className' ) ) . toEqual ( 'alert alert-danger fade in' ) ;
      expect ( somethingWrong . text ( ) ) . toMatch ( 'Something went wrong!' ) ;
    } ) ;
  } ) ;
} ) ; // End of 'Message Center' describe block.



/*
 * This final section tests the Message Center module's behavior
 * when multiple message directives are present on the page.
 * This can lead to complex interactions, especially with routing.
 */
describe ( 'Message Center with multiple directives' , function ( ) {

  // Ensure the module is loaded for these tests.
  beforeEach ( module ( 'MessageCenterModule' ) ) ;

  // Navigate to 'index3.html', which is set up with multiple directives.
  beforeEach ( function ( ) { browser ( ) . navigateTo ( '/index3.html' ) ; } ) ;

  // Initial state verification, similar to other test suites.
  it ( 'renders an empty ordered list on its initial state' , function ( ) {
    expect ( element ( 'div#mc-messages-wrapper' ) . count ( ) ) . toBe ( 1 ) ;
    expect ( element ( 'div#mc-messages-wrapper .alert' ) . count ( ) ) . toBe ( 0 ) ;
  } ) ;

  // Tests for message persistence and display when navigating through two distinct views.
  describe ( 'when navigating through two views' , function ( ) {

    // Test case: Verifying message behavior across two consecutive navigations.
    it ( 'renders a message with the default "success" level' , function ( ) {
      // First navigation, setting a "next message".
      element ( '#goEditSuccess' ) . click ( ) ;

      var messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'You have reached the edit page!' ) ;

      // Second navigation, which should clear the previous "next message"
      // and display a new one.
      element ( '#saveSuccessGoHome' ) . click ( ) ;

      messages = element ( 'div#mc-messages-wrapper .alert' ) ;
      expect ( messages . count ( ) ) . toBe ( 1 ) ;
      expect ( messages . prop ( 'className' ) ) . toEqual ( 'alert alert-success fade in' ) ;
      expect ( messages . text ( ) ) . toMatch ( 'Saved successfully and went home!' ) ;
    } ) ;
  } ) ;
} ) ; // End of 'Message Center with multiple directives' describe block.