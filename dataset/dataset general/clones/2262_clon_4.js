class PatternPart {
    constructor(componentType, componentValue, quantityDescriptor = null, isCapturing = false, captureIdentifier = null) {
        this.componentType = componentType; // 'plain_text', 'any_char_token', 'char_set', 'group_ref', 'anchor_start', 'anchor_end', 'pattern_group', 'lookahead_pos', 'lookahead_neg', 'alternation_set'
        this.componentValue = componentValue; // string, array of PatternPart, or number (for group_ref)
        this.quantityDescriptor = quantityDescriptor; // { min, max, lazy } or null
        this.isCapturing = isCapturing; // boolean, for pattern_group, lookahead_pos/neg
        this.captureIdentifier = captureIdentifier; // number, assigned during rendering for capturing groups
    }

    renderToFragment(groupOffset = 0) {
        let innerContent = '';
        let prefix = '';
        let suffix = '';

        // Render content first
        if (Array.isArray(this.componentValue)) {
            innerContent = this.componentValue.map(part => part.renderToFragment(groupOffset)).join('');
        } else if (this.componentValue !== null) {
            innerContent = this.componentValue;
        }

        switch (this.componentType) {
            case 'plain_text':
                innerContent = this._escapeSpecialChars(innerContent);
                break;
            case 'char_set': // componentValue is already like "a-z" or "^0-9"
                innerContent = `[${innerContent}]`;
                break;
            case 'any_char_token':
                innerContent = '.';
                break;
            case 'group_ref': // componentValue is the original group number
                innerContent = `\\${this.componentValue + groupOffset}`;
                break;
            case 'anchor_start':
                innerContent = '^';
                break;
            case 'anchor_end':
                innerContent = '$';
                break;
            case 'pattern_group': // componentValue is an array of PatternPart
                if (this.isCapturing) {
                    prefix = '(';
                    suffix = ')';
                } else {
                    prefix = '(?:';
                    suffix = ')';
                }
                break;
            case 'lookahead_pos': // componentValue is an array of PatternPart
                prefix = '(?=';
                suffix = ')';
                break;
            case 'lookahead_neg': // componentValue is an array of PatternPart
                prefix = '(?!';
                suffix = ')';
                break;
            case 'alternation_set': // componentValue is an array of PatternPart arrays
                innerContent = this.componentValue.map(alt =>
                    (Array.isArray(alt) ? alt.map(part => part.renderToFragment(groupOffset)).join('') : part.renderToFragment(groupOffset))
                ).join('|');
                prefix = '(?:'; // Alternations are typically non-capturing groups
                suffix = ')';
                break;
        }

        let quantityString = '';
        if (this.quantityDescriptor) {
            const { min, max, lazy } = this.quantityDescriptor;
            if (min === 0 && max === 1) quantityString = '?';
            else if (min === 1 && max === null) quantityString = '+';
            else if (min === 0 && max === null) quantityString = '*';
            else if (min === max) quantityString = `{${min}}`;
            else if (min !== null && max !== null) quantityString = `{${min},${max}}`;
            else if (min !== null) quantityString = `{${min},}`;
            else if (max !== null) quantityString = `{0,${max}}`;
            if (lazy && quantityString !== '') quantityString += '?';
        }

        return `${prefix}${innerContent}${suffix}${quantityString}`;
    }

    _escapeSpecialChars(str) {
        return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
    }
}

class PatternConstructor {
    constructor(componentList = [], currentSegmentConfig = null, modifierSet = new Set(), allocatedCaptureCount = 0, activeChoices = null) {
        this._componentList = componentList; // Array of PatternPart objects
        this._currentSegmentConfig = currentSegmentConfig; // The element currently being configured
        this._modifierSet = modifierSet; // Set of 'i', 'm', 'g'
        this._allocatedCaptureCount = allocatedCaptureCount; // Total capturing groups allocated so far
        this._activeChoices = activeChoices; // Array of PatternPart[] for 'oneOf'/'orElse'
    }

    _duplicate(props = {}) {
        return new PatternConstructor(
            props.componentList !== undefined ? [...props.componentList] : [...this._componentList],
            props.currentSegmentConfig !== undefined ? props.currentSegmentConfig : (this._currentSegmentConfig ? { ...this._currentSegmentConfig } : null),
            props.modifierSet !== undefined ? new Set(props.modifierSet) : new Set(this._modifierSet),
            props.allocatedCaptureCount !== undefined ? props.allocatedCaptureCount : this._allocatedCaptureCount,
            props.activeChoices !== undefined ? (props.activeChoices ? props.activeChoices.map(a => [...a]) : null) : (this._activeChoices ? this._activeChoices.map(a => [...a]) : null)
        );
    }

    _appendComponent(component) {
        return this._duplicate({ componentList: [...this._componentList, component] });
    }

    _finalizeCurrentSegment() {
        if (!this._currentSegmentConfig) return this;

        let newComponentList = [...this._componentList];
        let newAllocatedCaptureCount = this._allocatedCaptureCount;
        let newCurrentSegmentConfig = null;

        const { componentType, componentValue, quantityDescriptor, isCapturing } = this._currentSegmentConfig;
        let segmentPart = new PatternPart(componentType, componentValue, quantityDescriptor, isCapturing);

        if (isCapturing && segmentPart.componentType !== 'pattern_group' && segmentPart.componentType !== 'lookahead_pos' && segmentPart.componentType !== 'lookahead_neg' && segmentPart.componentType !== 'alternation_set') {
            // If `captureAsGroup` was called on a non-group element, wrap it
            newAllocatedCaptureCount++;
            segmentPart.captureIdentifier = newAllocatedCaptureCount;
            newComponentList.push(new PatternPart('pattern_group', [segmentPart], null, true, newAllocatedCaptureCount));
        } else if (isCapturing && (segmentPart.componentType === 'pattern_group' || segmentPart.componentType === 'lookahead_pos' || segmentPart.componentType === 'lookahead_neg' || segmentPart.componentType === 'alternation_set')) {
            // If `captureAsGroup` was called on a group/look/alternation, just make it capturing
            newAllocatedCaptureCount++;
            segmentPart.captureIdentifier = newAllocatedCaptureCount;
            segmentPart.isCapturing = true;
            newComponentList.push(segmentPart);
        } else {
            newComponentList.push(segmentPart);
        }

        return this._duplicate({
            componentList: newComponentList,
            allocatedCaptureCount: newAllocatedCaptureCount,
            currentSegmentConfig: newCurrentSegmentConfig
        });
    }

    _applyQuantityToPending(min, max, lazy = false) {
        let updatedSegmentConfig = this._currentSegmentConfig ? { ...this._currentSegmentConfig } : { componentType: null, componentValue: null, isCapturing: false };
        updatedSegmentConfig.quantityDescriptor = { min, max, lazy };
        return this._duplicate({ currentSegmentConfig: updatedSegmentConfig });
    }

    _reindexSubPattern(subPatternBuilder) {
        // This method processes another PatternConstructor's elements to adjust group references.
        const reindexedSequence = subPatternBuilder._componentList.map(el => {
            // Deep copy the element to avoid modifying the original builder's state
            const newEl = new PatternPart(el.componentType, el.componentValue, el.quantityDescriptor, el.isCapturing, el.captureIdentifier);

            if (newEl.componentType === 'group_ref') {
                newEl.componentValue += this._allocatedCaptureCount; // Adjust backreference number
            }
            if (newEl.captureIdentifier !== null) {
                newEl.captureIdentifier += this._allocatedCaptureCount; // Adjust group ID
            }
            // Recursively reindex content if it's an array of PatternPart
            if (Array.isArray(newEl.componentValue)) {
                newEl.componentValue = newEl.componentValue.map(subEl => {
                    const newSubEl = new PatternPart(subEl.componentType, subEl.componentValue, subEl.quantityDescriptor, subEl.isCapturing, subEl.captureIdentifier);
                    if (newSubEl.componentType === 'group_ref') newSubEl.componentValue += this._allocatedCaptureCount;
                    if (newSubEl.captureIdentifier !== null) newSubEl.captureIdentifier += this._allocatedCaptureCount;
                    return newSubEl;
                });
            }
            return newEl;
        });
        return reindexedSequence;
    }

    _finalizeAlternation() {
        if (!this._activeChoices || this._activeChoices.length === 0) return this;

        let builder = this._finalizeCurrentSegment(); // Ensure any pending segment is added before alternation
        const alternationComponent = new PatternPart('alternation_set', builder._activeChoices, null, false, null);
        return builder._duplicate({
            componentList: [...builder._componentList, alternationComponent],
            activeChoices: null,
            currentSegmentConfig: null
        });
    }

    // --- Public API ---

    // Modifiers
    caseInsensitive() { return this._duplicate({ modifierSet: new Set([...this._modifierSet, 'i']) }); }
    multilineMode() { return this._duplicate({ modifierSet: new Set([...this._modifierSet, 'm']) }); }
    globalMatchMode() { return this._duplicate({ modifierSet: new Set([...this._modifierSet, 'g']) }); }

    // Anchors
    beginOfInput() { return this._finalizeCurrentSegment()._appendComponent(new PatternPart('anchor_start', null)); }
    endOfInput() { return this._finalizeCurrentSegment()._appendComponent(new PatternPart('anchor_end', null)); }
    beginOfLine() { return this.multilineMode().beginOfInput(); }
    endOfLine() { return this.multilineMode().endOfInput(); }

    // Quantifiers
    exactlyN(num) { return this._applyQuantityToPending(num, num); }
    minimumN(num) { return this._applyQuantityToPending(num, null); }
    maximumN(num) { return this._applyQuantityToPending(0, num); }
    lazyQuantifier() {
        let updatedSegmentConfig = this._currentSegmentConfig ? { ...this._currentSegmentConfig } : { componentType: null, componentValue: null, isCapturing: false };
        if (updatedSegmentConfig.quantityDescriptor) {
            updatedSegmentConfig.quantityDescriptor.lazy = true;
        } else {
            updatedSegmentConfig.quantityDescriptor = { min: null, max: null, lazy: true };
        }
        return this._duplicate({ currentSegmentConfig: updatedSegmentConfig });
    }

    // Character rules
    literalText(str) {
        let builder = this._finalizeCurrentSegment();
        const { quantityDescriptor, isCapturing } = builder._currentSegmentConfig || { quantityDescriptor: null, isCapturing: false };
        return builder._duplicate({ currentSegmentConfig: { componentType: 'plain_text', componentValue: str, quantityDescriptor, isCapturing } });
    }
    anyCharacter() {
        let builder = this._finalizeCurrentSegment();
        const { quantityDescriptor, isCapturing } = builder._currentSegmentConfig || { quantityDescriptor: null, isCapturing: false };
        return builder._duplicate({ currentSegmentConfig: { componentType: 'any_char_token', componentValue: null, quantityDescriptor, isCapturing } });
    }
    groupReference(num) {
        let builder = this._finalizeCurrentSegment();
        const { quantityDescriptor, isCapturing } = builder._currentSegmentConfig || { quantityDescriptor: null, isCapturing: false };
        return builder._duplicate({ currentSegmentConfig: { componentType: 'group_ref', componentValue: num, quantityDescriptor, isCapturing } });
    }
    fromCharacterRange(arr) {
        let builder = this._finalizeCurrentSegment();
        const { quantityDescriptor, isCapturing } = builder._currentSegmentConfig || { quantityDescriptor: null, isCapturing: false };
        return builder._duplicate({ currentSegmentConfig: { componentType: 'char_set', componentValue: arr.map(PatternPart.prototype._escapeSpecialChars).join(''), quantityDescriptor, isCapturing } });
    }
    notFromCharacterRange(arr) {
        let builder = this._finalizeCurrentSegment();
        const { quantityDescriptor, isCapturing } = builder._currentSegmentConfig || { quantityDescriptor: null, isCapturing: false };
        return builder._duplicate({ currentSegmentConfig: { componentType: 'char_set', componentValue: '^' + arr.map(PatternPart.prototype._escapeSpecialChars).join(''), quantityDescriptor, isCapturing } });
    }

    // Embedding other constructors
    includePattern(otherConstructor) {
        let builder = this._finalizeCurrentSegment();
        const { quantityDescriptor, isCapturing } = builder._currentSegmentConfig || { quantityDescriptor: null, isCapturing: false };

        const reindexedSequence = builder._reindexSubPattern(otherConstructor);
        let newAllocatedCaptureCount = builder._allocatedCaptureCount + otherConstructor._allocatedCaptureCount;

        let finalComponent;
        if (quantityDescriptor || isCapturing) {
            let groupID = null;
            if (isCapturing) {
                newAllocatedCaptureCount++; // Increment for the new outer capturing group
                groupID = newAllocatedCaptureCount;
            }
            finalComponent = new PatternPart('pattern_group', reindexedSequence, quantityDescriptor, isCapturing, groupID);
        } else {
            // If no pending quant/capture, just append the reindexed sequence directly
            builder = builder._duplicate({ componentList: [...builder._componentList, ...reindexedSequence], allocatedCaptureCount: newAllocatedCaptureCount });
            return builder;
        }

        return builder._duplicate({
            componentList: [...builder._componentList, finalComponent],
            allocatedCaptureCount: newAllocatedCaptureCount,
            currentSegmentConfig: null
        });
    }

    // Lookaheads
    positiveLookahead(otherConstructor) {
        let builder = this._finalizeCurrentSegment();
        const { quantityDescriptor, isCapturing } = builder._currentSegmentConfig || { quantityDescriptor: null, isCapturing: false };

        const reindexedSequence = builder._reindexSubPattern(otherConstructor);
        let newAllocatedCaptureCount = builder._allocatedCaptureCount + otherConstructor._allocatedCaptureCount;

        return builder._duplicate({
            componentList: [...builder._componentList, new PatternPart('lookahead_pos', reindexedSequence, quantityDescriptor, true)], // true means positive
            allocatedCaptureCount: newAllocatedCaptureCount,
            currentSegmentConfig: null
        });
    }

    negativeLookahead(otherConstructor) {
        let builder = this._finalizeCurrentSegment();
        const { quantityDescriptor, isCapturing } = builder._currentSegmentConfig || { quantityDescriptor: null, isCapturing: false };

        const reindexedSequence = builder._reindexSubPattern(otherConstructor);
        let newAllocatedCaptureCount = builder._allocatedCaptureCount + otherConstructor._allocatedCaptureCount;

        return builder._duplicate({
            componentList: [...builder._componentList, new PatternPart('lookahead_neg', reindexedSequence, quantityDescriptor, false)], // false means negative
            allocatedCaptureCount: newAllocatedCaptureCount,
            currentSegmentConfig: null
        });
    }

    // Grouping
    captureAsGroup() {
        let updatedSegmentConfig = this._currentSegmentConfig ? { ...this._currentSegmentConfig } : { componentType: null, componentValue: null, quantityDescriptor: null };
        updatedSegmentConfig.isCapturing = true;
        return this._duplicate({ currentSegmentConfig: updatedSegmentConfig });
    }

    // Alternation
    oneOf(patternSource) {
        let builder = this._finalizeCurrentSegment();
        builder = builder._finalizeAlternation(); // Finalize any previous alternation

        let subPatternConstructor;
        if (typeof patternSource === 'string') {
            subPatternConstructor = new PatternConstructor().literalText(patternSource)._finalizeCurrentSegment();
        } else {
            subPatternConstructor = patternSource;
        }

        const reindexedSequence = builder._reindexSubPattern(subPatternConstructor);
        let newAllocatedCaptureCount = builder._allocatedCaptureCount + subPatternConstructor._allocatedCaptureCount;

        return builder._duplicate({
            activeChoices: [reindexedSequence],
            allocatedCaptureCount: newAllocatedCaptureCount,
            currentSegmentConfig: null
        });
    }

    orElse(patternSource) {
        let builder = this._finalizeCurrentSegment();

        if (!builder._activeChoices) {
            // 'orElse' without a preceding 'oneOf'
            let lastComponent = builder._componentList.pop(); // Remove last component
            if (!lastComponent) {
                throw new Error("Cannot use 'orElse' without a preceding pattern segment.");
            }

            let firstAlternativeComponents = [lastComponent];
            // Wrap in a non-capturing group if not already a group-like element
            if (lastComponent.componentType !== 'pattern_group' && lastComponent.componentType !== 'alternation_set' && lastComponent.componentType !== 'lookahead_pos' && lastComponent.componentType !== 'lookahead_neg') {
                firstAlternativeComponents = [new PatternPart('pattern_group', [lastComponent], null, false, null)];
            }

            let subPatternConstructor;
            if (typeof patternSource === 'string') {
                subPatternConstructor = new PatternConstructor().literalText(patternSource)._finalizeCurrentSegment();
            } else {
                subPatternConstructor = patternSource;
            }

            const reindexedSequence = builder._reindexSubPattern(subPatternConstructor);
            let newAllocatedCaptureCount = builder._allocatedCaptureCount + subPatternConstructor._allocatedCaptureCount;

            const alternationComponent = new PatternPart('alternation_set', [firstAlternativeComponents, reindexedSequence], null, false, null);
            return builder._duplicate({
                componentList: [...builder._componentList, alternationComponent],
                allocatedCaptureCount: newAllocatedCaptureCount,
                currentSegmentConfig: null
            });

        } else {
            // Already in an alternation, just add the new alternative
            let subPatternConstructor;
            if (typeof patternSource === 'string') {
                subPatternConstructor = new PatternConstructor().literalText(patternSource)._finalizeCurrentSegment();
            } else {
                subPatternConstructor = patternSource;
            }

            const reindexedSequence = builder._reindexSubPattern(subPatternConstructor);
            let newActiveChoices = [...builder._activeChoices, reindexedSequence];
            let newAllocatedCaptureCount = builder._allocatedCaptureCount + subPatternConstructor._allocatedCaptureCount;

            return builder._duplicate({
                activeChoices: newActiveChoices,
                allocatedCaptureCount: newAllocatedCaptureCount,
                currentSegmentConfig: null
            });
        }
    }

    // Composite methods (using `includePattern`)
    someOfRange(charset) { return this.minimumN(1).fromCharacterRange(charset); }
    optionalRange(charset) { return this.minimumN(0).fromCharacterRange(charset); }
    optionalText(str) { return this.maximumN(1).literalText(str); }
    anySequence() { return this.minimumN(0).anyCharacter(); }
    someSequence() { return this.minimumN(1).anyCharacter(); }
    singleAny() { return this.exactlyN(1).anyCharacter(); }

    // Specific character classes (direct insertion or `includePattern`)
    lineBreakChar() { return this._finalizeCurrentSegment()._appendComponent(new PatternPart('plain_text', '(?:\\r\\n|\\r|\\n)')); }
    whitespaceChar() { return this._finalizeCurrentSegment()._appendComponent(new PatternPart('plain_text', '(?:\\s)')); }
    nonWhitespaceChar() { return this._finalizeCurrentSegment()._appendComponent(new PatternPart('plain_text', '(?:\\S)')); }
    tabChar() { return this._finalizeCurrentSegment()._appendComponent(new PatternPart('plain_text', '(?:\\t)')); }
    digitChar() { return this._finalizeCurrentSegment()._appendComponent(new PatternPart('plain_text', '(?:\\d)')); }
    nonDigitChar() { return this._finalizeCurrentSegment()._appendComponent(new PatternPart('plain_text', '(?:\\D)')); }

    letterChar() { return this.exactlyN(1).fromCharacterRange(['A-Z', 'a-z']); }
    nonLetterChar() { return this.exactlyN(1).notFromCharacterRange(['A-Z', 'a-z']); }
    lowercaseLetter() { return this.exactlyN(1).fromCharacterRange(['a-z']); }
    uppercaseLetter() { return this.exactlyN(1).fromCharacterRange(['A-Z']); }

    lineBreaks() { return this.includePattern(new PatternConstructor().lineBreakChar()); }
    tabs() { return this.includePattern(new PatternConstructor().tabChar()); }
    digits() { return this.includePattern(new PatternConstructor().digitChar()); }
    nonDigits() { return this.includePattern(new PatternConstructor().nonDigitChar()); }
    letters() { return this.includePattern(new PatternConstructor().letterChar()); }
    nonLetters() { return this.includePattern(new PatternConstructor().nonLetterChar()); }
    lowercaseLetters() { return this.includePattern(new PatternConstructor().lowercaseLetter()); }
    uppercaseLetters() { return this.includePattern(new PatternConstructor().uppercaseLetter()); }

    thenMatch(str) { return this.exactlyN(1).literalText(str); }
    findMatch(str) { return this.thenMatch(str); }

    anythingBut(str) {
        let builder = this.negativeLookahead(new PatternConstructor().exactlyN(1).literalText(str));
        return builder.minimumN(0).anyCharacter();
    }

    excludePattern(patternSource) {
        let subPatternConstructor;
        if (typeof patternSource === 'string') {
            subPatternConstructor = new PatternConstructor().exactlyN(1).literalText(patternSource);
        } else {
            subPatternConstructor = patternSource;
        }
        return this.negativeLookahead(subPatternConstructor);
    }

    excludeOrElse(patternSource) {
        let builder = this.excludePattern(patternSource);
        return builder.minimumN(0).anyCharacter();
    }

    // Final output
    toPatternString() {
        let builder = this._finalizeCurrentSegment();
        builder = builder._finalizeAlternation();
        return builder._componentList.map(part => part.renderToFragment(0)).join('');
    }

    toRegExpObject() {
        const pattern = this.toPatternString();
        const flags = [...this._modifierSet].join('');
        return new RegExp(pattern, flags);
    }
}

// Global export functions
const createPattern = () => new PatternConstructor();

if (typeof exports === 'undefined') {
    var exports = {};
}

exports.caseInsensitive = () => createPattern().caseInsensitive();
exports.multilineMode = () => createPattern().multilineMode();
exports.globalMatchMode = () => createPattern().globalMatchMode();
exports.beginOfInput = () => createPattern().beginOfInput();
exports.beginOfLine = () => createPattern().beginOfLine();
exports.endOfInput = () => createPattern().endOfInput();
exports.endOfLine = () => createPattern().endOfLine();
exports.oneOf = (p) => createPattern().oneOf(p);
exports.excludePattern = (p) => createPattern().excludePattern(p);
exports.exactlyN = (n) => createPattern().exactlyN(n);
exports.minimumN = (n) => createPattern().minimumN(n);
exports.maximumN = (n) => createPattern().maximumN(n);
exports.positiveLookahead = (p) => createPattern().positiveLookahead(p);
exports.negativeLookahead = (p) => createPattern().negativeLookahead(p);
exports.thenMatch = (s) => createPattern().thenMatch(s);
exports.findMatch = (s) => createPattern().findMatch(s);
exports.someOfRange = (s) => createPattern().someOfRange(s);
exports.optionalRange = (s) => createPattern().optionalRange(s);
exports.optionalText = (s) => createPattern().optionalText(s);