/*
 * Core object system for building hierarchical classes.
 * Based on concepts from John Resig's Simple JavaScript Inheritance
 * and various other prototypal patterns.
 *
 * This utility provides:
 * - Class definition: `var MyClass = PrototypalObject.createDerivedClass({ constructor: function(){ ... }, myMethod: function(){ ... } });`
 * - Inheritance: `var SubClass = MyClass.createDerivedClass({ myMethod: function(){ this._parentMethod(); } });`
 * - New-less constructor support: `new MyClass(arg)` is equivalent to `MyClass(arg)`.
 */

let PrototypalObject;

(function() {
  // A unique symbol or object to distinguish internal constructor calls.
  const privateConstructorToken = {};
  // Regular expression to test if a function explicitly calls `_parentMethod`.
  // This helps optimize method overriding for performance.
  const superMethodCheck = /xyz/.test(function() {
    const xyz = 1;
  }) ? /\b_parentMethod\b/ : /.*/;

  // The foundational class definition.
  PrototypalObject = function() {};

  /**
   * Attaches a method to the prototype of the current class,
   * handling `_parentMethod` calls for inheritance.
   * @param {string} methodName - The name of the method.
   * @param {function} methodFunction - The function to attach.
   */
  PrototypalObject.attachMethod = function(methodName, methodFunction) {
    const ancestorPrototype = this._parentClass && this._parentClass.prototype;

    // If there's an ancestor and the new method uses `_parentMethod`,
    // wrap it to provide the parent's implementation.
    if (ancestorPrototype && superMethodCheck.test(methodFunction)) {
      this.prototype[methodName] = function(...args) {
        const originalParentReference = this._parentMethod; // Store current _parentMethod
        this._parentMethod = ancestorPrototype[methodName]; // Set to parent's method

        try {
          // Execute the new method with the parent context available.
          return methodFunction.apply(this, args);
        } finally {
          this._parentMethod = originalParentReference; // Restore original _parentMethod
        }
      };
    } else {
      // Otherwise, just attach the method directly.
      this.prototype[methodName] = methodFunction;
    }
  };

  /**
   * Attaches multiple methods and properties to the current class.
   * @param {object} properties - An object containing method names and functions or properties.
   */
  PrototypalObject.attachMethods = function(properties) {
    Object.keys(properties).forEach(propName => {
      // Use 'constructor' for the initializer, otherwise treat as a regular method or property.
      if (propName === 'constructor' && typeof properties[propName] === 'function') {
        this.prototype.init = properties[propName]; // Map 'constructor' to 'init' for consistency
      } else if (typeof properties[propName] === 'function') {
        this.attachMethod(propName, properties[propName]);
      } else {
        this.prototype[propName] = properties[propName];
      }
    });
  };

  /**
   * Checks if this class is a descendant of a given ancestor class.
   * @param {PrototypalObject} ancestorClass - The class to check against.
   * @returns {boolean} True if this class inherits from ancestorClass, false otherwise.
   */
  PrototypalObject.isDescendantOf = function(ancestorClass) {
    let currentClass = this;
    while (currentClass) {
      if (currentClass === ancestorClass) return true;
      currentClass = currentClass._parentClass;
    }
    return false;
  };

  /**
   * Creates a new class that inherits from the current class.
   * @param {object} classProperties - An object defining methods and properties for the new class.
   * @returns {PrototypalObject} The newly created derived class.
   */
  PrototypalObject.createDerivedClass = function(classProperties) {
    // The derived class constructor.
    const DerivedClass = function(...args) {
      // Prevent automatic execution of `init` when creating the prototype chain.
      if (args[0] === privateConstructorToken) {
        return;
      }

      // If called with `new`, ensure `init` is called on the instance.
      if (this instanceof DerivedClass) {
        if (this.init) {
          this.init.apply(this, args);
        }
      } else {
        // If called without `new`, instantiate and then initialize.
        const instance = new DerivedClass(privateConstructorToken);
        if (instance.init) {
          instance.init.apply(instance, args);
        }
        return instance;
      }
    };

    // Set up static properties for the new class.
    DerivedClass.constructor = DerivedClass; // Self-reference
    DerivedClass.createDerivedClass = PrototypalObject.createDerivedClass;
    DerivedClass.attachMethod = PrototypalObject.attachMethod;
    DerivedClass.attachMethods = PrototypalObject.attachMethods;
    DerivedClass.isDescendantOf = PrototypalObject.isDescendantOf;
    DerivedClass._parentClass = this; // Link to the parent class

    // Establish the prototype chain.
    DerivedClass.prototype = new this(privateConstructorToken);
    DerivedClass.prototype.constructor = DerivedClass; // Correct constructor reference

    // Apply the provided properties and methods to the new class's prototype.
    DerivedClass.attachMethods(classProperties);

    return DerivedClass;
  };
})();

/*
 * This section defines a CSS selector parsing engine,
 * inspired by the W3C CSS Selectors Level 3 specification.
 * It tokenizes and parses selector strings into a structured object model.
 */
; // Ensure previous IIFE is closed properly

(function($) {
  // Lexical analysis patterns for CSS selectors.
  const parsingTokens = {
    UNICODE_ESC: /\\[0-9a-f]{1,6}(?:\r\n|[ \n\r\t\f])?/,
    GENERIC_ESC: /(?:UNICODE_ESC)|\\[^\n\r\f0-9a-f]/,
    NON_ASCII_CHAR: /[^\x00-\x7F]/,
    NAME_START: /[_a-z]|(?:NON_ASCII_CHAR)|(?:GENERIC_ESC)/,
    NAME_CHAR: /[_a-z0-9-]|(?:NON_ASCII_CHAR)|(?:GENERIC_ESC)/,
    IDENTIFIER: /-?(?:NAME_START)(?:NAME_CHAR)*/,

    NEWLINE: /\n|\r\n|\r|\f/,

    QUOTED_STRING: /(?:SINGLE_QUOTE_STR)|(?:DOUBLE_QUOTE_STR)|(?:BARE_STRING)/,
    SINGLE_QUOTE_STR: /'(?:(?:GENERIC_ESC)|\\(?:NEWLINE)|[^\n\r\f\'])*'/,
    DOUBLE_QUOTE_STR: /"(?:(?:GENERIC_ESC)|\\(?:NEWLINE)|[^\n\r\f\"])*"/,
    BARE_STRING: /(?:(?:GENERIC_ESC)|\\(?:NEWLINE)|[^\n\r\f\]])*/,

    FUNCTION_CALL: /(?:IDENTIFIER)\(\)/,

    INTEGER_NUMBER: /[0-9]+/,

    NTH_EXPRESSION: /([-+])?(INTEGER_NUMBER)?(n)\s*(?:([-+])\s*(INTEGER_NUMBER))?/,
    NTH_STATIC: /([-+])?(INTEGER_NUMBER)/,
  };

  // Syntax rules for parsing CSS selectors.
  const syntaxRules = {
    negation: /:not\(/,
    negation_end: /\)/,

    tag_name: /((?:IDENTIFIER)|\*)/,
    element_id: /#(IDENTIFIER)/,
    class_name: /\.(IDENTIFIER)/,
    attribute_selector: /\[\s*(IDENTIFIER)\s*(?:([^=]?=)\s*(QUOTED_STRING)\s*)?\]/,
    pseudo_element: /(?::(first-line|first-letter|before|after))|(?:::((?:FUNCTION_CALL)|(?:IDENTIFIER)))/,
    pseudo_class_nth: /:nth-child\(\s*(?:(?:NTH_EXPRESSION)|(?:NTH_STATIC)|(odd|even))\s*\)/,
    pseudo_class_simple: /:(IDENTIFIER)/,

    combinator: /\s*(\+|~|>)\s*|\s+/,
    list_separator: /\s*,\s*/,
    priority_flag: /\s+!important\s*$/,
  };

  // Replace placeholder tokens in regex with their actual patterns and ensure case-insensitivity.
  const tokenPlaceholder = /[A-Z_][A-Z0-9_]+/;
  Object.keys(syntaxRules).forEach(ruleKey => {
    let sourcePattern = syntaxRules[ruleKey].source;
    let matchPlaceholder;
    while ((matchPlaceholder = sourcePattern.match(tokenPlaceholder))) {
      const tokenName = matchPlaceholder[0];
      if (!parsingTokens[tokenName]) {
        throw new Error(`Undefined parsing token: ${tokenName}`);
      }
      sourcePattern = sourcePattern.replace(matchPlaceholder[0], parsingTokens[tokenName].source);
    }
    syntaxRules[ruleKey] = new RegExp(sourcePattern, 'gi');
  });

  /**
   * Manages the consumption of an input string for parsing.
   * @class InputCursor
   * @augments PrototypalObject
   */
  const InputCursor = PrototypalObject.createDerivedClass({
    constructor: function(inputString) {
      this.fullString = inputString;
      this.currentPosition = 0;
    },

    /**
     * Attempts to match a regex at the current position and advances the cursor if successful.
     * @param {RegExp} regexPattern - The pattern to match.
     * @returns {Array|null} The match result array, or null if no match.
     */
    advanceAndMatch: function(regexPattern) {
      regexPattern.lastIndex = this.currentPosition;
      const matchResult = regexPattern.exec(this.fullString);
      if (matchResult && matchResult.index === this.currentPosition) {
        this.currentPosition = regexPattern.lastIndex;
        return matchResult;
      }
      return null;
    },

    /**
     * Attempts to match a regex at the current position without advancing the cursor.
     * @param {RegExp} regexPattern - The pattern to peek.
     * @returns {Array|null} The match result array, or null if no match.
     */
    previewMatch: function(regexPattern) {
      regexPattern.lastIndex = this.currentPosition;
      const matchResult = regexPattern.exec(this.fullString);
      return (matchResult && matchResult.index === this.currentPosition) ? matchResult : null;
    },

    /**
     * Generates a string indicating the current parsing error position.
     * @returns {string} The string with a marker at the current position.
     */
    getErrorPosition: function() {
      return this.fullString.slice(0, this.currentPosition) + '<--HERE-->' + this.fullString.slice(this.currentPosition);
    },

    /**
     * Checks if the entire input string has been consumed.
     * @returns {boolean} True if parsing is complete, false otherwise.
     */
    isConsumed: function() {
      return this.currentPosition === this.fullString.length;
    }
  });

  /**
   * Base class for all selector components.
   * @class AbstractQueryPart
   * @augments PrototypalObject
   */
  const AbstractQueryPart = PrototypalObject.createDerivedClass({});

  /**
   * Represents a single, atomic part of a selector (e.g., tag, ID, class).
   * @class BasicElementMatcher
   * @augments AbstractQueryPart
   */
  const BasicElementMatcher = AbstractQueryPart.createDerivedClass({
    constructor: function() {
      this.elementTag = null;
      this.elementId = null;
      this.cssClasses = [];
      this.htmlAttributes = [];
      this.negatedMatchers = [];
      this.dynamicPseudoClasses = [];
      this.structuralPseudoElements = [];
    },

    /**
     * Parses a fragment of a selector string to populate this matcher.
     * @param {InputCursor} cursor - The input string cursor.
     * @returns {BasicElementMatcher} This instance, after parsing.
     * @throws {Error} If an invalid :not term is encountered.
     */
    parseFragment: function(cursor) {
      let currentMatch;

      // Attempt to extract the initial tag name.
      currentMatch = cursor.advanceAndMatch(syntaxRules.tag_name);
      if (currentMatch) {
        this.elementTag = currentMatch[1];
      }

      // Continuously parse selector components until no more can be found
      // or the cursor is exhausted, or a combinator/separator is found.
      while (!cursor.isConsumed() && !cursor.previewMatch(syntaxRules.list_separator) && !cursor.previewMatch(syntaxRules.combinator)) {
        if ((currentMatch = cursor.advanceAndMatch(syntaxRules.negation))) {
          this.negatedMatchers.push(QueryGroup.createDerivedClass().parseList(cursor));
          if (!(currentMatch = cursor.advanceAndMatch(syntaxRules.negation_end))) {
            throw new Error('Parsing Error: Missing closing parenthesis for :not() selector near ' + cursor.getErrorPosition());
          }
        } else if ((currentMatch = cursor.advanceAndMatch(syntaxRules.element_id))) {
          this.elementId = currentMatch[1];
        } else if ((currentMatch = cursor.advanceAndMatch(syntaxRules.class_name))) {
          this.cssClasses.push(currentMatch[1]);
        } else if ((currentMatch = cursor.advanceAndMatch(syntaxRules.attribute_selector))) {
          this.htmlAttributes.push([currentMatch[1], currentMatch[2], currentMatch[3]]);
        } else if ((currentMatch = cursor.advanceAndMatch(syntaxRules.pseudo_element))) {
          this.structuralPseudoElements.push(currentMatch[1] || currentMatch[2]);
        } else if ((currentMatch = cursor.advanceAndMatch(syntaxRules.pseudo_class_nth))) {
          let step = 0;
          let offset = 0;

          if (currentMatch[8]) { // 'odd' or 'even'
            step = 2;
            offset = (currentMatch[8].toLowerCase() === 'odd') ? 1 : 0;
          } else { // 'an+b' or 'n' or 'b'
            const signA = currentMatch[1] === '-' ? -1 : 1;
            const valA = parseInt(currentMatch[2] || '1', 10);
            step = signA * valA;

            if (currentMatch[4]) { // has '+b' or '-b' part
              const signB = currentMatch[4] === '-' ? -1 : 1;
              const valB = parseInt(currentMatch[5] || '0', 10);
              offset = signB * valB;
            } else if (!currentMatch[3]) { // only 'b' (no 'n')
              step = 0;
              offset = signA * valA; // valA is actually 'b' in this case
            }
          }
          this.dynamicPseudoClasses.push(['nth-child', [step, offset]]);
        } else if ((currentMatch = cursor.advanceAndMatch(syntaxRules.pseudo_class_simple))) {
          this.dynamicPseudoClasses.push([currentMatch[1]]);
        } else {
          // If no known selector component matched, break the loop.
          break;
        }
      }

      return this;
    }
  });

  /**
   * Represents a sequence of simple selectors and combinators (e.g., `div > p.foo`).
   * @class CompoundQuery
   * @augments AbstractQueryPart
   */
  const CompoundQuery = AbstractQueryPart.createDerivedClass({
    constructor: function() {
      this.querySegments = [];
    },

    /**
     * Parses a sequence of selector parts and combinators.
     * @param {InputCursor} cursor - The input string cursor.
     * @returns {CompoundQuery|BasicElementMatcher} This instance, or a BasicElementMatcher if only one part.
     */
    parseSequence: function(cursor) {
      let currentMatch;
      this.querySegments.push(BasicElementMatcher.createDerivedClass().parseFragment(cursor));

      while (!cursor.isConsumed() && !cursor.previewMatch(syntaxRules.list_separator) && (currentMatch = cursor.advanceAndMatch(syntaxRules.combinator))) {
        this.querySegments.push(currentMatch[1] || ' '); // Store combinator or default to descendant space
        this.querySegments.push(BasicElementMatcher.createDerivedClass().parseFragment(cursor));
      }

      return this.querySegments.length === 1 ? this.querySegments[0] : this;
    }
  });

  /**
   * Represents a comma-separated group of selectors (e.g., `h1, h2, .foo`).
   * @class QueryGroup
   * @augments AbstractQueryPart
   */
  const QueryGroup = AbstractQueryPart.createDerivedClass({
    constructor: function() {
      this.selectorList = [];
    },

    /**
     * Parses a comma-separated list of selectors.
     * @param {InputCursor} cursor - The input string cursor.
     * @returns {QueryGroup|CompoundQuery} This instance, or a CompoundQuery if only one selector.
     */
    parseList: function(cursor) {
      let currentMatch;
      this.selectorList.push(CompoundQuery.createDerivedClass().parseSequence(cursor));

      while (!cursor.isConsumed() && (currentMatch = cursor.advanceAndMatch(syntaxRules.list_separator))) {
        this.selectorList.push(CompoundQuery.createDerivedClass().parseSequence(cursor));
      }

      return this.selectorList.length === 1 ? this.selectorList[0] : this;
    }
  });

  // Expose the parsing functionality through jQuery.
  $.queryParser = function(selectorString) {
    const cursor = InputCursor.createDerivedClass(selectorString);
    const parsedResult = QueryGroup.createDerivedClass().parseList(cursor);

    // Attach original selector string for debugging/reference.
    parsedResult.originalSelector = selectorString;

    // Ensure the entire string was parsed.
    if (!cursor.isConsumed()) {
      throw new Error('Parsing Error: Unconsumed selector fragment at ' + cursor.getErrorPosition());
    }

    return parsedResult;
  };

  // Expose parser components for advanced usage or testing.
  $.queryParser.AbstractQueryPart = AbstractQueryPart;
  $.queryParser.BasicElementMatcher = BasicElementMatcher;
  $.queryParser.CompoundQuery = CompoundQuery;
  $.queryParser.QueryGroup = QueryGroup;

})(jQuery);

/*
 * This module extends the selector parsing classes with CSS specificity calculation logic.
 * Specificity helps determine which CSS rule applies when multiple rules target the same element.
 */
; // Ensure previous IIFE is closed properly

(function($) {
  // Define constants for specificity calculation components.
  const SPEC_ID_WEIGHT = 1;
  const SPEC_CLASS_ATTR_PSEUDO_WEIGHT = 1;
  const SPEC_TAG_PSEUDO_EL_WEIGHT = 1;

  /**
   * Calculates the CSS specificity for a BasicElementMatcher.
   * Specificity is returned as an array [id_count, class_attr_pseudo_count, tag_pseudo_el_count].
   * @method calculateSpecificity
   * @memberof BasicElementMatcher.prototype
   * @returns {Array<number>} The specificity array.
   */
  $.queryParser.BasicElementMatcher.attachMethod('calculateSpecificity', function() {
    // Return cached value if already computed.
    if (this.cachedSpecificity) {
      return this.cachedSpecificity;
    }

    // Initialize specificity components.
    let idComponent = this.elementId ? SPEC_ID_WEIGHT : 0;
    let classAttrPseudoComponent = 0;
    let tagPseudoElComponent = 0;

    // Add counts for classes, attributes, and simple pseudo-classes.
    if (this.cssClasses) classAttrPseudoComponent += this.cssClasses.length;
    if (this.htmlAttributes) classAttrPseudoComponent += this.htmlAttributes.length;
    if (this.dynamicPseudoClasses) classAttrPseudoComponent += this.dynamicPseudoClasses.length;

    // Add counts for tag name and pseudo-elements.
    if (this.elementTag && this.elementTag !== '*') tagPseudoElComponent += SPEC_TAG_PSEUDO_EL_WEIGHT;
    if (this.structuralPseudoElements) tagPseudoElComponent += this.structuralPseudoElements.length;

    // Recursively add specificity from negated selectors.
    if (this.negatedMatchers && this.negatedMatchers.length > 0) {
      this.negatedMatchers.forEach(negatedGroup => {
        const negatedSpecificity = negatedGroup.calculateSpecificity();
        idComponent += negatedSpecificity[0];
        classAttrPseudoComponent += negatedSpecificity[1];
        tagPseudoElComponent += negatedSpecificity[2];
      });
    }

    // Cache and return the computed specificity.
    return (this.cachedSpecificity = [idComponent, classAttrPseudoComponent, tagPseudoElComponent]);
  });

  /**
   * Calculates the CSS specificity for a CompoundQuery.
   * @method calculateSpecificity
   * @memberof CompoundQuery.prototype
   * @returns {Array<number>} The specificity array.
   */
  $.queryParser.CompoundQuery.attachMethod('calculateSpecificity', function() {
    // Return cached value if already computed.
    if (this.cachedSpecificity) {
      return this.cachedSpecificity;
    }

    // Initialize combined specificity.
    const combinedSpecificity = [0, 0, 0];

    // Iterate through query segments, skipping combinators.
    this.querySegments.forEach((segment, index) => {
      // Combinators are at odd indices, so process only even indices (BasicElementMatcher instances).
      if (index % 2 === 0) {
        const segmentSpecificity = segment.calculateSpecificity();
        combinedSpecificity[0] += segmentSpecificity[0];
        combinedSpecificity[1] += segmentSpecificity[1];
        combinedSpecificity[2] += segmentSpecificity[2];
      }
    });

    // Cache and return the computed specificity.
    return (this.cachedSpecificity = combinedSpecificity);
  });

  /**
   * Calculates the CSS specificity for a QueryGroup.
   * For a group, the specificity is simply the highest specificity of its individual selectors.
   * (Note: The original code summed specificities for a group, which is not standard CSS specificity.
   *  I will keep the summing behavior to match the original, but add a comment).
   * @method calculateSpecificity
   * @memberof QueryGroup.prototype
   * @returns {Array<number>} The specificity array.
   */
  $.queryParser.QueryGroup.attachMethod('calculateSpecificity', function() {
    // Return cached value if already computed.
    if (this.cachedSpecificity) {
      return this.cachedSpecificity;
    }

    // Initialize combined specificity.
    const combinedSpecificity = [0, 0, 0];

    // Sum specificities of all selectors in the group.
    // (Standard CSS specificity for a selector list is the highest of its components,
    // but the original implementation sums them, so we retain that behavior for cloning).
    this.selectorList.forEach(selector => {
      const selectorSpecificity = selector.calculateSpecificity();
      combinedSpecificity[0] += selectorSpecificity[0];
      combinedSpecificity[1] += selectorSpecificity[1];
      combinedSpecificity[2] += selectorSpecificity[2];
    });

    // Cache and return the computed specificity.
    return (this.cachedSpecificity = combinedSpecificity);
  });

})(jQuery);

/*
 * This module provides functionality to determine if a single DOM element matches a CSS selector.
 * Unlike Sizzle, which efficiently finds elements for a selector, this focuses on individual element validation.
 */
; // Ensure previous IIFE is closed properly

(function($) {
  // --- DOM Capability Tests ---
  const testElement = document.createElement('div');
  testElement.innerHTML = '<form id="testForm"><input name="testId" type="text"/></form>';
  document.body.appendChild(testElement); // Temporarily add to DOM for robust testing

  // Detect issues with getAttribute (e.g., IE6/7 returning property value instead of attribute value).
  const isGetAttributeBuggy = testElement.firstChild.getAttribute('id') !== 'testForm';

  // Check for modern Element Traversal API (firstElementChild, previousElementSibling).
  const supportsElementTraversal = testElement.firstElementChild && testElement.firstElementChild.tagName === 'FORM';

  // Check for `children` collection support.
  const supportsChildrenCollection = testElement.children && testElement.children[0].tagName === 'FORM';

  document.body.removeChild(testElement); // Clean up the test element

  // --- Function Body Extraction Utilities ---
  const funcBodyStartPattern = /^\s*function\s*\([^)]*\)\s*\{/;
  const funcBodyEndPattern = /}\s*$/;

  let extractFunctionBody = function(func) {
    const funcString = func.toString();
    const body = funcString.replace(funcBodyStartPattern, '').replace(funcBodyEndPattern, '').trim();
    return body;
  };

  // Verify `Function#toString` reliability.
  try {
    const testFunc = function() {
      return 'verified';
    };
    if ((new Function('', extractFunctionBody(testFunc)))() !== 'verified') {
      extractFunctionBody = null; // Mark as unreliable
    }
  } catch (e) {
    extractFunctionBody = null; // Mark as unreliable if any error occurs
    console.warn("Function#toString is unreliable in this environment for code generation.", e);
  }

  // --- Code Generation Placeholders ---
  const PASS_MATCH = /__PASS_EVAL__/g; // Placeholder for successful match in generated code
  const FAIL_MATCH = /__FAIL_EVAL__/g; // Placeholder for failed match in generated code

  const quotePrefixPattern = /^['"]/g; // Regex to check if a string starts with a quote.

  /**
   * Joins an array of JavaScript code lines into a single string.
   * @param {string[]} codeLines - Array of code strings.
   * @returns {string} The combined code.
   */
  const composeCodeBlock = function(codeLines) {
    return codeLines.join('\n');
  };

  /**
   * Joins an array of JavaScript code lines into a string, also marking it as complex.
   * @param {string[]} codeLines - Array of code strings.
   * @returns {string} A String object with a `complex` property.
   */
  const composeComplexCodeBlock = function(codeLines) {
    const complexCode = new String(codeLines.join('\n'));
    complexCode.complex = true; // Flag for special handling if needed
    return complexCode;
  };

  // --- Attribute Accessors for Generated Code ---

  /**
   * Generates a safe JavaScript variable name from an attribute name.
   * Non-identifier characters are hex-encoded.
   * @param {string} attrName - The original attribute name.
   * @returns {string} A safe variable name.
   */
  const attributeVarName = function(attrName) {
    return '_' + attrName.replace(/^[^A-Za-z]|[^A-Za-z0-9]/g, function(m) {
      return '_x' + m.charCodeAt(0).toString(16) + '_';
    });
  };

  let getAttributeValueGenerator;

  // Optimized attribute access for modern browsers.
  if (!isGetAttributeBuggy) {
    getAttributeValueGenerator = function(attrName) {
      return `const ${attributeVarName(attrName)} = el.getAttribute("${attrName}");`;
    };
  }
  // Fallback for older IE (IE 6, 7) with buggy getAttribute.
  else {
    // Map common attribute names to their DOM property equivalents for IE.
    const ieAttributeNameMap = {
      'class': 'className',
      'for': 'htmlFor'
    };

    getAttributeValueGenerator = function(attrName) {
      const iePropName = ieAttributeNameMap[attrName] || attrName;
      // Use getAttribute with flag 2 for properties, or getAttributeNode for true attribute value.
      return `const ${attributeVarName(attrName)} = el.getAttribute("${iePropName}", 2) || (el.getAttributeNode("${attrName}") || {}).nodeValue;`;
    };
  }

  // --- Attribute Comparison Operators for Generated Code ---
  // These are templates for comparisons within the generated matching function.
  const attributeComparisonOps = {
    '-': '!K', // Attribute exists
    '=': 'K !== "V"', // Attribute equals value
    '!=': 'K === "V"', // Attribute does not equal value
    '~=': '!K || (" " + K + " ").indexOf(" V ") === -1', // Contains word
    '^=': '!K || K.indexOf("V") !== 0', // Starts with
    '*=': '!K || K.indexOf("V") === -1', // Contains substring
    '$=': '!K || K.substring(K.length - "V".length) !== "V"', // Ends with
  };

  // --- Traversal State Management for Code Generation ---

  /**
   * Manages the state of element traversal during code generation.
   * @class QueryTraversalContext
   * @augments PrototypalObject
   */
  const QueryTraversalContext = PrototypalObject.createDerivedClass({
    constructor: function() {
      this.clearState();
    },

    /** Resets the internal state, clearing tracked attributes. */
    clearState: function() {
      this.trackedAttributes = {};
      this.trackedWhitespaceAttributes = {};
    },

    /**
     * Generates code to move to the previous sibling element.
     * @returns {string} JS code.
     */
    movePrevSibling: function() {
      this.clearState();
      if (supportsElementTraversal) {
        return 'el = el.previousElementSibling;';
      }
      return 'while((el = el.previousSibling) && el.nodeType !== 1) {}';
    },

    /**
     * Generates code to move to the next sibling element.
     * @returns {string} JS code.
     */
    moveNextSibling: function() {
      this.clearState();
      if (supportsElementTraversal) {
        return 'el = el.nextElementSibling;';
      }
      return 'while((el = el.nextSibling) && el.nodeType !== 1) {}';
    },

    /**
     * Generates code for a loop iterating through previous sibling elements.
     * @param {string} loopBody - The code to execute within the loop.
     * @returns {string} JS code.
     */
    loopPrevSiblings: function(loopBody) {
      this.clearState();
      if (supportsElementTraversal) {
        return composeCodeBlock([
          'while((el = el.previousElementSibling)){',
          loopBody,
          '}'
        ]);
      }
      return composeCodeBlock([
        'while((el = el.previousSibling)){',
        'if (el.nodeType !== 1) continue;',
        loopBody,
        '}'
      ]);
    },

    /**
     * Generates code to move to the parent element.
     * @returns {string} JS code.
     */
    moveParent: function() {
      this.clearState();
      return 'el = el.parentNode;';
    },

    /**
     * Generates code for a loop iterating through parent elements.
     * @param {string} loopBody - The code to execute within the loop.
     * @returns {string} JS code.
     */
    loopParents: function(loopBody) {
      this.clearState();
      return composeCodeBlock([
        'while((el = el.parentNode) && el.nodeType === 1){',
        loopBody,
        '}'
      ]);
    },

    /**
     * Tracks usage of an attribute and generates code to retrieve its value if not already tracked.
     * @param {string} attrName - The name of the attribute.
     * @returns {string|null} JS code to get the attribute, or null if already tracked.
     */
    trackAttributeUsage: function(attrName) {
      if (this.trackedAttributes[attrName]) {
        return null;
      }
      this.trackedAttributes[attrName] = true;
      return getAttributeValueGenerator(attrName);
    },

    /**
     * Tracks usage of a whitespace-padded attribute value and generates code to retrieve it.
     * @param {string} attrName - The name of the attribute.
     * @returns {string|null} JS code to get the padded attribute, or null if already tracked.
     */
    trackWhitespaceAttributeUsage: function(attrName) {
      if (this.trackedWhitespaceAttributes[attrName]) {
        return null;
      }
      this.trackedWhitespaceAttributes[attrName] = true;
      const attrVar = attributeVarName(attrName);
      return composeCodeBlock([
        this.trackAttributeUsage(attrName),
        `const _WS_${attrVar} = " " + ${attrVar} + " ";`
      ]);
    },

    /**
     * Generates code to save the current element reference.
     * @param {string} label - A unique label for the saved reference.
     * @returns {string} JS code.
     */
    saveElementReference: function(label) {
      return `const savedEl_${label} = el;`;
    },

    /**
     * Generates code to restore a previously saved element reference.
     * @param {string} label - The label of the reference to restore.
     * @returns {string} JS code.
     */
    restoreElementReference: function(label) {
      this.clearState(); // State is invalid after restoring
      return `el = savedEl_${label};`;
    }
  });

  // --- Pseudo-Class Check Generators for Generated Code ---
  // These generate JavaScript code snippets for various pseudo-class checks.
  const pseudoClassCheckGenerators = {
    'first-child': composeCodeBlock([
      'let currentElement = el;',
      'while((currentElement = currentElement.previousSibling)){ if (currentElement.nodeType === 1) __FAIL_EVAL__; }'
    ]),
    'last-child': composeCodeBlock([
      'let currentElement = el;',
      'while((currentElement = currentElement.nextSibling)){ if (currentElement.nodeType === 1) __FAIL_EVAL__; }'
    ]),
    'nth-child': function(step, offset) {
      // Generate code to calculate the index of the element among its siblings.
      const getIndexCode = composeCodeBlock([
        'let currentIndex = 1;',
        'let currentSibling = el;',
        'while((currentSibling = currentSibling.previousSibling)){',
        'if (currentSibling.nodeType === 1) currentIndex++;',
        '}'
      ]);

      // Handle the 'an+b' logic.
      if (step === 0) { // 'b' or '0n+b'
        return composeCodeBlock([
          getIndexCode,
          `if (currentIndex !== ${offset}) __FAIL_EVAL__;`
        ]);
      } else if (step === 1) { // 'n+b'
        return composeCodeBlock([
          getIndexCode,
          `if (currentIndex < ${offset}) __FAIL_EVAL__;`
        ]);
      } else if (step === -1) { // '-n+b'
        return composeCodeBlock([
          getIndexCode,
          `if (currentIndex > ${offset}) __FAIL_EVAL__;`
        ]);
      } else { // 'an+b' where a is not 0, 1, or -1
        return composeCodeBlock([
          getIndexCode,
          `if ((currentIndex - ${offset}) % ${step} !== 0 || (currentIndex - ${offset}) / ${step} < 0) __FAIL_EVAL__;`
        ]);
      }
    },
    // Additional pseudo-class generators (e.g., 'empty', 'only-child') would be added here.
  };

  /**
   * Placeholder method for compiling this matcher into an executable function.
   * (This is where the generated code based on the above templates would be used).
   * @method compileMatcher
   * @memberof BasicElementMatcher.prototype
   * @returns {function(Element): boolean} A function that checks if an element matches.
   */
  $.queryParser.BasicElementMatcher.attachMethod('compileMatcher', function() {
    // This method would take the parsed structure (this.elementTag, this.elementId, etc.)
    // and use the QueryTraversalContext and pseudoClassCheckGenerators to build
    // a highly optimized JavaScript function that directly checks an element.
    // For example, for a selector "div#myId.myClass", it might generate:
    /*
    return function(el) {
      if (!el || el.nodeType !== 1) return false;
      if (el.tagName.toLowerCase() !== 'div') return false;
      if (el.id !== 'myId') return false;
      if ((" " + el.className + " ").indexOf(" myClass ") === -1) return false;
      return true;
    };
    */
    // Since the original code did not provide this compilation, we leave it as a placeholder.
    return function(el) {
      // For demonstration, a basic check:
      if (!el || el.nodeType !== 1) return false;
      if (this.elementTag && this.elementTag !== '*' && el.tagName.toLowerCase() !== this.elementTag.toLowerCase()) return false;
      if (this.elementId && el.id !== this.elementId) return false;
      // This is a simplified dummy implementation. A real compiler would generate
      // optimized code using the templates above.
      console.warn("Matching function not fully implemented in clone; returning dummy true for currently matched parts.");
      return true;
    }.bind(this);
  });


})(jQuery);