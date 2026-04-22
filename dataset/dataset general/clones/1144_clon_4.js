(function() {
    const GRAPH_SETTINGS = {
        "link": {
            "visual_normal": "#cacaca",
            "visual_highlighted": "#4a4a4a"
        },
        "block": {
            "width_val": 146,
            "height_val": 32,
            "tall_height_val": 56,
            "vertical_align": 15,
            "right_spacing": 64,
            "bottom_spacing": 56,
            "border_width": 2
        }
    };

    const ELEMENT_PREFIX = "diagramentity";
    let GLOBAL_ENTITY_TAG = "" + new Date().getTime();
    let ENTITY_COUNTER = 0;

    const LINK_INITIATORS = new Set(["<", ">", "-"]);
    const COMPONENT_INITIATORS = new Set(["("]);

    const CLOSING_DELIMITERS = new Map([
        ["(", [")"]],
        ["<", [" <", " >", " -", " ("]],
        ["-", [" <", " >", " -", " ("]],
        [">", [" <", " >", " -", " ("]]
    ]);

    const obtainUniqueTag = () => {
        const identifier = `${GLOBAL_ENTITY_TAG}_${ELEMENT_PREFIX}${ENTITY_COUNTER}`;
        ENTITY_COUNTER++;
        return identifier;
    };

    const SPECIAL_SYMBOLS_MAP = [
        ["<", "L_ANGLE"],
        [">", "R_ANGLE"],
        ["-", "HYPHEN"],
        ["|", "PIPE"],
        ["{", "L_BRACE"],
        ["}", "R_BRACE"],
        ["[", "L_BRACKET"],
        ["]", "R_BRACKET"],
        ["(", "L_PAREN"],
        [")", "R_PAREN"],
        [":", "COLON"],
        ["/", "SLASH"]
    ];

    const ENCODE_RULES = new Map(SPECIAL_SYMBOLS_MAP.map(([char, name]) => [char, `_E_${name}_E_`]));
    const DECODE_RULES = new Map(SPECIAL_SYMBOLS_MAP.map(([char, name]) => [`_E_${name}_E_`, char]));

    const performMultiReplace = (inputString, replacementMap) => {
        let outputString = inputString;
        for (const [key, value] of replacementMap.entries()) {
            outputString = outputString.split(key).join(value);
        }
        return outputString;
    };

    const applySymbolEncoding = (rawText) => {
        let workingText = rawText;
        let match;
        const regex = /\{\{(.*?)\}\}/g;
        while ((match = regex.exec(workingText)) !== null) {
            const originalBlock = match[0];
            const contentToEncode = match[1];
            const encodedContent = performMultiReplace(contentToEncode, ENCODE_RULES);
            workingText = workingText.replace(originalBlock, encodedContent);
        }
        return workingText;
    };

    const revertSymbolEncoding = (encodedText) => {
        return performMultiReplace(encodedText, DECODE_RULES);
    };

    const stripWhitespace = (text) => text.trim();

    const locateNextToken = (tokenSet, sourceText, startPoint = 0) => {
        let earliestPosition = -1;
        let tokenType = "";

        for (const token of tokenSet) {
            const currentPos = sourceText.indexOf(token, startPoint);
            if (currentPos !== -1 && (earliestPosition === -1 || currentPos < earliestPosition)) {
                earliestPosition = currentPos;
                tokenType = token;
            }
        }
        return earliestPosition !== -1 ? [tokenType, earliestPosition] : null;
    };

    const findClosingPoint = (startToken, sourceText) => {
        const possibleClosers = CLOSING_DELIMITERS.get(startToken);
        if (!possibleClosers || possibleClosers.length === 0) {
            throw new Error(`No closing sequences defined for starting token '${startToken}'`);
        }

        let endPosition = -1;
        for (const closer of possibleClosers) {
            const currentPos = sourceText.indexOf(closer);
            if (currentPos !== -1 && (endPosition === -1 || currentPos < endPosition)) {
                endPosition = currentPos;
            }
        }
        return endPosition !== -1 ? endPosition : sourceText.length;
    };

    const constructElement = (componentSource) => {
        let workingSource = componentSource;
        const isProminent = workingSource.startsWith("(");
        if (isProminent) {
            workingSource = stripWhitespace(workingSource.substring(1));
        }

        let entityIdentifier = "";
        let customStyle = "";
        const colonSplit = workingSource.indexOf(":");

        if (colonSplit !== -1) {
            let identifierPart = stripWhitespace(workingSource.substring(0, colonSplit));
            const braceOpen = identifierPart.indexOf("{");
            const braceClose = identifierPart.indexOf("}");

            if (braceOpen !== -1 && braceClose === identifierPart.length - 1) {
                customStyle = stripWhitespace(identifierPart.substring(braceOpen + 1, braceClose));
                entityIdentifier = stripWhitespace(identifierPart.substring(0, braceOpen));
            } else {
                entityIdentifier = identifierPart;
            }
            workingSource = stripWhitespace(workingSource.substring(colonSplit + 1));
        }

        if (entityIdentifier === "") {
            entityIdentifier = obtainUniqueTag();
        }

        let mainLabel = "";
        let subLabel = "";
        let isPlaceholder = false;

        if (workingSource.length === 0) {
            isPlaceholder = true;
        } else {
            const pipeSplit = workingSource.indexOf("|");
            if (pipeSplit !== -1) {
                mainLabel = stripWhitespace(workingSource.substring(0, pipeSplit));
                subLabel = stripWhitespace(workingSource.substring(pipeSplit + 1));
            } else {
                mainLabel = workingSource;
            }
        }

        return {
            "tag": entityIdentifier,
            "prominent": isProminent,
            "is_placeholder": isPlaceholder,
            "custom_style": customStyle,
            "main_label": mainLabel,
            "sub_label": subLabel
        };
    };

    const synthesizeConnection = (linkType, originTag, linkSource, requiresTargets) => {
        let workingSource = stripWhitespace(linkSource);
        const initialSource = workingSource;

        let isProminent = false;
        if (workingSource.startsWith(linkType)) {
            isProminent = true;
            workingSource = stripWhitespace(workingSource.substring(1));
        }

        let bidirectional = false;
        if ((linkType === "<" && workingSource.startsWith(">")) || (linkType === ">" && workingSource.startsWith("<"))) {
            bidirectional = true;
        }
        while (workingSource.startsWith(">") || workingSource.startsWith("<")) {
            workingSource = workingSource.substring(1);
        }
        workingSource = stripWhitespace(workingSource);

        let linkLabel = "";
        let linkTargets = [];

        if (requiresTargets) {
            const targetListStart = workingSource.lastIndexOf("[");
            const targetListEnd = workingSource.lastIndexOf("]");
            if (targetListStart === -1) {
                throw new Error(`No target list for link '${linkType}${initialSource}'`);
            }
            if (targetListEnd < targetListStart) {
                throw new Error(`Link definition improperly closed: '${initialSource}'`);
            }
            if (targetListEnd !== workingSource.length - 1) {
                throw new Error(`Unexpected content after target list in link definition: '${initialSource}'`);
            }

            const labelCandidate = workingSource.substring(0, targetListStart);
            const targetsCandidate = workingSource.substring(targetListStart + 1, targetListEnd);

            if (targetsCandidate.length === 0) {
                throw new Error(`Empty target list for link: ${linkType}${initialSource}`);
            }

            linkLabel = stripWhitespace(labelCandidate);
            linkTargets = targetsCandidate.split(",").map(stripWhitespace);
        } else {
            linkLabel = workingSource;
        }

        return {
            "kind": linkType,
            "prominent": isProminent,
            "bidirectional": bidirectional,
            "origin_tag": originTag,
            "destination_tags": linkTargets,
            "description": linkLabel
        };
    };

    const extractInternalLinks = (componentTag, componentSource) => {
        const internalLinks = [];
        let workingSource = componentSource;
        let currentOffset = 0;

        while (true) {
            const nextArrowStart = locateNextToken(LINK_INITIATORS, workingSource, currentOffset);
            if (!nextArrowStart) break;

            const [arrowChar, arrowPos] = nextArrowStart;
            currentOffset = arrowPos;

            const contentAfterArrowChar = workingSource.substring(currentOffset + 1);
            const endOfArrowContent = findClosingPoint(arrowChar, contentAfterArrowChar);
            const arrowContent = contentAfterArrowChar.substring(0, endOfArrowContent);

            internalLinks.push(synthesizeConnection(arrowChar, componentTag, arrowContent, true));
            currentOffset += 1 + endOfArrowContent;
        }
        return internalLinks;
    };

    const analyzeStatement = (inputStatement) => {
        const originalStatement = inputStatement;
        let currentStatement = applySymbolEncoding(inputStatement);

        const commentStart = currentStatement.indexOf("//");
        if (commentStart !== -1) {
            currentStatement = currentStatement.substring(0, commentStart);
        }
        currentStatement = stripWhitespace(currentStatement);

        const statementComponents = [];
        let statementLinks = [];
        let lastComponentTag = "";
        let cursorPosition = 0;

        try {
            while (cursorPosition < currentStatement.length) {
                const nextElement = locateNextToken(new Set([...LINK_INITIATORS, ...COMPONENT_INITIATORS]), currentStatement, cursorPosition);
                if (!nextElement) break;

                const [elementType, elementStartPos] = nextElement;

                cursorPosition = elementStartPos + 1;
                const contentAfterStart = currentStatement.substring(cursorPosition);
                const elementEndPos = findClosingPoint(elementType, contentAfterStart);
                const elementContent = stripWhitespace(contentAfterStart.substring(0, elementEndPos));

                switch (elementType) {
                    case "(":
                        let nodeSourceForComponent = elementContent;
                        let nodeSourceForLinks = elementContent;

                        const searchArrowOffset = nodeSourceForComponent.indexOf(":");
                        const effectiveSearchOffset = searchArrowOffset !== -1 ? searchArrowOffset : 0;
                        const internalArrowIndicator = locateNextToken(LINK_INITIATORS, nodeSourceForComponent, effectiveSearchOffset);
                        if (internalArrowIndicator) {
                            nodeSourceForComponent = nodeSourceForComponent.substring(0, internalArrowIndicator[1]);
                        }

                        const newComponent = constructElement(nodeSourceForComponent);
                        
                        statementLinks.forEach(link => {
                            if (link.destination_tags.length === 0) {
                                link.destination_tags.push(newComponent.tag);
                            }
                        });
                        
                        lastComponentTag = newComponent.tag;
                        statementComponents.push(newComponent);
                        
                        statementLinks = statementLinks.concat(extractInternalLinks(newComponent.tag, nodeSourceForLinks));
                        break;
                    case "<":
                    case "-":
                    case ">":
                        if (statementComponents.length === 0) {
                            throw new Error(`Link '${elementType}${elementContent}' before any component defined`);
                        }
                        statementLinks.push(synthesizeConnection(elementType, lastComponentTag, elementContent, false));
                        break;
                }
                cursorPosition += elementEndPos;
            }

            const pendingLinks = statementLinks.filter(link => link.destination_tags.length === 0);
            if (pendingLinks.length > 0) {
                throw new Error(`Last link in line has no destination: '${revertSymbolEncoding(originalStatement)}'`);
            }

            return { "blocks": statementComponents, "links": statementLinks };
        } catch (e) {
            throw new Error(`Processing error in statement: ${revertSymbolEncoding(originalStatement)}\n  ${e.message}`);
        }
    };

    const processDiagramInput = (inputLines) => {
        let allComponents = [];
        let allLinks = [];

        for (let i = 0; i < inputLines.length; i++) {
            const lineText = inputLines[i];
            if (stripWhitespace(lineText).length === 0) continue;

            const parsedLine = analyzeStatement(lineText);
            if (parsedLine["blocks"].length !== 0) {
                allComponents.push(parsedLine["blocks"]);
            }
            allLinks = allLinks.concat(parsedLine["links"]);
        }

        return { "blocks": allComponents, "links": allLinks };
    };

    // The original code does not expose its functions globally outside the IIFE.
    // To maintain Type IV cloning, this clone also does not expose anything.
    // If you need to use `processDiagramInput`, you would need to modify this IIFE
    // to return it or assign it to a global object, e.g.:
    // `window.diagramProcessor = processDiagramInput;`
})();