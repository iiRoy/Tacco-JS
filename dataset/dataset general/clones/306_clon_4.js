(function() {
    // Internal constants for initial state
    const _initialStartAnchor = "";
    const _initialEndAnchor = "";
    const _defaultFlags = new Set(["g", "m"]);

    // Utility function to escape special regex characters for literal matching
    // Replicates the original's specific sanitization logic.
    function _processInput(value) {
        if (value && typeof value.source === "string") {
            // If it's a RegExp object, use its source
            return value.source;
        }
        if (typeof value === "number") {
            // Numbers are converted to strings directly
            return String(value);
        }
        if (typeof value !== "string") {
            // Handle null, undefined, etc., as empty string
            return "";
        }
        // For strings, escape only non-word characters.
        // This is a specific behavior of the original library, not a full regex escape.
        return value.replace(/[^\w]/g, (char) => "\\" + char);
    }

    // The main class for assembling regular expression patterns
    class PatternAssembler {
        #startBoundary = _initialStartAnchor; // Stores '^' or empty
        #patternSegments = [];                // Array to build the main regex pattern string
        #endBoundary = _initialEndAnchor;     // Stores '$' or empty
        #activeFlags = new Set(_defaultFlags); // Manages regex flags (g, m, i)
        #currentExpression;                   // The compiled RegExp object

        constructor() {
            this.#refreshExpression(); // Initialize the regex
        }

        // Internal method to re-compile the RegExp object whenever the pattern or flags change
        #refreshExpression() {
            const fullPattern = this.#startBoundary + this.#patternSegments.join("") + this.#endBoundary;
            const flags = Array.from(this.#activeFlags).sort().join("");
            try {
                this.#currentExpression = new RegExp(fullPattern, flags);
            } catch (e) {
                // In case of an invalid regex construction, create a regex that never matches
                this.#currentExpression = new RegExp("(?!)");
            }
        }

        // Internal method to append a new segment to the pattern and trigger a re-compilation
        _addSegment(segment) {
            this.#patternSegments.push(segment || ""); // Ensure segment is a string, even if null/undefined
            this.#refreshExpression();
            return this;
        }

        // --- Pattern Construction Methods ---

        beginLine(enableState) {
            const shouldEnable = (enableState !== false);
            this.#startBoundary = shouldEnable ? "^" : "";
            this._addSegment(""); // Trigger refresh to update boundary
            return this;
        }

        finishLine(enableState) {
            const shouldEnable = (enableState !== false);
            this.#endBoundary = shouldEnable ? "$" : "";
            this._addSegment(""); // Trigger refresh to update boundary
            return this;
        }

        sequence(inputValue) {
            const processed = _processInput(inputValue);
            this._addSegment(`(?:${processed})`);
            return this;
        }

        locate(inputValue) {
            return this.sequence(inputValue); // Alias for sequence
        }

        optional(inputValue) {
            const processed = _processInput(inputValue);
            this._addSegment(`(?:${processed})?`);
            return this;
        }

        anyCharacterSeries() {
            this._addSegment("(?:.*)");
            return this;
        }

        anyExceptSeries(inputValue) {
            const processed = _processInput(inputValue);
            this._addSegment(`(?:[^${processed}]*)`);
            return this;
        }

        oneOrMoreCharacters() {
            this._addSegment("(?:.+)");
            return this;
        }

        oneOrMoreExcept(inputValue) {
            const processed = _processInput(inputValue);
            this._addSegment(`(?:[^${processed}]+)`);
            return this;
        }

        newlineSymbol() {
            this._addSegment("(?:\\r\\n|\\r|\\n)"); // Matches Unix and Windows line endings
            return this;
        }

        breakSymbol() {
            return this.newlineSymbol(); // Alias for newlineSymbol
        }

        tabSymbol() {
            this._addSegment("\\t");
            return this;
        }

        alphanumericSequence() {
            this._addSegment("\\w+");
            return this;
        }

        anyFromSet(inputValue) {
            const processed = _processInput(inputValue);
            this._addSegment(`[${processed}]`);
            return this;
        }

        characterRange(...args) {
            let rangePattern = "[";
            for (let i = 1; i < args.length; i += 2) {
                const fromChar = _processInput(args[i - 1]);
                const toChar = _processInput(args[i]);
                rangePattern += `${fromChar}-${toChar}`;
            }
            rangePattern += "]";
            this._addSegment(rangePattern);
            return this;
        }

        quantifyPrevious(...args) {
            if (this.#patternSegments.length === 0) {
                return this; // No segment to quantify
            }

            const numbers = args.filter(arg => typeof arg === 'number' || (typeof arg === 'string' && /^\d+$/.test(arg)));
            if (numbers.length === 0) {
                return this; // No valid numbers provided for quantification
            }

            const lastSegment = this.#patternSegments.pop(); // Get and remove the last segment
            // Replicate the original's behavior of joining all numbers with a comma
            const quantifier = `{${numbers.join(",")}}`;

            this.#patternSegments.push(lastSegment + quantifier); // Add back with quantifier
            this.#refreshExpression();
            return this;
        }

        zeroOrMore(input, count) {
            const segment = _processInput(input);
            if (count === undefined) {
                this._addSegment(`(?:${segment})*`);
            } else {
                // Original adds "(?:value)" then "{count}" separately, resulting in `(?:value){count}`
                this._addSegment(`(?:${segment}){${count}}`);
            }
            return this;
        }

        // --- Modifier (Flag) Management Methods ---

        addFlag(flagChar) {
            if (!this.#activeFlags.has(flagChar)) {
                this.#activeFlags.add(flagChar);
                this.#refreshExpression();
            }
            this._addSegment(""); // Mimic original's add("") to ensure refresh
            return this;
        }

        removeFlag(flagChar) {
            if (this.#activeFlags.has(flagChar)) {
                this.#activeFlags.delete(flagChar);
                this.#refreshExpression();
            }
            this._addSegment(""); // Mimic original's add("") to ensure refresh
            return this;
        }

        ignoreCase(enableState) {
            const shouldEnable = (enableState !== false);
            if (shouldEnable) this.addFlag("i");
            else this.removeFlag("i");
            this._addSegment(""); // Mimic original's add("")
            return this;
        }

        matchOnce(enableState) {
            const shouldEnable = (enableState !== false);
            if (shouldEnable) this.removeFlag("g"); // Original's logic is reversed for 'g'
            else this.addFlag("g");
            this._addSegment(""); // Mimic original's add("")
            return this;
        }

        singleLineMode(enableState) {
            const shouldEnable = (enableState !== false);
            if (shouldEnable) this.removeFlag("m"); // Original's logic is reversed for 'm'
            else this.addFlag("m");
            this._addSegment(""); // Mimic original's add("")
            return this;
        }

        // --- Grouping and Alternation Methods ---

        alternateWith(inputValue) {
            const processed = _processInput(inputValue);
            // This method's implementation matches the observed behavior of the original
            // VerbalExpressions 'or' method, which wraps the entire current pattern
            // and the new pattern in an alternation group (?:current|new).
            const currentPatternString = this.#patternSegments.join("");
            this.#patternSegments = [`(?:${currentPatternString}|(?:${processed}))`];
            this.#refreshExpression();
            return this;
        }

        startGroup() {
            this._addSegment("(");
            return this;
        }

        endGroup() {
            this._addSegment(")");
            return this;
        }

        // --- Output and Utility Methods ---

        transformString(sourceString, replacementValue) {
            sourceString = String(sourceString); // Ensure source is a string
            return sourceString.replace(this.#currentExpression, replacementValue);
        }

        toResult() {
            return this.#currentExpression; // Returns the compiled RegExp object
        }

        // Delegate RegExp methods to the internal compiled expression
        test(input) {
            return this.#currentExpression.test(input);
        }

        exec(input) {
            return this.#currentExpression.exec(input);
        }

        toString() {
            return this.#currentExpression.toString();
        }
    }

    // Factory function to create new instances of PatternAssembler
    function createPatternAssembler() {
        return new PatternAssembler();
    }

    // Global exposure for different environments (Node.js, AMD, Browser)
    const root = this; // Capture the global context
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = createPatternAssembler;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return createPatternAssembler; });
    } else {
        root.PatternBuilder = createPatternAssembler; // Exposed globally as PatternBuilder
    }

}).call(this);