const Assessor = {
    verifyContains: (actual, expected, diagnostic = 'Content mismatch') => {
        if (!actual.includes(expected)) {
            throw new Error(`Assertion Failed: ${diagnostic}. Expected "${actual}" to contain "${expected}".`);
        }
    },
    verifyEquals: (actual, expected, diagnostic = 'Equality mismatch') => {
        if (actual !== expected) {
            throw new Error(`Assertion Failed: ${diagnostic}. Expected "${actual}" to equal "${expected}".`);
        }
    },
    verifyBoolean: (actual, expected, diagnostic = 'Boolean mismatch') => {
        if (actual !== expected) {
            throw new Error(`Assertion Failed: ${diagnostic}. Expected "${actual}" to be "${expected}".`);
        }
    }
};

const AlphaGenerator = {
    generateRandomWord: (len = 6) => {
        const charSet = "abcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < len; i++) {
            result += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }
        return result;
    }
};

const AutomationDriverV2 = function (browserInstance) {
    const internalBrowser = browserInstance;
    const locatorMap = {
        'id': internalBrowser.By.id,
        'css': internalBrowser.By.css,
        'xpath': internalBrowser.By.xpath,
        'model': internalBrowser.By.model,
        'cssText': internalBrowser.By.cssContainingText,
        'tagName': internalBrowser.By.tagName,
        'repeater': internalBrowser.By.repeater
    };

    const getLocator = (type, value) => {
        if (!locatorMap[type]) {
            throw new Error(`Unknown locator type: ${type}`);
        }
        return locatorMap[type](value);
    };

    this.locateSingle = async (type, value) => {
        return internalBrowser.findElement(getLocator(type, value));
    };

    this.locateMultiple = async (type, value) => {
        return internalBrowser.element.all(getLocator(type, value));
    };

    this.locateByGlobalElement = async (type, value) => {
        // This simulates `element(by.model(...))`
        return internalBrowser.element(getLocator(type, value));
    };

    this.navigatePage = async (uri) => { await internalBrowser.get(uri); };
    this.pauseExecution = async (ms) => { await internalBrowser.sleep(ms); };
    this.getCurrentPageURL = async () => { return await internalBrowser.getCurrentUrl(); };
    this.performHover = async (elementFinder) => { await internalBrowser.actions().mouseMove(elementFinder).perform(); };

    this.typeInput = async (elementFinder, text) => { await elementFinder.sendKeys(text); };
    this.performClick = async (elementFinder) => { await elementFinder.click(); };
    this.retrieveAttribute = async (elementFinder, attrName) => { return await elementFinder.getAttribute(attrName); };
    this.retrieveText = async (elementFinder) => { return await elementFinder.getText(); };
    this.checkElementVisibility = async (elementFinder) => { return await elementFinder.isDisplayed(); };
};

const TestOrchestratorV2 = function (driverClient, appConfig) {
    this.driver = driverClient;
    this.baseApplicationURL = appConfig.baseSiteURL;
    this.authenticationHandler = appConfig.userAuthenticationService;
    this.assertionUtility = Assessor;
    this.randomWordGen = AlphaGenerator;

    let primaryContributionLabel;
    let primaryUserGivenName;
    let primaryUserFamilyName;
    let primaryUserLoginAlias;
    let primaryUserMailAddress;

    const checkVisualStatusOfCardFields = async (expectedVisibility) => {
        const expiryField = await this.driver.locateSingle('model', 'formInfo.cardExpiry');
        const securityField = await this.driver.locateSingle('model', 'formInfo.securityCode');

        this.assertionUtility.verifyBoolean(await this.driver.checkElementVisibility(expiryField), expectedVisibility, 'Card expiry field visibility incorrect');
        this.assertionUtility.verifyBoolean(await this.driver.checkElementVisibility(securityField), expectedVisibility, 'Security code field visibility incorrect');
    };

    const executePriceSetVerification = async () => {
        await this.driver.navigatePage(this.baseApplicationURL + 'civicrm/simple?test=1#/donation');
        await this.driver.pauseExecution(1500);
        this.assertionUtility.verifyContains(await this.driver.getCurrentPageURL(), 'civicrm/simple?test=1#/donation', 'Donation page URL check failed');

        await validateSelectedAmount(1);

        const firstPriceItem = await this.driver.locateSingle('css', 'ul.priceSet li:nth-child(1)');
        await this.driver.performHover(firstPriceItem);
        await validateSelectedAmount(0);

        await this.driver.performClick(firstPriceItem);
        await validateSelectedAmount(0);

        const otherAmountInputs = await this.driver.locateMultiple('model', 'formInfo.otherAmount');
        if (otherAmountInputs.length === 1) {
            const otherAmtInput = otherAmountInputs[0];
            await this.driver.performClick(otherAmtInput);
            await this.driver.typeInput(otherAmtInput, '6000');
            const messageDiv = await this.driver.locateSingle('css', 'div.priceSetMessage');
            this.assertionUtility.verifyBoolean(await this.driver.checkElementVisibility(messageDiv), true, 'Price message not shown for custom amount');
            this.assertionUtility.verifyContains(await this.driver.retrieveText(messageDiv), '6000', 'Price message text incorrect for custom amount');
        }
        const donateSubButton = await this.driver.locateSingle('css', 'button.donate-sub');
        await this.driver.performClick(donateSubButton);

        const recurCheckboxes = await this.driver.locateMultiple('model', 'formInfo.recur');
        if (recurCheckboxes.length === 1) {
            const recurInput = await this.driver.locateSingle('css', 'input#isRecur');
            await this.driver.performClick(recurInput);
        }
    };

    const validateSelectedAmount = async (idx) => {
        const priceItems = await this.driver.locateMultiple('repeater', 'price in priceListInfo');
        const targetLabel = await priceItems[idx].element(this.driver.getLocator('tagName', 'label')).getText();
        const displayMessage = await this.driver.locateSingle('css', 'div.priceSetMessage');
        this.assertionUtility.verifyEquals(await this.driver.retrieveText(displayMessage), 'Donation amount: ' + targetLabel, 'Selected amount message text mismatch');
    };

    const handleCreditSubmission = async (userMail) => {
        const donateSubBtn = await this.driver.locateSingle('css', 'button.donate-sub');
        await this.driver.performClick(donateSubBtn);
        await checkVisualStatusOfCardFields(false);

        const cardNumberField = await this.driver.locateSingle('model', 'formInfo.cardNumberValue');
        await this.driver.typeInput(cardNumberField, '4100000000000000');
        await checkVisualStatusOfCardFields(true);

        const cardExpiryField = await this.driver.locateSingle('model', 'formInfo.cardExpiry');
        await this.driver.performClick(cardExpiryField);
        await this.driver.typeInput(cardExpiryField, '0820');

        const securityCodeField = await this.driver.locateSingle('model', 'formInfo.securityCode');
        await this.driver.typeInput(securityCodeField, '510');

        const submitButton = await this.driver.locateSingle('css', 'button.donate-submit-btn');
        await this.driver.performClick(submitButton);
        await this.driver.pauseExecution(3000);

        this.assertionUtility.verifyContains(await this.driver.getCurrentPageURL(), 'donation/thanks', 'Thank you URL incorrect');
        const confirmationText = await this.driver.locateSingle('css', 'strong.ng-binding');
        this.assertionUtility.verifyContains(await this.driver.retrieveText(confirmationText), userMail, 'Email confirmation text incorrect');
        await this.driver.navigatePage(this.baseApplicationURL + 'user/logout');
    };

    this.configureInitialSettings = () => {
        primaryContributionLabel = 'Descriptor ' + this.randomWordGen.generateRandomWord();
        primaryUserGivenName = this.randomWordGen.generateRandomWord();
        primaryUserFamilyName = this.randomWordGen.generateRandomWord();
        primaryUserLoginAlias = primaryUserGivenName;
        primaryUserMailAddress = primaryUserGivenName + '@info.com';
    };

    this.runContributionSetup = async () => {
        await this.driver.navigatePage(this.baseApplicationURL + 'civicrm/admin/contribute/add?reset=1&action=add');
        const titleInput = await this.driver.locateSingle('id', 'title');
        await this.driver.typeInput(titleInput, primaryContributionLabel);

        const donationOption = await this.driver.locateSingle('cssText', 'option', 'Donation');
        await this.driver.performClick(donationOption);

        const nextButton = await this.driver.locateSingle('id', '_qf_Settings_next-bottom');
        await this.driver.performClick(nextButton);

        await this.driver.pauseExecution(500);
        this.assertionUtility.verifyContains(await this.driver.getCurrentPageURL(), 'contribute/amount', 'Contribution amount page URL mismatch');

        const paymentProcessor = await this.driver.locateSingle('css', 'input#payment_processor_1');
        await this.driver.performClick(paymentProcessor);
        const isRecur = await this.driver.locateSingle('css', 'input#is_recur');
        await this.driver.performClick(isRecur);

        const label1 = await this.driver.locateSingle('id', 'label_1');
        await this.driver.typeInput(label1, 'TestAm1');
        const value1 = await this.driver.locateSingle('id', 'value_1');
        await this.driver.typeInput(value1, '1000');
        const label2 = await this.driver.locateSingle('id', 'label_2');
        await this.driver.typeInput(label2, 'TestAm2');
        const value2 = await this.driver.locateSingle('id', 'value_2');
        await this.driver.typeInput(value2, '2000');

        const tableInput = await this.driver.locateSingle('xpath', '//table[@id="map-field-table"]/tbody/tr[3]/td[3]/input');
        await this.driver.performClick(tableInput);

        const uploadDone = await this.driver.locateSingle('id', '_qf_Amount_upload_done-bottom');
        await this.driver.performClick(uploadDone);
    };

    this.processLoggedInZiptasticOn = async () => {
        await this.driver.navigatePage(this.baseApplicationURL + 'admin/people/create');
        const editName = await this.driver.locateSingle('id', 'edit-name');
        await this.driver.typeInput(editName, primaryUserLoginAlias);
        const editMail = await this.driver.locateSingle('id', 'edit-mail');
        await this.driver.typeInput(editMail, primaryUserMailAddress);
        const pass1 = await this.driver.locateSingle('id', 'edit-pass-pass1');
        await this.driver.typeInput(pass1, primaryUserLoginAlias);
        const pass2 = await this.driver.locateSingle('id', 'edit-pass-pass2');
        await this.driver.typeInput(pass2, primaryUserLoginAlias);
        const firstName = await this.driver.locateSingle('id', 'first_name');
        await this.driver.typeInput(firstName, primaryUserGivenName);
        const lastName = await this.driver.locateSingle('id', 'last_name');
        await this.driver.typeInput(lastName, primaryUserFamilyName);
        const postalCode = await this.driver.locateSingle('id', 'postal_code-1');
        await this.driver.typeInput(postalCode, '15201');
        const cityInput = await this.driver.locateSingle('id', 'city-1');
        await this.driver.typeInput(cityInput, 'Pittsburgh');
        const streetAddress = await this.driver.locateSingle('id', 'street_address-1');
        await this.driver.typeInput(streetAddress, 'Test street address');
        const editRoles = await this.driver.locateSingle('id', 'edit-roles-3');
        await this.driver.performClick(editRoles);
        const pennsylvaniaOption = await this.driver.locateSingle('cssText', 'option', 'Pennsylvania');
        await this.driver.performClick(pennsylvaniaOption);
        const submitButton = await this.driver.locateSingle('id', 'edit-submit');
        await this.driver.performClick(submitButton);

        await this.driver.navigatePage(this.baseApplicationURL + 'civicrm/simple/donation/configuration');
        await this.driver.pauseExecution(1000);
        const contribOption = await this.driver.locateSingle('cssText', 'option', primaryContributionLabel);
        await this.driver.performClick(contribOption);
        const configNext = await this.driver.locateSingle('id', '_qf_SimpleDonationSetting_next-bottom');
        await this.driver.performClick(configNext);
        await this.driver.navigatePage(this.baseApplicationURL + 'user/logout');
        await this.authenticationHandler(this.driver, primaryUserLoginAlias);

        await executePriceSetVerification();

        const userFormInfo = await this.driver.locateSingle('model', 'formInfo.user');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(userFormInfo, 'value'), primaryUserGivenName + ' ' + primaryUserFamilyName, 'Logged-in user name mismatch');
        const emailFormInfo = await this.driver.locateSingle('model', 'formInfo.email');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(emailFormInfo, 'value'), primaryUserMailAddress, 'Logged-in email mismatch');
        const addressFormInfo = await this.driver.locateSingle('model', 'formInfo.address');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(addressFormInfo, 'value'), "Test street address", 'Logged-in address mismatch');
        const zipFormInfo = await this.driver.locateSingle('model', 'formInfo.zip');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(zipFormInfo, 'value'), "15201", 'Logged-in zip mismatch');
        const cityFormInfo = await this.driver.locateSingle('model', 'formInfo.city');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(cityFormInfo, 'value'), "Pittsburgh", 'Logged-in city mismatch');
        const stateFormInfo = await this.driver.locateSingle('model', 'formInfo.state');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(stateFormInfo, 'value'), "Pennsylvania", 'Logged-in state mismatch');

        await handleCreditSubmission(primaryUserMailAddress);
    };

    this.processAnonymousZiptasticOn = async () => {
        const guestFirstName = this.randomWordGen.generateRandomWord();
        const guestLastName = this.randomWordGen.generateRandomWord();
        const guestEmail = guestFirstName + '@info.com';

        await executePriceSetVerification();

        const cityElement = await this.driver.locateSingle('model', 'formInfo.city');
        this.assertionUtility.verifyBoolean(await this.driver.checkElementVisibility(cityElement), false, 'City field should be hidden for anonymous user initially');
        const stateElement = await this.driver.locateSingle('model', 'formInfo.state');
        this.assertionUtility.verifyBoolean(await this.driver.checkElementVisibility(stateElement), false, 'State field should be hidden for anonymous user initially');

        const userField = await this.driver.locateSingle('model', 'formInfo.user');
        await this.driver.typeInput(userField, guestFirstName + ' ' + guestLastName);
        const emailField = await this.driver.locateSingle('model', 'formInfo.email');
        await this.driver.typeInput(emailField, guestEmail);
        const addressField = await this.driver.locateSingle('model', 'formInfo.address');
        await this.driver.typeInput(addressField, '123 Main Land street');
        const zipField = await this.driver.locateSingle('model', 'formInfo.zip');
        await this.driver.typeInput(zipField, '15201');
        await this.driver.pauseExecution(3000);

        this.assertionUtility.verifyBoolean(await this.driver.checkElementVisibility(cityElement), true, 'City field should be visible after zip entry');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(cityElement, 'value'), "Pittsburgh", 'City value mismatch after zip entry');
        this.assertionUtility.verifyBoolean(await this.driver.checkElementVisibility(stateElement), true, 'State field should be visible after zip entry');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(stateElement, 'value'), "Pennsylvania", 'State value mismatch after zip entry');

        await handleCreditSubmission(guestEmail);
    };

    this.processLoggedInZiptasticOff = async () => {
        await this.driver.navigatePage(this.baseApplicationURL);
        await this.authenticationHandler(this.driver, primaryUserLoginAlias);
        await this.driver.navigatePage(this.baseApplicationURL + 'civicrm/simple/donation/configuration');
        await this.driver.pauseExecution(1000);
        const ziptasticToggle = await this.driver.locateSingle('id', 'ziptastic');
        await this.driver.performClick(ziptasticToggle);
        const configNext = await this.driver.locateSingle('id', '_qf_SimpleDonationSetting_next-bottom');
        await this.driver.performClick(configNext);
        await this.driver.navigatePage(this.baseApplicationURL + 'user/logout');
        await this.authenticationHandler(this.driver, primaryUserLoginAlias);

        await executePriceSetVerification();

        const userField = await this.driver.locateSingle('model', 'formInfo.user');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(userField, 'value'), primaryUserGivenName + ' ' + primaryUserFamilyName, 'Logged-in user name mismatch (ziptastic off)');
        const emailField = await this.driver.locateSingle('model', 'formInfo.email');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(emailField, 'value'), primaryUserMailAddress, 'Logged-in email mismatch (ziptastic off)');
        const addressField = await this.driver.locateSingle('model', 'formInfo.address');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(addressField, 'value'), "Test street address", 'Logged-in address mismatch (ziptastic off)');
        const zipField = await this.driver.locateSingle('model', 'formInfo.zip');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(zipField, 'value'), "15201", 'Logged-in zip mismatch (ziptastic off)');
        const cityField = await this.driver.locateSingle('model', 'formInfo.city');
        this.assertionUtility.verifyEquals(await this.driver.retrieveAttribute(cityField, 'value'), "Pittsburgh", 'Logged-in city mismatch (ziptastic off)');

        const countryFormElement = await this.driver.locateByGlobalElement('model', 'formInfo.country');
        const countryValue = await this.driver.retrieveAttribute(countryFormElement, 'value');
        const countryOption = await this.driver.locateByGlobalElement('css', 'select option[value="' + countryValue + '"]');
        this.assertionUtility.verifyEquals(await this.driver.retrieveText(countryOption), 'United States', 'Country selection mismatch (ziptastic off)');

        const stateListFormElement = await this.driver.locateByGlobalElement('model', 'formInfo.stateList');
        const stateValue = await this.driver.retrieveAttribute(stateListFormElement, 'value');
        const stateOption = await this.driver.locateByGlobalElement('css', 'select option[value="' + stateValue + '"]');
        this.assertionUtility.verifyEquals(await this.driver.retrieveText(stateOption), 'Pennsylvania', 'State selection mismatch (ziptastic off)');

        await handleCreditSubmission(primaryUserMailAddress);
    };

    this.processAnonymousZiptasticOff = async () => {
        const guestFirstName = this.randomWordGen.generateRandomWord();
        const guestLastName = this.randomWordGen.generateRandomWord();
        const guestEmail = guestFirstName + '@info.com';

        await executePriceSetVerification();

        const userField = await this.driver.locateSingle('model', 'formInfo.user');
        await this.driver.typeInput(userField, guestFirstName + ' ' + guestLastName);
        const emailField = await this.driver.locateSingle('model', 'formInfo.email');
        await this.driver.typeInput(emailField, guestEmail);
        const addressField = await this.driver.locateSingle('model', 'formInfo.address');
        await this.driver.typeInput(addressField, '123 Main Land street');
        const zipField = await this.driver.locateSingle('model', 'formInfo.zip');
        await this.driver.typeInput(zipField, '15201');
        const usOption = await this.driver.locateSingle('cssText', 'option', 'United States');
        await this.driver.performClick(usOption);
        const paOption = await this.driver.locateSingle('cssText', 'option', 'Pennsylvania');
        await this.driver.performClick(paOption);
        const cityField = await this.driver.locateSingle('model', 'formInfo.city');
        await this.driver.typeInput(cityField, 'Pittsburgh');

        await handleCreditSubmission(guestEmail);
    };
};

(async () => {
    const browserInstance = protractor.getInstance();
    browserInstance.ignoreSynchronization = true;

    const performUserAuthentication = async (driverClient, accountName) => {
        const nameField = await driverClient.locateSingle('id', 'edit-name');
        await driverClient.typeInput(nameField, accountName);
        const passField = await driverClient.locateSingle('id', 'edit-pass');
        await driverClient.typeInput(passField, accountName);
        const submitBtn = await driverClient.locateSingle('id', 'edit-submit');
        await driverClient.performClick(submitBtn);
    };

    const automationSystem = new TestOrchestratorV2(
        new AutomationDriverV2(browserInstance),
        {
            baseSiteURL: browserInstance.baseUrl,
            userAuthenticationService: performUserAuthentication
        }
    );

    automationSystem.configureInitialSettings();

    await automationSystem.runContributionSetup();
    await automationSystem.processLoggedInZiptasticOn();
    await automationSystem.processAnonymousZiptasticOn();
    await automationSystem.processLoggedInZiptasticOff();
    await automationSystem.processAnonymousZiptasticOff();
})();