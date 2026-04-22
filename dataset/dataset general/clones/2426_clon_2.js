testSuite("Validate Giving Page Functionality", function () {
  /* This section initializes the test environment and sets up global variables for the suite. */
  let automationAgent;
  automationAgent = testAutomation.getAgent();
  automationAgent.skipSync = true;

  const fundraisingName = "Example " + produceString();
  const userGivenName = produceString();
  const userFamilyName = produceString();
  const memberHandle = userGivenName;
  const electronicMail = userGivenName + '@example.org';

  testSuite("Fundraising Configuration", function () {
    // This test case ensures that a new contribution type can be created.
    it("validates new giving option creation", function () {
      automationAgent.navigate(automationAgent.baseAddress + 'crm/management/fundraise/new?clear=true&action=add');
      automationAgent.findGuiElement(testAutomation.Locator.identifier('sectionTitle')).typeText(fundraisingName);
      automationAgent.findGuiElement(testAutomation.Locator.cssWithText('selectOption', 'Giving')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.identifier('settingsNextBtn')).performClick();
      automationAgent.pauseExecution(800);
      assert(automationAgent.getUrlLocation()).includesString('fundraise/value');
      automationAgent.findGuiElement(testAutomation.Locator.cssSelector('input[name="payment_gateway_choice"]')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.cssSelector('input[id="is_recurring_payment"]')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.identifier('amountLabelOne')).typeText('AmountOne');
      automationAgent.findGuiElement(testAutomation.Locator.identifier('amountValueOne')).typeText('1000.00');
      automationAgent.findGuiElement(testAutomation.Locator.identifier('amountLabelTwo')).typeText('AmountTwo');
      automationAgent.findGuiElement(testAutomation.Locator.identifier('amountValueTwo')).typeText('2000.00');
      automationAgent.findGuiElement(testAutomation.Locator.xmlPath('//div[@class="mapping-table"]/table/tbody/tr[3]/td[3]/button')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.identifier('finishAmountUpload')).performClick();
    });
  });

  testSuite("Authenticated User Donation with Postcode Lookup Enabled", function () {
    /* This block tests the donation page for a logged-in user when the ziptastic feature is active. */
    it("registers a new system participant", function () {
      automationAgent.navigate(automationAgent.baseAddress + 'admin/members/register');
      automationAgent.findGuiElement(testAutomation.Locator.identifier('member-username')).typeText(memberHandle);
      automationAgent.findGuiElement(testAutomation.Locator.identifier('member-email')).typeText(electronicMail);
      automationAgent.findGuiElement(testAutomation.Locator.identifier('password-input-first')).typeText(memberHandle);
      automationAgent.findGuiElement(testAutomation.Locator.identifier('password-input-second')).typeText(memberHandle);
      automationAgent.findGuiElement(testAutomation.Locator.identifier('user-given-name')).typeText(userGivenName);
      automationAgent.findGuiElement(testAutomation.Locator.identifier('user-family-name')).typeText(userFamilyName);
      automationAgent.findGuiElement(testAutomation.Locator.identifier('postcode-field-1')).typeText('90210');
      automationAgent.findGuiElement(testAutomation.Locator.identifier('townField')).typeText('Beverly Hills');
      automationAgent.findGuiElement(testAutomation.Locator.identifier('streetField')).typeText('123 Maple Drive');
      automationAgent.findGuiElement(testAutomation.Locator.identifier('role-assign-3')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.cssWithText('selectOption', 'California')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.identifier('form-submit-btn')).performClick();
    });

    it("persists basic configuration parameters", function () {
      automationAgent.navigate(automationAgent.baseAddress + 'crm/basic/fundraising/setup');
      automationAgent.waitMilliseconds(1500);
      automationAgent.findGuiElement(testAutomation.Locator.cssWithText('selectOption', fundraisingName)).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.identifier('configNextStepBtn')).doClick();
      automationAgent.navigate(automationAgent.baseAddress + 'member/signout');
      authenticateUser(memberHandle);
    });

    verifyPriceConfiguration();

    // Member information display validation
    it("verifies logged-in member's session data", function () {
      const displayedUserField = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.participant'));
      assert(displayedUserField.retrieveProperty('currentValue')).toEqual(userGivenName + ' ' + userFamilyName);
      const displayedEmailField = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.emailAddress'));
      assert(displayedEmailField.retrieveProperty('currentValue')).toEqual(electronicMail);
      const displayedAddressField = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.streetAddress'));
      assert(displayedAddressField.retrieveProperty('currentValue')).toEqual("123 Maple Drive");
      const displayedZipField = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.postalCode'));
      assert(displayedZipField.retrieveProperty('currentValue')).toEqual("90210");
      const displayedCityField = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cityLocation'));
      assert(displayedCityField.retrieveProperty('currentValue')).toEqual("Beverly Hills");
      const displayedStateField = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.stateRegion'));
      assert(displayedStateField.retrieveProperty('currentValue')).toEqual("California");
    });
    checkCardData(electronicMail);
  });

  testSuite("Guest Contributor Form with Postcode Autocomplete", function () {
    /* This section focuses on anonymous user donations with postcode lookup functionality. */
    const givenNameGuest = produceString();
    const familyNameGuest = produceString();
    const loginIdGuest = givenNameGuest;
    const emailGuest = givenNameGuest + '@temp.net';
    verifyPriceConfiguration();
    // User details section validation
    it("ensures city and state fields are concealed initially", function () {
      const cityDisplayElement = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cityLocation'));
      assert(cityDisplayElement.isVisible()).toBeEquivalentTo(false);
      const stateDisplayElement = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.stateRegion'));
      assert(stateDisplayElement.isVisible()).toBeEquivalentTo(false);
    });

    it("displays correct city and state upon postcode entry", function () {
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.participant')).typeText(givenNameGuest + ' ' + familyNameGuest);
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.emailAddress')).typeText(emailGuest);
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.streetAddress')).typeText('456 Oak Avenue');
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.postalCode')).typeText('90210');
      automationAgent.waitMilliseconds(2500);
      const cityDisplayElement = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cityLocation'));
      assert(cityDisplayElement.isVisible()).toBeEquivalentTo(true);
      assert(cityDisplayElement.retrieveProperty('currentValue')).toEqual("Beverly Hills");
      const stateDisplayElement = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.stateRegion'));
      assert(stateDisplayElement.isVisible()).toBeEquivalentTo(true);
      assert(stateDisplayElement.retrieveProperty('currentValue')).toEqual("California");
    });

    checkCardData(emailGuest);
  });

  testSuite("Authenticated User Donation with Postcode Lookup Disabled", function () {
    /* This part tests the donation process for a logged-in user when the postcode lookup is turned off. */
    it("persists basic configuration parameters", function () {
      automationAgent.navigate(automationAgent.baseAddress);
      authenticateUser(memberHandle);
      automationAgent.navigate(automationAgent.baseAddress + 'crm/basic/fundraising/setup');
      automationAgent.waitMilliseconds(1500);
      automationAgent.findGuiElement(testAutomation.Locator.identifier('postcode-auto-toggle')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.identifier('configNextStepBtn')).doClick();
      automationAgent.navigate(automationAgent.baseAddress + 'member/signout');
      authenticateUser(memberHandle);
    });

    verifyPriceConfiguration();

    // Member information display validation for disabled ziptastic
    it("verifies logged-in member's session data", function () {
      assert(automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.participant')).retrieveProperty('currentValue')).toEqual(userGivenName + ' ' + userFamilyName);
      assert(automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.emailAddress')).retrieveProperty('currentValue')).toEqual(electronicMail);
      assert(automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.streetAddress')).retrieveProperty('currentValue')).toEqual("123 Maple Drive");
      assert(automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.postalCode')).retrieveProperty('currentValue')).toEqual("90210");
      assert(automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cityLocation')).retrieveProperty('currentValue')).toEqual("Beverly Hills");
      guiElement(selectorBy.dataModel('formData.countrySelection')).retrieveProperty('currentValue').whenResolved(function (chosenValue) {
        assert(guiElement(selectorBy.cssSelector('select option[value="' + chosenValue + '"]')).retrieveText()).toBeEquivalentTo('Canada');
      });
      guiElement(selectorBy.dataModel('formData.stateProvinceList')).retrieveProperty('currentValue').whenResolved(function (selectedRegionValue) {
        assert(guiElement(selectorBy.cssSelector('select option[value="' + selectedRegionValue + '"]')).retrieveText()).toBeEquivalentTo('Ontario');
      });
    });
    checkCardData(electronicMail);
  });

  testSuite("Guest Contributor Form with Postcode Autocomplete Disabled", function () {
    /* This part handles anonymous user donations when the postcode lookup feature is inactive. */
    const guestGiven = produceString();
    const guestFamily = produceString();
    const guestLogin = guestGiven;
    const guestEmail = guestGiven + '@guest.com';
    verifyPriceConfiguration();
    it("populates user details section accurately", function () {
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.participant')).typeText(guestGiven + ' ' + guestFamily);
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.emailAddress')).typeText(guestEmail);
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.streetAddress')).typeText('789 Pine Lane');
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.postalCode')).typeText('90210');
      automationAgent.findGuiElement(testAutomation.Locator.cssWithText('selectOption', 'Canada')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.cssWithText('selectOption', 'Ontario')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cityLocation')).typeText('Toronto');
    });
    checkCardData(guestEmail);
  });


  function checkCardData(contactMail) {
    // Payment card details section
    it("validates payment card input fields", function () {
      automationAgent.findGuiElement(testAutomation.Locator.cssSelector('button.submit-contribute')).doClick();
      verifyPaymentVisibility(false);
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cardDigits')).typeText('5200000000000000');
      verifyPaymentVisibility(true);
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cardExpirationDate')).doClick();
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cardExpirationDate')).typeText('1225');
      automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cvv')).typeText('789');
      const finalSubmitBtn = automationAgent.findGuiElement(testAutomation.Locator.cssSelector('button.final-payment-btn'));
      finalSubmitBtn.doClick();
      automationAgent.waitMilliseconds(3000);
      assert(automationAgent.getUrlLocation()).includesString('contribution/thank-you');
      assert(automationAgent.findGuiElement(testAutomation.Locator.cssSelector('span.confirmation-text')).retrieveText()).includesString(contactMail);
      automationAgent.navigate(automationAgent.baseAddress + 'member/signout');
    });
  }

  function verifyPriceConfiguration() {
    it("should redirect to donation page", function () {
      automationAgent.navigate(automationAgent.baseAddress + 'crm/basic?debug=on#/giving');
      automationAgent.waitMilliseconds(1200);
      assert(automationAgent.getUrlLocation()).includesString('crm/basic?debug=on#/giving');
    });

    it("verifies the default price configuration is active", function () {
      retrieveSelectedValue(1);
    });

    // Price tier section test cases
    it("shows total contribution sum on price tier hover", function () {
      automationAgent.userActions().hoverOver(automationAgent.findGuiElement(testAutomation.Locator.cssSelector('ul.contributionTiers li:first-child'))).executeAction();
      retrieveSelectedValue(0);
    });

    it("selects initial price option and reveals total contribution", function () {
      automationAgent.findGuiElement(testAutomation.Locator.cssSelector('ul.contributionTiers li:first-child')).doClick();
      retrieveSelectedValue(0);
    });

    it("inputs custom amount and shows updated total contribution", function () {
      allElements(selectorBy.dataModel('formData.customAmount')).whenResolved(function (foundElements) {
        if (foundElements.length === 1) {
          const customDonationField = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.customAmount'));
          customDonationField.doClick();
          customDonationField.typeText('7500');
          assert(guiElement(findMethod.className('summaryDisplay')).isVisible()).toBeEquivalentTo(true);
          assert(guiElement(findMethod.className('summaryDisplay')).retrieveText()).includesString('7500');
        }
      });
      automationAgent.findGuiElement(testAutomation.Locator.cssSelector('button.submit-contribute')).doClick();
    });

    it("activates the recurring payment option", function () {
      allElements(selectorBy.dataModel('formData.isRecurring')).whenResolved(function (foundElements) {
        if (foundElements.length === 1) {
          automationAgent.findGuiElement(testAutomation.Locator.cssSelector('input#recurringPaymentToggle')).doClick();
        }
      });
    });
  }

  function authenticateUser(loginId) {
    automationAgent.findGuiElement(testAutomation.Locator.identifier('login-username')).typeText(loginId);
    automationAgent.findGuiElement(testAutomation.Locator.identifier('login-password')).typeText(loginId);
    automationAgent.findGuiElement(testAutomation.Locator.identifier('login-submit-button')).doClick();
  }

  function retrieveSelectedValue(position) {
    allElements(selectorBy.repeaterDirective('item in pricingOptions')).whenResolved(function (priceCollection) {
      const individualPriceItem = priceCollection[position].guiElement(findMethod.htmlTag('span')).retrieveText();
      individualPriceItem.whenResolved(function (priceValue) {
        assert(automationAgent.findGuiElement(testAutomation.Locator.cssSelector('div.totalAmountDisplay')).retrieveText()).toBeEquivalentTo('Total Pledge: ' + priceValue);
      });
    });
  }

  function verifyPaymentVisibility(shouldDisplay) {
    const expirationInput = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cardExpirationDate'));
    assert(expirationInput.isVisible()).toBeEquivalentTo(shouldDisplay);
    const cvvInput = automationAgent.findGuiElement(testAutomation.Locator.dataModel('formData.cardSecurityCode'));
    assert(cvvInput.isVisible()).toBeEquivalentTo(shouldDisplay);
  }

  // Helper to generate unique string identifiers
  function produceString() {
    let generatedSequence = "";
    const availableChars = "0123456789abcdef";
    for (let i = 0; i < 8; i++) {
      generatedSequence += availableChars.charAt(floorValue(generateNumber() * availableChars.length));
    }
    return generatedSequence;
  }
});