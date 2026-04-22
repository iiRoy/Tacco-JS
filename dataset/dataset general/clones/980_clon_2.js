// This code is derived from an existing open-source project,
// originally developed by the Ace editor team.
// Refer to the original project's license for terms of use.
CodeMirror.defineMode ( "asciidoc" , function ( configObj , parserOptions ) {

  // This internal function defines the core lexical rules.
  var SyntaxPatternSet = function () {
      // Regular expression for common alphanumeric and international characters.
      var alphanumSymbolPattern = "[a-zA-Z\u00a1-\uffff]+\\b";
  
      // Collection of state-dependent parsing rules.
      this.syntaxStates = {
          "initial": [
              { token: "empty" , regex: /$/ } ,
              { token: "literal" , regex: /^\.{4,}\s*$/ , next: "codeSnippetBlock" } ,
              { token: "literal" , regex: /^-{4,}\s*$/ , next: "verbatimBlock" } ,
              { token: "string" , regex: /^\+{4,}\s*$/ , next: "rawContentBlock" } ,
              { token: "keyword" , regex: /^={4,}\s*$/ } ,
              { token: "text" , regex: /^\s*$/ } ,
              // Transition to a state that disallows certain block types without consuming input.
              { token: "empty" , regex: "" , next: "restrictEnclosedContent" }
          ] ,
  
          "restrictEnclosedContent": [
              { include: "blockBoundary" } ,
              { token: "comment" , regex: '^//.+$' } ,
              { token: "keyword" , regex: "^(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION):" } ,
  
              { include: "sequenceEntry" } ,
              { token: "literal" , regex: /^\s+.+$/ , next: "paddedBlock" } ,
              { token: "empty" , regex: "" , next: "generalContent" }
          ] ,
  
          "blockBoundary": [
              { token: "doc.comment" , regex: /^\/{4,}\s*$/ , next: "notationBlock" } ,
              { token: "tableBlock" , regex: /^\s*[|!]=+\s*$/ , next: "gridBlock" } ,
              // Marks for opening blocks or horizontal rules.
              { token: "keyword" , regex: /^(?:--|''')\s*$/ , next: "initial" } ,
              { token: "option" , regex: /^\[.*\]\s*$/ , next: "initial" } ,
              { token: "pageBreak" , regex: /^>{3,}$/ , next: "initial" } ,
              { token: "literal" , regex: /^\.{4,}\s*$/ , next: "codeSnippetBlock" } ,
              { token: "titleUnderline" , regex: /^(?:={2,}|-{2,}|~{2,}|\^{2,}|\+{2,})\s*$/ , next: "initial" } ,
              { token: "singleLineTitle" , regex: /^={1,5}\s+\S.*$/ , next: "initial" } ,
  
              { token: "otherBlock" , regex: /^(?:\*{2,}|_{2,})\s*$/ , next: "initial" } ,
              // Optional title for a block.
              { token: "optionalTitle" , regex: /^\.[^.\s].+$/ , next: "initial" }
          ] ,
  
          "sequenceEntry": [
              { token: "keyword" , regex: /^\s*(?:\d+\.|[a-zA-Z]\.|[ixvmIXVM]+\)|\*{1,5}|-|\.{1,5})\s/ , next: "sequenceContent" } ,
              { token: "meta.tag" , regex: /^.+(?::{2,4}|;;)(?: |$)/ , next: "sequenceContent" } ,
              { token: "support.function.list.callout" , regex: /^(?:<\d+>|\d+>|>) / , next: "generalContent" } ,
              // Continuation marker for list items.
              { token: "keyword" , regex: /^\+\s*$/ , next: "initial" }
          ] ,
  
          "generalContent": [
              { token: [ "link" , "variable.language" ] , regex: /((?:https?:\/\/|ftp:\/\/|file:\/\/|mailto:|callto:)[^\s\[]+)(\[.*?\])/ } ,
              { token: "link" , regex: /(?:https?:\/\/|ftp:\/\/|file:\/\/|mailto:|callto:)[^\s\[]+/ } ,
              { token: "link" , regex: /\b[\w\.\/\-]+@[\w\.\/\-]+\b/ } ,
              { include: "shorthandExpressions" } ,
              { include: "blockBoundary" } ,
              { token: "literal" , regex: /\+{3,}/ , next: "inlineRawContent" } ,
              { token: "escape" , regex: /\((?:C|TM|R)\)|\.{3}|->|<-|=>|<=|&#(?:\d+|x[a-fA-F\d]+);|(?: |^)--(?=\s+\S)/ } ,
              { token: "escape" , regex: /\\[_*'`+#]|\\{2}[_*'`+#]{2}/ } ,
              { token: "keyword" , regex: /\s\+$/ } ,
              // Any standard word token.
              { token: "text" , regex: alphanumSymbolPattern } ,
              { token: [ "keyword" , "string" , "keyword" ] , regex: /(<<[\w\d\-$]+,)(.*?)(>>|$)/ } ,
              { token: "keyword" , regex: /<<[\w\d\-$]+,?|>>/ } ,
              { token: "constant.character" , regex: /\({2,3}.*?\){2,3}/ } ,
              // Anchor definition.
              { token: "keyword" , regex: /\[\[.+?\]\]/ } ,
              // Bibliography entry.
              { token: "support" , regex: /^\[{3}[\w\d =\-]+\]{3}/ } ,
  
              { include: "formattingMarks" } ,
              // End of a text block, return to initial state.
              { token: "empty" , regex: /^\s*$/ , next: "initial" }
          ] ,
  
          "sequenceContent": [
              { include: "sequenceEntry" } ,
              { include: "generalContent" }
          ] ,
  
          "paddedBlock": [
              { token: "literal" , regex: /^[\s\w].+$/ , next: "paddedBlock" } ,
              { token: "literal" , regex: "" , next: "initial" }
          ] ,
  
          "codeSnippetBlock": [
              { token: "literal" , regex: /^\.{4,}\s*$/ , next: "restrictEnclosedContent" } ,
              { token: "constant.numeric" , regex: '<\\d+>' } ,
              { token: "literal" , regex: '[^<]+' } ,
              { token: "literal" , regex: '<' }
          ] ,
          "verbatimBlock": [
              { token: "literal" , regex: /^-{4,}\s*$/ , next: "restrictEnclosedContent" } ,
              { token: "constant.numeric" , regex: '<\\d+>' } ,
              { token: "literal" , regex: '[^<]+' } ,
              { token: "literal" , regex: '<' }
          ] ,
          "rawContentBlock": [
              { token: "literal" , regex: /^\+{4,}\s*$/ , next: "restrictEnclosedContent" } ,
              { token: "literal" , regex: alphanumSymbolPattern + "|\\d+" } ,
              { include: "shorthandExpressions" } ,
              { token: "literal" , regex: "." }
          ] ,
  
          "inlineRawContent": [
              { token: "literal" , regex: /[+]{3,}/ , next: "restrictEnclosedContent" } ,
              { token: "literal" , regex: /^\s*$/ , next: "restrictEnclosedContent" } ,
              { token: "literal" , regex: alphanumSymbolPattern + "|\\d+" } ,
              { include: "shorthandExpressions" }
          ] ,
  
          "notationBlock": [
              { token: "doc.comment" , regex: /^\/{4,}\s*$/ , next: "restrictEnclosedContent" } ,
              { token: "doc.comment" , regex: '^.*$' }
          ] ,
          "gridBlock": [
              { token: "tableBlock" , regex: /^\s*\|={3,}\s*$/ , next: "restrictEnclosedContent" } ,
              { token: "tableBlock" , regex: /^\s*!={3,}\s*$/ , next: "nestedGridBlock" } ,
              { token: "tableBlock" , regex: /\|/ } ,
              { include: "generalContent" , noEscape: true }
          ] ,
          "nestedGridBlock": [
              { token: "tableBlock" , regex: /^\s*!={3,}\s*$/ , next: "gridBlock" } ,
              { token: "tableBlock" , regex: /^\s*|={3,}\s*$/ , next: "restrictEnclosedContent" } ,
              { token: "tableBlock" , regex: /\!/ }
          ] ,
          "shorthandExpressions": [
              { token: "macro" , regex: /{[\w\-$]+}/ } ,
              { token: [ "text" , "string" , "text" , "constant.character" , "text" ] , regex: /({)([\w\-$]+)(:)?(.+)?(})/ } ,
              { token: [ "text" , "markup.list.macro" , "keyword" , "string" ] , regex: /(\w+)(footnote(?:ref)?::?)([^\s\[]+)?(\[.*?\])?/ } ,
              { token: [ "markup.list.macro" , "keyword" , "string" ] , regex: /([a-zA-Z\-][\w\.\/\-]*::?)([^\s\[]+)(\[.*?\])?/ } ,
              { token: [ "markup.list.macro" , "keyword" ] , regex: /([a-zA-Z\-][\w\.\/\-]+::?)(\[.*?\])/ } ,
              { token: "keyword" , regex: /^:.+?:(?= |$)/ }
          ] ,
  
          "formattingMarks": [
              { token: "string.italic" , regex: /__[^_\s].*?__/ } ,
              { token: "string.italic" , regex: enclosurePattern ( "_" ) } ,
              
              { token: "keyword.bold" , regex: /\*\*[^*\s].*?\*\*/ } ,
              { token: "keyword.bold" , regex: enclosurePattern ( "\\*" ) } ,
              
              { token: "literal" , regex: enclosurePattern ( "\\+" ) } ,
              { token: "literal" , regex: /\+\+[^+\s].*?\+\+/ } ,
              { token: "literal" , regex: /\$\$.+?\$\$/ } ,
              { token: "literal" , regex: enclosurePattern ( "`" ) } ,
  
              { token: "keyword" , regex: enclosurePattern ( "^" ) } ,
              { token: "keyword" , regex: enclosurePattern ( "~" ) } ,
              { token: "keyword" , regex: /##?/ } ,
              { token: "keyword" , regex: /(?:\B|^)``|\b''/ }
          ]
  
      };
  
      // Helper function to generate regex for quoted text.
      function enclosurePattern ( delimiterChar ) {
          var boundaryPrefix = /\w/.test ( delimiterChar ) ? "\\b" : "(?:\\B|^)";
          return boundaryPrefix + delimiterChar + "[^" + delimiterChar + "].*?" + delimiterChar + "(?![\\w*])";
      }
  
      // A map connecting internal token names to external syntax highlighting types.
      var tokenTypeMapping = {
          macro: "constant.character" ,
          tableBlock: "doc.comment" ,
          titleUnderline: "markup.heading" ,
          singleLineTitle: "markup.heading" ,
          pageBreak: "string" ,
          option: "string.regexp" ,
          otherBlock: "markup.list" ,
          literal: "support.function" ,
          optionalTitle: "constant.numeric" ,
          escape: "constant.language.escape" ,
          link: "markup.underline.list"
      };
  
      // Iterate through all defined states and their rules to apply includes and token remapping.
      for ( var stateKey in this.syntaxStates ) {
          var currentRules = this.syntaxStates[stateKey];
          for ( var idx = currentRules.length ; idx-- ; ) {
              var currentPattern = currentRules[idx];
              if ( currentPattern.include || typeof currentPattern == "string" ) {
                  var insertionArgs = [ idx , 1 ].concat ( this.syntaxStates[currentPattern.include || currentPattern] );
                  if ( currentPattern.noEscape ) {
                      insertionArgs = insertionArgs.filter ( function ( item ) {
                          return !item.next;
                      } );
                  }
                  currentRules.splice.apply ( currentRules , insertionArgs );
              } else if ( currentPattern.token in tokenTypeMapping ) {
                  currentPattern.token = tokenTypeMapping[currentPattern.token];
              }
          }
      }
  };


  

  

  // This LexicalProcessor is responsible for breaking down a line of text into tokens.

  // Maximum number of tokens to process per line to prevent performance issues.
  var MAX_PROCESSING_UNITS = 1000;
  var LexicalProcessor = function ( lexicalRules ) {
      this.ruleSets = lexicalRules;

      this.patternMatchers = {};
      this.matchIndexMap = {};
      for ( var ruleSetName in this.ruleSets ) {
          var currentRuleSet = this.ruleSets[ruleSetName];
          var patternFragments = [];
          var captureGroupCount = 0;
          var ruleIndexMap = this.matchIndexMap[ruleSetName] = { baseTokenType: "text" };
          var regexFlags = "g";

          var complexCaptureRules = [];
          for ( var idx = 0 ; idx < currentRuleSet.length ; idx++ ) {
              var currentRule = currentRuleSet[idx];
              if ( currentRule.baseTokenType )
                  ruleIndexMap.baseTokenType = currentRule.baseTokenType;
              if ( currentRule.ignoreCase )
                  regexFlags = "gi";
              if ( currentRule.pattern == null )
                  continue;

              if ( currentRule.pattern instanceof RegExp )
                  currentRule.pattern = currentRule.pattern.toString().slice ( 1 , -1 );

              // Determine the number of capturing groups in the regex.
              // Two extra groups for the full match and the catch-all.
              var modifiedPattern = currentRule.pattern;
              var groupCount = new RegExp ( "(?:(" + modifiedPattern + ")|(.))" ).exec ( "a" ).length - 2;
              if ( Array.isArray ( currentRule.tokenDescriptor ) ) {
                  if ( currentRule.tokenDescriptor.length == 1 || groupCount == 1 ) {
                      currentRule.tokenDescriptor = currentRule.tokenDescriptor[0];
                  } else if ( groupCount - 1 != currentRule.tokenDescriptor.length ) {
                      throw new Error ( "Mismatch between token classes and regex groups in '" + 
                          currentRule.tokenDescriptor + "'\n'" + currentRule.pattern +  "' - counts are: "
                          + ( groupCount - 1 ) + " != " + currentRule.tokenDescriptor.length );
                  } else {
                      currentRule.descriptorArray = currentRule.tokenDescriptor;
                      currentRule.tokenDescriptor = null;
                      currentRule.matchHandler = this.processArrayTokens;
                  }
              } else if ( typeof currentRule.tokenDescriptor == "function" && !currentRule.matchHandler ) {
                  if ( groupCount > 1 )
                      currentRule.matchHandler = this.applyCustomToken;
                  else
                      currentRule.matchHandler = currentRule.tokenDescriptor;
              }

              if ( groupCount > 1 ) {
                  if ( /\\\d/.test ( currentRule.pattern ) ) {
                      // Adjust backreferences to account for combined regex.
                      modifiedPattern = currentRule.pattern.replace ( /\\([0-9]+)/g , function ( match , groupNumber ) {
                          return "\\" + ( parseInt ( groupNumber , 10 ) + captureGroupCount + 1 );
                      } );
                  } else {
                      groupCount = 1;
                      modifiedPattern = this.stripCapturingGroups ( currentRule.pattern );
                  }
                  if ( !currentRule.splitRegex && typeof currentRule.tokenDescriptor != "string" )
                      complexCaptureRules.push ( currentRule ); // Flags determined later.
              }

              ruleIndexMap[captureGroupCount] = idx;
              captureGroupCount += groupCount;

              patternFragments.push ( modifiedPattern );

              // Optimize property access for common cases.
              if ( !currentRule.matchHandler )
                  currentRule.matchHandler = null;
          }
          
          complexCaptureRules.forEach ( function ( currentRule ) {
              currentRule.splitRegex = this.buildSplitterPattern ( currentRule.pattern , regexFlags );
          } , this );

          this.patternMatchers[ruleSetName] = new RegExp ( "(" + patternFragments.join ( ")|(" ) + ")|($)" , regexFlags );
      }
  };

  ( function () {
      // Sets the maximum number of tokens allowed per line.
      this.setTokenLimit = function ( limitValue ) {
          MAX_PROCESSING_UNITS = limitValue | 0;
      };
      
      // Applies a custom token function to a matched string.
      this.applyCustomToken = function ( inputString ) {
          var capturedValues = this.splitRegex.exec ( inputString ).slice ( 1 );
          var tokenTypes = this.tokenDescriptor.apply ( this , capturedValues );

          // Backward compatibility for older mode implementations.
          if ( typeof tokenTypes === "string" )
              return [ { type: tokenTypes , value: inputString } ];

          var resultTokens = [];
          for ( var idx = 0 , len = tokenTypes.length ; idx < len ; idx++ ) {
              if ( capturedValues[idx] )
                  resultTokens[resultTokens.length] = {
                      type: tokenTypes[idx] ,
                      value: capturedValues[idx]
                  };
          }
          return resultTokens;
      };

      // Processes tokens from an array of descriptors.
      this.processArrayTokens = function ( inputString ) {
          if ( !inputString )
              return [];
          var capturedValues = this.splitRegex.exec ( inputString );
          if ( !capturedValues )
              return "text";
          var resultTokens = [];
          var descriptorArray = this.descriptorArray;
          for ( var idx = 0 , len = descriptorArray.length ; idx < len ; idx++ ) {
              if ( capturedValues[idx + 1] )
                  resultTokens[resultTokens.length] = {
                      type: descriptorArray[idx] ,
                      value: capturedValues[idx + 1]
                  };
          }
          return resultTokens;
      };

      // Removes non-capturing groups from a regular expression source.
      this.stripCapturingGroups = function ( sourcePattern ) {
          var cleanedPattern = sourcePattern.replace (
              /\[(?:\\.|[^\]])*?\]|\\.|\(\?[:=!]|(\()/g ,
              function ( charMatch , captureMark ) { return captureMark ? "(?:" : charMatch; }
          );
          return cleanedPattern;
      };

      // Creates a regular expression for splitting based on capturing groups.
      this.buildSplitterPattern = function ( sourcePattern , regexFlags ) {
          if ( sourcePattern.indexOf ( "(?=" ) != -1 ) {
              var groupStack = 0;
              var insideCharClass = false;
              var lastCaptureInfo = {};
              sourcePattern.replace ( /(\\.)|(\((?:\?[=!])?)|(\))|([\[\]])/g , function (
                  matchResult , escapedChar , openingParen , closingParen , bracketChar , matchIndex
              ) {
                  if ( insideCharClass ) {
                      insideCharClass = bracketChar != "]";
                  } else if ( bracketChar ) {
                      insideCharClass = true;
                  } else if ( closingParen ) {
                      if ( groupStack == lastCaptureInfo.stack ) {
                          lastCaptureInfo.end = matchIndex + 1;
                          lastCaptureInfo.stack = -1;
                      }
                      groupStack--;
                  } else if ( openingParen ) {
                      groupStack++;
                      if ( openingParen.length != 1 ) {
                          lastCaptureInfo.stack = groupStack;
                          lastCaptureInfo.start = matchIndex;
                      }
                  }
                  return matchResult;
              } );

              if ( lastCaptureInfo.end != null && /^\)*$/.test ( sourcePattern.substr ( lastCaptureInfo.end ) ) )
                  sourcePattern = sourcePattern.substring ( 0 , lastCaptureInfo.start ) + sourcePattern.substr ( lastCaptureInfo.end );
          }
          return new RegExp ( sourcePattern , ( regexFlags || "" ).replace ( "g" , "" ) );
      };

      /**
      * Processes a single line of text and returns its tokens and the resulting state.
      * @returns {Object} An object containing 'tokens' array and 'state' string/array.
      **/
      this.getLineTokens = function ( inputLine , initialState ) {
          if ( initialState && typeof initialState != "string" ) {
              var groupStack = initialState.slice ( 0 );
              initialState = groupStack[0];
          } else
              var groupStack = [];

          var activeState = initialState || "initial";
          var currentRuleSet = this.ruleSets[activeState];
          if ( !currentRuleSet ) {
              activeState = "initial";
              currentRuleSet = this.ruleSets[activeState];
          }
          var ruleIndexMap = this.matchIndexMap[activeState];
          var currentMatcher = this.patternMatchers[activeState];
          currentMatcher.lastIndex = 0;

          var matchOutcome , resultTokens = [];
          var previousIndex = 0;

          var currentSegment = { type: null , value: "" };

          while ( matchOutcome = currentMatcher.exec ( inputLine ) ) {
              var segmentType = ruleIndexMap.baseTokenType;
              var currentRule = null;
              var matchedText = matchOutcome[0];
              var currentMatchIndex = currentMatcher.lastIndex;

              if ( currentMatchIndex - matchedText.length > previousIndex ) {
                  var skippedText = inputLine.substring ( previousIndex , currentMatchIndex - matchedText.length );
                  if ( currentSegment.type == segmentType ) {
                      currentSegment.value += skippedText;
                  } else {
                      if ( currentSegment.type )
                          resultTokens.push ( currentSegment );
                      currentSegment = { type: segmentType , value: skippedText };
                  }
              }

              for ( var idx = 0 ; idx < matchOutcome.length - 2 ; idx++ ) {
                  if ( matchOutcome[idx + 1] === undefined )
                      continue;

                  currentRule = currentRuleSet[ruleIndexMap[idx]];

                  if ( currentRule.matchHandler )
                      segmentType = currentRule.matchHandler ( matchedText , activeState , groupStack );
                  else
                      segmentType = currentRule.tokenDescriptor;

                  if ( currentRule.next ) {
                      if ( typeof currentRule.next == "string" )
                          activeState = currentRule.next;
                      else
                          activeState = currentRule.next ( activeState , groupStack );

                      currentRuleSet = this.ruleSets[activeState];
                      if ( !currentRuleSet ) {
                          window.console && console.error && console.error ( activeState , "Rule set not found!" );
                          activeState = "initial";
                          currentRuleSet = this.ruleSets[activeState];
                      }
                      ruleIndexMap = this.matchIndexMap[activeState];
                      previousIndex = currentMatchIndex;
                      currentMatcher = this.patternMatchers[activeState];
                      currentMatcher.lastIndex = currentMatchIndex;
                  }
                  break;
              }

              if ( matchedText ) {
                  if ( typeof segmentType == "string" ) {
                      if ( ( !currentRule || currentRule.merge !== false ) && currentSegment.type === segmentType ) {
                          currentSegment.value += matchedText;
                      } else {
                          if ( currentSegment.type )
                              resultTokens.push ( currentSegment );
                          currentSegment = { type: segmentType , value: matchedText };
                      }
                  } else if ( segmentType ) {
                      if ( currentSegment.type )
                          resultTokens.push ( currentSegment );
                      currentSegment = { type: null , value: "" };
                      for ( var idx = 0 ; idx < segmentType.length ; idx++ )
                          resultTokens.push ( segmentType[idx] );
                  }
              }

              if ( previousIndex == inputLine.length )
                  break;

              previousIndex = currentMatchIndex;

              if ( resultTokens.length > MAX_PROCESSING_UNITS ) {
                  // Browsers may struggle with very large text nodes.
                  while ( previousIndex < inputLine.length ) {
                      if ( currentSegment.type )
                          resultTokens.push ( currentSegment );
                      currentSegment = {
                          value: inputLine.substring ( previousIndex , previousIndex += 2000 ) ,
                          type: "overflow"
                      };
                  }
                  activeState = "initial";
                  groupStack = [];
                  break;
              }
          }

          if ( currentSegment.type )
              resultTokens.push ( currentSegment );
          
          if ( groupStack.length > 1 ) {
              if ( groupStack[0] !== activeState )
                  groupStack.unshift ( activeState );
          }
          return {
              tokens : resultTokens ,
              state : groupStack.length ? groupStack : activeState
          };
      };

  } ).call ( LexicalProcessor.prototype );
  
  // Return the mode definition object to CodeMirror.
  return {
    startState: function () {
      // Initialize a new lexical processor instance with the defined syntax rules,
      // and wrap it in a state object for CodeMirror.
      return {
        tokenizer: new LexicalProcessor ( new SyntaxPatternSet().syntaxStates ) ,
        aceInternalState: "initial" , // The internal state tracking for the Ace-based tokenizer.
        bufferedTokens: [] ,          // A queue of tokens generated for the current line.
        currentLineContent: ""        // The full string content of the line being tokenized.
      };
    } ,
    token: function ( charStream , processingState ) {
      // Check if the stream is at the start of a new line.
      if ( charStream.sol () ) {
        processingState.currentLineContent = charStream.string;
        processingState.bufferedTokens = null; // Invalidate previously buffered tokens.
      }
      // If there are no buffered tokens for the current line, generate them.
      if ( !processingState.bufferedTokens || processingState.bufferedTokens.length === 0 ) {
        var lineParsingOutcome = processingState.tokenizer.getLineTokens ( processingState.currentLineContent , processingState.aceInternalState );
        processingState.bufferedTokens = lineParsingOutcome.tokens;
        processingState.aceInternalState = lineParsingOutcome.state; // Update the tokenizer's internal state.
      }
      // If tokens are available, consume the next one.
      if ( processingState.bufferedTokens.length > 0 ) {
        var nextAvailableToken = processingState.bufferedTokens.shift ();
        charStream.pos += nextAvailableToken.value.length;
        return nextAvailableToken.type;
      }
      // If no tokens were found or all have been consumed, advance the stream to the end.
      charStream.skipToEnd ();
      return null;
    }
  };
} );