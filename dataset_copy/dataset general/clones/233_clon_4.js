(function () {
    "use strict";

    const isTruthyVal = function (val) {
        if (val && String(val).length !== 0) {
            const normalized = String(val).toLowerCase();
            return !(normalized === 'f' || normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'n' || normalized === '[]');
        }
        return false;
    };

    const getPropValue = function (obj, path) {
        if (!obj || typeof path !== 'string') return undefined;
        const segments = path.split('.');
        let current = obj;
        for (let i = 0; i < segments.length; i++) {
            if (current === null || typeof current !== 'object' || !current.hasOwnProperty(segments[i])) {
                return undefined;
            }
            current = current[segments[i]];
        }
        return current;
    };

    const applyInterpolation = function (template, context) {
        if (typeof template !== 'string') return template;
        return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, expr) => {
            const val = getPropValue(context, expr);
            return val !== undefined ? String(val) : '';
        });
    };

    const ElementBinder = (function () {
        const attributeProcessors = {};
        const specialElementProcessors = {};

        const registerProcessor = function (attrName, handlerFunction, isSpecialElementProcessor = false) {
            if (isSpecialElementProcessor) {
                specialElementProcessors[attrName] = handlerFunction;
            } else {
                attributeProcessors[attrName] = handlerFunction;
            }
        };

        registerProcessor('data-once-content-text', (el, expr, ctx) => {
            const val = getPropValue(ctx, expr);
            if (val !== undefined) el.textContent = String(val);
        });

        registerProcessor('data-once-content-html', (el, expr, ctx) => {
            const val = getPropValue(ctx, expr);
            if (val !== undefined) el.innerHTML = String(val);
        });

        registerProcessor('data-once-classes', (el, expr, ctx) => {
            let val = getPropValue(ctx, expr);
            if (typeof val === 'object' && !Array.isArray(val)) {
                const classList = [];
                for (const key in val) {
                    if (Object.prototype.hasOwnProperty.call(val, key) && isTruthyVal(val[key])) {
                        classList.push(key);
                    }
                }
                val = classList.join(' ');
            } else if (Array.isArray(val)) {
                val = val.join(' ');
            }
            if (val) el.classList.add(...String(val).split(' ').filter(c => c));
        });

        registerProcessor('data-once-inline-style', (el, expr, ctx) => {
            const val = getPropValue(ctx, expr);
            if (val !== undefined) {
                if (typeof val === 'object' && val !== null) {
                    for (const prop in val) {
                        if (Object.prototype.hasOwnProperty.call(val, prop)) {
                            el.style[prop] = val[prop];
                        }
                    }
                } else if (typeof val === 'string') {
                    el.style.cssText = val;
                }
            }
        });

        const visibilityHandler = (el, expr, ctx, isHidden) => {
            const val = isTruthyVal(getPropValue(ctx, expr));
            el.style.display = (isHidden ? !val : val) ? '' : 'none';
        };
        registerProcessor('data-once-show', (el, expr, ctx) => visibilityHandler(el, expr, ctx, false));
        registerProcessor('data-once-hide', (el, expr, ctx) => visibilityHandler(el, expr, ctx, true));

        registerProcessor('data-once-disabled-state', (el, expr, ctx) => {
            const val = isTruthyVal(getPropValue(ctx, expr));
            el.disabled = val;
        });

        const commonAttributeHandler = (el, attrName, expr, ctx, interpolate = false) => {
            let val = getPropValue(ctx, expr);
            if (interpolate) val = applyInterpolation(val, ctx);
            if (val !== undefined) el.setAttribute(attrName, String(val));
        };
        registerProcessor('data-once-image-src', (el, expr, ctx) => commonAttributeHandler(el, 'src', expr, ctx));
        registerProcessor('data-once-image-src-interpolated', (el, expr, ctx) => commonAttributeHandler(el, 'src', expr, ctx, true));
        registerProcessor('data-once-hyperlink-ref', (el, expr, ctx) => commonAttributeHandler(el, 'href', expr, ctx));
        registerProcessor('data-once-hyperlink-ref-interpolated', (el, expr, ctx) => commonAttributeHandler(el, 'href', expr, ctx, true));
        registerProcessor('data-once-image-alt', (el, expr, ctx) => commonAttributeHandler(el, 'alt', expr, ctx));
        registerProcessor('data-once-tooltip-text', (el, expr, ctx) => commonAttributeHandler(el, 'title', expr, ctx));
        registerProcessor('data-once-element-id', (el, expr, ctx) => commonAttributeHandler(el, 'id', expr, ctx));
        registerProcessor('data-once-form-value', (el, expr, ctx) => commonAttributeHandler(el, 'value', expr, ctx));

        registerProcessor('data-once-custom-attribute-', (el, attrKey, ctx) => {
            const originalAttr = el.getAttribute(attrKey);
            const targetAttrName = attrKey.substring('data-once-custom-attribute-'.length).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            const val = getPropValue(ctx, originalAttr);
            if (val !== undefined) el.setAttribute(targetAttrName, String(val));
        }, true);

        registerProcessor('data-once-conditional', (el, expr, ctx) => {
            const condition = isTruthyVal(getPropValue(ctx, expr));
            if (!condition) {
                el.remove();
            } else {
                processNode(el, ctx);
            }
        }, true);

        registerProcessor('data-once-selector', (el, expr, ctx) => {
            const selectorValue = String(getPropValue(ctx, expr));
            const childOptions = [];
            let defaultOption = null;

            for (let i = el.children.length - 1; i >= 0; i--) {
                const child = el.children[i];
                const caseValue = child.getAttribute('data-once-selector-case');
                const isDefault = child.hasAttribute('data-once-selector-default');

                if (caseValue !== null) {
                    childOptions.push({ case: caseValue, element: child });
                    child.remove();
                } else if (isDefault) {
                    defaultOption = { element: child };
                    child.remove();
                }
            }

            let selectedChild = null;
            for (const opt of childOptions) {
                if (String(opt.case) === selectorValue) {
                    selectedChild = opt.element;
                    break;
                }
            }

            if (!selectedChild && defaultOption) {
                selectedChild = defaultOption.element;
            }

            if (selectedChild) {
                el.appendChild(selectedChild);
                processNode(selectedChild, ctx);
            }
        }, true);

        const processNode = function (node, context) {
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const element = node;
            const attributes = element.attributes;
            let skipChildren = false;

            for (const specialAttr in specialElementProcessors) {
                if (Object.prototype.hasOwnProperty.call(specialElementProcessors, specialAttr)) {
                    if (specialAttr.endsWith('-') && Array.from(attributes).some(attr => attr.name.startsWith(specialAttr))) {
                        const matchedAttr = Array.from(attributes).find(attr => attr.name.startsWith(specialAttr));
                        if (matchedAttr) {
                            specialElementProcessors[specialAttr](element, matchedAttr.name, context);
                            if (specialAttr === 'data-once-conditional' && !isTruthyVal(getPropValue(context, element.getAttribute(matchedAttr.name)))) {
                                return;
                            }
                            if (specialAttr === 'data-once-selector') {
                                skipChildren = true;
                            }
                        }
                    } else if (element.hasAttribute(specialAttr)) {
                        const attrValue = element.getAttribute(specialAttr);
                        specialElementProcessors[specialAttr](element, attrValue, context);
                        if (specialAttr === 'data-once-conditional' && !isTruthyVal(getPropValue(context, attrValue))) {
                            return;
                        }
                        if (specialAttr === 'data-once-selector') {
                            skipChildren = true;
                        }
                    }
                }
            }

            Array.from(attributes).forEach(attr => {
                if (attr.name.startsWith('data-once-custom-attribute-')) {
                    attributeProcessors['data-once-custom-attribute-'](element, attr.name, context);
                    return;
                }

                const handler = attributeProcessors[attr.name];
                if (handler) {
                    handler(element, attr.value, context);
                }
            });

            if (!skipChildren) {
                Array.from(element.children).forEach(child => processNode(child, context));
            }
        };

        return {
            executeSingleRender: function (rootElement, dataContext) {
                if (!rootElement || !dataContext) return;

                const potentialPromise = dataContext;
                if (potentialPromise && typeof potentialPromise.then === 'function') {
                    potentialPromise.then(resolvedData => {
                        processNode(rootElement, resolvedData);
                    });
                } else {
                    processNode(rootElement, dataContext);
                }
            }
        };
    })();

    window.initiateOneTimeDOMRender = ElementBinder.executeSingleRender;
})();