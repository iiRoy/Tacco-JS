var AppNexus = AppNexus || {};

AppNexus.Config = {
    IsVerbose: false
};

AppNexus.EventSystem = (function($) {
    const oneShotSignals = new Set();

    function parseSubscriptionArgs(signalNames, handlerOrSelector, actualHandler, auxiliaryPayload) {
        let subscriptionDetails = [];
        let delegateSelector = null;
        let eventData = null;

        if (typeof handlerOrSelector === 'function') {
            const primaryHandler = handlerOrSelector;

            if (typeof signalNames === 'object' && !Array.isArray(signalNames)) {
                Object.keys(signalNames).forEach(name => {
                    subscriptionDetails.push({ name: name, handler: signalNames[name] });
                });
            } else {
                const names = Array.isArray(signalNames) ? signalNames : [signalNames];
                names.forEach(name => {
                    subscriptionDetails.push({ name: name, handler: primaryHandler });
                });
            }
        } else {
            delegateSelector = handlerOrSelector;
            eventData = auxiliaryPayload;
            const primaryHandler = actualHandler;

            const names = Array.isArray(signalNames) ? signalNames : [signalNames];
            names.forEach(name => {
                subscriptionDetails.push({ name: name, handler: primaryHandler });
            });
        }
        return { subscriptionDetails, delegateSelector, eventData };
    }

    return {
        AttachSignalListener: function(signalNames, handlerOrSelector, actualHandler, auxiliaryPayload) {
            "use strict";
            const { subscriptionDetails, delegateSelector, eventData } = parseSubscriptionArgs(signalNames, handlerOrSelector, actualHandler, auxiliaryPayload);

            subscriptionDetails.forEach(detail => {
                const eventName = detail.name;
                const handler = detail.handler;

                if (delegateSelector) {
                    $(document).on(eventName, delegateSelector, eventData, handler);
                } else if (eventData) {
                    $(document).on(eventName, eventData, handler);
                } else {
                    $(document).on(eventName, handler);
                }

                if (oneShotSignals.has(eventName)) {
                    AppNexus.EventSystem.EmitSignal(eventName, []);
                }
            });
        },

        DetachSignalListener: function(signalNames, targetSelector) {
            "use strict";
            const names = Array.isArray(signalNames) ? signalNames : [signalNames];
            names.forEach(name => {
                $(document).off(name, targetSelector);
            });
        },

        EmitSignal: function(signalIdentifier, supplementaryArguments, flagAsOneTime) {
            "use strict";
            AppNexus.Utility.RecordActivity('broadcasting ' + signalIdentifier, 'info');

            let argsForDispatch = Array.isArray(supplementsaryArguments) ? supplementaryArguments : [];
            argsForDispatch.unshift($);

            $(document).trigger(signalIdentifier, argsForDispatch);

            if (flagAsOneTime) {
                oneShotSignals.add(signalIdentifier);
            }
        }
    };
})(window.jQuery);

AppNexus.Utility = {
    RecordActivity: function(messageText, levelIndicator) {
        "use strict";
        if (AppNexus.Config.IsVerbose) {
            const effectiveLevel = levelIndicator || 'log';
            const consoleMethods = {
                'log': console.log,
                'info': console.info,
                'debug': console.debug,
                'error': console.error,
                'warn': console.warn
            };
            if (window.console && typeof consoleMethods[effectiveLevel] === 'function') {
                consoleMethods[effectiveLevel](messageText);
            }
        }
    }
};

AppNexus.Viewport = (function($) {
    const layoutThresholds = [
        { label: 'tiny', point: 0 },
        { label: 'small', point: 480 },
        { label: 'medium', point: 750 },
        { label: 'large', point: 896 },
        { label: 'xlarge', point: 992 },
        { label: 'xxlarge', point: 1120 }
    ].sort((a, b) => a.point - b.point);

    return {
        QueryActiveState: function() {
            "use strict";
            return $.fn.whim('currentBreakpoint');
        },

        ObtainContextualSetting: function(valueMap) {
            "use strict";
            if (!valueMap) { return undefined; }

            const currentLayout = AppNexus.Viewport.QueryActiveState();
            const currentThreshold = layoutThresholds.find(t => t.label === currentLayout)?.point || 0;

            const { resolvedSetting } = layoutThresholds.reduce((accumulator, thresholdEntry) => {
                if (accumulator.stopProcessing) {
                    return accumulator;
                }

                if (thresholdEntry.point < 1 || (!accumulator.continueSearch && thresholdEntry.point > currentThreshold)) {
                    return accumulator;
                }

                const directValue = valueMap[thresholdEntry.point];
                if (typeof directValue !== "undefined") {
                    accumulator.resolvedSetting = directValue;
                    accumulator.continueSearch = false;
                } else if (thresholdEntry.point === currentThreshold) {
                    accumulator.continueSearch = true;
                }
                return accumulator;
            }, {
                resolvedSetting: valueMap["default"],
                continueSearch: false,
                stopProcessing: false
            });

            return resolvedSetting;
        },

        IsLargeLayout: function() {
            "use strict";
            return AppNexus.Viewport.QueryActiveState().includes('large');
        },

        IsSmallLayout: function() {
            "use strict";
            return AppNexus.Viewport.QueryActiveState().includes('small');
        }
    };
})(window.jQuery);