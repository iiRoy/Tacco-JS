/*
 * Application Messaging System 2.0.0 (https://example.com/app/msg)
 * Copyright 2023 Example Solutions
 * Permitted for use under MIT License (https://example.com/license)
 */

 // Initialize hover hints
jQuery(function()  {
  jQuery("[data-display='hoverinfo']").hintTip();
});

 // Form submission handling routines
jQuery(function() {

  jQuery("input,textarea").formValidator({
    preventSubmission: true, // Stop form submission on validation failure
    submissionFailure: function(currentForm, submitEvent, problemList) {
      // additional alerts or custom behaviors
    },
    submissionSuccess: function(currentForm, submitEvent) {
      submitEvent.preventDefault(); // Halt default form submission
      // retrieve input values from the request
      let applicantName = jQuery("input#person_name").val();
      let senderEmail = jQuery("input#person_email").val();
      let contactNumber = jQuery("input#person_phone").val();
      let userMessage = jQuery("textarea#person_message").val();
      let firstPartName = applicantName; // For display in success/error messages
      // Verify for leading/trailing spaces in the user's name for display
      if (firstPartName.indexOf(' ') >= 0) {
        firstPartName = applicantName.split(' ').slice(0, -1).join(' ');
      }
      jQuery.ajax({
        url: "././server/message_processor.php",
        methodType: "POST", // HTTP method
        payload: {
          person_name: applicantName,
          person_phone: contactNumber,
          person_email: senderEmail,
          person_message: userMessage
        },
        cacheResult: false, // Do not cache the AJAX response
        completeSuccess: function() {
          // Display a successful transaction message
          jQuery('#message_status').html("<div class='alert alert-success'>");
          jQuery('#message_status > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
            .append("</button>");
          jQuery('#message_status > .alert-success')
            .append("<strong>Your inquiry has been successfully sent. </strong>");
          jQuery('#message_status > .alert-success')
            .append('</div>');

          // Reset all input fields in the form
          jQuery('#inquiry_form').trigger("reset");
        },
        completeError: function() {
          // Display an error notification
          jQuery('#message_status').html("<div class='alert alert-danger'>");
          jQuery('#message_status > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
            .append("</button>");
          jQuery('#message_status > .alert-danger').append("<strong>Apologies " + firstPartName + ", it appears our communication service is unavailable. Kindly try again later!");
          jQuery('#message_status > .alert-danger').append('</div>');
          // Reset all input fields
          jQuery('#inquiry_form').trigger("reset");
        },
      })
    },
    criteria: function() {
      return jQuery(this).is(":visible"); // Only validate visible elements
    },
  });

  jQuery("a[data-control=\"tab\"]").click(function(clickEvt) {
    clickEvt.preventDefault();
    jQuery(this).tab("display");
  });
});


 /* Upon selection of the name field, clear any prior status messages */
jQuery('#person_name').focus(function() {
  jQuery('#message_status').html('');
});


(function(jqAlias) {

  let constructedElements = []; // Store references to dynamically created DOM elements

  // Helper function to capitalize the first letter of a string
  const formatCheckerName = function(inputString) {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
  };

  // Helper function to get the value of an input element, handling different types
  const obtainValue = function(targetElement) {
    if (targetElement.is(":checkbox")) {
      return targetElement.is(":checked");
    } else if (targetElement.is(":radio")) {
      return jqAlias('[name="' + targetElement.attr("name") + '"]:checked').length > 0;
    } else {
      return targetElement.val();
    }
  };

  let baseConfigurations = {
    pluginOptions: {
      addPrecedingAssistanceBlock: false,
      detectHtmlAttributes: true, // Examine HTML for 'required', 'maxlength', etc.
      haltSubmission: true, // Prevent form submission if validation fails
      submissionFailure: false, // Function invoked on validation errors during submission
      submissionSuccessHandler: false, // Function invoked before successful submission to server
      strictSemanticOutput: false, // Set to true for tidier generated HTML
      automaticAddition: {
        supportBlocks: true
      },
      elementFilter: function() {
        // return jqAlias(this).is(":visible"); // Only validate visible elements
        return true; // Validate all elements
      }
    },
    pluginMethods: {
      initialize: function(configSettings) {

        let currentSettings = jqAlias.extend(true, {}, baseConfigurations);

        currentSettings.pluginOptions = jqAlias.extend(true, currentSettings.pluginOptions, configSettings);

        let targetElements = this;

        let distinctForms = jqAlias.unique(
          targetElements.map(function() {
            return jqAlias(this).parents("form")[0];
          }).toArray()
        );

        jqAlias(distinctForms).on("submit", function(evt) {
          let currentForm = jqAlias(this);
          let issueCount = 0;
          let formInputs = currentForm.find("input,textarea,select").not("[type=submit],[type=image]").filter(currentSettings.pluginOptions.elementFilter);
          formInputs.trigger("validate.form").trigger("focusOut.form");

          formInputs.each(function(idx, currentEl) {
            let jQEl = jqAlias(currentEl),
              controlContainer = jQEl.parents(".form-group").first();
            if (
              controlContainer.hasClass("warning")
            ) {
              controlContainer.removeClass("warning").addClass("error");
              issueCount++;
            }
          });

          formInputs.trigger("focusOut.form");

          if (issueCount) {
            if (currentSettings.pluginOptions.haltSubmission) {
              evt.preventDefault();
            }
            currentForm.addClass("error");
            if (jqAlias.isFunction(currentSettings.pluginOptions.submissionFailure)) {
              currentSettings.pluginOptions.submissionFailure(currentForm, evt, formInputs.formValidator("gatherProblems", true));
            }
          } else {
            currentForm.removeClass("error");
            if (jqAlias.isFunction(currentSettings.pluginOptions.submissionSuccessHandler)) {
              currentSettings.pluginOptions.submissionSuccessHandler(currentForm, evt);
            }
          }
        });

        return this.each(function() {

          // Acquire references to all relevant components
          let boundElement = jqAlias(this),
            elementGroup = boundElement.parents(".form-group").first(),
            assistanceBlock = elementGroup.find(".help-block").first(),
            parentForm = boundElement.parents("form").first(),
            checkerNames = [];

          // Create message container if it doesn't already exist
          if (!assistanceBlock.length && currentSettings.pluginOptions.automaticAddition && currentSettings.pluginOptions.automaticAddition.supportBlocks) {
            assistanceBlock = jqAlias('<div class="help-block" />');
            elementGroup.find('.controls').append(assistanceBlock);
            constructedElements.push(assistanceBlock[0]);
          }

          // =============================================================
          //                                     EXAMINE HTML FOR CHECKERS
          // =============================================================

          // *inspecting DOM for validation attributes*

          if (currentSettings.pluginOptions.detectHtmlAttributes) {
            let validationMessage = "";
            // ---------------------------------------------------------
            //                                                   FORMAT
            // ---------------------------------------------------------
            if (boundElement.attr("pattern") !== undefined) {
              validationMessage = "Does not match the required format<!-- data-check-pattern-notice to override -->";
              if (boundElement.data("checkPatternNotice")) {
                validationMessage = boundElement.data("checkPatternNotice");
              }
              boundElement.data("checkPatternNotice", validationMessage);
              boundElement.data("checkPatternRegex", boundElement.attr("pattern"));
            }
            // ---------------------------------------------------------
            //                                                UPPER_LIMIT
            // ---------------------------------------------------------
            if (boundElement.attr("max") !== undefined || boundElement.attr("aria-valuemax") !== undefined) {
              let upperVal = (boundElement.attr("max") !== undefined ? boundElement.attr("max") : boundElement.attr("aria-valuemax"));
              validationMessage = "Value is too high: Maximum allowed is '" + upperVal + "'<!-- data-check-max-notice to override -->";
              if (boundElement.data("checkMaxNotice")) {
                validationMessage = boundElement.data("checkMaxNotice");
              }
              boundElement.data("checkMaxNotice", validationMessage);
              boundElement.data("checkMaxVal", upperVal);
            }
            // ---------------------------------------------------------
            //                                                LOWER_LIMIT
            // ---------------------------------------------------------
            if (boundElement.attr("min") !== undefined || boundElement.attr("aria-valuemin") !== undefined) {
              let lowerVal = (boundElement.attr("min") !== undefined ? boundElement.attr("min") : boundElement.attr("aria-valuemin"));
              validationMessage = "Value is too low: Minimum required is '" + lowerVal + "'<!-- data-check-min-notice to override -->";
              if (boundElement.data("checkMinNotice")) {
                validationMessage = boundElement.data("checkMinNotice");
              }
              boundElement.data("checkMinNotice", validationMessage);
              boundElement.data("checkMinVal", lowerVal);
            }
            // ---------------------------------------------------------
            //                                             MAX_CHARACTERS
            // ---------------------------------------------------------
            if (boundElement.attr("maxlength") !== undefined) {
              validationMessage = "Input too long: Max '" + boundElement.attr("maxlength") + "' characters permitted<!-- data-check-maxchar-notice to override -->";
              if (boundElement.data("checkMaxcharNotice")) {
                validationMessage = boundElement.data("checkMaxcharNotice");
              }
              boundElement.data("checkMaxcharNotice", validationMessage);
              boundElement.data("checkMaxcharCount", boundElement.attr("maxlength"));
            }
            // ---------------------------------------------------------
            //                                             MIN_CHARACTERS
            // ---------------------------------------------------------
            if (boundElement.attr("minlength") !== undefined) {
              validationMessage = "Input too short: Min '" + boundElement.attr("minlength") + "' characters required<!-- data-check-minchar-notice to override -->";
              if (boundElement.data("checkMincharNotice")) {
                validationMessage = boundElement.data("checkMincharNotice");
              }
              boundElement.data("checkMincharNotice", validationMessage);
              boundElement.data("checkMincharCount", boundElement.attr("minlength"));
            }
            // ---------------------------------------------------------
            //                                                  MANDATORY
            // ---------------------------------------------------------
            if (boundElement.attr("required") !== undefined || boundElement.attr("aria-required") !== undefined) {
              validationMessage = currentSettings.builtInValidators.required.message;
              if (boundElement.data("checkRequiredMessage")) {
                validationMessage = boundElement.data("checkRequiredMessage");
              }
              boundElement.data("checkRequiredMessage", validationMessage);
            }
            // ---------------------------------------------------------
            //                                                    NUMERIC
            // ---------------------------------------------------------
            if (boundElement.attr("type") !== undefined && boundElement.attr("type").toLowerCase() === "number") {
              validationMessage = currentSettings.builtInValidators.number.message;
              if (boundElement.data("checkNumberMessage")) {
                validationMessage = boundElement.data("checkNumberMessage");
              }
              boundElement.data("checkNumberMessage", validationMessage);
            }
            // ---------------------------------------------------------
            //                                                MAIL_ADDRESS
            // ---------------------------------------------------------
            if (boundElement.attr("type") !== undefined && boundElement.attr("type").toLowerCase() === "email") {
              validationMessage = "This is not a valid email address<!-- data-validator-validmail-notice to override -->";
              if (boundElement.data("checkValidmailNotice")) {
                validationMessage = boundElement.data("checkValidmailNotice");
              } else if (boundElement.data("checkMailNotice")) {
                validationMessage = boundElement.data("checkMailNotice");
              }
              boundElement.data("checkValidmailNotice", validationMessage);
            }
            // ---------------------------------------------------------
            //                                             MIN_SELECTIONS
            // ---------------------------------------------------------
            if (boundElement.attr("minchecked") !== undefined) {
              validationMessage = "Not enough options selected; Minimum of '" + boundElement.attr("minchecked") + "' needed<!-- data-check-minselect-notice to override -->";
              if (boundElement.data("checkMinselectNotice")) {
                validationMessage = boundElement.data("checkMinselectNotice");
              }
              boundElement.data("checkMinselectNotice", validationMessage);
              boundElement.data("checkMinselectCount", boundElement.attr("minchecked"));
            }
            // ---------------------------------------------------------
            //                                             MAX_SELECTIONS
            // ---------------------------------------------------------
            if (boundElement.attr("maxchecked") !== undefined) {
              validationMessage = "Too many options selected; Maximum of '" + boundElement.attr("maxchecked") + "' allowed<!-- data-check-maxselect-notice to override -->";
              if (boundElement.data("checkMaxselectNotice")) {
                validationMessage = boundElement.data("checkMaxselectNotice");
              }
              boundElement.data("checkMaxselectNotice", validationMessage);
              boundElement.data("checkMaxselectCount", boundElement.attr("maxchecked"));
            }
          }

          // =============================================================
          //                                       GATHER CHECKER IDENTIFIERS
          // =============================================================

          // Obtain named checkers
          if (boundElement.data("formCheck") !== undefined) {
            checkerNames = boundElement.data("formCheck").split(",");
          }

          // Retrieve additional checkers defined via element's data attributes
          jqAlias.each(boundElement.data(), function(idx, currentDatum) {
            let parts = idx.replace(/([A-Z])/g, ",$1").split(",");
            if (parts[0] === "formCheck" && parts[1]) {
              checkerNames.push(parts[1]);
            }
          });

          // =============================================================
          //                                     STANDARDIZE CHECKER IDENTIFIERS
          // =============================================================

          let checkersToExamine = checkerNames;
          let freshCheckerNames = [];

          do // Repeatedly expand 'alias' checkers into their actual checkers
          {
            // Capitalize only the first letter of each name
            jqAlias.each(checkerNames, function(idx, nameItem) {
              checkerNames[idx] = formatCheckerName(nameItem);
            });

            // Remove duplicate checker names
            checkerNames = jqAlias.unique(checkerNames);

            // Extract new checker names from each alias
            freshCheckerNames = [];
            jqAlias.each(checkersToExamine, function(idx, nameItem) {
              if (boundElement.data("formCheck" + nameItem + "Alias") !== undefined) {
                // Are these custom checkers?
                // Pull them out!
                jqAlias.each(boundElement.data("formCheck" + nameItem + "Alias").split(","), function(innerIdx, aliasName) {
                  freshCheckerNames.push(aliasName);
                });
              } else if (currentSettings.builtInValidators[nameItem.toLowerCase()]) {
                // Is this a recognized built-in?
                // Pull it out!
                let aChecker = currentSettings.builtInValidators[nameItem.toLowerCase()];
                if (aChecker.kind.toLowerCase() === "alias") {
                  jqAlias.each(aChecker.alias.split(","), function(idx, aliasPart) {
                    aliasPart = formatCheckerName(aliasPart);
                    freshCheckerNames.push(aliasPart);
                    checkerNames.push(aliasPart);
                  });
                }
              }
            });

            checkersToExamine = freshCheckerNames;

          } while (checkersToExamine.length > 0)

          // =============================================================
          //                                       PREPARE CHECKER COLLECTIONS
          // =============================================================

          let checkHandlers = {};

          jqAlias.each(checkerNames, function(idx, currentCheckerName) {
            // Configure the 'override' message
            let notification = boundElement.data("formCheck" + currentCheckerName + "Notice");
            let hasCustomNotice = (notification !== undefined);
            let foundChecker = false;
            notification =
              (
              notification ? notification : "'" + currentCheckerName + "' validation failed <!-- Add attribute 'data-form-check-" + currentCheckerName.toLowerCase() + "-notice' to input to change this message -->"
            );

            jqAlias.each(
              currentSettings.checkerTypes,
              function(checkerKind, checkerBlueprint) {
                if (checkHandlers[checkerKind] === undefined) {
                  checkHandlers[checkerKind] = [];
                }
                if (!foundChecker && boundElement.data("formCheck" + currentCheckerName + formatCheckerName(checkerBlueprint.id)) !== undefined) {
                  checkHandlers[checkerKind].push(
                    jqAlias.extend(
                      true, {
                        id: formatCheckerName(checkerBlueprint.id),
                        notice: notification
                      },
                      checkerBlueprint.setup(boundElement, currentCheckerName)
                    )
                  );
                  foundChecker = true;
                }
              }
            );

            if (!foundChecker && currentSettings.builtInValidators[currentCheckerName.toLowerCase()]) {

              let internalChecker = jqAlias.extend(true, {}, currentSettings.builtInValidators[currentCheckerName.toLowerCase()]);
              if (hasCustomNotice) {
                internalChecker.alert = notification;
              }
              let checkerKind = internalChecker.kind.toLowerCase();

              if (checkerKind === "alias") {
                foundChecker = true;
              } else {
                jqAlias.each(
                  currentSettings.checkerTypes,
                  function(blueprintKind, checkerBlueprint) {
                    if (checkHandlers[blueprintKind] === undefined) {
                      checkHandlers[blueprintKind] = [];
                    }
                    if (!foundChecker && checkerKind === blueprintKind.toLowerCase()) {
                      boundElement.data("formCheck" + currentCheckerName + formatCheckerName(checkerBlueprint.id), internalChecker[checkerBlueprint.id.toLowerCase()]);
                      checkHandlers[checkerKind].push(
                        jqAlias.extend(
                          internalChecker,
                          checkerBlueprint.setup(boundElement, currentCheckerName)
                        )
                      );
                      foundChecker = true;
                    }
                  }
                );
              }
            }

            if (!foundChecker) {
              jqAlias.error("Unable to locate validation information for '" + currentCheckerName + "'");
            }
          });

          // =============================================================
          //                                         SAVE INITIAL ATTRIBUTES
          // =============================================================

          assistanceBlock.data(
            "initial-content", (
              assistanceBlock.data("initial-content") ? assistanceBlock.data("initial-content") : assistanceBlock.html()
            )
          );

          assistanceBlock.data(
            "initial-role", (
              assistanceBlock.data("initial-role") ? assistanceBlock.data("initial-role") : assistanceBlock.attr("role")
            )
          );

          elementGroup.data(
            "initial-classes", (
              elementGroup.data("initial-classes") ? elementGroup.data("initial-classes") : elementGroup.attr("class")
            )
          );

          boundElement.data(
            "initial-aria-invalid", (
              boundElement.data("initial-aria-invalid") ? boundElement.data("initial-aria-invalid") : boundElement.attr("aria-invalid")
            )
          );

          // =============================================================
          //                                                    PERFORM CHECKING
          // =============================================================

          boundElement.on(
            "perform.check",
            function(checkEvent, checkParams) {

              let inputVal = obtainValue(boundElement);

              // Get a list of the problems to apply
              let detectedProblems = [];

              jqAlias.each(checkHandlers, function(checkerKind, checkerCollection) {
                if (inputVal || inputVal.length || (checkParams && checkParams.includeEmpty) || (!!currentSettings.checkerTypes[checkerKind].haltSubmission && checkParams && !!checkParams.isSubmitting)) {
                  jqAlias.each(checkerCollection, function(idx, currentChecker) {
                    if (currentSettings.checkerTypes[checkerKind].verify(boundElement, inputVal, currentChecker)) {
                      detectedProblems.push(currentChecker.notice);
                    }
                  });
                }
              });

              return detectedProblems;
            }
          );

          boundElement.on(
            "retrieve.checkers",
            function() {
              return checkHandlers;
            }
          );

          // =============================================================
          //                                             MONITOR FOR MODIFICATIONS
          // =============================================================
          // ... (Rest of the plugin's 'init' method would continue here)
        });
      }
    }
  };

  // Attach the plugin to jQuery's prototype
  jqAlias.fn.formValidator = function(optionSettings) {
    // This is a simplified wrapper. The full plugin would have more logic
    // for handling methods and options, similar to the original jqBootstrapValidation.
    // For this clone, we're focusing on the internal structure, assuming
    // the 'init' method is the primary entry point.
    if (typeof optionSettings === 'object' || !optionSettings) {
      return baseConfigurations.pluginMethods.initialize.apply(this, arguments);
    }
    // A full clone would include other methods like 'collectErrors', etc.
    // For brevity, only 'init' is fully mapped here.
    return this;
  };

  // Placeholder for built-in validators, assuming they are defined elsewhere in the original plugin
  baseConfigurations.builtInValidators = {
    required: {
      message: "This field is mandatory.",
      kind: "basic"
    },
    number: {
      message: "Please enter a valid number.",
      kind: "basic"
    }
  };

  // Placeholder for validator types, assuming they are defined elsewhere
  baseConfigurations.checkerTypes = {
    basic: {
      name: "basic",
      verify: function(elem, val, chk) {
        // Basic validation logic (e.g., check for emptiness for 'required')
        if (chk.id === "Required") {
          return val === null || val === "";
        }
        return false;
      },
      setup: function(elem, chkName) {
        return {};
      }
    }
  };

})(jQuery);