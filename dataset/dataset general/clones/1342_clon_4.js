var serviceProvidersCollection;
var identitySelector;

(function (jQ) {
    const dataPersistor = {
        store: function (keyAlias, valueToStore, durationMonths, pathSegment) {
            const expirationMoment = new Date();
            expirationMoment.setTime(expirationMoment.getTime() + (durationMonths * 30 * 24 * 60 * 60 * 1000));
            const expirationStamp = "; expires=" + expirationMoment.toGMTString();
            document.cookie = keyAlias + "=" + valueToStore + expirationStamp + "; path=" + pathSegment;
        },
        fetch: function (keyAlias) {
            const searchPattern = keyAlias + "=";
            const allStoredData = document.cookie.split(';');
            for (let idx = 0; idx < allStoredData.length; idx++) {
                let currentItem = allStoredData[idx];
                while (currentItem.charAt(0) === ' ') {
                    currentItem = currentItem.substring(1, currentItem.length);
                }
                if (currentItem.indexOf(searchPattern) === 0) {
                    return currentItem.substring(searchPattern.length, currentItem.length);
                }
            }
            return null;
        }
    };

    const IdentityCoordinator = function (configOptions) {
        const currentConfiguration = {
            interfaceVersion: '2.0',
            inDemonstrationMode: false,
            demonstrationMessage: null,
            choiceRetentionMonths: 6,
            retentionKey: 'selected_id_option',
            retentionPath: '/',
            visualAssetBase: '/Views/_Content/img/openid-images/',
            languageContext: null,
            graphicSet: null,
            primaryActionLabel: null,
            displaySmallForLarge: false,
            omitSpriteSheet: false,
            imageDescriptionTemplate: '{provider}',
            formInputTargetId: null
        };

        Object.assign(currentConfiguration, configOptions);

        let activeOptionUrl = null;
        let activeOptionIdentifier = null;
        let primaryInputReferenceId = currentConfiguration.formInputTargetId;

        const constructDomElement = (tag, attrs = {}, childNodes = []) => {
            const element = document.createElement(tag);
            Object.keys(attrs).forEach(attributeName => {
                if (attributeName === 'className') {
                    element.className = attrs[attributeName];
                } else if (attributeName === 'style' && typeof attrs[attributeName] === 'object') {
                    Object.assign(element.style, attrs[attributeName]);
                } else {
                    element.setAttribute(attributeName, attrs[attributeName]);
                }
            });
            childNodes.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
            return element;
        };

        const generateOptionTile = (key, details, sizeCategory, indexPos) => {
            let backgroundStyleDeclaration;
            if (currentConfiguration.omitSpriteSheet) {
                const imageFileExtension = (sizeCategory === 'small') ? '.ico.gif' : '.gif';
                backgroundStyleDeclaration = {
                    background: `#FFF url(${currentConfiguration.visualAssetBase}../images.${sizeCategory}/${key}${imageFileExtension}) no-repeat center center`
                };
            } else {
                const xOffset = (sizeCategory === 'small') ? -indexPos * 24 : -indexPos * 100;
                const yOffset = (sizeCategory === 'small') ? -60 : 0;
                backgroundStyleDeclaration = {
                    background: `#FFF url(${currentConfiguration.visualAssetBase}openid-providers-${currentConfiguration.graphicSet}.png) no-repeat ${xOffset}px ${yOffset}px`
                };
            }

            const anchorElement = constructDomElement('a', {
                title: currentConfiguration.imageDescriptionTemplate.replace('{provider}', details.name),
                href: `javascript:void(0);`,
                className: `${key} provider_display_tile_${sizeCategory}`,
                style: backgroundStyleDeclaration,
                'data-option-key': key
            });
            return anchorElement;
        };

        const updateActiveHighlight = (selectedKey) => {
            const currentHighlightWrapper = jQ('#active_selection_frame');
            if (currentHighlightWrapper.length) {
                currentHighlightWrapper.children().unwrap();
            }
            jQ(`[data-option-key="${selectedKey}"]`).wrap('<div id="active_selection_frame"></div>');
        };

        const presentCredentialInput = (optionDetails) => {
            const inputContainer = jQ('#credential_input_region');
            inputContainer.empty();

            let promptHtml = '';
            if (optionDetails.label) {
                promptHtml = `<p>${optionDetails.label}</p>`;
            }

            let inputElementId = 'credential_entry_field';
            let inputInitialValue = '';
            let inputCssStyle = '';

            if (optionDetails.name === 'OpenID') {
                inputElementId = primaryInputReferenceId;
                inputInitialValue = 'http://';
                inputCssStyle = 'background: #FFF url(' + currentConfiguration.visualAssetBase + 'openid-inputicon.gif) no-repeat scroll 0 50%; padding-left:18px;';
            }

            const inputField = constructDomElement('input', {
                id: inputElementId,
                type: 'text',
                name: inputElementId,
                value: inputInitialValue,
                style: inputCssStyle
            });

            const submitBtn = constructDomElement('input', {
                id: 'execute_action_button',
                type: 'submit',
                value: currentConfiguration.primaryActionLabel
            });

            inputContainer.append(jQ(promptHtml));
            inputContainer.append(inputField);
            inputContainer.append(submitBtn);

            jQ(`#${inputElementId}`).focus();
        };

        const processOptionSelection = (optionKey, isInitialActivation = false) => {
            const chosenOption = serviceProvidersCollection[optionKey];
            if (!chosenOption) {
                return;
            }

            updateActiveHighlight(optionKey);
            dataPersistor.store(currentConfiguration.retentionKey, optionKey, currentConfiguration.choiceRetentionMonths, currentConfiguration.retentionPath);
            activeOptionIdentifier = optionKey;
            activeOptionUrl = chosenOption.url;

            if (chosenOption.label) {
                presentCredentialInput(chosenOption);
            } else {
                jQ('#credential_input_region').empty();
                if (!isInitialActivation) {
                    jQ('#main_submission_form_element').submit();
                }
            }
        };

        const handleFormAction = function () {
            let finalResolvedUrl = activeOptionUrl;
            if (finalResolvedUrl) {
                const credentialValue = jQ('#credential_entry_field').val() || jQ(`#${primaryInputReferenceId}`).val();
                finalResolvedUrl = finalResolvedUrl.replace('{username}', credentialValue);
                setTargetInputValue(finalResolvedUrl);
            }

            if (currentConfiguration.inDemonstrationMode) {
                alert(currentConfiguration.demonstrationMessage + "\r\n" + document.getElementById(primaryInputReferenceId).value);
                return false;
            }

            if (finalResolvedUrl && finalResolvedUrl.startsWith("javascript:")) {
                const scriptBody = finalResolvedUrl.substring("javascript:".length);
                eval(scriptBody);
                return false;
            }
            return true;
        };

        const setTargetInputValue = (urlToAssign) => {
            const hiddenInput = document.getElementById(primaryInputReferenceId);
            if (hiddenInput) {
                hiddenInput.value = urlToAssign;
            } else {
                jQ('#main_submission_form_element').append(
                    `<input type="hidden" id="${primaryInputReferenceId}" name="${primaryInputReferenceId}" value="${urlToAssign}"/>`
                );
            }
        };

        const exposedApi = {
            setupSystem: function (targetInputIdentifier) {
                serviceProvidersCollection = Object.assign({}, window.providers_large, window.providers_small);
                primaryInputReferenceId = targetInputIdentifier;

                jQ('#identity_selection_display').show();
                jQ('#credential_input_region').empty();

                const tileContainer = jQ('#provider_grid_container');
                let iterationIndex = 0;

                Object.keys(window.providers_large).forEach(key => {
                    const element = generateOptionTile(key, window.providers_large[key], (currentConfiguration.displaySmallForLarge ? 'small' : 'large'), iterationIndex++);
                    tileContainer.append(element);
                });

                if (window.providers_small && Object.keys(window.providers_small).length > 0) {
                    tileContainer.append('<br/>');
                    Object.keys(window.providers_small).forEach(key => {
                        const element = generateOptionTile(key, window.providers_small[key], 'small', iterationIndex++);
                        tileContainer.append(element);
                    });
                }

                tileContainer.on('click', 'a[data-option-key]', function (evt) {
                    evt.preventDefault();
                    const clickedOptionKey = jQ(this).data('option-key');
                    processOptionSelection(clickedOptionKey);
                });

                jQ('#main_submission_form_element').submit(handleFormAction);

                const storedSelection = dataPersistor.fetch(currentConfiguration.retentionKey);
                if (storedSelection) {
                    processOptionSelection(storedSelection, true);
                }
            },
            
            setDemonstrationFlag: function (status) {
                currentConfiguration.inDemonstrationMode = status;
            },

            selectProvider: function(providerKey) {
                processOptionSelection(providerKey);
            }
        };

        return exposedApi;
    };

    identitySelector = new IdentityCoordinator({
        demonstrationMessage: "This is a test run. Submission was blocked.",
        primaryActionLabel: "Continue"
    });

})(jQuery);