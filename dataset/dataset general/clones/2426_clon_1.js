/*
 * This is a Type I clone generated file.
 * The original code describes a series of Protractor tests
 * for a donation page in a CiviCRM-like application.
 *
 * This cloned version maintains exact logical and structural equivalence
 * to the original source code.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved without any modification.
 *
 * The only alterations made are extensive changes to whitespace,
 * including indentation, spacing, and blank lines,
 * as well as the addition, removal, or modification of comments.
 *
 * The purpose of these changes is purely aesthetic,
 * to make the code appear visually distinct from its origin,
 * while ensuring it behaves identically upon execution.
 *
 * This file is part of a code clone generation exercise.
 */

describe ( "Test Donation page" , function ( ) {


  // Declare the Protractor instance variable
  var ptor ;

  // Initialize Protractor instance
  ptor = protractor . getInstance ( ) ;


  // Disable synchronization for non-Angular applications or specific scenarios
  ptor . ignoreSynchronization = true ;


  // Generate unique identifiers for test data
  var contriTitle = "Test " + stringGen ( ) ;


  var firstName = stringGen ( ) ;


  var lastName = stringGen ( ) ;


  var userName = firstName ;


  var emailId = firstName + '@info.com' ;


  /*
   * This block describes tests related to the Contribution Page functionality.
   * It focuses on creating new contribution types within the system.
   */
  describe ( "Contribution Page" , function ( ) {


    it ( "should create new contribution" , function ( ) {
      // Navigate to the contribution add page
      ptor . get ( ptor . baseUrl + 'civicrm/admin/contribute/add?reset=1&action=add' ) ;

      // Fill in the contribution title
      ptor . findElement ( protractor . By . id ( 'title' ) ) . sendKeys ( contriTitle ) ;

      // Select 'Donation' from the contribution type options
      ptor . findElement ( protractor . By . cssContainingText ( 'option' , 'Donation' ) ) . click ( ) ;

      // Click the 'Next' button to proceed from the settings page
      ptor . findElement ( protractor . By . id ( '_qf_Settings_next-bottom' ) ) . click ( ) ;

      // Wait for a short period for page to load or stabilize
      ptor . sleep ( 500 ) ;

      // Verify that the current URL now contains 'contribute/amount'
      expect ( ptor . getCurrentUrl ( ) ) . toContain ( 'contribute/amount' ) ;

      // Select a payment processor (assuming ID 'payment_processor_1')
      ptor . findElement ( protractor . By . css ( 'input#payment_processor_1' ) ) . click ( ) ;

      // Enable recurring contributions
      ptor . findElement ( protractor . By . css ( 'input#is_recur' ) ) . click ( ) ;

      // Enter label for the first amount field
      ptor . findElement ( protractor . By . id ( 'label_1' ) ) . sendKeys ( 'TestAm1' ) ;

      // Enter value for the first amount field
      ptor . findElement ( protractor . By . id ( 'value_1' ) ) . sendKeys ( '1000' ) ;

      // Enter label for the second amount field
      ptor . findElement ( protractor . By . id ( 'label_2' ) ) . sendKeys ( 'TestAm2' ) ;

      // Enter value for the second amount field
      ptor . findElement ( protractor . By . id ( 'value_2' ) ) . sendKeys ( '2000' ) ;

      // Click on a specific element within a table, likely to add another row or confirm
      ptor . findElement ( protractor . By . xpath ( '//table[@id="map-field-table"]/tbody/tr[3]/td[3]/input' ) ) . click ( ) ;

      // Click the 'Done' button to complete the amount configuration
      ptor . findElement ( protractor . By . id ( '_qf_Amount_upload_done-bottom' ) ) . click ( ) ;

    } ) ; // End of 'it should create new contribution'

  } ) ; // End of 'Contribution Page' describe block


  /*
   * This describes a set of tests for the donation page functionality
   * when a user is already logged in and the 'ziptastic' feature is enabled.
   */
  describe ( "Test Donation page for Logged in User when ziptastic enable" , function ( ) {


    it ( "should create new user" , function ( ) {
      // Navigate to the user creation page
      ptor . get ( ptor . baseUrl + 'admin/people/create' ) ;

      // Fill in the username
      ptor . findElement ( protractor . By . id ( 'edit-name' ) ) . sendKeys ( userName ) ;

      // Fill in the email address
      ptor . findElement ( protractor . By . id ( 'edit-mail' ) ) . sendKeys ( emailId ) ;

      // Set password (using userName for simplicity in test)
      ptor . findElement ( protractor . By . id ( 'edit-pass-pass1' ) ) . sendKeys ( userName ) ;

      // Confirm password
      ptor . findElement ( protractor . By . id ( 'edit-pass-pass2' ) ) . sendKeys ( userName ) ;

      // Fill in first name
      ptor . findElement ( protractor . By . id ( 'first_name' ) ) . sendKeys ( firstName ) ;

      // Fill in last name
      ptor . findElement ( protractor . By . id ( 'last_name' ) ) . sendKeys ( lastName ) ;

      // Enter postal code
      ptor . findElement ( protractor . By . id ( 'postal_code-1' ) ) . sendKeys ( '15201' ) ;

      // Enter city
      ptor . findElement ( protractor . By . id ( 'city-1' ) ) . sendKeys ( 'Pittsburgh' ) ;

      // Enter street address
      ptor . findElement ( protractor . By . id ( 'street_address-1' ) ) . sendKeys ( 'Test street address' ) ;

      // Select a user role (assuming ID 'edit-roles-3')
      ptor . findElement ( protractor . By . id ( 'edit-roles-3' ) ) . click ( ) ;

      // Select a state (Pennsylvania) from options
      ptor . findElement ( protractor . By . cssContainingText ( 'option' , 'Pennsylvania' ) ) . click ( ) ;

      // Click the submit button to create the user
      ptor . findElement ( protractor . By . id ( 'edit-submit' ) ) . click ( ) ;

    } ) ; // End of 'it should create new user'


    it ( "should save setting of simple configration page" , function ( ) {
      // Navigate to the simple donation configuration page
      ptor . get ( ptor . baseUrl + 'civicrm/simple/donation/configuration' ) ;

      // Wait for the page to load
      ptor . sleep ( 1000 ) ;

      // Select the previously created contribution title from options
      ptor . findElement ( protractor . By . cssContainingText ( 'option' , contriTitle ) ) . click ( ) ;

      // Click the 'Next' button to save settings
      ptor . findElement ( protractor . By . id ( '_qf_SimpleDonationSetting_next-bottom' ) ) . click ( ) ;

      // Log out the current user
      ptor . get ( ptor . baseUrl + 'user/logout' ) ;

      // Log in with the newly created user
      login ( userName ) ;

    } ) ; // End of 'it should save setting'


    // Call the price set test function
    priceSetTest ( ) ;


    // User information section related tests
    // This comment is for clarity in the cloned file.
    it ( "check session value of login user info" , function ( ) {
      // Retrieve and verify the user's full name
      var elementUser = ptor . findElement ( protractor . By . model ( 'formInfo.user' ) ) ;
      expect ( elementUser . getAttribute ( 'value' ) ) . toBe ( firstName + ' ' + lastName ) ;

      // Retrieve and verify the user's email address
      var elementEmail = ptor . findElement ( protractor . By . model ( 'formInfo.email' ) ) ;
      expect ( elementEmail . getAttribute ( 'value' ) ) . toBe ( emailId ) ;

      // Retrieve and verify the user's address
      var elementAddress = ptor . findElement ( protractor . By . model ( 'formInfo.address' ) ) ;
      expect ( elementAddress . getAttribute ( 'value' ) ) . toBe ( "Test street address" ) ;

      // Retrieve and verify the user's zip code
      var elementZip = ptor . findElement ( protractor . By . model ( 'formInfo.zip' ) ) ;
      expect ( elementZip . getAttribute ( 'value' ) ) . toBe ( "15201" ) ;

      // Retrieve and verify the user's city
      var elementCity = ptor . findElement ( protractor . By . model ( 'formInfo.city' ) ) ;
      expect ( elementCity . getAttribute ( 'value' ) ) . toBe ( "Pittsburgh" ) ;

      // Retrieve and verify the user's state
      var elementState = ptor . findElement ( protractor . By . model ( 'formInfo.state' ) ) ;
      expect ( elementState . getAttribute ( 'value' ) ) . toBe ( "Pennsylvania" ) ;

    } ) ; // End of 'it check session value'


    // Call the credit card information test function
    creditInfoTest ( emailId ) ;

  } ) ; // End of 'Test Donation page for Logged in User when ziptastic enable' describe block


  /*
   * This describes a set of tests for the donation page functionality
   * when an anonymous user is interacting and 'ziptastic' is enabled.
   */
  describe ( "Test Donation for anonymous user when ziptastic enable" , function ( ) {


    // Generate new unique identifiers for the anonymous user test
    var firstName = stringGen ( ) ;

    var lastName = stringGen ( ) ;

    var userName = firstName ;

    var emailId = firstName + '@info.com' ;


    // Call the price set test function for this scenario
    priceSetTest ( ) ;


    // User information section related tests for anonymous user
    // This comment is for clarity in the cloned file.
    it ( "should hide city and state" , function ( ) {
      // Verify that the city field is initially not displayed
      var elementCity = ptor . findElement ( protractor . By . model ( 'formInfo.city' ) ) ;
      expect ( elementCity . isDisplayed ( ) ) . toBe ( false ) ;

      // Verify that the state field is initially not displayed
      var elementstate = ptor . findElement ( protractor . By . model ( 'formInfo.state' ) ) ;
      expect ( elementstate . isDisplayed ( ) ) . toBe ( false ) ;

    } ) ; // End of 'it should hide city and state'


    it ( "should show proper city and state on enter of zip" , function ( ) {
      // Fill in user's full name
      ptor . findElement ( protractor . By . model ( 'formInfo.user' ) ) . sendKeys ( firstName + ' ' + lastName ) ;

      // Fill in user's email
      ptor . findElement ( protractor . By . model ( 'formInfo.email' ) ) . sendKeys ( emailId ) ;

      // Fill in user's address
      ptor . findElement ( protractor . By . model ( 'formInfo.address' ) ) . sendKeys ( '123 Main Land street' ) ;

      // Enter a zip code to trigger ziptastic functionality
      ptor . findElement ( protractor . By . model ( 'formInfo.zip' ) ) . sendKeys ( '15201' ) ;

      // Wait for ziptastic to populate fields
      ptor . sleep ( 3000 ) ;

      // Verify city field is displayed and has correct value
      var elementCity = ptor . findElement ( protractor . By . model ( 'formInfo.city' ) ) ;
      expect ( elementCity . isDisplayed ( ) ) . toBe ( true ) ;
      expect ( elementCity . getAttribute ( 'value' ) ) . toBe ( "Pittsburgh" ) ;

      // Verify state field is displayed and has correct value
      var elementState = ptor . findElement ( protractor . By . model ( 'formInfo.state' ) ) ;
      expect ( elementState . isDisplayed ( ) ) . toBe ( true ) ;
      expect ( elementState . getAttribute ( 'value' ) ) . toBe ( "Pennsylvania" ) ;

    } ) ; // End of 'it should show proper city and state'


    // Call the credit card information test function for this scenario
    creditInfoTest ( emailId ) ;

  } ) ; // End of 'Test Donation for anonymous user when ziptastic enable' describe block


  /*
   * This describes a set of tests for the donation page functionality
   * when a user is logged in and the 'ziptastic' feature is disabled.
   */
  describe ( "Test Donation page for Logged in User when ziptastic disable" , function ( ) {


    it ( "should save setting of simple configration page" , function ( ) {
      // Navigate to the base URL
      ptor . get ( ptor . baseUrl ) ;

      // Log in with the existing user
      login ( userName ) ;

      // Navigate to the simple donation configuration page
      ptor . get ( ptor . baseUrl + 'civicrm/simple/donation/configuration' ) ;

      // Wait for the page to load
      ptor . sleep ( 1000 ) ;

      // Click the ziptastic toggle to disable it
      ptor . findElement ( protractor . By . id ( 'ziptastic' ) ) . click ( ) ;

      // Click the 'Next' button to save settings
      ptor . findElement ( protractor . By . id ( '_qf_SimpleDonationSetting_next-bottom' ) ) . click ( ) ;

      // Log out the current user
      ptor . get ( ptor . baseUrl + 'user/logout' ) ;

      // Log in again with the user
      login ( userName ) ;

    } ) ; // End of 'it should save setting'


    // Call the price set test function
    priceSetTest ( ) ;


    // User information section tests with ziptastic disabled
    // This comment is for clarity in the cloned file.
    it ( "check session value of login user info" , function ( ) {
      // Verify user's full name
      expect ( ptor . findElement ( protractor . By . model ( 'formInfo.user' ) ) . getAttribute ( 'value' ) ) . toBe ( firstName + ' ' + lastName ) ;

      // Verify user's email
      expect ( ptor . findElement ( protractor . By . model ( 'formInfo.email' ) ) . getAttribute ( 'value' ) ) . toBe ( emailId ) ;

      // Verify user's address
      expect ( ptor . findElement ( protractor . By . model ( 'formInfo.address' ) ) . getAttribute ( 'value' ) ) . toBe ( "Test street address" ) ;

      // Verify user's zip code
      expect ( ptor . findElement ( protractor . By . model ( 'formInfo.zip' ) ) . getAttribute ( 'value' ) ) . toBe ( "15201" ) ;

      // Verify user's city
      expect ( ptor . findElement ( protractor . By . model ( 'formInfo.city' ) ) . getAttribute ( 'value' ) ) . toBe ( "Pittsburgh" ) ;

      // Verify user's country
      element ( by . model ( 'formInfo.country' ) ) . getAttribute ( 'value' ) . then ( function ( selectValue ) {
        expect ( element ( by . css ( 'select option[value="' + selectValue + '"]' ) ) . getText ( ) ) . toEqual ( 'United States' ) ;
      } ) ;

      // Verify user's state
      element ( by . model ( 'formInfo.stateList' ) ) . getAttribute ( 'value' ) . then ( function ( selectVal ) {
        expect ( element ( by . css ( 'select option[value="' + selectVal + '"]' ) ) . getText ( ) ) . toEqual ( 'Pennsylvania' ) ;
      } ) ;

    } ) ; // End of 'it check session value'


    // Call the credit card information test function
    creditInfoTest ( emailId ) ;

  } ) ; // End of 'Test Donation page for Logged in User when ziptastic disable' describe block


  /*
   * This describes a set of tests for the donation page functionality
   * when an anonymous user is interacting and the 'ziptastic' feature is disabled.
   */
  describe ( "Test Donation for anonymous user when ziptastic disable" , function ( ) {


    // Generate new unique identifiers for the anonymous user test
    var firstName = stringGen ( ) ;

    var lastName = stringGen ( ) ;

    var userName = firstName ;

    var emailId = firstName + '@info.com' ;


    // Call the price set test function for this scenario
    priceSetTest ( ) ;


    it ( "should fill proper info for user section" , function ( ) {
      // Fill in user's full name
      ptor . findElement ( protractor . By . model ( 'formInfo.user' ) ) . sendKeys ( firstName + ' ' + lastName ) ;

      // Fill in user's email
      ptor . findElement ( protractor . By . model ( 'formInfo.email' ) ) . sendKeys ( emailId ) ;

      // Fill in user's address
      ptor . findElement ( protractor . By . model ( 'formInfo.address' ) ) . sendKeys ( '123 Main Land street' ) ;

      // Fill in user's zip code
      ptor . findElement ( protractor . By . model ( 'formInfo.zip' ) ) . sendKeys ( '15201' ) ;

      // Select country (United States)
      ptor . findElement ( protractor . By . cssContainingText ( 'option' , 'United States' ) ) . click ( ) ;

      // Select state (Pennsylvania)
      ptor . findElement ( protractor . By . cssContainingText ( 'option' , 'Pennsylvania' ) ) . click ( ) ;

      // Fill in user's city
      ptor . findElement ( protractor . By . model ( 'formInfo.city' ) ) . sendKeys ( 'Pittsburgh' ) ;

    } ) ; // End of 'it should fill proper info'


    // Call the credit card information test function for this scenario
    creditInfoTest ( emailId ) ;

  } ) ; // End of 'Test Donation for anonymous user when ziptastic disable' describe block


  /**
   * Helper function to test credit card information entry and submission.
   * @param {string} emailId - The email ID to verify on the thank you page.
   */
  function creditInfoTest ( emailId ) {
    // This comment indicates the credit card section tests.
    it ( "should check for credit card information" , function ( ) {
      // Click the donate button to reveal credit card fields (if hidden)
      ptor . findElement ( protractor . By . css ( 'button.donate-sub' ) ) . click ( ) ;

      // Verify initial state: credit card elements should not be displayed
      isPresentCreditElement ( false ) ;

      // Enter a dummy credit card number
      ptor . findElement ( protractor . By . model ( 'formInfo.cardNumberValue' ) ) . sendKeys ( '4100000000000000' ) ;

      // Verify that credit card elements are now displayed after entering number
      isPresentCreditElement ( true ) ;

      // Click on the card expiry field
      ptor . findElement ( protractor . By . model ( 'formInfo.cardExpiry' ) ) . click ( ) ;

      // Enter card expiry date
      ptor . findElement ( protractor . By . model ( 'formInfo.cardExpiry' ) ) . sendKeys ( '0820' ) ;

      // Enter security code
      ptor . findElement ( protractor . By . model ( 'formInfo.securityCode' ) ) . sendKeys ( '510' ) ;

      // Find the submit button
      var elementSubmit = ptor . findElement ( protractor . By . css ( 'button.donate-submit-btn' ) ) ;

      // Click the submit button
      elementSubmit . click ( ) ;

      // Wait for processing
      ptor . sleep ( 3000 ) ;

      // Verify redirection to the donation thanks page
      expect ( ptor . getCurrentUrl ( ) ) . toContain ( 'donation/thanks' ) ;

      // Verify that the email ID is displayed on the thank you page
      expect ( ptor . findElement ( protractor . By . css ( 'strong.ng-binding' ) ) . getText ( ) ) . toContain ( emailId ) ;

      // Log out after the test
      ptor . get ( ptor . baseUrl + 'user/logout' ) ;

    } ) ; // End of 'it should check for credit card information'

  } // End of creditInfoTest function


  /**
   * Helper function to test price set selection and display.
   */
  function priceSetTest ( ) {


    it ( "should redirect to donation page" , function ( ) {
      // Navigate to the simple donation page with a test parameter
      ptor . get ( ptor . baseUrl + 'civicrm/simple?test=1#/donation' ) ;

      // Wait for page load
      ptor . sleep ( 1500 ) ;

      // Verify that the current URL contains the expected donation path
      expect ( ptor . getCurrentUrl ( ) ) . toContain ( 'civicrm/simple?test=1#/donation' ) ;

    } ) ; // End of 'it should redirect to donation page'


    it ( "should check default priceset is set" , function ( ) {
      // Check the default selected amount, assuming index 1 is default
      getSelectedAmt ( 1 ) ;

    } ) ; // End of 'it should check default priceset is set'


    // Priceset section test case for hover functionality.
    // This comment is for clarity in the cloned file.
    it ( "should display total donation div on hover of price" , function ( ) {
      // Simulate a mouse move action over the first price set item
      ptor . actions ( ) . mouseMove ( ptor . findElement ( protractor . By . css ( 'ul.priceSet li:nth-child(1)' ) ) ) . perform ( ) ;

      // Check the displayed amount, assuming index 0 is used for hover display
      getSelectedAmt ( 0 ) ;

    } ) ; // End of 'it should display total donation div on hover'


    it ( "should click on first price and display total donation div" , function ( ) {
      // Click the first price set item
      ptor . findElement ( protractor . By . css ( 'ul.priceSet li:nth-child(1)' ) ) . click ( ) ;

      // Check the displayed amount after clicking
      getSelectedAmt ( 0 ) ;

    } ) ; // End of 'it should click on first price'


    it ( "enter value in other amount and display total donation div" , function ( ) {
      // Find all elements matching the 'otherAmount' model
      element . all ( by . model ( 'formInfo.otherAmount' ) ) . then ( function ( items ) {
        // If there is exactly one 'otherAmount' field
        if ( items . length == 1 ) {
          // Get the other amount input field
          var otheramt = ptor . findElement ( protractor . By . model ( 'formInfo.otherAmount' ) ) ;

          // Click the field
          otheramt . click ( ) ;

          // Enter a custom amount
          otheramt . sendKeys ( '6000' ) ;

          // Verify the price set message is displayed
          expect ( element ( by . className ( 'priceSetMessage' ) ) . isDisplayed ( ) ) . toBe ( true ) ;

          // Verify the price set message contains the entered amount
          expect ( element ( by . className ( 'priceSetMessage' ) ) . getText ( ) ) . toContain ( '6000' ) ;
        }
      } ) ; // End of element.all.then

      // Click the donate sub-button
      ptor . findElement ( protractor . By . css ( 'button.donate-sub' ) ) . click ( ) ;

    } ) ; // End of 'it enter value in other amount'


    it ( "click recurring checkbox" , function ( ) {
      // Find all elements matching the 'recur' model
      element . all ( by . model ( 'formInfo.recur' ) ) . then ( function ( items ) {
        // If there is exactly one recurring checkbox
        if ( items . length == 1 ) {
          // Click the recurring checkbox
          ptor . findElement ( protractor . By . css ( 'input#isRecur' ) ) . click ( ) ;
        }
      } ) ; // End of element.all.then
    } ) ; // End of 'it click recurring checkbox'

  } // End of priceSetTest function


  /**
   * Helper function to log a user into the system.
   * @param {string} userName - The username to log in with.
   */
  function login ( userName ) {
    // Enter username into the name field
    ptor . findElement ( protractor . By . id ( 'edit-name' ) ) . sendKeys ( userName ) ;

    // Enter password into the password field (using userName as password for test)
    ptor . findElement ( protractor . By . id ( 'edit-pass' ) ) . sendKeys ( userName ) ;

    // Click the submit button
    ptor . findElement ( protractor . By . id ( 'edit-submit' ) ) . click ( ) ;

  } // End of login function


  /**
   * Helper function to get and verify the selected amount display.
   * @param {number} index - The index of the price element to check.
   */
  function getSelectedAmt ( index ) {
    // Find all elements repeating for 'price in priceListInfo'
    element . all ( by . repeater ( 'price in priceListInfo' ) ) . then ( function ( prices ) {
      // Get the text of the label within the price element at the given index
      var priceElement = prices [ index ] . element ( by . tagName ( 'label' ) ) . getText ( ) ;

      // Once the price text is resolved
      priceElement . then ( function ( slices ) {
        // Verify that the price set message displays the correct donation amount
        expect ( ptor . findElement ( protractor . By . css ( 'div.priceSetMessage' ) ) . getText ( ) ) . toBe ( 'Donation amount: ' + slices ) ;
      } ) ;
    } ) ;
  } // End of getSelectedAmt function


  /**
   * Helper function to check the display status of credit card input elements.
   * @param {boolean} display - Expected display status (true for displayed, false for hidden).
   */
  function isPresentCreditElement ( display ) {
    // Get the card expiry element
    var elcardExpiry = ptor . findElement ( protractor . By . model ( 'formInfo.cardExpiry' ) ) ;

    // Assert its display status
    expect ( elcardExpiry . isDisplayed ( ) ) . toBe ( display ) ;

    // Get the security code element
    var elsecurityCode = ptor . findElement ( protractor . By . model ( 'formInfo.securityCode' ) ) ;

    // Assert its display status
    expect ( elsecurityCode . isDisplayed ( ) ) . toBe ( display ) ;

  } // End of isPresentCreditElement function


  // Helper function to generate random words for test data.
  function stringGen ( ) {
    var text = "" ;
    var charset = "abcdefghijklmnopqrstuvwxyz" ;
    // Loop to generate a 6-character random string
    for ( var i = 0 ; i < 6 ; i ++ ) {
      text += charset . charAt ( Math . floor ( Math . random ( ) * charset . length ) ) ;
    }
    return text ;
  } // End of stringGen function

} ) ; // End of 'Test Donation page' describe block