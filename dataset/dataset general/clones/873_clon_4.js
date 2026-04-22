var Enti;

(function() {
    var markerValue = {};
    var sourceChecker = /this\.origin/;

    Enti = function() {};

    Enti.prototype.construct = function() {};

    Enti.assignFeature = function(featureName, featureFn) {
        var parentProto = this.ancestry && this.ancestry.prototype;

        if (parentProto && sourceChecker.test(featureFn.toString())) {
            this.prototype[featureName] = function() {
                var priorOrigin = this.origin;
                this.origin = parentProto[featureName];
                try {
                    var outcome = featureFn.apply(this, arguments);
                } finally {
                    this.origin = priorOrigin;
                }
                return outcome;
            };
        } else {
            this.prototype[featureName] = featureFn;
        }
    };

    Enti.assignFeatures = function(components) {
        for (var key in components) {
            if (Object.prototype.hasOwnProperty.call(components, key)) {
                if (typeof components[key] === 'function') {
                    this.assignFeature(key, components[key]);
                } else {
                    this.prototype[key] = components[key];
                }
            }
        }
    };

    Enti.isDescendantOf = function(ancestorClass) {
        var currentClass = this;
        while (currentClass) {
            if (currentClass === ancestorClass) return true;
            currentClass = currentClass.ancestry;
        }
        return false;
    };

    Enti.derive = function(components) {
        var DerivedClass = function() {
            if (arguments[0] === markerValue) return;

            if (this instanceof DerivedClass) {
                if (this.construct) this.construct.apply(this, arguments);
            } else {
                var creationResult = new DerivedClass(markerValue);
                if (creationResult.construct) creationResult.construct.apply(creationResult, arguments);
                return creationResult;
            }
        };

        DerivedClass.constructor = DerivedClass;
        DerivedClass.derive = Enti.derive;
        DerivedClass.assignFeature = Enti.assignFeature;
        DerivedClass.assignFeatures = Enti.assignFeatures;
        DerivedClass.isDescendantOf = Enti.isDescendantOf;

        DerivedClass.ancestry = this;

        DerivedClass.prototype = new this(markerValue);
        DerivedClass.prototype.constructor = DerivedClass;

        DerivedClass.assignFeatures(components);

        return DerivedClass;
    };
})();


(function(externalLib) {
    var lexicalUnits = {
        UNI_CODE: /\\[0-9a-f]{1,6}(?:\r\n|[ \n\r\t\f])?/,
        ESC_SEQ: /(?:UNI_CODE)|\\[^\n\r\f0-9a-f]/,
        NON_ASCII: /[^\x00-\x7F]/,
        NAME_START: /[_a-z]|(?:NON_ASCII)|(?:ESC_SEQ)/,
        NAME_CHAR: /[_a-z0-9-]|(?:NON_ASCII)|(?:ESC_SEQ)/,
        ID_TOKEN: /-?(?:NAME_START)(?:NAME_CHAR)*/,

        NEW_LINE: /\n|\r\n|\r|\f/,

        TEXT_STRING: /(?:TEXT_STRING1)|(?:TEXT_STRING2)|(?:TEXT_STRING_BARE)/,
        TEXT_STRING1: /"(?:(?:ESC_SEQ)|\\(?:NEW_LINE)|[^\n\r\f\"])*"/,
        TEXT_STRING2: /'(?:(?:ESC_SEQ)|\\(?:NEW_LINE)|[^\n\r\f\'])*'/,
        TEXT_STRING_BARE: /(?:(?:ESC_SEQ)|\\(?:NEW_LINE)|[^\n\r\f\]])*/,

        FUNC_CALL: /(?:ID_TOKEN)\(\)/,

        NUMERIC: /[0-9]+/,

        N_TERM: /([-+])?(NUMERIC)?(n)\s*(?:([-+])\s*(NUMERIC))?/,
        NUM_TERM: /([-+])?(NUMERIC)/
    };

    var matchingPatterns = {
        negation: /:not\(/,
        negation_end: /\)/,

        tagName: /((?:ID_TOKEN)|\*)/,
        elementId: /#(ID_TOKEN)/,
        className: /\.(ID_TOKEN)/,
        attribute: /\[\s*(ID_TOKEN)\s*(?:([^=]?=)\s*(TEXT_STRING)\s*)?\]/,
        elementPseudo: /(?::(first-line|first-letter|before|after))|(?:::((?:FUNC_CALL)|(?:ID_TOKEN)))/,
        nthPseudo: /:nth-child\(\s*(?:(?:N_TERM)|(?:NUM_TERM)|(odd|even))\s*\)/,
        simplePseudo: /:(ID_TOKEN)/,

        combinator: /\s*(\+|~|>)\s*|\s+/,
        separator: /\s*,\s*/,
        priority: /\s+!important\s*$/
    };

    var placeholderRegex = /[A-Z][A-Z0-9_]+/;
    for (var patKey in matchingPatterns) {
        var matchSource = matchingPatterns[patKey].source;
        var m;
        while (m = matchSource.match(placeholderRegex)) matchSource = matchSource.replace(m[0], lexicalUnits[m[0]].source);
        matchingPatterns[patKey] = new RegExp(matchSource, 'gi');
    }

    var NodeType = {
        GROUP: 'GROUP',
        EXPRESSION: 'EXPRESSION',
        SEGMENT: 'SEGMENT',
        COMBINATOR: 'COMBINATOR',
        ATTRIBUTE_MATCHER: 'ATTRIBUTE_MATCHER',
        PSEUDO_CLASS: 'PSEUDO_CLASS',
        PSEUDO_ELEMENT: 'PSEUDO_ELEMENT',
        NEGATION_GROUP: 'NEGATION_GROUP'
    };

    var QueryLexer = Enti.derive({
        construct: function(inputString) {
            this.sourceText = inputString;
            this.symbolList = [];
            this.currentSymbolIndex = 0;
            this.processInput();
        },

        tokenDefs: [
            { name: 'WHITESPACE', pattern: /^\s+/ },
            { name: 'NEGATION_START', pattern: /^:not\(/i },
            { name: 'NEGATION_END', pattern: /^\)/i },
            { name: 'NTH_CHILD_PSEUDO', pattern: /^:nth-child\(\s*(?:([-+])?([0-9]+)?(n)\s*(?:([-+])\s*([0-9]+))?|(odd|even))\s*\)/i },
            { name: 'PSEUDO_ELEMENT', pattern: /^::(first-line|first-letter|before|after)/i },
            { name: 'PSEUDO_FUNCTION', pattern: /^::([_a-z]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])([_a-z0-9-]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])*\(\)/i },
            { name: 'ATTRIBUTE_SELECTOR', pattern: /^\[\s*([_a-z]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])([_a-z0-9-]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])*\s*(?:([^=]?=)\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|([_a-z0-9-]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])+)\s*)?\]/i },
            { name: 'ID_SELECTOR', pattern: /^#([_a-z]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])([_a-z0-9-]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])*/i },
            { name: 'CLASS_SELECTOR', pattern: /^\.([_a-z]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])([_a-z0-9-]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])*/i },
            { name: 'SIMPLE_PSEUDO', pattern: /^:([_a-z]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])([_a-z0-9-]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])*/i },
            { name: 'ADJACENT_COMBINATOR', pattern: /^\s*\+\s*/ },
            { name: 'SIBLING_COMBINATOR', pattern: /^\s*~\s*/ },
            { name: 'CHILD_COMBINATOR', pattern: /^\s*>\s*/ },
            { name: 'DESCENDANT_COMBINATOR', pattern: /^\s+/ },
            { name: 'COMMA_SEPARATOR', pattern: /^\s*,\s*/ },
            { name: 'UNIVERSAL_TAG', pattern: /^\*/ },
            { name: 'IDENTIFIER_TAG', pattern: /^([_a-z]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])([_a-z0-9-]|(?:[^\x00-\x7F])|\\[^\n\r\f0-9a-f])*/i }
        ],

        processInput: function() {
            var remaining = this.sourceText;
            var match;

            while (remaining.length > 0) {
                var foundMatch = false;
                for (var i = 0; i < this.tokenDefs.length; i++) {
                    var def = this.tokenDefs[i];
                    match = remaining.match(def.pattern);
                    if (match) {
                        if (def.name !== 'WHITESPACE') {
                            this.symbolList.push({ type: def.name, value: match[0], rawMatch: match });
                        }
                        remaining = remaining.substring(match[0].length);
                        foundMatch = true;
                        break;
                    }
                }
                if (!foundMatch) {
                    throw new Error("Lexical error: Unexpected character at " + (this.sourceText.length - remaining.length) + ": " + remaining.substring(0, 10));
                }
            }
        },

        peek: function() {
            return this.symbolList[this.currentSymbolIndex] || null;
        },
        consume: function(expectedType) {
            var token = this.peek();
            if (token && (!expectedType || token.type === expectedType)) {
                this.currentSymbolIndex++;
                return token;
            }
            if (expectedType) {
                throw new Error("Syntax error: Expected " + expectedType + " but found " + (token ? token.type + " ('" + token.value + "')" : "end of input"));
            }
            return null;
        },
        hasMore: function() {
            return this.currentSymbolIndex < this.symbolList.length;
        }
    });

    var QueryParser = Enti.derive({
        construct: function(lexerInstance) {
            this.lexer = lexerInstance;
        },

        parse: function() {
            var group = this.parseSelectorGroup();
            if (this.lexer.hasMore()) {
                throw new Error("Syntax error: Unexpected tokens remaining after parsing complete group.");
            }
            return group;
        },

        parseSelectorGroup: function() {
            var expressions = [];
            expressions.push(this.parseSelectorExpression());

            while (this.lexer.peek() && this.lexer.peek().type === 'COMMA_SEPARATOR') {
                this.lexer.consume('COMMA_SEPARATOR');
                expressions.push(this.parseSelectorExpression());
            }
            return expressions.length === 1 ? expressions[0] : { type: NodeType.GROUP, expressions: expressions };
        },

        parseSelectorExpression: function() {
            var segments = [];
            segments.push(this.parseSimpleSegment());

            while (this.lexer.peek() && (
                this.lexer.peek().type === 'ADJACENT_COMBINATOR' ||
                this.lexer.peek().type === 'SIBLING_COMBINATOR' ||
                this.lexer.peek().type === 'CHILD_COMBINATOR' ||
                this.lexer.peek().type === 'DESCENDANT_COMBINATOR'
            )) {
                var combinatorToken = this.lexer.consume();
                segments.push({ type: NodeType.COMBINATOR, value: combinatorToken.value.trim() });
                segments.push(this.parseSimpleSegment());
            }
            return segments.length === 1 ? segments[0] : { type: NodeType.EXPRESSION, segments: segments };
        },

        parseSimpleSegment: function() {
            var segment = {
                type: NodeType.SEGMENT,
                tag: null,
                id: null,
                classes: [],
                attributes: [],
                pseudoClasses: [],
                pseudoElements: [],
                negations: []
            };

            var token = this.lexer.peek();
            if (token && (token.type === 'UNIVERSAL_TAG' || token.type === 'IDENTIFIER_TAG')) {
                segment.tag = this.lexer.consume().value;
            }

            var foundComponent = true;
            while (foundComponent) {
                foundComponent = false;
                token = this.lexer.peek();
                if (!token) break;

                switch (token.type) {
                    case 'ID_SELECTOR':
                        segment.id = token.rawMatch[1];
                        this.lexer.consume();
                        foundComponent = true;
                        break;
                    case 'CLASS_SELECTOR':
                        segment.classes.push(token.rawMatch[1]);
                        this.lexer.consume();
                        foundComponent = true;
                        break;
                    case 'ATTRIBUTE_SELECTOR':
                        var attrMatch = token.rawMatch;
                        var attrNode = {
                            type: NodeType.ATTRIBUTE_MATCHER,
                            name: attrMatch[1],
                            operator: attrMatch[3] || null,
                            value: attrMatch[4] ? attrMatch[4].replace(/^['"]|['"]$/g, '') : null
                        };
                        segment.attributes.push(attrNode);
                        this.lexer.consume();
                        foundComponent = true;
                        break;
                    case 'SIMPLE_PSEUDO':
                        segment.pseudoClasses.push({
                            type: NodeType.PSEUDO_CLASS,
                            name: token.rawMatch[1]
                        });
                        this.lexer.consume();
                        foundComponent = true;
                        break;
                    case 'NTH_CHILD_PSEUDO':
                        var nthMatch = token.rawMatch;
                        var a, b;
                        if (nthMatch[6]) {
                            a = 2;
                            b = (nthMatch[6] === 'odd') ? 1 : 0;
                        } else {
                            a = parseInt((nthMatch[1] || '') + (nthMatch[2] || '1'));
                            if (isNaN(a) && nthMatch[3]) a = 1; // 'n' without number means 1n
                            if (isNaN(a) && !nthMatch[3]) a = 0; // Just a number, e.g., :nth-child(5) => a=0, b=5
                            b = parseInt((nthMatch[4] || '') + (nthMatch[5] || '0'));
                            if (isNaN(b)) b = 0;
                            if (!nthMatch[3]) { // If no 'n', it's just a number
                                a = 0;
                                b = parseInt((nthMatch[1] || '') + (nthMatch[2] || '0'));
                                if (isNaN(b)) b = 0;
                            }
                        }
                        segment.pseudoClasses.push({
                            type: NodeType.PSEUDO_CLASS,
                            name: 'nth-child',
                            args: [a, b]
                        });
                        this.lexer.consume();
                        foundComponent = true;
                        break;
                    case 'PSEUDO_ELEMENT':
                        segment.pseudoElements.push({
                            type: NodeType.PSEUDO_ELEMENT,
                            name: token.rawMatch[1]
                        });
                        this.lexer.consume();
                        foundComponent = true;
                        break;
                    case 'PSEUDO_FUNCTION':
                        segment.pseudoElements.push({
                            type: NodeType.PSEUDO_ELEMENT,
                            name: token.rawMatch[0].slice(2, -2)
                        });
                        this.lexer.consume();
                        foundComponent = true;
                        break;
                    case 'NEGATION_START':
                        this.lexer.consume('NEGATION_START');
                        var negatedGroup = this.parseSelectorGroup();
                        segment.negations.push({ type: NodeType.NEGATION_GROUP, group: negatedGroup });
                        this.lexer.consume('NEGATION_END');
                        foundComponent = true;
                        break;
                }
            }

            return segment;
        }
    });

    externalLib.styleQuery = function(selectorString) {
        var lex = QueryLexer(selectorString);
        var par = QueryParser(lex);
        var resultTree = par.parse();
        resultTree.originalSelector = selectorString;
        return resultTree;
    };

    externalLib.styleQuery.NodeTypes = NodeType;
    externalLib.styleQuery.BaseComponent = Enti;
    externalLib.styleQuery.QueryLexer = QueryLexer;
    externalLib.styleQuery.QueryParser = QueryParser;

})(jQuery);


(function(externalLib) {
    var NodeTypes = externalLib.styleQuery.NodeTypes;

    function computeRank(node) {
        if (!node) return [0, 0, 0];
        if (node.rankCache) return node.rankCache;

        var rank = [0, 0, 0];

        switch (node.type) {
            case NodeTypes.GROUP:
                externalLib.each(node.expressions, function(_, exprNode) {
                    var exprRank = computeRank(exprNode);
                    rank[0] += exprRank[0];
                    rank[1] += exprRank[1];
                    rank[2] += exprRank[2];
                });
                break;

            case NodeTypes.EXPRESSION:
                externalLib.each(node.segments, function(i, segPart) {
                    if (segPart.type === NodeTypes.SEGMENT) {
                        var segRank = computeRank(segPart);
                        rank[0] += segRank[0];
                        rank[1] += segRank[1];
                        rank[2] += segRank[2];
                    }
                });
                break;

            case NodeTypes.SEGMENT:
                if (node.id) rank[0] = 1;
                rank[1] += node.classes.length;
                rank[1] += node.attributes.length;
                rank[1] += node.pseudoClasses.length;

                if (node.tag && node.tag !== '*') rank[2] = 1;
                rank[2] += node.pseudoElements.length;

                externalLib.each(node.negations, function(_, negNode) {
                    var negRank = computeRank(negNode.group);
                    rank[0] += negRank[0];
                    rank[1] += negRank[1];
                    rank[2] += negRank[2];
                });
                break;
        }

        return node.rankCache = rank;
    }

    var originalStyleQuery = externalLib.styleQuery;
    externalLib.styleQuery = function(selectorString) {
        var ast = originalStyleQuery(selectorString);
        ast.retrieveRank = function() {
            return computeRank(ast);
        };
        return ast;
    };

})(jQuery);


(function(externalLib) {
    var NodeTypes = externalLib.styleQuery.NodeTypes;

    var tempContainer = document.createElement('div');
    tempContainer.innerHTML = '<form id="testForm"><input name="idInput" type="text"/></form>';

    var getAttributeQuirky = tempContainer.firstChild.getAttribute('id') !== 'testForm';
    var supportsElementTraversal = tempContainer.firstElementChild && tempContainer.firstElementChild.tagName === 'FORM';

    function getDomAttribute(element, attributeName) {
        if (!element || element.nodeType !== 1) return null;

        if (!getAttributeQuirky) {
            return element.getAttribute(attributeName);
        } else {
            var ieAttrMap = { 'class': 'className', 'for': 'htmlFor' };
            var mappedName = ieAttrMap[attributeName] || attributeName;
            var value = element.getAttribute(mappedName, 2);
            if (value !== null) return value;
            var attrNode = element.getAttributeNode(attributeName);
            return attrNode ? attrNode.nodeValue : null;
        }
    }

    function getPreviousSiblingElement(element) {
        if (!element) return null;
        if (supportsElementTraversal) {
            return element.previousElementSibling;
        } else {
            var sibling = element.previousSibling;
            while (sibling && sibling.nodeType !== 1) {
                sibling = sibling.previousSibling;
            }
            return sibling;
        }
    }

    function getNextSiblingElement(element) {
        if (!element) return null;
        if (supportsElementTraversal) {
            return element.nextElementSibling;
        } else {
            var sibling = element.nextSibling;
            while (sibling && sibling.nodeType !== 1) {
                sibling = sibling.nextSibling;
            }
            return sibling;
        }
    }

    function getParentElement(element) {
        if (!element) return null;
        var parent = element.parentNode;
        return (parent && parent.nodeType === 1) ? parent : null;
    }

    function matchElement(element, astNode) {
        if (!element || element.nodeType !== 1) return false;

        switch (astNode.type) {
            case NodeTypes.GROUP:
                for (var i = 0; i < astNode.expressions.length; i++) {
                    if (matchElement(element, astNode.expressions[i])) {
                        return true;
                    }
                }
                return false;

            case NodeTypes.EXPRESSION:
                var currentElem = element;
                var currentSegmentIndex = astNode.segments.length - 1;

                while (currentSegmentIndex >= 0) {
                    var segment = astNode.segments[currentSegmentIndex];
                    if (segment.type === NodeTypes.SEGMENT) {
                        if (!matchSegment(currentElem, segment)) {
                            return false;
                        }
                        currentSegmentIndex--;
                    } else if (segment.type === NodeTypes.COMBINATOR) {
                        var combinator = segment.value;
                        currentSegmentIndex--;

                        var targetSegment = astNode.segments[currentSegmentIndex];

                        var foundMatch = false;
                        if (combinator === ' ') {
                            currentElem = getParentElement(currentElem);
                            while (currentElem) {
                                if (matchSegment(currentElem, targetSegment)) {
                                    foundMatch = true;
                                    break;
                                }
                                currentElem = getParentElement(currentElem);
                            }
                        } else if (combinator === '>') {
                            currentElem = getParentElement(currentElem);
                            if (currentElem && matchSegment(currentElem, targetSegment)) {
                                foundMatch = true;
                            }
                        } else if (combinator === '+') {
                            currentElem = getPreviousSiblingElement(currentElem);
                            if (currentElem && matchSegment(currentElem, targetSegment)) {
                                foundMatch = true;
                            }
                        } else if (combinator === '~') {
                            currentElem = getPreviousSiblingElement(currentElem);
                            while (currentElem) {
                                if (matchSegment(currentElem, targetSegment)) {
                                    foundMatch = true;
                                    break;
                                }
                                currentElem = getPreviousSiblingElement(currentElem);
                            }
                        }
                        if (!foundMatch) return false;
                        currentSegmentIndex--;
                    } else {
                        return false;
                    }
                }
                return true;

            case NodeTypes.SEGMENT:
                return matchSegment(element, astNode);

            default:
                return false;
        }
    }

    function matchSegment(element, segmentNode) {
        if (!element || element.nodeType !== 1) return false;

        if (segmentNode.tag && segmentNode.tag !== '*' && element.tagName.toLowerCase() !== segmentNode.tag.toLowerCase()) {
            return false;
        }

        if (segmentNode.id && element.id !== segmentNode.id) {
            return false;
        }

        for (var i = 0; i < segmentNode.classes.length; i++) {
            if (!element.className || (' ' + element.className + ' ').indexOf(' ' + segmentNode.classes[i] + ' ') === -1) {
                return false;
            }
        }

        for (var i = 0; i < segmentNode.attributes.length; i++) {
            var attr = segmentNode.attributes[i];
            var attrValue = getDomAttribute(element, attr.name);

            if (attr.operator === null) {
                if (attrValue === null) return false;
            } else {
                if (attrValue === null) return false;

                switch (attr.operator) {
                    case '=':
                        if (attrValue !== attr.value) return false;
                        break;
                    case '~=':
                        if ((' ' + attrValue + ' ').indexOf(' ' + attr.value + ' ') === -1) return false;
                        break;
                    case '^=':
                        if (attrValue.indexOf(attr.value) !== 0) return false;
                        break;
                    case '$=':
                        if (attrValue.substr(attrValue.length - attr.value.length) !== attr.value) return false;
                        break;
                    case '*=':
                        if (attrValue.indexOf(attr.value) === -1) return false;
                        break;
                    case '!=':
                        if (attrValue === attr.value) return false;
                        break;
                    case '|=':
                        if (!(attrValue === attr.value || attrValue.indexOf(attr.value + '-') === 0)) return false;
                        break;
                    default:
                        return false;
                }
            }
        }

        for (var i = 0; i < segmentNode.pseudoClasses.length; i++) {
            var pseudo = segmentNode.pseudoClasses[i];
            switch (pseudo.name) {
                case 'first-child':
                    if (getPreviousSiblingElement(element) !== null) return false;
                    break;
                case 'last-child':
                    if (getNextSiblingElement(element) !== null) return false;
                    break;
                case 'nth-child':
                    var a = pseudo.args[0];
                    var b = pseudo.args[1];
                    var parent = getParentElement(element);
                    if (!parent) return false;

                    var children = [];
                    if (!parent._childListCache) {
                        var child = parent.firstChild;
                        while (child) {
                            if (child.nodeType === 1) {
                                children.push(child);
                            }
                            child = child.nextSibling;
                        }
                        parent._childListCache = children;
                    } else {
                        children = parent._childListCache;
                    }

                    var index = children.indexOf(element) + 1;
                    if (index === 0) return false;

                    if (a === 0) {
                        if (index !== b) return false;
                    } else {
                        if ((index - b) % a !== 0 || (index - b) / a < 0) return false;
                    }
                    break;
                default:
                    return false;
            }
        }

        for (var i = 0; i < segmentNode.negations.length; i++) {
            if (matchElement(element, segmentNode.negations[i].group)) {
                return false;
            }
        }

        return true;
    }

    externalLib.styleQuery.checkTarget = matchElement;

})(jQuery);