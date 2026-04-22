const serviceCatalog = {
    large: {
        'alpha': {
            label: 'Google',
            link: 'https://www.google.com/accounts/o8/id'
        },
        'beta': {
            label: 'Yahoo',
            link: 'http://me.yahoo.com/'
        },
        'gamma': {
            label: 'AOL',
            inputPrompt: 'Enter your AOL screenname.',
            link: 'http://openid.aol.com/{account}'
        },
        'delta': {
            label: 'MyOpenID',
            inputPrompt: 'Enter your MyOpenID username.',
            link: 'http://{account}.myopenid.com/'
        },
        'epsilon': {
            label: 'OpenID',
            inputPrompt: 'Enter your OpenID.',
            link: null
        }
    },
    small: {
        'zeta': {
            label: 'LiveJournal',
            inputPrompt: 'Enter your Livejournal username.',
            link: 'http://{account}.livejournal.com/'
        },
        'eta': {
            label: 'Wordpress',
            inputPrompt: 'Enter your Wordpress.com username.',
            link: 'http://{account}.wordpress.com/'
        },
        'theta': {
            label: 'Blogger',
            inputPrompt: 'Your Blogger account',
            link: 'http://{account}.blogspot.com/'
        },
        'iota': {
            label: 'Verisign',
            inputPrompt: 'Your Verisign username',
            link: 'http://{account}.pip.verisignlabs.com/'
        },
        'kappa': {
            label: 'ClaimID',
            inputPrompt: 'Your ClaimID username',
            link: 'http://claimid.com/{account}'
        },
        'lambda': {
            label: 'ClickPass',
            inputPrompt: 'Enter your ClickPass username',
            link: 'http://clickpass.com/public/{account}'
        },
        'mu': {
            label: 'Google Profile',
            inputPrompt: 'Enter your Google Profile username',
            link: 'http://www.google.com/profiles/{account}'
        }
    }
};

let identitySelectorInstance;

class CookieTool {
    constructor(nameKey, pathValue, expiryMonths) {
        this.cookieKey = nameKey;
        this.cookiePath = pathValue;
        this.expirationDurationMillis = expiryMonths * 30 * 24 * 60 * 60 * 1000;
    }

    preserveValue(val) {
        const d = new Date();
        d.setTime(d.getTime() + this.expirationDurationMillis);
        const expiryStr = "; expires=" + d.toGMTString();
        document.cookie = this.cookieKey + "=" + val + expiryStr + "; path=" + this.cookiePath;
    }

    retrieveValue() {
        const searchKey = this.cookieKey + "=";
        const cookieArray = document.cookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            let c = cookieArray[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(searchKey) === 0)
                return c.substring(searchKey.length, c.length);
        }
        return null;
    }
}

class IdentitySelectionEngine {
    static globalConfig = {
        appVersion: '2.0',
        isDemoMode: false,
        demoMessage: 'Client demonstration mode active. Normally, OpenID would be submitted:',
        cookieName: 'id_provider_selection',
        cookiePath: '/',
        cookieExpiryMonths: 6,
        imageDirectory: '/img/',
        currentLocale: 'en',
        spriteSuffix: 'en',
        submitButtonLabel: 'Proceed',
        useSmallIconsGlobally: false,
        avoidSpriteUsage: false,
        iconTitleFormat: 'Log in using {service}',
        hiddenInputId: null,
        selectedProviderLink: null,
        selectedProviderIdentifier: null,
        allKnownProviders: {}
    };

    constructor(targetInputIdentifier) {
        this.config = IdentitySelectionEngine.globalConfig;
        this.config.hiddenInputId = targetInputIdentifier;
        this.cookieHandler = new CookieTool(this.config.cookieName, this.config.cookiePath, this.config.cookieExpiryMonths);
        
        Object.assign(this.config.allKnownProviders, serviceCatalog.large, serviceCatalog.small);

        this.config.currentLocale = 'en';
        this.config.spriteSuffix = 'en';
        this.config.demoMessage = 'Client demonstration mode active. Normally, OpenID would be submitted:';
        this.config.submitButtonLabel = 'Proceed';
        this.config.iconTitleFormat = 'Log in using {service}';
    }

    initiateInterface() {
        const buttonContainer = document.getElementById('identity_buttons_container');
        const inputArea = document.getElementById('identity_input_area');
        const choiceDisplay = document.getElementById('identity_choice_display');
        const submissionForm = document.getElementById('identity_submission_form');

        if (!buttonContainer || !inputArea || !choiceDisplay || !submissionForm) {
            console.error("Required DOM elements not found for IdentitySelectionEngine.");
            return;
        }

        choiceDisplay.style.display = 'block';
        inputArea.innerHTML = '';

        let buttonIndex = 0;

        Object.keys(serviceCatalog.large).forEach(key => {
            const providerInfo = serviceCatalog.large[key];
            const buttonElement = this.constructProviderButton(key, providerInfo, this.config.useSmallIconsGlobally ? 'small' : 'large', buttonIndex++);
            buttonContainer.appendChild(buttonElement);
        });

        if (Object.keys(serviceCatalog.small).length > 0) {
            buttonContainer.appendChild(document.createElement('br'));
            Object.keys(serviceCatalog.small).forEach(key => {
                const providerInfo = serviceCatalog.small[key];
                const buttonElement = this.constructProviderButton(key, providerInfo, 'small', buttonIndex++);
                buttonContainer.appendChild(buttonElement);
            });
        }

        submissionForm.addEventListener('submit', this.handleFormSubmission.bind(this));

        const storedProviderId = this.cookieHandler.retrieveValue();
        if (storedProviderId) {
            this.selectService(storedProviderId, true);
        }
    }

    constructProviderButton(idKey, details, displaySize, idx) {
        const anchorElement = document.createElement('a');
        anchorElement.setAttribute('title', this.config.iconTitleFormat.replace('{service}', details.label));
        anchorElement.setAttribute('href', '#');
        anchorElement.classList.add(idKey, `id_${displaySize}_button`);

        anchorElement.addEventListener('click', (event) => {
            event.preventDefault();
            this.selectService(idKey, false);
        });

        const styleDeclaration = anchorElement.style;
        styleDeclaration.background = '#FFF';
        styleDeclaration.backgroundRepeat = 'no-repeat';
        styleDeclaration.backgroundPosition = 'center center';

        if (this.config.avoidSpriteUsage) {
            const imageExtension = displaySize === 'small' ? '.ico.gif' : '.gif';
            styleDeclaration.backgroundImage = `url(${this.config.imageDirectory}images.${displaySize}/${idKey}${imageExtension})`;
        } else {
            const xOffset = displaySize === 'small' ? -idx * 24 : -idx * 100;
            const yOffset = displaySize === 'small' ? -60 : 0;
            styleDeclaration.backgroundImage = `url(${this.config.imageDirectory}openid-providers-${this.config.spriteSuffix}.png)`;
            styleDeclaration.backgroundPosition = `${xOffset}px ${yOffset}px`;
        }

        return anchorElement;
    }

    selectService(idKey, isPageLoad) {
        const providerData = this.config.allKnownProviders[idKey];
        if (!providerData) {
            return;
        }

        this.applyHighlight(idKey);
        this.cookieHandler.preserveValue(idKey);
        this.config.selectedProviderIdentifier = idKey;
        this.config.selectedProviderLink = providerData.link;

        if (providerData.inputPrompt) {
            this.presentInputField(providerData);
        } else {
            document.getElementById('identity_input_area').innerHTML = '';
            if (!isPageLoad) {
                document.getElementById('identity_submission_form').submit();
            }
        }
    }

    handleFormSubmission(event) {
        let finalUrl = this.config.selectedProviderLink;
        if (finalUrl) {
            const inputElement = document.getElementById('id_account_input');
            if (inputElement) {
                finalUrl = finalUrl.replace('{account}', inputElement.value);
            }
            this.updateHiddenTargetInput(finalUrl);
        }

        if (this.config.isDemoMode) {
            window.alert(`${this.config.demoMessage}\r\n${document.getElementById(this.config.hiddenInputId).value}`);
            event.preventDefault();
            return false;
        }

        if (finalUrl && finalUrl.startsWith("javascript:")) {
            const scriptContent = finalUrl.substring("javascript:".length);
            try {
                eval(scriptContent);
            } catch (e) {
                console.error("Error executing javascript: URL:", e);
            }
            event.preventDefault();
            return false;
        }
        return true;
    }

    updateHiddenTargetInput(urlValue) {
        let targetInput = document.getElementById(this.config.hiddenInputId);
        if (targetInput) {
            targetInput.value = urlValue;
        } else {
            targetInput = document.createElement('input');
            targetInput.setAttribute('type', 'hidden');
            targetInput.setAttribute('id', this.config.hiddenInputId);
            targetInput.setAttribute('name', this.config.hiddenInputId);
            targetInput.setAttribute('value', urlValue);
            document.getElementById('identity_submission_form').appendChild(targetInput);
        }
    }

    applyHighlight(idKey) {
        const existingHighlightWrapper = document.getElementById('id_highlight_wrapper');
        if (existingHighlightWrapper) {
            const originalButton = existingHighlightWrapper.querySelector('a');
            if (originalButton) {
                existingHighlightWrapper.parentNode.replaceChild(originalButton, existingHighlightWrapper);
            }
        }

        const targetButton = document.querySelector(`.${idKey}`);
        if (targetButton && targetButton.parentNode) {
            const newHighlightWrapper = document.createElement('div');
            newHighlightWrapper.setAttribute('id', 'id_highlight_wrapper');
            targetButton.parentNode.insertBefore(newHighlightWrapper, targetButton);
            newHighlightWrapper.appendChild(targetButton);
        }
    }

    presentInputField(providerDetails) {
        const inputArea = document.getElementById('identity_input_area');
        inputArea.innerHTML = '';

        const paragraph = document.createElement('p');
        if (providerDetails.inputPrompt) {
            paragraph.textContent = providerDetails.inputPrompt;
            inputArea.appendChild(paragraph);
        }

        const inputField = document.createElement('input');
        inputField.setAttribute('type', 'text');
        inputField.setAttribute('id', 'id_account_input');
        inputField.setAttribute('name', 'id_account_input');

        let initialValue = '';
        let inputStyle = '';

        if (providerDetails.label === 'OpenID') {
            inputField.setAttribute('id', this.config.hiddenInputId);
            inputField.setAttribute('name', this.config.hiddenInputId);
            initialValue = 'http://';
            inputStyle = `background: #FFF url(${this.config.imageDirectory}openid-inputicon.gif) no-repeat scroll 0 50%; padding-left:18px;`;
        }
        
        inputField.value = initialValue;
        inputField.style.cssText = inputStyle;

        const submitButton = document.createElement('input');
        submitButton.setAttribute('type', 'submit');
        submitButton.setAttribute('id', 'id_submit_action');
        submitButton.setAttribute('value', this.config.submitButtonLabel);

        inputArea.appendChild(inputField);
        inputArea.appendChild(submitButton);

        inputField.focus();
    }

    setDemoFlag(enabled) {
        this.config.isDemoMode = enabled;
    }
}

function activateIdentitySelector(inputTargetId) {
    identitySelectorInstance = new IdentitySelectionEngine(inputTargetId);
    identitySelectorInstance.initiateInterface();
}

function configureIdentitySelectorDemoMode(enabled) {
    if (identitySelectorInstance) {
        identitySelectorInstance.setDemoFlag(enabled);
    } else {
        IdentitySelectionEngine.globalConfig.isDemoMode = enabled;
    }
}