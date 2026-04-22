describe("Comprehensive E2E Suite for Donation Workflow", function () {
  // Global test automation client instance
  let webAutomator;

  // Initial setup for the entire test suite
  beforeAll(function() {
    webAutomator = protractor.getInstance();
    // Instruct Protractor to bypass Angular synchronization for non-Angular pages
    webAutomator.ignoreSynchronization = true;
    console.log("Protractor client initialized, synchronization ignored.");
  });

  // Helper to generate unique string identifiers
  function createUniqueId(len = 7) {
    const charPool = "abcdefghijklmnopqrstuvwxyz0123456789";
    let randomIdentifier = "";
    for (let j = 0; j < len; j++) {
      randomIdentifier += charPool.charAt(Math.floor(Math.random() * charPool.length));
    }
    return randomIdentifier;
  }

  // Define global test data for reuse
  const donationCampaignName = "Campaign " + createUniqueId();
  const applicantFirstName = createUniqueId();
  const applicantLastName = createUniqueId();
  const applicantUsername = applicantFirstName; // Username often derived from first name
  const applicantEmail = `${applicantFirstName}@example.com`; // Using a generic domain

  describe("Donation Campaign Setup Module", function () {
    // Test case to verify the creation of a new donation campaign
    it ("should successfully establish a new contribution campaign with specific settings", async function() {
      const addCampaignUrl = webAutomator.baseUrl + 'civicrm/admin/contribute/add?reset=1&action=add';
      await webAutomator.get(addCampaignUrl);
      console.log(`Navigated to: ${addCampaignUrl}`);

      // Fill in the campaign title
      await webAutomator.findElement(protractor.By.id('title')).sendKeys(donationCampaignName);
      // Select 'Donation' as the contribution type
      await webAutomator.findElement(protractor.By.cssContainingText('option', 'Donation')).click();
      // Proceed to the next step
      await webAutomator.findElement(protractor.By.id('_qf_Settings_next-bottom')).click();

      // Introduce a short pause for page load, consider using explicit waits in production
      await webAutomator.sleep(750);
      const currentAddress = await webAutomator.getCurrentUrl();
      expect(currentAddress).toContain('contribute/amount');
      console.log(`Verified URL contains 'contribute/amount' after initial setup.`);

      // Configure payment processor and recurring option
      await webAutomator.findElement(protractor.By.css('input#payment_processor_1')).click();
      await webAutomator.findElement(protractor.By.css('input#is_recur')).click();

      // Add custom price set options
      await webAutomator.findElement(protractor.By.id('label_1')).sendKeys('Standard Tier');
      await webAutomator.findElement(protractor.By.id('value_1')).sendKeys('1500'); // Changed amount
      await webAutomator.findElement(protractor.By.id('label_2')).sendKeys('Premium Tier');
      await webAutomator.findElement(protractor.By.id('value_2')).sendKeys('2500'); // Changed amount
      // Click to add a third price option (previously implied by xpath)
      await webAutomator.findElement(protractor.By.xpath('//table[@id="map-field-table"]/tbody/tr[3]/td[3]/input')).click();
      // Submit the amount configuration
      await webAutomator.findElement(protractor.By.id('_qf_Amount_upload_done-bottom')).click();
      console.log("Contribution campaign configuration complete.");
    });
  });

  describe("User Journey: Authenticated User with Ziptastic Enabled", function () {
    // Test case to create a new user account for testing
    it ("should provision a new system user for subsequent tests", async function() {
      const userCreationUrl = webAutomator.baseUrl + 'admin/people/create';
      await webAutomator.get(userCreationUrl);
      await webAutomator.wait(protractor.ExpectedConditions.visibilityOf(webAutomator.findElement(protractor.By.id('edit-name'))), 5000, 'User creation form not visible');
      console.log(`Navigated to user creation page: ${userCreationUrl}`);

      // Fill out user registration details
      await webAutomator.findElement(protractor.By.id('edit-name')).sendKeys(applicantUsername);
      await webAutomator.findElement(protractor.By.id('edit-mail')).sendKeys(applicantEmail);
      await webAutomator.findElement(protractor.By.id('edit-pass-pass1')).sendKeys(applicantUsername + '123'); // Stronger password
      await webAutomator.findElement(protractor.By.id('edit-pass-pass2')).sendKeys(applicantUsername + '123'); // Confirm password
      await webAutomator.findElement(protractor.By.id('first_name')).sendKeys(applicantFirstName);
      await webAutomator.findElement(protractor.By.id('last_name')).sendKeys(applicantLastName);

      // Add address details
      const defaultZipCode = '15201';
      await webAutomator.findElement(protractor.By.id('postal_code-1')).sendKeys(defaultZipCode);
      await webAutomator.findElement(protractor.By.id('city-1')).sendKeys('Pittsburgh');
      await webAutomator.findElement(protractor.By.id('street_address-1')).sendKeys('123 Test Avenue'); // Updated street address

      // Select user role and state
      await webAutomator.findElement(protractor.By.id('edit-roles-3')).click(); // Assuming '3' is a standard user role
      await webAutomator.findElement(protractor.By.cssContainingText('option', 'Pennsylvania')).click();
      await webAutomator.findElement(protractor.By.id('edit-submit')).click();
      console.log(`New user '${applicantUsername}' created successfully.`);
    });

    // Test case to configure the simple donation page settings
    it ("should persist simple donation page configuration settings", async function() {
      const configPageUrl = webAutomator.baseUrl + 'civicrm/simple/donation/configuration';
      await webAutomator.get(configPageUrl);
      await webAutomator.wait(protractor.ExpectedConditions.visibilityOf(webAutomator.findElement(protractor.By.cssContainingText('option', donationCampaignName))), 5000, 'Configuration page not loaded or campaign not found.');
      console.log(`Navigated to configuration page: ${configPageUrl}`);

      // Select the previously created contribution campaign
      await webAutomator.findElement(protractor.By.cssContainingText('option', donationCampaignName)).click();
      // Submit the configuration
      await webAutomator.findElement(protractor.By.id('_qf_SimpleDonationSetting_next-bottom')).click();
      console.log("Simple donation configuration saved.");

      // Log out and then log back in to simulate a fresh session with new settings
      await webAutomator.get(webAutomator.baseUrl + 'user/logout');
      await authenticateUser(applicantUsername, applicantUsername + '123'); // Pass actual password
    });

    runPriceSetVerification(); // Execute shared price set tests

    // Test case to validate pre-filled user information on the donation page
    it ("should display correct pre-populated user details for logged-in user", async function() {
      console.log("Verifying pre-filled user information...");
      // Assert full name
      const userElement = webAutomator.findElement(protractor.By.model('formInfo.user'));
      const displayedFullName = await userElement.getAttribute('value');
      expect(displayedFullName).toBe(`${applicantFirstName} ${applicantLastName}`);
      console.log(`Full Name: ${displayedFullName}`);

      // Assert email address
      const emailElement = webAutomator.findElement(protractor.By.model('formInfo.email'));
      const displayedEmail = await emailElement.getAttribute('value');
      expect(displayedEmail).toBe(applicantEmail);
      console.log(`Email: ${displayedEmail}`);

      // Assert address details
      const addressElement = webAutomator.findElement(protractor.By.model('formInfo.address'));
      expect(await addressElement.getAttribute('value')).toBe("123 Test Avenue"); // Updated street
      const zipElement = webAutomator.findElement(protractor.By.model('formInfo.zip'));
      expect(await zipElement.getAttribute('value')).toBe("15201");
      const cityElement = webAutomator.findElement(protractor.By.model('formInfo.city'));
      expect(await cityElement.getAttribute('value')).toBe("Pittsburgh");
      const stateElement = webAutomator.findElement(protractor.By.model('formInfo.state'));
      expect(await stateElement.getAttribute('value')).toBe("Pennsylvania");
      console.log("All user details verified successfully.");
    });
    performPaymentFlowAssertions(applicantEmail); // Execute shared credit card tests
  });

  describe("User Journey: Anonymous User with Ziptastic Enabled", function () {
    // Generate new unique user data for this anonymous scenario
    const anonymousFirstName = createUniqueId();
    const anonymousLastName = createUniqueId();
    const anonymousEmail = `${anonymousFirstName}_anon@example.org`;

    runPriceSetVerification(); // Execute shared price set tests

    // Test case to verify city and state fields are hidden initially
    it ("should hide city and state fields by default for anonymous users", async function() {
      console.log("Checking initial visibility of city/state fields for anonymous user...");
      const cityField = webAutomator.findElement(protractor.By.model('formInfo.city'));
      const stateField = webAutomator.findElement(protractor.By.model('formInfo.state'));

      // Ensure elements are present in DOM before checking display status
      expect(await cityField.isPresent()).toBe(true, "City field not present");
      expect(await stateField.isPresent()).toBe(true, "State field not present");

      expect(await cityField.isDisplayed()).toBe(false, "City field should be hidden");
      expect(await stateField.isDisplayed()).toBe(false, "State field should be hidden");
      console.log("City and State fields confirmed as initially hidden.");
    });

    // Test case to check dynamic population of city and state based on zip code
    it ("should dynamically populate city and state upon valid zip code entry", async function() {
      const zipCodeForLookup = '15201';
      console.log(`Entering user information and zip code '${zipCodeForLookup}'...`);
      await webAutomator.findElement(protractor.By.model('formInfo.user')).sendKeys(`${anonymousFirstName} ${anonymousLastName}`);
      await webAutomator.findElement(protractor.By.model('formInfo.email')).sendKeys(anonymousEmail);
      await webAutomator.findElement(protractor.By.model('formInfo.address')).sendKeys('456 Main Street, Apt B');
      await webAutomator.findElement(protractor.By.model('formInfo.zip')).sendKeys(zipCodeForLookup);

      // Wait for Ziptastic lookup to complete and fields to become visible
      const cityField = webAutomator.findElement(protractor.By.model('formInfo.city'));
      await webAutomator.wait(protractor.ExpectedConditions.visibilityOf(cityField), 5000, 'City field did not become visible after zip entry');

      expect(await cityField.isDisplayed()).toBe(true, "City field should now be visible");
      expect(await cityField.getAttribute('value')).toBe("Pittsburgh", "City value incorrect");

      const stateField = webAutomator.findElement(protractor.By.model('formInfo.state'));
      expect(await stateField.isDisplayed()).toBe(true, "State field should now be visible");
      expect(await stateField.getAttribute('value')).toBe("Pennsylvania", "State value incorrect");
      console.log("City and State fields correctly populated by Ziptastic.");
    });

    performPaymentFlowAssertions(anonymousEmail); // Execute shared credit card tests
  });

  describe("User Journey: Authenticated User with Ziptastic Disabled", function () {
    // Test case to disable Ziptastic and re-login
    it ("should disable ziptastic in configuration and re-authenticate", async function() {
      await webAutomator.get(webAutomator.baseUrl); // Navigate to base URL first
      await authenticateUser(applicantUsername, applicantUsername + '123'); // Log in first

      const configPageUrl = webAutomator.baseUrl + 'civicrm/simple/donation/configuration';
      await webAutomator.get(configPageUrl);
      await webAutomator.wait(protractor.ExpectedConditions.visibilityOf(webAutomator.findElement(protractor.By.id('ziptastic'))), 5000, 'Ziptastic checkbox not found on config page.');
      console.log(`Navigated to configuration page to disable Ziptastic: ${configPageUrl}`);

      // Click to disable Ziptastic (assuming it's a toggle checkbox)
      const ziptasticToggle = webAutomator.findElement(protractor.By.id('ziptastic'));
      if (await ziptasticToggle.isSelected()) { // Only click if it's currently enabled
        await ziptasticToggle.click();
        console.log("Ziptastic feature disabled.");
      } else {
        console.log("Ziptastic feature already disabled.");
      }

      // Submit the updated configuration
      await webAutomator.findElement(protractor.By.id('_qf_SimpleDonationSetting_next-bottom')).click();
      await webAutomator.get(webAutomator.baseUrl + 'user/logout'); // Log out
      await authenticateUser(applicantUsername, applicantUsername + '123'); // Log back in
      console.log("Ziptastic disabled and user re-authenticated.");
    });

    runPriceSetVerification(); // Execute shared price set tests

    // Test case to verify pre-filled user information without Ziptastic
    it ("should confirm pre-populated user information, including country and state list", async function() {
      console.log("Verifying pre-filled user information with Ziptastic disabled...");
      // Combining assertions for brevity
      expect(await webAutomator.findElement(protractor.By.model('formInfo.user')).getAttribute('value')).toBe(`${applicantFirstName} ${applicantLastName}`);
      expect(await webAutomator.findElement(protractor.By.model('formInfo.email')).getAttribute('value')).toBe(applicantEmail);
      expect(await webAutomator.findElement(protractor.By.model('formInfo.address')).getAttribute('value')).toBe("123 Test Avenue");
      expect(await webAutomator.findElement(protractor.By.model('formInfo.zip')).getAttribute('value')).toBe("15201");
      expect(await webAutomator.findElement(protractor.By.model('formInfo.city')).getAttribute('value')).toBe("Pittsburgh");

      // Verify selected country and state from dropdowns
      const countryDropdown = element(by.model('formInfo.country'));
      const selectedCountryValue = await countryDropdown.getAttribute('value');
      const selectedCountryText = await element(by.css(`select option[value="${selectedCountryValue}"]`)).getText();
      expect(selectedCountryText).toEqual('United States');

      const stateDropdown = element(by.model('formInfo.stateList'));
      const selectedStateValue = await stateDropdown.getAttribute('value');
      const selectedStateText = await element(by.css(`select option[value="${selectedStateValue}"]`)).getText();
      expect(selectedStateText).toEqual('Pennsylvania');
      console.log("User details, country, and state list verified.");
    });
    performPaymentFlowAssertions(applicantEmail); // Execute shared credit card tests
  });

  describe("User Journey: Anonymous User with Ziptastic Disabled", function () {
    // Generate new unique user data for this anonymous scenario
    const anonymousUserGivenName = createUniqueId();
    const anonymousUserFamilyName = createUniqueId();
    const anonymousUserContactEmail = `${anonymousUserGivenName}_nozip@example.net`;

    runPriceSetVerification(); // Execute shared price set tests

    // Test case to manually fill in all user information fields
    it ("should allow manual input of all user details for anonymous users", async function() {
      console.log("Manually filling user information for anonymous user with Ziptastic disabled...");
      await webAutomator.findElement(protractor.By.model('formInfo.user')).sendKeys(`${anonymousUserGivenName} ${anonymousUserFamilyName}`);
      await webAutomator.findElement(protractor.By.model('formInfo.email')).sendKeys(anonymousUserContactEmail);
      await webAutomator.findElement(protractor.By.model('formInfo.address')).sendKeys('789 Elm Street');
      await webAutomator.findElement(protractor.By.model('formInfo.zip')).sendKeys('90210'); // Different zip code
      // Manually select country and state from dropdowns
      await webAutomator.findElement(protractor.By.cssContainingText('option', 'United States')).click();
      await webAutomator.findElement(protractor.By.cssContainingText('option', 'California')).click(); // Different state
      await webAutomator.findElement(protractor.By.model('formInfo.city')).sendKeys('Beverly Hills'); // Different city
      console.log("All user details manually entered.");
    });
    performPaymentFlowAssertions(anonymousUserContactEmail); // Execute shared credit card tests
  });


  /**
   * Helper function to perform assertions related to the payment flow.
   * @param {string} expectedEmail The email address expected on the thank you page.
   */
  function performPaymentFlowAssertions(expectedEmail) {
    // Credit card information section tests
    it ("should validate and process credit card details for donation", async function() {
      console.log("Initiating payment details validation...");
      const donateSubmissionBtn = webAutomator.findElement(protractor.By.css('button.donate-sub'));
      await donateSubmissionBtn.click();
      console.log("Clicked 'Donate Now' button.");

      // Check initial state of credit card fields (should be hidden)
      await assertCreditCardFieldPresence(false, "Card fields should be hidden before input.");

      // Enter dummy credit card number
      const cardNumberInput = webAutomator.findElement(protractor.By.model('formInfo.cardNumberValue'));
      await cardNumberInput.sendKeys('4242424242424242'); // Standard test card number
      await webAutomator.sleep(500); // Small pause for UI updates

      // Check state of credit card fields after entering card number (should be visible)
      await assertCreditCardFieldPresence(true, "Card fields should be visible after card number input.");

      // Enter expiry and security code
      const cardExpirationInput = webAutomator.findElement(protractor.By.model('formInfo.cardExpiry'));
      await cardExpirationInput.click();
      await cardExpirationInput.sendKeys('1225'); // MMYY format for 12/2025
      const securityCodeInput = webAutomator.findElement(protractor.By.model('formInfo.securityCode'));
      await securityCodeInput.sendKeys('123'); // Dummy CVV

      // Submit the donation
      const finalSubmitButton = webAutomator.findElement(protractor.By.css('button.donate-submit-btn'));
      await finalSubmitButton.click();
      console.log("Clicked final 'Submit Donation' button.");

      // Wait for the thank you page to load
      await webAutomator.wait(protractor.ExpectedConditions.urlContains('donation/thanks'), 10000, 'Did not navigate to donation thank you page.');
      expect(await webAutomator.getCurrentUrl()).toContain('donation/thanks');
      console.log("Navigated to thank you page.");

      // Verify the email address displayed on the thank you message
      const thankYouEmailElement = webAutomator.findElement(protractor.By.css('strong.ng-binding'));
      expect(await thankYouEmailElement.getText()).toContain(expectedEmail);
      console.log(`Thank you message verified for email: ${expectedEmail}`);

      // Log out after successful donation
      await webAutomator.get(webAutomator.baseUrl + 'user/logout');
      console.log("User logged out after donation.");
    });
  }

  /**
   * Helper function to execute price set related tests.
   */
  function runPriceSetVerification() {
    it ("should successfully navigate to the donation page", async function() {
      const donationPageUrl = webAutomator.baseUrl + 'civicrm/simple?test=1#/donation';
      await webAutomator.get(donationPageUrl);
      await webAutomator.wait(protractor.ExpectedConditions.urlContains('civicrm/simple?test=1#/donation'), 5000, 'Donation page URL not reached.');
      expect(await webAutomator.getCurrentUrl()).toContain('civicrm/simple?test=1#/donation');
      console.log(`Accessed donation page: ${donationPageUrl}`);
    });

    it ("should confirm a default price set amount is selected", async function() {
      console.log("Checking for default price selection...");
      // Verifies the first price option is selected by default
      await getDisplayedAmount(0); // Using index 0 for the first price option
      console.log("Default price set amount confirmed.");
    });

    // Price set section test cases
    it ("should reveal total donation summary on hover over a price option", async function() {
      console.log("Testing hover interaction for price summary...");
      // Hover over the first price option (index 0)
      const firstPriceOption = webAutomator.findElement(protractor.By.css('ul.priceSet li:nth-child(1)'));
      await webAutomator.actions().mouseMove(firstPriceOption).perform();
      // Verify the summary message appears for the hovered item
      await getDisplayedAmount(0);
      console.log("Donation summary visible on hover.");
    });

    it ("should update total donation summary upon selecting a price option", async function() {
      console.log("Testing click interaction for price summary...");
      // Click the first price option
      await webAutomator.findElement(protractor.By.css('ul.priceSet li:nth-child(1)')).click();
      // Verify the summary message updates for the clicked item
      await getDisplayedAmount(0);
      console.log("Donation summary updated after selection.");
    });

    it ("should accept and display custom 'other amount' input", async function() {
      console.log("Testing 'other amount' input functionality...");
      const otherAmountInputs = await element.all(by.model('formInfo.otherAmount'));
      if (otherAmountInputs.length > 0) {
        const customAmountField = otherAmountInputs[0]; // Assuming only one 'other amount' field
        await customAmountField.click();
        await customAmountField.sendKeys('7500'); // Enter a custom amount
        console.log("Entered custom amount: 7500");

        const summaryMessage = element(by.className('priceSetMessage'));
        expect(await summaryMessage.isDisplayed()).toBe(true, "Price set message should be visible");
        expect(await summaryMessage.getText()).toContain('7500', "Price set message should contain custom amount");
      } else {
        console.warn("No 'other amount' field found for testing.");
      }
      await webAutomator.findElement(protractor.By.css('button.donate-sub')).click();
      console.log("Submitted custom amount.");
    });

    it ("should allow toggling the recurring donation checkbox", async function() {
      console.log("Testing recurring donation checkbox...");
      const recurCheckboxes = await element.all(by.model('formInfo.recur'));
      if (recurCheckboxes.length > 0) {
        const recurringToggle = webAutomator.findElement(protractor.By.css('input#isRecur'));
        await recurringToggle.click();
        expect(await recurringToggle.isSelected()).toBe(true, "Recurring checkbox should be selected");
        console.log("Recurring donation checkbox toggled.");
      } else {
        console.warn("No recurring donation checkbox found for testing.");
      }
    });
  }

  /**
   * Helper function to authenticate a user.
   * @param {string} systemUsername The username to log in with.
   * @param {string} systemPassword The password for the user.
   */
  async function authenticateUser(systemUsername, systemPassword) {
    await webAutomator.get(webAutomator.baseUrl + 'user'); // Navigate to login page
    await webAutomator.wait(protractor.ExpectedConditions.visibilityOf(webAutomator.findElement(protractor.By.id('edit-name'))), 5000, 'Login form not visible.');
    await webAutomator.findElement(protractor.By.id('edit-name')).sendKeys(systemUsername);
    await webAutomator.findElement(protractor.By.id('edit-pass')).sendKeys(systemPassword);
    await webAutomator.findElement(protractor.By.id('edit-submit')).click();
    console.log(`User '${systemUsername}' attempted login.`);
    // Add a wait for successful login, e.g., for a dashboard element
    await webAutomator.wait(protractor.ExpectedConditions.urlContains('user'), 5000, 'Login failed or did not redirect to user page.');
  }

  /**
   * Helper function to get and assert the displayed donation amount.
   * @param {number} optionIndex The index of the price option to verify.
   */
  async function getDisplayedAmount(optionIndex) {
    const priceElements = await element.all(by.repeater('price in priceListInfo'));
    if (priceElements.length > optionIndex) {
      const selectedPriceLabel = priceElements[optionIndex].element(by.tagName('label'));
      const selectedAmountText = await selectedPriceLabel.getText();
      const donationSummaryDiv = webAutomator.findElement(protractor.By.css('div.priceSetMessage'));
      expect(await donationSummaryDiv.isDisplayed()).toBe(true, "Donation summary div should be visible.");
      expect(await donationSummaryDiv.getText()).toBe(`Donation amount: ${selectedAmountText}`);
      console.log(`Displayed amount verified: ${selectedAmountText}`);
    } else {
      console.warn(`Price option at index ${optionIndex} not found.`);
    }
  }

  /**
   * Helper function to assert the visibility of credit card input fields.
   * @param {boolean} expectedVisibility The expected display status (true for visible, false for hidden).
   * @param {string} message Custom message for the assertion.
   */
  async function assertCreditCardFieldPresence(expectedVisibility, message = "") {
    const cardExpirationField = webAutomator.findElement(protractor.By.model('formInfo.cardExpiry'));
    const securityCodeField = webAutomator.findElement(protractor.By.model('formInfo.securityCode'));

    // Ensure elements are present in DOM before checking display status
    expect(await cardExpirationField.isPresent()).toBe(true, "Card Expiration field not present in DOM.");
    expect(await securityCodeField.isPresent()).toBe(true, "Security Code field not present in DOM.");

    expect(await cardExpirationField.isDisplayed()).toBe(expectedVisibility, `Card Expiration field display status mismatch: ${message}`);
    expect(await securityCodeField.isDisplayed()).toBe(expectedVisibility, `Security Code field display status mismatch: ${message}`);
    console.log(`Credit card fields visibility checked: Expected ${expectedVisibility}, Actual Expiry: ${await cardExpirationField.isDisplayed()}, Actual CVV: ${await securityCodeField.isDisplayed()}.`);
  }
});