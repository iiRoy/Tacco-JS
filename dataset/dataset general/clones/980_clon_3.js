// Portions derived from Ace editor; refer to <https://raw.githubusercontent.com/ajaxorg/ace/master/LICENSE> for licensing details.
CodeMirror.defineMode("asciidoc", function(configOptions, modeSettings) {

  // Internal utility for creating regex patterns for quoted text.
  const buildQuotedTextPattern = (character) => {
      const boundaryPrefix = /\w/.test(character) ? "\\b" : "(?:\\B|^)";
      // Ensure the character itself is escaped if it's a special regex character
      const escapedChar = character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`${boundaryPrefix}${escapedChar}[^${escapedChar}].*?${escapedChar}(?![\\w*])`);
  };

  // Maps internal token names to standard CodeMirror token types.
  const tokenTypeRemappings = new Map([
      ["macro", "constant.character"],
      ["tableBlock", "doc.comment"],
      ["titleUnderline", "markup.heading"],
      ["singleLineTitle", "markup.heading"],
      ["pageBreak", "string"],
      ["option", "string.regexp"],
      ["otherBlock", "markup.list"],
      ["literal", "support.function"],
      ["optionalTitle", "constant.numeric"],
      ["escape", "constant.language.escape"],
      ["link", "markup.underline.list"]
  ]);

  // Defines the lexical rules for AsciiDoc syntax.
  const AsciiDocSyntaxRules = function() {
      const alphaNumericIdRegex = "[a-zA-Z\u00a1-\uffff]+\\b"; // Regex for identifiers

      this.lexicalStates = {
          "initial": [
              {token: "whitespace", regex: /^\s*$/},
              {token: "block.listing", regex: /^\.{4,}\s*$/, next: "listingContent"},
              {token: "block.literal", regex: /^-{4,}\s*$/, next: "literalContent"},
              {token: "block.passthrough", regex: /^\+{4,}\s*$/, next: "passthroughContent"},
              {token: "heading.level", regex: /^={4,}\s*$/},
              {token: "skip", regex: "", next: "checkBlockDelimiters"}
          ],

          "checkBlockDelimiters": [
              {include: "paragraphTermination"},
              {token: "comment.line", regex: '^//.+$'},
              {token: "keyword.directive", regex: "^(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION):"},

              {include: "listItemStart"},
              {token: "text.indented", regex: /^\s+.+$/, next: "indentedText"},
              {token: "text.generic", regex: "", next: "flowText"}
          ],

          "paragraphTermination": [
              {token: "block.comment", regex: /^\/{4,}\s*$/, next: "commentBlockContent"},
              {token: "block.table", regex: /^\s*[|!]=+\s*$/, next: "tableBlockContent"},
              // Open block, thematic break
              {token: "keyword.block", regex: /^(?:--|''')\s*$/, next: "initial"},
              {token: "attribute.option", regex: /^\[.*\]\s*$/, next: "initial"},
              {token: "page.break", regex: /^>{3,}$/, next: "initial"},
              {token: "block.listing", regex: /^\.{4,}\s*$/, next: "listingContent"},
              {token: "heading.underline", regex: /^(?:={2,}|-{2,}|~{2,}|\^{2,}|\+{2,})\s*$/, next: "initial"},
              {token: "heading.singleline", regex: /^={1,5}\s+\S.*$/, next: "initial"},

              {token: "block.generic", regex: /^(?:\*{2,}|_{2,})\s*$/, next: "initial"},
              // .optional title
              {token: "title.optional", regex: /^\.[^.\s].+$/, next: "initial"}
          ],

          "listItemStart": [
              {token: "list.item.marker", regex: /^\s*(?:\d+\.|[a-zA-Z]\.|[ixvmIXVM]+\)|\*{1,5}|-|\.{1,5})\s/, next: "listFlowText"},
              {token: "meta.tag.label", regex: /^.+(?::{2,4}|;;)(?: |$)/, next: "listFlowText"},
              {token: "support.function.list.callout", regex: /^(?:<\d+>|\d+>|>) /, next: "flowText"},
              // Continuation line
              {token: "keyword.continuation", regex: /^\+\s*$/, next: "initial"}
          ],

          "flowText": [
              {token: ["link.url", "variable.language"], regex: /((?:https?:\/\/|ftp:\/\/|file:\/\/|mailto:|callto:)[^\s\[]+)(\[.*?\])/},
              {token: "link.url", regex: /(?:https?:\/\/|ftp:\/\/|file:\/\/|mailto:|callto:)[^\s\[]+/},
              {token: "link.email", regex: /\b[\w\.\/\-]+@[\w\.\/\-]+\b/},
              {include: "macroDefinitions"},
              {include: "paragraphTermination"},
              {token: "block.smallPassthrough", regex:/\+{3,}/, next:"inlinePassthrough"},
              {token: "character.escape", regex: /\((?:C|TM|R)\)|\.{3}|->|<-|=>|<=|&#(?:\d+|x[a-fA-F\d]+);|(?: |^)--(?=\s+\S)/},
              {token: "character.escape", regex: /\\[_*'`+#]|\\{2}[_*'`+#]{2}/},
              {token: "keyword.continuation", regex: /\s\+$/},
              // Any word
              {token: "text.word", regex: alphaNumericIdRegex},
              {token: ["keyword.anchor", "string.anchor", "keyword.anchor"],
                  regex: /(<<[\w\d\-$]+,)(.*?)(>>|$)/},
              {token: "keyword.anchor", regex: /<<[\w\d\-$]+,?|>>/},
              {token: "constant.character.emoji", regex: /\({2,3}.*?\){2,3}/},
              // Anchor
              {token: "keyword.reference", regex: /\[\[.+?\]\]/},
              // Bibliography
              {token: "support.reference", regex: /^\[{3}[\w\d =\-]+\]{3}/},

              {include: "textQuotes"},
              // Text block end
              {token: "whitespace", regex: /^\s*$/, next: "initial"}
          ],

          "listFlowText": [
              {include: "listItemStart"},
              {include: "flowText"}
          ],

          "indentedText": [
              {token: "literal.block.indented", regex: /^[\s\w].+$/, next: "indentedText"},
              {token: "empty", regex: "", next: "initial"}
          ],

          "listingContent": [
              {token: "block.listing", regex: /^\.{4,}\s*$/, next: "checkBlockDelimiters"},
              {token: "constant.numeric.callout", regex: '<\\d+>'},
              {token: "literal.content", regex: '[^<]+'},
              {token: "literal.content", regex: '<'} // Catch single '<'
          ],
          "literalContent": [
              {token: "block.literal", regex: /^-{4,}\s*$/, next: "checkBlockDelimiters"},
              {token: "constant.numeric.callout", regex: '<\\d+>'},
              {token: "literal.content", regex: '[^<]+'},
              {token: "literal.content", regex: '<'}
          ],
          "passthroughContent": [
              {token: "block.passthrough", regex: /^\+{4,}\s*$/, next: "checkBlockDelimiters"},
              {token: "literal.content", regex: alphaNumericIdRegex + "|\\d+"},
              {include: "macroDefinitions"},
              {token: "literal.content", regex: "."} // Catch any character
          ],

          "inlinePassthrough": [
              {token: "block.smallPassthrough", regex: /[+]{3,}/, next: "checkBlockDelimiters"},
              {token: "whitespace", regex: /^\s*$/, next: "checkBlockDelimiters"}, // Empty line terminates
              {token: "literal.content", regex: alphaNumericIdRegex + "|\\d+"},
              {include: "macroDefinitions"}
          ],

          "commentBlockContent": [
              {token: "block.comment", regex: /^\/{4,}\s*$/, next: "checkBlockDelimiters"},
              {token: "comment.block", regex: '^.*$'}
          ],
          "tableBlockContent": [
              {token: "block.table", regex: /^\s*\|={3,}\s*$/, next: "checkBlockDelimiters"},
              {token: "block.table.nested", regex: /^\s*!={3,}\s*$/, next: "nestedTableBlockContent"},
              {token: "table.delimiter", regex: /\|/},
              {include: "flowText", skipEscapes: true} // 'noEscape' is now 'skipEscapes'
          ],
          "nestedTableBlockContent": [
              {token: "block.table.nested", regex: /^\s*!={3,}\s*$/, next: "tableBlockContent"},
              {token: "block.table", regex: /^\s*\|={3,}\s*$/, next: "checkBlockDelimiters"},
              {token: "table.delimiter", regex: /\!/}
          ],
          "macroDefinitions": [
              {token: "macro.variable", regex: /{[\w\-$]+}/},
              {token: ["text", "string.macro", "text", "constant.character.macro", "text"], regex: /({)([\w\-$]+)(:)?(.+)?(})/},
              {token: ["text", "markup.list.macro", "keyword.macro", "string.macro"], regex: /(\w+)(footnote(?:ref)?::?)([^\s\[]+)?(\[.*?\])?/},
              {token: ["markup.list.macro", "keyword.macro", "string.macro"], regex: /([a-zA-Z\-][\w\.\/\-]*::?)([^\s\[]+)(\[.*?\])?/},
              {token: ["markup.list.macro", "keyword.macro"], regex: /([a-zA-Z\-][\w\.\/\-]+::?)(\[.*?\])/},
              {token: "keyword.attribute", regex: /^:.+?:(?= |$)/}
          ],

          "textQuotes": [
              {token: "string.italic", regex: buildQuotedTextPattern("_")}, // Order changed
              {token: "string.italic", regex: /__[^_\s].*?__/},

              {token: "keyword.bold", regex: buildQuotedTextPattern("\\*")},
              {token: "keyword.bold", regex: /\*\*[^*\s].*?\*\*/},

              {token: "literal.inline", regex: buildQuotedTextPattern("\\+")},
              {token: "literal.inline", regex: /\+\+[^+\s].*?\+\+/},
              {token: "literal.math", regex: /\$\$.+?\$\$/},
              {token: "literal.inline", regex: buildQuotedTextPattern("`")},

              {token: "keyword.superscript", regex: buildQuotedTextPattern("^")},
              {token: "keyword.subscript", regex: buildQuotedTextPattern("~")},
              {token: "keyword.apostrophe", regex: /##?/},
              {token: "keyword.quotes", regex: /(?:\B|^)``|\b''/}
          ]
      };

      // Apply includes and token remappings after rules are defined.
      for (const stateName in this.lexicalStates) {
          let stateRules = this.lexicalStates[stateName];
          const processedRules = [];
          for (let i = 0; i < stateRules.length; i++) {
              const rule = stateRules[i];
              if (rule.include) {
                  const includedRules = this.lexicalStates[rule.include];
                  if (includedRules) {
                      // Filter out rules with 'next' if skipEscapes is true
                      const rulesToInclude = rule.skipEscapes
                          ? includedRules.filter(incRule => !incRule.next)
                          : includedRules;
                      processedRules.push(...rulesToInclude);
                  }
              } else {
                  if (rule.token && tokenTypeRemappings.has(rule.token)) {
                      rule.token = tokenTypeRemappings.get(rule.token);
                  }
                  processedRules.push(rule);
              }
          }
          this.lexicalStates[stateName] = processedRules; // Replace old rules with processed ones
      }
  };

  // --- Lexical Analyzer (formerly Tokenizer) ---

  // Maximum number of tokens to process per line to prevent performance issues on very long lines.
  const TOKEN_SCAN_LIMIT = 1000;

  class LexicalAnalyzer {
      constructor(ruleSet) {
          this.stateDefinitions = ruleSet;
          this.compiledRegexes = new Map();
          this.ruleIndexMaps = new Map();

          this.initializeRules();
      }

      // Pre-process all rule sets to compile regexes and create match mappings.
      initializeRules() {
          for (const stateKey in this.stateDefinitions) {
              const stateRules = this.stateDefinitions[stateKey];
              const regexParts = [];
              let totalCaptureGroups = 0;
              const currentRuleIndexMap = { defaultType: "text" };
              let regexFlags = "g"; // Default to global

              const rulesWithSplitter = []; // Rules that need a separate splitter regex

              stateRules.forEach((rule, ruleIdx) => {
                  if (rule.defaultToken) {
                      currentRuleIndexMap.defaultType = rule.defaultToken;
                  }
                  if (rule.caseInsensitive) {
                      regexFlags = "gi";
                  }
                  if (!rule.regex) {
                      return; // Skip rules without a regex
                  }

                  let currentRegexString = rule.regex instanceof RegExp
                      ? rule.regex.source
                      : rule.regex;

                  // Determine number of capturing groups in the current regex
                  let captureCount = this.countCapturingGroups(currentRegexString);

                  if (Array.isArray(rule.token)) {
                      if (rule.token.length === 1 || captureCount === 1) {
                          rule.token = rule.token[0]; // Flatten if only one token type
                      } else if (captureCount - 1 !== rule.token.length) {
                          console.warn(`Mismatch in token types and capture groups for rule: ${rule.token} / ${rule.regex}`);
                          // Fallback or error handling
                      } else {
                          rule.tokenArray = rule.token;
                          rule.token = null;
                          rule.onMatch = this.extractArrayTokens.bind(this);
                      }
                  } else if (typeof rule.token === "function" && !rule.onMatch) {
                      rule.onMatch = (captureCount > 1)
                          ? this.processGroupedTokens.bind(this)
                          : rule.token;
                  }

                  if (captureCount > 1) {
                      if (!rule.splitRegex && typeof rule.token !== "string") {
                          rulesWithSplitter.push(rule);
                      }
                      // Adjust backreferences if they exist
                      if (/\\\d/.test(currentRegexString)) {
                          currentRegexString = currentRegexString.replace(/\\([0-9]+)/g, (match, digit) => {
                              return `\\${parseInt(digit, 10) + totalCaptureGroups + 1}`;
                          });
                      } else {
                          // If no backreferences, simplify regex for main match if it has multiple groups
                          currentRegexString = this.simplifyRegexForMainMatch(currentRegexString);
                          captureCount = 1; // Treat as a single match for main regex
                      }
                  }

                  currentRuleIndexMap[totalCaptureGroups] = ruleIdx;
                  totalCaptureGroups += captureCount;
                  regexParts.push(currentRegexString);

                  if (!rule.onMatch) {
                      rule.onMatch = null; // Optimize property access
                  }
              });

              rulesWithSplitter.forEach(rule => {
                  rule.splitRegex = this.createSplitterRegex(rule.regex, regexFlags);
              });

              this.compiledRegexes.set(stateKey, new RegExp(`(${regexParts.join(")|(")})|($)`, regexFlags));
              this.ruleIndexMaps.set(stateKey, currentRuleIndexMap);
          }
      }

      // Counts non-capturing and capturing groups for a regex string.
      countCapturingGroups(regexStr) {
          let count = 0;
          let inCharClass = false;
          for (let i = 0; i < regexStr.length; i++) {
              if (regexStr[i] === '\\') { // Escape sequence
                  i++;
                  continue;
              }
              if (regexStr[i] === '[') {
                  inCharClass = true;
                  continue;
              }
              if (regexStr[i] === ']') {
                  inCharClass = false;
                  continue;
              }
              if (!inCharClass && regexStr[i] === '(' && regexStr.substring(i, i + 3) !== '(?:' && regexStr.substring(i, i + 3) !== '(?<' && regexStr.substring(i, i + 3) !== '(?=' && regexStr.substring(i, i + 3) !== '(?!') {
                  count++;
              }
          }
          return count;
      }

      // Simplifies a regex string by converting capturing groups to non-capturing ones.
      simplifyRegexForMainMatch(sourceRegex) {
          return sourceRegex.replace(
              /\[(?:\\.|[^\]])*?\]|\\.|\(\?[:=!]|(\()/g,
              (match, groupStart) => groupStart ? "(?:" : match
          );
      }

      // Creates a specific splitter regex for rules with complex token arrays.
      createSplitterRegex(sourceRegex, flags) {
          if (sourceRegex.includes("(?=")) { // Check for lookaheads
              let groupStackDepth = 0;
              let charClassActive = false;
              let lastCaptureGroupInfo = { depth: -1, startIndex: -1, endIndex: -1 };

              sourceRegex.replace(
                  /(\\.)|(\((?:\?[=!])?)|(\))|([\[\]])/g,
                  (match, escapedChar, parenOpen, parenClose, squareBracket, index) => {
                      if (charClassActive) {
                          charClassActive = (squareBracket !== "]");
                      } else if (squareBracket) {
                          charClassActive = true;
                      } else if (parenClose) {
                          if (groupStackDepth === lastCaptureGroupInfo.depth) {
                              lastCaptureGroupInfo.endIndex = index + 1;
                              lastCaptureGroupInfo.depth = -1; // Mark as resolved
                          }
                          groupStackDepth--;
                      } else if (parenOpen) {
                          groupStackDepth++;
                          // If it's a capturing group (not `(?:`, `(?=`, `(?!`)
                          if (parenOpen.length === 1) {
                              lastCaptureGroupInfo.depth = groupStackDepth;
                              lastCaptureGroupInfo.startIndex = index;
                          }
                      }
                      return match; // Return original match to not modify string in this pass
                  }
              );

              // If a capturing group was found and it's at the end of the regex, remove it.
              if (lastCaptureGroupInfo.endIndex !== -1 && /^(\))*$/.test(sourceRegex.substring(lastCaptureGroupInfo.endIndex))) {
                  sourceRegex = sourceRegex.substring(0, lastCaptureGroupInfo.startIndex) + sourceRegex.substring(lastCaptureGroupInfo.endIndex);
              }
          }
          return new RegExp(sourceRegex, (flags || "").replace("g", ""));
      }

      // Handles rules where `token` is an array of types for corresponding regex groups.
      extractArrayTokens(matchedString) {
          if (!matchedString) {
              return [];
          }
          const groupValues = this.splitRegex.exec(matchedString);
          if (!groupValues) {
              return [{ type: "text", value: matchedString }]; // Fallback
          }
          const tokenOutput = [];
          const tokenTypes = this.tokenArray;
          for (let i = 0; i < tokenTypes.length; i++) {
              // Group values are 1-indexed for captures
              if (groupValues[i + 1]) {
                  tokenOutput.push({
                      type: tokenTypes[i],
                      value: groupValues[i + 1]
                  });
              }
          }
          return tokenOutput;
      }

      // Handles rules where `token` is a function that returns a type or an array of types.
      processGroupedTokens(matchedString, currentState, stateStack) {
          const groupValues = this.splitRegex.exec(matchedString).slice(1);
          const returnedTypes = this.token.apply(this, [matchedString, currentState, stateStack, ...groupValues]);

          if (typeof returnedTypes === "string") {
              return [{ type: returnedTypes, value: matchedString }];
          }

          const generatedTokens = [];
          for (let i = 0, len = returnedTypes.length; i < len; i++) {
              if (groupValues[i]) {
                  generatedTokens.push({
                      type: returnedTypes[i],
                      value: groupValues[i]
                  });
              }
          }
          return generatedTokens;
      }

      // Sets the maximum number of tokens allowed per line.
      static setMaxLineTokenCount(limit) {
          LexicalAnalyzer.tokenScanLimit = limit | 0;
      }

      // Main function to tokenize a single line of text.
      analyzeLineForTokens(lineContent, startingState) {
          let stateStack = [];
          if (startingState) {
              if (typeof startingState !== "string") {
                  stateStack = startingState.slice(0); // Clone stack
                  startingState = stateStack[0];
              }
          }

          let currentStateName = startingState || "initial";
          let currentRules = this.stateDefinitions[currentStateName];

          // Fallback if current state is invalid
          if (!currentRules) {
              currentStateName = "initial";
              currentRules = this.stateDefinitions[currentStateName];
          }

          const currentRuleMap = this.ruleIndexMaps.get(currentStateName);
          let currentRegex = this.compiledRegexes.get(currentStateName);
          currentRegex.lastIndex = 0; // Reset regex for new line scan

          const resultingTokens = [];
          let lastProcessedIndex = 0;
          let currentTokenBuffer = { type: null, value: "" };

          let matchResult;
          while ((matchResult = currentRegex.exec(lineContent))) {
              const matchedValue = matchResult[0];
              const matchEndIndex = currentRegex.lastIndex;

              // Handle skipped text before the current match
              if (matchEndIndex - matchedValue.length > lastProcessedIndex) {
                  const skippedText = lineContent.substring(lastProcessedIndex, matchEndIndex - matchedValue.length);
                  if (currentTokenBuffer.type === currentRuleMap.defaultType) {
                      currentTokenBuffer.value += skippedText;
                  } else {
                      if (currentTokenBuffer.type) {
                          resultingTokens.push(currentTokenBuffer);
                      }
                      currentTokenBuffer = { type: currentRuleMap.defaultType, value: skippedText };
                  }
              }

              let ruleApplied = null;
              let tokenTypeDetermined = currentRuleMap.defaultType;

              // Iterate through capture groups to find which rule matched
              for (let i = 0; i < matchResult.length - 2; i++) {
                  if (matchResult[i + 1] === undefined) {
                      continue; // This group did not match
                  }

                  const ruleIndex = currentRuleMap[i];
                  ruleApplied = currentRules[ruleIndex];

                  if (ruleApplied.onMatch) {
                      // Pass context for onMatch functions
                      const matchedTokens = ruleApplied.onMatch(matchedValue, currentStateName, stateStack);
                      if (Array.isArray(matchedTokens)) {
                          tokenTypeDetermined = matchedTokens;
                      } else {
                          tokenTypeDetermined = matchedTokens; // Should be a string
                      }
                  } else {
                      tokenTypeDetermined = ruleApplied.token;
                  }

                  // Handle state transitions
                  if (ruleApplied.next) {
                      let nextState = ruleApplied.next;
                      if (typeof nextState === "function") {
                          nextState = nextState(currentStateName, stateStack);
                      }
                      currentStateName = nextState;
                      currentRules = this.stateDefinitions[currentStateName];

                      if (!currentRules) {
                          console.error(`Lexical state '${currentStateName}' does not exist. Falling back to 'initial'.`);
                          currentStateName = "initial";
                          currentRules = this.stateDefinitions[currentStateName];
                      }

                      this.ruleIndexMaps.set(currentStateName, this.ruleIndexMaps.get(currentStateName) || { defaultType: "text" }); // Ensure map exists
                      currentRegex = this.compiledRegexes.get(currentStateName);
                      currentRegex.lastIndex = matchEndIndex; // Continue from where we left off
                      lastProcessedIndex = matchEndIndex;
                  }
                  break; // Found the matching rule, break from group iteration
              }

              // Add the matched value to tokens
              if (matchedValue) {
                  if (typeof tokenTypeDetermined === "string") {
                      const mergeTokens = !ruleApplied || ruleApplied.merge !== false;
                      if (mergeTokens && currentTokenBuffer.type === tokenTypeDetermined) {
                          currentTokenBuffer.value += matchedValue;
                      } else {
                          if (currentTokenBuffer.type) {
                              resultingTokens.push(currentTokenBuffer);
                          }
                          currentTokenBuffer = { type: tokenTypeDetermined, value: matchedValue };
                      }
                  } else if (Array.isArray(tokenTypeDetermined)) {
                      // If onMatch returned an array of tokens, push them directly
                      if (currentTokenBuffer.type) {
                          resultingTokens.push(currentTokenBuffer);
                      }
                      currentTokenBuffer = { type: null, value: "" }; // Reset buffer
                      resultingTokens.push(...tokenTypeDetermined);
                  }
              }

              if (lastProcessedIndex === lineContent.length) {
                  break; // Reached end of line
              }

              lastProcessedIndex = matchEndIndex;

              // Performance guard: prevent excessive token generation
              if (resultingTokens.length > LexicalAnalyzer.tokenScanLimit) {
                  // Truncate line and mark remaining as overflow
                  if (currentTokenBuffer.type) {
                      resultingTokens.push(currentTokenBuffer);
                  }
                  // Add a single overflow token for the rest of the line
                  const remainingText = lineContent.substring(lastProcessedIndex);
                  if (remainingText.length > 0) {
                      resultingTokens.push({
                          value: remainingText,
                          type: "text.overflow.truncated"
                      });
                  }
                  currentStateName = "initial"; // Reset state for next line
                  stateStack = []; // Clear stack
                  break;
              }
          }

          // Push any remaining token in the buffer
          if (currentTokenBuffer.type) {
              resultingTokens.push(currentTokenBuffer);
          }

          // Update state stack
          if (stateStack.length > 1) {
              if (stateStack[0] !== currentStateName) {
                  stateStack.unshift(currentStateName);
              }
          } else if (stateStack.length === 0 && currentStateName !== "initial") {
              stateStack.push(currentStateName); // Start new stack if not in initial state
          } else if (stateStack.length === 1 && stateStack[0] !== currentStateName) {
              stateStack[0] = currentStateName; // Update single item stack
          }

          return {
              tokens: resultingTokens,
              newState: stateStack.length ? stateStack : currentStateName
          };
      }
  }

  // Set the static limit for the LexicalAnalyzer class.
  LexicalAnalyzer.tokenScanLimit = TOKEN_SCAN_LIMIT;


  // Initialize syntax rules and the lexical analyzer.
  const syntaxRuleGenerator = new AsciiDocSyntaxRules();
  const lexer = new LexicalAnalyzer(syntaxRuleGenerator.lexicalStates);

  // Return the CodeMirror mode object.
  return {
    startState: function() {
      return {
        // Initial state for the tokenizer
        tokenizeState: "initial",
        // Stack for nested states (e.g., delimited blocks)
        stateStack: []
      };
    },
    token: function(stream, state) {
      // If the stream is at the start of a line, tokenize the entire line.
      // CodeMirror's `token` function processes chunk-by-chunk. Ace's `getLineTokens`
      // processes the whole line. We need to bridge this.
      // For simplicity in cloning, let's assume `stream.string` is the current line,
      // and we will consume from `stream` based on the tokens generated.
      // This is a common pattern when adapting Ace-like tokenizers to CodeMirror.

      if (stream.sol()) {
        const line = stream.string;
        const { tokens, newState } = lexer.analyzeLineForTokens(line, state.tokenizeState);

        state.lineTokens = tokens;
        state.currentTokenIndex = 0;
        state.tokenizeState = newState; // Update the state for the next line

        // Handle stack updates if newState is an array
        if (Array.isArray(newState)) {
            state.stateStack = newState;
            state.tokenizeState = newState[0]; // The top of the stack is the current state
        } else {
            state.stateStack = [newState];
        }
      }

      if (state.currentTokenIndex < state.lineTokens.length) {
        const currentToken = state.lineTokens[state.currentTokenIndex];
        state.currentTokenIndex++;
        stream.pos += currentToken.value.length; // Advance stream position by token length
        return currentToken.type;
      } else {
        // Should not happen if `analyzeLineForTokens` covers the whole line,
        // but as a fallback, consume one char and return default.
        if (!stream.eol()) {
            stream.next();
            return null; // Default token for unmatched text
        }
        return null; // End of line
      }
    },
    // Allows CodeMirror to query for the current state after a token has been processed.
    // Useful for block comments, multi-line strings, etc.
    copyState: function(state) {
      return {
        tokenizeState: Array.isArray(state.tokenizeState) ? state.tokenizeState.slice(0) : state.tokenizeState,
        stateStack: state.stateStack.slice(0),
        lineTokens: state.lineTokens ? state.lineTokens.slice(0) : [],
        currentTokenIndex: state.currentTokenIndex
      };
    }
  };
});