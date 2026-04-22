(function () {
    const _keyCommander = {};
    const _registrationVault = new WeakMap(); // Maps HTMLElement to Map<string, Map<string, { trigger: Function, preventDefault: boolean }>>
    const _eventMonitorMap = new WeakMap(); // Maps HTMLElement to Map<string, { monitor: Function, count: number, ignoreInputs: boolean, climbDOM: boolean }>>

    const _keyIdentifierAliases = {
        'Escape': 'esc', 'Tab': 'tab', ' ': 'space', 'Enter': 'return', 'Backspace': 'backspace',
        'ScrollLock': 'scroll', 'CapsLock': 'capslock', 'NumLock': 'numlock', 'Pause': 'pause',
        'Insert': 'insert', 'Home': 'home', 'Delete': 'del', 'End': 'end', 'PageUp': 'pageup',
        'PageDown': 'pagedown', 'ArrowLeft': 'left', 'ArrowUp': 'up', 'ArrowRight': 'right', 'ArrowDown': 'down',
        'F1': 'f1', 'F2': 'f2', 'F3': 'f3', 'F4': 'f4', 'F5': 'f5', 'F6': 'f6', 'F7': 'f7', 'F8': 'f8',
        'F9': 'f9', 'F10': 'f10', 'F11': 'f11', 'F12': 'f12'
    };

    const _shiftedSymbols = {
        "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
        "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ":", "'": "\"", ",": "<",
        ".": ">", "/": "?", "\\": "|"
    };

    const _unshiftedSymbols = {};
    for (const normalKey in _shiftedSymbols) {
        _unshiftedSymbols[_shiftedSymbols[normalKey]] = normalKey;
    }

    const _modifierOrder = ['alt', 'ctrl', 'shift', 'meta'];

    function generateKeyPattern(inputPattern) {
        const parts = inputPattern.toLowerCase().split('+').map(p => p.trim());
        const modifiers = [];
        let mainKey = '';

        for (const part of parts) {
            if (part === 'ctrl' || part === 'control') modifiers.push('ctrl');
            else if (part === 'shift') modifiers.push('shift');
            else if (part === 'alt') modifiers.push('alt');
            else if (part === 'meta' || part === 'command' || part === 'win') modifiers.push('meta');
            else mainKey = part;
        }

        // If shift is a modifier and mainKey is a shifted symbol, convert it to its unshifted form
        if (modifiers.includes('shift') && _unshiftedSymbols[mainKey]) {
            mainKey = _unshiftedSymbols[mainKey];
        }

        modifiers.sort((a, b) => _modifierOrder.indexOf(a) - _modifierOrder.indexOf(b));
        return (modifiers.length > 0 ? modifiers.join('+') + '+' : '') + mainKey;
    }

    function extractEventPattern(keyEvent) {
        const activeModifiers = [];
        if (keyEvent.altKey) activeModifiers.push('alt');
        if (keyEvent.ctrlKey) activeModifiers.push('ctrl');
        if (keyEvent.shiftKey) activeModifiers.push('shift');
        if (keyEvent.metaKey) activeModifiers.push('meta');

        let primaryKey = keyEvent.key;

        if (_keyIdentifierAliases[primaryKey]) {
            primaryKey = _keyIdentifierAliases[primaryKey];
        } else if (primaryKey.length === 1 && primaryKey.match(/[a-zA-Z]/)) {
            primaryKey = primaryKey.toLowerCase();
        } else if (primaryKey === '+') {
            primaryKey = '+';
        } else {
            primaryKey = primaryKey.toLowerCase();
        }

        // If shift was active and the primaryKey is a shifted symbol, convert to unshifted form
        if (activeModifiers.includes('shift') && _unshiftedSymbols[primaryKey]) {
            primaryKey = _unshiftedSymbols[primaryKey];
        }

        activeModifiers.sort((a, b) => _modifierOrder.indexOf(a) - _modifierOrder.indexOf(b));
        return (activeModifiers.length > 0 ? activeModifiers.join('+') + '+' : '') + primaryKey;
    }

    function createEventMonitor(targetNode, eventType, monitorOptions) {
        return function (keyEvent) {
            if (monitorOptions.ignoreInputs) {
                const nodeTag = keyEvent.target.tagName;
                if (nodeTag === 'INPUT' || nodeTag === 'TEXTAREA' || nodeTag === 'SELECT') {
                    return;
                }
            }

            let effectiveNode = targetNode;
            if (monitorOptions.climbDOM) {
                let currentTraversal = keyEvent.target;
                while (currentTraversal && currentTraversal !== targetNode && !_registrationVault.has(currentTraversal)) {
                    currentTraversal = currentTraversal.parentNode;
                }
                if (_registrationVault.has(currentTraversal)) {
                    effectiveNode = currentTraversal;
                }
            }

            const nodeRegistrations = _registrationVault.get(effectiveNode);
            if (!nodeRegistrations) return;

            const typeRegistrations = nodeRegistrations.get(eventType);
            if (!typeRegistrations) return;

            const eventKeyPattern = extractEventPattern(keyEvent);
            const actionDefinition = typeRegistrations.get(eventKeyPattern);

            if (actionDefinition) {
                actionDefinition.trigger(keyEvent);
                if (actionDefinition.preventDefault) {
                    keyEvent.stopPropagation();
                    keyEvent.preventDefault();
                    return false;
                }
            }
        };
    }

    _keyCommander.registerKeyAction = function (keyExpression, actionSettings, actionPerformer) {
        if (typeof actionSettings === 'function') {
            actionPerformer = actionSettings;
            actionSettings = {};
        }

        const currentActionSettings = {
            eventType: 'keydown',
            allowPropagation: false,
            ignoreInputElements: false,
            eventSourceNode: document.documentElement,
            ascendDOM: true
        };
        Object.assign(currentActionSettings, actionSettings);

        const normalizedPattern = generateKeyPattern(keyExpression);

        let elementRegistrations = _registrationVault.get(currentActionSettings.eventSourceNode);
        if (!elementRegistrations) {
            elementRegistrations = new Map();
            _registrationVault.set(currentActionSettings.eventSourceNode, elementRegistrations);
        }

        let typeRegistrations = elementRegistrations.get(currentActionSettings.eventType);
        if (!typeRegistrations) {
            typeRegistrations = new Map();
            elementRegistrations.set(currentActionSettings.eventType, typeRegistrations);
        }

        typeRegistrations.set(normalizedPattern, {
            trigger: actionPerformer,
            preventDefault: !currentActionSettings.allowPropagation
        });

        let elementMonitors = _eventMonitorMap.get(currentActionSettings.eventSourceNode);
        if (!elementMonitors) {
            elementMonitors = new Map();
            _eventMonitorMap.set(currentActionSettings.eventSourceNode, elementMonitors);
        }

        let typeMonitor = elementMonitors.get(currentActionSettings.eventType);
        if (!typeMonitor) {
            const eventMonitorFunction = createEventMonitor(
                currentActionSettings.eventSourceNode,
                currentActionSettings.eventType, {
                    ignoreInputs: currentActionSettings.ignoreInputElements,
                    climbDOM: currentActionSettings.ascendDOM
                }
            );
            currentActionSettings.eventSourceNode.addEventListener(currentActionSettings.eventType, eventMonitorFunction);
            typeMonitor = {
                monitor: eventMonitorFunction,
                count: 1,
                ignoreInputs: currentActionSettings.ignoreInputElements,
                climbDOM: currentActionSettings.ascendDOM
            };
            elementMonitors.set(currentActionSettings.eventType, typeMonitor);
        } else {
            typeMonitor.count++;
        }
        return _keyCommander;
    };

    _keyCommander.revokeKeyAction = function (keyExpression, actionSettings) {
        actionSettings = actionSettings || {};
        const targetNode = actionSettings.eventSourceNode || document.documentElement;
        const eventType = actionSettings.eventType || 'keydown';

        const normalizedPattern = generateKeyPattern(keyExpression);

        const elementRegistrations = _registrationVault.get(targetNode);
        if (!elementRegistrations) return _keyCommander;

        const typeRegistrations = elementRegistrations.get(eventType);
        if (!typeRegistrations) return _keyCommander;

        typeRegistrations.delete(normalizedPattern);

        const elementMonitors = _eventMonitorMap.get(targetNode);
        if (!elementMonitors) return _keyCommander;

        const typeMonitor = elementMonitors.get(eventType);
        if (!typeMonitor) return _keyCommander;

        typeMonitor.count--;

        if (typeMonitor.count <= 0) {
            targetNode.removeEventListener(eventType, typeMonitor.monitor);
            elementMonitors.delete(eventType);
            if (elementMonitors.size === 0) {
                _eventMonitorMap.delete(targetNode);
            }
        }
        return _keyCommander;
    };

    window.keyboardCommander = _keyCommander;
})();