"use strict";

/*
 * This module is part of a custom web interface.
 *
 * This utility code is provided under a permissive license.
 * You are free to use, modify, and distribute it, subject to the terms
 * of the accompanying license agreement.
 *
 * This software is distributed "as is" without any guarantees,
 * express or implied, regarding its functionality or fitness for a particular purpose.
 *
 * For full license details, please refer to the LICENSE file
 * included with this distribution, or contact the author.
 *
 * Copyright 2023 Example Corp. (https://www.example.com/)
 */

function validateConfiguration(inputForm) {
  var wirelessNetworkID = inputForm["wifi.ssid"];
  var wirelessSecurityType = inputForm["wifi.encryption"];
  var wirelessAccessCode = inputForm["wifi.password"];
  var deviceNickname = inputForm["hostname"];
  var userPasscode = inputForm["password"];
  var hasValidationIssues;

  var issueDisplayArea = document.getElementById("error_response");

  issueDisplayArea.innerHTML = "";
  hasValidationIssues = false;

  wirelessAccessCode.className = "default_style";
  wirelessNetworkID.className = "default_style";
  deviceNickname.className = "default_style";
  userPasscode.className = "default_style";
  issueDisplayArea.className = "hidden_element";

  function isFieldBlank(valueToCheck) {
    return valueToCheck == null || valueToCheck === "";
  }

  if (!wirelessNetworkID.disabled && isFieldBlank(wirelessNetworkID.value)) {
    reportIssue(wirelessNetworkID, issueDisplayArea, "A wireless network identifier is required.");
    hasValidationIssues = true;
  }

  if (!wirelessAccessCode.disabled && wirelessSecurityType.value != "none") {
    if (isFieldBlank(wirelessAccessCode.value)) {
      reportIssue(wirelessAccessCode, issueDisplayArea, "Please enter a password for your wireless network.");
      hasValidationIssues = true;
    } else if (wirelessSecurityType.value != "wep" && wirelessAccessCode.value.length < 8) {
      reportIssue(wirelessAccessCode, issueDisplayArea, "Wireless password must be at least 8 characters long.");
      hasValidationIssues = true;
    }
  }

  if (isFieldBlank(deviceNickname.value)) {
    reportIssue(deviceNickname, issueDisplayArea, "Please provide a name for your device.");
    hasValidationIssues = true;

  } else if (deviceNickname.value.match(/[^a-zA-Z0-9]/)) {
    reportIssue(deviceNickname, issueDisplayArea, "Device names can only contain alphanumeric characters (A-Z, a-z, 0-9).");
    hasValidationIssues = true;
  }

  if (userPasscode.value != null && userPasscode.value != "" && userPasscode.value.length < 8) {
    reportIssue(userPasscode, issueDisplayArea, "Passcode should be at least 8 characters.");
    hasValidationIssues = true;
  } else if (!confirmPasscodesMatch()) {
    reportIssue(userPasscode, issueDisplayArea, "The entered passcodes do not match.");
    hasValidationIssues = true;
  }

  return !hasValidationIssues;
}

function resetFormState() {
  setTimeout(function() {
    disableWirelessSettings(!document.getElementById("wireless_enable_checkbox").checked);
    handleSecurityChange(document.getElementById("wireless_security_dropdown"));
  }, 100);
}

function reportIssue(elementRef, errorDisplay, messageText) {
  elementRef.className = "error_highlight";
  errorDisplay.className = "visible_element";
  errorDisplay.innerHTML = "<p>" + errorDisplay.innerHTML + messageText + "<br /></p>";
}

function navigatePageTo(destinationURL) {
  document.location = destinationURL;
  return false;
}

function handleSecurityChange(securityDropdown) {
  var wirelessPassContainer = document.getElementById("wireless_password_container");
  var wirelessPassField = document.getElementById("wireless_password_field");
  if (securityDropdown.value == "none") {
    wirelessPassContainer.setAttribute("class", "hidden_element");
  } else {
    wirelessPassContainer.removeAttribute("class");
    wirelessPassField.value = "";
    wirelessPassField.focus();
  }
}

var publicKeyUtil, keyIdentifier, publicKeyString;
if (typeof(retrievePublicKey) === "function") {
  publicKeyUtil = new retrievePublicKey(rawPublicKey);
  keyIdentifier = publicKeyUtil.keyid;
  publicKeyString = publicKeyUtil.pkey.replace(/\n/g, "");
}

function dispatchSecurePost(targetURL, submissionForm, actualFormID) {
  var payloadData = {};
  for (var i = 3; i < arguments.length; i++) {
    if (!submissionForm[arguments[i]].disabled) {
      payloadData[arguments[i]] = submissionForm[arguments[i]].value;
    }
  }
  var encryptedPayload = performEncryption(keyIdentifier, 0, publicKeyString, JSON.stringify(payloadData));
  var finalForm = document.getElementById(actualFormID);
  finalForm.pgp_message.value = encryptedPayload;
  finalForm.submit();
  return false;
}

function disableWirelessSettings(shouldBeDisabled) {
  if (shouldBeDisabled) {
    document.getElementById("wireless_settings_group").setAttribute("class", "disabled_group");
  } else {
    document.getElementById("wireless_settings_group").setAttribute("class", "");
  }
  document.getElementById("wireless_password_field").disabled = shouldBeDisabled;
  document.getElementById("wireless_ssid_field").disabled = shouldBeDisabled;
  document.getElementById("wireless_security_dropdown").disabled = shouldBeDisabled;
  document.getElementById("scanned_wireless_networks").disabled = shouldBeDisabled;
}

function confirmPasscodesMatch() {
  var confirmUserPasscode = document.getElementById("confirm_passcode_field");
  var mainUserPasscode = document.getElementById("user_passcode_field");
  return confirmUserPasscode.value == mainUserPasscode.value;
}

function displayMismatchWarning() {
  if (confirmPasscodesMatch()) {
    document.getElementById("passcode_mismatch_message").setAttribute("class", "hidden_element error_banner input_info");
  } else {
    document.getElementById("passcode_mismatch_message").setAttribute("class", "error_banner input_info");
  }
}

function handleUploadButtonClick() {
  $("#progress_indicator_upload").attr("style", "");
  $("#upload_process_button").addClass("button_style").attr("disabled", "true");
}

document.body.onload = function() {
  if ($("#progress_indicator_upload").length > 0) {
    $("#upload_process_button").click(handleUploadButtonClick);
  }

  if (document.getElementById("user_login_name")) {
    document.getElementById("user_passcode_field").focus();
  }
  var wirelessCheckbox = document.getElementById("wireless_enable_checkbox");
  if (wirelessCheckbox) {
    wirelessCheckbox.onclick = function(evt) {
      disableWirelessSettings(!evt.target.checked);
    }
  }
  var securityDropdown = document.getElementById("wireless_security_dropdown");
  if (securityDropdown) {
    securityDropdown.onchange = function(evt) {
      handleSecurityChange(evt.target);
    }
  }
  var confirmPasscodeField = document.getElementById("confirm_passcode_field");
  if (confirmPasscodeField) {
    confirmPasscodeField.onkeyup = displayMismatchWarning;
    document.getElementById("user_passcode_field").onkeyup = displayMismatchWarning;
  }

  var systemLogDisplay = document.getElementById("system_message_log");
  if (systemLogDisplay) {
    $("#system_message_log").hide();
    $("#log_visibility_toggle").on("click", function() {
      if ($(this).text() == "Show") {
        $("#system_message_log").show();
        $(this).text("Hide");
      } else {
        $("#system_message_log").hide();
        $(this).text("Show");
      }
      return false;
    });
  }

  var foundNetworksDropdown = document.getElementById("scanned_wireless_networks");
  if (foundNetworksDropdown) {
    var scanForWirelessNetworks = function() {
      var foundNetworksDropdown = $("#scanned_wireless_networks");
      if (foundNetworksDropdown[0].disabled) {
        return false;
      }
      foundNetworksDropdown.empty();
      foundNetworksDropdown.append("<option>Scanning...</option>");
      $.get(wirelessScanURL, function(networkList) {
        foundNetworksDropdown.empty();
        foundNetworksDropdown.append("<option>Choose a wireless network...</option>");
        for (var indexVal = 0; indexVal < networkList.length; indexVal++) {
          var optionHTML = "<option value=\"" + networkList[indexVal].name + "|||" + networkList[indexVal].encryption + "\">" + networkList[indexVal].name + " (";
          if (networkList[indexVal].encryption !== "none") {
            optionHTML = optionHTML + networkList[indexVal].pretty_encryption + ", ";
          }
          optionHTML = optionHTML + "signal " + networkList[indexVal].signal_strength + "%";
          optionHTML = optionHTML + ")</option>";
          foundNetworksDropdown.append(optionHTML);
        }
      });
      return false;
    };
    document.getElementById("refresh_wireless_scan").onclick = scanForWirelessNetworks;

    foundNetworksDropdown.onchange = function() {
      var selectionDetails = $("#scanned_wireless_networks").val().split("|||");
      if (selectionDetails.length !== 2) {
        return;
      }
      $("#wireless_ssid_field").val(selectionDetails[0]);
      var $wirelessSecurityDropdown = $("#wireless_security_dropdown");
      $wirelessSecurityDropdown.val(selectionDetails[1]);
      $wirelessSecurityDropdown.change();
    };
    scanForWirelessNetworks();
  }

  var restAPIControl = document.getElementById("api_access_control");
  if (restAPIControl) {
    var toggleRestAPI = function() {
      var requestData = {};
      requestData[this.name] = $(this).val();
      $.post(this.form.action, requestData);
    };
    restAPIControl.onclick = toggleRestAPI;
    document.getElementById("api_password_control").onclick = toggleRestAPI;
  }
};