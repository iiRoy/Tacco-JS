"use strict";

(function(global) {

    class WorkflowProcess {
        _host = null;
        _settings = null;
        _originalSuccess = null;
        _originalComplete = null;
        _originalBeforeSend = null;
        _originalBeforeSubmit = null;
        _originalBeforeSerialize = null;
        _stepPages = [];
        _firstPageId = null;
        _currentActivePageId = null;
        _pastPagesRecord = [];
        _isFinalPage = false;
        _priorPageId = null;
        _forwardBtn = null;
        _backwardBtn = null;
        _forwardBtnInitialText = null;
        _backwardBtnInitialText = null;

        _boundAdvanceHandler = null;
        _boundRevertHandler = null;
        _popstateHandler = null;

        constructor(hostElement, initialSettings) {
            this._host = hostElement;
            this._settings = this._deepMerge({}, WorkflowProcess.defaults, initialSettings);

            this._originalSuccess = this._settings.processOptions.success;
            this._originalComplete = this._settings.processOptions.complete;
            this._originalBeforeSend = this._settings.processOptions.beforeSend;
            this._originalBeforeSubmit = this._settings.processOptions.beforeSubmit;
            this._originalBeforeSerialize = this._settings.processOptions.beforeSerialize;

            this._settings.processOptions = Object.assign({}, this._settings.processOptions, {
                success: (data, status, xhr) => {
                    if (this._originalSuccess) {
                        this._originalSuccess(data, status, xhr);
                    }
                    if (this._settings.processOptions.reset || !this._settings.processOptions.hasOwnProperty('reset')) {
                        this._clearProcess();
                    }
                },
                complete: (xhr, status) => {
                    if (this._originalComplete) {
                        this._originalComplete(xhr, status);
                    }
                    this._activateControls();
                },
                beforeSubmit: (dataArray, formRef, opts) => {
                    if (this._originalBeforeSubmit) {
                        const allowSubmission = this._originalBeforeSubmit(dataArray, formRef, opts);
                        if (!allowSubmission) {
                            this._activateControls();
                        }
                        return allowSubmission;
                    }
                    return true;
                },
                beforeSend: (xhr) => {
                    if (this._originalBeforeSend) {
                        const allowSubmission = this._originalBeforeSend(xhr);
                        if (!allowSubmission) {
                            this._activateControls();
                        }
                        return allowSubmission;
                    }
                    return true;
                },
                beforeSerialize: (formRef, opts) => {
                    if (this._originalBeforeSerialize) {
                        const allowSubmission = this._originalBeforeSerialize(formRef, opts);
                        if (!allowSubmission) {
                            this._activateControls();
                        }
                        return allowSubmission;
                    }
                    return true;
                }
            });

            this._setupProcess();
        }

        _deepMerge(target, ...sources) {
            for (const source of sources) {
                if (source && typeof source === 'object') {
                    for (const key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                                if (!target[key] || typeof target[key] !== 'object') {
                                    target[key] = {};
                                }
                                this._deepMerge(target[key], source[key]);
                            } else {
                                target[key] = source[key];
                            }
                        }
                    }
                }
            }
            return target;
        }

        _setupProcess() {
            if (this._settings.historyMechanism && global.location.hash) {
                const hostId = this._host.getAttribute('id');
                if (hostId && global.location.hash.includes(`_workflow_${hostId}`)) {
                    global.history.replaceState({}, document.title, global.location.pathname + global.location.search);
                }
            }

            this._stepPages = Array.from(this._host.querySelectorAll(".stage-segment"));
            this._stepPages.forEach(page => page.style.display = 'none');

            this._firstPageId = this._stepPages.length > 0 ? this._stepPages[0].dataset.segmentId : undefined;
            this._pastPagesRecord = [];
            this._isFinalPage = false;
            this._priorPageId = undefined;
            this._currentActivePageId = this._firstPageId;

            this._forwardBtn = this._host.querySelector(this._settings.forwardControl);
            this._backwardBtn = this._host.querySelector(this._settings.backwardControl);

            if (this._forwardBtn) {
                this._forwardBtnInitialText = this._forwardBtn.value;
                this._forwardBtn.value = this._settings.textAdvance;
                this._boundAdvanceHandler = this._advanceProcess.bind(this);
                this._forwardBtn.addEventListener('click', this._boundAdvanceHandler);
            }

            if (this._backwardBtn) {
                this._backwardBtnInitialText = this._backwardBtn.value;
                this._backwardBtn.value = this._settings.textRecede;
                this._boundRevertHandler = this._revertProcess.bind(this);
                this._backwardBtn.addEventListener('click', this._boundRevertHandler);
            }

            const hasJQueryValidate = global.jQuery && global.jQuery.fn && global.jQuery.fn.validate;
            if (this._settings.validationSystem && !hasJQueryValidate) {
                this._settings.validationSystem = false;
                if (global.console) {
                    global.console.log("Validation system enabled, but jQuery Validation plugin is not found.");
                }
            } else if (this._settings.validationSystem && hasJQueryValidate) {
                global.jQuery(this._host).validate(this._settings.validationConfig);
            }

            const hasJQueryAjaxSubmit = global.jQuery && global.jQuery.fn && global.jQuery.fn.ajaxSubmit;
            if (this._settings.ajaxFormSubmission && !hasJQueryAjaxSubmit) {
                this._settings.ajaxFormSubmission = false;
                if (global.console) {
                    global.console.log("AJAX form submission enabled, but jQuery Form plugin is not found.");
                }
            }

            if (this._settings.lockInputElements) {
                this._stepPages.forEach(page => {
                    Array.from(page.querySelectorAll("input:not('.ignore-workflow'), textarea:not('.ignore-workflow'), select:not('.ignore-workflow')"))
                         .forEach(input => input.disabled = true);
                });
            }

            if (this._settings.historyMechanism) {
                this._popstateHandler = (event) => {
                    const hostId = this._host.getAttribute('id');
                    const storedStateKey = `_workflow_${hostId}`;
                    const pageIdFromHistory = event.state ? event.state[storedStateKey] : this._firstPageId;

                    if (pageIdFromHistory !== this._currentActivePageId) {
                        if (this._settings.validationSystem && hasJQueryValidate && pageIdFromHistory === this._determineNextPage(this._currentActivePageId) && !global.jQuery(this._host).valid()) {
                            this._synchronizeHistory(this._currentActivePageId);
                            if (global.jQuery(this._host).validate) {
                                global.jQuery(this._host).validate().focusInvalid();
                            }
                            return;
                        }
                        if (pageIdFromHistory !== this._currentActivePageId) {
                            this._displayPage(pageIdFromHistory);
                        }
                    }
                };
                global.addEventListener('popstate', this._popstateHandler);
            }

            this._host.classList.add("workflow-container");
            Array.from(this._host.querySelectorAll("input, textarea, select")).forEach(input => input.classList.add("workflow-field"));
            this._stepPages.forEach(page => page.classList.add("workflow-segment"));
            if (this._backwardBtn) this._backwardBtn.classList.add("workflow-control-btn", "workflow-field");
            if (this._forwardBtn) this._forwardBtn.classList.add("workflow-control-btn", "workflow-field");

            if (!this._settings.suppressStyling) {
                this._host.classList.add("base-reset", "ui-box", "ui-box-content", "base-reset", "rounded-corners");
                Array.from(this._host.querySelectorAll("input, textarea, select")).forEach(input => input.classList.add("base-reset", "ui-state-default"));
                this._stepPages.forEach(page => page.classList.add("base-reset", "rounded-corners"));
                if (this._backwardBtn) this._backwardBtn.classList.add("base-reset", "ui-state-default");
                if (this._forwardBtn) this._forwardBtn.classList.add("base-reset", "ui-state-default");
            }
            this._displayPage(undefined);
            return this;
        }

        _advanceProcess() {
            const hasJQueryValidate = global.jQuery && global.jQuery.fn && global.jQuery.fn.validate;
            if (this._settings.validationSystem && hasJQueryValidate && !global.jQuery(this._host).valid()) {
                if (global.jQuery(this._host).validate) {
                    global.jQuery(this._host).validate().focusInvalid();
                }
                return false;
            }

            if (this._settings.remoteAjaxCalls) {
                const currentRemoteOptions = this._settings.remoteAjaxCalls[this._currentActivePageId];
                if (currentRemoteOptions !== undefined) {
                    const remoteSuccess = currentRemoteOptions.success;
                    const remoteBeforeSend = currentRemoteOptions.beforeSend;
                    const remoteComplete = currentRemoteOptions.complete;
                    const processRef = this;

                    const submitOptions = Object.assign({}, currentRemoteOptions, {
                        success: (data, statusText) => {
                            let proceed = true;
                            if (remoteSuccess !== undefined) {
                                proceed = remoteSuccess(data, statusText);
                            }
                            if (proceed || remoteSuccess === undefined) {
                                processRef._proceedToNextPage();
                            }
                        },
                        beforeSend: (xhr) => {
                            processRef._deactivateControls();
                            if (remoteBeforeSend !== undefined) {
                                remoteBeforeSend(xhr);
                            }
                            processRef._host.dispatchEvent(new CustomEvent('before_remote_ajax_trigger', {
                                detail: {
                                    "activePageId": processRef._currentActivePageId
                                }
                            }));
                        },
                        complete: (xhr, statusText) => {
                            if (remoteComplete !== undefined) {
                                remoteComplete(xhr, statusText);
                            }
                            processRef._host.dispatchEvent(new CustomEvent('after_remote_ajax_trigger', {
                                detail: {
                                    "activePageId": processRef._currentActivePageId
                                }
                            }));
                            processRef._activateControls();
                        }
                    });

                    if (global.jQuery && global.jQuery.fn.ajaxSubmit) {
                        global.jQuery(this._host).ajaxSubmit(submitOptions);
                    } else {
                        if (global.console) global.console.error("jQuery Form plugin required for remoteAjaxCalls but not found.");
                        this._activateControls();
                    }
                    return false;
                }
            }

            return this._proceedToNextPage();
        }

        _revertProcess() {
            if (this._pastPagesRecord.length > 1) {
                const targetPage = this._pastPagesRecord[this._pastPagesRecord.length - 2];
                if (this._settings.historyMechanism) {
                    this._synchronizeHistory(targetPage);
                } else {
                    this._displayPage(targetPage, true);
                }
            }
            return false;
        }

        _proceedToNextPage() {
            if (this._isFinalPage) {
                this._pastPagesRecord.forEach(pageId => {
                    const pageElement = this._stepPages.find(p => p.dataset.segmentId === pageId);
                    if (pageElement) {
                        Array.from(pageElement.querySelectorAll("input:not('.ignore-workflow'), textarea:not('.ignore-workflow'), select:not('.ignore-workflow')"))
                             .forEach(input => input.disabled = false);
                    }
                });

                if (!this._settings.ajaxFormSubmission) {
                    return true;
                } else {
                    this._deactivateControls();
                    if (global.jQuery && global.jQuery.fn.ajaxSubmit) {
                        global.jQuery(this._host).ajaxSubmit(this._settings.processOptions);
                    } else {
                        if (global.console) global.console.error("jQuery Form plugin required for final AJAX form submission but not found.");
                        this._activateControls();
                    }
                    return false;
                }
            }

            const nextPage = this._determineNextPage(this._currentActivePageId);
            if (nextPage === this._currentActivePageId) {
                return false;
            }

            if (this._settings.historyMechanism) {
                this._synchronizeHistory(nextPage);
            } else {
                this._displayPage(nextPage, true);
            }
            return false;
        }

        _synchronizeHistory(pageIdentifier) {
            const hostId = this._host.getAttribute('id');
            const stateObject = {};
            stateObject[`_workflow_${hostId}`] = pageIdentifier;
            global.history.pushState(stateObject, '', `#_workflow_${hostId}_${pageIdentifier}`);
        }

        _deactivateControls() {
            if (this._forwardBtn) this._forwardBtn.disabled = true;
            if (this._backwardBtn) this._backwardBtn.disabled = true;
            if (!this._settings.suppressStyling) {
                if (this._forwardBtn) {
                    this._forwardBtn.classList.remove("ui-state-active");
                    this._forwardBtn.classList.add("ui-state-disabled");
                }
                if (this._backwardBtn) {
                    this._backwardBtn.classList.remove("ui-state-active");
                    this._backwardBtn.classList.add("ui-state-disabled");
                }
            }
        }

        _activateControls() {
            if (this._isFinalPage) {
                if (this._forwardBtn) this._forwardBtn.value = this._settings.textFinalSubmit;
            } else {
                if (this._forwardBtn) this._forwardBtn.value = this._settings.textAdvance;
            }

            const firstPageId = this._stepPages.length > 0 ? this._stepPages[0].dataset.segmentId : '';
            if (this._currentActivePageId && this._currentActivePageId.trim() !== firstPageId) {
                if (this._backwardBtn) this._backwardBtn.disabled = false;
                if (!this._settings.suppressStyling) {
                    if (this._backwardBtn) {
                        this._backwardBtn.classList.remove("ui-state-disabled");
                        this._backwardBtn.classList.add("ui-state-active");
                    }
                }
            } else {
                if (this._backwardBtn) this._backwardBtn.disabled = true;
                if (!this._settings.suppressStyling) {
                    if (this._backwardBtn) {
                        this._backwardBtn.classList.remove("ui-state-active");
                        this._backwardBtn.classList.add("ui-state-disabled");
                    }
                }
            }

            if (this._forwardBtn) this._forwardBtn.disabled = false;
            if (!this._settings.suppressStyling) {
                if (this._forwardBtn) {
                    this._forwardBtn.classList.remove("ui-state-disabled");
                    this._forwardBtn.classList.add("ui-state-active");
                }
            }
        }

        _transitionPage(oldPageId, newPageId, completionCallback) {
            this._deactivateControls();
            const oldPage = this._stepPages.find(p => p.dataset.segmentId === oldPageId);
            const newPage = this._stepPages.find(p => p.dataset.segmentId === newPageId);

            const animateIn = () => {
                if (newPage) {
                    Array.from(newPage.querySelectorAll("input:not('.ignore-workflow'), textarea:not('.ignore-workflow'), select:not('.ignore-workflow')"))
                         .forEach(input => input.disabled = false);

                    newPage.style.transition = `opacity ${this._settings.inDuration / 1000}s ${this._settings.easing}`;
                    newPage.style.opacity = '0';
                    newPage.style.display = 'block';

                    void newPage.offsetWidth;

                    newPage.style.opacity = '1';

                    setTimeout(() => {
                        if (this._settings.focusFirstInput) {
                            const firstInput = newPage.querySelector("input, textarea, select");
                            if (firstInput) firstInput.focus();
                        }
                        this._activateControls();
                        if (completionCallback) completionCallback.call(this);
                    }, this._settings.inDuration);
                } else {
                    this._activateControls();
                    if (completionCallback) completionCallback.call(this);
                }
            };

            const animateOut = () => {
                if (oldPage) {
                    Array.from(oldPage.querySelectorAll("input:not('.ignore-workflow'), textarea:not('.ignore-workflow'), select:not('.ignore-workflow')"))
                         .forEach(input => input.disabled = true);

                    oldPage.style.transition = `opacity ${this._settings.outDuration / 1000}s ${this._settings.easing}`;
                    oldPage.style.opacity = '0';

                    setTimeout(() => {
                        oldPage.style.display = 'none';
                        animateIn();
                    }, this._settings.outDuration);
                } else {
                    animateIn();
                }
            };

            animateOut();
        }

        _assessFinalPageStatus(pageIdentifier) {
            this._isFinalPage = false;
            const currentPage = this._stepPages.find(p => p.dataset.segmentId === pageIdentifier);
            if (currentPage && (currentPage.classList.contains(this._settings.finalStepClass) || (this._stepPages.length > 0 && this._stepPages[this._stepPages.length - 1].dataset.segmentId === pageIdentifier))) {
                this._isFinalPage = true;
            }
        }

        _retrievePageLink(pageIdentifier) {
            const currentPage = this._stepPages.find(p => p.dataset.segmentId === pageIdentifier);
            if (!currentPage) return undefined;

            const linkElements = currentPage.querySelectorAll(this._settings.jumpLinkClass);
            if (linkElements.length > 0) {
                const radioCheckLinks = Array.from(linkElements).filter(el => el.type === 'radio' || el.type === 'checkbox');
                if (radioCheckLinks.length > 0) {
                    const checkedLink = radioCheckLinks.find(el => el.checked);
                    return checkedLink ? checkedLink.value : undefined;
                } else {
                    const firstLink = linkElements[0];
                    return firstLink ? (firstLink.value || firstLink.textContent) : undefined;
                }
            }
            return undefined;
        }

        _determineNextPage(currentPageIdentifier) {
            const directLink = this._retrievePageLink(currentPageIdentifier);
            if (directLink !== undefined && directLink.trim() !== "") {
                const targetPage = this._stepPages.find(p => p.dataset.segmentId === directLink);
                if (targetPage) {
                    return directLink;
                }
                return currentPageIdentifier;
            } else if (!this._isFinalPage) {
                const currentPageIndex = this._stepPages.findIndex(p => p.dataset.segmentId === currentPageIdentifier);
                if (currentPageIndex !== -1 && currentPageIndex < this._stepPages.length - 1) {
                    return this._stepPages[currentPageIndex + 1].dataset.segmentId;
                }
            }
            return currentPageIdentifier;
        }

        _displayPage(pageIdentifier) {
            const triggerPageDisplayEvents = pageIdentifier !== undefined;
            let backwardsMovement = false;

            if (pageIdentifier === undefined || pageIdentifier === "") {
                this._pastPagesRecord = [this._firstPageId];
                pageIdentifier = this._firstPageId;
            } else {
                const indexInRecord = this._pastPagesRecord.indexOf(pageIdentifier);
                if (indexInRecord > -1) {
                    backwardsMovement = true;
                    this._pastPagesRecord.splice(indexInRecord + 1);
                } else {
                    this._pastPagesRecord.push(pageIdentifier);
                }
            }

            if (this._currentActivePageId !== pageIdentifier || pageIdentifier === this._firstPageId) {
                this._priorPageId = this._currentActivePageId;
                this._assessFinalPageStatus(pageIdentifier);
                this._currentActivePageId = pageIdentifier;

                const displayCompletionCallback = () => {
                    if (triggerPageDisplayEvents) {
                        this._host.dispatchEvent(new CustomEvent('page_shown', {
                            detail: {
                                "isBackwardNavigation": backwardsMovement,
                                ...this._getCurrentStatus()
                            }
                        }));
                    }
                };

                if (triggerPageDisplayEvents) {
                    this._host.dispatchEvent(new CustomEvent('before_page_shown', {
                        detail: {
                            "isBackwardNavigation": backwardsMovement,
                            ...this._getCurrentStatus()
                        }
                    }));
                }
                this._transitionPage(this._priorPageId, pageIdentifier, displayCompletionCallback);
            }
        }

        _clearProcess() {
            if (global.jQuery && global.jQuery.fn.resetForm) {
                global.jQuery(this._host).resetForm();
            } else {
                if (this._host.tagName === 'FORM') {
                    this._host.reset();
                } else {
                    Array.from(this._host.querySelectorAll('input, textarea, select')).forEach(input => {
                        if (input.type === 'checkbox' || input.type === 'radio') {
                            input.checked = false;
                        } else {
                            input.value = '';
                        }
                    });
                }
            }

            Array.from(this._host.querySelectorAll("label, input, textarea")).forEach(el => el.classList.remove("error-field"));

            this._pastPagesRecord.forEach(pageId => {
                const pageElement = this._stepPages.find(p => p.dataset.segmentId === pageId);
                if (pageElement) {
                    pageElement.style.display = 'none';
                    Array.from(pageElement.querySelectorAll("input:not('.ignore-workflow'), textarea:not('.ignore-workflow'), select:not('.ignore-workflow')"))
                         .forEach(input => input.disabled = true);
                }
            });

            this._pastPagesRecord = [];
            this._priorPageId = undefined;
            this._isFinalPage = false;

            if (this._settings.historyMechanism) {
                this._synchronizeHistory(this._firstPageId);
            } else {
                this._displayPage(this._firstPageId);
            }
        }

        _getCurrentStatus(statusKey) {
            const currentStatus = {
                "configuration": this._settings,
                "visitedPages": this._pastPagesRecord,
                "isFinalProcessStep": this._isFinalPage,
                "isInitialProcessStep": this._currentActivePageId === this._firstPageId,
                "previousProcessStep": this._priorPageId,
                "currentProcessStep": this._currentActivePageId,
                "recedeButton": this._backwardBtn,
                "advanceButton": this._forwardBtn,
                "processPages": this._stepPages,
                "initialProcessStep": this._firstPageId
            };

            if (statusKey !== undefined) {
                return currentStatus[statusKey];
            }
            return currentStatus;
        }

        display(pageIdentifier) {
            if (this._settings.historyMechanism) {
                this._synchronizeHistory(pageIdentifier);
            } else {
                this._displayPage(pageIdentifier);
            }
        }

        status(statusKey) {
            return this._getCurrentStatus(statusKey);
        }

        clear() {
            this._clearProcess();
        }

        advance() {
            this._advanceProcess();
        }

        revert() {
            this._revertProcess();
        }

        terminate() {
            if (this._forwardBtn && this._boundAdvanceHandler) {
                this._forwardBtn.removeEventListener('click', this._boundAdvanceHandler);
            }
            if (this._backwardBtn && this._boundRevertHandler) {
                this._backwardBtn.removeEventListener('click', this._boundRevertHandler);
            }
            if (this._settings.historyMechanism && this._popstateHandler) {
                global.removeEventListener('popstate', this._popstateHandler);
            }

            Array.from(this._host.querySelectorAll("*")).forEach(el => {
                if (el.disabled !== undefined) el.disabled = false;
                el.style.display = '';
                el.style.opacity = '';
                el.style.transition = '';
            });

            if (this._forwardBtn) {
                this._forwardBtn.value = this._forwardBtnInitialText;
                this._forwardBtn.classList.remove("ui-state-disabled", "ui-state-active", "workflow-control-btn", "workflow-field", "base-reset", "ui-state-default");
            }
            if (this._backwardBtn) {
                this._backwardBtn.value = this._backwardBtnInitialText;
                this._backwardBtn.classList.remove("ui-state-disabled", "ui-state-active", "workflow-control-btn", "workflow-field", "base-reset", "ui-state-default");
            }

            this._host.classList.remove("workflow-container", "base-reset", "ui-box", "ui-box-content", "rounded-corners");
            Array.from(this._host.querySelectorAll("input, textarea, select")).forEach(input => input.classList.remove("workflow-field", "base-reset", "ui-state-default"));
            this._stepPages.forEach(page => page.classList.remove("workflow-segment", "base-reset", "rounded-corners"));

            if (global.jQuery) {
                global.jQuery(this._host).removeData('workflow-processor');
            }

            this._pastPagesRecord = undefined;
            this._priorPageId = undefined;
            this._currentActivePageId = undefined;
            this._isFinalPage = undefined;
            this._settings = undefined;
            this._forwardBtn = undefined;
            this._backwardBtn = undefined;
            this._host = undefined;
            this._stepPages = undefined;
            this._firstPageId = undefined;
            this._boundAdvanceHandler = undefined;
            this._boundRevertHandler = undefined;
            this._popstateHandler = undefined;
        }

        refreshPages() {
            this._stepPages = Array.from(this._host.querySelectorAll(".stage-segment"));
            this._stepPages.forEach(page => page.classList.add("workflow-segment"));
            this._firstPageId = this._stepPages.length > 0 ? this._stepPages[0].dataset.segmentId : undefined;

            this._stepPages.filter(p => p.dataset.segmentId !== this._currentActivePageId)
                           .forEach(page => {
                               page.style.display = 'none';
                               Array.from(page.querySelectorAll("input, textarea, select")).forEach(input => input.classList.add("workflow-field"));
                               Array.from(page.querySelectorAll("input:not('.ignore-workflow'), textarea:not('.ignore-workflow'), select:not('.ignore-workflow')"))
                                    .forEach(input => input.disabled = true);
                           });

            this._assessFinalPageStatus(this._currentActivePageId);
            this._activateControls();

            if (!this._settings.suppressStyling) {
                this._stepPages.forEach(page => page.classList.add("base-reset", "rounded-corners"));
                this._stepPages.forEach(page => Array.from(page.querySelectorAll("input, textarea, select")).forEach(input => input.classList.add("base-reset", "ui-state-default")));
            }
        }
    }

    WorkflowProcess.defaults = {
        historyMechanism: false,
        validationSystem: false,
        validationConfig: undefined,
        ajaxFormSubmission: false,
        jumpLinkClass: ".jump-target",
        finalStepClass: "final-stage",
        backwardControl: "[data-role='recede']",
        forwardControl: "[data-role='advance']",
        textFinalSubmit: 'Complete',
        textAdvance: 'Continue',
        textRecede: 'Previous',
        remoteAjaxCalls: undefined,
        inTransition: { opacity: 'show' },
        outTransition: { opacity: 'hide' },
        inDuration: 400,
        outDuration: 400,
        easing: 'ease-in-out',
        focusFirstInput: false,
        lockInputElements: true,
        processOptions: {
            reset: true,
            success: function(data) {
                if (global.console) {
                    global.console.log("Form submission successful (default handler).");
                }
            }
        },
        suppressStyling: false
    };

    if (global.jQuery) {
        global.jQuery.fn.extend({
            workflowProcessor: function(option, ...args) {
                const elements = this;
                let methodResult;

                elements.each(function() {
                    const $this = global.jQuery(this);
                    let instance = $this.data('workflow-processor');

                    if (!instance) {
                        instance = new WorkflowProcess(this, typeof option === 'object' ? option : {});
                        $this.data('workflow-processor', instance);
                    }

                    if (typeof option === 'string' && typeof instance[option] === 'function') {
                        methodResult = instance[option](...args);
                        if (methodResult !== undefined) {
                            return false;
                        }
                    }
                });

                return methodResult !== undefined ? methodResult : elements;
            }
        });
    }

})(window);