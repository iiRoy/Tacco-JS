(function() {
    const virtualInput = {};

    const defaultConfiguration = {
        interactionSpeed: 'instant',
        bubbleUp: true,
        cancelableAction: true,
        displayWindow: window,
        detailCount: 0,
        xScreen: 0, yScreen: 0,
        xClient: 0, yClient: 0,
        controlKey: false, altKey: false, shiftKey: false, metaKey: false,
        buttonCode: 0,
        relatedElement: null,

        keyIdentifier: 0,
        characterCode: 0,

        dx: 0, dy: 0
    };

    const keyConstants = {
        TAB_KEY: 9,
        ENTER_KEY: 13,
        ESCAPE_KEY: 27,
        PAGE_UP_KEY: 33,
        PAGE_DOWN_KEY: 34,
        END_KEY: 35,
        HOME_KEY: 36,
        LEFT_ARROW_KEY: 37,
        UP_ARROW_KEY: 38,
        RIGHT_ARROW_KEY: 39,
        DOWN_ARROW_KEY: 40
    };

    function _combineSettings(base, overrides) {
        const result = {};
        for (const key in base) {
            result[key] = base[key];
        }
        for (const key in overrides) {
            if (overrides.hasOwnProperty(key)) {
                result[key] = overrides[key];
            }
        }
        return result;
    }

    function _identifyTargets(input) {
        if (typeof input === 'string') {
            return Array.from(document.querySelectorAll(input));
        } else if (input instanceof HTMLElement) {
            return [input];
        } else if (Array.isArray(input) || (typeof NodeList !== 'undefined' && input instanceof NodeList)) {
            return Array.from(input);
        }
        return [];
    }

    function _sendEventToElement(targetElement, eventInstance, eventKind) {
        if (targetElement.dispatchEvent) {
            targetElement.dispatchEvent(eventInstance);
        } else if (targetElement.fireEvent && eventInstance) {
            targetElement.fireEvent('on' + eventKind, eventInstance);
        }
    }

    function _buildEventObject(kind, settings) {
        let generatedEvent;
        if (/^mouse(over|out|down|up|move)|(dbl)?click$/.test(kind)) {
            generatedEvent = _craftMouseEvent(kind, settings);
        } else if (/^key(up|down|press)$/.test(kind)) {
            generatedEvent = _craftKeyboardEvent(kind, settings);
        }
        return generatedEvent;
    }

    function _craftMouseEvent(kind, settings) {
        let eventObj;

        if (typeof MouseEvent === 'function') {
            eventObj = new MouseEvent(kind, {
                bubbles: settings.bubbleUp,
                cancelable: settings.cancelableAction,
                view: settings.displayWindow,
                detail: settings.detailCount,
                screenX: settings.xScreen,
                screenY: settings.yScreen,
                clientX: settings.xClient,
                clientY: settings.yClient,
                ctrlKey: settings.controlKey,
                altKey: settings.altKey,
                shiftKey: settings.shiftKey,
                metaKey: settings.metaKey,
                button: settings.buttonCode,
                relatedTarget: settings.relatedElement || null
            });
        }
        else if (typeof document.createEvent === 'function') {
            eventObj = document.createEvent("MouseEvents");
            eventObj.initMouseEvent(kind, settings.bubbleUp, settings.cancelableAction,
                settings.displayWindow, settings.detailCount,
                settings.xScreen, settings.yScreen, settings.xClient, settings.yClient,
                settings.controlKey, settings.altKey, settings.shiftKey, settings.metaKey,
                settings.buttonCode, settings.relatedElement || document.body.parentNode);
        }
        else if (typeof document.createEventObject === 'function') {
            eventObj = document.createEventObject();
            eventObj.bubbles = settings.bubbleUp;
            eventObj.cancelBubble = !settings.cancelableAction;
            eventObj.view = settings.displayWindow;
            eventObj.detail = settings.detailCount;
            eventObj.screenX = settings.xScreen;
            eventObj.screenY = settings.yScreen;
            eventObj.clientX = settings.xClient;
            eventObj.clientY = settings.yClient;
            eventObj.ctrlKey = settings.controlKey;
            eventObj.altKey = settings.altKey;
            eventObj.shiftKey = settings.shiftKey;
            eventObj.metaKey = settings.metaKey;
            eventObj.button = { 0:1, 1:4, 2:2 }[settings.buttonCode] || settings.buttonCode;
            eventObj.relatedTarget = settings.relatedElement;
            eventObj.type = kind;
        }
        return eventObj;
    }

    function _craftKeyboardEvent(kind, settings) {
        let eventObj;

        if (typeof KeyboardEvent === 'function') {
            eventObj = new KeyboardEvent(kind, {
                bubbles: settings.bubbleUp,
                cancelable: settings.cancelableAction,
                view: settings.displayWindow,
                ctrlKey: settings.controlKey,
                altKey: settings.altKey,
                shiftKey: settings.shiftKey,
                metaKey: settings.metaKey,
                keyCode: settings.keyIdentifier,
                charCode: settings.characterCode
            });
        }
        else if (typeof document.createEvent === 'function') {
            try {
                eventObj = document.createEvent("KeyEvents");
                eventObj.initKeyEvent(kind, settings.bubbleUp, settings.cancelableAction, settings.displayWindow,
                    settings.controlKey, settings.altKey, settings.shiftKey, settings.metaKey,
                    settings.keyIdentifier, settings.characterCode);
            } catch (err) {
                eventObj = document.createEvent("Events");
                eventObj.initEvent(kind, settings.bubbleUp, settings.cancelableAction);
                eventObj.view = settings.displayWindow;
                eventObj.ctrlKey = settings.controlKey;
                eventObj.altKey = settings.altKey;
                eventObj.shiftKey = settings.shiftKey;
                eventObj.metaKey = settings.metaKey;
                eventObj.keyCode = settings.keyIdentifier;
                eventObj.charCode = settings.characterCode;
            }
        }
        else if (typeof document.createEventObject === 'function') {
            eventObj = document.createEventObject();
            eventObj.bubbles = settings.bubbleUp;
            eventObj.cancelBubble = !settings.cancelableAction;
            eventObj.view = settings.displayWindow;
            eventObj.ctrlKey = settings.controlKey;
            eventObj.altKey = settings.altKey;
            eventObj.shiftKey = settings.shiftKey;
            eventObj.metaKey = settings.metaKey;
            eventObj.keyCode = settings.keyIdentifier;
            eventObj.charCode = settings.characterCode;
            eventObj.type = kind;

            if (eventObj.charCode > 0) {
                eventObj.keyCode = eventObj.charCode;
                eventObj.charCode = undefined;
            }
        }
        return eventObj;
    }

    function _calculateCentralPoint(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        return {
            xCoord: rect.left + rect.width / 2,
            yCoord: rect.top + rect.height / 2
        };
    }

    function _initiateDrag(targetElement, settings) {
        const central = _calculateCentralPoint(targetElement);
        let currentX = Math.floor(central.xCoord);
        let currentY = Math.floor(central.yCoord);
        const deltaX = settings.dx;
        const deltaY = settings.dy;

        let mousePosition = { xClient: currentX, yClient: currentY };
        _processEventSequence(targetElement, "mousedown", mousePosition);

        mousePosition = { xClient: currentX + 1, yClient: currentY + 1 };
        _processEventSequence(document, "mousemove", mousePosition);

        mousePosition = { xClient: currentX + deltaX, yClient: currentY + deltaY };
        _processEventSequence(document, "mousemove", mousePosition);
        _processEventSequence(document, "mousemove", mousePosition);

        _processEventSequence(targetElement, "mouseup", mousePosition);
    }

    function _processEventSequence(targetElement, actionType, eventSettings) {
        const finalSettings = _combineSettings(defaultConfiguration, eventSettings);

        if (actionType === 'drag') {
            _initiateDrag(targetElement, finalSettings);
        } else {
            const eventInstance = _buildEventObject(actionType, finalSettings);
            if (eventInstance) {
                _sendEventToElement(targetElement, eventInstance, actionType);
            }
        }
    }

    virtualInput.trigger = function(targetSource, actionType, eventSettings = {}) {
        const elementsToAffect = _identifyTargets(targetSource);
        elementsToAffect.forEach(element => {
            _processEventSequence(element, actionType, eventSettings);
        });
        return targetSource;
    };

    virtualInput.keyCodes = keyConstants;
    virtualInput.defaultOptions = defaultConfiguration;

    if (typeof window !== 'undefined') {
        window.syntheticInput = virtualInput;
    }
})();