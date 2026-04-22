function attachEphemeralListener(targetNode, eventKind, handlerRoutine) {
    var wrappedRoutine = function(evt) {
        handlerRoutine(evt);
        targetNode.removeEventListener(eventKind, wrappedRoutine);
    };
    targetNode.addEventListener(eventKind, wrappedRoutine);
}

function dispatchCustomSignal(targetNode, signalName, detailPayload) {
    var signalInstance;
    try {
        signalInstance = new CustomEvent(signalName, { bubbles: true, cancelable: true, detail: detailPayload });
    } catch (e) {
        signalInstance = document.createEvent('CustomEvent');
        signalInstance.initCustomEvent(signalName, true, true, detailPayload);
    }
    targetNode.dispatchEvent(signalInstance);
}

var InteractionEngine = (function() {
    "use strict";

    var utilityToolkit = {};

    utilityToolkit.MotionTracker = (function() {
        var rootElementStyle = (document.body || document.documentElement).style;
        var propertyMappings = {
            'transition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'msTransition': 'MSTransitionEnd',
            'OTransition': 'oTransitionEnd'
        };

        for (var prop in propertyMappings) {
            if (rootElementStyle[prop] !== undefined) {
                return {
                    motionCapable: true,
                    motionCompletionEvent: propertyMappings[prop]
                };
            }
        }
        return { motionCapable: false, motionCompletionEvent: null };
    })();

    utilityToolkit.DialogController = (function() {
        var defaultConfiguration = {
            hasCurtain: true,
            respondToEscape: true,
            initialDisplay: true
        };

        function DialogController(contentContainer, configOptions) {
            this.settings = Object.assign({}, defaultConfiguration, configOptions);
            this.interfaceElement = contentContainer;
            this.isDisplayed = false;
            this.curtainElement = null;
            this.keyboardHandler = null;

            this.interfaceElement.addEventListener('click', function(evt) {
                if (evt.target.closest('[data-action-dismiss="dialogbox"]')) {
                    evt.preventDefault();
                    this.conceal();
                }
            }.bind(this));
        }

        DialogController.prototype.toggleVisibility = function() {
            return this[!this.isDisplayed ? 'reveal' : 'conceal']();
        };

        DialogController.prototype.reveal = function() {
            var selfRef = this;
            if (this.isDisplayed) return;

            document.body.classList.add('dialog-active-body');
            this.isDisplayed = true;
            dispatchCustomSignal(this.interfaceElement, 'dialog:showing');

            this.configureKeyboardExit();
            this.manageCurtain(function() {
                var useMotion = utilityToolkit.MotionTracker.motionCapable && selfRef.interfaceElement.classList.contains('animated-element');

                if (!selfRef.interfaceElement.parentNode) {
                    document.body.appendChild(selfRef.interfaceElement);
                }

                selfRef.interfaceElement.style.display = 'block';

                if (useMotion) {
                    selfRef.interfaceElement.offsetWidth;
                }

                selfRef.interfaceElement.classList.add('is-active');

                if (useMotion) {
                    attachEphemeralListener(selfRef.interfaceElement, utilityToolkit.MotionTracker.motionCompletionEvent, function() {
                        dispatchCustomSignal(selfRef.interfaceElement, 'dialog:shown');
                    });
                } else {
                    dispatchCustomSignal(selfRef.interfaceElement, 'dialog:shown');
                }
            });
        };

        DialogController.prototype.conceal = function(evt) {
            if (evt) evt.preventDefault();
            if (!this.isDisplayed) return;

            var selfRef = this;
            this.isDisplayed = false;

            document.body.classList.remove('dialog-active-body');
            this.removeKeyboardExit();

            dispatchCustomSignal(this.interfaceElement, 'dialog:hiding');
            this.interfaceElement.classList.remove('is-active');

            if (utilityToolkit.MotionTracker.motionCapable && this.interfaceElement.classList.contains('animated-element')) {
                this.executeConcealmentWithMotion();
            } else {
                this.performImmediateConcealment();
            }
        };

        DialogController.prototype.executeConcealmentWithMotion = function() {
            var selfRef = this;
            var motionTimeout = setTimeout(function() {
                selfRef.interfaceElement.removeEventListener(utilityToolkit.MotionTracker.motionCompletionEvent, arguments.callee);
                selfRef.performImmediateConcealment();
            }, 500);

            attachEphemeralListener(this.interfaceElement, utilityToolkit.MotionTracker.motionCompletionEvent, function() {
                clearTimeout(motionTimeout);
                selfRef.performImmediateConcealment();
            });
        };

        DialogController.prototype.performImmediateConcealment = function() {
            this.interfaceElement.style.display = 'none';
            dispatchCustomSignal(this.interfaceElement, 'dialog:hidden');
            this.manageCurtain();
        };

        DialogController.prototype.manageCurtain = function(completionCallback) {
            var selfRef = this;
            var isAnimated = this.interfaceElement.classList.contains('animated-element') ? 'animated-element' : '';

            if (this.isDisplayed && this.settings.hasCurtain) {
                var applyAnimation = utilityToolkit.MotionTracker.motionCapable && isAnimated;

                this.curtainElement = document.createElement('div');
                this.curtainElement.className = 'dialog-background ' + isAnimated;
                document.body.appendChild(this.curtainElement);

                if (this.settings.hasCurtain !== 'static') {
                    this.curtainElement.addEventListener('click', this.conceal.bind(this));
                }

                if (applyAnimation) this.curtainElement.offsetWidth;

                this.curtainElement.classList.add('is-active');

                if (applyAnimation) {
                    attachEphemeralListener(this.curtainElement, utilityToolkit.MotionTracker.motionCompletionEvent, completionCallback);
                } else {
                    if (completionCallback) completionCallback();
                }

            } else if (!this.isDisplayed && this.curtainElement) {
                this.curtainElement.classList.remove('is-active');

                if (utilityToolkit.MotionTracker.motionCapable && this.interfaceElement.classList.contains('animated-element')) {
                    attachEphemeralListener(this.curtainElement, utilityToolkit.MotionTracker.motionCompletionEvent, this.removeCurtainElement.bind(this));
                } else {
                    this.removeCurtainElement();
                }

            } else {
                if (completionCallback) completionCallback();
            }
        };

        DialogController.prototype.removeCurtainElement = function() {
            if (this.curtainElement && this.curtainElement.parentNode) {
                this.curtainElement.parentNode.removeChild(this.curtainElement);
            }
            this.curtainElement = null;
        };

        DialogController.prototype.configureKeyboardExit = function() {
            var selfRef = this;
            if (this.isDisplayed && this.settings.respondToEscape) {
                this.keyboardHandler = function(e) {
                    if (e.which === 27) {
                        selfRef.conceal();
                    }
                };
                document.addEventListener('keyup', this.keyboardHandler);
            } else if (!this.isDisplayed && this.keyboardHandler) {
                document.removeEventListener('keyup', this.keyboardHandler);
                this.keyboardHandler = null;
            }
        };

        DialogController.prototype.removeKeyboardExit = function() {
             if (this.keyboardHandler) {
                document.removeEventListener('keyup', this.keyboardHandler);
                this.keyboardHandler = null;
            }
        };

        return DialogController;
    })();

    utilityToolkit.MenuActivator = (function() {
        var menuTriggerSelector = '[data-action-toggle="menu"]';

        function MenuActivator(elementNode) {
            this.triggerNode = elementNode;
            this.triggerNode.addEventListener('click', this.toggleMenuDisplay.bind(this));
        }

        MenuActivator.prototype.toggleMenuDisplay = function(evt) {
            var triggeredElement = this.triggerNode;
            var targetSelector = triggeredElement.dataset.targetElement;
            var containingElement;

            if (!targetSelector) {
                targetSelector = triggeredElement.getAttribute('href');
                if (targetSelector && targetSelector.includes('#')) {
                    targetSelector = targetSelector.substring(targetSelector.indexOf('#'));
                }
            }

            if (targetSelector && targetSelector !== '#') {
                containingElement = document.querySelector(targetSelector);
            }

            if (!containingElement) {
                containingElement = triggeredElement.parentNode;
            }

            var isActive = containingElement.classList.contains('active-menu-container');

            utilityToolkit.MenuActivator.closeAllMenus();

            if (!isActive) {
                containingElement.classList.add('active-menu-container');
            }
            if (evt) evt.preventDefault();
        };

        MenuActivator.closeAllMenus = function() {
            document.querySelectorAll('.active-menu-container').forEach(function(el) {
                el.classList.remove('active-menu-container');
            });
        };

        return MenuActivator;
    })();

    utilityToolkit.ViewTracker = (function() {
        var defaultViewSettings = {
            offsetAdjust: 10
        };

        function ViewTracker(monitoredElement, settingsPayload) {
            var selfRef = this;
            this.configuration = Object.assign({}, defaultViewSettings, settingsPayload);
            this.observationTarget = (monitoredElement === document.body) ? window : monitoredElement;
            this.currentActiveIdentifier = null;
            this.sectionBoundaries = [];
            this.sectionIdentifiers = [];

            this.boundProcessRoutine = this.evaluateScrollPosition.bind(this);
            this.observationTarget.addEventListener('scroll', this.boundProcessRoutine);

            document.body.addEventListener('click', function(evt) {
                var targetLink = evt.target.closest(selfRef.configuration.navigationSelector + ' li > a');
                if (targetLink && targetLink.hash && targetLink.hash.startsWith('#')) {
                    selfRef.evaluateScrollPosition();
                }
            });

            this.updateTargets();
            this.evaluateScrollPosition();
        }

        ViewTracker.prototype.updateTargets = function() {
            var navLinks = document.querySelectorAll(this.configuration.navigationSelector + ' li > a');
            var identifiersList = [];
            var positionsList = [];

            Array.prototype.forEach.call(navLinks, function(link) {
                var sectionRef = link.getAttribute('href');
                if (sectionRef && sectionRef.startsWith('#') && sectionRef.length > 1) {
                    var targetSection = document.querySelector(sectionRef);
                    if (targetSection) {
                        identifiersList.push(sectionRef);
                        positionsList.push(targetSection.getBoundingClientRect().top + window.pageYOffset);
                    }
                }
            });

            this.sectionIdentifiers = identifiersList;
            this.sectionBoundaries = positionsList;
        };

        ViewTracker.prototype.evaluateScrollPosition = function() {
            var currentVerticalPosition = (this.observationTarget === window ? window.pageYOffset : this.observationTarget.scrollTop) + this.configuration.offsetAdjust;
            var boundaries = this.sectionBoundaries;
            var identifiers = this.sectionIdentifiers;
            var previousActive = this.currentActiveIdentifier;
            var index;

            for (index = boundaries.length - 1; index >= 0; index--) {
                var lowerLimit = boundaries[index];
                var upperLimit = boundaries[index + 1] || Infinity;

                if (previousActive !== identifiers[index] && currentVerticalPosition >= lowerLimit && currentVerticalPosition < upperLimit) {
                    this.highlightSegment(identifiers[index]);
                    break;
                }
            }
        };

        ViewTracker.prototype.highlightSegment = function(segmentIdentifier) {
            if (this.currentActiveIdentifier === segmentIdentifier) return;

            this.currentActiveIdentifier = segmentIdentifier;

            document.querySelectorAll(this.configuration.navigationSelector + ' .active-section-link').forEach(function(el) {
                el.classList.remove('active-section-link');
            });
            document.querySelectorAll(this.configuration.navigationSelector + ' .menu-element-container.active-section-link').forEach(function(el) {
                el.classList.remove('active-section-link');
            });

            var associatedLink = document.querySelector(this.configuration.navigationSelector + ' a[href="' + segmentIdentifier + '"]');
            if (associatedLink) {
                var parentItem = associatedLink.parentNode;
                if (parentItem && parentItem.tagName === 'LI') {
                    parentItem.classList.add('active-section-link');
                    var dropdownContainer = parentItem.closest('li.menu-element-container');
                    if (dropdownContainer) {
                        dropdownContainer.classList.add('active-section-link');
                    }
                }
            }
        };

        return ViewTracker;
    })();

    utilityToolkit.controlDialog = function(targetElement, option) {
        var existingInstance = targetElement.associatedDialog;
        var settings = Object.assign({}, targetElement.dataset, (typeof option === 'object' ? option : {}));

        if (!existingInstance) {
            existingInstance = new utilityToolkit.DialogController(targetElement, settings);
            targetElement.associatedDialog = existingInstance;
        }

        if (typeof option === 'string' && existingInstance[option]) {
            existingInstance[option]();
        } else if (settings.initialDisplay) {
            existingInstance.reveal();
        }
        return existingInstance;
    };

    utilityToolkit.controlMenu = function(targetElement, option) {
        var existingInstance = targetElement.associatedMenu;
        if (!existingInstance) {
            existingInstance = new utilityToolkit.MenuActivator(targetElement);
            targetElement.associatedMenu = existingInstance;
        }
        if (typeof option === 'string' && existingInstance[option]) {
            existingInstance[option]();
        } else {
            existingInstance.toggleMenuDisplay();
        }
        return existingInstance;
    };

    utilityToolkit.controlViewMonitor = function(targetElement, option) {
        var existingInstance = targetElement.associatedViewTracker;
        var settings = Object.assign({}, targetElement.dataset, (typeof option === 'object' ? option : {}));

        if (!settings.navigationSelector) {
            settings.navigationSelector = targetElement.dataset.navigationTarget || '';
        }

        if (!existingInstance) {
            existingInstance = new utilityToolkit.ViewTracker(targetElement, settings);
            targetElement.associatedViewTracker = existingInstance;
        }
        if (typeof option === 'string' && existingInstance[option]) {
            existingInstance[option]();
        }
        return existingInstance;
    };


    document.addEventListener('DOMContentLoaded', function() {
        document.body.addEventListener('click', function(evt) {
            var triggerElement = evt.target.closest('[data-action-toggle="dialog"]');
            if (triggerElement) {
                evt.preventDefault();
                var targetElementSelector = triggerElement.dataset.targetDialog || (triggerElement.href && triggerElement.href.replace(/.*(?=#[^\s]+$)/, ''));
                if (!targetElementSelector) return;

                var targetDialogElement = document.querySelector(targetElementSelector);
                if (!targetDialogElement) return;

                var existingDialog = targetDialogElement.associatedDialog;
                var dialogSettings = Object.assign({}, targetDialogElement.dataset, triggerElement.dataset);

                if (!existingDialog) {
                    existingDialog = new utilityToolkit.DialogController(targetDialogElement, dialogSettings);
                    targetDialogElement.associatedDialog = existingDialog;
                }

                if (dialogSettings.initialDisplay === 'true' || dialogSettings.dialogAction === 'toggle') {
                    existingDialog.toggleVisibility();
                } else if (dialogSettings.dialogAction === 'show') {
                    existingDialog.reveal();
                } else if (dialogSettings.dialogAction === 'hide') {
                    existingDialog.conceal();
                } else {
                    existingDialog.reveal();
                }
            }
        });

        document.body.addEventListener('click', function(evt) {
            var menuTrigger = evt.target.closest(utilityToolkit.MenuActivator.menuTriggerSelector);
            if (menuTrigger) {
                var menuInstance = menuTrigger.associatedMenu;
                if (!menuInstance) {
                    menuInstance = new utilityToolkit.MenuActivator(menuTrigger);
                    menuTrigger.associatedMenu = menuInstance;
                }
                menuInstance.toggleMenuDisplay(evt);
            }
        });

        document.documentElement.addEventListener('click', function(evt) {
            if (!evt.target.closest('.active-menu-container')) {
                utilityToolkit.MenuActivator.closeAllMenus();
            }
        });

        document.querySelectorAll('[data-track-view="true"]').forEach(function(element) {
            var viewSettings = Object.assign({}, element.dataset);
            viewSettings.navigationSelector = viewSettings.navigationTarget || '';

            if (!viewSettings.navigationSelector) {
                console.warn('ViewTracker requires a "data-navigation-target" attribute.');
                return;
            }

            var existingTracker = element.associatedViewTracker;
            if (!existingTracker) {
                existingTracker = new utilityToolkit.ViewTracker(element, viewSettings);
                element.associatedViewTracker = existingTracker;
            }
        });
    });

    return utilityToolkit;
})();

window.ComponentInterface = InteractionEngine;