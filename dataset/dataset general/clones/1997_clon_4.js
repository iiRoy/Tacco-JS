class ArrangementEngine {
    constructor(windowContext, documentContext) {
        const layoutConstants = {
            uniqueElementAttribute: "data-layout-id",
            parentLinkAttribute: "data-layout-parent",
            emptyString: "",
            spaceString: " ",
            placeholderToken: "$1",
            paddingRightKey: "paddingRight",
            paddingBottomKey: "paddingBottom",
            paddingLeftKey: "paddingLeft",
            paddingTopKey: "paddingTop",
            borderRightKey: "borderRightWidth",
            borderBottomKey: "borderBottomWidth",
            borderLeftKey: "borderLeftWidth",
            borderTopKey: "borderTopWidth",
            horizontalAxis: "horizontal",
            verticalAxis: "vertical",
            inlineDirection: "inline-axis",
            blockDirection: "block-axis",
            inheritValue: "inherit",
            leftAlignment: "left",
            closingBrace: "}",
            prefixList: ["-o-", "-moz-", "-ms-", "-webkit-", "-khtml-"],
            defaultProperties: {
                orientation: "horizontal",
                alignment: "stretch",
                flowDirection: "inherit",
                contentPacking: "start"
            },
            nodeBlacklist: ["script", "style", "link"]
        };

        const layoutPatterns = {
            whitespaceChars: /\t|\n|\r/g,
            selectorPropertyBlock: /(.*?)\{([^}]+)\}/g,
            propertyValueSplit: /;/,
            propKeyValSplit: /:/,
            leadingTrailingWhitespace: /^\s+|\s+$/g,
            internalWhitespaceTrim: /\s?([\{\:\}])\s?/g,
            complexSelectorCheck: /\s?(\#|\.|\[|\:(\:)?[^first\-(line|letter)|before|after]+)/g
        };

        let currentElementId = 0;
        let activeSelectorUtility = null;
        let browserSpecifics = this._detectBrowser(windowContext.navigator.userAgent);

        const selectorEngines = new Map([
            ["NWMatcher", { check: () => windowContext.NW && windowContext.NW.Dom && windowContext.NW.Dom.select, selector: () => windowContext.NW.Dom.select }],
            ["DOMAssistant", { check: () => windowContext.DOMAssistant && windowContext.DOMAssistant.$, selector: () => windowContext.DOMAssistant.$, ready: (handler) => windowContext.DOMAssistant.DOMReady(handler) }],
            ["PrototypeJS", { check: () => windowContext.$$ && windowContext.document.observe, selector: () => windowContext.$$, ready: (handler) => windowContext.document.observe("dom:loaded", handler) }],
            ["YUI", { check: () => windowContext.YAHOO && windowContext.YAHOO.util && windowContext.YAHOO.util.Selector.query, selector: () => windowContext.YAHOO.util.Selector.query, ready: (handler) => windowContext.YAHOO.util.Event.onDOMReady(handler) }],
            ["MooTools", { check: () => windowContext.$$ && windowContext.window.addEvent, selector: () => windowContext.$$, ready: (handler) => windowContext.window.addEvent("domready", handler) }],
            ["Sizzle", { check: () => windowContext.Sizzle, selector: () => windowContext.Sizzle }],
            ["jQuery", { check: () => windowContext.jQuery, selector: () => windowContext.jQuery, ready: (handler) => windowContext.jQuery(documentContext).ready(handler) }],
            ["Dojo", { check: () => windowContext.dojo && windowContext.dojo.query, selector: () => windowContext.dojo.query, ready: (handler) => windowContext.dojo.addOnLoad(handler) }]
        ]);

        this._cfg = layoutConstants;
        this._patterns = layoutPatterns;
        this._win = windowContext;
        this._doc = documentContext;
        this._currentId = currentElementId;
        this._selectorEngines = selectorEngines;
        this._browserInfo = browserSpecifics;

        this.identifiedContainers = new Map();
        this.identifiedItems = new Map();

        this._selectDomElements = this._initSelectorUtility();
        this._elementRegistry = new WeakMap();
    }

    _detectBrowser(userAgentString) {
        const msieMatch = /(msie) ([\w.]+)/.exec(userAgentString.toLowerCase());
        return {
            isIE: msieMatch ? parseInt(msieMatch[2], 10) : undefined
        };
    }

    _assignUniqueElementId(targetNode) {
        if (!this._elementRegistry.has(targetNode)) {
            this._currentId++;
            targetNode.setAttribute(this._cfg.uniqueElementAttribute, this._currentId);
            this._elementRegistry.set(targetNode, { internalId: this._currentId });
        }
    }

    _initSelectorUtility() {
        for (const [name, engineDef] of this._selectorEngines.entries()) {
            if (engineDef.check()) {
                activeSelectorUtility = {
                    name: name,
                    query: engineDef.selector(),
                    onReady: engineDef.ready
                };
                return activeSelectorUtility.query;
            }
        }
        activeSelectorUtility = {
            name: "Native",
            query: (selector) => Array.from(this._doc.querySelectorAll(selector)),
            onReady: (handler) => this._doc.addEventListener("DOMContentLoaded", handler)
        };
        return activeSelectorUtility.query;
    }

    _scheduleInitialization(handlerCallback) {
        if (activeSelectorUtility && activeSelectorUtility.onReady) {
            activeSelectorUtility.onReady(handlerCallback);
        } else {
            this._win.addEventListener("load", handlerCallback);
        }
    }

    _decomposeStyleSheet(cssText) {
        const processedText = cssText.replace(this._patterns.whitespaceChars, this._cfg.emptyString)
                                     .replace(this._patterns.internalWhitespaceTrim, this._cfg.placeholderToken);
        const ruleMatches = [...processedText.matchAll(this._patterns.selectorPropertyBlock)];

        return ruleMatches.map(match => {
            const selectorPart = match[1].trim();
            const propertiesPart = match[2];

            const propertyList = propertiesPart.split(this._patterns.propertyValueSplit)
                .filter(Boolean)
                .map(propStr => {
                    const parts = propStr.split(this._patterns.propKeyValSplit);
                    return parts.length === 2 ? {
                        propKey: parts[0].trim(),
                        propValue: parts[1].trim()
                    } : null;
                })
                .filter(Boolean);

            return {
                targetSelector: selectorPart,
                declarations: propertyList
            };
        });
    }

    _categorizeLayoutRules(parsedRules) {
        const layoutContainers = new Map();
        const layoutItems = new Map();

        parsedRules.forEach(rule => {
            const selectors = rule.targetSelector.split(',').map(s => s.trim());

            selectors.forEach(singleSelector => {
                let isContainer = false;
                let itemProperties = {};

                rule.declarations.forEach(decl => {
                    const normalizedProp = decl.propKey.replace("box-", this._cfg.emptyString);

                    switch (normalizedProp) {
                        case "display":
                            if (decl.propValue === "box") {
                                isContainer = true;
                            }
                            break;
                        case "orient":
                        case "align":
                        case "direction":
                        case "pack":
                            isContainer = true;
                            break;
                        case "flex":
                        case "flex-group":
                        case "ordinal-group":
                            itemProperties[normalizedProp] = decl.propValue;
                            break;
                    }
                });

                if (isContainer) {
                    if (!layoutContainers.has(singleSelector)) {
                        layoutContainers.set(singleSelector, { targetSelector: singleSelector, declarations: [] });
                    }
                    layoutContainers.get(singleSelector).declarations.push(...rule.declarations);
                }

                if (Object.keys(itemProperties).length > 0) {
                    if (!layoutItems.has(singleSelector)) {
                        layoutItems.set(singleSelector, { targetSelector: singleSelector, declarations: [] });
                    }
                    Object.entries(itemProperties).forEach(([key, value]) => {
                        layoutItems.get(singleSelector).declarations.push({ propKey: key, propValue: value });
                    });
                }
            });
        });

        this.identifiedContainers = layoutContainers;
        this.identifiedItems = layoutItems;
    }

    _locateMatchingChildren(parentElement, potentialItemRules) {
        const matchedChildren = [];

        potentialItemRules.forEach(itemRule => {
            if (!itemRule.targetSelector) {
                if (itemRule.node && itemRule.node.parentNode === parentElement) {
                    this._assignUniqueElementId(itemRule.node);
                    matchedChildren.push({ element: itemRule.node, properties: itemRule.declarations });
                }
                return;
            }

            const foundElements = this._selectDomElements(itemRule.targetSelector);

            foundElements.forEach(foundNode => {
                if (foundNode.parentNode === parentElement && !this._cfg.nodeBlacklist.includes(foundNode.nodeName.toLowerCase())) {
                    this._assignUniqueElementId(foundNode);
                    matchedChildren.push({ element: foundNode, properties: itemRule.declarations });
                }
            });
        });
        return matchedChildren;
    }

    processCssString(cssInput) {
        const rules = this._decomposeStyleSheet(cssInput);
        this._categorizeLayoutRules(rules);
    }

    getLayoutContainers() {
        return Array.from(this.identifiedContainers.values());
    }

    getLayoutItems(parentDomElement = null) {
        const items = Array.from(this.identifiedItems.values());
        if (parentDomElement) {
            return this._locateMatchingChildren(parentDomElement, items.map(item => ({
                targetSelector: item.targetSelector,
                declarations: item.declarations
            })));
        }
        return items;
    }
}

const layoutManager = new ArrangementEngine(window, document);

const PublicLayoutAPI = {
    initialize: function(cssString) {
        layoutManager._scheduleInitialization(() => {
            layoutManager.processCssString(cssString);
        });
    },
    getContainers: function() {
        return layoutManager.getLayoutContainers();
    },
    getItemsForParent: function(parent) {
        return layoutManager.getLayoutItems(parent);
    }
};

window.LayoutService = PublicLayoutAPI;