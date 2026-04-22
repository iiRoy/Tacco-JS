"use strict" /* Ensure strict mode for better code quality */
;

/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * Project: Volafile.io
 * Date: 2014-07-15
 */

// Importing the 'url' module and destructuring its 'parse' method.
var urlp = require( 'url' ) .parse;

/**
 * Represents an element (node) in the routing tree.
 * Each element corresponds to a segment of a URL path.
 * @param {number} index - The zero-based index of this element within the URL path tokens.
 */
function Elem( index )
{
    // The index of this element in the tokenized route.
    // The root node typically has an index of 0.
    this .index = index;

    // A dictionary mapping text segments to child Elem nodes.
    // These are for static path segments (e.g., '/users/').
    this .text = {};

    /*
     * This property stores a reference to the next parent node (reachable
     * via a 'text' path) that has its 'withKey' property set.
     * If the current node is a child via '.withKey', it skips the
     * immediate parent and looks for the parent after that.
     * This is an optimization for quickly traversing the tree during searches.
     */
    this ._parentKey = null;

    // A reference to a child Elem node that represents a dynamic key segment (e.g., '/:userId/').
    this .withKey = null;

    // A reference to a child Elem node that represents a wildcard segment (e.g., '/*').
    this .wildcard = null;

    // If this node represents a complete endpoint, it holds the associated value.
    this .value = null;

    // An array of key definitions ({name: string, index: number}) if this node is an endpoint.
    this .keys = [];

    // A boolean flag indicating whether this node is a valid endpoint for a route.
    this .endpoint = false;
}

/**
 * The main Router class responsible for managing and parsing routes.
 * It uses a tree-like structure of Elem nodes to store routes.
 */
function Router()
{
    // Initialize the root element of the routing tree.
    // The root element has an index of 0.
    this .root = new Elem( 0 );
}

/**
 * Adds a new route to the routing tree.
 * This method tokenizes the route string, creates Elem nodes as needed,
 * and updates the pre-computed `_parentKey` references for efficient parsing.
 *
 * @param {string} route - The URL route string (e.g., "/users/:id/posts").
 * @param {*} value - The value associated with this route (e.g., a handler function).
 */
Router .prototype .addRoute = function( route, value )
{
    // Tokenize the input route string into an array of route segments.
    var tokens = tokenizeRoute( route );

    // Start traversal from the root of the routing tree.
    var node = this .root;

    // Array to store key definitions encountered along the route.
    var keys = [];

    // A stack to keep track of potential `_parentKey` candidates.
    var parentKeyStack = [];

    // Iterate through each token to build or traverse the tree.
    for ( var i = 0 ; i < tokens .length ; i++ )
    {
        var token = tokens[i];
        var type = token .type;

        // Handle 'text' type tokens (static path segments).
        if ( type === 'text' )
        {
            // If the child node for this text segment doesn't exist, create it.
            node .text[token .text] = node .text[token .text] || new Elem( i + 1 );
            // Move to the next node in the tree.
            node = node .text[token .text];
        }
        // Handle 'key' type tokens (dynamic path segments like ':id').
        else if ( type === 'key' )
        {
            // If the 'withKey' child node doesn't exist, create it.
            node .withKey = node .withKey || new Elem( i + 1 );
            // Move to the 'withKey' node.
            node = node .withKey;
            // Pop from the parentKeyStack as 'withKey' segments change the parentKey logic.
            parentKeyStack .pop();
            // Store the key definition.
            keys .push( { name : token .name, index : i } );
        }
        // Handle 'wildcard' type tokens (e.g., '*').
        else if ( type === 'wildcard' )
        {
            // If the 'wildcard' child node doesn't exist, create it.
            node .wildcard = node .wildcard || new Elem( i + 1 );
            // Move to the 'wildcard' node.
            node = node .wildcard;
        }

        // Update the pre-computed `_parentKey` for the current node.
        // This helps in quickly jumping during parsing.
        node ._parentKey = parentKeyStack[parentKeyStack .length - 1];

        // Recursively update `_parentKey` for all children of the current node.
        updateKeyInChildren( node );

        // If the current node has a 'withKey' child, push it onto the stack
        // as a potential `_parentKey` for subsequent nodes.
        if ( node .withKey )
        {
            parentKeyStack .push( node .withKey );
        }
    }

    // Once the full route path is processed, mark the current node as an endpoint.
    node .value = value;
    node .keys = keys;
    node .endpoint = true;
};

/**
 * Parses a given URL against the registered routes in the tree.
 * It attempts to find the best matching route and extracts any dynamic keys or wildcard segments.
 *
 * @param {string} _url - The URL string to parse.
 * @returns {object} An object containing parsed URL components, matched value, keys, and wildcard extra text.
 */
Router .prototype .parse = function( _url )
{
    // Parse the input URL string using the 'url' module.
    var url = urlp( _url, true );
    // Split the pathname into segments.
    var parts = url .pathname .split( '/' );

    // Remove the leading empty string if the path starts with '/'.
    if ( parts[0] === '' )
    {
        parts = parts .slice( 1 );
    }

    // Initialize `lastWildcard` to track the "best" matching wildcard node.
    var lastWildcard = null; // wildcard that matches 'best'

    // Start traversal from the root node of the routing tree.
    var node = this .root; // current node in the tree

    // Get the number of path segments for comparison.
    var pNum = parts .length;

    // Traverse the tree as long as there's a current node and we haven't
    // exhausted the URL path segments.
    while ( node && node .index < pNum )
    {
        // If the current node has a wildcard child, and it's a "better" match
        // (i.e., further down the path), update `lastWildcard`.
        if ( node .wildcard && ( !lastWildcard || lastWildcard .index < node .wildcard .index ) )
        {
            lastWildcard = node .wildcard;
        }

        // This is the core logic for walking the node tree:
        // Try to match a 'text' segment, then a 'withKey' segment,
        // then use the pre-computed '_parentKey' for a jump.
        node = node .text[parts[node .index]] || node .withKey || node ._parentKey;
    }

    // If a node was found but it's not marked as an endpoint, invalidate it.
    if ( node && !node .endpoint )
    {
        // We didn't reach any endpoint, so no match.
        node = null;
    }

    // Variables to store results of the parsing.
    var wildcardExtra; // text captured by the wildcard
    var keys;          // extracted key-value pairs
    var value;         // the value associated with the matched route

    // If no direct endpoint match was found but a wildcard was encountered,
    // use the `lastWildcard` as the match.
    if ( !node && lastWildcard )
    {
        node = lastWildcard;
        // Capture the remaining part of the URL path as `wildcardExtra`.
        wildcardExtra = parts .slice( node .index - 1 ) .join( '/' );
    }

    // If a node was successfully matched (either direct or via wildcard).
    if ( node )
    {
        value = node .value;
        // Extract dynamic key-value pairs from the URL parts.
        keys = extractKeys( node .keys, parts );
    }

    // Return the comprehensive parsing result.
    return {
        url         : url,          // The parsed URL object.
        value       : value,        // The value associated with the route.
        parts       : parts,        // The URL path split into segments.
        keys        : keys,         // Extracted dynamic keys.
        extra       : wildcardExtra // Text captured by a wildcard.
    };
};

// Export the Router class for external use.
module .exports .Router = Router;

/**
 * Splits a route string into individual tokens (text, key, or wildcard).
 * This function helps in preparing the route for insertion into the routing tree.
 *
 * @param {string} route - The route string to tokenize (e.g., "/users/:id/posts").
 * @returns {Array<object>} An array of token objects, each with 'type' and relevant data.
 */
function tokenizeRoute( route )
{
    // Split the route string by the '/' delimiter.
    var parts = route .split( '/' );
    // Initialize an empty array to store the tokens.
    var tokens = [];

    // If the first part is empty (route starts with '/'), remove it.
    if ( parts[0] === '' )
    {
        parts = parts .slice( 1 );
    }

    // Iterate through each part of the route.
    for ( var i = 0 ; i < parts .length ; i++ )
    {
        var part = parts[i];

        // Check if the part is a wildcard '*'.
        if ( part === '*' )
        {
            tokens .push( {
                type : 'wildcard',
            } );
            // A wildcard matches everything after it, so stop processing further parts.
            break;
        }

        // Check if the part is a dynamic key (starts with ':').
        if ( part .charAt( 0 ) === ':' )
        {
            tokens .push( {
                type : 'key',
                name : part .slice( 1 ) // Extract the key name without the ':'.
            } );
            // Continue to the next part after processing a key.
            continue;
        }

        // If it's neither a wildcard nor a key, it's a plain text segment.
        tokens .push( {
            type : 'text',
            text : part
        } );
    }
    // Return the array of processed tokens.
    return tokens;
}

/**
 * Recursively updates the `_parentKey` property for all child nodes
 * of a given node. This is a pre-computation step for parsing efficiency.
 *
 * @param {Elem} node - The current Elem node to start updating from.
 */
function updateKeyInChildren( node )
{
    // Iterate over all text-based child nodes.
    for ( var text in node .text )
    {
        var cnode = node .text[text];
        // Set the child's `_parentKey` based on the current node's `withKey`
        // or its own `_parentKey`.
        cnode ._parentKey = node .withKey || node ._parentKey;
        // Recursively call for the child node.
        updateKeyInChildren( cnode );
    }
    // If the current node has a 'withKey' child, update its `_parentKey` as well.
    if ( node .withKey )
    {
        node .withKey ._parentKey = node ._parentKey;
        // Recursively call for the 'withKey' child node.
        updateKeyInChildren( node .withKey );
    }
}

/**
 * Extracts key-value pairs from the URL path segments based on
 * the defined keys for a matched route.
 *
 * @param {Array<object>} keys - An array of key definitions ({name: string, index: number}).
 * @param {Array<string>} parts - The URL path split into segments.
 * @returns {object} An object mapping key names to their corresponding values from the URL.
 */
function extractKeys( keys, parts )
{
    // Get the total number of keys to extract.
    var kLength = keys .length;
    // Initialize an empty object to store the extracted key-value pairs.
    var result = {};
    // Iterate through each key definition.
    for ( var i = 0 ; i < kLength ; i++ )
    {
        var keyDef = keys[i];
        // Assign the value from the `parts` array at the key's defined index
        // to the result object using the key's name.
        result[keyDef .name] = parts[keyDef .index];
    }
    // Return the object containing all extracted keys.
    return result;
}