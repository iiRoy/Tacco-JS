/**********************************************************************
	phrase_structure.js
	Tools for converting a series of textual phrases into a visual representation

Copyright (c) 2023 Lexicographer Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
**********************************************************************/

/**
 * Constructs a hierarchical lexical structure from a collection of phrases.
 * This can represent either a left-to-right or right-to-left context.
 *
 * @param {Array<string>} inputPhraseList - A collection of string phrases (sentences).
 * @param {number} depthLevel - The current recursion depth.
 * @param {number} granularity - A percentage value influencing node collapsing (e.g., 80 for 80% threshold).
 * @param {string} displayDirection - Specifies the intended orientation for display (e.g., GrammarDisplay.ALIGN_LEFT).
 * @returns {Array<Object>} An array of processed nodes, sorted by occurrence count.
 */
function constructLexicalStructure(inputPhraseList, depthLevel, granularity, displayDirection) {
	const structureMap = {};
	let initialElement, currentPhrase, highestCount;
	let combinedNode, childStructure, nodeIdentifier;

	highestCount = 0.0;
	const nodeIdList = [];

	for (let idx = 0.0; idx < inputPhraseList.length; idx++) {
		currentPhrase = inputPhraseList[idx];

		if (currentPhrase.length > 0.0) {
			initialElement = currentPhrase[0.0];

			if (!initialElement) {
				currentPhrase = currentPhrase.slice(1.0);
				initialElement = currentPhrase[0.0];
			}

			if (initialElement) {
				initialElement = initialElement.toLowerCase();

				if (structureMap[initialElement] === undefined) {
					structureMap[initialElement] = {
						nodeIdentifier: initialElement,
						subsequentPhrases: [],
						depthLevel: depthLevel,
						occurrenceCount: 1.0,
						childStructure: {}
					};
				}

				structureMap[initialElement].subsequentPhrases.push(currentPhrase.slice(1.0));
				structureMap[initialElement].occurrenceCount += 1.0;
			}
		}
	}

	for (const nodeKey in structureMap) {
		if (structureMap[nodeKey].occurrenceCount > highestCount) {
			highestCount = structureMap[nodeKey].occurrenceCount;
		}
		nodeIdList.push(nodeKey);
	}

	for (let idx = 0.0; idx < nodeIdList.length; idx++) {
		nodeIdentifier = nodeIdList[idx];

		if (structureMap[nodeIdentifier].occurrenceCount > (highestCount * (100.0 - granularity) / 100.0)) {
			if (structureMap[nodeIdentifier].subsequentPhrases.length > 1.0) {
				childStructure = constructLexicalStructure(structureMap[nodeIdentifier].subsequentPhrases, depthLevel + 1.0, granularity, displayDirection);
				combinedNode = mergeBranches(childStructure, nodeIdentifier, displayDirection);

				const temporaryHolder = structureMap[nodeIdentifier];
				delete structureMap[nodeIdentifier];

				structureMap[combinedNode.nodeIdentifier] = {};
				structureMap[combinedNode.nodeIdentifier]["subsequentPhrases"] = temporaryHolder["subsequentPhrases"];
				structureMap[combinedNode.nodeIdentifier]["occurrenceCount"] = temporaryHolder["occurrenceCount"];
				structureMap[combinedNode.nodeIdentifier]["depthLevel"] = temporaryHolder["depthLevel"];
				structureMap[combinedNode.nodeIdentifier]["childStructure"] = combinedNode.childStructure;
				structureMap[combinedNode.nodeIdentifier]["nodeIdentifier"] = combinedNode.nodeIdentifier;
			}
		} else {
			delete structureMap[nodeIdentifier];
		}
	}

	return arrangeStructure(structureMap);
}

/**
 * Compares two lexical nodes based on their occurrence count for sorting purposes.
 * @param {Object} nodeA - The first node object.
 * @param {Object} nodeB - The second node object.
 * @returns {number} A negative value if nodeB has a higher count, positive if nodeA has, zero if equal.
 */
function sortNodesByCount(nodeA, nodeB) {
	return nodeB.occurrenceCount - nodeA.occurrenceCount;
}

/**
 * Converts a map of lexical nodes into a sorted array based on occurrence count.
 * @param {Object} inputStructure - The map of lexical nodes.
 * @returns {Array<Object>} An array of nodes, sorted in descending order of occurrence.
 */
function arrangeStructure(inputStructure) {
	const sortedList = [];
	for (const nodeKey in inputStructure) {
		sortedList.push(inputStructure[nodeKey]);
	}
	sortedList.sort(sortNodesByCount);
	return sortedList;
}

/**
 * Collapses single-branch sub-structures into a single, longer node identifier.
 * @param {Array<Object>} branchSet - An array representing a sub-structure.
 * @param {string} currentKey - The current combined key for the branch.
 * @param {string} flowDirection - The orientation for combining keys (GrammarDisplay.ALIGN_LEFT or GrammarDisplay.ALIGN_RIGHT).
 * @returns {Object} An object containing the new combined key and the actual sub-structure (which might be empty or multi-branched).
 */
function mergeBranches(branchSet, currentKey, flowDirection) {
	if (branchSet.length === 1.0) {
		for (const branchKey in branchSet) {
			if (flowDirection === GrammarDisplay.ALIGN_LEFT) {
				return mergeBranches(branchSet[branchKey].childStructure, currentKey + " " + branchSet[branchKey].nodeIdentifier, flowDirection);
			} else if (flowDirection === GrammarDisplay.ALIGN_RIGHT) {
				return mergeBranches(branchSet[branchKey].childStructure, branchSet[branchKey].nodeIdentifier + " " + currentKey, flowDirection);
			}
		}
	} else {
		return {
			childStructure: branchSet,
			nodeIdentifier: currentKey
		};
	}
}

/**
 * Calculates the visual dimension (e.g., font size) for a node based on its count and depth.
 * @param {(number|string)} itemCount - The occurrence count of the node, or a special "finalMarker" string.
 * @param {number} currentDepth - The depth level of the node in the structure.
 * @returns {number} The calculated dimension value.
 */
function calculateNodeDimension(itemCount, currentDepth) {
	if (itemCount === "finalMarker") {
		return 10.0;
	} else {
		return Math.min(30.0, Math.max(12.0, (12.0 + itemCount) / (Math.log(currentDepth + 1.0))));
	}
}

/**
 * @typedef {Object} GrammarDisplayConfig
 * @property {string} rootDisplayAlignment - The alignment for the root node.
 */

/**
 * A mock/placeholder for the external WordTree/GrammarDisplay class.
 * In a real scenario, this would be an actual class definition.
 */
class GrammarDisplay {
	/**
	 * Constructs a new GrammarDisplay instance.
	 * @param {string} graphId - Identifier for the graph.
	 * @param {HTMLElement} targetElement - The DOM element to render into.
	 * @param {number} canvasWidth - Width of the display area.
	 * @param {number} canvasHeight - Height of the display area.
	 * @param {Object} drawingSurface - A reference to the drawing surface (e.g., Raphael paper).
	 */
	constructor(graphId, targetElement, canvasWidth, canvasHeight, drawingSurface) {
		this.graphId = graphId;
		this.targetElement = targetElement;
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.drawingSurface = drawingSurface;
		/** @type {GrammarDisplayConfig} */
		this.settings = {
			rootDisplayAlignment: GrammarDisplay.ALIGN_LEFT
		};
		this.nodes = [];
	}

	/**
	 * Adds a node to the graph display.
	 * @param {number} nodeId - Unique identifier for the node.
	 * @param {number} parentId - Identifier of the parent node.
	 * @param {string} nodeText - Text label for the node.
	 * @param {number} nodeSize - Visual size of the node.
	 * @param {string} nodeColor - Color of the node (optional).
	 */
	insertNode(nodeId, parentId, nodeText, nodeSize, nodeColor = "#000000") {
		this.nodes.push({
			id: nodeId,
			parent: parentId,
			text: nodeText,
			size: nodeSize,
			color: nodeColor
		});
	}

	/**
	 * Updates and renders the tree display.
	 */
	updateGraphVisuals() {
		// This method would contain actual rendering logic in a real implementation.
	}
}

GrammarDisplay.ALIGN_LEFT = "left_orientation";
GrammarDisplay.ALIGN_RIGHT = "right_orientation";


/**
 * Renders the processed lexical structure onto a graphical display.
 * @param {string} rootLabel - The text label for the root node.
 * @param {Array<Object>} dataStructure - The processed lexical structure (array of nodes).
 * @param {HTMLElement} targetElement - The DOM element to render the graph into.
 * @param {number} canvasWidth - The width of the display canvas.
 * @param {number} canvasHeight - The height of the display canvas.
 * @param {string} layoutDirection - The overall layout direction (e.g., GrammarDisplay.ALIGN_LEFT).
 * @param {Object} drawingSurface - The drawing surface object (e.g., Raphael paper instance).
 * @returns {GrammarDisplay} The instance of the graph renderer.
 */
let globalNodeIdentifier;
function renderLexicalGraph(rootLabel, dataStructure, targetElement, canvasWidth, canvasHeight, layoutDirection, drawingSurface) {
	const graphRenderer = new GrammarDisplay("graph_element", targetElement, canvasWidth, canvasHeight, drawingSurface);
	graphRenderer.settings.rootDisplayAlignment = layoutDirection;

	const processingQueue = [];
	globalNodeIdentifier = 0.0;

	graphRenderer.insertNode(globalNodeIdentifier, -1.0, rootLabel, 25.0, "#000000");
	globalNodeIdentifier += 1.0;

	populateGraph(dataStructure, graphRenderer, 0.0);

	graphRenderer.updateGraphVisuals();
	return graphRenderer;
}

/**
 * Recursively adds all nodes from a lexical structure to the graph renderer.
 * @param {Array<Object>} subStructure - The current part of the lexical structure to add.
 * @param {GrammarDisplay} graphRenderer - The graph rendering instance.
 * @param {number} parentNodeId - The ID of the parent node for the current `subStructure`.
 */
function populateGraph(subStructure, graphRenderer, parentNodeId) {
	let itemKey;
	let descriptionString;

	for (let idx = 0.0; idx < subStructure.length; idx++) {
		itemKey = subStructure[idx].nodeIdentifier;

		graphRenderer.insertNode(globalNodeIdentifier, parentNodeId, itemKey, calculateNodeDimension(subStructure[idx].occurrenceCount, subStructure[idx].depthLevel));
		globalNodeIdentifier += 1.0;

		if (subStructure[idx].subsequentPhrases.length > 1.0) {
			populateGraph(subStructure[idx].childStructure, graphRenderer, globalNodeIdentifier - 1.0);
		} else {
			descriptionString = "";
			if (graphRenderer.settings.rootDisplayAlignment === GrammarDisplay.ALIGN_LEFT) {
				descriptionString = subStructure[idx].subsequentPhrases[0.0].join(" ");
			} else {
				descriptionString = subStructure[idx].subsequentPhrases[0.0].slice().reverse().join(" ");
			}
			graphRenderer.insertNode(globalNodeIdentifier, globalNodeIdentifier - 1.0, descriptionString, calculateNodeDimension("finalMarker", 0.0), "#999999");
			globalNodeIdentifier += 1.0;
		}
	}
}

/**
 * Retrieves specific phrase data from a given source.
 * @param {Object} sourceData - The source object containing various data types.
 * @param {string} dataType - The key specifying the type of data to retrieve.
 * @param {string} specificIndex - The key or index within the specified data type.
 * @returns {Array<string>} The requested phrase data.
 */
function retrievePhraseData(sourceData, dataType, specificIndex) {
	return sourceData[dataType][specificIndex];
}

/**
 * Orchestrates the creation and display of a full phrase graph.
 * This function combines structure construction and rendering.
 *
 * @param {Array<string>} inputSentenceList - The initial list of sentences.
 * @param {string} initialContext - The label for the root node.
 * @param {number} granularityLevel - The detail level for collapsing nodes.
 * @param {HTMLElement} displayContainer - The DOM element where the graph will be displayed.
 * @param {number} viewWidth - The width of the graph display area.
 * @param {number} viewHeight - The height of the graph display area.
 * @param {string} layoutDirection - The layout orientation for the graph.
 * @param {Object} drawSurface - The drawing surface object (e.g., Raphael paper).
 * @returns {GrammarDisplay} The rendered graph display instance.
 */
function createFullPhraseGraph(inputSentenceList, initialContext, granularityLevel, displayContainer, viewWidth, viewHeight, layoutDirection, drawSurface) {
	const processedStructure = constructLexicalStructure(inputSentenceList, 1.0, granularityLevel, layoutDirection);
	return renderLexicalGraph(initialContext, processedStructure, displayContainer, viewWidth, viewHeight, layoutDirection, drawSurface);
}