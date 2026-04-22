(function (universalRenderer) {
    var obtainRenderFunction = function (layoutDefinition) {
        return function(primaryContext, auxiliaryHandlers, nestedFragments, runtimeData) {
            var typeCheckFunction = "function",
                defaultFallback = function() { return ""; },
                htmlSanitizer = function(valueToSanitize) {
                    if (valueToSanitize == null) return "";
                    var stringRepresentation = String(valueToSanitize);
                    var replacementMap = {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        "\"": "&quot;",
                        "'": "&#x27;",
                        "`": "&#x60;"
                    };
                    return stringRepresentation.replace(/[&<>"'`]/g, function(character) {
                        return replacementMap[character];
                    });
                };
            
            return layoutDefinition.renderFunction(primaryContext, auxiliaryHandlers, nestedFragments, runtimeData, typeCheckFunction, defaultFallback, htmlSanitizer);
        };
    };

    var compiledLayouts = universalRenderer.templateStorage = universalRenderer.templateStorage || {};

    compiledLayouts['commentEntryLayout'] = obtainRenderFunction({
        renderFunction: function(primaryContext, auxiliaryHandlers, nestedFragments, runtimeData, typeCheckFunction, defaultFallback, htmlSanitizer) {
            var resolvedDynamicContent;

            if (auxiliaryHandlers && auxiliaryHandlers.dynamicContent) {
                resolvedDynamicContent = auxiliaryHandlers.dynamicContent;
            } else if (primaryContext != null && primaryContext.dynamicContent) {
                resolvedDynamicContent = primaryContext.dynamicContent;
            } else {
                resolvedDynamicContent = defaultFallback;
            }

            var finalContentValue;
            if (typeof resolvedDynamicContent === typeCheckFunction) {
                finalContentValue = resolvedDynamicContent.call(primaryContext, {
                    propertyName: "dynamicContent",
                    optionsObject: {},
                    inputContext: runtimeData
                });
            } else {
                finalContentValue = resolvedDynamicContent;
            }

            return "<section class=\"input-section\"><form method=\"post\">"
                + htmlSanitizer(finalContentValue)
                + "</form></section>";
        }
    });

    compiledLayouts['individualUserDisplay'] = obtainRenderFunction({
        renderFunction: function(primaryContext, auxiliaryHandlers, nestedFragments, runtimeData, typeCheckFunction, defaultFallback, htmlSanitizer) {
            var resolvedDynamicContent;

            if (auxiliaryHandlers && auxiliaryHandlers.dynamicContent) {
                resolvedDynamicContent = auxiliaryHandlers.dynamicContent;
            } else if (primaryContext != null && primaryContext.dynamicContent) {
                resolvedDynamicContent = primaryContext.dynamicContent;
            } else {
                resolvedDynamicContent = defaultFallback;
            }

            var finalContentValue;
            if (typeof resolvedDynamicContent === typeCheckFunction) {
                finalContentValue = resolvedDynamicContent.call(primaryContext, {
                    propertyName: "dynamicContent",
                    optionsObject: {},
                    inputContext: runtimeData
                });
            } else {
                finalContentValue = resolvedDynamicContent;
            }

            return "<div class=\"user-item-wrapper\"><span class=\"user-display\">"
                + htmlSanitizer(finalContentValue)
                + "</span></div>";
        }
    });

    return compiledLayouts;

}(window.UniversalRenderer = window.UniversalRenderer || {}));