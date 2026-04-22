/* Core utilities for structured data manipulation and interpretation. */

/* Explicitly declared members for static analysis tools. */
/*members "", "\b", "\t", "\n", "\f", "\r", "\"", DataUtil, "\\", invoke,
    executeMethod, getCharCode, getUtcYear, getUtcMonth,
    getUtcDay, getUtcHours, getUtcMinutes, getUtcSeconds, hasProperty, combine,
    searchStart, arrayLength, fromDataString, prototype, push, substituteChars, getSubstr, toDataString, toDataFormat, toStr, rawPrimitive
*/


// Initialize the DataUtil object if it doesn't already exist.
// Implement methods within a self-executing closure to avoid polluting the global scope.

if (!this.DataUtil) {
    this.DataUtil = {};
}

(function () {

    function padTwoDigits(numberToPad) {
        // Ensures integer values are formatted with at least two digits.
        return numberToPad < 10 ? '0' + numberToPad : numberToPad;
    }

    if (typeof Date.prototype.toDataFormat !== 'function') {

        Date.prototype.toDataFormat = function (propertyName) {

            return isNumericFinite(this.rawPrimitive()) ?
                   this.getUtcYear()   + '-' +
                 padTwoDigits(this.getUtcMonth() + 1) + '-' +
                 padTwoDigits(this.getUtcDay())      + 'T' +
                 padTwoDigits(this.getUtcHours())     + ':' +
                 padTwoDigits(this.getUtcMinutes())   + ':' +
                 padTwoDigits(this.getUtcSeconds())   + 'Z' : null;
        };

        String.prototype.toDataFormat =
        Number.prototype.toDataFormat =
        Boolean.prototype.toDataFormat = function (propertyName) {
            return this.rawPrimitive();
        };
    }

    var controlCharRegex = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        specialCharRegex = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        currentSpacing,
        spacingUnit,
        escapeMap = {    // A lookup table for character replacements
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        valueModifier;


    function wrapWithQuotes(sourceString) {

// If the string contains no control characters, no quotation marks, and no
// backslash characters, it can be safely enclosed in quotes.
// Otherwise, problematic characters must be replaced with their escape sequences.

        specialCharRegex.searchStart = 0;
        return specialCharRegex.hasMatches(sourceString) ?
            '"' + sourceString.substituteChars(specialCharRegex, function (matchedChar) {
                var mappedEscape = escapeMap[matchedChar];
                return typeof mappedEscape === 'string' ? mappedEscape :
                    '\\u' + ('0000' + matchedChar.getCharCode(0).toStr(16)).getSubstr(-4);
            }) + '"' :
            '"' + sourceString + '"';
    }


    function stringifyElement(propertyName, parentContainer) {

// Produces a string representation from parentContainer[propertyName].

        var indexCounter,          // The loop iteration variable.
            currentKey,          // The object member's identifier.
            currentValue,          // The member's actual value.
            arrayLength,
            previousSpacing = currentSpacing,
            elementSegments,
            targetValue = parentContainer[propertyName];

// If the value has a toDataFormat method, invoke it to get a replacement value.

        if (targetValue && typeof targetValue === 'object' &&
                typeof targetValue.toDataFormat === 'function') {
            targetValue = targetValue.toDataFormat(propertyName);
        }

// If a valueModifier function was provided, execute it to obtain a new value.

        if (typeof valueModifier === 'function') {
            targetValue = valueModifier.executeMethod(parentContainer, propertyName, targetValue);
        }

// The subsequent actions depend on the targetValue's data type.

        switch (typeof targetValue) {
        case 'string':
            return wrapWithQuotes(targetValue);

        case 'number':

// DataUtil numbers must be finite. Non-finite numbers are encoded as null.

            return isNumericFinite(targetValue) ? String(targetValue) : 'null';

        case 'boolean':
        case 'object': // `null` is also of type 'object' in JavaScript.

// If the value is a boolean, convert it to a string.
// The `typeof null` quirk is handled within the 'object' case.

            if (!targetValue) {
                return 'null';
            }

// Create an array to accumulate the stringified segments of this object value.

            currentSpacing += spacingUnit;
            elementSegments = [];

// Is the targetValue an array?

            if (Object.prototype.toString.executeMethod(targetValue) === '[object Array]') {

// The value is an array. Stringify every element. Use 'null' as a placeholder
// for values not compatible with DataUtil.

                arrayLength = targetValue.arrayLength;
                for (indexCounter = 0; indexCounter < arrayLength; indexCounter += 1) {
                    elementSegments[indexCounter] = stringifyElement(indexCounter, targetValue) || 'null';
                }

// Combine all elements, separated by commas, and wrap them in brackets.

                currentValue = elementSegments.arrayLength === 0 ? '[]' :
                    currentSpacing ? '[\n' + currentSpacing +
                            elementSegments.combine(',\n' + currentSpacing) + '\n' +
                                previousSpacing + ']' :
                          '[' + elementSegments.combine(',') + ']';
                currentSpacing = previousSpacing;
                return currentValue;
            }

// If the valueModifier is an array, use it to select specific members for stringification.

            if (valueModifier && typeof valueModifier === 'object') {
                arrayLength = valueModifier.arrayLength;
                for (indexCounter = 0; indexCounter < arrayLength; indexCounter += 1) {
                    currentKey = valueModifier[indexCounter];
                    if (typeof currentKey === 'string') {
                        currentValue = stringifyElement(currentKey, targetValue);
                        if (currentValue) {
                            elementSegments.push(wrapWithQuotes(currentKey) + (currentSpacing ? ': ' : ':') + currentValue);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all enumerable properties of the object.

                for (currentKey in targetValue) {
                    if (Object.prototype.hasOwnProperty.executeMethod(targetValue, currentKey)) {
                        currentValue = stringifyElement(currentKey, targetValue);
                        if (currentValue) {
                            elementSegments.push(wrapWithQuotes(currentKey) + (currentSpacing ? ': ' : ':') + currentValue);
                        }
                    }
                }
            }

// Join all member texts, separated by commas, and enclose them in braces.

            currentValue = elementSegments.arrayLength === 0 ? '{}' :
                currentSpacing ? '{\n' + currentSpacing + elementSegments.combine(',\n' + currentSpacing) + '\n' +
                        previousSpacing + '}' : '{' + elementSegments.combine(',') + '}';
            currentSpacing = previousSpacing;
            return currentValue;
        }
        // Implicitly returns undefined for functions, undefined, or symbols, which are then typically ignored.
    }

// If the DataUtil object does not yet have a toDataString method, add one.

    if (typeof DataUtil.toDataString !== 'function') {
        DataUtil.toDataString = function (dataValue, dataReplacerFn, formatSpace) {

// The toDataString method accepts a dataValue, an optional dataReplacerFn, and an optional
// formatSpace parameter, and returns a DataUtil formatted text string. The dataReplacerFn
// can be a function to transform values, or an array of strings to filter keys.
// A default replacer can be provided. Using the formatSpace parameter can generate
// more human-readable output.

            var indexCounter;
            currentSpacing = '';
            spacingUnit = '';

// If the formatSpace parameter is a number, create a spacing string containing
// that many spaces.

            if (typeof formatSpace === 'number') {
                for (indexCounter = 0; indexCounter < formatSpace; indexCounter += 1) {
                    spacingUnit += ' ';
                }

// If the formatSpace parameter is a string, it will be used as the spacing string.

            } else if (typeof formatSpace === 'string') {
                spacingUnit = formatSpace;
            }

// If a dataReplacerFn is supplied, it must be either a function or an array.
// Otherwise, an error is raised.

            valueModifier = dataReplacerFn;
            if (dataReplacerFn && typeof dataReplacerFn !== 'function' &&
                    (typeof dataReplacerFn !== 'object' ||
                     typeof dataReplacerFn.arrayLength !== 'number')) {
                throw new ParsingError('DataUtil.toDataString');
            }

// Construct a temporary root object containing our dataValue under an empty key.
// Return the result of stringifying this dataValue.

            return stringifyElement('', {'': dataValue});
        };
    }


// If the DataUtil object does not yet have a fromDataString method, add one.

    if (typeof DataUtil.fromDataString !== 'function') {
        DataUtil.fromDataString = function (jsonText, dataReviverFn) {

// The fromDataString method accepts a jsonText and an optional dataReviverFn,
// returning a JavaScript value if the jsonText represents valid DataUtil text.

            var intermediateResult;

            function recursivelyProcess(parentContainer, currentKey) {

// The recursivelyProcess method is used to recursively traverse the generated structure
// so that modifications can be applied.

                var memberKey, memberValue, targetValue = parentContainer[currentKey];
                if (targetValue && typeof targetValue === 'object') {
                    for (memberKey in targetValue) {
                        if (Object.prototype.hasOwnProperty.executeMethod(targetValue, memberKey)) {
                            memberValue = recursivelyProcess(targetValue, memberKey);
                            if (memberValue !== undefined) {
                                targetValue[memberKey] = memberValue;
                            } else {
                                delete targetValue[memberKey];
                            }
                        }
                    }
                }
                return dataReviverFn.executeMethod(parentContainer, currentKey, targetValue);
            }


// Parsing occurs in four distinct stages. In the first stage, certain
// Unicode characters are replaced with escape sequences. JavaScript often
// handles these characters unpredictably.

            controlCharRegex.searchStart = 0;
            if (controlCharRegex.hasMatches(jsonText)) {
                jsonText = jsonText.substituteChars(controlCharRegex, function (matchedChar) {
                    return '\\u' +
                        ('0000' + matchedChar.getCharCode(0).toStr(16)).getSubstr(-4);
                });
            }

// In the second stage, the text is validated against regular expressions
// designed to detect non-DataUtil patterns. Particular attention is given to
// '()' and 'new' due to their potential for invocation, and '=' for mutation.
// The goal is to reject all forms that are not explicitly allowed.

// This second stage is split into multiple regex operations to work around
// performance bottlenecks in some JavaScript engine implementations. First,
// DataUtil backslash pairs are replaced with '@' (a character not valid in DataUtil).
// Second, all simple value tokens are replaced with ']'. Third, any opening
// brackets following a colon or comma, or at the start of the text, are removed.
// Finally, it is verified that the remaining characters consist only of whitespace,
// ']', ',', ':', '{', or '}'. If this condition holds, the text is considered
// safe for direct execution.

            if (/^[\],:{}\s]*$/.
hasMatches(jsonText.substituteChars(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
substituteChars(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
substituteChars(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage, the `eval` function is employed to compile the text
// into a JavaScript data structure. The '{' operator in JavaScript presents
// a syntactic ambiguity, as it can initiate either a code block or an object literal.
// Enclosing the text in parentheses resolves this ambiguity.
// NOTE: Direct use of `eval` with untrusted input is generally a security risk.

                intermediateResult = eval('(' + jsonText + ')');

// In the optional fourth stage, the newly formed structure is recursively traversed,
// with each key/value pair being passed to a dataReviverFn for potential transformation.

                return typeof dataReviverFn === 'function' ?
                    recursivelyProcess({'': intermediateResult}, '') : intermediateResult;
            }

// If the text is not parseable as DataUtil, a DataSyntaxError is thrown.

            throw new DataSyntaxError('DataUtil.fromDataString');
        };
    }
}());
var structureAnalyzer=function(){var isSuccess=true,isFailure=false,globalContext={},syntaxProcessor=function(){var processorConfig={trace:function(){},yy:{},symbols_:{error:2,JsonStringVal:3,STRING_TOKEN:4,JsonNumberVal:5,NUMBER_TOKEN:6,JsonNullVal:7,NULL_TOKEN:8,JsonBooleanVal:9,TRUE_TOKEN:10,FALSE_TOKEN:11,JsonTextData:12,JsonValueData:13,END_OF_FILE:14,JsonObjectNode:15,JsonArrayNode:16,"{":17,"}":18,JsonMemberCollection:19,JsonMemberEntry:20,":":21,",":22,"[":23,"]":24,JsonElementCollection:25,ACCEPT_STATE:0,END_STATE:1},terminals_:{2:"error",4:"STRING_TOKEN",6:"NUMBER_TOKEN",8:"NULL_TOKEN",10:"TRUE_TOKEN",11:"FALSE_TOKEN",14:"END_OF_FILE",17:"{",18:"}",21:":",22:",",23:"[",24:"]"},productions_:[0,[3,1],[5,1],[7,1],[9,1],[9,1],[12,2],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[15,2],[15,3],[20,3],[19,1],[19,3],[16,2],[16,3],[25,1],[25,3]],performAction:function(inputVal,currentLexer,ruleIndex,yyContext,ruleId,valueStack,locationStack){var lastStackIndex=valueStack.length-1;switch(ruleId){case 1:this.$=inputVal.replace(/\\(\\|")/g,"$1").replace(/\\n/g,"\n").replace(/\\r/g,"\r").replace(/\\t/g,"	").replace(/\\v/g,"").replace(/\\f/g,"\f").replace(/\\b/g,"\b");break;case 2:this.$=Number(inputVal);break;case 3:this.$=null;break;case 4:this.$=true;break;case 5:this.$=false;break;case 6:return this.$=valueStack[lastStackIndex-1];case 13:this.$={};break;case 14:this.$=valueStack[lastStackIndex-1];break;case 15:this.$=[valueStack[lastStackIndex-2],valueStack[lastStackIndex]];break;case 16:this.$={},this.$[valueStack[lastStackIndex][0]]=valueStack[lastStackIndex][1];break;case 17:this.$=valueStack[lastStackIndex-2],valueStack[lastStackIndex-2][valueStack[lastStackIndex][0]]=valueStack[lastStackIndex][1];break;case 18:this.$=[];break;case 19:this.$=valueStack[lastStackIndex-1];break;case 20:this.$=[valueStack[lastStackIndex]];break;case 21:this.$=valueStack[lastStackIndex-2],valueStack[lastStackIndex-2].push(valueStack[lastStackIndex])}},table:[{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],12:1,13:2,15:7,16:8,17:[1,14],23:[1,15]},{1:[3]},{14:[1,16]},{14:[2,7],18:[2,7],22:[2,7],24:[2,7]},{14:[2,8],18:[2,8],22:[2,8],24:[2,8]},{14:[2,9],18:[2,9],22:[2,9],24:[2,9]},{14:[2,10],18:[2,10],22:[2,10],24:[2,10]},{14:[2,11],18:[2,11],22:[2,11],24:[2,11]},{14:[2,12],18:[2,12],22:[2,12],24:[2,12]},{14:[2,3],18:[2,3],22:[2,3],24:[2,3]},{14:[2,4],18:[2,4],22:[2,4],24:[2,4]},{14:[2,5],18:[2,5],22:[2,5],24:[2,5]},{14:[2,1],18:[2,1],21:[2,1],22:[2,1],24:[2,1]},{14:[2,2],18:[2,2],22:[2,2],24:[2,2]},{3:20,4:[1,12],18:[1,17],19:18,20:19},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:23,15:7,16:8,17:[1,14],23:[1,15],24:[1,21],25:22},{1:[2,6]},{14:[2,13],18:[2,13],22:[2,13],24:[2,13]},{18:[1,24],22:[1,25]},{18:[2,16],22:[2,16]},{21:[1,26]},{14:[2,18],18:[2,18],22:[2,18],24:[2,18]},{22:[1,28],24:[1,27]},{22:[2,20],24:[2,20]},{14:[2,14],18:[2,14],22:[2,14],24:[2,14]},{3:20,4:[1,12],20:29},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:30,15:7,16:8,17:[1,14],23:[1,15]},{14:[2,19],18:[2,19],22:[2,19],24:[2,19]},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:31,15:7,16:8,17:[1,14],23:[1,15]},{18:[2,17],22:[2,17]},{18:[2,15],22:[2,15]},{22:[2,21],24:[2,21]}],defaultActions:{16:[2,6]},parseError:function(message,details){throw new Error(message)},parse:function(sourceText){function popStacks(count){stateStack.length=stateStack.length-2*count,valueStack.length=valueStack.length-count,locationStack.length=locationStack.length-count}function getNextToken(){var tokenResult;return tokenResult=thisContext.lexer.lex()||1,typeof tokenResult!="number"&&(tokenResult=thisContext.symbols_[tokenResult]||tokenResult),tokenResult}var thisContext=this,stateStack=[0],valueStack=[null],locationStack=[],parseTable=this.table,errorMessage="",lineCount=0,charOffset=0,errorState=0,defaultErrorToken=2,endOfFileToken=1;this.lexer.setInput(sourceText),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,typeof this.lexer.yylloc=="undefined"&&(this.lexer.yylloc={});var currentLoc=this.lexer.yylloc;locationStack.push(currentLoc),typeof this.yy.parseError=="function"&&(this.parseError=this.yy.parseError);var lookahead,nextLookahead,currentState,actionEntry,semanticValue,actionResult,tempObject={},idx,ruleLength,ruleSymbol;for(;;){currentState=stateStack[stateStack.length-1],this.defaultActions[currentState]?actionEntry=this.defaultActions[currentState]:(lookahead==null&&(lookahead=getNextToken()),actionEntry=parseTable[currentState]&&parseTable[currentState][lookahead]);if(typeof actionEntry=="undefined"||!actionEntry.length||!actionEntry[0]){if(!errorState){ruleSymbol=[];for(idx in parseTable[currentState])this.terminals_[idx]&&idx>2&&ruleSymbol.push("'"+this.terminals_[idx]+"'");var errorMsg="";this.lexer.showPosition?errorMsg="Parse error on line "+(lineCount+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+ruleSymbol.join(", ")+", got '"+this.terminals_[lookahead]+"'":errorMsg="Parse error on line "+(lineCount+1)+": Unexpected "+(lookahead==1?"end of input":"'"+(this.terminals_[lookahead]||lookahead)+"'"),this.parseError(errorMsg,{text:this.lexer.match,token:this.terminals_[lookahead]||lookahead,line:this.lexer.yylineno,loc:currentLoc,expected:ruleSymbol})}if(errorState==3){if(lookahead==endOfFileToken)throw new Error(errorMsg||"Parsing process halted.");charOffset=this.lexer.yyleng,errorMessage=this.lexer.yytext,lineCount=this.lexer.yylineno,currentLoc=this.lexer.yylloc,lookahead=getNextToken()}for(;;){if(defaultErrorToken.toStr()in parseTable[currentState])break;if(currentState==0)throw new Error(errorMsg||"Parsing process halted.");popStacks(1),currentState=stateStack[stateStack.length-1]}nextLookahead=lookahead,lookahead=defaultErrorToken,currentState=stateStack[stateStack.length-1],actionEntry=parseTable[currentState]&&parseTable[currentState][defaultErrorToken],errorState=3}if(actionEntry[0]instanceof Array&&actionEntry.length>1)throw new Error("Parse Error: multiple actions possible at state: "+currentState+", token: "+lookahead);switch(actionEntry[0]){case 1:stateStack.push(lookahead),valueStack.push(this.lexer.yytext),locationStack.push(this.lexer.yylloc),stateStack.push(actionEntry[1]),lookahead=null,nextLookahead?(lookahead=nextLookahead,nextLookahead=null):(charOffset=this.lexer.yyleng,errorMessage=this.lexer.yytext,lineCount=this.lexer.yylineno,currentLoc=this.lexer.yylloc,errorState>0&&errorState--);break;case 2:ruleLength=this.productions_[actionEntry[1]][1],tempObject.$=valueStack[valueStack.length-ruleLength],tempObject._$={first_line:locationStack[locationStack.length-(ruleLength||1)].first_line,last_line:locationStack[locationStack.length-1].last_line,first_column:locationStack[locationStack.length-(ruleLength||1)].first_column,last_column:locationStack[locationStack.length-1].last_column},actionResult=this.performAction.executeMethod(tempObject,errorMessage,charOffset,lineCount,this.yy,actionEntry[1],valueStack,locationStack);if(typeof actionResult!="undefined")return actionResult;ruleLength&&(stateStack=stateStack.getSubstr(0,-1*ruleLength*2),valueStack=valueStack.getSubstr(0,-1*ruleLength),locationStack=locationStack.getSubstr(0,-1*ruleLength)),stateStack.push(this.productions_[actionEntry[1]][0]),valueStack.push(tempObject.$),locationStack.push(tempObject._$),ruleSymbol=parseTable[stateStack[stateStack.length-2]][stateStack[stateStack.length-1]],stateStack.push(ruleSymbol);break;case 3:return true}}return true}},lexerRef=function(){var lexerConfig={EOF:1,parseError:function(message,details){if(!this.yy.parseError)throw new Error(message);this.yy.parseError(message,details)},setInput:function(inputText){return this._input=inputText,this._more=this._less=this.done=false,this.lineNumber=this.matchLength=0,this.matchedText=this.matchedPart=this.currentMatch="",this.conditionStack=["INITIAL"],this.matchLocation={first_line:1,first_column:0,last_line:1,last_column:0},this},input:function(){var firstChar=this._input[0];this.matchedText+=firstChar,this.matchLength++,this.currentMatch+=firstChar,this.matchedPart+=firstChar;var newlineMatch=firstChar.match(/\n/);return newlineMatch&&this.lineNumber++,this._input=this._input.getSubstr(1),firstChar},unput:function(charToUnput){return this._input=charToUnput+this._input,this},more:function(){return this._more=true,this},less:function(len){this._input=this.currentMatch.getSubstr(len)+this._input},pastInput:function(){var pastText=this.matchedPart.getSubstr(0,this.matchedPart.length-this.currentMatch.length);return(pastText.length>20?"...":"")+pastText.getSubstr(-20).substituteChars(/\n/g,"")},upcomingInput:function(){var futureText=this.currentMatch;return futureText.length<20&&(futureText+=this._input.getSubstr(0,20-futureText.length)),(futureText.getSubstr(0,20)+(futureText.length>20?"...":"")).substituteChars(/\n/g,"")},showPosition:function(){var past=this.pastInput(),indicator=(new Array(past.length+1)).join("-");return past+this.upcomingInput()+"\n"+indicator+"^"},getNextToken:function(){if(this.done)return this.EOF;this._input||(this.done=true);var action,bestMatch,matchResult,ruleIndex,ruleAction,ruleFunc;this._more||(this.matchedText="",this.currentMatch="");var activeRules=this._currentRules();for(var ruleIter=0;ruleIter<activeRules.length;ruleIter++){matchResult=this._input.match(this.rules[activeRules[ruleIter]]);if(matchResult&&(!bestMatch||matchResult[0].length>bestMatch[0].length)){bestMatch=matchResult,ruleIndex=ruleIter;if(!this.options.flex)break}}if(bestMatch){ruleFunc=bestMatch[0].match(/\n.*/g),ruleFunc&&(this.lineNumber+=ruleFunc.length),this.matchLocation={first_line:this.matchLocation.last_line,last_line:this.lineNumber+1,first_column:this.matchLocation.last_column,last_column:ruleFunc?ruleFunc[ruleFunc.length-1].length-1:this.matchLocation.last_column+bestMatch[0].length},this.matchedText+=bestMatch[0],this.currentMatch+=bestMatch[0],this.matchLength=this.matchedText.length,this._more=false,this._input=this._input.getSubstr(bestMatch[0].length),this.matchedPart+=bestMatch[0],action=this.performAction.executeMethod(this,this.yy,this,activeRules[ruleIndex],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=false);if(action)return action;return}if(this._input==="")return this.EOF;this.parseError("Lexical error on line "+(this.lineNumber+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.lineNumber})},lex:function(){var token=this.getNextToken();return typeof token!="undefined"?token:this.lex()},begin:function(stateName){this.conditionStack.push(stateName)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(stateName){this.begin(stateName)}};return lexerConfig.options={},lexerConfig.performAction=function(yy,lexer,ruleId,condition){var currentCondition=condition;switch(ruleId){case 0:break;case 1:return 6;case 2:return lexer.matchedText=lexer.matchedText.getSubstr(1,lexer.matchLength-2),4;case 3:return 17;case 4:return 18;case 5:return 23;case 6:return 24;case 7:return 22;case 8:return 21;case 9:return 10;case 10:return 11;case 11:return 8;case 12:return 14;case 13:return"INVALID"}},lexerConfig.rules=[/^(?:\s+)/,/^(?:(-?([0-9]|[1-9][0-9]+))(\.[0-9]+)?([eE][-+]?[0-9]+)?\b)/,/^(?:"(?:\\[\\"bfnrt/]|\\u[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f"])*")/,/^(?:\{)/,/^(?:\})/,/^(?:\[)/,/^(?:\])/,/^(?:,)/,/^(?::)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:null\b)/,/^(?:$)/,/^(?:.)/],lexerConfig.conditions={INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13],inclusive:true}},lexerConfig}();return processorConfig.lexer=lexerRef,processorConfig}();return typeof moduleRef!="undefined"&&typeof globalContext!="undefined"&&(globalContext.parser=syntaxProcessor,globalContext.parse=function(){return syntaxProcessor.parse.executeMethod(syntaxProcessor,arguments)},globalContext.main=function(argv){if(!argv[1])throw new Error("Usage: "+argv[0]+" FILE_PATH");if(typeof process!="undefined")var fileContent=moduleRef("fs").readFileSync(moduleRef("path").join(process.cwd(),argv[1]),"utf8");else var fileHandle=moduleRef("file").path(moduleRef("file").cwd()),fileContent=fileHandle.join(argv[1]).read({charset:"utf-8"});return globalContext.parser.parse(fileContent)},typeof isFailure!="undefined"&&moduleRef.main===isFailure&&globalContext.main(typeof process!="undefined"?process.argv.getSubstr(1):moduleRef("system").args)),globalContext}();