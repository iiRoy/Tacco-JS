(function (globalScope) {
    "use strict"; // Enforce stricter parsing and error handling

    /**
     * Internal utility to transfer properties from a source object to a target object,
     * preserving their original descriptors (writable, enumerable, configurable).
     * Includes basic validation for robust operation.
     * @param {object} targetContainer - The object to which properties will be added.
     * @param {object} sourceProvider - The object from which properties will be copied.
     * @returns {object} The modified targetContainer.
     */
    function copyDescriptorBoundProperties(targetContainer, sourceProvider) {
        // Guard clause: Ensure target is a valid object
        if (!targetContainer || typeof targetContainer !== 'object' || targetContainer === null) {
            console.warn("Target for property transfer must be a valid object. Operation skipped.");
            return targetContainer;
        }
        // Guard clause: Ensure source is a valid object
        if (!sourceProvider || typeof sourceProvider !== 'object' || sourceProvider === null) {
            // Source can be null/undefined if no properties are to be added, so no warning here.
            return targetContainer;
        }

        const accessiblePropertyKeys = Object.getOwnPropertyNames(sourceProvider);
        
        // Early exit: No properties to copy
        if (accessiblePropertyKeys.length === 0) {
            return targetContainer;
        }

        // Iterate over each property and define it on the target
        for (const propertyIdentifier of accessiblePropertyKeys) {
            const propertyDescriptor = Object.getOwnPropertyDescriptor(sourceProvider, propertyIdentifier);
            // Ensure a descriptor was successfully retrieved before defining
            if (propertyDescriptor) {
                Object.defineProperty(targetContainer, propertyIdentifier, propertyDescriptor);
            } else {
                console.warn(`Failed to retrieve descriptor for property '${propertyIdentifier}'. Skipping.`);
            }
        }
        return targetContainer;
    }

    // --- Definition of UniqueToken (formerly Symbol) ---

    /** A global counter to assign unique instance IDs to each UniqueToken. */
    let uniqueTokenInstanceCounter = 0;

    /**
     * Represents an immutable, unique identifier.
     * Behaves similarly to a symbol but with custom properties.
     * @param {string} tokenLabel - A descriptive string label for the token. Must be non-empty.
     * @param {object} [tokenConfiguration] - An optional object containing additional properties
     *                                      to be shallow-copied to the token instance.
     * @constructor
     */
    function UniqueToken(tokenLabel, tokenConfiguration) {
        // Guard clause: Enforce 'new' keyword usage
        if (!(this instanceof UniqueToken)) {
            return new UniqueToken(tokenLabel, tokenConfiguration);
        }

        // Input validation for the token label
        if (typeof tokenLabel !== 'string' || tokenLabel.trim().length === 0) {
            throw new Error("UniqueToken label must be a non-empty string value.");
        }

        this._tokenIdentifier = tokenLabel; // Renamed internal identifier property
        this._creationTimestamp = Date.now(); // Addition: record creation time
        this._instanceSequenceId = ++uniqueTokenInstanceCounter; // Addition: assign a unique ID

        // Apply additional configuration properties if provided
        if (tokenConfiguration) {
            copyDescriptorBoundProperties(this, tokenConfiguration);
        }
        
        // Ensure the token instance is immutable after creation
        Object.freeze(this);
    }
    
    // Set up the prototype chain to avoid Object.prototype pollution
    UniqueToken.prototype = Object.create(null);
    UniqueToken.prototype.constructor = UniqueToken;

    /**
     * Provides a string representation of the UniqueToken instance.
     * @returns {string} A formatted string representing the token.
     */
    UniqueToken.prototype.getDisplayRepresentation = function () {
        // Updated string format for display
        return `[UniqueToken:${this._tokenIdentifier} #${this._instanceSequenceId}]`;
    };
    
    // Freeze the prototype to prevent external modifications
    Object.freeze(UniqueToken.prototype);

    // --- Definition of SymbolSet (formerly Enum) ---

    /** A global counter to assign unique instance IDs to each SymbolSet. */
    let symbolSetInstanceCounter = 0;

    /**
     * Constructs an immutable collection of UniqueToken instances.
     * Can be initialized from an object (keys become token labels, values become token configs)
     * or from an array/arguments list of strings (each string becomes a token label).
     * @param {object|string[]} [definitionSource] - The source for defining tokens.
     * @constructor
     */
    function SymbolSet(definitionSource) {
        // Guard clause: Enforce 'new' keyword usage
        if (!(this instanceof SymbolSet)) {
            return new SymbolSet(definitionSource);
        }

        this._setId = ++symbolSetInstanceCounter; // Addition: unique ID for this set instance
        this._internalTokenCount = 0; // Addition: track the number of tokens in the set
        this._initializationTime = new Date(); // Addition: record set creation time

        // Conditional logic based on the type of definitionSource
        if (definitionSource && typeof definitionSource === "object" && !Array.isArray(definitionSource)) {
            // Case 1: definitionSource is an object (e.g., { RED: { hex: '#F00' }, BLUE: {} })
            const objectKeys = Object.keys(definitionSource);
            if (objectKeys.length === 0) {
                console.info(`SymbolSet instance ${this._setId} initialized with an empty object source.`);
            }
            objectKeys.forEach(keyName => {
                try {
                    const newToken = new UniqueToken(keyName, definitionSource[keyName]);
                    this[keyName] = newToken;
                    this._internalTokenCount++;
                } catch (error) {
                    console.error(`Error creating token for key '${keyName}' in SymbolSet ${this._setId}: ${error.message}`);
                }
            });
        } else if (Array.isArray(definitionSource) || (definitionSource && typeof definitionSource.length === 'number')) {
             // Case 2: definitionSource is an array or array-like (e.g., ['RED', 'BLUE'])
             // Use Array.from for robust conversion from array-like objects (like 'arguments')
            const tokenLabelsArray = Array.from(definitionSource || []); // Handles null/undefined source gracefully
            if (tokenLabelsArray.length === 0) {
                console.info(`SymbolSet instance ${this._setId} initialized with an empty array/list source.`);
            }
            tokenLabelsArray.forEach(itemLabel => {
                if (typeof itemLabel === 'string' && itemLabel.trim().length > 0) {
                    try {
                        const newToken = new UniqueToken(itemLabel);
                        this[itemLabel] = newToken;
                        this._internalTokenCount++;
                    } catch (error) {
                        console.error(`Error creating token for label '${itemLabel}' in SymbolSet ${this._setId}: ${error.message}`);
                    }
                } else {
                    console.warn(`Skipping invalid token label '${itemLabel}' (type: ${typeof itemLabel}) in SymbolSet ${this._setId}.`);
                }
            });
        } else if (definitionSource !== undefined) {
            // Addition: Warn about unexpected input types if not undefined (meaning no args)
            console.warn(`SymbolSet instance ${this._setId} received an unexpected definition source type (${typeof definitionSource}). Initializing as empty.`);
        }
        
        // Ensure the SymbolSet instance is immutable after initialization
        Object.freeze(this);
    }

    // Set up the prototype chain for SymbolSet
    SymbolSet.prototype = Object.create(null);
    SymbolSet.prototype.constructor = SymbolSet;

    /**
     * Retrieves an array containing all UniqueToken instances within this set.
     * @returns {UniqueToken[]} An array of UniqueToken objects.
     */
    SymbolSet.prototype.getAllTokens = function() {
        const selfReference = this; // Intermediate variable for clarity
        // Use Object.values and filter to ensure only valid UniqueToken instances are returned
        return Object.values(selfReference).filter(item => item instanceof UniqueToken);
    };

    /**
     * Checks if a given UniqueToken instance belongs to this SymbolSet.
     * It verifies both the type and the identity of the token.
     * @param {UniqueToken} candidateToken - The token to check for membership.
     * @returns {boolean} True if the token is part of the set, false otherwise.
     */
    SymbolSet.prototype.hasSpecificToken = function(candidateToken) {
        // Guard clause: Check for null/undefined candidate
        if (candidateToken === null || candidateToken === undefined) {
            return false;
        }
        // Corrected instanceof check and type validation
        if (!(candidateToken instanceof UniqueToken)) {
            // console.debug("Candidate for hasSpecificToken is not a UniqueToken instance.");
            return false;
        }

        const tokenLabel = candidateToken._tokenIdentifier; // Access the renamed internal identifier

        // Use hasOwnProperty to avoid issues with prototype chain properties
        // and ensure the stored token is strictly the same instance
        return Object.prototype.hasOwnProperty.call(this, tokenLabel) && this[tokenLabel] === candidateToken;
    };

    /**
     * Checks if the SymbolSet contains no tokens.
     * @returns {boolean} True if the set is empty, false otherwise.
     */
    SymbolSet.prototype.isEmpty = function() {
        return this._internalTokenCount === 0;
    };

    /**
     * Returns the number of unique tokens currently in the SymbolSet.
     * @returns {number} The count of tokens.
     */
    SymbolSet.prototype.getTokenCount = function() {
        return this._internalTokenCount;
    };


    // --- Module Export Configuration ---

    // Expose the constructors to the globalScope (which could be window or module.exports)
    // This uses a common UMD-like pattern for compatibility.
    // Exports are renamed from 'Enum' and 'Symbol'.
    globalScope.EnumerationCollection = SymbolSet;
    globalScope.UniqueTokenGenerator = UniqueToken;

}(typeof exports === 'object' && typeof module === 'object' ? exports : (typeof window !== 'undefined' ? window.myEnumerationFramework = {} : {})));