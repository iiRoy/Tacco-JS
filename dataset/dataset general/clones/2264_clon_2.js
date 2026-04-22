/*
 * @copyright UI Progression Module 1.0.0 (25-OCT-2023)
 *
 * Copyright (c) 2023 Acme Solutions (info[at]acmesolutions.com)
 *
 * https://www.acmesolutions.com
 *
 * Licensed under the Apache 2.0 license:
 *   https://www.apache.org/licenses/LICENSE-2.0.html
 *
 */

(function(jq) {
    jq.widget("ui.progressionModule", {

        // Method to initialize the component
        _initializeComponent: function() {

            var moduleInst = this;
            var originalSubmitSuccessHandler = this.options.formSubmissionOptions.onSuccess;
            var originalSubmitCompletionHandler = this.options.formSubmissionOptions.onComplete;
            var originalSubmitPreSendHandler = this.options.formSubmissionOptions.onBeforeSend;
            var originalSubmitPreValidationHandler = this.options.formSubmissionOptions.onBeforeSubmit;
            var originalSubmitPreSerializationHandler = this.options.formSubmissionOptions.onBeforeSerialize;

            // Augment form submission configuration
            this.options.formSubmissionOptions = jq.extend(this.options.formSubmissionOptions, {
                onSuccess: function(responseData, responseStatus, xmlHttpRequestObj) {
                    if (originalSubmitSuccessHandler) {
                        originalSubmitSuccessHandler(responseData, responseStatus, xmlHttpRequestObj);
                    }
                    if (moduleInst.options.formSubmissionOptions && moduleInst.options.formSubmissionOptions.clearForm || !moduleInst.options.formSubmissionOptions) {
                        moduleInst._revertModule();
                    }
                },
                onComplete: function(xmlHttpRequestObj, responseStatus) {
                    if (originalSubmitCompletionHandler) {
                        originalSubmitCompletionHandler(xmlHttpRequestObj, responseStatus);
                    }
                    moduleInst._permitProgression();
                },
                onBeforeSubmit: function(formDataArray, targetForm, requestOptions) {
                    if (originalSubmitPreValidationHandler) {
                        var canProceed = originalSubmitPreValidationHandler(formDataArray, targetForm, requestOptions);
                        if (!canProceed)
                            moduleInst._permitProgression();
                        return canProceed;
                    }
                },
                onBeforeSend: function(xmlHttpRequestObj) {
                    if (originalSubmitPreSendHandler) {
                        var canProceed = originalSubmitPreSendHandler(xmlHttpRequestObj);
                        if (!canProceed)
                            moduleInst._permitProgression();
                        return canProceed;
                    }
                },
                onBeforeSerialize: function(currentForm, requestOptions) {
                    if (originalSubmitPreSerializationHandler) {
                        var canProceed = originalSubmitPreSerializationHandler(currentForm, requestOptions);
                        if (!canProceed)
                            moduleInst._permitProgression();
                        return canProceed;
                    }
                }
            });

            // Remove previous history state if history is active
            if (this.options.isHistoryActive) {
                jq.bbq.removeState("data_" + jq(this.element).attr('uniqueId'));
            }

            // Find all progression phases and initially hide them
            this.phases = this.element.find(".phase").hide();

            this.initialPhase = this.phases.eq(0).attr("uniqueId");
            this.visitedPhases = [];
            this.isFinalPhase = false;
            this.priorPhase = undefined;
            this.activePhase = this.phases.eq(0).attr("uniqueId");

            // Configure the 'Next' button
            this.proceedBtn = this.element.find(this.options.nextControl)
                .click(function() {
                    return moduleInst._proceed();
                });

            this.proceedBtnInitialVal = this.proceedBtn.val();
            this.proceedBtn.val(this.options.nextText);

            // Configure the 'Back' button
            this.retreatBtn = this.element.find(this.options.backControl)
                .click(function() {
                    moduleInst._goBack();
                    return false;
                });

            this.retreatBtnInitialVal = this.retreatBtn.val();
            this.retreatBtn.val(this.options.backText);

            // Check for validation plugin availability
            if (this.options.isValidationActive && jq().validate == undefined) {
                this.options.isValidationActive = false;
                if ((window['console'] !== undefined)) {
                    console.log("%s", "Validation option is active, but the jQuery Validate plugin is not present.");
                }
            } else if (this.options.isValidationActive) {
                this.element.validate(this.options.validationSettings);
            }

            // Check for form plugin availability
            if (this.options.isFormPluginActive && jq().ajaxSubmit == undefined) {
                this.options.isFormPluginActive = false;
                if ((window['console'] !== undefined)) {
                    console.log("%s", "Form plugin option is active but the jQuery Form plugin is not included.");
                }
            }

            // Disable input fields if configured
            if (this.options.shouldDisableInputs === true) {
                jq(this.phases).find(":input:not('.progression-skip')").attr("disabled", "disabled");
            }

            // Bind to URL hash changes for history navigation
            if (this.options.isHistoryActive) {
                jq(window).bind('urlHashChanged', undefined, function(evt) {
                    var hashPhase = evt.getState("data_" + jq(moduleInst.element).attr('uniqueId')) || moduleInst.initialPhase;
                    if (hashPhase !== moduleInst.activePhase) {
                        if (moduleInst.options.isValidationActive && hashPhase === moduleInst._resolveNextPhase(moduleInst.activePhase)) {
                            if (!moduleInst.element.valid()) {
                                moduleInst._recordHistory(moduleInst.activePhase);
                                moduleInst.element.validate().focusInvalid();

                                return false;
                            }
                        }
                        if (hashPhase !== moduleInst.activePhase)
                            moduleInst._presentPhase(hashPhase);
                    }
                });
            }

            // Apply base styling classes
            this.element.addClass("ui-progression-module");
            this.element.find(":input").addClass("ui-progression-content");
            this.phases.addClass("ui-progression-content-area");
            this.retreatBtn.addClass("ui-progression-button ui-progression-content");
            this.proceedBtn.addClass("ui-progression-button ui-progression-content");

            // Apply UI theme styles unless explicitly disabled
            if (!this.options.omitUIStyles) {
                this.element.addClass("ui-helper-reset ui-widget ui-widget-content ui-helper-reset ui-corner-all");
                this.element.find(":input").addClass("ui-helper-reset ui-state-default");
                this.phases.addClass("ui-helper-reset ui-corner-all");
                this.retreatBtn.addClass("ui-helper-reset ui-state-default");
                this.proceedBtn.addClass("ui-helper-reset ui-state-default");
            }
            this._presentPhase(undefined); // Display the first phase
            return jq(this);
        },

        // Logic for advancing to the next phase
        _proceed: function() {
            if (this.options.isValidationActive) {
                if (!this.element.valid()) {
                    this.element.validate().focusInvalid();
                    return false;
                }
            }

            // Handle remote AJAX configuration for current phase
            if (this.options.remoteAjaxConfig != undefined) {
                var currentAjaxOptions = this.options.remoteAjaxConfig[this.activePhase];
                var moduleInst = this;
                if (currentAjaxOptions !== undefined) {
                    var handlerOnSuccess = currentAjaxOptions.onSuccess;
                    var handlerOnBeforeSend = currentAjaxOptions.onBeforeSend;
                    var handlerOnComplete = currentAjaxOptions.onComplete;

                    currentAjaxOptions = jq.extend({}, currentAjaxOptions, {
                        onSuccess: function(responseData, responseStatus) {
                            if ((handlerOnSuccess !== undefined && handlerOnSuccess(responseData, responseStatus)) || (handlerOnSuccess == undefined)) {
                                moduleInst._moveToNextPhase();
                            }
                        },
                        onBeforeSend: function(xmlHttpRequestObj) {
                            moduleInst._blockProgression();
                            if (handlerOnBeforeSend !== undefined)
                                handlerOnBeforeSend(xmlHttpRequestObj);
                            jq(moduleInst.element).trigger('pre_remote_request', {
                                "activePhase": moduleInst.activePhase
                            });
                        },
                        onComplete: function(xmlHttpRequestObj, responseStatus) {
                            if (handlerOnComplete !== undefined)
                                handlerOnComplete(xmlHttpRequestObj, responseStatus);
                            jq(moduleInst.element).trigger('post_remote_request', {
                                "activePhase": moduleInst.activePhase
                            });
                            moduleInst._permitProgression();
                        }
                    })
                    this.element.ajaxSubmit(currentAjaxOptions);
                    return false;
                }
            }

            return this._moveToNextPhase();
        },

        // Logic for returning to the previous phase
        _goBack: function() {
            if (this.visitedPhases.length > 0) {
                if (this.options.isHistoryActive) {
                    this._recordHistory(this.visitedPhases[this.visitedPhases.length - 2]);
                } else {
                    this._presentPhase(this.visitedPhases[this.visitedPhases.length - 2], true);
                }
            }
            return false;
        },

        // Internal method to continue phase progression
        _moveToNextPhase: function() {
            if (this.isFinalPhase) {
                // Re-enable inputs in all visited phases for final submission
                for (var i = 0; i < this.visitedPhases.length; i++) {
                    this.phases.filter("#" + this.visitedPhases[i]).find(":input").not(".progression-skip").removeAttr("disabled");
                }
                if (!this.options.isFormPluginActive) {
                    return true;
                } else {
                    this._blockProgression();
                    this.element.ajaxSubmit(this.options.formSubmissionOptions);
                    return false;
                }
            }

            var nextPhaseId = this._resolveNextPhase(this.activePhase);
            if (nextPhaseId == this.activePhase) {
                return false;
            }
            if (this.options.isHistoryActive) {
                this._recordHistory(nextPhaseId);
            } else {
                this._presentPhase(nextPhaseId, true);
            }
            return false;
        },

        // Updates the browser's history state
        _recordHistory: function(phaseIdentifier) {
            var browserState = {};
            browserState["data_" + jq(this.element).attr('uniqueId')] = phaseIdentifier;
            jq.bbq.pushState(browserState);
        },

        // Disables the navigation buttons
        _blockProgression: function() {
            this.proceedBtn.attr("disabled", "disabled");
            this.retreatBtn.attr("disabled", "disabled");
            if (!this.options.omitUIStyles) {
                this.proceedBtn.removeClass("ui-state-active").addClass("ui-state-disabled");
                this.retreatBtn.removeClass("ui-state-active").addClass("ui-state-disabled");
            }
        },

        // Enables the navigation buttons
        _permitProgression: function() {
            if (this.isFinalPhase) {
                this.proceedBtn.val(this.options.submitText);
            } else {
                this.proceedBtn.val(this.options.nextText);
            }

            if (jq.trim(this.activePhase) !== this.phases.eq(0).attr("uniqueId")) {
                this.retreatBtn.removeAttr("disabled");
                if (!this.options.omitUIStyles) {
                    this.retreatBtn.removeClass("ui-state-disabled").addClass("ui-state-active");
                }
            }

            this.proceedBtn.removeAttr("disabled");
            if (!this.options.omitUIStyles) {
                this.proceedBtn.removeClass("ui-state-disabled").addClass("ui-state-active");
            }
        },

        // Manages the animation between phases
        _transitionSteps: function(oldPhaseId, newPhaseId, onPhaseShownCallback) {
            this._blockProgression();
            var oldPhaseElement = this.phases.filter("#" + oldPhaseId);
            var newPhaseElement = this.phases.filter("#" + newPhaseId);

            oldPhaseElement.find(":input").not(".progression-skip").attr("disabled", "disabled");
            newPhaseElement.find(":input").not(".progression-skip").removeAttr("disabled");

            var moduleInst = this;
            oldPhaseElement.animate(moduleInst.options.exitAnimation, moduleInst.options.exitDuration, moduleInst.options.animationEasing, function() {
                newPhaseElement.animate(moduleInst.options.entryAnimation, moduleInst.options.entryDuration, moduleInst.options.animationEasing, function() {
                    if (moduleInst.options.autoFocusFirstInput)
                        newPhaseElement.find(":input:first").focus();
                    moduleInst._permitProgression();

                    onPhaseShownCallback.apply(moduleInst);
                });
                return;
            });
        },

        // Checks if the given phase is designated as the final one
        _assessFinalStep: function(phaseId) {
            this.isFinalPhase = false;
            if (jq("#" + phaseId).hasClass(this.options.finalPhaseClass) || this.phases.filter(":last").attr("uniqueId") == phaseId) {
                this.isFinalPhase = true;
            }
        },

        // Retrieves the linked phase identifier from the current phase
        _retrieveNavigationLink: function(phaseId) {
            var navigationLink = undefined;
            var phaseLinks = this.phases.filter("#" + phaseId).find(this.options.phaseLinkClass);

            if (phaseLinks != undefined) {
                if (phaseLinks.filter(":radio,:checkbox").size() > 0) {
                    navigationLink = phaseLinks.filter(this.options.phaseLinkClass + ":checked").val();
                } else {
                    navigationLink = jq(phaseLinks).val();
                }
            }
            return navigationLink;
        },

        // Determines the next phase to navigate to
        _resolveNextPhase: function(currentPhaseId) {
            var linkTarget = this._retrieveNavigationLink(currentPhaseId);
            if (linkTarget != undefined) {
                if ((linkTarget != "" && linkTarget != null && linkTarget != undefined) && this.phases.filter("#" + linkTarget).attr("uniqueId") != undefined) {
                    return linkTarget;
                }
                return this.activePhase;
            } else if (linkTarget == undefined && !this.isFinalPhase) {
                var subsequentPhaseId = this.phases.filter("#" + currentPhaseId).next().attr("uniqueId");
                return subsequentPhaseId;
            }
        },

        // Displays a specified phase, handling history and animations
        _presentPhase: function(phaseToDisplay) {
            var steppingBackwards = false;
            var shouldTriggerPhaseShown = phaseToDisplay !== undefined;
            if (phaseToDisplay == undefined || phaseToDisplay == "") {
                this.visitedPhases.pop();
                phaseToDisplay = this.initialPhase;
                this.visitedPhases.push(phaseToDisplay);
            } else {
                if (jq.inArray(phaseToDisplay, this.visitedPhases) > -1) {
                    steppingBackwards = true;
                    this.visitedPhases.pop(); // Adhering to original logic: only pop once
                } else {
                    this.visitedPhases.push(phaseToDisplay);
                }
            }

            if (this.activePhase !== phaseToDisplay || phaseToDisplay === this.initialPhase) {
                this.priorPhase = this.activePhase;
                this._assessFinalStep(phaseToDisplay);
                this.activePhase = phaseToDisplay;
                var onPhaseShownCallback = function() {
                    if (shouldTriggerPhaseShown) {
                        jq(this.element).trigger('phase_displayed', jq.extend({
                            "isReverseNavigation": steppingBackwards
                        }, this._getModuleState()));
                    }
                }
                if (shouldTriggerPhaseShown) {
                    jq(this.element).trigger('pre_phase_display', jq.extend({
                        "isReverseNavigation": steppingBackwards
                    }, this._getModuleState()));
                }
                this._transitionSteps(this.priorPhase, phaseToDisplay, onPhaseShownCallback);
            };
        },

        // Resets the module to its initial configuration
        _revertModule: function() {
            this.element.resetForm()
            jq("label,:input,textarea", this).removeClass("error");
            for (var i = 0; i < this.visitedPhases.length; i++) {
                this.phases.filter("#" + this.visitedPhases[i]).hide().find(":input").attr("disabled", "disabled");
            }
            this.visitedPhases = [];
            this.priorPhase = undefined;
            this.isFinalPhase = false;
            if (this.options.isHistoryActive) {
                this._recordHistory(this.initialPhase);
            } else {
                this._presentPhase(this.initialPhase);
            }
        },

        // Retrieves the current operational state of the module
        _getModuleState: function(stateKey) {
            var currentModuleStatus = {
                "configSettings": this.options,
                "visitedPhases": this.visitedPhases,
                "isFinalPhase": this.isFinalPhase,
                "isInitialPhase": this.activePhase === this.initialPhase,
                "priorPhase": this.priorPhase,
                "activePhase": this.activePhase,
                "retreatButton": this.retreatBtn,
                "proceedButton": this.proceedBtn,
                "allPhases": this.phases,
                "initialPhase": this.initialPhase
            }

            if (stateKey !== undefined)
                return currentModuleStatus[stateKey];

            return currentModuleStatus;
        },

        /* Public-facing Methods */

        // Public method to display a specific phase
        displayPhase: function(phaseId) {
            if (this.options.isHistoryActive) {
                this._recordHistory(phaseId);
            } else {
                this._presentPhase(phaseId);
            }
        },

        // Public method to query the module's current status
        getModuleStatus: function(stateKey) {
            return this._getModuleState(stateKey);
        },

        // Public method to reset the module
        revertModule: function() {
            this._revertModule();
        },

        // Public method to advance to the next phase
        advancePhase: function() {
            this._proceed();
        },

        // Public method to go back to the previous phase
        goBackPhase: function() {
            this._goBack();
        },

        // Cleans up the module and restores element states
        disposeModule: function() {
            this.element.find("*").removeAttr("disabled").show();
            this.proceedBtn.unbind("click").val(this.proceedBtnInitialVal).removeClass("ui-state-disabled").addClass("ui-state-active");
            this.retreatBtn.unbind("click").val(this.retreatBtnInitialVal).removeClass("ui-state-disabled").addClass("ui-state-active");
            this.retreatBtnInitialVal = undefined;
            this.proceedBtnInitialVal = undefined;
            this.visitedPhases = undefined;
            this.priorPhase = undefined;
            this.activePhase = undefined;
            this.isFinalPhase = undefined;
            this.options = undefined;
            this.proceedBtn = undefined;
            this.retreatBtn = undefined;
            this.progressionModule = undefined;
            this.element = undefined;
            this.phases = undefined;
            this.initialPhase = undefined;
        },

        // Refreshes the collection of phases and their states
        refreshPhases: function() {
            this.phases = this.element.find(".phase").addClass("ui-progression-content-area");
            this.initialPhase = this.phases.eq(0).attr("uniqueId");
            this.phases.not("#" + this.activePhase).hide().find(":input").addClass("ui-progression-content").attr("disabled", "disabled");
            this._assessFinalStep(this.activePhase);
            this._permitProgression();
            if (!this.options.omitUIStyles) {
                this.phases.addClass("ui-helper-reset ui-corner-all");
                this.phases.find(":input").addClass("ui-helper-reset ui-state-default");
            }
        },

        // Default configuration options for the module
        options: {
            isHistoryActive: false,
            isValidationActive: false,
            validationSettings: undefined,
            isFormPluginActive: false,
            phaseLinkClass: ".phase-link",
            finalPhaseClass: "final_phase",
            backControl: ":reset",
            nextControl: ":submit",
            submitText: 'Finish',
            nextText: 'Continue',
            backText: 'Previous',
            remoteAjaxConfig: undefined,
            entryAnimation: {
                opacity: 'show'
            },
            exitAnimation: {
                opacity: 'hide'
            },
            entryDuration: 450,
            exitDuration: 450,
            animationEasing: 'easeInOutQuad',
            autoFocusFirstInput: false,
            shouldDisableInputs: true,
            formSubmissionOptions: {
                clearForm: true,
                onSuccess: function(data) {
                    if ((window['console'] !== undefined)) {
                        console.log("%s", "Form submission completed successfully.");
                    }
                }
            },
            omitUIStyles: false
        }
    });
})(jQuery);