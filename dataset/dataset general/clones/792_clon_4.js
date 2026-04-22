const authorizationSystem = {
    applicationTitle: null,
    overlayVisual: null,
    authorizationModal: null,
    clientIdentifier: null,
    securityDomain: null,
    activeAccessGrants: null,
    tokenGrantName: 'access_token',
};

function constructDomElement(tag, attributes = {}, children = []) {
    const el = document.createElement(tag);
    for (const key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, key)) {
            if (key === 'className') {
                el.className = attributes[key];
            } else if (key === 'textContent') {
                el.textContent = attributes[key];
            } else if (key === 'innerHTML') {
                el.innerHTML = attributes[key];
            } else {
                el.setAttribute(key, attributes[key]);
            }
        }
    }
    children.forEach(child => {
        if (child instanceof Node) {
            el.appendChild(child);
        } else if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        }
    });
    return el;
}

function alignElementCentral(elementToPosition) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollYOffset = window.scrollY || document.documentElement.scrollTop;

    const elementRect = elementToPosition.getBoundingClientRect();
    const elementWidth = elementRect.width;
    const elementHeight = elementRect.height;

    let calculatedTop = (viewportHeight - elementHeight) / 2 + scrollYOffset;
    let calculatedLeft = (viewportWidth - elementWidth) / 2;

    elementToPosition.style.top = `${Math.max(0, calculatedTop)}px`;
    elementToPosition.style.left = `${Math.max(0, calculatedLeft)}px`;
}

function initiateAccessGrant() {
    let collectedPermissions = [];

    const availableAuthDefinitions = window.swaggerUi.api.authSchemes || window.swaggerUi.api.securityDefinitions;
    if (availableAuthDefinitions) {
        collectedPermissions = Object.values(availableAuthDefinitions).flatMap(scheme => {
            if (scheme.type === 'oauth2' && scheme.scopes) {
                if (Array.isArray(scheme.scopes)) {
                    return scheme.scopes.map(perm => ({ permissionName: perm, descriptionText: '' }));
                } else {
                    return Object.entries(scheme.scopes).map(([permName, permDesc]) => ({
                        permissionName: permName,
                        descriptionText: permDesc
                    }));
                }
            }
            return [];
        });
    }

    const distinctPermissions = Array.from(
        collectedPermissions.reduce((acc, current) => acc.set(current.permissionName, current), new Map()).values()
    );

    authorizationSystem.applicationTitle = window.swaggerUi.api?.info?.title || 'Unknown API Application';

    const accessModalContainer = constructDomElement('div', { className: 'api-popup-dialog' }, [
        constructDomElement('div', { className: 'api-popup-title', textContent: 'Select OAuth2.0 Permissions' }),
        constructDomElement('div', { className: 'api-popup-content' }, [
            constructDomElement('p', { innerHTML: 'Permissions define the access level an application has to data on behalf of the user. Each API might specify several permissions. <a href="#">Discover more</a>' }),
            constructDomElement('p', { innerHTML: `<strong>${authorizationSystem.applicationTitle}</strong> API requires the following permissions. Select those you wish to grant to Swagger UI.` }),
            constructDomElement('ul', { className: 'api-popup-scopes' }),
            constructDomElement('p', { className: 'error-msg' }),
            constructDomElement('div', { className: 'api-popup-actions' }, [
                constructDomElement('button', { className: 'api-popup-authbtn api-button green', type: 'button', textContent: 'Confirm Access' }),
                constructDomElement('button', { className: 'api-popup-cancel api-button gray', type: 'button', textContent: 'Abort' })
            ])
        ])
    ]);
    document.body.appendChild(accessModalContainer);
    authorizationSystem.authorizationModal = accessModalContainer;

    const permissionDisplayList = authorizationSystem.authorizationModal.querySelector('ul.api-popup-scopes');
    permissionDisplayList.innerHTML = '';

    distinctPermissions.forEach((permission, idx) => {
        const checkboxId = `perm_opt_${idx}`;
        const listItemElements = [
            constructDomElement('input', { type: 'checkbox', id: checkboxId, 'data-permission-value': permission.permissionName }),
            constructDomElement('label', { htmlFor: checkboxId }, [
                permission.permissionName,
                permission.descriptionText ? constructDomElement('span', { className: 'api-scope-desc', textContent: permission.descriptionText }) : null
            ].filter(Boolean))
        ];
        permissionDisplayList.appendChild(constructDomElement('li', {}, listItemElements));
    });

    alignElementCentral(authorizationSystem.authorizationModal);

    authorizationSystem.authorizationModal.querySelector('button.api-popup-cancel').addEventListener('click', () => {
        authorizationSystem.overlayVisual.style.display = 'none';
        authorizationSystem.authorizationModal.style.display = 'none';
        authorizationSystem.authorizationModal.remove();
        authorizationSystem.authorizationModal = null;
    });

    authorizationSystem.authorizationModal.querySelector('button.api-popup-authbtn').addEventListener('click', () => {
        authorizationSystem.overlayVisual.style.display = 'none';
        authorizationSystem.authorizationModal.style.display = 'none';

        const currentWindowLocation = window.location;
        const currentPathBase = currentWindowLocation.pathname.substring(0, currentWindowLocation.pathname.lastIndexOf("/"));
        const redirectTargetUrl = `${currentWindowLocation.protocol}//${currentWindowLocation.host}${currentPathBase}/o2c.html`;

        let authorizationEndpoint = null;
        let tokenKeyIdentifier = 'access_token';

        const foundAuthScheme = Object.values(window.swaggerUi.api.authSchemes || {}).find(scheme => {
            if (scheme.type === 'oauth2') {
                if (scheme.flow === 'implicit') {
                    authorizationEndpoint = scheme.authorizationUrl;
                    tokenKeyIdentifier = scheme.tokenUrl || tokenKeyIdentifier;
                    return true;
                }
                if (scheme.grantTypes?.implicit) {
                    const grantSpecifics = scheme.grantTypes.implicit;
                    authorizationEndpoint = grantSpecifics.loginEndpoint.url;
                    tokenKeyIdentifier = grantSpecifics.tokenName || tokenKeyIdentifier;
                    return true;
                }
            }
            return false;
        });
        authorizationSystem.tokenGrantName = tokenKeyIdentifier;

        if (!authorizationEndpoint) {
            console.error("Authorization system error: No suitable OAuth2 authorization endpoint found.");
            return;
        }

        const chosenPermissionValues = Array.from(
            authorizationSystem.authorizationModal.querySelectorAll('.api-popup-scopes input:checked')
        ).map(inputElement => inputElement.getAttribute('data-permission-value'));

        authorizationSystem.activeAccessGrants = chosenPermissionValues;

        const finalAuthUrl = new URL(authorizationEndpoint);
        finalAuthUrl.searchParams.append('response_type', 'token');
        finalAuthUrl.searchParams.append('redirect_uri', redirectTargetUrl);
        finalAuthUrl.searchParams.append('realm', authorizationSystem.securityDomain);
        finalAuthUrl.searchParams.append('client_id', authorizationSystem.clientIdentifier);
        finalAuthUrl.searchParams.append('scope', chosenPermissionValues.join(' '));

        window.open(finalAuthUrl.toString(), '_blank');
        authorizationSystem.authorizationModal.remove();
        authorizationSystem.authorizationModal = null;
    });

    authorizationSystem.overlayVisual.style.display = 'block';
    authorizationSystem.authorizationModal.style.display = 'block';
}

function revokeAccess() {
    Object.keys(window.authorizations.authz).forEach(key => window.authorizations.remove(key));
    authorizationSystem.activeAccessGrants = null;

    document.querySelectorAll('.api-ic.ic-on').forEach(iconElement => {
        iconElement.classList.add('ic-off');
        iconElement.classList.remove('ic-on');
    });

    document.querySelectorAll('.api-ic.ic-warning').forEach(iconElement => {
        iconElement.classList.add('ic-error');
        iconElement.classList.remove('ic-warning');
    });
}

function initializeSecurityProvider(configurationOptions) {
    const config = configurationOptions || {};
    const initializationErrors = [];

    authorizationSystem.applicationTitle = config.applicationTitle || initializationErrors.push('missing applicationTitle');
    authorizationSystem.overlayVisual = config.overlayVisual || document.getElementById('api-common-mask');
    authorizationSystem.clientIdentifier = config.clientIdentifier || initializationErrors.push('missing clientIdentifier');
    authorizationSystem.securityDomain = config.securityDomain || initializationErrors.push('missing securityDomain');

    if (initializationErrors.length > 0) {
        console.error('Security provider initialization failed: ' + initializationErrors.join(', '));
        return;
    }

    Array.from(document.querySelectorAll('pre code')).forEach(codeBlock => {
        hljs.highlightBlock(codeBlock);
    });

    Array.from(document.querySelectorAll('.api-ic')).forEach(interactiveControl => {
        interactiveControl.addEventListener('click', (event) => {
            if (event.currentTarget.classList.contains('ic-off')) {
                initiateAccessGrant();
            } else {
                revokeAccess();
            }
        });
    });
}

function processGrantOutcome(authorizationResult) {
    if (authorizationResult?.error) {
        document.querySelectorAll('input[type="checkbox"],.secured').forEach(checkbox => {
            checkbox.checked = false;
        });
        alert(authorizationResult.error);
    } else if (authorizationResult) {
        const receivedTokenValue = authorizationResult[authorizationSystem.tokenGrantName];
        if (receivedTokenValue) {
            Array.from(document.querySelectorAll('.auth #api_information_panel')).forEach(infoPanelDisplay => {
                const requiredScopeList = Array.from(infoPanelDisplay.children)
                    .map(child => child.textContent.trim())
                    .filter(text => text.length > 0);

                const immediateParentOfPanel = infoPanelDisplay.parentNode;
                const grandparentNodeOfPanel = immediateParentOfPanel.parentNode;

                const missingRequiredScopes = requiredScopeList.filter(reqScope =>
                    !(authorizationSystem.activeAccessGrants && authorizationSystem.activeAccessGrants.includes(reqScope))
                );

                if (missingRequiredScopes.length > 0) {
                    grandparentNodeOfPanel.querySelectorAll('.api-ic.ic-on').forEach(icon => {
                        icon.classList.add('ic-off');
                        icon.classList.remove('ic-on');
                    });
                    immediateParentOfPanel.querySelectorAll('.api-ic').forEach(icon => {
                        icon.classList.add('ic-warning');
                        icon.classList.remove('ic-error', 'ic-info');
                    });
                } else {
                    grandparentNodeOfPanel.querySelectorAll('.api-ic.ic-off').forEach(icon => {
                        icon.classList.add('ic-on');
                        icon.classList.remove('ic-off');
                    });
                    immediateParentOfPanel.querySelectorAll('.api-ic').forEach(icon => {
                        icon.classList.add('ic-info');
                        icon.classList.remove('ic-warning', 'ic-error');
                    });
                }
            });

            window.authorizations.add('oauth2', new ApiKeyAuthorization('Authorization', 'Bearer ' + receivedTokenValue, 'header'));
        }
    }
}