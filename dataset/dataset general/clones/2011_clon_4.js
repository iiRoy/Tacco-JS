(function(jqGlobal, absentValue) {

jqGlobal.componentKit = jqGlobal.componentKit || {};
if (jqGlobal.componentKit.releaseNumber) {
    return;
}

jqGlobal.extend(jqGlobal.componentKit, {
    releaseNumber: "1.8.10_reimagined",

    keyIdentifierMap: {
        ACTION_ALT: 18,
        ACTION_BACKSPACE: 8,
        ACTION_CAPS_LOCK: 20,
        ACTION_COMMA: 188,
        ACTION_COMMAND: 91,
        ACTION_COMMAND_LEFT: 91,
        ACTION_COMMAND_RIGHT: 93,
        ACTION_CONTROL: 17,
        ACTION_DELETE: 46,
        ACTION_DOWN: 40,
        ACTION_END: 35,
        ACTION_ENTER: 13,
        ACTION_ESCAPE: 27,
        ACTION_HOME: 36,
        ACTION_INSERT: 45,
        ACTION_LEFT: 37,
        ACTION_MENU_KEY: 93,
        ACTION_NUMPAD_ADD: 107,
        ACTION_NUMPAD_DECIMAL: 110,
        ACTION_NUMPAD_DIVIDE: 111,
        ACTION_NUMPAD_ENTER: 108,
        ACTION_NUMPAD_MULTIPLY: 106,
        ACTION_NUMPAD_SUBTRACT: 109,
        ACTION_PAGE_DOWN: 34,
        ACTION_PAGE_UP: 33,
        ACTION_PERIOD: 190,
        ACTION_RIGHT: 39,
        ACTION_SHIFT: 16,
        ACTION_SPACE: 32,
        ACTION_TAB: 9,
        ACTION_UP: 38,
        ACTION_WINDOWS: 91
    }
});

jqGlobal.fn.augment = jqGlobal.fn.augment || {};

const originalFocusMethod = jqGlobal.fn.focus;
jqGlobal.fn.focus = function(delayInterval, callbackFunction) {
    if (typeof delayInterval === "number") {
        return this.each(function() {
            const currentItem = this;
            window.setTimeout(function() {
                jqGlobal(currentItem)[0].focus();
                if (callbackFunction) {
                    callbackFunction.call(currentItem);
                }
            }, delayInterval);
        });
    } else {
        return originalFocusMethod.apply(this, arguments);
    }
};

jqGlobal.fn.findScrollContainer = function() {
    const targetElement = this[0];
    if (!targetElement) return jqGlobal(document);

    const computedStyle = window.getComputedStyle(targetElement);
    const elementPosition = computedStyle.position;

    let scrollCandidate = null;

    const isPositionalCase = (elementPosition === 'absolute') || (elementPosition === 'relative' && (jqGlobal.browser && jqGlobal.browser.msie));

    let ancestorNode = targetElement.parentNode;
    while (ancestorNode && ancestorNode.nodeType === 1 && ancestorNode !== document) {
        const ancestorStyle = window.getComputedStyle(ancestorNode);
        const ancestorPosition = ancestorStyle.position;
        const overflowProperties = ancestorStyle.overflow + ancestorStyle.overflowY + ancestorStyle.overflowX;

        if (isPositionalCase) {
            if (['relative', 'absolute', 'fixed'].includes(ancestorPosition) && ['auto', 'scroll'].some(val => overflowProperties.includes(val))) {
                scrollCandidate = ancestorNode;
                break;
            }
        } else {
            if (['auto', 'scroll'].some(val => overflowProperties.includes(val))) {
                scrollCandidate = ancestorNode;
                break;
            }
        }
        ancestorNode = ancestorNode.parentNode;
    }

    const isFixedPosition = elementPosition === 'fixed';
    if (isFixedPosition || !scrollCandidate) {
        return jqGlobal(document);
    } else {
        return jqGlobal(scrollCandidate);
    }
};

jqGlobal.fn.retrieveVisualLayer = function(newLayerValue) {
    if (newLayerValue !== absentValue) {
        return this.css("zIndex", newLayerValue);
    }

    if (this.length === 0) {
        return 0;
    }

    let currentItemWrapper = this.eq(0);
    let layerDepth = 0;

    while (currentItemWrapper.length && currentItemWrapper[0] !== document) {
        const itemStyle = window.getComputedStyle(currentItemWrapper[0]);
        const itemPosition = itemStyle.position;

        if (itemPosition === "absolute" || itemPosition === "relative" || itemPosition === "fixed") {
            const parsedLayer = Number.parseInt(itemStyle.zIndex, 10);
            if (!Number.isNaN(parsedLayer) && parsedLayer !== 0) {
                layerDepth = parsedLayer;
                break;
            }
        }
        currentItemWrapper = currentItemWrapper.parent();
    }
    return layerDepth;
};

jqGlobal.fn.inhibitSelection = function() {
    return this.bind((jqGlobal.support.selectionStartEvent ? "selectstart" : "mousedown") +
        ".compkit-noSelect", function(evt) {
            evt.preventDefault();
        });
};

jqGlobal.fn.allowSelection = function() {
    return this.unbind(".compkit-noSelect");
};

jqGlobal.each(["DimensionWidth", "DimensionHeight"], function(idx, dimensionLabel) {
    const axisSides = dimensionLabel === "DimensionWidth" ? ["Left", "Right"] : ["Top", "Bottom"];
    const propertyType = dimensionLabel.toLowerCase().replace("dimension", "");
    const originalDimensionMethods = {
        innerDimensionWidth: jqGlobal.fn.innerWidth,
        innerDimensionHeight: jqGlobal.fn.innerHeight,
        outerDimensionWidth: jqGlobal.fn.outerWidth,
        outerDimensionHeight: jqGlobal.fn.outerHeight
    };

    function calculateReducedSize(targetItem, baseSize, includeBorder, includeMargin) {
        let reducedValue = baseSize;
        axisSides.forEach(function(sideKey) {
            reducedValue -= parseFloat(jqGlobal.css(targetItem, "padding" + sideKey, true)) || 0;
            if (includeBorder) {
                reducedValue -= parseFloat(jqGlobal.css(targetItem, "border" + sideKey + "Width", true)) || 0;
            }
            if (includeMargin) {
                reducedValue -= parseFloat(jqGlobal.css(targetItem, "margin" + sideKey, true)) || 0;
            }
        });
        return reducedValue;
    }

    jqGlobal.fn["inner" + dimensionLabel] = function(sizeValue) {
        if (sizeValue === absentValue) {
            return originalDimensionMethods["inner" + dimensionLabel].call(this);
        }

        return this.each(function() {
            jqGlobal(this).css(propertyType, calculateReducedSize(this, sizeValue) + "px");
        });
    };

    jqGlobal.fn["outer" + dimensionLabel] = function(sizeValue, withMargin) {
        if (typeof sizeValue !== "number") {
            return originalDimensionMethods["outer" + dimensionLabel].call(this, sizeValue);
        }

        return this.each(function() {
            jqGlobal(this).css(propertyType, calculateReducedSize(this, sizeValue, true, withMargin) + "px");
        });
    };
});

function checkVisibility(targetElement) {
    let current = targetElement;
    while (current && current.nodeType === 1 && current !== document) {
        const computed = window.getComputedStyle(current);
        if (computed.visibility === 'hidden' || computed.display === 'none' || current.offsetWidth === 0 && current.offsetHeight === 0) {
            return false;
        }
        current = current.parentNode;
    }
    return true;
}

jqGlobal.extend(jqGlobal.expr[":"], {
    hasDataAttribute: function(elemNode, index, matchInfo) {
        return !!jqGlobal.data(elemNode, matchInfo[3]);
    },

    canReceiveFocus: function(elemNode) {
        const tagName = elemNode.tagName.toLowerCase();
        const tabIndexValue = jqGlobal.attr(elemNode, "tabindex");
        if ("area" === tagName) {
            const parentMap = elemNode.parentNode;
            const mapName = parentMap.name;
            let targetImage;
            if (!elemNode.href || !mapName || parentMap.tagName.toLowerCase() !== "map") {
                return false;
            }
            targetImage = jqGlobal("img[usemap=#" + mapName + "]")[0];
            return !!targetImage && checkVisibility(targetImage);
        }
        return ( /input|select|textarea|button|object/.test( tagName )
            ? !elemNode.disabled
            : "a" == tagName
                ? elemNode.href || !Number.isNaN( tabIndexValue )
                : !Number.isNaN( tabIndexValue ))
            && checkVisibility( elemNode );
    },

    isTabAccessible: function(elemNode) {
        const tabIdx = jqGlobal.attr(elemNode, "tabindex");
        return ( Number.isNaN( tabIdx ) || tabIdx >= 0 ) && jqGlobal( elemNode ).is( ":canReceiveFocus" );
    }
});

jqGlobal(function() {
    const bodyContainer = document.body;
    let testDiv = bodyContainer.appendChild(document.createElement("div"));

    jqGlobal.extend(testDiv.style, {
        minHeight: "100px",
        height: "auto",
        padding: "0",
        borderWidth: "0"
    });

    jqGlobal.support.minimumHeightCapability = testDiv.offsetHeight === 100;
    jqGlobal.support.selectionStartEvent = "onselectstart" in testDiv;

    bodyContainer.removeChild(testDiv).style.display = "none";
});

jqGlobal.extend(jqGlobal.componentKit, {
    componentPluginSystem: {
        register: function(componentId, componentOption, methodSet) {
            const componentProto = jqGlobal.componentKit[componentId].prototype;
            for (let methodKey in methodSet) {
                componentProto.extensionMethods = componentProto.extensionMethods || {};
                componentProto.extensionMethods[methodKey] = componentProto.extensionMethods[methodKey] || [];
                componentProto.extensionMethods[methodKey].push([componentOption, methodSet[methodKey]]);
            }
        },
        invoke: function(instanceRef, methodName, methodArgs) {
            const methodList = instanceRef.extensionMethods[methodName];
            if (!methodList || !instanceRef.hostElement[0].parentNode) {
                return;
            }

            for (let i = 0; i < methodList.length; i++) {
                if (instanceRef.componentSettings[methodList[i][0]]) {
                    methodList[i][1].apply(instanceRef.hostElement, methodArgs);
                }
            }
        }
    },

    checkNodeInclusion: function(parentItem, childItem) {
        if (!parentItem || !childItem) return false;
        if (parentItem === childItem) return false;

        return parentItem.compareDocumentPosition ?
            (parentItem.compareDocumentPosition(childItem) & 16) === 16 :
            parentItem.contains(childItem);
    },

    hasOverflowContent: function(containerElement, directionHint) {
        if (jqGlobal(containerElement).css("overflow") === "hidden") {
            return false;
        }

        const scrollProperty = (directionHint && directionHint === "left") ? "scrollLeft" : "scrollTop";
        let hasScrollable = false;

        if (containerElement[scrollProperty] > 0) {
            return true;
        }

        containerElement[scrollProperty] = 1;
        hasScrollable = (containerElement[scrollProperty] > 0);
        containerElement[scrollProperty] = 0;
        return hasScrollable;
    },

    isCoordOverAxis: function(coordinateValue, axisReference, axisSize) {
        return (coordinateValue > axisReference) && (coordinateValue < (axisReference + axisSize));
    },
    isPositionOver: function(yPos, xPos, topCoord, leftCoord, heightDim, widthDim) {
        return jqGlobal.componentKit.isCoordOverAxis(yPos, topCoord, heightDim) && jqGlobal.componentKit.isCoordOverAxis(xPos, leftCoord, widthDim);
    }
});

(function(jq, undefinedReference) {

    const originalDataCleaner = jq.cleanData;
    jq.cleanData = function(itemsForRemoval) {
        for (let idx = 0; idx < itemsForRemoval.length; idx++) {
            const currentItem = itemsForRemoval[idx];
            jq(currentItem).triggerHandler("componentRemoval");
        }
        originalDataCleaner(itemsForRemoval);
    };

    jq.componentConstructorFactory = function(componentIdName, basePrototypeItem, componentDefinition) {
        const nameParts = componentIdName.split(".");
        const primaryNamespace = nameParts[0];
        let componentIdentifier = nameParts[1];
        const fullComponentIdentifier = primaryNamespace + "_" + componentIdentifier;

        if (!componentDefinition) {
            componentDefinition = basePrototypeItem;
            basePrototypeItem = jq.BaseElementComponent;
        }

        jq.expr[":"][fullComponentIdentifier] = function(elementToTest) {
            return !!jq.data(elementToTest, componentIdentifier);
        };

        jq[primaryNamespace] = jq[primaryNamespace] || {};
        jq[primaryNamespace][componentIdentifier] = function(settingsObject, targetElementNode) {
            if (arguments.length) {
                this._initializeInstance(settingsObject, targetElementNode);
            }
        };

        const baseInstancePrototype = Object.create(basePrototypeItem.prototype);
        baseInstancePrototype.componentConfiguration = jq.extend(true, {}, baseInstancePrototype.componentConfiguration);

        jq[primaryNamespace][componentIdentifier].prototype = jq.extend(true, baseInstancePrototype, {
            componentNamespace: primaryNamespace,
            instanceIdentifier: componentIdentifier,
            instanceEventPrefix: jq[primaryNamespace][componentIdentifier].prototype.instanceEventPrefix || componentIdentifier,
            instanceBaseClass: fullComponentIdentifier
        }, componentDefinition);

        jq.componentConstructorFactory.connectToJQuery(componentIdentifier, jq[primaryNamespace][componentIdentifier]);
    };

    jq.componentConstructorFactory.connectToJQuery = function(componentKey, componentObject) {
        jq.fn[componentKey] = function(operationInstruction) {
            const isMethodOperation = typeof operationInstruction === "string";
            const operationArgs = Array.prototype.slice.call(arguments, 1);
            let operationResult = this;

            operationInstruction = !isMethodOperation && operationArgs.length ?
                jq.extend.apply(null, [true, operationInstruction].concat(operationArgs)) :
                operationInstruction;

            if (isMethodOperation && operationInstruction.charAt(0) === "_") {
                return operationResult;
            }

            if (isMethodOperation) {
                this.each(function() {
                    const componentReference = jq.data(this, componentKey);
                    let methodInvocationResult = componentReference && typeof componentReference[operationInstruction] === "function" ?
                        componentReference[operationInstruction].apply(componentReference, operationArgs) :
                        componentReference;

                    if (methodInvocationResult !== componentReference && methodInvocationResult !== undefinedReference) {
                        operationResult = methodInvocationResult;
                        return false;
                    }
                });
            } else {
                this.each(function() {
                    let componentReference = jq.data(this, componentKey);
                    if (componentReference) {
                        componentReference.configureSettings(operationInstruction || {})._refreshComponentState();
                    } else {
                        jq.data(this, componentKey, new componentObject(operationInstruction, this));
                    }
                });
            }
            return operationResult;
        };
    };

    jq.BaseElementComponent = function(settingsInput, attachedElement) {
        if (arguments.length) {
            this._initializeInstance(settingsInput, attachedElement);
        }
    };

    jq.BaseElementComponent.prototype = {
        instanceIdentifier: "baseElement",
        instanceEventPrefix: "",
        componentConfiguration: {
            isDisabled: false
        },
        _initializeInstance: function(settingsInput, attachedElement) {
            jq.data(attachedElement, this.instanceIdentifier, this);
            this.boundElement = jq(attachedElement);
            this.componentConfiguration = jq.extend(true, {},
                this.componentConfiguration,
                this._getInitialSettings(),
                settingsInput);

            const currentInstance = this;
            this.boundElement.bind("componentRemoval." + this.instanceIdentifier, function() {
                currentInstance.disposeComponent();
            });

            this._createInternalStructure();
            this._triggerInstanceEvent("creation");
            this._refreshComponentState();
        },
        _getInitialSettings: function() {
            return jq.metadata && jq.metadata.get(this.boundElement[0])[this.instanceIdentifier] || {};
        },
        _createInternalStructure: function() {},
        _refreshComponentState: function() {},

        disposeComponent: function() {
            this.boundElement
                .unbind("." + this.instanceIdentifier)
                .removeData(this.instanceIdentifier);
            this.getComponentPrimaryElement()
                .unbind("." + this.instanceIdentifier)
                .removeAttr("aria-disabled")
                .removeClass(
                    this.instanceBaseClass + "-disabled " +
                    "ui-state-disabled");
        },

        getComponentPrimaryElement: function() {
            return this.boundElement;
        },

        configureSettings: function(keyParam, valueParam) {
            let configOptions = keyParam;

            if (arguments.length === 0) {
                return jq.extend({}, this.componentConfiguration);
            }
            if (typeof keyParam === "string" && valueParam !== undefinedReference) {
                configOptions = {};
                configOptions[keyParam] = valueParam;
            }

            this.componentConfiguration = jq.extend(true, {}, this.componentConfiguration, configOptions);
            return this;
        },
        _triggerInstanceEvent: function(eventName, eventData) {
            this.boundElement.trigger(this.instanceEventPrefix + eventName, eventData);
        }
    };
})(jQuery);

})(jQuery);