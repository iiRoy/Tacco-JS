CodeMirror.defineMode("asciidoc", function(configSettings, modeOptions) {

  function createSyntaxDefinitions() {
    const alphanumSequence = "[a-zA-Z\u00a1-\uffff]+\\b";

    function createQuotationPattern(charSeq) {
        const prefix = /\w/.test(charSeq) ? "\\b" : "(?:\\B|^)";
        return new RegExp(prefix + charSeq + "[^" + charSeq + "].*?" + charSeq + "(?![\\w*])");
    }

    const typeAliases = {
        macro: "constant.character",
        tableBlock: "doc.comment",
        titleUnderline: "markup.heading",
        singleLineTitle: "markup.heading",
        pageBreak: "string",
        option: "string.regexp",
        otherBlock: "markup.list",
        literal: "support.function",
        optionalTitle: "constant.numeric",
        escape: "constant.language.escape",
        link: "markup.underline.list"
    };

    function resolveTokenType(originalToken) {
        if (Array.isArray(originalToken)) {
            return originalToken.map(t => typeAliases[t] || t);
        }
        return typeAliases[originalToken] || originalToken;
    }

    const grammarDefinitions = {
        "initialState": [
            {type: resolveTokenType("empty"),   pattern: /$/},
            {type: resolveTokenType("literal"), pattern: /^\.{4,}\s*$/,  nextState: "listingSection"},
            {type: resolveTokenType("literal"), pattern: /^-{4,}\s*$/,   nextState: "literalSection"},
            {type: resolveTokenType("string"),  pattern: /^\+{4,}\s*$/,  nextState: "passthroughSection"},
            {type: resolveTokenType("keyword"), pattern: /^={4,}\s*$/},
            {type: resolveTokenType("text"),    pattern: /^\s*$/},
            {type: resolveTokenType("empty"),   pattern: "", nextState: "restrictBlock"}
        ],

        "restrictBlock": [
            {type: resolveTokenType("comment"), pattern: '^//.+$'},
            {type: resolveTokenType("keyword"), pattern: "^(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION):"},
            {type: resolveTokenType("literal"), pattern: /^\s+.+$/, nextState: "indentedSection"},
            {type: resolveTokenType("empty"),   pattern: "", nextState: "contentState"}
        ],

        "paragraphTermination": [
            {type: resolveTokenType("doc.comment"), pattern: /^\/{4,}\s*$/,    nextState: "commentSection"},
            {type: resolveTokenType("tableBlock"),  pattern: /^\s*[|!]=+\s*$/, nextState: "tableSection"},
            {type: resolveTokenType("keyword"),     pattern: /^(?:--|''')\s*$/, nextState: "initialState"},
            {type: resolveTokenType("option"),      pattern: /^\[.*\]\s*$/,     nextState: "initialState"},
            {type: resolveTokenType("pageBreak"),   pattern: /^>{3,}$/,         nextState: "initialState"},
            {type: resolveTokenType("literal"),     pattern: /^\.{4,}\s*$/,     nextState: "listingSection"},
            {type: resolveTokenType("titleUnderline"),    pattern: /^(?:={2,}|-{2,}|~{2,}|\^{2,}|\+{2,})\s*$/, nextState: "initialState"},
            {type: resolveTokenType("singleLineTitle"),   pattern: /^={1,5}\s+\S.*$/, nextState: "initialState"},
            {type: resolveTokenType("otherBlock"),    pattern: /^(?:\*{2,}|_{2,})\s*$/, nextState: "initialState"},
            {type: resolveTokenType("optionalTitle"), pattern: /^\.[^.\s].+$/,  nextState: "initialState"}
        ],

        "listInitiation": [
            {type: resolveTokenType("keyword"),  pattern: /^\s*(?:\d+\.|[a-zA-Z]\.|[ixvmIXVM]+\)|\*{1,5}|-|\.{1,5})\s/, nextState: "listContent"},
            {type: resolveTokenType("meta.tag"), pattern: /^.+(?::{2,4}|;;)(?: |$)/, nextState: "listContent"},
            {type: resolveTokenType("support.function.list.callout"), pattern: /^(?:<\d+>|\d+>|>) /, nextState: "contentState"},
            {type: resolveTokenType("keyword"),  pattern: /^\+\s*$/, nextState: "initialState"}
        ],

        "contentState": [
            {type: [resolveTokenType("link"), resolveTokenType("variable.language")], pattern: /((?:https?:\/\/|ftp:\/\/|file:\/\/|mailto:|callto:)[^\s\[]+)(\[.*?\])/},
            {type: resolveTokenType("link"), pattern: /(?:https?:\/\/|ftp:\/\/|file:\/\/|mailto:|callto:)[^\s\[]+/},
            {type: resolveTokenType("link"), pattern: /\b[\w\.\/\-]+@[\w\.\/\-]+\b/},
            {type: resolveTokenType("literal"), pattern:/\+{3,}/, nextState:"smallPassthroughSection"},
            {type: resolveTokenType("escape"), pattern: /\((?:C|TM|R)\)|\.{3}|->|<-|=>|<=|&#(?:\d+|x[a-fA-F\d]+);|(?: |^)--(?=\s+\S)/},
            {type: resolveTokenType("escape"), pattern: /\\[_*'`+#]|\\{2}[_*'`+#]{2}/},
            {type: resolveTokenType("keyword"), pattern: /\s\+$/},
            {type: resolveTokenType("text"), pattern: new RegExp(alphanumSequence)},
            {type: [resolveTokenType("keyword"), resolveTokenType("string"), resolveTokenType("keyword")],
                pattern: /(<<[\w\d\-$]+,)(.*?)(>>|$)/},
            {type: resolveTokenType("keyword"), pattern: /<<[\w\d\-$]+,?|>>/},
            {type: resolveTokenType("constant.character"), pattern: /\({2,3}.*?\){2,3}/},
            {type: resolveTokenType("keyword"), pattern: /\[\[.+?\]\]/},
            {type: resolveTokenType("support"), pattern: /^\[{3}[\w\d =\-]+\]{3}/},
            {type: resolveTokenType("empty"), pattern: /^\s*$/, nextState: "initialState"}
        ],

        "listContent": [
        ],

        "indentedSection": [
            {type: resolveTokenType("literal"), pattern: /^[\s\w].+$/, nextState: "indentedSection"},
            {type: resolveTokenType("literal"), pattern: "", nextState: "initialState"}
        ],

        "listingSection": [
            {type: resolveTokenType("literal"), pattern: /^\.{4,}\s*$/, nextState: "restrictBlock"},
            {type: resolveTokenType("constant.numeric"), pattern: /<\d+>/},
            {type: resolveTokenType("literal"), pattern: /[^<]+/},
            {type: resolveTokenType("literal"), pattern: /</}
        ],
        "literalSection": [
            {type: resolveTokenType("literal"), pattern: /^-{4,}\s*$/, nextState: "restrictBlock"},
            {type: resolveTokenType("constant.numeric"), pattern: /<\d+>/},
            {type: resolveTokenType("literal"), pattern: /[^<]+/},
            {type: resolveTokenType("literal"), pattern: /</}
        ],
        "passthroughSection": [
            {type: resolveTokenType("literal"), pattern: /^\+{4,}\s*$/, nextState: "restrictBlock"},
            {type: resolveTokenType("literal"), pattern: new RegExp(alphanumSequence + "|\\d+")},
            {type: resolveTokenType("literal"), pattern: /./}
        ],

        "smallPassthroughSection": [
            {type: resolveTokenType("literal"), pattern: /[+]{3,}/, nextState: "restrictBlock"},
            {type: resolveTokenType("literal"), pattern: /^\s*$/, nextState: "restrictBlock"},
            {type: resolveTokenType("literal"), pattern: new RegExp(alphanumSequence + "|\\d+")},
        ],

        "commentSection": [
            {type: resolveTokenType("doc.comment"), pattern: /^\/{4,}\s*$/, nextState: "restrictBlock"},
            {type: resolveTokenType("doc.comment"), pattern: /^.*$/}
        ],
        "tableSection": [
            {type: resolveTokenType("tableBlock"), pattern: /^\s*\|={3,}\s*$/, nextState: "restrictBlock"},
            {type: resolveTokenType("tableBlock"), pattern: /^\s*!={3,}\s*$/, nextState: "innerTableSection"},
            {type: resolveTokenType("tableBlock"), pattern: /\|/},
        ],
        "innerTableSection": [
            {type: resolveTokenType("tableBlock"), pattern: /^\s*!={3,}\s*$/, nextState: "tableSection"},
            {type: resolveTokenType("tableBlock"), pattern: /^\s*\|={3,}\s*$/, nextState: "restrictBlock"},
            {type: resolveTokenType("tableBlock"), pattern: /\!/}
        ],
        "macroDefinitions": [
            {type: resolveTokenType("macro"), pattern: /{[\w\-$]+}/},
            {type: [resolveTokenType("text"), resolveTokenType("string"), resolveTokenType("text"), resolveTokenType("constant.character"), resolveTokenType("text")], pattern: /({)([\w\-$]+)(:)?(.+)?(})/},
            {type: [resolveTokenType("text"), "markup.list.macro", resolveTokenType("keyword"), resolveTokenType("string")], pattern: /(\w+)(footnote(?:ref)?::?)([^\s\[]+)?(\[.*?\])?/},
            {type: ["markup.list.macro", resolveTokenType("keyword"), resolveTokenType("string")], pattern: /([a-zA-Z\-][\w\.\/\-]*::?)([^\s\[]+)(\[.*?\])?/},
            {type: ["markup.list.macro", resolveTokenType("keyword")], pattern: /([a-zA-Z\-][\w\.\/\-]+::?)(\[.*?\])/},
            {type: resolveTokenType("keyword"), pattern: /^:.+?:(?= |$)/}
        ],

        "quotationMarks": [
            {type: resolveTokenType("string.italic"), pattern: /__[^_\s].*?__/},
            {type: resolveTokenType("string.italic"), pattern: createQuotationPattern("_")},

            {type: resolveTokenType("keyword.bold"), pattern: /\*\*[^*\s].*?\*\*/},
            {type: resolveTokenType("keyword.bold"), pattern: createQuotationPattern("\\*")},

            {type: resolveTokenType("literal"), pattern: createQuotationPattern("\\+")},
            {type: resolveTokenType("literal"), pattern: /\+\+[^+\s].*?\+\+/},
            {type: resolveTokenType("literal"), pattern: /\$\$.+?\$\$/},
            {type: resolveTokenType("literal"), pattern: createQuotationPattern("`")},

            {type: resolveTokenType("keyword"), pattern: createQuotationPattern("^")},
            {type: resolveTokenType("keyword"), pattern: createQuotationPattern("~")},
            {type: resolveTokenType("keyword"), pattern: /##?/},
            {type: resolveTokenType("keyword"), pattern: /(?:\B|^)``|\b''/}
        ]
    };

    function mergeRules(targetStateRules, sourceStateName, filterNoNextState = false) {
        const sourceRules = grammarDefinitions[sourceStateName];
        if (!sourceRules) return;
        sourceRules.forEach(rule => {
            if (filterNoNextState && rule.nextState) {
                return;
            }
            targetStateRules.push(rule);
        });
    }

    mergeRules(grammarDefinitions["restrictBlock"], "paragraphTermination");
    mergeRules(grammarDefinitions["restrictBlock"], "listInitiation");

    mergeRules(grammarDefinitions["contentState"], "macroDefinitions");
    mergeRules(grammarDefinitions["contentState"], "paragraphTermination");
    mergeRules(grammarDefinitions["contentState"], "quotationMarks");

    mergeRules(grammarDefinitions["listContent"], "listInitiation");
    mergeRules(grammarDefinitions["listContent"], "contentState");

    mergeRules(grammarDefinitions["passthroughSection"], "macroDefinitions");
    mergeRules(grammarDefinitions["smallPassthroughSection"], "macroDefinitions");

    mergeRules(grammarDefinitions["tableSection"], "contentState", true);

    return grammarDefinitions;
  }

  const allSyntaxRules = createSyntaxDefinitions();
  const maximumTokenElements = 1000;

  function createSyntaxProcessor(ruleSet) {
    const compiledStatePatterns = {};

    for (const stateName in ruleSet) {
      if (ruleSet.hasOwnProperty(stateName)) {
        compiledStatePatterns[stateName] = ruleSet[stateName].map(rule => {
          let pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
          return {
            pattern: pattern,
            type: rule.type,
            nextState: rule.nextState
          };
        });
      }
    }

    function processLineForTokens(textLine, previousState) {
      let currentLexicalState = previousState || "initialState";
      let stateHistory = [];
      if (typeof currentLexicalState !== "string") {
          stateHistory = currentLexicalState.slice(0);
          currentLexicalState = stateHistory[0];
      }

      let componentList = [];
      let currentPosition = 0;
      let activeComponent = { type: null, value: "" };

      if (!compiledStatePatterns[currentLexicalState]) {
          currentLexicalState = "initialState";
      }

      while (currentPosition < textLine.length) {
        let bestMatch = null;
        let bestRule = null;
        let matchedLength = 0;

        const rulesForCurrentState = compiledStatePatterns[currentLexicalState];
        if (!rulesForCurrentState) {
            if (activeComponent.type === null) {
                activeComponent.type = "text";
            }
            activeComponent.value += textLine.substring(currentPosition);
            break;
        }

        for (let i = 0; i < rulesForCurrentState.length; i++) {
          const patternDescriptor = rulesForCurrentState[i];
          patternDescriptor.pattern.lastIndex = 0;
          const segmentMatch = patternDescriptor.pattern.exec(textLine.substring(currentPosition));

          if (segmentMatch && segmentMatch[0].length > 0) {
            bestMatch = segmentMatch;
            bestRule = patternDescriptor;
            matchedLength = segmentMatch[0].length;
            break;
          }
        }

        if (bestMatch) {
          if (bestMatch.index > 0) {
            const skippedText = textLine.substring(currentPosition, currentPosition + bestMatch.index);
            if (activeComponent.type === null) {
                activeComponent.type = "text";
            }
            activeComponent.value += skippedText;
            if (activeComponent.value.length > 0) {
                componentList.push(activeComponent);
            }
            activeComponent = { type: null, value: "" };
          }

          let matchedValue = bestMatch[0];
          let componentType = bestRule.type;

          if (Array.isArray(componentType)) {
            let groupIndex = 1;
            for (let k = 0; k < componentType.length; k++) {
                if (bestMatch[groupIndex]) {
                    if (activeComponent.type) {
                        componentList.push(activeComponent);
                        activeComponent = { type: null, value: "" };
                    }
                    componentList.push({ type: componentType[k], value: bestMatch[groupIndex] });
                }
                groupIndex++;
            }
            activeComponent = { type: null, value: "" };
          } else if (typeof componentType === "function") {
              const dynamicTokens = componentType.apply(null, bestMatch.slice(1));
              if (typeof dynamicTokens === "string") {
                  componentType = dynamicTokens;
              } else if (Array.isArray(dynamicTokens)) {
                  if (activeComponent.type) {
                      componentList.push(activeComponent);
                      activeComponent = { type: null, value: "" };
                  }
                  componentList.push(...dynamicTokens);
                  activeComponent = { type: null, value: "" };
              } else {
                  componentType = "text";
              }
          }

          if (activeComponent.type === componentType && !Array.isArray(componentType) && typeof componentType !== "function") {
            activeComponent.value += matchedValue;
          } else if (!Array.isArray(componentType) && typeof componentType !== "function") {
            if (activeComponent.type) {
              componentList.push(activeComponent);
            }
            activeComponent = { type: componentType, value: matchedValue };
          }

          if (bestRule.nextState) {
            let nextStateName = bestRule.nextState;
            if (typeof nextStateName === "function") {
                nextStateName = nextStateName(currentLexicalState, stateHistory);
            }
            if (currentLexicalState !== nextStateName) {
                stateHistory.unshift(currentLexicalState);
                currentLexicalState = nextStateName;
            }
          }

          currentPosition += bestMatch.index + matchedLength;

        } else {
          if (activeComponent.type === null) {
              activeComponent.type = "text";
          }
          activeComponent.value += textLine.substring(currentPosition);
          currentPosition = textLine.length;
        }

        if (componentList.length > maximumTokenElements) {
            while (currentPosition < textLine.length) {
                if (activeComponent.type) componentList.push(activeComponent);
                activeComponent = {
                    value: textLine.substring(currentPosition, currentPosition + 2000),
                    type: "overflow"
                };
                currentPosition += 2000;
                componentList.push(activeComponent);
                activeComponent = { type: null, value: "" };
            }
            currentLexicalState = "initialState";
            stateHistory = [];
            break;
        }
      }

      if (activeComponent.type || activeComponent.value) {
        componentList.push(activeComponent);
      }

      let finalState = currentLexicalState;
      if (stateHistory.length > 0) {
          if (stateHistory[0] !== currentLexicalState) {
              stateHistory.unshift(currentLexicalState);
          }
          finalState = stateHistory;
      }

      return {
        tokens: componentList,
        state: finalState
      };
    }

    return {
      token: processLineForTokens,
      startState: function() { return "initialState"; }
    };
  }

  return createSyntaxProcessor(allSyntaxRules);

});