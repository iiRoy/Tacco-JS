"use strict";

/**
 * This software is distributed under the terms of the GNU General Public License,
 * version 3 or any later version, as published by the Free Software Foundation.
 * It is provided "as is" without any warranty, express or implied, including
 * merchantability or fitness for a particular purpose.
 * A copy of the GNU GPL v3 should have been included with this distribution;
 * if not, please refer to <http://www.gnu.org/licenses/> for details.
 *
 * (c) 2014-2023 RouteCraft Systems. All rights reserved.
 */

// A utility for parsing URLs, specifically extracting components.
const resolveUrlParts = require('url').parse;

/**
 * Represents a single segment within the routing tree structure.
 * Each segment can lead to various subsequent segments based on path type.
 * @param {number} segmentPosition - The depth or index of this segment in the path.
 */
function RouteSegment(segmentPosition) {
    // The numerical order of this segment from the root (root is 0).
    this.segmentDepth = segmentPosition;

    // A map of literal text path components leading to further RouteSegments.
    this.literalChildren = {};

    // Reference to the next ancestor segment that is a dynamic key segment.
    // This is used for optimized traversal during path matching.
    this._dynamicParentRef = null;

    // If this segment itself represents a dynamic key (e.g., ':userId').
    this.dynamicKeyChild = null;

    // If this segment represents a wildcard match (e.g., '*').
    this.catchAllChild = null;

    // If this segment marks the end of a valid route, it holds the associated value.
    this.routePayload = null;

    // A list of dynamic keys defined along the path leading to this segment.
    this.keyDefinitions = [];

    // Flag indicating if this segment is a terminal point for a registered route.
    this.isTerminalNode = false;
}

/**
 * Manages the registration and matching of URL paths against a tree-like structure.
 */
function PathRegistry() {
    this.rootSegment = new RouteSegment(0);
}

/**
 * Incorporates a new route string and its associated value into the path registry.
 * This process builds out the tree structure and pre-computes parent key references.
 * @param {string} routePath - The URL path pattern to register (e.g., "/users/:id/profile").
 * @param {*} routeValue - The value to associate with this route.
 */
PathRegistry.prototype.registerPath = function(routePath, routeValue) {
    const pathComponents = decomposePath(routePath);
    let currentSegment = this.rootSegment;
    const dynamicKeyStack = []; // Tracks potential parent dynamic key segments
    const collectedKeys = [];   // Stores key definitions for the current route

    for (let componentIndex = 0; componentIndex < pathComponents.length; componentIndex++) {
        const currentComponent = pathComponents[componentIndex];
        const componentType = currentComponent.kind;
        let nextSegmentCandidate;

        // Determine the next segment based on component type
        switch (componentType) {
            case 'literal':
                const componentText = currentComponent.content;
                nextSegmentCandidate = currentSegment.literalChildren[componentText];
                if (!nextSegmentCandidate) {
                    nextSegmentCandidate = new RouteSegment(componentIndex + 1);
                    currentSegment.literalChildren[componentText] = nextSegmentCandidate;
                }
                currentSegment = nextSegmentCandidate;
                break;
            case 'dynamic':
                nextSegmentCandidate = currentSegment.dynamicKeyChild;
                if (!nextSegmentCandidate) {
                    nextSegmentCandidate = new RouteSegment(componentIndex + 1);
                    currentSegment.dynamicKeyChild = nextSegmentCandidate;
                }
                currentSegment = nextSegmentCandidate;
                // A dynamic segment means the previous parent key reference is no longer directly relevant
                // to its children, as this new dynamic segment will act as the new 'key parent'.
                dynamicKeyStack.pop();
                collectedKeys.push({ paramName: currentComponent.paramName, pathIndex: componentIndex });
                break;
            case 'wildcard':
                nextSegmentCandidate = currentSegment.catchAllChild;
                if (!nextSegmentCandidate) {
                    nextSegmentCandidate = new RouteSegment(componentIndex + 1);
                    currentSegment.catchAllChild = nextSegmentCandidate;
                }
                currentSegment = nextSegmentCandidate;
                break;
            default:
                // This should ideally not happen with valid input, but as a guard:
                console.warn(`Unknown path component type encountered: ${componentType} for component: ${JSON.stringify(currentComponent)}`);
                continue; // Skip to the next component if type is unknown
        }

        // Update the dynamic parent reference for the current segment
        currentSegment._dynamicParentRef = dynamicKeyStack[dynamicKeyStack.length - 1] || null;

        // Recursively update children's dynamic parent references
        propagateDynamicParentRef(currentSegment);

        // If the current segment itself has a dynamic key child, it becomes a potential
        // 'dynamic parent' for subsequent segments.
        if (currentSegment.dynamicKeyChild) {
            dynamicKeyStack.push(currentSegment.dynamicKeyChild);
        }
    }

    // Mark the final segment as a terminal node and store route details
    currentSegment.routePayload = routeValue;
    currentSegment.keyDefinitions = collectedKeys;
    currentSegment.isTerminalNode = true;
};

/**
 * Attempts to match a given URL against the registered paths and extract relevant data.
 * @param {string} incomingUrl - The URL string to parse.
 * @returns {object} An object containing the parsed URL, matched value, path segments,
 *                   extracted parameters, and any wildcard remainder.
 */
PathRegistry.prototype.matchPath = function(incomingUrl) {
    const parsedUrl = resolveUrlParts(incomingUrl, true);
    let urlSegments = parsedUrl.pathname.split('/');

    // Ensure leading empty segment is removed if present
    if (urlSegments.length > 0 && urlSegments[0] === '') {
        urlSegments.shift();
    }

    // Handle the special case of an empty path (e.g., "/")
    if (urlSegments.length === 0) {
        if (this.rootSegment.isTerminalNode) {
            return {
                originalUrl: incomingUrl,
                parsedUrlComponents: parsedUrl,
                matchedValue: this.rootSegment.routePayload,
                pathSegments: [],
                pathParameters: {},
                wildcardRemainder: undefined
            };
        } else {
            return {
                originalUrl: incomingUrl,
                parsedUrlComponents: parsedUrl,
                matchedValue: undefined,
                pathSegments: [],
                pathParameters: undefined,
                wildcardRemainder: undefined
            };
        }
    }

    let activeSegment = this.rootSegment; // Current position in the routing tree
    let bestWildcardMatch = null;         // Keeps track of the deepest wildcard match
    let currentUrlSegmentIndex = 0;       // Index for the current URL part being processed

    const totalSegments = urlSegments.length;

    // Traverse the routing tree based on URL segments
    while (activeSegment && currentUrlSegmentIndex < totalSegments) {
        // If the current segment has a wildcard child, it's a candidate for the best match
        if (activeSegment.catchAllChild) {
            // Update bestWildcardMatch only if current one is deeper
            if (!bestWildcardMatch || activeSegment.catchAllChild.segmentDepth > bestWildcardMatch.segmentDepth) {
                bestWildcardMatch = activeSegment.catchAllChild;
            }
        }

        const currentPathPart = urlSegments[currentUrlSegmentIndex];

        // Attempt to find a direct match for the current URL part
        let nextPotentialNode = activeSegment.literalChildren[currentPathPart];

        // If no literal match, try the dynamic key path
        if (!nextPotentialNode && activeSegment.dynamicKeyChild) {
            nextPotentialNode = activeSegment.dynamicKeyChild;
        }

        // If no direct child match, the current path is a dead end for this branch.
        if (!nextPotentialNode) {
            activeSegment = null; // No further match on this path
            break;
        }

        activeSegment = nextPotentialNode;
        currentUrlSegmentIndex++;
    }

    // After the loop, `activeSegment` is either the terminal node or null.
    // If it's null, we still might have a `bestWildcardMatch`.

    let finalMatchedNode = activeSegment;
    // If we ended on a node but it's not a terminal endpoint, invalidate it.
    if (finalMatchedNode && !finalMatchedNode.isTerminalNode) {
        finalMatchedNode = null;
    }

    let wildcardRemainder;
    let extractedParameters;
    let finalRouteValue;

    // If no exact match (or non-terminal match), check if a wildcard provides a match
    if (!finalMatchedNode && bestWildcardMatch) {
        finalMatchedNode = bestWildcardMatch;
        // The wildcard remainder starts from the segment *after* the wildcard's depth.
        // `segmentDepth` is the depth of the wildcard node itself.
        // If wildcard node was at depth 3 (e.g., /a/b/*), then `urlSegments.slice(2)`
        // (`segmentDepth - 1`) gives the part that matches the wildcard and subsequent.
        wildcardRemainder = urlSegments.slice(finalMatchedNode.segmentDepth - 1).join('/');
    }

    if (finalMatchedNode) {
        finalRouteValue = finalMatchedNode.routePayload;
        extractedParameters = collectDynamicSegments(finalMatchedNode.keyDefinitions, urlSegments);
    }

    // Construct the final result object
    return {
        originalUrl: incomingUrl,
        parsedUrlComponents: parsedUrl,
        matchedValue: finalRouteValue,
        pathSegments: urlSegments,
        pathParameters: extractedParameters,
        wildcardRemainder: wildcardRemainder
    };
};

module.exports.PathRegistry = PathRegistry;

/**
 * Breaks down a route path string into an array of structured components.
 * @param {string} routeInput - The raw route path string (e.g., "/users/:id").
 * @returns {Array<object>} An array of component objects, each with 'kind' and 'content'/'paramName'.
 */
function decomposePath(routeInput) {
    let pathParts = routeInput.split('/');
    const processedComponents = [];

    // Remove leading empty string if path starts with '/'
    if (pathParts.length > 0 && pathParts[0] === '') {
        pathParts.shift();
    }

    // Handle empty route (e.g., "/") explicitly if it wasn't already just `""`
    if (pathParts.length === 0 && routeInput === '/') {
        return []; // An empty array means root path, handled by PathRegistry.matchPath
    }

    for (const singlePart of pathParts) {
        if (singlePart === '*') {
            processedComponents.push({ kind: 'wildcard' });
            break; // Wildcard is always the last component
        } else if (singlePart.startsWith(':')) {
            const parameterName = singlePart.substring(1);
            if (!parameterName) { // Guard against empty parameter name like ":"
                console.warn(`Invalid dynamic parameter in route: "${singlePart}". Skipping.`);
                continue;
            }
            processedComponents.push({ kind: 'dynamic', paramName: parameterName });
        } else {
            processedComponents.push({ kind: 'literal', content: singlePart });
        }
    }
    return processedComponents;
}

/**
 * Recursively updates the _dynamicParentRef property for child segments.
 * This pre-computes the nearest ancestor dynamic key segment for faster lookups.
 * @param {RouteSegment} currentSegment - The segment from which to propagate.
 */
function propagateDynamicParentRef(currentSegment) {
    if (!currentSegment) {
        return; // Guard clause
    }

    // The reference to propagate to children:
    // If the current segment has a dynamic key child, that child becomes the new reference.
    // Otherwise, it inherits its own _dynamicParentRef.
    const refForChildren = currentSegment.dynamicKeyChild || currentSegment._dynamicParentRef;

    // Propagate to literal children
    Object.values(currentSegment.literalChildren).forEach(child => {
        child._dynamicParentRef = refForChildren;
        propagateDynamicParentRef(child); // Recursive call
    });

    // Propagate to dynamic key child itself (if it exists)
    if (currentSegment.dynamicKeyChild) {
        // The dynamic key child's _dynamicParentRef is its *own* _dynamicParentRef,
        // effectively skipping its immediate parent if that parent was also dynamic.
        // This means `currentSegment.dynamicKeyChild._dynamicParentRef` should inherit from
        // `currentSegment._dynamicParentRef` (the parent's parent dynamic reference).
        currentSegment.dynamicKeyChild._dynamicParentRef = currentSegment._dynamicParentRef;
        propagateDynamicParentRef(currentSegment.dynamicKeyChild);
    }
    // Wildcard children do not have dynamic keys, so no special propagation for them.
    // Their _dynamicParentRef would just be what they inherited from `currentSegment`
    // at the time of their creation, and the original code didn't recurse into them for this.
}

/**
 * Extracts values for dynamic path parameters from the matched URL segments.
 * @param {Array<object>} paramDefinitions - List of parameter definitions (name, index).
 * @param {Array<string>} urlPathSegments - The actual URL path segments.
 * @returns {object} An object mapping parameter names to their extracted values.
 */
function collectDynamicSegments(paramDefinitions, urlPathSegments) {
    const collectedParameters = {};
    if (!paramDefinitions || !Array.isArray(paramDefinitions) || paramDefinitions.length === 0) {
        return collectedParameters; // No parameters to collect
    }

    for (const definition of paramDefinitions) {
        const { paramName, pathIndex } = definition;
        // Ensure the pathIndex is valid and corresponds to an existing segment
        if (urlPathSegments[pathIndex] !== undefined) {
            collectedParameters[paramName] = urlPathSegments[pathIndex];
        } else {
            // A parameter was defined in the route but not found in the URL.
            // This might indicate an issue or an optional parameter scenario.
            // For now, it's skipped, mimicking original behavior.
        }
    }
    return collectedParameters;
}