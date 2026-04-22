// This module provides advanced HTML/XML markup generation capabilities,
// supporting abbreviation expansion, code snippets, and highly customizable
// output formatting for integration into editor environments or build tools.

// Regular expression to accurately identify a complete HTML/XML tag structure.
const htmlTagPattern = /<\/?[\w:\-]+(?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*\s*(\/?)>$/;

// Enumeration of distinct abbreviation entry types for clarity and robust lookup.
const ABBR_TYPE_SHORTCUT = 'markup-shortcut';    // Represents a direct tag abbreviation (e.g., 'div')
const ABBR_TYPE_EXPANSION = 'markup-expansion';   // Represents a more complex abbreviation template
const ABBR_TYPE_LINK = 'markup-reference';       // Points to another abbreviation definition

// A special marker string used internally to denote where dynamic content,
// like line-repeated text or child elements, should be inserted.
const contentInsertionMarker = '{%::markup-content::%}';

// Default line termination sequence; can be dynamically updated by the host environment.
let defaultLineSeparator = '\n'; 

// The primary object encapsulating all markup generation logic and state.
const markupGen = (function() {

    // Defines the baseline formatting rules. This configuration is immutable
    // to ensure consistency across all derived profiles.
    const defaultFormatConfig = Object.freeze({
        elementCase: 'lower',           // Casing for HTML/XML tag names ('lower', 'upper')
        attributeCase: 'lower',         // Casing for attribute names ('lower', 'upper')
        attributeQuotes: 'double',      // Type of quotes for attribute values ('single', 'double')
        
        // Determines how newlines are applied after tags:
        // 'always': Forces a newline after every tag.
        // 'decide': Applies newlines based on element type (block vs. inline).
        // 'never': Suppresses all newlines between tags for compact output.
        tagNewlineStrategy: 'decide', 
        
        placeCursorPlaceholder: true,   // If true, a '|' placeholder is inserted for cursor positioning.
        
        applyIndentation: true,         // Enables or disables indentation for nested elements.
        
        // Dictates the style for self-closing tags (e.g., `<br />` vs `<br>`).
        // 'xhtml': Uses ` />` for empty tags.
        // 'html5': Omits the slash for known empty HTML5 tags.
        // 'none': Never uses a self-closing slash.
        selfClosingStyle: 'xhtml'     
    });
    
    // A collection of named formatting profiles, allowing users to switch
    // between different output styles (e.g., 'html', 'xml', 'plain').
    // Using a Map for efficient key-value storage and iteration.
    const formatConfigurations = new Map();

    /**
     * Validates if a given character is permissible within an abbreviation string.
     * This ensures that parsed abbreviations adhere to a defined character set.
     * @param {string} character The single character string to check.
     * @returns {boolean} True if the character is allowed, false otherwise.
     */
    function isValidAbbrCharacter(character) {
        // Basic input validation: character must be a single-character string.
        if (typeof character !== 'string' || character.length !== 1) {
            console.warn("isValidAbbrCharacter received invalid input:", character);
            return false;
        }
        const charCode = character.charCodeAt(0);
        // Defines the set of special symbols explicitly allowed in abbreviations.
        const specialSymbols = '#.>+*:$-_!@'; 

        // Checks if the character is an uppercase letter, lowercase letter, number,
        // or one of the defined special symbols.
        return (charCode >= 65 && charCode <= 90) ||    // A-Z
               (charCode >= 97 && charCode <= 122) ||   // a-z
               (charCode >= 48 && charCode <= 57) ||    // 0-9
               specialSymbols.includes(character);      // Check against special symbols
    }

    /**
     * Obtains the newline character sequence appropriate for the current environment.
     * This function serves as an abstraction layer for platform-specific line endings.
     * @returns {string} The configured newline character string (e.g., '\n' or '\r\n').
     */
    function retrieveLineSeparator() {
        // In a production environment, this might query a host editor API.
        // Here, it defaults to the `defaultLineSeparator` variable.
        return defaultLineSeparator; 
    }

    /**
     * Divides a multi-line text block into an array of individual line strings.
     * Offers an option to exclude lines that contain only whitespace.
     * @param {string} inputText The string content to be split.
     * @param {boolean} [filterEmptyLines=false] If true, lines consisting only of whitespace are removed.
     * @returns {string[]} An array where each element represents a line from the input text.
     */
    function divideTextIntoLines(inputText, filterEmptyLines = false) {
        // Input validation: ensure `inputText` is a string.
        if (typeof inputText !== 'string') {
            console.error("divideTextIntoLines expects a string, received:", typeof inputText);
            return []; 
        }
        // Normalize various newline formats (`\r\n`, `\n\r`, `\r`) to a consistent `\n`
        // before splitting, ensuring cross-platform consistency.
        const normalizedText = inputText.replace(/\r\n|\n\r|\r/g, '\n');
        let linesArray = normalizedText.split('\n');

        if (filterEmptyLines) {
            // Utilizes Array.prototype.filter for a declarative and efficient removal
            // of empty or whitespace-only lines.
            linesArray = linesArray.filter(line => stripWhitespace(line).length > 0);
        }
        
        return linesArray;
    }

    /**
     * Trims leading and trailing whitespace characters from a string.
     * Provides a safe default by returning an empty string if the input is null or undefined.
     * @param {string} inputString The string to process.
     * @returns {string} The string with whitespace removed from both ends.
     */
    function stripWhitespace(inputString) {
        // Leverages the built-in String.prototype.trim() method for performance.
        return (inputString || "").trim();
    }

    /**
     * Generates a new formatting configuration object by merging a set of custom
     * options with the predefined `defaultFormatConfig`.
     * @param {object} [options={}] An object containing properties to override or add to the default config.
     * @returns {object} A new configuration object reflecting the merged settings.
     */
    function establishFormatConfig(options = {}) {
        // Object.assign creates a shallow copy, ensuring the default config remains untouched.
        return Object.assign({}, defaultFormatConfig, options);
    }

    /**
     * Registers a new formatting profile under a unique name.
     * The profile name is converted to lowercase to ensure case-insensitive retrieval.
     * @param {string} profileName The identifier for the new profile (e.g., 'html5', 'custom').
     * @param {object} [profileOptions={}] Configuration settings specific to this profile.
     */
    function configureFormatPreset(profileName, profileOptions = {}) {
        // Basic validation for the profile name.
        if (typeof profileName !== 'string' || !profileName.trim()) {
            console.error("configureFormatPreset requires a non-empty string for profileName.");
            return;
        }
        // Stores the merged configuration in the `formatConfigurations` Map.
        formatConfigurations.set(profileName.toLowerCase(), establishFormatConfig(profileOptions));
    }
    
    /**
     * Transforms a comma-separated string into a JavaScript `Set` object.
     * This is highly optimized for checking the existence of items.
     * @param {string} commaSeparatedString The input string (e.g., "itemA, itemB, itemC").
     * @returns {Set<string>} A `Set` containing the unique, trimmed items. Returns an empty `Set` for invalid input.
     */
    function convertStringListToSet(commaSeparatedString) {
        // Input type validation.
        if (typeof commaSeparatedString !== 'string') {
            console.warn("convertStringListToSet expects a string, received:", typeof commaSeparatedString);
            return new Set();
        }
        // Splits the string, trims whitespace from each part, and filters out any empty results.
        const items = commaSeparatedString.split(',').map(item => stripWhitespace(item)).filter(item => item.length > 0);
        return new Set(items);
    }

    /**
     * Applies indentation to a given block of text.
     * Each line (except the first) is prepended with the specified indentation string.
     * @param {string} textBlock The multi-line text content to indent.
     * @param {string|number} indentAmount The number of indentation units or the actual string to use for indentation.
     * @returns {string} The indented text block.
     */
    function indentTextContent(textBlock, indentAmount) {
        // Input validation for the text content.
        if (typeof textBlock !== 'string') {
            console.error("indentTextContent expects a string for textBlock, received:", typeof textBlock);
            return '';
        }

        let indentString = '';
        // Retrieves global indentation settings, defaulting to a tab character.
        const globalSettings = markupGen.getGlobalSettings(); 
        const indentationUnit = globalSettings.variables.indentation || '\t'; 

        if (typeof indentAmount === 'number') {
            // Efficiently generates the indentation string using `String.prototype.repeat`.
            indentString = indentationUnit.repeat(indentAmount);
        } else if (typeof indentAmount === 'string') {
            indentString = indentAmount;
        } else {
            console.warn("indentTextContent received an unexpected indentAmount type:", typeof indentAmount);
            return textBlock; // Return original text if indentation amount is invalid.
        }
        
        const lines = divideTextIntoLines(textBlock);
        // Uses Array.prototype.map to apply indentation to each line, skipping the first.
        const indentedLines = lines.map((line, index) => (index === 0 ? line : `${indentString}${line}`));
            
        return indentedLines.join(retrieveLineSeparator());
    }

    /**
     * Checks for the availability of a specific code snippet definition.
     * @param {string} definitionType The category of the snippet (e.g., 'html', 'css').
     * @param {string} abbreviation The unique identifier for the snippet.
     * @returns {boolean} True if the snippet is defined, false otherwise.
     */
    function isSnippetAvailable(definitionType, abbreviation) {
        // Leverages `markupGen.retrieveSnippetDefinition` to check for existence.
        return !!markupGen.retrieveSnippetDefinition(definitionType, abbreviation);
    }

    /**
     * Analyzes a string to determine if its final segment constitutes a complete HTML/XML tag.
     * This is crucial for distinguishing between tag structures and abbreviation operators.
     * @param {string} inputString The string to evaluate.
     * @returns {boolean} True if the string ends with a valid tag, false otherwise.
     */
    function isFinalSegmentHtmlTag(inputString) {
        return htmlTagPattern.test(inputString);
    }

    /**
     * Fetches a specific classification of elements (e.g., 'empty', 'block_level')
     * from a given resource context (like HTML or XML definitions).
     * @param {object} resource The resource object containing element type definitions.
     * @param {string} classificationType The name of the classification to retrieve.
     * @returns {Set<string>} A `Set` of element names belonging to the specified classification.
     *                         Returns an empty `Set` if the resource or classification is not found.
     */
    function fetchElementClassification(resource, classificationType) {
        // Uses optional chaining for safe access to nested properties.
        const elementTypes = resource?.elementTypes;
        if (elementTypes && elementTypes[classificationType]) {
            // Converts the stored comma-separated string into a `Set` for efficient lookups.
            return convertStringListToSet(elementTypes[classificationType]);
        }
        return new Set(); 
    }

    /**
     * Substitutes placeholder variables (e.g., `${variableName}`) within a string
     * with their corresponding values from a provided map or global settings.
     * @param {string} inputString The string containing variables to replace.
     * @param {object} [variableMap] An optional object mapping variable names to values.
     *                                 Defaults to the global settings variables if not provided.
     * @returns {string} The string with all recognized variables replaced.
     */
    function substitutePlaceholders(inputString, variableMap) {
        const currentVars = variableMap || markupGen.getGlobalSettings().variables || {};
        // Uses a regular expression to find all `${variableName}` patterns.
        return inputString.replace(/\$\{([\w\-]+)\}/g, (match, varName) => {
            // If the variable name exists in `currentVars`, its value is used; otherwise, the original placeholder remains.
            return currentVars.hasOwnProperty(varName) ? currentVars[varName] : match;
        });
    }

    /**
     * Represents a single HTML/XML element within the markup generation tree.
     * This class manages the element's name, attributes, children, and content.
     * @class MarkupNode
     * @param {string} nodeName The tag name of the element (e.g., 'div', 'span').
     * @param {number} [repeatCount=1] Specifies how many times this element should be repeated in the output.
     * @param {string} [nodeType='html'] The document type context (e.g., 'html', 'xml') influencing definitions.
     */
    function MarkupNode(nodeName, repeatCount = 1, nodeType = 'html') {
        // Enforces valid input for `nodeName`.
        if (typeof nodeName !== 'string' || !nodeName.trim()) {
            throw new Error("MarkupNode requires a valid nodeName string.");
        }
        // Validates `repeatCount`, defaulting to 1 for invalid inputs.
        if (typeof repeatCount !== 'number' || repeatCount < 1) {
            console.warn("MarkupNode received invalid repeatCount, defaulting to 1.");
            repeatCount = 1;
        }

        const processedName = nodeName.toLowerCase();
        const processedType = nodeType.toLowerCase();

        // Attempts to resolve an abbreviation definition, including following references.
        let abbreviationDef = markupGen.retrieveAbbreviation(processedType, processedName);
        if (abbreviationDef && abbreviationDef.type === ABBR_TYPE_LINK) {
            abbreviationDef = markupGen.retrieveAbbreviation(processedType, abbreviationDef.value);
        }
        
        this.name = (abbreviationDef?.value?.name) ? abbreviationDef.value.name : processedName.replace('+', '');
        this.repeatCount = repeatCount;
        this.childElements = []; 
        this.nodeAttributes = []; // Array to maintain attribute order for output.
        this.attributeMap = new Map(); // Map for efficient attribute lookup and update.
        this.abbreviationData = abbreviationDef; 
        this.resourceContext = markupGen.getMarkupResource(processedType); 
        this.textContent = '';
        this.shouldRepeatByLines = false; 
        
        // Integrates default attributes from the abbreviation definition.
        if (this.abbreviationData?.value?.attributes) {
            this.abbreviationData.value.attributes.forEach(attr => {
                this.attachAttribute(attr.name, attr.value);
            });
        }
    }

    MarkupNode.prototype = {
        /**
         * Adds a child `MarkupNode` to the current node's list of children.
         * @param {MarkupNode} childNode The `MarkupNode` instance to append.
         */
        appendKid: function(childNode) {
            // Ensures that only valid `MarkupNode` instances are added as children.
            if (!(childNode instanceof MarkupNode)) {
                console.error("appendKid expects a MarkupNode instance.");
                return;
            }
            this.childElements.push(childNode);
        },
        
        /**
         * Attaches a new attribute or updates an existing one.
         * Special handling is provided for the 'class' attribute, which concatenates values.
         * @param {string} attributeName The name of the attribute (e.g., 'id', 'class').
         * @param {string} attributeValue The value associated with the attribute.
         */
        attachAttribute: function(attributeName, attributeValue) {
            if (!attributeName) {
                console.warn("Attempted to add an attribute with an empty name.");
                return;
            }

            const existingAttr = this.attributeMap.get(attributeName);
            if (existingAttr) {
                // If 'class' attribute, append values with a space; otherwise, replace.
                if (attributeName.toLowerCase() === 'class') {
                    existingAttr.value = existingAttr.value ? `${existingAttr.value} ${attributeValue}` : attributeValue;
                } else {
                    existingAttr.value = attributeValue;
                }
            } else {
                // For a new attribute, create and store it in both the Map and the array.
                const newAttr = { name: attributeName, value: attributeValue };
                this.attributeMap.set(attributeName, newAttr);
                this.nodeAttributes.push(newAttr); 
            }
        },
        
        /**
         * Checks if this `MarkupNode` represents an empty (self-closing) element.
         * The determination is based on abbreviation data or resource-defined empty tags.
         * @returns {boolean} True if the element is self-closing, false otherwise.
         */
        isSelfClosing: function() {
            const fromAbbr = this.abbreviationData?.value?.is_empty;
            const fromResource = fetchElementClassification(this.resourceContext, 'empty').has(this.name);
            return fromAbbr || fromResource;
        },
        
        /**
         * Determines if this `MarkupNode` is categorized as an inline-level element.
         * @returns {boolean} True if the element is inline, false otherwise.
         */
        isInlineElement: function() {
            return fetchElementClassification(this.resourceContext, 'inline_level').has(this.name);
        },
        
        /**
         * Determines if this `MarkupNode` is categorized as a block-level element.
         * @returns {boolean} True if the element is block-level, false otherwise.
         */
        isBlockElement: function() {
            return fetchElementClassification(this.resourceContext, 'block_level').has(this.name);
        },
        
        /**
         * Scans the node's `textContent` to detect the presence of embedded HTML/XML tags.
         * This is useful for making formatting decisions (e.g., whether to indent content).
         * @returns {boolean} True if tags are found within the content, false otherwise.
         */
        hasEmbeddedTags: function() {
            return this.getNodeContent() && htmlTagPattern.test(this.getNodeContent());
        },
        
        /**
         * Checks if any of this node's direct `childElements` are block-level elements.
         * This influences how newlines and indentation are applied.
         * @returns {boolean} True if block-level children exist, false otherwise.
         */
        containsBlockChildren: function() {
            // If the node's own content contains tags and the node is block-level,
            // it effectively acts as if it has block children for formatting purposes.
            if (this.hasEmbeddedTags() && this.isBlockElement()) {
                return true;
            }
            // Uses `Array.prototype.some` for an efficient check across all child elements.
            return this.childElements.some(child => child.isBlockElement());
        },
        
        /**
         * Assigns a new string as the textual content of this node.
         * Ensures the content is always stored as a string.
         * @param {string} newContent The string content to be set.
         */
        setNodeContent: function(newContent) {
            this.textContent = String(newContent || ''); 
        },
        
        /**
         * Retrieves the current textual content associated with this node.
         * @returns {string} The node's textual content.
         */
        getNodeContent: function() {
            return this.textContent;
        },
        
        /**
         * Traverses the child hierarchy to find the deepest and last descendant node.
         * This is often used for placing dynamic content or a cursor placeholder.
         * @returns {MarkupNode|null} The deepest descendant node, or `null` if no children exist.
         */
        locateDeepestDescendant: function() {
            if (this.childElements.length === 0) {
                return null;
            }
                
            let currentDeepest = this;
            // Iteratively moves down to the last child of the last child until a leaf node is found.
            while (currentDeepest.childElements.length > 0) {
                currentDeepest = currentDeepest.childElements[currentDeepest.childElements.length - 1];
            }
            
            return currentDeepest;
        },
        
        /**
         * Internal helper to determine if a newline should be inserted after a given node,
         * based on the current formatting configuration and the node's block status.
         * @param {object} currentConfig The active formatting configuration.
         * @param {MarkupNode} node The node to evaluate.
         * @returns {boolean} True if a newline is permitted, false otherwise.
         */
        _shouldAllowNewline: function(currentConfig, node) {
            return (currentConfig.tagNewlineStrategy === 'always' || 
                    (currentConfig.tagNewlineStrategy === 'decide' && node.isBlockElement()));
        },

        /**
         * Internal helper to format all attributes of the node into a single string.
         * Applies casing rules and handles cursor placeholders for attribute values.
         * @param {object} currentConfig The active formatting configuration.
         * @param {string} cursorPlaceholder The string to insert for cursor positioning.
         * @returns {string} A space-prefixed string of formatted attributes (e.g., ' class="foo" id="bar"').
         */
        _formatAttributes: function(currentConfig, cursorPlaceholder) {
            const quoteChar = currentConfig.attributeQuotes === 'single' ? "'" : '"';
            const attrCaseFunc = currentConfig.attributeCase === 'upper' ? 
                                 (str) => str.toUpperCase() : 
                                 (str) => str.toLowerCase();

            return this.nodeAttributes.map(attr => {
                const attrNameFormatted = attrCaseFunc(attr.name);
                const attrValue = attr.value || cursorPlaceholder; // Insert cursor if attribute value is empty.
                return ` ${attrNameFormatted}=${quoteChar}${attrValue}${quoteChar}`;
            }).join('');
        },

        /**
         * Internal helper to construct the opening and closing tag strings for the node,
         * applying casing, self-closing style, and attribute formatting.
         * @param {object} currentConfig The active formatting configuration.
         * @param {string} formattedAttributes The already formatted attribute string.
         * @returns {{openingTag: string, closingTag: string}} An object containing the generated tag strings.
         */
        _generateTagStrings: function(currentConfig, formattedAttributes) {
            let openingTag = '';
            let closingTag = '';
            const nodeCaseFunc = currentConfig.elementCase === 'upper' ? 
                                 (str) => str.toUpperCase() : 
                                 (str) => str.toLowerCase();
            const tagNameFormatted = nodeCaseFunc(this.name);
            // An element is self-closing if its definition implies it AND it has no actual children.
            const isSelfClosingElement = this.isSelfClosing() && this.childElements.length === 0;

            if (this.name) {
                if (isSelfClosingElement) {
                    let selfClosingSuffix = '';
                    if (currentConfig.selfClosingStyle === 'xhtml') {
                        selfClosingSuffix = ' /';
                    } else if (currentConfig.selfClosingStyle === 'html5') {
                        // In HTML5, known empty tags (like <br>, <input>) do not use a slash.
                        // For generic XML or non-standard empty tags, a slash might be implied by `true`.
                        // Original logic had a boolean `true` for self_closing_tag, mapping to `/`.
                        if (currentConfig.selfClosingStyle === true) { 
                           selfClosingSuffix = '/';
                        } else {
                           selfClosingSuffix = ''; // For standard HTML5 empty tags.
                        }
                    } else if (currentConfig.selfClosingStyle === true) { 
                         selfClosingSuffix = '/';
                    }
                    openingTag = `<${tagNameFormatted}${formattedAttributes}${selfClosingSuffix}>`;
                } else {
                    openingTag = `<${tagNameFormatted}${formattedAttributes}>`;
                    closingTag = `</${tagNameFormatted}>`;
                }
            }
            return { openingTag, closingTag };
        },
        
        /**
         * Renders the `MarkupNode` and its children into a complete HTML/XML string,
         * applying all specified formatting rules from the given profile.
         * This method has been significantly refactored for clarity and modularity.
         * @param {string} profileName The name of the formatting profile to apply (e.g., 'html', 'plain').
         * @returns {string} The fully rendered HTML/XML string for this node and its descendants.
         * @throws {Error} If the specified `profileName` does not exist.
         */
        renderHtmlString: function(profileName) {
            const currentConfig = formatConfigurations.get(profileName.toLowerCase());
            if (!currentConfig) {
                throw new Error(`Formatting profile "${profileName}" not found. Please configure it.`);
            }

            const cursorPlaceholder = currentConfig.placeCursorPlaceholder ? '|' : '';
            const formattedAttributes = this._formatAttributes(currentConfig, cursorPlaceholder);
            let { openingTag, closingTag } = this._generateTagStrings(currentConfig, formattedAttributes);
            let childContent = '';
            let finalOutputSegments = [];

            const isNodeEmpty = this.isSelfClosing() && this.childElements.length === 0;

            // Step 1: Recursively render child elements.
            if (!isNodeEmpty) {
                const deepestChild = this.locateDeepestDescendant();
                if (deepestChild && this.shouldRepeatByLines) {
                    // If repeating content by lines, the deepest child receives the content marker.
                    deepestChild.setNodeContent(contentInsertionMarker);
                }

                for (let i = 0; i < this.childElements.length; i++) {
                    const currentChild = this.childElements[i];
                    childContent += currentChild.renderHtmlString(profileName);
                    
                    // Add newlines between children based on configuration and element types.
                    if (i < this.childElements.length - 1) {
                        const nextChild = this.childElements[i + 1];
                        if (this._shouldAllowNewline(currentConfig, currentChild) || 
                            this._shouldAllowNewline(currentConfig, nextChild)) {
                            childContent += retrieveLineSeparator();
                        }
                    }
                }
            }

            // Step 2: Apply indentation and cursor placement for the current node's structure.
            if (currentConfig.tagNewlineStrategy !== 'never') {
                const needsBlockFormatting = this.name && (currentConfig.tagNewlineStrategy === 'always' || this.containsBlockChildren());
                
                if (needsBlockFormatting) {
                    if (closingTag) { 
                        openingTag += retrieveLineSeparator();
                        if (childContent && currentConfig.applyIndentation) {
                            childContent = indentTextContent(childContent, 1);
                        } else if (!childContent && currentConfig.placeCursorPlaceholder && !isNodeEmpty) {
                             // If no child content but not an empty tag, place cursor inside.
                             openingTag += cursorPlaceholder;
                        }
                        closingTag = retrieveLineSeparator() + closingTag;
                    } 
                }
            }
            
            // Step 3: Handle repetition based on lines of provided content.
            if (this.shouldRepeatByLines) {
                const contentLines = divideTextIntoLines(stripWhitespace(this.getNodeContent()), true);
                // Ensure there's at least one line to process, even if empty.
                if (contentLines.length === 0) {
                    contentLines.push('');
                }

                contentLines.forEach((line, index) => {
                    let currentIterationContent = deepestChild ? '' : contentInsertionMarker;
                    if (childContent && !deepestChild) {
                        currentIterationContent += retrieveLineSeparator();
                    }
                    
                    // Replace iteration counters (e.g., $1, $2) within tags for each repetition.
                    const iterationOpeningTag = openingTag.replace(/\$/g, String(index + 1));
                    const iterationClosingTag = closingTag.replace(/\$/g, String(index + 1));
                    
                    let elementString = `${iterationOpeningTag}${currentIterationContent}${childContent}${iterationClosingTag}`;
                    finalOutputSegments.push(elementString.replace(contentInsertionMarker, stripWhitespace(line)));
                });
            } else {
                // Step 4: Handle standard repetition (fixed number of times).
                let nodeContentForRepetition = '';
                if (this.getNodeContent()) {
                    const padCount = (currentConfig.tagNewlineStrategy === 'always' || (this.hasEmbeddedTags() && this.isBlockElement())) ? 1 : 0;
                    nodeContentForRepetition = indentTextContent(this.getNodeContent(), padCount);
                    if (childContent) { 
                        nodeContentForRepetition += childContent;
                    }
                } else {
                    nodeContentForRepetition = childContent;
                }
                
                // If no content, not self-closing, and cursor enabled, place cursor.
                if (!nodeContentForRepetition && !isNodeEmpty && currentConfig.placeCursorPlaceholder) {
                    nodeContentForRepetition = cursorPlaceholder;
                }

                for (let i = 0; i < this.repeatCount; i++) {
                    // Replace iteration counters ($) in tags.
                    const iterationOpeningTag = openingTag.replace(/\$/g, String(i + 1));
                    const iterationClosingTag = closingTag.replace(/\$/g, String(i + 1));

                    finalOutputSegments.push(`${iterationOpeningTag}${nodeContentForRepetition}${iterationClosingTag}`);
                }
            }
            
            // Step 5: Join the final segments, adding newlines between repetitions if allowed.
            const segmentGlue = this._shouldAllowNewline(currentConfig, this) ? retrieveLineSeparator() : '';
            return finalOutputSegments.join(segmentGlue);
        }
    };
    
    /**
     * Represents a predefined code template (snippet) that can be expanded into markup.
     * Unlike `MarkupNode`, a `CodeSnippet` holds a string template that is directly processed.
     * @class CodeSnippet
     * @param {string} snippetName The identifier for the snippet (e.g., 'html:5', 'lorem').
     * @param {number} [repeatCount=1] The number of times the snippet's content should be repeated.
     * @param {string} [contextType='html'] The document context (e.g., 'html', 'css') for snippet lookup.
     */
    function CodeSnippet(snippetName, repeatCount = 1, contextType = 'html') {
        if (typeof snippetName !== 'string' || !snippetName.trim()) {
            throw new Error("CodeSnippet requires a valid snippetName.");
        }
        this.name = snippetName;
        this.repeatCount = repeatCount;
        this.childElements = []; // Children for snippets are usually inserted into a placeholder.
        this.textContent = ''; // Snippets typically define their own content, so this is less critical.
        this.shouldRepeatByLines = false;
        
        // Stores attributes that might be dynamically inserted into the snippet template.
        this.placeholderAttributes = new Map([
            ['id', '|'], // Default placeholders for common attributes.
            ['class', '|']
        ]);

        // Retrieves the raw snippet content template.
        this.snippetDefinition = markupGen.retrieveSnippetDefinition(contextType, snippetName);
        if (!this.snippetDefinition) {
            console.warn(`Snippet "${snippetName}" not found for type "${contextType}".`);
            this.value = `<!-- Snippet "${snippetName}" not found -->`; // Fallback message.
        } else {
            this.value = this.snippetDefinition.content;
        }
    }
    
    // `CodeSnippet` implements a subset of `MarkupNode`'s interface for consistency,
    // but its rendering logic is distinct due to its template-based nature.
    CodeSnippet.prototype = {
        /**
         * Appends a child `MarkupNode`. For snippets, children are not directly nested
         * but are rendered and inserted into a designated placeholder within the snippet's template.
         * @param {MarkupNode} childNode The child node to render and insert.
         */
        appendKid: function(childNode) {
            this.childElements.push(childNode);
        },
        
        /**
         * Attaches an attribute to the snippet. These attributes are then used to
         * replace placeholders within the snippet's template (e.g., `${attr:id}`).
         * @param {string} attrName The name of the attribute.
         * @param {string} attrValue The value of the attribute.
         */
        attachAttribute: function(attrName, attrValue){
            this.placeholderAttributes.set(attrName, attrValue);
        },
        
        /**
         * Snippets are generally treated as block-level elements for formatting purposes,
         * as they often represent larger structural blocks of code.
         * @returns {boolean} Always returns `true`.
         */
        isBlockElement: function() {
            return true; 
        },

        /**
         * Internal helper to determine if a newline should be inserted after a snippet,
         * based on the current formatting configuration and the snippet's block status.
         * @param {object} currentConfig The active formatting configuration.
         * @param {CodeSnippet} node The snippet node to check.
         * @returns {boolean} True if a newline is permitted, false otherwise.
         */
        _shouldAllowNewline: function(currentConfig, node) {
            // Snippets are always treated as block elements for newline decisions.
            return (currentConfig.tagNewlineStrategy === 'always' || 
                    (currentConfig.tagNewlineStrategy === 'decide' && node.isBlockElement()));
        },

        /**
         * Renders the `CodeSnippet`'s template into a final string,
         * performing placeholder substitutions for cursor, children, global variables, and attributes.
         * @param {string} profileName The name of the formatting profile to use.
         * @returns {string} The fully expanded and formatted snippet string.
         */
        renderHtmlString: function(profileName) {
            let renderedSnippet = this.value || '';
            const lineSeparator = retrieveLineSeparator();
            const currentConfig = formatConfigurations.get(profileName.toLowerCase());
            const globalSettings = markupGen.getGlobalSettings();

            // 1. Substitute cursor placeholders (e.g., `${cursor}`, `$0`).
            const cursorPlaceholder = currentConfig?.placeCursorPlaceholder ? '|' : '';
            renderedSnippet = renderedSnippet.replace(/\$\{cursor\}|\$0/g, cursorPlaceholder);
            
            // 2. Insert rendered child elements into the snippet's designated placeholder.
            if (this.childElements.length > 0) {
                let childrenOutput = this.childElements.map(child => child.renderHtmlString(profileName)).join(lineSeparator);
                
                // If indentation is active, indent the children's content.
                if (currentConfig?.applyIndentation) {
                   childrenOutput = indentTextContent(childrenOutput, 1);
                }
                
                // Replace the child placeholder (e.g., `${child}`, `$1`).
                renderedSnippet = renderedSnippet.replace(/\$\{child\}|\$1/g, childrenOutput);
            }

            // 3. Substitute global variables (e.g., `${nl}`, `${indent}`).
            renderedSnippet = substitutePlaceholders(renderedSnippet, globalSettings.variables);
            
            // 4. Dynamically insert attributes based on placeholders like `${attr:id}`.
            this.placeholderAttributes.forEach((val, key) => {
                const attrPlaceholder = new RegExp(`\\$\\{attr:${key}\\}`, 'g');
                if (renderedSnippet.match(attrPlaceholder)) {
                    const quoteChar = currentConfig?.attributeQuotes === 'single' ? "'" : '"';
                    const attrCaseFunc = currentConfig?.attributeCase === 'upper' ? 
                                         (str) => str.toUpperCase() : 
                                         (str) => str.toLowerCase();
                    const formattedAttr = `${attrCaseFunc(key)}=${quoteChar}${val}${quoteChar}`;
                    renderedSnippet = renderedSnippet.replace(attrPlaceholder, formattedAttr);
                }
            });

            // 5. Handle snippet repetition, adjusting internal counters (e.g., `$2` becomes `$3` on second iteration).
            const repeatedSnippets = [];
            for (let i = 0; i < this.repeatCount; i++) {
                let iterationSpecificSnippet = renderedSnippet.replace(/\$([0-9]+)/g, (match, p1) => {
                    // `$0` and `$1` are special (cursor/children); other counters are incremented.
                    if (p1 === '0' || p1 === '1') return match; 
                    return String(parseInt(p1, 10) + i); 
                });
                repeatedSnippets.push(iterationSpecificSnippet);
            }

            return repeatedSnippets.join(this._shouldAllowNewline(currentConfig, this) ? lineSeparator : '');
        }
    };

    // Public API of the `markupGen` module, exposing core functionalities.
    return {
        // Exposes constants for external use.
        ABBR_TYPE_SHORTCUT,
        ABBR_TYPE_EXPANSION,
        ABBR_TYPE_LINK,
        contentInsertionMarker,

        // Configuration and Utility Functions.
        // Provides a mock global settings object. In a real application, this would
        // be dynamically loaded or provided by the host environment.
        getGlobalSettings: function() {
            // This structure mimics the original `zen_settings` for compatibility.
            return window.markupGlobalSettings || {
                variables: {
                    indentation: '\t', // Default indentation character.
                    newline: retrieveLineSeparator(),
                    lang: 'en', // Example: default language for html:5 snippet.
                    title: 'Document' // Example: default title for html:5 snippet.
                },
                html: {
                    elementTypes: {
                        empty: 'area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr',
                        inline_level: 'a,abbr,acronym,b,bdo,big,br,button,cite,code,dfn,em,i,img,input,kbd,label,map,object,output,q,samp,script,select,small,span,strong,sub,sup,textarea,time,tt,var',
                        block_level: 'address,article,aside,blockquote,body,canvas,dd,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,li,main,nav,noscript,ol,p,pre,section,tfoot,ul,video'
                    },
                    abbreviations: new Map([
                        ['div', {type: ABBR_TYPE_SHORTCUT, value: {name: 'div'}}],
                        ['p', {type: ABBR_TYPE_SHORTCUT, value: {name: 'p'}}],
                        ['a', {type: ABBR_TYPE_SHORTCUT, value: {name: 'a', attributes: [{name: 'href', value: ''}]}}],
                        ['img', {type: ABBR_TYPE_SHORTCUT, value: {name: 'img', is_empty: true, attributes: [{name: 'src', value: ''}, {name: 'alt', value: ''}]}}],
                        ['bq', {type: ABBR_TYPE_LINK, value: 'blockquote'}], 
                    ]),
                    snippets: new Map([
                        ['html:5', {content: '<!DOCTYPE html>\n<html lang="${lang}">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${title}</title>\n</head>\n<body>\n\t${child}\n</body>\n</html>'}],
                        ['lorem', {content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. ${cursor}'}]
                    ])
                },
            };
        },
        setGlobalSettings: function(newSettings) {
            // Allows external systems to update the global settings.
            window.markupGlobalSettings = newSettings; 
        },

        getMarkupResource: function(type) {
            return this.getGlobalSettings()[type.toLowerCase()];
        },
        retrieveAbbreviation: function(type, name) {
            return this.getMarkupResource(type)?.abbreviations?.get(name.toLowerCase());
        },
        retrieveSnippetDefinition: function(type, name) {
            return this.getMarkupResource(type)?.snippets?.get(name.toLowerCase());
        },

        isValidAbbrCharacter,
        retrieveLineSeparator,
        divideTextIntoLines,
        stripWhitespace,
        establishFormatConfig,
        configureFormatPreset,
        convertStringListToSet,
        indentTextContent,
        isSnippetAvailable,
        isFinalSegmentHtmlTag,
        fetchElementClassification,
        substitutePlaceholders,

        // Exposes the core element and snippet constructors.
        MarkupNode,
        CodeSnippet,

        // Initialization function to set up default formatting profiles.
        init: function() {
            configureFormatPreset('plain', {
                elementCase: 'lower',
                attributeCase: 'lower',
                attributeQuotes: 'double',
                tagNewlineStrategy: 'never',
                placeCursorPlaceholder: true,
                applyIndentation: false,
                selfClosingStyle: 'html5'
            });
            configureFormatPreset('xhtml', {
                elementCase: 'lower',
                attributeCase: 'lower',
                attributeQuotes: 'double',
                tagNewlineStrategy: 'decide',
                placeCursorPlaceholder: true,
                applyIndentation: true,
                selfClosingStyle: 'xhtml'
            });
            configureFormatPreset('html', {
                elementCase: 'lower',
                attributeCase: 'lower',
                attributeQuotes: 'double',
                tagNewlineStrategy: 'decide',
                placeCursorPlaceholder: true,
                applyIndentation: true,
                selfClosingStyle: 'html5'
            });
            // Ensures a fallback default profile is always present.
            if (!formatConfigurations.has('default')) {
                 formatConfigurations.set('default', defaultFormatConfig);
            }
        }
    };
})();

// Automatically initializes the markup generation system upon script loading.
markupGen.init();

// Optional: Export the module for different JavaScript environments.
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = markupGen;
// } else if (typeof window !== 'undefined') {
//     window.markupGen = markupGen;
// }