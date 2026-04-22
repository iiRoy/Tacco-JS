"use strict";

/*
    This software is freely available for use and modification.
    You may redistribute it and/or adapt it according to the terms
    of the GNU General Public License, version 3 or any subsequent
    version published by the Free Software Foundation.

    This utility is provided "as is", without any express or implied
    warranty of fitness for a particular purpose or merchantability.
    Its usefulness is entirely at your own discretion.

    A copy of the GNU General Public License should accompany this distribution.
    If it is missing, please consult <http://www.gnu.org/licenses/>.

    Project X Router Component, 2023-11-20
*/

let    linkParser    = require('url').parse;


function NodeUnit(segIndex) {
        // The sequential position of this segment within the path structure.
        // The initial segment (root) is always at position 0.
    this.position = segIndex;

        // Stores references to child nodes that represent fixed, literal path segments.
        // Keys are the segment text, values are the child NodeUnit objects.
    this.literalSegments = { };

        // A reference to the nearest ancestor node that represents a keyed parameter segment.
        // This is used for optimization during path traversal. If this node itself is a
        // parameter, this reference points to its *parent's* key parent, effectively skipping itself.
    this.ancestorKeyNode = null;

        // A child node that represents a dynamic parameter segment (e.g., '/:id').
        // There can only be one such child per node.
    this.paramSegment = null;

        // A child node that represents a wildcard segment (e.g., '/*').
        // There can only be one such child per node.
    this.catchAllSegment = null;

        // The data payload associated with this specific route endpoint.
    this.targetData = null;

        // A list of parameter definitions (name and position) collected along the path
        // leading to this endpoint.
    this.parameterNames = [ ];

        // A boolean flag indicating if this node represents a complete, routable endpoint.
    this.isTerminal = false;
}

function PathMatcher() {
        // The starting point of our routing tree.
    this.baseNode = new NodeUnit(0);
}

// This routine registers a new path pattern within the routing tree.
// It also meticulously updates the `ancestorKeyNode` property for all
// affected nodes to facilitate efficient lookup.
PathMatcher.prototype.registerPath = function (patternText, dataPayload) {
        // Break down the path pattern into individual, descriptive tokens.
    let    segmentList    = parsePathPattern(patternText);

        // Begin traversal from the root of the routing tree.
    let    activeSegment    = this.baseNode;

        // Accumulator for parameter definitions encountered along this path.
    let    collectedParams    = [ ];

        // A stack to keep track of the most recent parameter-defining ancestor node.
    let    keyAncestorStack    = [ ];

        // Iterate through each token to build or traverse the tree.
    for ( let idx = 0; idx < segmentList.length; idx++ ) {
        let    currentTok    = segmentList[idx];
        let    tokType       = currentTok.type;

            // Handle literal text segments.
        if ( tokType === 'literal' ) {
                // Create a new node for this literal segment if it doesn't exist, then move to it.
            activeSegment.literalSegments[currentTok.literal] =
                activeSegment.literalSegments[currentTok.literal] || new NodeUnit(idx + 1);
            activeSegment = activeSegment.literalSegments[currentTok.literal];

        } else if ( tokType === 'parameter' ) {
                // Create a new node for this parameter segment if it doesn't exist, then move to it.
            activeSegment.paramSegment = activeSegment.paramSegment || new NodeUnit(idx + 1);
            activeSegment = activeSegment.paramSegment;

                // When a parameter node is encountered, we pop the previous key ancestor
                // as this new parameter node is now the most relevant.
            keyAncestorStack.pop();

                // Record the details of this parameter.
            collectedParams.push({ nameId: currentTok.nameId, position: idx });

        } else if ( tokType === 'splat' ) {
                // Create a new node for the wildcard segment if it doesn't exist, then move to it.
            activeSegment.catchAllSegment = activeSegment.catchAllSegment || new NodeUnit(idx + 1);
            activeSegment = activeSegment.catchAllSegment;
        }

            // Update the immediate key ancestor reference for the current node.
        activeSegment.ancestorKeyNode = keyAncestorStack[keyAncestorStack.length - 1];

            // Recursively update the key ancestor references for all children of the current node.
        propagateKeyRef(activeSegment);

            // If the current node itself is a parameter segment, push it onto the stack.
        if ( activeSegment.paramSegment ) {
            keyAncestorStack.push(activeSegment.paramSegment);
        }
    }

        // Once the path is fully processed, assign the provided payload and parameter definitions.
    activeSegment.targetData = dataPayload;
    activeSegment.parameterNames = collectedParams;
    activeSegment.isTerminal = true;
};

// This method attempts to match an incoming URL against the registered path patterns
// and returns the corresponding match details.
PathMatcher.prototype.resolvePath = function (inputUrl) {
        // Parse the raw URL string into its components.
    let    parsedUrl    = linkParser(inputUrl, true);

        // Split the pathname into individual components.
    let    urlSegments    = parsedUrl.pathname.split('/');

        // Remove an empty leading segment if the path starts with '/'.
    if ( urlSegments[0] === '' ) urlSegments = urlSegments.slice(1);

        // Keep track of the "best" (longest matching) wildcard node encountered.
    let    bestSplatMatch    = null;

        // Start the search from the root of the routing tree.
    let    currentSearchNode    = this.baseNode;

        // Determine the total number of URL components for comparison.
    let    numComponents    = urlSegments.length;

        // Traverse the tree as long as we have a valid node and haven't exhausted URL segments.
    while ( currentSearchNode && currentSearchNode.position < numComponents ) {
            // If the current node has a wildcard child, and it's a better match
            // than any previous wildcard, store it.
        if ( currentSearchNode.catchAllSegment && ( !bestSplatMatch || bestSplatMatch.position < currentSearchNode.catchAllSegment.position ) ) {
            bestSplatMatch = currentSearchNode.catchAllSegment;
        }

            // Attempt to move to the next node based on the current URL segment.
            // Priority: literal segment -> parameter segment -> key-ancestor fallback.
        currentSearchNode = currentSearchNode.literalSegments[urlSegments[currentSearchNode.position]] ||
                            currentSearchNode.paramSegment                                          ||
                            currentSearchNode.ancestorKeyNode;
    }

        // If we've finished traversal but haven't landed on a terminal node,
        // it means no direct match was found.
    if ( currentSearchNode && !currentSearchNode.isTerminal ) {
        currentSearchNode = null;
    }

    let    splatCapture;     // The extra path captured by a wildcard.
    let    extractedParameters; // Key-value pairs of extracted parameters.
    let    matchedPayload;   // The data associated with the matched route.

        // If no direct match was found, but a wildcard was encountered, use the wildcard.
    if ( !currentSearchNode && bestSplatMatch ) {
        currentSearchNode = bestSplatMatch;
            // Capture the remaining URL segments that the wildcard matched.
        splatCapture = urlSegments.slice(currentSearchNode.position - 1).join('/');
    }

        // If a match (either direct or wildcard) was found, extract details.
    if ( currentSearchNode ) {
        matchedPayload = currentSearchNode.targetData;
        extractedParameters = fetchParameters(currentSearchNode.parameterNames, urlSegments);
    }

        // Return a comprehensive result object.
    return {
        parsedUrl: parsedUrl,
        matchedPayload: matchedPayload,
        pathComponents: urlSegments,
        extractedParameters: extractedParameters,
        splatCapture: splatCapture
    };
};

module.exports.PathMatcher = PathMatcher;

// This helper function parses a raw path pattern string into a list of structured tokens.
function parsePathPattern(patternString) {
        // Split the pattern by the '/' delimiter.
    let    patternSegments    = patternString.split('/');
    let    segmentDescriptors    = [ ];

        // Remove leading empty segment if present (e.g., "/foo" -> ["", "foo"]).
    if ( patternSegments[0] === '' ) patternSegments = patternSegments.slice(1);

        // Iterate through each segment to determine its type.
    for ( let k = 0; k < patternSegments.length; k++ ) {
        let    segmentPiece    = patternSegments[k];

            // Check for a wildcard segment.
        if ( segmentPiece === '*' ) {
            segmentDescriptors.push({
                type: 'splat',
            });
                // A wildcard always terminates the pattern.
            break;
        }

            // Check for a parameter segment (starts with ':').
        if ( segmentPiece.charAt(0) === ':' ) {
            segmentDescriptors.push({
                type: 'parameter',
                nameId: segmentPiece.slice(1) // Get the parameter name without the ':'
            });
            continue; // Move to the next segment.
        }

            // If neither of the above, it's a literal text segment.
        segmentDescriptors.push({
            type: 'literal',
            literal: segmentPiece
        });
    }
    return segmentDescriptors;
}

// Recursively updates the `ancestorKeyNode` property for all child nodes.
// This ensures that each node correctly points to its nearest key-defining parent.
function propagateKeyRef(currentTreeNode) {
        // Iterate through all literal child segments.
    for ( let literalName in currentTreeNode.literalSegments ) {
        let    childNode    = currentTreeNode.literalSegments[literalName];
            // The child's key ancestor is either the current node's parameter segment
            // or the current node's own key ancestor.
        childNode.ancestorKeyNode = currentTreeNode.paramSegment || currentTreeNode.ancestorKeyNode;
        propagateKeyRef(childNode); // Recurse for the child.
    }
        // If the current node has a parameter child itself.
    if ( currentTreeNode.paramSegment ) {
            // The parameter child's key ancestor is the current node's key ancestor (it skips itself).
        currentTreeNode.paramSegment.ancestorKeyNode = currentTreeNode.ancestorKeyNode;
        propagateKeyRef(currentTreeNode.paramSegment); // Recurse for the parameter child.
    }
}

// Extracts parameter values from the given URL components based on their definitions.
function fetchParameters(paramDefinitions, urlComponents) {
    let    numParams    = paramDefinitions.length;
    let    paramValues    = { }; // Store the extracted key-value pairs.

        // Iterate through each parameter definition.
    for ( let j = 0; j < numParams; j++ ) {
        let    definition    = paramDefinitions[j];
            // Assign the URL component at the defined position to the parameter's name.
        paramValues[definition.nameId] = urlComponents[definition.position];
    }
    return paramValues;
}