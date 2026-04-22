// This file provides a set of utilities for transforming arrays of sentence tokens
// into a hierarchical graph structure, primarily for interactive lexical visualization.
// The core logic focuses on identifying word continuations and their frequencies
// to build a navigable data model suitable for rendering as a "word tree".

// (c) 2023 LexiGraph Developers. All rights reserved under the MIT License.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


// --- Core Configuration and Visualization Constants ---
const GraphSettings = Object.freeze({
    STARTING_DEPTH: 1,
    PRUNING_PERCENTAGE_THRESHOLD: 50, // Controls how aggressive node pruning is (e.g., 50 means keep top 50% by frequency)
    MINIMUM_VISUAL_SCALE: 12,
    MAXIMUM_VISUAL_SCALE: 30,
    TERMINAL_NODE_SCALE: 10,
    ROOT_NODE_INITIAL_SCALE: 25,
    FLOW_DIRECTION_LEFT: 'LEFT_CONTEXT',
    FLOW_DIRECTION_RIGHT: 'RIGHT_CONTEXT',
    DEFAULT_NODE_COLOR: 'black',
    TERMINAL_NODE_COLOR: '#999',
    VISUALIZER_DOM_ID: 'lexical-graph-renderer'
});

// A mock implementation for the external WordTree visualization library.
// In a production environment, this would be an actual library import.
const WordTreeRenderer = function(identification, targetElement, viewportWidth, viewportHeight, renderSurface) {
    if (!(targetElement instanceof HTMLElement)) {
        console.warn("WordTreeRenderer: Provided targetElement is not a valid DOM element.");
        return null;
    }
    this.instanceId = identification;
    this.displayTarget = targetElement;
    this.canvasWidth = viewportWidth;
    this.canvasHeight = viewportHeight;
    this.drawingSurface = renderSurface; // e.g., a Raphael.js paper object or D3 SVG container
    this.configuration = {
        rootFlow: null // Will be set to GraphSettings.FLOW_DIRECTION_LEFT or RIGHT
    };
    this.nodeRegistry = [];

    // Method to add a node to the internal registry
    this.add = function(nodeUniqueId, parentNodeUniqueId, contentString, visualScale, nodeColor = GraphSettings.DEFAULT_NODE_COLOR) {
        this.nodeRegistry.push({ nodeUniqueId, parentNodeUniqueId, contentString, visualScale, nodeColor });
        // In a real library, this would trigger rendering updates.
    };

    // Method to trigger the visualization update
    this.UpdateTree = function() {
        // This method would contain the actual rendering logic using the nodeRegistry.
        // For this clone, it serves as a functional placeholder.
    };

    // Exposing constants for external comparison within the cloning logic
    this.RO_LEFT = GraphSettings.FLOW_DIRECTION_LEFT;
    this.RO_RIGHT = GraphSettings.FLOW_DIRECTION_RIGHT;
};


/**
 * Builds a structured lexical graph from an array of tokenized sentences.
 * This function identifies word sequences, their frequencies, and nested continuations.
 *
 * @param {Array<Array<string>>} sentenceTokensList - An array where each element is an array of words (tokens).
 * @param {number} currentGraphDepth - The current recursion depth for graph construction.
 * @param {number} pruningThreshold - A percentage (0-100) used to prune less frequent nodes.
 * @param {string} graphFlowDirection - The directional context (e.g., GraphSettings.FLOW_DIRECTION_LEFT).
 * @returns {Array<Object>} An array of graph nodes, sorted by their frequency, representing the constructed graph.
 */
function constructLexicalGraph(sentenceTokensList, currentGraphDepth, pruningThreshold, graphFlowDirection) {
    if (!Array.isArray(sentenceTokensList) || sentenceTokensList.length === 0) {
        return []; // Early exit for invalid or empty input
    }

    const nodeFrequencyMap = new Map();
    let maximumObservedFrequency = 0;

    // First pass: populate the frequency map and identify continuations
    for (const tokenSequence of sentenceTokensList) {
        let activeSequence = [...tokenSequence]; // Work with a copy to avoid side effects

        // Skip empty sequences or sequences that become empty after initial processing
        if (activeSequence.length === 0) {
            continue;
        }

        let initialToken = activeSequence[0];
        // Handle cases where the first token might be empty/null (e.g., from prior slicing)
        while (!initialToken && activeSequence.length > 0) {
            activeSequence = activeSequence.slice(1);
            initialToken = activeSequence[0];
        }

        if (initialToken) {
            const normalizedToken = String(initialToken).toLowerCase();
            if (!nodeFrequencyMap.has(normalizedToken)) {
                nodeFrequencyMap.set(normalizedToken, {
                    term: normalizedToken,
                    continuations: [], // Stores subsequent token arrays
                    depth: currentGraphDepth,
                    frequency: 0,
                    children: [] // Placeholder for nested graph nodes
                });
            }
            const currentNodeEntry = nodeFrequencyMap.get(normalizedToken);
            currentNodeEntry.continuations.push(activeSequence.slice(1));
            currentNodeEntry.frequency++;

            if (currentNodeEntry.frequency > maximumObservedFrequency) {
                maximumObservedFrequency = currentNodeEntry.frequency;
            }
        }
    }

    const filteredAndProcessedNodes = new Map();
    const minimumFrequencyForInclusion = maximumObservedFrequency * ((100 - pruningThreshold) / 100);

    // Second pass: filter, build subgraphs, and apply collapsing
    for (const [termKey, nodeData] of nodeFrequencyMap.entries()) {
        if (nodeData.frequency >= minimumFrequencyForInclusion) {
            if (nodeData.continuations.length > 1) { // Only build children if multiple distinct paths exist
                const nestedGraph = constructLexicalGraph(
                    nodeData.continuations,
                    currentGraphDepth + 1,
                    pruningThreshold,
                    graphFlowDirection
                );

                // Check if the current node's children can be consolidated (collapsed)
                if (nestedGraph.length === 1) { // If only one child branch, attempt to collapse
                    const consolidatedNode = consolidateSinglePathNode(nestedGraph[0], nodeData.term, graphFlowDirection);
                    // Update the current node's properties with the consolidated information
                    nodeData.term = consolidatedNode.term;
                    nodeData.children = consolidatedNode.children;
                    filteredAndProcessedNodes.set(nodeData.term, nodeData); // Use the new term as key
                } else {
                    nodeData.children = nestedGraph;
                    filteredAndProcessedNodes.set(termKey, nodeData);
                }
            } else {
                // Keep nodes with single or no continuations directly if they pass frequency
                filteredAndProcessedNodes.set(termKey, nodeData);
            }
        }
    }

    return sortGraphNodesByFrequency(filteredAndProcessedNodes);
}

/**
 * Compares two graph node objects based on their 'frequency' property in descending order.
 * This is a utility function used for sorting arrays of graph nodes.
 *
 * @param {Object} nodeA - The first graph node object.
 * @param {Object} nodeB - The second graph node object.
 * @returns {number} A negative value if nodeB has higher frequency, positive if nodeA is higher, 0 if equal.
 */
const compareNodeFrequencies = (nodeA, nodeB) => nodeB.frequency - nodeA.frequency;

/**
 * Converts a Map of graph nodes into an array and sorts them by frequency.
 *
 * @param {Map<string, Object>} nodesMap - A Map where keys are node terms and values are node objects.
 * @returns {Array<Object>} An array of graph node objects, sorted by frequency in descending order.
 */
function sortGraphNodesByFrequency(nodesMap) {
    if (!(nodesMap instanceof Map) || nodesMap.size === 0) {
        return [];
    }
    const sortedNodeEntries = Array.from(nodesMap.values());
    sortedNodeEntries.sort(compareNodeFrequencies);
    return sortedNodeEntries;
}

/**
 * Consolidates a single child node into its parent's term, effectively merging them
 * into a single conceptual node for display purposes, especially for linear paths.
 *
 * @param {Object} childNode - The single child node object.
 * @param {string} parentTerm - The term (key) of the parent node.
 * @param {string} flowDirection - The graph's orientation (LEFT or RIGHT context).
 * @returns {Object} An object containing the new, consolidated 'term' and the child's 'children'.
 */
function consolidateSinglePathNode(childNode, parentTerm, flowDirection) {
    if (!childNode || typeof childNode !== 'object' || !childNode.term) {
        // Fallback for invalid child node, return original parent term with empty children
        return { term: parentTerm, children: [] };
    }

    let newCombinedTerm = parentTerm;
    if (flowDirection === GraphSettings.FLOW_DIRECTION_LEFT) {
        newCombinedTerm = `${parentTerm} ${childNode.term}`;
    } else if (flowDirection === GraphSettings.FLOW_DIRECTION_RIGHT) {
        newCombinedTerm = `${childNode.term} ${parentTerm}`;
    } else {
        console.warn(`Unknown graph flow direction: ${flowDirection}. Node consolidation might be incorrect.`);
    }

    // Recursively check if the child itself has a single child that can be further consolidated
    if (Array.isArray(childNode.children) && childNode.children.length === 1) {
        return consolidateSinglePathNode(childNode.children[0], newCombinedTerm, flowDirection);
    } else {
        return { term: newCombinedTerm, children: childNode.children };
    }
}

/**
 * Calculates a visual scale (size) for a graph node based on its frequency and depth.
 * This function ensures node sizes remain within a predefined range.
 *
 * @param {number|string} nodeFrequency - The numerical frequency count, or "terminal" for end-of-path nodes.
 * @param {number} nodeDepthLevel - The depth of the node in the graph hierarchy.
 * @returns {number} The calculated visual scale (size) for the node.
 */
function calculateNodeVisualScale(nodeFrequency, nodeDepthLevel) {
    if (nodeFrequency === "terminal") {
        return GraphSettings.TERMINAL_NODE_SCALE;
    }
    if (typeof nodeFrequency !== 'number' || nodeFrequency < 0 || typeof nodeDepthLevel !== 'number' || nodeDepthLevel < 0) {
        console.warn(`Invalid input for calculateNodeVisualScale: frequency=${nodeFrequency}, depth=${nodeDepthLevel}. Returning minimum scale.`);
        return GraphSettings.MINIMUM_VISUAL_SCALE; // Return a safe default
    }

    // Using Math.log1p(x) which is equivalent to log(1 + x), more numerically stable for small x.
    const logarithmicFactor = Math.log1p(nodeDepthLevel);
    // Avoid division by zero if depth is 0 (log1p(0) = 0), though depth starts at 1.
    const divisor = (logarithmicFactor > 0) ? logarithmicFactor : 1;
    const computedScale = (GraphSettings.MINIMUM_VISUAL_SCALE + nodeFrequency) / divisor;

    return Math.min(GraphSettings.MAXIMUM_VISUAL_SCALE, Math.max(GraphSettings.MINIMUM_VISUAL_SCALE, computedScale));
}

let uniqueNodeIdentifierCounter = 0; // A global counter to assign unique IDs to visualization nodes.

/**
 * Renders the structured lexical graph onto a specified visualization container.
 * This function initializes the renderer and populates it with nodes based on the graph data.
 *
 * @param {string} rootNodeLabel - The textual label for the graph's root node.
 * @param {Array<Object>} structuredGraphData - The array of graph nodes generated by `constructLexicalGraph`.
 * @param {HTMLElement} visualizationContainer - The DOM element where the graph will be drawn.
 * @param {number} containerWidth - The desired width of the visualization area.
 * @param {number} containerHeight - The desired height of the visualization area.
 * @param {string} layoutOrientation - The overall layout direction (e.g., GraphSettings.FLOW_DIRECTION_LEFT).
 * @param {Object} renderingSurface - An object representing the drawing canvas (e.g., a Raphael.js paper).
 * @returns {Object|null} The initialized WordTreeRenderer instance, or null if initialization fails.
 */
function renderLexicalGraphVisualization(rootNodeLabel, structuredGraphData, visualizationContainer, containerWidth, containerHeight, layoutOrientation, renderingSurface) {
    if (!(visualizationContainer instanceof HTMLElement)) {
        console.error("renderLexicalGraphVisualization: Invalid visualization container provided.");
        return null;
    }

    const graphVisualizer = new WordTreeRenderer(
        GraphSettings.VISUALIZER_DOM_ID,
        visualizationContainer,
        containerWidth,
        containerHeight,
        renderingSurface
    );

    if (!graphVisualizer) {
        console.error("renderLexicalGraphVisualization: Failed to instantiate graph renderer.");
        return null;
    }

    graphVisualizer.configuration.rootFlow = layoutOrientation;
    uniqueNodeIdentifierCounter = 0; // Reset counter for each new visualization session

    // Add the top-level root node to the visualization
    graphVisualizer.add(uniqueNodeIdentifierCounter, -1, rootNodeLabel, GraphSettings.ROOT_NODE_INITIAL_SCALE, GraphSettings.DEFAULT_NODE_COLOR);
    const rootGraphNodeId = uniqueNodeIdentifierCounter;
    uniqueNodeIdentifierCounter++;

    // Recursively add all subsequent nodes from the structured graph
    addGraphElementsToRenderer(structuredGraphData, graphVisualizer, rootGraphNodeId);

    // Trigger the actual rendering process within the WordTreeRenderer
    graphVisualizer.UpdateTree();
    return graphVisualizer;
}

/**
 * Recursively iterates through a subgraph and adds its nodes to the visualization renderer.
 *
 * @param {Array<Object>} currentSubgraph - The array of nodes for the current level of the graph.
 * @param {Object} rendererInstance - The WordTreeRenderer instance to which nodes are added.
 * @param {number} parentNodeId - The unique ID of the parent node in the visualization.
 */
function addGraphElementsToRenderer(currentSubgraph, rendererInstance, parentNodeId) {
    if (!Array.isArray(currentSubgraph) || currentSubgraph.length === 0) {
        return; // Stop recursion for empty subgraphs
    }

    currentSubgraph.forEach(node => {
        const currentVisualNodeId = uniqueNodeIdentifierCounter;
        rendererInstance.add(
            currentVisualNodeId,
            parentNodeId,
            node.term,
            calculateNodeVisualScale(node.frequency, node.depth),
            GraphSettings.DEFAULT_NODE_COLOR
        );
        uniqueNodeIdentifierCounter++;

        // If the node has children (representing a deeper structured graph), recurse
        if (Array.isArray(node.children) && node.children.length > 0) {
            addGraphElementsToRenderer(node.children, rendererInstance, currentVisualNodeId);
        }
        // If it's a "leaf" in terms of structured children but has remaining tokens, add a terminal description
        else if (Array.isArray(node.continuations) && node.continuations.length === 1 && node.continuations[0].length > 0) {
            const terminalDescriptionNodeId = uniqueNodeIdentifierCounter;
            const remainingTokens = node.continuations[0];
            let descriptionContent = "";

            if (rendererInstance.configuration.rootFlow === GraphSettings.FLOW_DIRECTION_LEFT) {
                descriptionContent = remainingTokens.join(" ");
            } else if (rendererInstance.configuration.rootFlow === GraphSettings.FLOW_DIRECTION_RIGHT) {
                // Create a reversed copy for right-to-left context
                descriptionContent = [...remainingTokens].reverse().join(" ");
            }

            if (descriptionContent) { // Only add if description is not empty
                rendererInstance.add(
                    terminalDescriptionNodeId,
                    currentVisualNodeId,
                    descriptionContent,
                    calculateNodeVisualScale("terminal", node.depth),
                    GraphSettings.TERMINAL_NODE_COLOR
                );
                uniqueNodeIdentifierCounter++;
            }
        }
    });
}

/**
 * Extracts a specific segment of data from a broader source collection.
 * This function is useful for isolating the relevant input for graph construction.
 *
 * @param {Object} dataCollection - The main object containing various data segments.
 * @param {string} segmentKey - The key (property name) to access the desired segment within the collection.
 * @param {string|number} subSegmentIdentifier - An identifier (key or index) to pinpoint a specific item within the segment.
 * @returns {Array<string>|null} The requested array of strings (e.g., tokenized sentences), or null if not found.
 */
function retrieveSpecificDataSegment(dataCollection, segmentKey, subSegmentIdentifier) {
    if (!dataCollection || typeof dataCollection !== 'object' || !dataCollection[segmentKey]) {
        console.warn(`retrieveSpecificDataSegment: Segment type '${segmentKey}' not found in the provided data collection.`);
        return null;
    }
    const targetSegment = dataCollection[segmentKey][subSegmentIdentifier];
    if (!targetSegment) {
        console.warn(`retrieveSpecificDataSegment: Sub-segment '${subSegmentIdentifier}' not found within '${segmentKey}'.`);
        return null;
    }
    return targetSegment;
}

/**
 * The main entry point to initiate the lexical graph visualization process.
 * This function orchestrates the graph construction and subsequent rendering.
 *
 * @param {Array<Array<string>>} tokenizedSentenceList - The input list of sentences, each tokenized into an array of words.
 * @param {string} graphRootLabel - The label to be displayed for the root node of the visualization.
 * @param {number} displayPruningFactor - A percentage (0-100) to control the detail level by pruning less frequent nodes.
 * @param {HTMLElement} targetDomElement - The HTML element where the visualization will be embedded.
 * @param {number} visualizationCanvasWidth - The pixel width of the visualization area.
 * @param {number} visualizationCanvasHeight - The pixel height of the visualization area.
 * @param {string} visualizationFlowDirection - Specifies the contextual flow (e.g., 'LEFT_CONTEXT' for words preceding a focus).
 * @param {Object} graphicsDrawingSurface - An object representing the underlying drawing surface (e.g., a Raphael paper object).
 * @returns {Object|null} The initialized WordTreeRenderer instance, or null if any step fails.
 */
function initializeLexicalGraphVisualization(
    tokenizedSentenceList,
    graphRootLabel,
    displayPruningFactor,
    targetDomElement,
    visualizationCanvasWidth,
    visualizationCanvasHeight,
    visualizationFlowDirection,
    graphicsDrawingSurface
) {
    // Input validation for robustness
    if (!Array.isArray(tokenizedSentenceList) || tokenizedSentenceList.length === 0) {
        console.error("initializeLexicalGraphVisualization: No tokenized sentence list provided.");
        return null;
    }
    if (!(targetDomElement instanceof HTMLElement)) {
        console.error("initializeLexicalGraphVisualization: Invalid target DOM element for rendering.");
        return null;
    }
    if (typeof displayPruningFactor !== 'number' || displayPruningFactor < 0 || displayPruningFactor > 100) {
        console.warn(`initializeLexicalGraphVisualization: Pruning factor (${displayPruningFactor}) is out of valid range [0-100]. Using default.`);
        displayPruningFactor = GraphSettings.PRUNING_PERCENTAGE_THRESHOLD;
    }

    // Step 1: Construct the underlying lexical graph data structure
    const processedLexicalGraph = constructLexicalGraph(
        tokenizedSentenceList,
        GraphSettings.STARTING_DEPTH,
        displayPruningFactor,
        visualizationFlowDirection
    );

    if (!processedLexicalGraph || processedLexicalGraph.length === 0) {
        console.warn("initializeLexicalGraphVisualization: Graph construction resulted in an empty structure. Nothing to visualize.");
        return null;
    }

    // Step 2: Render the constructed graph using the visualization renderer
    return renderLexicalGraphVisualization(
        graphRootLabel,
        processedLexicalGraph,
        targetDomElement,
        visualizationCanvasWidth,
        visualizationCanvasHeight,
        visualizationFlowDirection,
        graphicsDrawingSurface
    );
}