const DOM_UTILITIES = (() => {
    const getRect = (element) => element.getBoundingClientRect();

    return {
        matches: (element, selector) => {
            if (typeof selector === 'function') {
                return selector.call(element);
            }
            if (element.matches) {
                return element.matches(selector);
            }
            const documentMatches = (element.document || element.ownerDocument).querySelectorAll(selector);
            let i = documentMatches.length;
            while (--i >= 0 && documentMatches.item(i) !== element) {}
            return i > -1;
        },

        offset: (element) => {
            const rect = getRect(element);
            return {
                top: rect.top + window.pageYOffset,
                left: rect.left + window.pageXOffset
            };
        },

        outerHeight: (element) => {
            const style = getComputedStyle(element);
            return element.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
        },

        outerWidth: (element) => {
            const style = getComputedStyle(element);
            return element.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        },

        addClass: (element, className) => element.classList.add(className),
        removeClass: (element, className) => element.classList.remove(className),

        elementData: new WeakMap(),
        getData: (element, key) => {
            const elementMap = DOM_UTILITIES.elementData.get(element);
            return elementMap ? elementMap[key] : undefined;
        },
        setData: (element, key, value) => {
            let elementMap = DOM_UTILITIES.elementData.get(element);
            if (!elementMap) {
                elementMap = {};
                DOM_UTILITIES.elementData.set(element, elementMap);
            }
            elementMap[key] = value;
        },
        removeData: (element, key) => {
            const elementMap = DOM_UTILITIES.elementData.get(element);
            if (elementMap) {
                delete elementMap[key];
            }
        },

        on: (element, eventName, handler) => {
            element.addEventListener(eventName, handler);
        },
        off: (element, eventName, handler) => {
            element.removeEventListener(eventName, handler);
        },
        trigger: (element, eventName, detail = null) => {
            const event = new CustomEvent(eventName, {
                bubbles: true,
                cancelable: true,
                detail: detail
            });
            return element.dispatchEvent(event);
        }
    };
})();

const GLOBAL_VALIDATION_REGISTRY = (() => {
    const internalConfiguration = {
        groupErrors: false,
        displayEffect: 'default',
        errorIndicatorClass: 'invalid-field',
        inputValidationTrigger: null,
        errorInputValidationTrigger: 'keyup',
        formSubmissionTrigger: 'submit',
        defaultLanguage: 'en',
        errorMessageTemplate: '<div></div>',
        messageAttributeName: 'data-validation-message',
        errorMessageClass: 'error-message',
        messageOffset: [0, 0],
        messagePlacement: 'center right',
        singleErrorPerInput: false,
        animationSpeed: 'normal'
    };

    const validationMessagesStore = new Map();
    const validationRulesStore = [];
    const validationEffectsStore = new Map();

    const typeAttributeRegex = /\[type=([a-z]+)\]/;
    const numberFormatRegex = /^-?[0-9]*(\.[0-9]+)?$/;
    const emailFormatRegex = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i;
    const urlFormatRegex = /^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/i;

    validationMessagesStore.set('*', new Map([['en', 'Please correct this value']]));

    const createTypeMatcher = (typeValue) => {
        const typeFunction = function() {
            return this.getAttribute("type") === typeValue;
        };
        typeFunction.ruleKey = `[type=${typeValue}]`;
        return typeFunction;
    };

    validationEffectsStore.set('default', {
        show: (errors, formValidatorInstance) => {
            const currentConf = formValidatorInstance.getSettings();
            errors.forEach(error => {
                const inputElement = error.input;
                DOM_UTILITIES.addClass(inputElement, currentConf.errorIndicatorClass);

                let msgContainer = DOM_UTILITIES.getData(inputElement, "validation.msg.element");

                if (!msgContainer) {
                    msgContainer = document.createElement('div');
                    msgContainer.className = currentConf.errorMessageClass;
                    document.body.appendChild(msgContainer);
                    DOM_UTILITIES.setData(inputElement, "validation.msg.element", msgContainer);
                }

                msgContainer.style.visibility = 'hidden';
                msgContainer.innerHTML = '';

                error.messages.forEach(msgText => {
                    const span = document.createElement('span');
                    span.innerHTML = msgText;
                    msgContainer.appendChild(span);
                });

                if (msgContainer.children.length > 1) {
                    Array.from(msgContainer.children).forEach(child => {
                        if (child.tagName === 'SPAN') {
                            child.style.display = 'block';
                        }
                    });
                } else if (msgContainer.children.length === 1 && msgContainer.firstElementChild.tagName === 'SPAN') {
                    msgContainer.firstElementChild.style.display = 'inline';
                }

                const position = calculateMessagePosition(inputElement, msgContainer, currentConf);

                msgContainer.style.position = 'absolute';
                msgContainer.style.top = `${position.top}px`;
                msgContainer.style.left = `${position.left}px`;
                msgContainer.style.visibility = 'visible';
                msgContainer.style.display = 'none';

                let opacity = 0;
                msgContainer.style.opacity = opacity;
                msgContainer.style.transition = `opacity ${currentConf.animationSpeed === 'normal' ? '0.4s' : currentConf.animationSpeed === 'fast' ? '0.2s' : '0.8s'} ease-in-out`;
                msgContainer.style.display = 'block';

                setTimeout(() => {
                    msgContainer.style.opacity = 1;
                }, 10);
            });
        },
        hide: (inputElements, formValidatorInstance) => {
            const currentConf = formValidatorInstance.getSettings();
            inputElements.forEach(input => {
                DOM_UTILITIES.removeClass(input, currentConf.errorIndicatorClass);
                const msgContainer = DOM_UTILITIES.getData(input, "validation.msg.element");
                if (msgContainer) {
                    msgContainer.style.opacity = 0;
                    setTimeout(() => {
                        msgContainer.style.visibility = 'hidden';
                        msgContainer.style.display = 'none';
                    }, currentConf.animationSpeed === 'normal' ? 400 : currentConf.animationSpeed === 'fast' ? 200 : 800);
                }
            });
        }
    });

    function calculateMessagePosition(triggerElement, messageElement, config) {
        const triggerOffset = DOM_UTILITIES.offset(triggerElement);
        const messageHeight = DOM_UTILITIES.outerHeight(messageElement);
        const triggerHeight = DOM_UTILITIES.outerHeight(triggerElement);
        const triggerWidth = DOM_UTILITIES.outerWidth(triggerElement);

        let top = triggerOffset.top - messageHeight + config.messageOffset[0];
        let left = triggerOffset.left + triggerWidth + config.messageOffset[1];

        const [yPos, xPos] = config.messagePlacement.split(/,?\s+/);

        if (yPos === 'center') {
            top += (messageHeight + triggerHeight) / 2;
        } else if (yPos === 'bottom') {
            top += (messageHeight + triggerHeight);
        }

        if (xPos === 'center') {
            left -= (triggerWidth + DOM_UTILITIES.outerWidth(messageElement)) / 2;
        } else if (xPos === 'left') {
            left -= triggerWidth;
        }

        return { top, left };
    }

    function getFormattedMessage(ruleKey, returnValue, currentConf) {
        let msgMap = validationMessagesStore.get(ruleKey) || validationMessagesStore.get('*');
        let messageText = msgMap.get(currentConf.defaultLanguage) || validationMessagesStore.get('*').get('en');

        if (Array.isArray(returnValue)) {
            const matches = messageText.match(/\$\d/g);
            if (matches) {
                matches.forEach((placeholder, i) => {
                    messageText = messageText.replace(placeholder, returnValue[i]);
                });
            }
        }
        return messageText;
    }

    return {
        configure: (options) => Object.assign(internalConfiguration, options),
        
        addValidationRule: (matcher, message, validatorFunction) => {
            if (typeof message === 'function') {
                validatorFunction = message;
                message = undefined;
            } else if (message) {
                const messageKey = typeof matcher === 'string' ? matcher : matcher.ruleKey;
                if (!validationMessagesStore.has(messageKey)) {
                    validationMessagesStore.set(messageKey, new Map());
                }
                const currentRuleMessages = validationMessagesStore.get(messageKey);
                if (typeof message === 'string') {
                    currentRuleMessages.set('en', message);
                } else {
                    Object.entries(message).forEach(([lang, msg]) => currentRuleMessages.set(lang, msg));
                }
            }

            let finalMatcher = matcher;
            const typeMatch = typeAttributeRegex.exec(matcher);
            if (typeMatch) {
                finalMatcher = createTypeMatcher(typeMatch[1]);
            }
            validationRulesStore.push({ matcher: finalMatcher, validate: validatorFunction });
        },

        addEffectHandler: (name, showHandler, hideHandler) => {
            validationEffectsStore.set(name, { show: showHandler, hide: hideHandler });
        },

        addLocalizedMessages: (lang, messages) => {
            Object.entries(messages).forEach(([key, msg]) => {
                if (!validationMessagesStore.has(key)) {
                    validationMessagesStore.set(key, new Map());
                }
                validationMessagesStore.get(key).set(lang, msg);
            });
        },

        extendLocalizedMessages: (key, messages) => {
            if (!validationMessagesStore.has(key)) {
                validationMessagesStore.set(key, new Map());
            }
            Object.entries(messages).forEach(([lang, msg]) => validationMessagesStore.get(key).set(lang, msg));
        },

        _getRules: () => validationRulesStore,
        _getEffects: () => validationEffectsStore,
        _getSettings: () => ({...internalConfiguration}),
        _getFormattedMessage: getFormattedMessage
    };
})();

GLOBAL_VALIDATION_REGISTRY.addValidationRule(":email", "Please provide a valid email address", (element, value) => {
    return !value || emailFormatRegex.test(value);
});

GLOBAL_VALIDATION_REGISTRY.addValidationRule(":url", "Please provide a valid URL", (element, value) => {
    return !value || urlFormatRegex.test(value);
});

GLOBAL_VALIDATION_REGISTRY.addValidationRule(":number", "Please provide a numeric value", (element, value) => {
    return numberFormatRegex.test(value);
});

GLOBAL_VALIDATION_REGISTRY.addValidationRule("[max]", "Value must be less than or equal to $1", (element, value) => {
    const maxVal = parseFloat(element.getAttribute("max"));
    const numVal = parseFloat(value);
    return numVal <= maxVal ? true : [maxVal];
});

GLOBAL_VALIDATION_REGISTRY.addValidationRule("[min]", "Value must be greater than or equal to $1", (element, value) => {
    const minVal = parseFloat(element.getAttribute("min"));
    const numVal = parseFloat(value);
    return numVal >= minVal ? true : [minVal];
});

GLOBAL_VALIDATION_REGISTRY.addValidationRule("[required]", "This field is mandatory", (element, value) => {
    if (element.type === "checkbox") {
        return element.checked;
    }
    return !!value;
});

GLOBAL_VALIDATION_REGISTRY.addValidationRule("[pattern]", (element, value) => {
    const pattern = new RegExp(`^${element.getAttribute("pattern")}$`);
    return pattern.test(value);
});

const createFormValidationInstance = (formElement, instanceOptions = {}) => {
    const currentSettings = { ...GLOBAL_VALIDATION_REGISTRY._getSettings(), ...instanceOptions };
    const inputElements = Array.from(formElement.querySelectorAll('input, select, textarea'))
                               .filter(el => !['button', 'image', 'reset', 'submit'].includes(el.type));

    const eventHandlers = new Map();

    const getEventHandlers = (target, eventName) => {
        if (!eventHandlers.has(target)) {
            eventHandlers.set(target, new Map());
        }
        if (!eventHandlers.get(target).has(eventName)) {
            eventHandlers.get(target).set(eventName, []);
        }
        return eventHandlers.get(target).get(eventName);
    };

    const registerEventHandler = (target, eventName, handler) => {
        const handlers = getEventHandlers(target, eventName);
        handlers.push(handler);
        target.addEventListener(eventName, handler);
    };

    const unregisterEventHandlers = (target, eventName = null) => {
        if (!eventHandlers.has(target)) return;

        const targetHandlers = eventHandlers.get(target);
        const eventsToClear = eventName ? [eventName] : Array.from(targetHandlers.keys());

        eventsToClear.forEach(evt => {
            const handlers = targetHandlers.get(evt);
            if (handlers) {
                handlers.forEach(handler => target.removeEventListener(evt, handler));
                targetHandlers.delete(evt);
            }
        });

        if (!eventName && targetHandlers.size === 0) {
            eventHandlers.delete(target);
        }
    };

    const collectInputMessages = (input, rules, contextInstance) => {
        const messages = [];
        const currentInputVal = input.value;

        for (const rule of rules) {
            if (DOM_UTILITIES.matches(input, rule.matcher)) {
                let ruleResult = rule.validate.call(contextInstance, input, currentInputVal);

                if (ruleResult !== true) {
                    const beforeFailEvent = DOM_UTILITIES.trigger(input, 'validation:beforeRuleFail', { input, ruleKey: rule.matcher.ruleKey || rule.matcher });
                    if (!beforeFailEvent) {
                        return [];
                    }

                    const customMessage = input.getAttribute(currentSettings.messageAttributeName);
                    if (customMessage) {
                        messages.push(customMessage);
                        break;
                    } else {
                        messages.push(GLOBAL_VALIDATION_REGISTRY._getFormattedMessage(rule.matcher.ruleKey || rule.matcher, ruleResult, currentSettings));
                    }
                }
            }
            if (currentSettings.singleErrorPerInput && messages.length > 0) {
                break;
            }
        }
        return messages;
    };

    const instanceAPI = {
        getSettings: () => ({ ...currentSettings }),
        getFormElement: () => formElement,
        getInputElements: () => Array.from(inputElements),

        reportValidationErrors: (errorMap, originalEvent = null) => {
            let compiledErrors = [];
            if (originalEvent) {
                compiledErrors = errorMap;
            } else {
                Object.entries(errorMap).forEach(([inputName, message]) => {
                    const targetInput = inputElements.find(el => el.name === inputName);
                    if (targetInput) {
                        DOM_UTILITIES.trigger(targetInput, 'validation:invalid', { messages: [message] });
                        compiledErrors.push({ input: targetInput, messages: [message] });
                    }
                });
            }

            const failEvent = DOM_UTILITIES.trigger(formElement, 'validation:onFail', { errors: compiledErrors, originalEvent });
            if (!failEvent) return instanceAPI;

            const effect = GLOBAL_VALIDATION_REGISTRY._getEffects().get(currentSettings.displayEffect);
            if (!effect) {
                console.error(`Validation: Cannot find effect "${currentSettings.displayEffect}"`);
                return instanceAPI;
            }
            effect.show(compiledErrors, instanceAPI);
            return instanceAPI;
        },

        resetValidation: (elementsToReset = inputElements) => {
            elementsToReset.forEach(input => {
                DOM_UTILITIES.removeClass(input, currentSettings.errorIndicatorClass);
                const msgEl = DOM_UTILITIES.getData(input, "validation.msg.element");
                if (msgEl) {
                    msgEl.remove();
                    DOM_UTILITIES.removeData(input, "validation.msg.element");
                }
                unregisterEventHandlers(input, currentSettings.errorInputValidationTrigger);
            });
            return instanceAPI;
        },

        destroy: () => {
            unregisterEventHandlers(formElement, currentSettings.formSubmissionTrigger);
            unregisterEventHandlers(formElement, 'reset');
            inputElements.forEach(input => unregisterEventHandlers(input, currentSettings.inputValidationTrigger));
            inputElements.forEach(input => unregisterEventHandlers(input, 'change'));
            instanceAPI.resetValidation();
            return instanceAPI;
        },

        validateForm: (elementsToCheck = inputElements, triggeringEvent = null) => {
            const elements = Array.from(elementsToCheck).filter(el => !el.disabled);
            if (elements.length === 0) return true;

            const beforeValidateEvent = DOM_UTILITIES.trigger(formElement, 'validation:beforeValidate', { elements, triggeringEvent });
            if (!beforeValidateEvent) return false;

            const validationErrors = [];
            const allRegisteredRules = GLOBAL_VALIDATION_REGISTRY._getRules();
            const errorInputEvent = currentSettings.errorInputValidationTrigger;

            let stopValidation = false;
            elements.forEach(input => {
                if (stopValidation) return;

                unregisterEventHandlers(input, errorInputEvent);

                const messagesForThisInput = collectInputMessages(input, allRegisteredRules, instanceAPI);

                if (messagesForThisInput.length > 0) {
                    validationErrors.push({ input: input, messages: messagesForThisInput });

                    DOM_UTILITIES.trigger(input, 'validation:invalid', { messages: messagesForThisInput });

                    if (errorInputEvent) {
                        const boundCheck = (e) => instanceAPI.validateForm([input], e);
                        registerEventHandler(input, errorInputEvent, boundCheck);
                        DOM_UTILITIES.setData(input, `validation.handler.${errorInputEvent}`, boundCheck);
                    }
                }

                if (currentSettings.singleErrorPerInput && validationErrors.length > 0) {
                    stopValidation = true;
                }
            });

            const effectHandlers = GLOBAL_VALIDATION_REGISTRY._getEffects().get(currentSettings.displayEffect);

            if (validationErrors.length > 0) {
                instanceAPI.reportValidationErrors(validationErrors, triggeringEvent);
                return false;
            } else {
                effectHandlers.hide(elements, instanceAPI);
                DOM_UTILITIES.trigger(formElement, 'validation:onSuccess', { elements, triggeringEvent });
                elements.forEach(input => unregisterEventHandlers(input, errorInputEvent));
                return true;
            }
        }
    };

    const customEventNames = ['beforeValidate', 'beforeRuleFail', 'onFail', 'onSuccess'];
    customEventNames.forEach(eventName => {
        instanceAPI[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`] = (callback) => {
            registerEventHandler(formElement, `validation:${eventName}`, callback);
            return instanceAPI;
        };
        if (typeof currentSettings[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`] === 'function') {
            instanceAPI[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`](currentSettings[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`]);
        }
    });

    if (currentSettings.formSubmissionTrigger) {
        registerEventHandler(formElement, currentSettings.formSubmissionTrigger, (e) => {
            if (!instanceAPI.validateForm(inputElements, e)) {
                e.preventDefault();
            }
        });
    }

    registerEventHandler(formElement, 'reset', () => {
        instanceAPI.resetValidation();
    });

    if (currentSettings.inputValidationTrigger) {
        inputElements.forEach(input => {
            registerEventHandler(input, currentSettings.inputValidationTrigger, (e) => {
                instanceAPI.validateForm([input], e);
            });
        });
    }

    inputElements.forEach(input => {
        if (input.validity) {
            input.oninvalid = (e) => {
                e.preventDefault();
            };
        }
    });

    return instanceAPI;
};

const FormEngine = {
    configureGlobal: GLOBAL_VALIDATION_REGISTRY.configure,
    addValidationRule: GLOBAL_VALIDATION_REGISTRY.addValidationRule,
    addEffectHandler: GLOBAL_VALIDATION_REGISTRY.addEffectHandler,
    addLocalizedMessages: GLOBAL_VALIDATION_REGISTRY.addLocalizedMessages,
    extendLocalizedMessages: GLOBAL_VALIDATION_REGISTRY.extendLocalizedMessages,

    createInstance: createFormValidationInstance
};