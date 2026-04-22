/*
 * (c) 2023 GraphRender Solutions Inc.
 *
 * "Diagrammatic Flow Renderer"
 * A lightweight JavaScript library for generating visual diagrams from a concise text-based syntax.
 * Designed for readability and progressive enhancement.
 *
 * Example Syntax:
 *  (Initiator) ->commences (Process_A)
 *
 * Advanced Example:
 *  (Source {primary}) >>triggers (Target_1) ||
 *  (Target_1) ->routes (Target_2 [t2_id])
 *
 *
 * LICENSE: MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function(elementAccessor) {
    'use strict'; // Enforce strict mode

    // Core configuration for rendering and parsing
    const RENDER_CONFIG = {
        connection: {
            defaultColor: "#d3d3d3", // Light gray for standard connections
            highlightColor: "#3c3c3c" // Darker gray for emphasized connections
        },
        node: {
            baseWidth: 150,
            baseHeight: 35,
            extendedHeight: 60, // For nodes with subtitles
            verticalCenterOffset: 16,
            horizontalSpacing: 70, // Margin right
            verticalSpacing: 60, // Margin bottom
            borderThickness: 2
        },
        parser: {
            commentDelimiter: "//" // Single line comment marker
        }
    };

    const ELEMENT_NAMESPACE = "graphrender";
    // Generate a robust unique ID seed using timestamp and random component
    const ID_GENERATION_SEED = `${new Date().getTime()}_${Math.random().toString(36).substring(2)}`;
    let id_sequence_counter = 0;

    // Define characters that initiate different syntactic elements
    const CONNECTION_STARTERS = ["<", ">", "-"];
    const ENTITY_STARTERS = ["("];

    // Map defining valid termination characters for each starting element
    const ELEMENT_TERMINATORS = new Map([
        ["(", [")"]],
        ["<", [" <", " >", " -", " (", " ["]], // Added '[' for targets
        ["-", [" <", " >", " -", " (", " ["]],
        [">", [" <", " >", " -", " (", " ["]]
    ]);

    // Utility function to generate a truly unique identifier for elements
    const acquireUniqueEntityId = () => {
        const generatedId = `${ID_GENERATION_SEED}_${ELEMENT_NAMESPACE}_${id_sequence_counter}`;
        id_sequence_counter++;
        return generatedId;
    };

    /**
     * List of characters with special syntactic meaning that require escaping.
     * Stored as [original_char, escape_token_name].
     */
    const SYNTAX_ESCAPE_LIST = [
        ["<", "LT_TOK"], [">", "GT_TOK"], ["-", "HYPH_TOK"], ["|", "PIPE_TOK"],
        ["{", "BRACE_OPEN_TOK"], ["}", "BRACE_CLOSE_TOK"], ["[", "SQBRACK_OPEN_TOK"],
        ["]", "SQBRACK_CLOSE_TOK"], ["(", "PAREN_OPEN_TOK"], [")", "PAREN_CLOSE_TOK"],
        [":", "COLON_TOK"], ["/", "SLASH_TOK"]
    ];

    /**
     * Generates a unique escape string for a given token name.
     * @param {string} tokenName - The name of the escape token.
     * @returns {string} The formatted escape string.
     */
    const formatEscapeToken = (tokenName) => `%ESC_${tokenName}_%`;

    /**
     * Creates an array of [original, escaped] pairs for bulk replacement.
     */
    const buildEscapeReplacements = () =>
        SYNTAX_ESCAPE_LIST.flatMap(([char, token]) => [char, formatEscapeToken(token)]);

    /**
     * Creates an array of [escaped, original] pairs for bulk replacement.
     */
    const buildUnescapeReplacements = () =>
        SYNTAX_ESCAPE_LIST.flatMap(([char, token]) => [formatEscapeToken(token), char]);

    const globalEscapeReplacements = buildEscapeReplacements();
    const globalUnescapeReplacements = buildUnescapeReplacements();

    /**
     * Performs bulk string replacements.
     * @param {string} text - The input string.
     * @param {Array<string>} replacements - An array of [search, replace] pairs.
     * @returns {string} The string with all replacements applied.
     */
    const applyBulkReplacements = (text, replacements) => {
        let result = text;
        for (let i = 0; i < replacements.length; i += 2) {
            const search = replacements[i];
            const replace = replacements[i + 1];
            result = result.split(search).join(replace);
        }
        return result;
    };

    /**
     * Processes raw input lines to construct the graph's structural data.
     * @param {Array<string>} inputRows - An array of text lines describing the graph.
     * @returns {{entities: Array<Array<Object>>, connections: Array<Object>}} The parsed graph structure.
     */
    const processInputGraphData = (inputRows) => {
        if (!Array.isArray(inputRows) || inputRows.length === 0) {
            console.warn("No input rows provided for graph processing.");
            return { entities: [], connections: [] };
        }

        const allEntities = []; // Stores arrays of nodes per line
        const allConnections = [];

        inputRows.forEach((row, rowIndex) => {
            const processedRow = row.trim();
            if (processedRow.length === 0) return; // Skip empty lines

            try {
                const parsedRowData = analyzeSingleGraphRow(processedRow);
                if (parsedRowData.entities.length > 0) {
                    allEntities.push(parsedRowData.entities);
                }
                allConnections.push(...parsedRowData.connections);
            } catch (error) {
                console.error(`Parsing error on row ${rowIndex + 1}: ${restoreOriginalText(processedRow)} - ${error.message}`);
                // Optionally re-throw or handle error more gracefully
            }
        });

        return { entities: allEntities, connections: allConnections };
    };

    /**
     * Parses a single line of graph definition, identifying entities and connections.
     * @param {string} currentRowText - The text of the current line.
     * @returns {{entities: Array<Object>, connections: Array<Object>}} Parsed entities and connections for the line.
     */
    const analyzeSingleGraphRow = (currentRowText) => {
        const originalRow = currentRowText;
        let workingText = performTextEscaping(currentRowText);

        // Remove comments from the line
        const commentIndex = workingText.indexOf(RENDER_CONFIG.parser.commentDelimiter);
        if (commentIndex !== -1) {
            workingText = workingText.substring(0, commentIndex).trim();
        }

        const lineEntities = [];
        let lineConnections = [];
        let lastEntityId = "";

        // Iterate through the line to find and parse elements
        while (workingText.length > 0) {
            const nextTokenInfo = findNextSyntacticToken([...CONNECTION_STARTERS, ...ENTITY_STARTERS], workingText);

            if (!nextTokenInfo) break; // No more recognized tokens

            const [tokenChar, tokenPosition] = nextTokenInfo;
            workingText = workingText.substring(tokenPosition + 1); // Advance past the token

            const terminationPoint = determineElementTerminationPoint(tokenChar, workingText);
            if (terminationPoint === -1) {
                throw new Error(`Incomplete element definition starting with '${tokenChar}'.`);
            }

            const elementContent = workingText.substring(0, terminationPoint).trim();
            workingText = workingText.substring(terminationPoint + 1).trim(); // Advance past the element

            switch (tokenChar) {
                case "(": {
                    const newEntity = interpretNodeDefinition(elementContent);
                    // Connect any pending arrows to this new entity
                    lineConnections = lineConnections.map(conn => {
                        if (conn.targetNodeIds.length === 0) {
                            return { ...conn, targetNodeIds: [newEntity.identifier] };
                        }
                        return conn;
                    });
                    lastEntityId = newEntity.identifier;
                    lineEntities.push(newEntity);
                    lineConnections.push(...extractInternalNodeConnections(newEntity.identifier, elementContent));
                    break;
                }
                case "<":
                case "-":
                case ">": {
                    if (!lastEntityId) {
                        throw new Error(`Connection '${tokenChar}${elementContent}' found before any entity.`);
                    }
                    lineConnections.push(decomposeConnectionSyntax(tokenChar, lastEntityId, elementContent, false));
                    break;
                }
                default:
                    // Should not happen if `findNextSyntacticToken` is correct
                    throw new Error(`Unrecognized starting token '${tokenChar}'.`);
            }
        }

        // Validate that the last connection (if any) has a target
        const lastConnection = lineConnections[lineConnections.length - 1];
        if (lastConnection && lastConnection.targetNodeIds.length === 0) {
            throw new Error("Last connection in line has no specified target.");
        }

        return { entities: lineEntities, connections: lineConnections };
    };

    /**
     * Determines the earliest occurrence of any specified token in a string.
     * @param {Array<string>} tokenArray - List of tokens to search for.
     * @param {string} sourceText - The string to search within.
     * @returns {[string, number] | null} An array containing the found token and its position, or null if none found.
     */
    const findNextSyntacticToken = (tokenArray, sourceText) => {
        let earliestPosition = -1;
        let foundToken = "";

        for (const token of tokenArray) {
            const currentPosition = sourceText.indexOf(token);
            if (currentPosition !== -1 && (earliestPosition === -1 || currentPosition < earliestPosition)) {
                earliestPosition = currentPosition;
                foundToken = token;
            }
        }
        return earliestPosition !== -1 ? [foundToken, earliestPosition] : null;
    };

    /**
     * Extracts connection definitions embedded within an entity's source string.
     * @param {string} parentEntityId - The identifier of the entity containing these connections.
     * @param {string} entitySourceText - The full source string of the entity.
     * @returns {Array<Object>} An array of parsed connection objects.
     */
    const extractInternalNodeConnections = (parentEntityId, entitySourceText) => {
        const internalConnections = [];
        let currentSourceFragment = entitySourceText;

        // Find the start of the actual content after an optional ID/class definition
        const idSeparatorPos = currentSourceFragment.indexOf(":");
        if (idSeparatorPos !== -1) {
            currentSourceFragment = currentSourceFragment.substring(idSeparatorPos);
        }

        while (true) {
            const nextConnToken = findNextSyntacticToken(CONNECTION_STARTERS, currentSourceFragment);
            if (!nextConnToken) break;

            const [connChar, connPos] = nextConnToken;
            currentSourceFragment = currentSourceFragment.substring(connPos + 1); // Move past connection starter

            const termPoint = determineElementTerminationPoint(connChar, currentSourceFragment);
            if (termPoint === -1) {
                console.warn(`Malformed internal connection in entity ${parentEntityId}: ${currentSourceFragment}`);
                break; // Skip this malformed connection
            }
            const connContent = currentSourceFragment.substring(0, termPoint);
            internalConnections.push(decomposeConnectionSyntax(connChar, parentEntityId, connContent, true)); // Internal connections *must* have targets
            currentSourceFragment = currentSourceFragment.substring(termPoint); // Move past connection content
        }
        return internalConnections;
    };

    /**
     * Applies escape token replacements to a given source string.
     * @param {string} sourceText - The string to escape.
     * @returns {string} The escaped string.
     */
    const performTextEscaping = (sourceText) => {
        let resultText = sourceText;
        const escapeBlockRegex = /\{\{([^}]*?)\}\}/g; // Non-greedy match for content inside {{...}}

        // Replace all escape blocks in one go using a replacer function
        resultText = resultText.replace(escapeBlockRegex, (match, content) => {
            return applyBulkReplacements(content, globalEscapeReplacements);
        });
        return resultText;
    };

    /**
     * Reverts escape token replacements in a string to their original characters.
     * @param {string} escapedText - The string with escape tokens.
     * @returns {string} The original, unescaped string.
     */
    const restoreOriginalText = (escapedText) => {
        return applyBulkReplacements(escapedText, globalUnescapeReplacements);
    };

    /**
     * Parses a single connection definition.
     * @param {string} connectionTypeChar - The character indicating connection type ('<', '>', '-').
     * @param {string} originEntityId - The ID of the source entity.
     * @param {string} connectionSourceFragment - The source string for the connection (after the type char).
     * @param {boolean} requiresTargets - True if the connection must explicitly define targets.
     * @returns {Object} A structured object representing the connection.
     */
    const decomposeConnectionSyntax = (connectionTypeChar, originEntityId, connectionSourceFragment, requiresTargets) => {
        let currentFragment = connectionSourceFragment.trim();
        const initialFragment = currentFragment; // For error messages

        // Check for emphasized connection (e.g., ">>" or "<<")
        const isEmphasized = currentFragment.startsWith(connectionTypeChar);
        if (isEmphasized) {
            currentFragment = currentFragment.substring(1).trim();
        }

        // Check for bi-directional indication (e.g., "<>" or "><")
        let isBiDirectional = false;
        if ((connectionTypeChar === "<" && currentFragment.startsWith(">")) ||
            (connectionTypeChar === ">" && currentFragment.startsWith("<"))) {
            isBiDirectional = true;
            currentFragment = currentFragment.substring(1).trim();
        }
        // Consume any additional direction indicators (e.g., ">>>")
        while (currentFragment.startsWith(">") || currentFragment.startsWith("<")) {
            currentFragment = currentFragment.substring(1).trim();
        }

        let connectionLabel = "";
        let targetEntityIds = [];

        if (requiresTargets) {
            const targetListStart = currentFragment.lastIndexOf("[");
            const targetListEnd = currentFragment.lastIndexOf("]");

            if (targetListStart === -1 || targetListEnd === -1 || targetListEnd < targetListStart) {
                throw new Error(`Missing or malformed target list for connection: '${connectionTypeChar}${initialFragment}'`);
            }
            if (targetListEnd !== currentFragment.length - 1) {
                console.warn(`Unexpected characters after target list in connection: '${connectionTypeChar}${initialFragment}'. Ignoring: '${currentFragment.substring(targetListEnd + 1)}'`);
            }

            connectionLabel = currentFragment.substring(0, targetListStart).trim();
            const rawTargets = currentFragment.substring(targetListStart + 1, targetListEnd).trim();

            if (rawTargets.length === 0) {
                throw new Error(`No targets specified within brackets for connection: '${connectionTypeChar}${initialFragment}'`);
            }
            targetEntityIds = rawTargets.split(",").map(id => id.trim()).filter(id => id.length > 0);

        } else {
            // If targets are not strictly required (e.g., end-of-line arrows), the whole fragment is the label
            connectionLabel = currentFragment;
        }

        return {
            connectionType: connectionTypeChar,
            emphasized: isEmphasized,
            twoWay: isBiDirectional,
            sourceEntity: originEntityId,
            targetNodeIds: targetEntityIds, // Renamed for clarity
            label: connectionLabel
        };
    };

    /**
     * Parses an entity (node) definition from its source string.
     * Does NOT parse internal connections; use `extractInternalNodeConnections` for that.
     * @param {string} entitySourceText - The source string for the entity (after the '(').
     * @returns {Object} A structured object representing the entity.
     */
    const interpretNodeDefinition = (entitySourceText) => {
        let currentSource = entitySourceText.trim();

        // First, remove any internal connection definitions to isolate node properties
        const idAndContentSeparator = currentSource.indexOf(":");
        let contentAfterId = idAndContentSeparator !== -1 ? currentSource.substring(idAndContentSeparator + 1) : currentSource;

        const firstInternalArrowStart = findNextSyntacticToken(CONNECTION_STARTERS, contentAfterId);
        if (firstInternalArrowStart) {
            // Trim content after the first internal arrow definition
            currentSource = currentSource.substring(0, (idAndContentSeparator !== -1 ? idAndContentSeparator + 1 : 0) + firstInternalArrowStart[1]);
        }
        currentSource = currentSource.trim();


        // Check for emphasized entity (e.g., "((" )
        const isEmphasizedEntity = currentSource.startsWith("(");
        if (isEmphasizedEntity) {
            currentSource = currentSource.substring(1).trim();
        }

        let entityId = "";
        let cssClasses = "";
        const idClassSeparator = currentSource.indexOf(":");

        if (idClassSeparator !== -1) {
            let idPart = currentSource.substring(0, idClassSeparator).trim();
            const classBracketStart = idPart.indexOf("{");
            const classBracketEnd = idPart.indexOf("}");

            if (classBracketStart !== -1 && classBracketEnd === idPart.length - 1 && classBracketEnd > classBracketStart) {
                cssClasses = idPart.substring(classBracketStart + 1, classBracketEnd).trim();
                entityId = idPart.substring(0, classBracketStart).trim();
            } else {
                entityId = idPart;
            }
            currentSource = currentSource.substring(idClassSeparator + 1).trim();
        }

        // Assign unique ID if not explicitly provided
        if (!entityId) {
            entityId = acquireUniqueEntityId();
        }

        let entityTitle = "";
        let entitySubtitle = "";
        let isPlaceholder = false; // Renamed from is_dummy

        if (currentSource.length === 0) {
            isPlaceholder = true;
        } else {
            const subtitleSeparator = currentSource.indexOf("|");
            if (subtitleSeparator !== -1) {
                entityTitle = currentSource.substring(0, subtitleSeparator).trim();
                entitySubtitle = currentSource.substring(subtitleSeparator + 1).trim();
            } else {
                entityTitle = currentSource;
            }
        }

        return {
            identifier: entityId, // Renamed from 'id'
            emphasized: isEmphasizedEntity,
            isPlaceholder: isPlaceholder,
            customClasses: cssClasses,
            mainTitle: entityTitle,
            subText: entitySubtitle
        };
    };

    /**
     * Determines the termination point (index) for an element within a source string.
     * @param {string} startingChar - The character that initiated the element.
     * @param {string} sourceText - The remaining source string after the starting character.
     * @returns {number} The index of the termination point, or -1 if no valid terminator is found.
     */
    const determineElementTerminationPoint = (startingChar, sourceText) => {
        const potentialTerminators = ELEMENT_TERMINATORS.get(startingChar);
        if (!potentialTerminators || potentialTerminators.length === 0) {
            console.error(`No defined terminators for element starting with '${startingChar}'.`);
            return -1; // Indicate error or no termination
        }

        let earliestTerminatorPos = -1;

        for (const terminator of potentialTerminators) {
            const currentPos = sourceText.indexOf(terminator);
            if (currentPos !== -1 && (earliestTerminatorPos === -1 || currentPos < earliestTerminatorPos)) {
                earliestTerminatorPos = currentPos;
            }
        }
        return earliestTerminatorPos !== -1 ? earliestTerminatorPos : sourceText.length;
    };

    /**
     * Calculates the squared Euclidean distance between two points.
     * @param {number} p1x - X coordinate of point 1.
     * @param {number} p1y - Y coordinate of point 1.
     * @param {number} p2x - X coordinate of point 2.
     * @param {number} p2y - Y coordinate of point 2.
     * @returns {number} The squared distance.
     */
    const calculateSquaredDistance = (p1x, p1y, p2x, p2y) => {
        const dx = p1x - p2x;
        const dy = p1y - p2y;
        return dx * dx + dy * dy;
    };

    /**
     * Computes the intersection point of two line segments.
     * @param {number} ax, ay - Coordinates of the first point of the first segment.
     * @param {number} bx, by - Coordinates of the second point of the first segment.
     * @param {number} ex, ey - Coordinates of the first point of the second segment.
     * @param {number} fx, fy - Coordinates of the second point of the second segment.
     * @param {boolean} asSegments - If true, treats lines as segments; otherwise, as infinite lines.
     * @returns {Array<number> | null} [x, y] coordinates of the intersection, or null if no intersection.
     */
    const computeLineSegmentIntersection = (ax, ay, bx, by, ex, ey, fx, fy, asSegments) => {
        let intersectionX = 0;
        let intersectionY = 0;

        const a1 = by - ay;
        const b1 = ax - bx;
        const c1 = bx * ay - ax * by;
        const a2 = fy - ey;
        const b2 = ex - fx;
        const c2 = fx * ey - ex * fy;

        const determinant = a1 * b2 - a2 * b1;
        if (determinant === 0) {
            return null; // Lines are parallel or collinear
        }

        intersectionX = (b1 * c2 - b2 * c1) / determinant;
        intersectionY = (a2 * c1 - a1 * c2) / determinant;

        if (asSegments) {
            // Check if intersection point lies within both segments
            const withinSegment1 =
                calculateSquaredDistance(intersectionX, intersectionY, bx, by) <= calculateSquaredDistance(ax, ay, bx, by) &&
                calculateSquaredDistance(intersectionX, intersectionY, ax, ay) <= calculateSquaredDistance(ax, ay, bx, by);

            const withinSegment2 =
                calculateSquaredDistance(intersectionX, intersectionY, fx, fy) <= calculateSquaredDistance(ex, ey, fx, fy) &&
                calculateSquaredDistance(intersectionX, intersectionY, ex, ey) <= calculateSquaredDistance(ex, ey, fx, fy);

            if (!withinSegment1 || !withinSegment2) {
                return null;
            }
        }
        return [intersectionX, intersectionY];
    };

    // The 'centerNodes' function from the original was commented out as unused
    // and noted to have a jQuery Webkit bug. It's a good candidate for removal
    // in a Type III clone to simplify the codebase. If it were to be kept,
    // it would need a complete rewrite with modern DOM manipulation and layout techniques.

    /**
     * Renders the visual representation of the graph structure into the DOM.
     * This is a stub, as the original was also incomplete.
     * @param {Object} graphStructure - The parsed graph data ({entities, connections}).
     * @param {HTMLElement} containerElement - The DOM element where the graph will be rendered.
     */
    const renderVisualGraph = (graphStructure, containerElement) => {
        if (!graphStructure || !containerElement) {
            console.error("Cannot render graph: Missing structure or container element.");
            return;
        }

        const { entities, connections } = graphStructure;
        const entityPositions = new Map(); // To store calculated positions of entities

        // Placeholder for actual rendering logic:
        // 1. Create DOM elements for nodes based on 'entities'
        // 2. Position them (this would involve a layout algorithm)
        // 3. Store their positions in 'entityPositions'
        // 4. Draw SVG paths or canvas lines for 'connections' using 'entityPositions'

        // Example of creating node elements (very basic stub)
        entities.flat().forEach(entity => {
            const nodeDiv = elementAccessor('<div></div>'); // Use jQuery or equivalent
            nodeDiv.attr('id', `${ELEMENT_NAMESPACE}-${entity.identifier}`);
            nodeDiv.addClass(`${ELEMENT_NAMESPACE}-node ${entity.customClasses}`);
            nodeDiv.html(`<h3>${restoreOriginalText(entity.mainTitle)}</h3>${entity.subText ? `<p>${restoreOriginalText(entity.subText)}</p>` : ''}`);
            // Append to container, then calculate position
            // containerElement.append(nodeDiv);
            // entityPositions.set(entity.identifier, { x: ..., y: ..., width: ..., height: ... });
        });

        console.log("Graph rendering initiated (stub). Entities:", entities, "Connections:", connections);
        // ... further rendering logic would go here ...
    };

    // Expose the main rendering function
    if (typeof elementAccessor !== 'undefined' && typeof elementAccessor.fn !== 'undefined') {
        // Assume jQuery context
        elementAccessor.fn.diagrammaticFlowRenderer = function(inputData) {
            return this.each(function() {
                const processedGraph = processInputGraphData(inputData);
                renderVisualGraph(processedGraph, this);
            });
        };
    } else {
        // Fallback or non-jQuery environment
        window.DiagrammaticFlowRenderer = {
            render: (container, inputData) => {
                const processedGraph = processInputGraphData(inputData);
                renderVisualGraph(processedGraph, container);
            },
            parse: processInputGraphData // Expose parsing for debugging/testing
        };
    }

})(typeof jQuery !== 'undefined' ? jQuery : null); // Pass jQuery or null if not available