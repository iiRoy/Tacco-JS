"use strict";

const GlobalApplicationHandler = (() => {

    const isInputVoid = (value) => value === null || value === undefined || value === "";

    const createFeedbackReporter = (displayAreaId, errorFieldClass = 'compromised', errorContainerVisibleClass = 'visible-alert', errorContainerHiddenClass = 'hidden-alert', defaultFieldClass = 'standard-field') => {
        let fieldSpecificIssues = new Map();
        let mainDisplayElement = document.getElementById(displayAreaId);
        let totalIssueCount = 0;

        const setFieldDisplayState = (element, hasErrorState) => {
            if (element) {
                if (hasErrorState) {
                    element.classList.remove(defaultFieldClass);
                    element.classList.add(errorFieldClass);
                } else {
                    element.classList.remove(errorFieldClass);
                    element.classList.add(defaultFieldClass);
                }
            }
        };

        const recordIssue = (element, message) => {
            if (!fieldSpecificIssues.has(element)) {
                fieldSpecificIssues.set(element, []);
            }
            fieldSpecificIssues.get(element).push(message);
            setFieldDisplayState(element, true);
            totalIssueCount++;
        };

        const clearAllFeedback = () => {
            fieldSpecificIssues.clear();
            totalIssueCount = 0;
            if (mainDisplayElement) {
                mainDisplayElement.innerHTML = '';
                mainDisplayElement.classList.remove(errorContainerVisibleClass);
                mainDisplayElement.classList.add(errorContainerHiddenClass);
            }
        };

        const renderAggregatedFeedback = () => {
            if (!mainDisplayElement) return;

            if (totalIssueCount > 0) {
                mainDisplayElement.classList.remove(errorContainerHiddenClass);
                mainDisplayElement.classList.add(errorContainerVisibleClass);
                let compiledMessages = '<section class="issue-collection">';
                for (const [element, messages] of fieldSpecificIssues) {
                    messages.forEach(msg => {
                        compiledMessages += `<p class="issue-entry">${msg}</p>`;
                    });
                }
                compiledMessages += '</section>';
                mainDisplayElement.innerHTML = compiledMessages;
            } else {
                mainDisplayElement.innerHTML = '';
                mainDisplayElement.classList.remove(errorContainerVisibleClass);
                mainDisplayElement.classList.add(errorContainerHiddenClass);
            }
        };

        return { recordIssue, clearAllFeedback, renderAggregatedFeedback, hasAnyFaults: () => totalIssueCount > 0 };
    };

    const verifyCredentialsAlignment = (inputForm) => {
        const mainCredentialInput = inputForm.elements['password'];
        const confirmationCredentialInput = document.getElementById('confpassword');

        if (!mainCredentialInput || !confirmationCredentialInput) return true;
        return mainCredentialInput.value === confirmationCredentialInput.value;
    };

    const evaluateFormConfiguration = (inputForm) => {
        const feedbackReporter = createFeedbackReporter("error_response");

        const domElementMap = {
            wirelessNetworkID: inputForm.elements['wifi.ssid'],
            wirelessSecurityType: inputForm.elements['wifi.encryption'],
            wirelessPassphrase: inputForm.elements['wifi.password'],
            deviceSystemName: inputForm.elements['hostname'],
            administratorPassword: inputForm.elements['password'],
            passwordConfirmation: document.getElementById('confpassword')
        };

        feedbackReporter.clearAllFeedback();

        Object.values(domElementMap).forEach(elem => {
            if (elem) {
                elem.classList.remove('compromised');
                elem.classList.add('standard-field');
            }
        });

        const validationCriterion = [
            {
                key: 'wirelessNetworkID',
                condition: (el, map) => !el.disabled && isInputVoid(el.value),
                message: "A wireless network identifier is required."
            },
            {
                key: 'wirelessPassphrase',
                condition: (el, map) => !el.disabled && map.wirelessSecurityType.value !== "none" && isInputVoid(el.value),
                message: "A wireless network security key is required."
            },
            {
                key: 'wirelessPassphrase',
                condition: (el, map) => !el.disabled && map.wirelessSecurityType.value !== "none" && map.wirelessSecurityType.value !== "wep" && el.value.length < 8,
                message: "Wireless security key must be at least 8 characters long (except WEP)."
            },
            {
                key: 'deviceSystemName',
                condition: (el, map) => isInputVoid(el.value),
                message: "The device's system name cannot be empty."
            },
            {
                key: 'deviceSystemName',
                condition: (el, map) => el.value.match(/[^a-zA-Z0-9]/),
                message: "Device system name can only contain alphanumeric characters."
            },
            {
                key: 'administratorPassword',
                condition: (el, map) => !isInputVoid(el.value) && el.value.length < 8,
                message: "Administrator password must be at least 8 characters long."
            },
            {
                key: 'administratorPassword',
                condition: (el, map) => !verifyCredentialsAlignment(inputForm),
                message: "Administrator passwords do not match."
            }
        ];

        validationCriterion.forEach(rule => {
            const targetElement = domElementMap[rule.key];
            if (targetElement && rule.condition(targetElement, domElementMap)) {
                feedbackReporter.recordIssue(targetElement, rule.message);
            }
        });

        feedbackReporter.renderAggregatedFeedback();

        return !feedbackReporter.hasAnyFaults();
    };

    const resetInterfaceElements = () => {
        setTimeout(() => {
            setWirelessConfigurationState(!document.getElementById("wificheck").checked);
            processSecuritySettingChange(document.getElementById("wifi_encryption"));
        }, 100);
    };

    const redirectToLocation = (targetHref) => {
        document.location.href = targetHref;
        return false;
    };

    const processSecuritySettingChange = (selectionInput) => {
        const passwordFieldContainer = document.getElementById("wifi_password_container");
        const passwordFieldInput = document.getElementById("wifi_password");
        if (selectionInput.value === "none") {
            passwordFieldContainer.classList.add("hidden");
        } else {
            passwordFieldContainer.classList.remove("hidden");
            if (passwordFieldInput) {
                passwordFieldInput.value = "";
                passwordFieldInput.focus();
            }
        }
    };

    const setWirelessConfigurationState = (shouldDeactivate) => {
        const wirelessSectionBlock = document.getElementById("wifi_container");
        if (wirelessSectionBlock) {
            if (shouldDeactivate) {
                wirelessSectionBlock.classList.add("disabled");
            } else {
                wirelessSectionBlock.classList.remove("disabled");
            }
        }
        document.getElementById("wifi_password").disabled = shouldDeactivate;
        document.getElementById("wifi_ssid").disabled = shouldDeactivate;
        document.getElementById("wifi_encryption").disabled = shouldDeactivate;
        document.getElementById("detected_wifis").disabled = shouldDeactivate;
    };

    const displayPasswordConsistencyStatus = () => {
        const consistencyDisplay = document.getElementById("pass_mismatch");
        if (consistencyDisplay) {
            if (verifyCredentialsAlignment(document.forms[0])) {
                consistencyDisplay.classList.add("hidden-alert");
                consistencyDisplay.classList.remove("visible-alert");
            } else {
                consistencyDisplay.classList.remove("hidden-alert");
                consistencyDisplay.classList.add("visible-alert");
            }
        }
    };

    let cryptoAgent, keyIdentifier, publicEncryptionKey;
    if (typeof(getPublicKey) === "function") {
        const keyProcessor = new getPublicKey(pub_key);
        keyIdentifier = keyProcessor.keyid;
        publicEncryptionKey = keyProcessor.pkey.replace(/\n/g, "");
    }

    const dispatchEncryptedForm = (destinationUrl, sourceForm, formTargetId, ...dataFieldNames) => {
        let submissionData = {};
        for (let i = 0; i < dataFieldNames.length; i++) {
            const fieldName = dataFieldNames[i];
            const fieldElement = sourceForm.elements[fieldName];
            if (fieldElement && !fieldElement.disabled) {
                submissionData[fieldName] = fieldElement.value;
            }
        }
        const encryptedContent = doEncrypt(keyIdentifier, 0, publicEncryptionKey, JSON.stringify(submissionData));
        const targetForm = document.getElementById(formTargetId);
        if (targetForm && targetForm.pgp_message) {
            targetForm.pgp_message.value = encryptedContent;
            targetForm.submit();
        }
        return false;
    };

    const beginFileUploadProcess = () => {
        const progressIndicator = document.getElementById("progress_bar_upload");
        const uploadActionButton = document.getElementById("upload_button");

        if (progressIndicator) progressIndicator.style.display = '';
        if (uploadActionButton) {
            uploadActionButton.classList.add("action-button");
            uploadActionButton.disabled = true;
        }
    };

    const initializeUserInterface = () => {
        const uploadProgressMonitor = document.getElementById("progress_bar_upload");
        if (uploadProgressMonitor) {
            const uploadButtonElement = document.getElementById("upload_button");
            if (uploadButtonElement) {
                uploadButtonElement.addEventListener("click", beginFileUploadProcess);
            }
        }

        const usernameField = document.getElementById("username");
        if (usernameField) {
            const passwordField = document.getElementById("password");
            if (passwordField) {
                passwordField.focus();
            }
        }

        const wirelessToggleCheckbox = document.getElementById("wificheck");
        if (wirelessToggleCheckbox) {
            wirelessToggleCheckbox.addEventListener("click", (evt) => {
                setWirelessConfigurationState(!evt.target.checked);
            });
        }

        const wirelessEncryptionSelector = document.getElementById("wifi_encryption");
        if (wirelessEncryptionSelector) {
            wirelessEncryptionSelector.addEventListener("change", (evt) => {
                processSecuritySettingChange(evt.target);
            });
        }

        const confirmPasswordField = document.getElementById("confpassword");
        const primaryPasswordField = document.getElementById("password");
        if (confirmPasswordField && primaryPasswordField) {
            confirmPasswordField.addEventListener("keyup", displayPasswordConsistencyStatus);
            primaryPasswordField.addEventListener("keyup", displayPasswordConsistencyStatus);
        }

        const systemDiagnosticMessages = document.getElementById("dmesg");
        if (systemDiagnosticMessages) {
            systemDiagnosticMessages.style.display = 'none';
            const diagnosticToggleControl = document.getElementById("dmesg_toogle");
            if (diagnosticToggleControl) {
                diagnosticToggleControl.addEventListener("click", (evt) => {
                    evt.preventDefault();
                    if (diagnosticToggleControl.textContent === "Show") {
                        systemDiagnosticMessages.style.display = '';
                        diagnosticToggleControl.textContent = "Hide";
                    } else {
                        systemDiagnosticMessages.style.display = 'none';
                        diagnosticToggleControl.textContent = "Show";
                    }
                });
            }
        }

        const discoveredWirelessNetworksDropdown = document.getElementById("detected_wifis");
        if (discoveredWirelessNetworksDropdown) {
            const retrieveWirelessNetworks = async () => {
                if (discoveredWirelessNetworksDropdown.disabled) {
                    return false;
                }
                discoveredWirelessNetworksDropdown.innerHTML = "<option>Scanning for networks...</option>";
                
                try {
                    const response = await fetch(refresh_wifi_url);
                    const networkData = await response.json();
                    
                    discoveredWirelessNetworksDropdown.innerHTML = "<option>Choose a wireless network...</option>";
                    networkData.forEach(network => {
                        const optionElement = document.createElement("option");
                        optionElement.value = `${network.name}|||${network.encryption}`;
                        let optionText = `${network.name} (`;
                        if (network.encryption !== "none") {
                            optionText += `${network.pretty_encryption}, `;
                        }
                        optionText += `signal ${network.signal_strength}%)`;
                        optionElement.textContent = optionText;
                        discoveredWirelessNetworksDropdown.appendChild(optionElement);
                    });
                } catch (error) {
                    console.error("Failed to retrieve wireless networks:", error);
                    discoveredWirelessNetworksDropdown.innerHTML = "<option>Error during network scan.</option>";
                }
                return false;
            };

            const refreshNetworkTrigger = document.getElementById("refresh_detected_wifis");
            if (refreshNetworkTrigger) {
                refreshNetworkTrigger.addEventListener("click", retrieveWirelessNetworks);
            }

            discoveredWirelessNetworksDropdown.addEventListener("change", () => {
                const parts = discoveredWirelessNetworksDropdown.value.split("|||");
                if (parts.length !== 2) {
                    return;
                }
                const ssidInput = document.getElementById("wifi_ssid");
                const encryptionSelector = document.getElementById("wifi_encryption");

                if (ssidInput) ssidInput.value = parts[0];
                if (encryptionSelector) {
                    encryptionSelector.value = parts[1];
                    const changeEvent = new Event('change');
                    encryptionSelector.dispatchEvent(changeEvent);
                }
            });
            retrieveWirelessNetworks();
        }

        const restApiToggleSwitch = document.getElementById("restopen");
        const restApiPasswordSwitch = document.getElementById("restpass");

        const adjustRestfulApiState = async (event) => {
            event.preventDefault();
            const controlElement = event.target;
            const dataPayload = {};
            dataPayload[controlElement.name] = controlElement.value;
            
            try {
                await fetch(controlElement.form.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataPayload)
                });
            } catch (error) {
                console.error("Failed to modify RESTful API state:", error);
            }
        };

        if (restApiToggleSwitch) {
            restApiToggleSwitch.addEventListener("click", adjustRestfulApiState);
        }
        if (restApiPasswordSwitch) {
            restApiPasswordSwitch.addEventListener("click", adjustRestfulApiState);
        }
    };

    document.addEventListener("DOMContentLoaded", initializeUserInterface);

    return {
        checkFormValidity: evaluateFormConfiguration,
        resetFormDisplay: resetInterfaceElements,
        navigateTo: redirectToLocation,
        sendSecureForm: dispatchEncryptedForm
    };
})();