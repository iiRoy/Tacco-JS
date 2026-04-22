var PatternConstructor = function() {
    this._modifiers = "";
    this._components = [];
    this._groupCounters = 0;

    this._resetState();
};

var proto = PatternConstructor.prototype;

proto._resetState = function() {
    this._minimum = -1;
    this._maximum = -1;
    this._specificChar = "";
    this._anyChar = false;
    this._groupRef = -1;
    this._charRange = "";
    this._negatedCharRange = "";
    this._patternSegment = "";
    this._firstOption = "";
    this._nonGreedy = false;
    this._shouldCapture = false;
};

proto._processCurrentSegment = function() {
    if ( this._specificChar !== "" || this._anyChar || this._groupRef > 0 || this._charRange !== "" || this._negatedCharRange !== "" || this._patternSegment !== "" ) {
        var capturingPart = this._shouldCapture ? "" : "?:";
        var repetitionPart = this._getRepetitionExpression();
        var characterPart = this._getCharacterExpression();
        var greedyModifier = this._nonGreedy ? "?" : "";
        this._components.push( "(" + capturingPart + "(?:" + characterPart + ")" + repetitionPart + greedyModifier + ")" );
        this._resetState();
    }
};

proto._getRepetitionExpression = function() {
    if ( this._minimum !== -1 ) {
        if ( this._maximum !== -1 ) {
            return "{" + this._minimum + "," + this._maximum + "}";
        }
        return "{" + this._minimum + ",}";
    }
    return "{0," + this._maximum + "}";
};

proto._getCharacterExpression = function() {
    if ( this._specificChar !== "" ) {
        return this._specificChar;
    }
    if ( this._anyChar ) {
        return ".";
    }
    if ( this._groupRef > 0 ) {
        return "\\" + this._groupRef;
    }
    if ( this._charRange !== "" ) {
        return "[" + this._charRange + "]";
    }
    if ( this._negatedCharRange !== "" ) {
        return "[^" + this._negatedCharRange + "]";
    }
    if ( this._patternSegment !== "" ) {
        return this._patternSegment;
    }
};

proto.getPatternString = function() {
    this._processCurrentSegment();
    return this._components.join("");
};

proto._integrateGroupReferences = function( otherBuilder ) {
    var patternString = this._adjustGroupReferences( otherBuilder.getPatternString(), this._groupCounters );
    this._groupCounters += otherBuilder._groupCounters;
    return patternString;
};

proto._adjustGroupReferences = function( patternString, offsetValue ) {
    if ( offsetValue > 0 ) {
        patternString = patternString.replace( /[^\\]\\\d+/g, function( refMatch ) {
            var adjustedGroupNumber = parseInt( refMatch.substring(2) ) + offsetValue;
            return refMatch.substring(0, 2) + adjustedGroupNumber;
        });
    }
    return patternString;
};

proto.getRegExpObject = function() {
    this._processCurrentSegment();

    return new RegExp( this._components.join(""), this._modifiers );
};

proto._addModifier = function( modifierChar ) {
    if ( this._modifiers.indexOf( modifierChar ) === -1 ) {
        this._modifiers += modifierChar;
    }
    return this;
};

proto.caseInsensitive = function() {
    return this._addModifier("i");
};

proto.multiLineMode = function() {
    return this._addModifier("m");
};

proto.globalSearch = function() {
    return this._addModifier("g");
};

proto.startBoundary = function() {
    this._components.push( "(?:^)" );
    return this;
};

proto.lineStartBoundary = function() {
    this.multiLineMode();
    return this.startBoundary();
};

proto.endBoundary = function() {
    this._processCurrentSegment();
    this._components.push( "(?:$)" );
    return this;
};

proto.lineEndBoundary = function() {
    this.multiLineMode();
    return this.endBoundary();
};

proto.oneOf = function( otherBuilder ) {
    if ( typeof otherBuilder === "string" ) {
        return this._processOneOf( new PatternConstructor().exactlyN(1).ofString(otherBuilder) );
    } else {
        return this._processOneOf(otherBuilder);
    }
};

proto._processOneOf = function( otherBuilder ) {
    this._processCurrentSegment();
    this._firstOption = this._integrateGroupReferences(otherBuilder);
    return this;
};

proto.orOption = function( otherBuilder ) {
    if ( typeof otherBuilder === "string" ) {
        return this._processOrOption( new PatternConstructor().exactlyN(1).ofString(otherBuilder) );
    } else {
        return this._processOrOption(otherBuilder);
    }
};

proto._processOrOption = function( otherBuilder ) {
    var firstAlt = this._firstOption;
    var secondAlt = this._integrateGroupReferences(otherBuilder);
    if ( firstAlt === "" ) {
        var lastComponent = this._components[ this._components.length - 1 ];
        lastComponent = lastComponent.substring(0, lastComponent.length - 1);
        this._components[ this._components.length - 1 ] = lastComponent;
        this._components.push( "|(?:" + secondAlt + "))" );
    } else {
        this._components.push( "(?:(?:" + firstAlt + ")|(?:" + secondAlt + "))" );
    }
    this._resetState();
    return this;
};

proto.notOneOf = function( otherBuilder ) {
    if ( typeof otherBuilder === "string" ) {
        return this.negativeLookAhead( new PatternConstructor().exactlyN(1).ofString(otherBuilder) );
    }
    return this.negativeLookAhead(otherBuilder);
};

proto.norOption = function( otherBuilder ) {
    if ( this._minimum === 0 && this._anyChar ) {
        this._minimum = -1;
        this._anyChar = false;
    }
    this.notOneOf(otherBuilder);
    return this.atLeast(0).ofAnyChar();
};

proto.exactlyN = function( count ) {
    this._processCurrentSegment();
    this._minimum = count;
    this._maximum = count;
    return this;
};

proto.atLeast = function( count ) {
    this._processCurrentSegment();
    this._minimum = count;
    return this;
};

proto.atMost = function( count ) {
    this._processCurrentSegment();
    this._maximum = count;
    return this;
};

proto.ofString = function( inputString ) {
    this._specificChar = this._escapeSpecialChars(inputString);
    return this;
};

proto.ofAnyChar = function() {
    this._anyChar = true;
    return this;
};

proto.ofGroupReference = function( count ) {
    this._groupRef = count;
    return this;
};

proto.fromCharacters = function( charSet ) {
    this._charRange = this._escapeSpecialChars( charSet.join("") );
    return this;
};

proto.notFromCharacters = function( charSet ) {
    this._negatedCharRange = this._escapeSpecialChars( charSet.join("") );
    return this;
};

proto.likePattern = function( otherBuilder ) {
    this._patternSegment = this._integrateGroupReferences(otherBuilder);
    return this;
};

proto.makeNonGreedy = function() {
    this._nonGreedy = true;
    return this;
};

proto.lookAhead = function( otherBuilder ) {
    this._processCurrentSegment();
    this._components.push( "(?=" + this._integrateGroupReferences(otherBuilder) + ")" );
    return this;
};

proto.negativeLookAhead = function( otherBuilder ) {
    this._processCurrentSegment();
    this._components.push( "(?!" + this._integrateGroupReferences(otherBuilder) + ")" );
    return this;
};

proto.asCapturingGroup = function() {
    this._shouldCapture = true;
    this._groupCounters++;
    return this;
};

proto.followedBy = function( inputString ) {
    return this.exactlyN(1).ofString(inputString);
};

proto.locate = function( inputString ) {
    return this.followedBy(inputString);
};

proto.someOf = function( charSet ) {
    return this.atLeast(1).fromCharacters(charSet);
};

proto.zeroOrMoreOf = function( charSet ) {
    return this.atLeast(0).fromCharacters(charSet);
};

proto.optionalItem = function( inputString ) {
    return this.atMost(1).ofString(inputString);
};

proto.anyCharOneOrMore = function() {
    return this.atLeast(1).ofAnyChar();
};

proto.anyCharZeroOrMore = function() {
    return this.atLeast(0).ofAnyChar();
};

proto.anyCharBut = function( inputString ) {
    if ( inputString.length === 1 ) {
        return this.atLeast(0).notFromCharacters([inputString]);
    }
    this.negativeLookAhead( new PatternConstructor().exactlyN(1).ofString(inputString) );
    return this.atLeast(0).ofAnyChar();
};

proto.anySingleChar = function() {
    return this.exactlyN(1).ofAnyChar();
};

proto.newLineChar = function() {
    this._processCurrentSegment();
    this._components.push( "(?:\\r\\n|\\r|\\n)" );
    return this;
};

proto.newLineChars = function() {
    return this.likePattern( new PatternConstructor().newLineChar() );
};

proto.whiteSpaceChar = function() {
    if ( this._minimum === -1 && this._maximum === -1 ) {
        this._processCurrentSegment();
        this._components.push( "(?:\\s)" );
        return this;
    }
    this._patternSegment = "\\s";
    return this;
};

proto.nonWhiteSpaceChar = function() {
    if ( this._minimum === -1 && this._maximum === -1 ) {
        this._processCurrentSegment();
        this._components.push( "(?:\\S)" );
        return this;
    }
    this._patternSegment = "\\S";
    return this;
};

proto.tabChar = function() {
    this._processCurrentSegment();
    this._components.push( "(?:\\t)" );
    return this;
};

proto.tabChars = function() {
    return this.likePattern( new PatternConstructor().tabChar() );
};

proto.digitChar = function() {
    this._processCurrentSegment();
    this._components.push( "(?:\\d)" );
    return this;
};

proto.nonDigitChar = function() {
    this._processCurrentSegment();
    this._components.push( "(?:\\D)" );
    return this;
};

proto.digitChars = function() {
    return this.likePattern( new PatternConstructor().digitChar() );
};

proto.nonDigitChars = function() {
    return this.likePattern( new PatternConstructor().nonDigitChar() );
};

proto.letterChar = function() {
    this.exactlyN(1);
    this._charRange = "A-Za-z";
    return this;
};

proto.nonLetterChar = function() {
    this.exactlyN(1);
    this._negatedCharRange = "A-Za-z";
    return this;
};

proto.letterChars = function() {
    this._charRange = "A-Za-z";
    return this;
};

proto.nonLetterChars = function() {
    this._negatedCharRange = "A-Za-z";
    return this;
};

proto.lowerLetterChar = function() {
    this.exactlyN(1);
    this._charRange = "a-z";
    return this;
};

proto.lowerLetterChars = function() {
    this._charRange = "a-z";
    return this;
};

proto.upperLetterChar = function() {
    this.exactlyN(1);
    this._charRange = "A-Z";
    return this;
};

proto.upperLetterChars = function() {
    this._charRange = "A-Z";
    return this;
};

proto.addPattern = function( otherBuilder ) {
    this.exactlyN(1);
    this._patternSegment = this._integrateGroupReferences(otherBuilder);
    return this;
};

proto.makeOptional = function( otherBuilder ) {
    this.atMost(1);
    this._patternSegment = this._integrateGroupReferences(otherBuilder);
    return this;
};

proto._escapeSpecialChars = function( inputString ) {
    return inputString.replace( /([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1" );
};

var publicInterface;
if ( typeof publicInterface === 'undefined' ) {
    publicInterface = {};
}

publicInterface.caseInsensitive = function() {
    return new PatternConstructor().caseInsensitive();
};

publicInterface.multiLineMode = function() {
    return new PatternConstructor().multiLineMode();
};

publicInterface.globalSearch = function() {
    return new PatternConstructor().globalSearch();
};

publicInterface.startBoundary = function() {
    return new PatternConstructor().startBoundary();
};

publicInterface.lineStartBoundary = function() {
    return new PatternConstructor().lineStartBoundary();
};

publicInterface.endBoundary = function() {
    return new PatternConstructor().endBoundary();
};

publicInterface.lineEndBoundary = function() {
    return new PatternConstructor().lineEndBoundary();
};

publicInterface.oneOf = function( otherBuilder ) {
    return new PatternConstructor().oneOf(otherBuilder);
};

publicInterface.notOneOf = function( otherBuilder ) {
    return new PatternConstructor().notOneOf(otherBuilder);
};

publicInterface.exactlyN = function( count ) {
    return new PatternConstructor().exactlyN(count);
};

publicInterface.atLeast = function( count ) {
    return new PatternConstructor().atLeast(count);
};

publicInterface.atMost = function( count ) {
    return new PatternConstructor().atMost(count);
};

publicInterface.lookAhead = function( otherBuilder ) {
    return new PatternConstructor().lookAhead(otherBuilder);
};

publicInterface.negativeLookAhead = function( otherBuilder ) {
    return new PatternConstructor().negativeLookAhead(otherBuilder);
};

publicInterface.followedBy = function( inputString ) {
    return new PatternConstructor().followedBy(inputString);
};

publicInterface.locate = function( inputString ) {
    return new PatternConstructor().locate(inputString);
};

publicInterface.someOf = function( charSet ) {
    return new PatternConstructor().someOf(charSet);
};

publicInterface.zeroOrMoreOf = function( charSet ) {
    return new PatternConstructor().zeroOrMoreOf(charSet);
};

publicInterface.optionalItem = function( inputString ) {
    return new PatternConstructor().optionalItem(inputString);
};