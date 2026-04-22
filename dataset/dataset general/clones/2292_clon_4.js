var GlobalUtility = {
    obtainDomNode: function(input) {
        if (typeof input === 'string') {
            return document.getElementById(input);
        }
        return input;
    },
    mergeObjects: function(target, source) {
        target = target || {};
        source = source || {};
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
        return target;
    },
    FormatterCatalog: {
        upper: function(val) { return String(val).toUpperCase(); },
        lower: function(val) { return String(val).toLowerCase(); },
        capitalize: function(val) { return String(val).charAt(0).toUpperCase() + String(val).slice(1); },
        defaultValue: function(val, def) { return val === undefined || val === null || val === '' ? def : val; },
        trim: function(val) { return String(val).trim(); }
    }
};

var MarkupAssistant = (function() {
    var voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    var tableStructuralTags = new Set(['table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col']);

    var adjustElementVisuals = function(targetEl, visualSettings) {
        if (!targetEl || !visualSettings) return;

        if (typeof visualSettings === 'function') {
            adjustElementVisuals(targetEl, visualSettings());
        } else if (typeof visualSettings === 'string') {
            var declarations = visualSettings.split(';');
            for (var i = 0; i < declarations.length; i++) {
                var declaration = declarations[i].trim();
                if (declaration) {
                    var parts = declaration.split(':', 2);
                    if (parts.length === 2) {
                        targetEl.style[parts[0].trim()] = parts[1].trim();
                    }
                }
            }
        } else if (typeof visualSettings === 'object') {
            for (var prop in visualSettings) {
                if (Object.prototype.hasOwnProperty.call(visualSettings, prop) && typeof visualSettings[prop] !== 'function') {
                    targetEl.style[prop] = visualSettings[prop];
                }
            }
        }
    };

    var generateMarkupString = function(itemConfig) {
        if (typeof itemConfig === 'string') {
            return itemConfig;
        }

        var collector = [];
        var tagName = itemConfig.nodeType || 'div';
        collector.push('<', tagName);

        for (var property in itemConfig) {
            if (!Object.prototype.hasOwnProperty.call(itemConfig, property)) continue;

            if (property === 'nodeType' || property === 'itemChildren' || property === 'nestedItems' || property === 'contentHtml' || typeof itemConfig[property] === 'function') {
                continue;
            }

            if (property === 'visualStyles') {
                var styleValue = itemConfig['visualStyles'];
                if (typeof styleValue === 'function') {
                    styleValue = styleValue();
                }
                if (typeof styleValue === 'string') {
                    collector.push(' style="', styleValue, '"');
                } else if (typeof styleValue === 'object') {
                    collector.push(' style="');
                    for (var styleKey in styleValue) {
                        if (Object.prototype.hasOwnProperty.call(styleValue, styleKey) && typeof styleValue[styleKey] !== 'function') {
                            collector.push(styleKey, ':', styleValue[styleKey], ';');
                        }
                    }
                    collector.push('"');
                }
            } else {
                var attrName = property;
                if (property === 'styleClass') {
                    attrName = 'class';
                } else if (property === 'forAttribute') {
                    attrName = 'for';
                }
                collector.push(' ', attrName, '="', itemConfig[property], '"');
            }
        }

        if (voidElements.has(tagName.toLowerCase())) {
            collector.push('/>');
        } else {
            collector.push('>');
            var subItems = itemConfig.itemChildren || itemConfig.nestedItems;
            if (subItems) {
                if (Array.isArray(subItems)) {
                    for (var i = 0, len = subItems.length; i < len; i++) {
                        collector.push(generateMarkupString(subItems[i]));
                    }
                } else {
                    collector.push(generateMarkupString(subItems));
                }
            }
            if (itemConfig.contentHtml) {
                collector.push(itemConfig.contentHtml);
            }
            collector.push('</', tagName, '>');
        }
        return collector.join('');
    };

    var constructDomElement = function(itemConfig, parent) {
        var el = document.createElement(itemConfig.nodeType || 'div');

        for (var property in itemConfig) {
            if (!Object.prototype.hasOwnProperty.call(itemConfig, property)) continue;

            if (property === 'nodeType' || property === 'itemChildren' || property === 'nestedItems' || property === 'contentHtml' || property === 'visualStyles' || typeof itemConfig[property] === 'function') {
                continue;
            }

            var attrName = property;
            if (property === 'styleClass') {
                el.className = itemConfig[property];
                continue;
            } else if (property === 'forAttribute') {
                attrName = 'for';
            }
            el.setAttribute(attrName, itemConfig[property]);
        }
        adjustElementVisuals(el, itemConfig.visualStyles);

        var subItems = itemConfig.itemChildren || itemConfig.nestedItems;
        if (subItems) {
            if (Array.isArray(subItems)) {
                for (var i = 0, len = subItems.length; i < len; i++) {
                    constructDomElement(subItems[i], el);
                }
            } else {
                constructDomElement(subItems, el);
            }
        }
        if (itemConfig.contentHtml) {
            el.innerHTML = itemConfig.contentHtml;
        }

        if (parent) {
            parent.appendChild(el);
        }
        return el;
    };

    var createFragmentSafely = function(htmlString, contextTag) {
        var tempDiv = document.createElement('div');
        var fragment = document.createDocumentFragment();

        var wrapStart = '';
        var wrapEnd = '';
        if (contextTag === 'tr') { wrapStart = '<table><tbody><tr>'; wrapEnd = '</tr></tbody></table>'; }
        else if (contextTag === 'td' || contextTag === 'th') { wrapStart = '<table><tbody><tr><td>'; wrapEnd = '</td></tr></tbody></table>'; }
        else if (contextTag === 'tbody' || contextTag === 'thead' || contextTag === 'tfoot') { wrapStart = '<table>'; wrapEnd = '</table>'; }
        else if (contextTag === 'caption' || contextTag === 'colgroup' || contextTag === 'col') { wrapStart = '<table>'; wrapEnd = '</table>'; }

        if (wrapStart) {
            tempDiv.innerHTML = wrapStart + htmlString + wrapEnd;
            
            var current = tempDiv.firstChild;
            // Traverse to the desired context tag
            while(current && current.nodeType === 1 && current.tagName.toLowerCase() !== contextTag) {
                if (current.firstChild) {
                    current = current.firstChild;
                } else { 
                    current = null;
                    break;
                }
            }

            if (current && current.tagName.toLowerCase() === contextTag) {
                while (current.firstChild) {
                    fragment.appendChild(current.firstChild);
                }
            } else {
                tempDiv.innerHTML = htmlString;
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
            }
        } else {
            tempDiv.innerHTML = htmlString;
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
        }
        return fragment;
    };

    return {
        renderHtml: function(configObject) {
            return generateMarkupString(configObject);
        },

        applyElementStyles: function(element, styles) {
            adjustElementVisuals(GlobalUtility.obtainDomNode(element), styles);
        },

        injectHtmlFragment: function(insertionPoint, targetElement, htmlInput) {
            targetElement = GlobalUtility.obtainDomNode(targetElement);
            insertionPoint = insertionPoint.toLowerCase();
            var fragment;
            var targetTagName = targetElement.tagName.toLowerCase();

            fragment = createFragmentSafely(htmlInput, tableStructuralTags.has(targetTagName) ? targetTagName : null);

            var resultNode = null;
            switch (insertionPoint) {
                case "beforebegin":
                    targetElement.parentNode.insertBefore(fragment, targetElement);
                    resultNode = targetElement.previousSibling;
                    break;
                case "afterbegin":
                    targetElement.insertBefore(fragment, targetElement.firstChild);
                    resultNode = targetElement.firstChild;
                    break;
                case "beforeend":
                    targetElement.appendChild(fragment);
                    resultNode = targetElement.lastChild;
                    break;
                case "afterend":
                    targetElement.parentNode.insertBefore(fragment, targetElement.nextSibling);
                    resultNode = targetElement.nextSibling;
                    break;
                default:
                    throw new Error('Invalid insertion point: ' + insertionPoint);
            }
            return resultNode;
        },

        placeContent: function(targetNode, contentConfig, insertionStrategy) {
            targetNode = GlobalUtility.obtainDomNode(targetNode);
            var newContentNode;

            if (typeof contentConfig === 'string') {
                newContentNode = this.injectHtmlFragment(insertionStrategy, targetNode, contentConfig);
            } else {
                newContentNode = constructDomElement(contentConfig, null);
                
                var parentForAttachment = targetNode.parentNode;

                if (insertionStrategy === "beforebegin") {
                    parentForAttachment.insertBefore(newContentNode, targetNode);
                } else if (insertionStrategy === "afterend") {
                    parentForAttachment.insertBefore(newContentNode, targetNode.nextSibling);
                } else if (insertionStrategy === "afterbegin") {
                    targetNode.insertBefore(newContentNode, targetNode.firstChild);
                } else if (insertionStrategy === "beforeend") {
                    targetNode.appendChild(newContentNode);
                } else {
                    targetNode.appendChild(newContentNode);
                }
            }
            return newContentNode;
        },

        addBefore: function(target, config) {
            return this.placeContent(target, config, "beforebegin");
        },

        addAfter: function(target, config) {
            return this.placeContent(target, config, "afterend");
        },

        addAsFirstChild: function(target, config) {
            return this.placeContent(target, config, "afterbegin");
        },

        addAsLastChild: function(target, config) {
            return this.placeContent(target, config, "beforeend");
        },

        replaceWithContent: function(target, config) {
            target = GlobalUtility.obtainDomNode(target);
            var html = typeof config === 'string' ? config : generateMarkupString(config);
            target.innerHTML = html;
            return target.firstChild;
        },

        createMarkupComposer: function(configObject) {
            var html = generateMarkupString(configObject);
            return new ContentComposer(html);
        }
    };
})();


var ContentComposer = function(initialSource) {
    var sources = Array.isArray(initialSource) ? initialSource.join('') : initialSource;
    this.sourceText = sources;
    this.compiledRenderer = null;
    this.placeholderPattern = /\{([\w-]+)(?::([\w\.]*)(?:\((.*?)\))?)?\}/g;
    this.disablePlaceholders = false;
};

ContentComposer.formatters = GlobalUtility.FormatterCatalog;

ContentComposer.prototype = {
    renderProcessed: function(dataValues) {
        if (this.compiledRenderer) {
            return this.compiledRenderer(dataValues);
        }
        var currentComposer = this;
        var useFormatters = !this.disablePlaceholders;

        var replacementFunction = function(fullMatch, keyName, formatterName, formatterArgs) {
            var value = dataValues[keyName];
            if (value === undefined || value === null) {
                return "";
            }

            if (formatterName && useFormatters) {
                if (formatterName.substring(0, 5) === "this.") {
                    return currentComposer.invokeCustomFormatter(formatterName.substring(5), value, dataValues);
                } else {
                    var formatterFn = ContentComposer.formatters[formatterName];
                    if (formatterFn) {
                        var argsArray = [value];
                        if (formatterArgs) {
                            var argParts = formatterArgs.split(',').map(function(arg) {
                                return arg.trim().replace(/^['"]|['"]$/g, '');
                            });
                            argsArray = argsArray.concat(argParts);
                        }
                        return formatterFn.apply(null, argsArray);
                    }
                }
            }
            return String(value);
        };
        return this.sourceText.replace(this.placeholderPattern, replacementFunction);
    },

    updateTemplateSource: function(newSource, autoCompile) {
        this.sourceText = newSource;
        this.compiledRenderer = null;
        if (autoCompile) {
            this.preCompile();
        }
        return this;
    },

    preCompile: function() {
        var useFormatters = !this.disablePlaceholders;
        var accumulatorVar = '_outputParts';
        var fnBodyParts = [
            'var ' + accumulatorVar + ' = [];',
            'var _f = ContentComposer.formatters;',
            'var _c = this;'
        ];

        var processedSource = this.sourceText.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'");
        var lastOffset = 0;

        processedSource.replace(this.placeholderPattern, function(match, keyName, formatterName, formatterArgs, offset) {
            if (offset > lastOffset) {
                fnBodyParts.push(accumulatorVar + ".push('" + processedSource.substring(lastOffset, offset) + "');");
            }

            var valueAccess = "dataValues['" + keyName + "']";
            var dynamicExpression;

            if (formatterName && useFormatters) {
                if (formatterName.substring(0, 5) === "this.") {
                    dynamicExpression = "_c.invokeCustomFormatter('" + formatterName.substring(5) + "', " + valueAccess + ", dataValues)";
                } else {
                    var argsForFormatter = [valueAccess];
                    if (formatterArgs) {
                        var parsedArgs = formatterArgs.split(',').map(function(arg) { return arg.trim(); });
                        for (var i = 0; i < parsedArgs.length; i++) {
                            var pArg = parsedArgs[i];
                            if ((pArg.charAt(0) === "'" && pArg.charAt(pArg.length - 1) === "'") ||
                                (pArg.charAt(0) === '"' && pArg.charAt(pArg.length - 1) === '"')) {
                                argsForFormatter.push(pArg);
                            } else if (!isNaN(pArg) && pArg !== '') {
                                argsForFormatter.push(pArg);
                            } else {
                                argsForFormatter.push("dataValues['" + pArg.replace(/'/g, "\\'") + "']");
                            }
                        }
                    }
                    dynamicExpression = "_f['" + formatterName + "'](" + argsForFormatter.join(',') + ")";
                }
            } else {
                dynamicExpression = valueAccess + " === undefined || " + valueAccess + " === null ? '' : String(" + valueAccess + ")";
            }
            fnBodyParts.push(accumulatorVar + ".push(" + dynamicExpression + ");");
            
            lastOffset = offset + match.length;
            return '';
        });

        if (lastOffset < processedSource.length) {
            fnBodyParts.push(accumulatorVar + ".push('" + processedSource.substring(lastOffset) + "');");
        }

        fnBodyParts.push('return ' + accumulatorVar + '.join("");');

        this.compiledRenderer = new Function('dataValues', fnBodyParts.join('\n'));
        return this;
    },

    invokeCustomFormatter: function(fnKey, val, allData) {
        if (typeof this[fnKey] === 'function') {
            return this[fnKey](val, allData);
        }
        return val;
    },

    insertAtStart: function(targetElement, data) {
        return this.doInsertion('afterbegin', targetElement, data);
    },

    insertPreceding: function(targetElement, data) {
        return this.doInsertion('beforebegin', targetElement, data);
    },

    insertFollowing: function(targetElement, data) {
        return this.doInsertion('afterend', targetElement, data);
    },

    appendContent: function(targetElement, data) {
        return this.doInsertion('beforeend', targetElement, data);
    },

    doInsertion: function(positionKey, targetElement, dataValues) {
        targetElement = GlobalUtility.obtainDomNode(targetElement);
        var renderedHtml = this.renderProcessed(dataValues);
        var insertedNode = MarkupAssistant.injectHtmlFragment(positionKey, targetElement, renderedHtml);
        return insertedNode;
    },

    replaceTargetContent: function(targetElement, data) {
        targetElement = GlobalUtility.obtainDomNode(targetElement);
        var renderedHtml = this.renderProcessed(data);
        targetElement.innerHTML = renderedHtml;
        return targetElement.firstChild;
    }
};

ContentComposer.prototype.process = ContentComposer.prototype.renderProcessed;

MarkupAssistant.TemplateConstructor = ContentComposer;

ContentComposer.fromElement = function(elementIdOrNode, optionalConfig) {
    var sourceElement = GlobalUtility.obtainDomNode(elementIdOrNode);
    var sourceHtml = sourceElement.value || sourceElement.innerHTML;
    var composer = new ContentComposer(sourceHtml);
    if (optionalConfig) {
        GlobalUtility.mergeObjects(composer, optionalConfig);
    }
    return composer;
};