const SystemConfiguration = {
    animationEffects: {
        defaultClass: 'visual-transition-effect',
        durationMilliseconds: 20
    },
    calendarOptions: {
        standardHeader: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        eventHoverAction: function(evt, domEvt, viewPanel) {
            if (viewPanel.name !== 'agendaDay') {
                $(domEvt.target).attr('title', evt.title);
            }
        }
    },
    codeEditorSettings: { /* Default CodeMirror options */ },
    moneyFormat: {
        positiveIndicator: 'money-plus-value',
        negativeIndicator: 'money-minus-value',
        zeroIndicator: 'money-zero-value',
        currencySymbol: '$'
    },
    datePickerSettings: { /* Default jQuery UI Datepicker options */ },
    jqueryPluginConfigurations: {}
};

function combineProperties(...sources) {
    const output = {};
    for (const source of sources) {
        if (source && typeof source === 'object') {
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    output[key] = source[key];
                }
            }
        }
    }
    return output;
}

const KindCheck = {
    isString: val => typeof val === 'string',
    isObject: val => val && typeof val === 'object' && !Array.isArray(val),
    isArray: val => Array.isArray(val),
    isUndefined: val => typeof val === 'undefined',
    isNull: val => val === null,
    isDateObject: val => val instanceof Date && !isNaN(val)
};

function parseExpressionPath(dataContext, expression) {
    try {
        const pathSegments = expression.split('.');
        let current = dataContext;
        for (let i = 0; i < pathSegments.length; i++) {
            if (KindCheck.isUndefined(current) || KindCheck.isNull(current)) return undefined;
            current = current[pathSegments[i]];
        }
        return current;
    } catch (e) {
        console.error('Expression path parsing error:', e, 'Expression:', expression);
        return undefined;
    }
}

function executeStatement(dataContext, statement) {
    try {
        const func = new Function('context', `with(context) { ${statement}; }`);
        func(dataContext);
    } catch (e) {
        console.error('Statement execution error:', e, 'Statement:', statement);
    }
}

function formatFinancialValue(value, symbol = SystemConfiguration.moneyFormat.currencySymbol) {
    if (typeof value !== 'number') return '';
    const formatted = value.toFixed(2);
    return symbol + formatted;
}

const ElementBehaviorManager = (function() {
    const behaviorDefinitions = {};
    const dataContexts = new Map(); // Stores observable data models
    const globalEventBus = new EventTarget();

    function obtainDataContext(identifier = 'root') {
        if (!dataContexts.has(identifier)) {
            let data = {};
            const proxyHandler = {
                set(target, property, value) {
                    const previousValue = target[property];
                    target[property] = value;
                    if (previousValue !== value) {
                        globalEventBus.dispatchEvent(new CustomEvent(`data-update:${identifier}:${property}`, { detail: { old: previousValue, new: value } }));
                        globalEventBus.dispatchEvent(new CustomEvent(`data-update:${identifier}`, { detail: { property, old: previousValue, new: value } }));
                    }
                    return true;
                }
            };
            dataContexts.set(identifier, new Proxy(data, proxyHandler));
            dataContexts.get(identifier)._contextIdentifier = identifier; // Store identifier for internal use
        }
        return dataContexts.get(identifier);
    }

    function registerElementBehavior(name, definition) {
        behaviorDefinitions[name] = definition;
    }

    function applyElementBehavior(targetElement, behaviorName, attributeValue) {
        const definition = behaviorDefinitions[behaviorName];
        if (!definition) return;

        const contextId = targetElement.getAttribute('data-context-id') || 'root';
        const behaviorInstanceContext = {
            targetElement: targetElement,
            attributeValue: attributeValue,
            universalConfig: SystemConfiguration,
            getDataContext: obtainDataContext,
            mergeConfigs: combineProperties,
            checkType: KindCheck,
            evaluatePath: (path) => parseExpressionPath(behaviorInstanceContext.currentDataContext, path),
            execute: (stmt) => executeStatement(behaviorInstanceContext.currentDataContext, stmt),
            delayExecution: setTimeout,
            onEvent: targetElement.addEventListener.bind(targetElement),
            offEvent: targetElement.removeEventListener.bind(targetElement),
            notifyGlobal: (evtName, details) => globalEventBus.dispatchEvent(new CustomEvent(evtName, { detail: details })),
            listenGlobal: (evtName, callback) => globalEventBus.addEventListener(evtName, callback)
        };

        behaviorInstanceContext.currentDataContext = obtainDataContext(contextId);

        if (typeof definition.startUp === 'function') {
            definition.startUp(behaviorInstanceContext);
        }
    }

    function scanAndActivate(rootElement = document.body) {
        for (const name in behaviorDefinitions) {
            const selector = `[data-${name}]`;
            rootElement.querySelectorAll(selector).forEach(element => {
                if (!element.dataset[`${name}Activated`]) {
                    applyElementBehavior(element, name, element.getAttribute(`data-${name}`));
                    element.dataset[`${name}Activated`] = 'true';
                }
            });
        }
    }

    const domObservationAgent = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        scanAndActivate(node);
                    }
                });
            }
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        domObservationAgent.observe(document.body, { childList: true, subtree: true });
        scanAndActivate();
    });

    return {
        registerElementBehavior: registerElementBehavior,
        getDataContext: obtainDataContext,
        triggerScan: scanAndActivate,
        globalEventBus: globalEventBus
    };
})();

// --- Element Behavior Implementations ---

ElementBehaviorManager.registerElementBehavior('animate-on-load', {
    startUp: function(ctx) {
        const targetElement = ctx.targetElement;
        const attribValue = ctx.attributeValue;

        let localSettings = {};
        if (attribValue) {
            try {
                localSettings = JSON.parse(attribValue.replace(/'/g, '"'));
            } catch (e) {
                localSettings = { defaultClass: attribValue };
            }
        }

        const finalSettings = ctx.mergeConfigs(
            { defaultClass: 'visual-transition-effect' },
            ctx.universalConfig.animationEffects,
            localSettings
        );

        targetElement.classList.add(finalSettings.defaultClass);
        ctx.delayExecution(() => {
            targetElement.classList.remove(finalSettings.defaultClass);
        }, finalSettings.durationMilliseconds);
    }
});

ElementBehaviorManager.registerElementBehavior('display-calendar', {
    startUp: function(ctx) {
        const targetElement = ctx.targetElement;
        const attribValue = ctx.attributeValue;
        const dataPath = targetElement.getAttribute('data-event-source');

        if (typeof jQuery === 'undefined' || typeof jQuery.fn.fullCalendar === 'undefined') {
            console.error('jQuery FullCalendar not found. "display-calendar" requires it.');
            return;
        }

        let customConfig = {};
        if (attribValue) {
            customConfig = ctx.evaluatePath(attribValue);
            if (!ctx.checkType.isObject(customConfig)) customConfig = {};
        }

        const currentConfig = ctx.mergeConfigs(
            {},
            ctx.universalConfig.calendarOptions.standardHeader,
            ctx.universalConfig.calendarOptions.eventHoverAction,
            customConfig
        );

        if (dataPath) {
            currentConfig.events = ctx.evaluatePath(dataPath);

            ctx.listenGlobal(`data-update:${ctx.currentDataContext._contextIdentifier}:${dataPath.split('.')[0]}`, () => {
                const newEvents = ctx.evaluatePath(dataPath);
                if (newEvents && $(targetElement).fullCalendar) {
                    $(targetElement).fullCalendar('removeEvents');
                    $(targetElement).fullCalendar('addEventSource', newEvents);
                }
            });
        }

        targetElement.innerHTML = '';
        $(targetElement).fullCalendar(currentConfig);
    }
});

ElementBehaviorManager.registerElementBehavior('code-input', {
    startUp: function(ctx) {
        const targetElement = ctx.targetElement;
        const attribValue = ctx.attributeValue;
        const modelPath = targetElement.getAttribute('data-source');

        if (!targetElement.tagName || targetElement.tagName.toLowerCase() !== 'textarea') {
            console.error('code-input behavior must be on a textarea element.');
            return;
        }
        if (typeof CodeMirror === 'undefined') {
            console.error('CodeMirror library not found. "code-input" requires it.');
            return;
        }

        let editorInstance;
        let userConfiguration = {};
        if (attribValue) {
            userConfiguration = ctx.evaluatePath(attribValue);
            if (!ctx.checkType.isObject(userConfiguration)) userConfiguration = {};
        }

        const refreshEditor = (configOverrides) => {
            const finalConfig = ctx.mergeConfigs({}, ctx.universalConfig.codeEditorSettings, configOverrides);

            const contentChangeHandler = (editor) => {
                const currentContent = editor.getValue();
                const boundValue = ctx.evaluatePath(modelPath);
                if (currentContent !== boundValue) {
                    // Update model directly
                    const pathParts = modelPath.split('.');
                    if (pathParts.length > 1) {
                        ctx.currentDataContext[pathParts[0]][pathParts[1]] = currentContent;
                    } else {
                        ctx.currentDataContext[pathParts[0]] = currentContent;
                    }
                }
            };

            const originalOnChange = finalConfig.onChange;
            finalConfig.onChange = originalOnChange ? (editor) => { contentChangeHandler(editor); originalOnChange(editor); } : contentChangeHandler;

            if (editorInstance) {
                editorInstance.toTextArea();
            }
            editorInstance = CodeMirror.fromTextArea(targetElement, finalConfig);

            if (modelPath) {
                const initialValue = ctx.evaluatePath(modelPath);
                if (!ctx.checkType.isUndefined(initialValue) && !ctx.checkType.isNull(initialValue)) {
                    editorInstance.setValue(initialValue);
                } else {
                    editorInstance.setValue('');
                }
            }
        };

        refreshEditor(userConfiguration);

        ctx.listenGlobal(`data-update:${ctx.currentDataContext._contextIdentifier}:${attribValue}`, () => {
             refreshEditor(ctx.evaluatePath(attribValue));
        });

        if (modelPath) {
             ctx.listenGlobal(`data-update:${ctx.currentDataContext._contextIdentifier}:${modelPath.split('.')[0]}`, () => {
                const newValue = ctx.evaluatePath(modelPath);
                if (editorInstance && editorInstance.getValue() !== newValue) {
                    editorInstance.setValue(newValue);
                }
            });
        }
    }
});

ElementBehaviorManager.registerElementBehavior('money-formatter', {
    startUp: function(ctx) {
        const targetElement = ctx.targetElement;
        const attribValue = ctx.attributeValue;
        const modelPath = targetElement.getAttribute('data-source');

        let customFormatOptions = {};
        if (attribValue) {
            try {
                customFormatOptions = JSON.parse(attribValue.replace(/'/g, '"'));
            } catch (e) { /* ignored */ }
        }

        const finalFormatOptions = ctx.mergeConfigs(
            {},
            ctx.universalConfig.moneyFormat,
            customFormatOptions
        );

        const updatePresentation = (val) => {
            const numericValue = parseFloat(val);
            targetElement.classList.remove(finalFormatOptions.positiveIndicator, finalFormatOptions.negativeIndicator, finalFormatOptions.zeroIndicator);

            if (isNaN(numericValue) || val === '') {
                targetElement.textContent = '';
            } else {
                if (numericValue > 0) {
                    targetElement.classList.add(finalFormatOptions.positiveIndicator);
                } else if (numericValue < 0) {
                    targetElement.classList.add(finalFormatOptions.negativeIndicator);
                } else {
                    targetElement.classList.add(finalFormatOptions.zeroIndicator);
                }
                targetElement.textContent = formatFinancialValue(numericValue, finalFormatOptions.currencySymbol);
            }
        };

        if (modelPath) {
            updatePresentation(ctx.evaluatePath(modelPath));

            ctx.listenGlobal(`data-update:${ctx.currentDataContext._contextIdentifier}:${modelPath.split('.')[0]}`, () => {
                updatePresentation(ctx.evaluatePath(modelPath));
            });
        }
    }
});

ElementBehaviorManager.registerElementBehavior('date-selection', {
    startUp: function(ctx) {
        const targetElement = ctx.targetElement;
        const attribValue = ctx.attributeValue;
        const modelPath = targetElement.getAttribute('data-source');

        if (typeof jQuery === 'undefined' || typeof jQuery.fn.datepicker === 'undefined') {
            console.error('jQuery UI Datepicker not found. "date-selection" requires it.');
            return;
        }

        let userConfiguration = {};
        if (attribValue) {
            userConfiguration = ctx.evaluatePath(attribValue);
            if (!ctx.checkType.isObject(userConfiguration)) userConfiguration = {};
        }

        const initializePicker = () => {
            const currentConfiguration = ctx.mergeConfigs({}, ctx.universalConfig.datePickerSettings, userConfiguration);

            const updateSource = () => {
                const selectedDate = $(targetElement).datepicker("getDate");
                if (modelPath) {
                    const pathParts = modelPath.split('.');
                    if (pathParts.length > 1) {
                        ctx.currentDataContext[pathParts[0]][pathParts[1]] = selectedDate;
                    } else {
                        ctx.currentDataContext[pathParts[0]] = selectedDate;
                    }
                }
            };

            const oldOnSelect = currentConfiguration.onSelect;
            currentConfiguration.onSelect = function(dateString, instance) {
                updateSource();
                if (oldOnSelect) {
                    oldOnSelect(dateString, instance);
                }
            };
            targetElement.addEventListener('change', updateSource);

            $(targetElement).datepicker('destroy');
            $(targetElement).datepicker(currentConfiguration);

            if (modelPath) {
                const modelValue = ctx.evaluatePath(modelPath);
                if (ctx.checkType.isUndefined(modelValue) || ctx.checkType.isNull(modelValue) || ctx.checkType.isDateObject(modelValue)) {
                    $(targetElement).datepicker("setDate", modelValue);
                } else {
                    console.error('data-source for date-selection must be a Date object, null, or undefined.');
                }
            }
        };

        initializePicker();

        if (modelPath) {
            ctx.listenGlobal(`data-update:${ctx.currentDataContext._contextIdentifier}:${modelPath.split('.')[0]}`, () => {
                const modelValue = ctx.evaluatePath(modelPath);
                if (ctx.checkType.isUndefined(modelValue) || ctx.checkType.isNull(modelValue) || ctx.checkType.isDateObject(modelValue)) {
                    $(targetElement).datepicker("setDate", modelValue);
                } else {
                    console.error('data-source for date-selection must be a Date object, null, or undefined.');
                }
            });
        }
    }
});

ElementBehaviorManager.registerElementBehavior('date-data-format', {
    startUp: function(ctx) {
        const targetElement = ctx.targetElement;
        const formatStyle = ctx.attributeValue;
        const modelPath = targetElement.getAttribute('data-source');

        if (!modelPath) return;

        const propertyKey = modelPath.split('.').pop();

        const convertToString = (value) => {
            if (ctx.checkType.isDateObject(value)) {
                if (formatStyle === '') { // ISO
                    return value.toISOString();
                } else {
                    return $.datepicker.formatDate(formatStyle, value);
                }
            }
            return value;
        };

        const convertToDate = (value) => {
            if (ctx.checkType.isString(value)) {
                if (formatStyle === '') { // ISO
                    return new Date(value);
                } else {
                    return $.datepicker.parseDate(formatStyle, value);
                }
            }
            return value;
        };

        ctx.listenGlobal(`data-update:${ctx.currentDataContext._contextIdentifier}:${propertyKey}`, () => {
            const rawValue = ctx.currentDataContext[propertyKey];
            const displayValue = convertToString(rawValue);
            if (targetElement.tagName.toLowerCase() === 'input') {
                targetElement.value = displayValue;
            } else {
                targetElement.textContent = displayValue;
            }
        });

        const initialRaw = ctx.currentDataContext[propertyKey];
        const initialDisplay = convertToString(initialRaw);
        if (targetElement.tagName.toLowerCase() === 'input') {
            targetElement.value = initialDisplay;
        } else {
            targetElement.textContent = initialDisplay;
        }

        // For inputs, we also need to parse the value back to the model
        if (targetElement.tagName.toLowerCase() === 'input') {
            targetElement.addEventListener('change', () => {
                const inputValue = targetElement.value;
                const parsedValue = convertToDate(inputValue);
                if (modelPath) {
                    const pathParts = modelPath.split('.');
                    if (pathParts.length > 1) {
                        ctx.currentDataContext[pathParts[0]][pathParts[1]] = parsedValue;
                    } else {
                        ctx.currentDataContext[pathParts[0]] = parsedValue;
                    }
                }
            });
        }
    }
});

ElementBehaviorManager.registerElementBehavior('bind-events', {
    startUp: function(ctx) {
        const targetElement = ctx.targetElement;
        const attribValue = ctx.attributeValue;

        let eventBindings = {};
        try {
            eventBindings = JSON.parse(attribValue.replace(/'/g, '"'));
        } catch (e) {
            console.error('Invalid JSON for bind-events:', e);
            return;
        }

        for (const eventName in eventBindings) {
            const statement = eventBindings[eventName];
            targetElement.addEventListener(eventName, (domEvent) => {
                const executionContext = ctx.mergeConfigs({}, ctx.currentDataContext, {
                    $event: domEvent,
                    $extraArgs: Array.prototype.slice.call(arguments, 1)
                });
                ctx.execute(executionContext, statement);
            });
        }
    }
});

ElementBehaviorManager.registerElementBehavior('conditional-display', {
    startUp: function(ctx) {
        const targetElement = ctx.targetElement;
        const expression = ctx.attributeValue;

        const commentMarker = document.createComment(`conditional-display marker for ${targetElement.tagName}`);
        const originalChildren = [];
        while (targetElement.firstChild) {
            originalChildren.push(targetElement.removeChild(targetElement.firstChild));
        }

        targetElement.parentNode.insertBefore(commentMarker, targetElement);
        targetElement.remove();

        const updateDisplayState = () => {
            const shouldBeVisible = ctx.evaluatePath(expression);

            if (shouldBeVisible && !targetElement.parentNode) {
                commentMarker.parentNode.insertBefore(targetElement, commentMarker);
                originalChildren.forEach(node => targetElement.appendChild(node));
                ctx.notifyGlobal('dom-structure-changed', { parentNode: targetElement.parentNode });
                ElementBehaviorManager.triggerScan(targetElement);
            } else if (!shouldBeVisible && targetElement.parentNode) {
                while (targetElement.firstChild) {
                    originalChildren.unshift(targetElement.removeChild(targetElement.firstChild));
                }
                targetElement.parentNode.insertBefore(commentMarker, targetElement);
                targetElement.remove();
                ctx.notifyGlobal('dom-structure-changed', { parentNode: commentMarker.parentNode });
            }
        };

        updateDisplayState();
        ctx.listenGlobal(`data-update:${ctx.currentDataContext._contextIdentifier}:${expression.split('.')[0]}`, updateDisplayState);
    }
});

ElementBehaviorManager.registerElementBehavior('jquery-extension', {
    startUp: function(ctx) {
        const targetElement = ctx.targetElement;
        const extensionName = ctx.attributeValue;
        const optionsAttribute = targetElement.getAttribute('data-extension-options');
        const modelPath = targetElement.getAttribute('data-source');

        if (typeof jQuery === 'undefined' || typeof jQuery.fn[extensionName] === 'undefined') {
            console.error(`jQuery extension "${extensionName}" not found. "jquery-extension" requires it.`);
            return;
        }

        let extensionOptions = [];
        const globalOptions = ctx.universalConfig.jqueryPluginConfigurations[extensionName];

        if (optionsAttribute) {
            try {
                extensionOptions = ctx.evaluatePath(`[${optionsAttribute}]`);
            } catch (e) {
                console.error('Error parsing data-extension-options:', e);
            }
            if (ctx.checkType.isObject(globalOptions) && ctx.checkType.isObject(extensionOptions[0])) {
                extensionOptions[0] = ctx.mergeConfigs({}, globalOptions, extensionOptions[0]);
            }
        } else if (globalOptions) {
            extensionOptions = [globalOptions];
        }

        let eventTrigger = 'change';
        if (extensionOptions.length > 0 && ctx.checkType.isObject(extensionOptions[0]) && extensionOptions[0].eventTrigger !== undefined) {
            eventTrigger = extensionOptions[0].eventTrigger;
        }

        if (modelPath && (targetElement.tagName.toLowerCase() === 'select' || targetElement.tagName.toLowerCase() === 'input' || targetElement.tagName.toLowerCase() === 'textarea')) {
            if (eventTrigger) {
                targetElement.addEventListener(eventTrigger, () => {
                    targetElement.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
        }

        $(targetElement)[extensionName].apply($(targetElement), extensionOptions);
    }
});

const KeyboardBehaviorUtility = (function() {
    const keyIdentifierMap = {
        8: 'backspace', 9: 'tab', 13: 'enter', 27: 'escape', 32: 'space',
        33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home', 37: 'left',
        38: 'up', 39: 'right', 40: 'down', 45: 'insert', 46: 'delete'
    };

    function processKeyAction(triggerType, actionConfig) {
        return function(eventObject, dataContext) {
            const keyAlias = keyIdentifierMap[eventObject.keyCode] || eventObject.key.toLowerCase();
            if (actionConfig[keyAlias]) {
                executeStatement(dataContext, actionConfig[keyAlias]);
            }
        };
    }

    return {
        getKeyActionProcessor: processKeyAction,
        keyCodes: keyIdentifierMap
    };
})();