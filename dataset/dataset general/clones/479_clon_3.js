"use strict";

/*
 * This JavaScript module handles client-side form validation, dynamic UI updates,
 * and secure data submission for a web-based device configuration interface.
 * It encapsulates various interaction patterns to enhance user experience and data integrity.
 *
 * Copyright 2024 Innovate Solutions Inc.
 * All rights reserved.
 */

// --- Core Utility Functions ---

/**
 * Determines if a given string value is null, undefined, or consists solely of whitespace.
 * @param {string|null|undefined} inputString - The string to evaluate.
 * @returns {boolean} True if the string is considered empty, false otherwise.
 */
const isEffectivelyEmpty = (inputString) => {
  return inputString === null || inputString === undefined || (typeof inputString === 'string' && inputString.trim() === '');
};

/**
 * Displays a validation error message, highlighting the associated input field.
 * @param {HTMLElement} targetInputElement - The form control that failed validation.
 * @param {HTMLElement} feedbackDisplayArea - The container where error messages are aggregated.
 * @param {string} errorMessage - The specific error message to be shown.
 */
const renderValidationFeedback = (targetInputElement, feedbackDisplayArea, errorMessage) => {
  if (targetInputElement) {
    targetInputElement.classList.add('field-invalid');
    targetInputElement.classList.remove('field-valid');
  }
  if (feedbackDisplayArea) {
    feedbackDisplayArea.classList.remove('feedback-hidden');
    feedbackDisplayArea.classList.add('feedback-visible');
    feedbackDisplayArea.innerHTML += `<li>${errorMessage}</li>`; // Append as list item
  }
};

/**
 * Navigates the browser to a specified Uniform Resource Locator.
 * @param {string} destinationUrl - The URL to redirect to.
 * @returns {boolean} Returns false to typically prevent default event propagation.
 */
const navigateToLocation = (destinationUrl) => {
  window.location.href = destinationUrl;
  return false;
};

// --- Form Validation Logic ---

/**
 * Performs comprehensive validation on the device's configuration form.
 * @param {HTMLFormElement} configurationForm - The HTML form element being validated.
 * @returns {boolean} True if all validation checks pass, false if any errors are found.
 */
function validateDeviceConfiguration(configurationForm) {
  if (!configurationForm) {
    console.error("Validation initiated without a valid form element.");
    return false;
  }

  // Obtain references to key form input elements
  const wirelessIdentifierField = configurationForm.elements["network.ssid"];
  const wirelessSecurityModeField = configurationForm.elements["network.encryption"];
  const wirelessPassphraseField = configurationForm.elements["network.passkey"];
  const deviceNameField = configurationForm.elements["device.hostname"];
  const mainPasswordField = configurationForm.elements["admin.password"];

  let validationFailureDetected = false;
  const feedbackContainerElement = document.getElementById("validation_messages_area");

  if (!feedbackContainerElement) {
    console.error("Required validation feedback container not found (ID: validation_messages_area).");
    return false;
  }

  // Reset previous feedback states
  feedbackContainerElement.innerHTML = '';
  feedbackContainerElement.classList.add('feedback-hidden');
  feedbackContainerElement.classList.remove('feedback-visible');

  // Apply default styling to all relevant inputs
  [wirelessIdentifierField, wirelessSecurityModeField, wirelessPassphraseField, deviceNameField, mainPasswordField].forEach(input => {
    if (input) {
      input.classList.remove('field-invalid');
      input.classList.add('field-valid');
    }
  });

  // Local helper for adding an error
  const recordError = (element, message) => {
    renderValidationFeedback(element, feedbackContainerElement, message);
    validationFailureDetected = true;
  };

  // Validate Wireless Network ID
  if (wirelessIdentifierField && !wirelessIdentifierField.disabled && isEffectivelyEmpty(wirelessIdentifierField.value)) {
    recordError(wirelessIdentifierField, "A wireless network name (SSID) is required.");
  }

  // Validate Wireless Passphrase
  if (wirelessPassphraseField && !wirelessPassphraseField.disabled && wirelessSecurityModeField && wirelessSecurityModeField.value !== "none") {
    const currentPasskey = wirelessPassphraseField.value;
    if (isEffectivelyEmpty(currentPasskey)) {
      recordError(wirelessPassphraseField, "A passkey is mandatory for the selected security protocol.");
    } else if (wirelessSecurityModeField.value !== "wep" && currentPasskey.length < 8) {
      recordError(wirelessPassphraseField, "The wireless passkey must be at least 8 characters long (excluding WEP).");
    }
  }

  // Validate Device Hostname
  if (deviceNameField) {
    const currentDeviceName = deviceNameField.value.trim();
    if (isEffectivelyEmpty(currentDeviceName)) {
      recordError(deviceNameField, "The device hostname cannot be empty.");
    } else if (!/^[a-zA-Z0-9\-_]+$/.test(currentDeviceName)) { // Allow alphanumeric, hyphen, underscore
      recordError(deviceNameField, "Hostname can only contain letters, numbers, hyphens, and underscores.");
    }
  }

  // Validate Admin Password
  if (mainPasswordField) {
    const currentAdminPassword = mainPasswordField.value;
    if (!isEffectivelyEmpty(currentAdminPassword) && currentAdminPassword.length < 8) {
      recordError(mainPasswordField, "The administrator password must be a minimum of 8 characters.");
    } else if (!checkAdminPasswordsMatch()) {
      recordError(mainPasswordField, "The new passwords entered do not match each other.");
    }
  }

  // If errors exist, enclose them in an unordered list for semantic correctness
  if (validationFailureDetected && feedbackContainerElement.innerHTML !== '') {
    feedbackContainerElement.innerHTML = `<ul>${feedbackContainerElement.innerHTML}</ul>`;
  }

  return !validationFailureDetected;
}

/**
 * Resets specific form sections to their default states and triggers UI updates.
 */
function restoreFormDefaults() {
  setTimeout(() => {
    const enableWifiToggle = document.getElementById("toggle_wifi_enabled");
    if (enableWifiToggle) {
      updateWirelessConfigurationState(!enableWifiToggle.checked);
    }
    const securityDropdown = document.getElementById("wireless_security_dropdown");
    if (securityDropdown) {
      handleWirelessSecurityChange(securityDropdown);
    }
  }, 100);
}

/**
 * Verifies if the primary administrator password matches its confirmation field.
 * @returns {boolean} True if the passwords are identical, false otherwise.
 */
function checkAdminPasswordsMatch() {
  const primaryPassword = document.getElementById("admin_password_field");
  const confirmationPassword = document.getElementById("confirm_admin_password_field");

  // If one or both fields are missing, assume match to prevent validation errors on incomplete forms
  if (!primaryPassword || !confirmationPassword) {
    return true;
  }

  return primaryPassword.value === confirmationPassword.value;
}

/**
 * Updates the visual indicator for password mismatch based on current input.
 */
function refreshPasswordMismatchIndicator() {
  const mismatchAlertElement = document.getElementById("password_mismatch_alert");
  if (mismatchAlertElement) {
    if (checkAdminPasswordsMatch()) {
      mismatchAlertElement.classList.add("feedback-hidden");
      mismatchAlertElement.classList.remove("feedback-visible");
    } else {
      mismatchAlertElement.classList.remove("feedback-hidden");
      mismatchAlertElement.classList.add("feedback-visible");
    }
  }
}

/**
 * Controls the enabled/disabled state and visual styling of wireless configuration inputs.
 * @param {boolean} shouldBeDisabled - If true, elements are disabled and greyed out; otherwise, enabled.
 */
function updateWirelessConfigurationState(shouldBeDisabled) {
  const wirelessConfigurationSection = document.getElementById("wireless_config_group");
  const passphraseInput = document.getElementById("wireless_passkey_input");
  const ssidInput = document.getElementById("wireless_ssid_input");
  const encryptionDropdown = document.getElementById("wireless_security_dropdown");
  const availableNetworksDropdown = document.getElementById("available_wireless_networks");

  if (wirelessConfigurationSection) {
    wirelessConfigurationSection.classList.toggle("section-disabled", shouldBeDisabled);
    wirelessConfigurationSection.classList.toggle("section-enabled", !shouldBeDisabled);
  }

  // Apply disabled state to individual elements
  [passphraseInput, ssidInput, encryptionDropdown, availableNetworksDropdown].forEach(el => {
    if (el) el.disabled = shouldBeDisabled;
  });
}

/**
 * Adjusts the visibility of the wireless passphrase input based on the selected security type.
 * @param {HTMLSelectElement} securityTypeSelector - The dropdown element controlling security type.
 */
function handleWirelessSecurityChange(securityTypeSelector) {
  const passphraseInputContainer = document.getElementById("wireless_passkey_container");
  const passphraseInput = document.getElementById("wireless_passkey_input");

  if (!passphraseInputContainer || !passphraseInput) {
    console.warn("Wireless passphrase UI elements missing from the DOM.");
    return;
  }

  if (securityTypeSelector && securityTypeSelector.value === "none") {
    passphraseInputContainer.classList.add("element-hidden");
    passphraseInputContainer.classList.remove("element-visible");
    passphraseInput.value = ''; // Clear password for 'none' security
  } else {
    passphraseInputContainer.classList.remove("element-hidden");
    passphraseInputContainer.classList.add("element-visible");
    passphraseInput.focus();
  }
}

// --- PGP Encryption Handling (Optional) ---
// This section conditionally initializes PGP utilities if 'PGPKeyUtil' and 'publicKeyData' are available globally.
const secureDataProcessor = (() => {
  let pgpInstance = null;
  let encryptionKeyId = null;
  let rawPublicKey = null;

  if (typeof PGPKeyUtil === "function" && typeof publicKeyData !== "undefined") {
    try {
      const tempPgpUtil = new PGPKeyUtil(publicKeyData);
      encryptionKeyId = tempPgpUtil.keyid;
      rawPublicKey = tempPgpUtil.pkey.replace(/\n/g, ""); // Remove newlines from key
      pgpInstance = {
        performEncryption: (dataToEncrypt) => doEncrypt(encryptionKeyId, 0, rawPublicKey, dataToEncrypt) // Assumes doEncrypt is global
      };
    } catch (e) {
      console.error("Error during PGP utility initialization:", e);
    }
  } else {
    console.info("PGP encryption module (PGPKeyUtil/publicKeyData) not detected or initialized.");
  }
  return pgpInstance;
})();

/**
 * Submits form data, optionally encrypting specified fields before submission.
 * @param {string} submissionTargetUrl - The URL where the form data will be sent.
 * @param {HTMLFormElement} sourceFormElement - The HTML form containing the input data.
 * @param {string} hiddenFormId - The ID of a hidden form used for actual submission (e.g., with encrypted payload).
 * @param {string[]} fieldsForEncryption - An array of names of form fields whose values should be encrypted.
 * @returns {boolean} Always returns false to prevent default browser form submission.
 */
function dispatchEncryptedForm(submissionTargetUrl, sourceFormElement, hiddenFormId, fieldsForEncryption) {
  if (!sourceFormElement || !hiddenFormId || !Array.isArray(fieldsForEncryption)) {
    console.error("Invalid parameters provided for dispatchEncryptedForm.");
    return false;
  }

  const collectedData = {};
  for (const fieldName of fieldsForEncryption) {
    const inputControl = sourceFormElement.elements[fieldName];
    if (inputControl && !inputControl.disabled) {
      collectedData[fieldName] = inputControl.value;
    }
  }

  let finalPayloadString = JSON.stringify(collectedData);

  if (secureDataProcessor && secureDataProcessor.performEncryption) {
    try {
      finalPayloadString = secureDataProcessor.performEncryption(finalPayloadString);
    } catch (e) {
      console.error("Data encryption failed:", e);
      // In a production scenario, you might prevent submission or notify the user.
    }
  } else {
    console.warn("Secure data processor not active. Submitting data without client-side encryption.");
  }

  const submissionMechanismForm = document.getElementById(hiddenFormId);
  if (submissionMechanismForm && submissionMechanismForm.encrypted_data_payload) { // Assumes a hidden input named 'encrypted_data_payload'
    submissionMechanismForm.encrypted_data_payload.value = finalPayloadString;
    submissionMechanismForm.action = submissionTargetUrl; // Set target URL dynamically
    submissionMechanismForm.submit();
  } else {
    console.error(`Submission form with ID '${hiddenFormId}' or its payload field not found.`);
  }

  return false;
}

// --- Dynamic UI Loaders and Event Bindings ---

const UI_CONFIG = {
  NETWORK_SCAN_API: '/api/v2/wifi/scan',
  SCANNING_MESSAGE: "Searching for networks...",
  SELECT_NETWORK_PROMPT: "Choose a network...",
  NO_NETWORKS_FOUND: "No wireless networks detected.",
  ENCRYPTION_TYPE_NONE: "none"
};

/**
 * Initializes behavior for the upload progress bar and button.
 */
function setupFileUploadInteractions() {
  const uploadProgressIndicator = $("#file_upload_progress");
  const uploadActivationButton = $("#upload_action_button");

  if (uploadProgressIndicator.length > 0 && uploadActivationButton.length > 0) {
    uploadActivationButton.on("click", function() {
      uploadProgressIndicator.css("display", "block"); // Show progress bar
      $(this).addClass("btn-inactive").prop("disabled", true); // Disable button
    });
  }
}

/**
 * Attaches event listeners to wireless configuration elements.
 */
function setupWirelessConfigListeners() {
  const wifiEnableCheckbox = document.getElementById("toggle_wifi_enabled");
  if (wifiEnableCheckbox) {
    wifiEnableCheckbox.addEventListener("change", (event) => {
      updateWirelessConfigurationState(!event.target.checked);
    });
  }

  const securityTypeSelector = document.getElementById("wireless_security_dropdown");
  if (securityTypeSelector) {
    securityTypeSelector.addEventListener("change", (event) => {
      handleWirelessSecurityChange(event.target);
    });
  }
}

/**
 * Sets up event listeners for administrator password fields to provide real-time feedback.
 */
function setupAdminPasswordListeners() {
  const adminPasswordField = document.getElementById("admin_password_field");
  const confirmPasswordField = document.getElementById("confirm_admin_password_field");

  if (adminPasswordField) {
    adminPasswordField.addEventListener("keyup", refreshPasswordMismatchIndicator);
  }
  if (confirmPasswordField) {
    confirmPasswordField.addEventListener("keyup", refreshPasswordMismatchIndicator);
  }
}

/**
 * Configures the toggle functionality for the system log display.
 */
function setupSystemLogToggle() {
  const systemLogOutputArea = $("#system_activity_log");
  const logToggleButton = $("#log_visibility_toggle");

  if (systemLogOutputArea.length > 0 && logToggleButton.length > 0) {
    systemLogOutputArea.hide(); // Ensure hidden on load
    logToggleButton.on("click", function() {
      if ($(this).text().trim() === "Show Log") {
        systemLogOutputArea.slideDown(200); // Smooth animation
        $(this).text("Hide Log");
      } else {
        systemLogOutputArea.slideUp(200); // Smooth animation
        $(this).text("Show Log");
      }
      return false;
    });
  }
}

/**
 * Asynchronously fetches and populates the dropdown with available wireless networks.
 */
function fetchAndPopulateWirelessNetworkList() {
  const wirelessNetworkSelector = $("#available_wireless_networks");
  if (wirelessNetworkSelector.length === 0 || wirelessNetworkSelector[0].disabled) {
    return false;
  }

  wirelessNetworkSelector.empty();
  wirelessNetworkSelector.append(`<option value="">${UI_CONFIG.SCANNING_MESSAGE}</option>`);

  $.ajax({
    url: UI_CONFIG.NETWORK_SCAN_API,
    method: 'GET',
    dataType: 'json',
    success: (networkData) => {
      wirelessNetworkSelector.empty();
      wirelessNetworkSelector.append(`<option value="">${UI_CONFIG.SELECT_NETWORK_PROMPT}</option>`);

      if (!Array.isArray(networkData) || networkData.length === 0) {
        wirelessNetworkSelector.append(`<option value="" disabled>${UI_CONFIG.NO_NETWORKS_FOUND}</option>`);
        return;
      }

      for (const network of networkData) {
        let optionHtml = `${network.name} (`;
        if (network.encryption_type && network.encryption_type !== UI_CONFIG.ENCRYPTION_TYPE_NONE) {
          optionHtml += `${network.display_encryption}, `;
        }
        optionHtml += `signal ${network.signal_strength}%)`;
        const optionValue = `${network.name}|||${network.encryption_type}`; // Retain original composite value format
        wirelessNetworkSelector.append(`<option value="${optionValue}">${optionHtml}</option>`);
      }
    },
    error: (xhr, status, error) => {
      console.error("Failed to retrieve wireless networks:", status, error);
      wirelessNetworkSelector.empty();
      wirelessNetworkSelector.append(`<option value="" disabled>Error loading networks.</option>`);
    }
  });
  return false;
}

/**
 * Sets up the change event handler for the available wireless networks dropdown.
 */
function setupAvailableNetworksHandler() {
  const networkSelectorDropdown = document.getElementById("available_wireless_networks");
  if (networkSelectorDropdown) {
    networkSelectorDropdown.addEventListener("change", () => {
      const selectedNetValue = networkSelectorDropdown.value;
      if (isEffectivelyEmpty(selectedNetValue)) {
        return; // Ignore default or empty selections
      }

      const [ssid, encryptionType] = selectedNetValue.split("|||");
      if (!ssid || !encryptionType) {
        console.warn("Unexpected format for selected network value:", selectedNetValue);
        return;
      }

      const ssidInput = $("#wireless_ssid_input");
      const encryptionDropdown = $("#wireless_security_dropdown");

      ssidInput.val(ssid);
      encryptionDropdown.val(encryptionType);
      encryptionDropdown.trigger("change"); // Programmatically trigger change to update passphrase field visibility
    });

    // Initial scan on page load
    fetchAndPopulateWirelessNetworkList();

    // Setup refresh button for networks
    const refreshNetworksButton = document.getElementById("refresh_wireless_scan_btn");
    if (refreshNetworksButton) {
      refreshNetworksButton.addEventListener("click", fetchAndPopulateWirelessNetworkList);
    }
  }
}

/**
 * Configures event listeners for REST API access toggles.
 */
function setupRestApiAccessToggles() {
  const openAccessToggle = document.getElementById("rest_api_allow_open");
  const passwordAuthToggle = document.getElementById("rest_api_enable_password_auth");

  const handleApiToggleUpdate = function() {
    const updateData = {};
    updateData[this.name] = $(this).val(); // Get value from the toggled element
    // Assuming 'this.form.action' points to the correct API endpoint for updates
    $.post(this.form.action, updateData)
      .fail((xhr, status, error) => {
        console.error("Failed to update REST API setting:", status, error);
        // Implement UI feedback for failure if necessary
      });
  };

  if (openAccessToggle) {
    openAccessToggle.addEventListener("click", handleApiToggleUpdate);
  }
  if (passwordAuthToggle) {
    passwordAuthToggle.addEventListener("click", handleApiToggleUpdate);
  }
}

/**
 * The main initialization function, executed once the DOM is fully loaded.
 * It orchestrates the setup of all interactive elements and initial UI states.
 */
function initializeApplicationInterface() {
  // Set focus to the password field on login-like pages
  const loginUsernameField = document.getElementById("login_user_field");
  const loginPasswordField = document.getElementById("login_pass_field");
  if (loginUsernameField && loginPasswordField) {
    loginPasswordField.focus();
  }

  setupFileUploadInteractions();
  setupWirelessConfigListeners();
  setupAdminPasswordListeners();
  setupSystemLogToggle();
  setupAvailableNetworksHandler();
  setupRestApiAccessToggles();

  // Ensure initial UI consistency
  restoreFormDefaults();
  refreshPasswordMismatchIndicator();
}

// Attach the main initialization function to the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", initializeApplicationInterface);