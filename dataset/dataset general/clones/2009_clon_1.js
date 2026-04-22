/*
 * This is a Type I clone of the original JavaScript code.
 *
 * The purpose of this file is to demonstrate how code can be visually
 * altered while remaining functionally identical.
 *
 * Changes are limited to:
 * - Whitespace (indentation, line breaks, spaces around operators, etc.)
 * - Comments (addition, removal, modification)
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the original source code.
 */

/* Declaration of core variables used throughout the singult.coffee library.
   These variables are essential for various parsing and utility functions. */
var array_p,
    dom_p,
    explode_p,
    ignore_p,
    key_prefix,
    map_p,
    namespace_tag,
    number_p,
    p,
    re_namespace_sep,
    re_svg_tags,
    re_tag,
    re_whitespace,
    string_p,
    unify_p,
    whitespace_node_p,
    xmlns,
    __hasProp = {}.hasOwnProperty; // A utility for checking object properties

// Google Closure Library requirements and provides.
// These lines ensure that necessary modules are loaded and this module's
// functionality is exposed correctly within the Closure ecosystem.
goog.require( "goog.string" );
goog.provide( "singult.coffee" );
goog.provide( "singult.coffee.Unify" );
goog.provide( "singult.coffee.Ignore" );

/*
 * A simple debug logging utility function.
 * It logs its argument to the console and then returns it.
 * Useful for inspecting intermediate values in a chain.
 */
p = function ( x )
{
  console.log( x ); // Output the value for debugging purposes.
  return x;         // Return the original value to maintain flow.
};

// Regular expression to parse HTML/SVG tag strings,
// extracting tag name, ID, and class attributes.
re_tag = /([^\s\.#]+)(?:#([^\s\.#]+))?(?:\.([^\s#]+))?/;

// Regular expression to identify common SVG tags.
// This is used for correct namespace handling.
re_svg_tags = /^(svg|g|rect|circle|clipPath|path|line|polygon|polyline|text|textPath)$/;

// Regular expression to detect if a string consists solely of whitespace characters.
re_whitespace = /^\s+$/;

// Regular expression to separate namespace prefixes from tag or attribute names.
re_namespace_sep = /:(.+)/;

// A special prefix used internally for keys in data structures,
// typically to avoid clashes with user-defined keys.
key_prefix = "\0";

/*
 * A map of common XML/HTML namespace prefixes to their full URI declarations.
 * This is crucial for correctly creating namespaced elements and attributes.
 */
xmlns = {
    xhtml : "http://www.w3.org/1999/xhtml",
    xlink : "http://www.w3.org/1999/xlink",
    svg   : "http://www.w3.org/2000/svg",
    xml   : "http://www.w3.org/XML/1998/namespace",
    xmlns : "http://www.w3.org/2000/xmlns"
};


// Function to determine the correct namespace and tag name from a tag string.
// It handles prefixed tags (e.g., "svg:rect") and infers namespaces for common tags.
namespace_tag = function ( tag_str )
{
    var nsp, tag, _ref;

    // Split the tag string by colon to check for a namespace prefix.
    _ref = tag_str.split( ":" ),
    nsp  = _ref[0],
    tag  = _ref[1];

    if ( tag != null )
    {
        // If a prefix was found, use the corresponding URI from xmlns, or the prefix itself if not found.
        return [ xmlns[nsp] || nsp, tag ];
    }
    else
    {
        // No prefix: infer namespace based on common SVG tags or default to XHTML.
        if ( tag_str.match( re_svg_tags ) )
        {
            return [ xmlns.svg, tag_str ];
        }
        else
        {
            return [ xmlns.xhtml, tag_str ];
        }
    }
};

/*
 * Predicate function to check if a value represents an "explode" instruction.
 * Explode instructions are used to flatten arrays of children into the parent.
 */
explode_p = function ( v ) { return v[0] === ":*:"; };

/*
 * Predicate function to check if a value is an instance of singult.coffee.Unify.
 * Unify objects are central to efficient DOM updates.
 */
unify_p = function ( x )
{
    return ( x != null ) && ( x instanceof singult.coffee.Unify );
};

/*
 * Predicate function to check if a value is an instance of singult.coffee.Ignore.
 * Ignore objects signal that a node should be skipped during rendering/merging.
 */
ignore_p = function ( x )
{
    return ( x != null ) && ( x instanceof singult.coffee.Ignore );
};

// Predicate function to check if a value is an array (or array-like with forEach).
array_p = function ( x )
{
    return ( x != null ) && ( x.forEach != null );
};

// Predicate function to check if a value is a plain object (not array, Unify, or Ignore).
map_p = function ( x )
{
    return ( x != null )
        && ( !array_p( x ) )
        && ( !unify_p( x ) )
        && ( !ignore_p( x ) )
        && ( x instanceof Object );
};

// Predicate function to check if a value is a DOM node.
dom_p = function ( x )
{
    return ( x != null ) && ( x.nodeType != null );
};

// Predicate function to check if a value is a string.
string_p = function ( x )
{
    return ( x != null ) && ( x.substring != null );
};

// Predicate function to check if a value is a number.
number_p = function ( x )
{
    return ( x != null ) && ( x.toFixed != null );
};

/*
 * Predicate function to determine if a DOM node is considered "whitespace".
 * This typically refers to comment nodes or text nodes containing only whitespace.
 */
whitespace_node_p = function ( $n )
{
    return $n.nodeType === 8 || ( $n.nodeType === 3 && $n.textContent.match( re_whitespace ) );
};


/**
 * Applies a map of CSS style properties to a DOM element.
 * Converts CSS property names from kebab-case (if present) to camelCase.
 *
 * @param {Element} $e The DOM element to apply styles to.
 * @param {Object} m A map of style property names and their values.
 */
singult.coffee.style = function ( $e, m )
{
    var k, v, _results;
    _results = [];

    // Iterate over each property in the style map.
    for ( k in m )
    {
        if ( !__hasProp.call( m, k ) ) continue; // Ensure it's an own property.
        v = m[k];
        // Apply the style, converting the key to camelCase for JavaScript style property access.
        _results.push( $e.style[goog.string.toCamelCase( k )] = v );
    }

    return _results;
};


/**
 * Applies a map of direct JavaScript properties to a DOM element.
 * This is for properties like 'value', 'checked', etc., not CSS styles.
 *
 * @param {Element} $e The DOM element to apply properties to.
 * @param {Object} m A map of property names and their values.
 */
singult.coffee.properties = function ( $e, m )
{
    var prop, v, _results;
    _results = [];

    // Loop through all properties in the provided map.
    for ( prop in m )
    {
        if ( !__hasProp.call( m, prop ) ) continue;
        v = m[prop];
        // Directly assign the property value to the element.
        _results.push( $e[prop] = v );
    }
    return _results;
};


/**
 * Applies a map of attributes to a DOM element.
 * Handles special cases like 'style', 'properties', and 'class' arrays.
 * Also manages namespaced attributes (e.g., 'xlink:href').
 *
 * @param {Element} $e The DOM element to apply attributes to.
 * @param {Object} attr_map A map of attribute names and their values.
 */
singult.coffee.attr = function ( $e, attr_map )
{
    var attr, k, ns, v, _ref, _results;

    // Handle 'style' attribute separately using singult.coffee.style.
    if ( attr_map["style"] != null )
    {
        singult.coffee.style( $e, attr_map["style"] );
        delete attr_map["style"]; // Remove from attr_map after processing.
    }

    // Handle 'properties' attribute separately using singult.coffee.properties.
    if ( attr_map["properties"] != null )
    {
        singult.coffee.properties( $e, attr_map["properties"] );
        delete attr_map["properties"]; // Remove from attr_map after processing.
    }

    // Special handling for 'class' attribute if it's an array.
    // Joins array elements with a space to form a single class string.
    if ( array_p( attr_map["class"] ) )
    {
        $e.setAttribute( "class", attr_map["class"].join( " " ) );
        delete attr_map["class"]; // Remove from attr_map.
    }

    _results = [];

    // Iterate over remaining attributes in the map.
    for ( k in attr_map )
    {
        if ( !__hasProp.call( attr_map, k ) ) continue;
        v = attr_map[k];

        if ( v != null )
        {
            // Check for namespaced attributes (e.g., "xlink:href").
            _ref = k.split( re_namespace_sep ),
            ns   = _ref[0],
            attr = _ref[1];

            if ( attr != null )
            {
                // Set namespaced attribute.
                _results.push( $e.setAttributeNS( xmlns[ns] || ns, attr, v ) );
            }
            else
            {
                // Set standard attribute.
                _results.push( $e.setAttribute( k, v ) );
            }
        }
        else
        {
            // If value is null, remove the attribute.
            _results.push( $e.removeAttribute( k ) );
        }
    }

    return _results;
};


/**
 * Stores or retrieves custom data associated with a DOM node.
 * This data is stored in a non-standard property "__singult_data__".
 *
 * @param {Element} $e The DOM element.
 * @param {*} [d] The data to store. If omitted, retrieves existing data.
 * @returns {*} The stored data, or the newly set data.
 */
singult.coffee.node_data = function ( $e, d )
{
    if ( d != null )
    {
        return $e["__singult_data__"] = d; // Store data.
    }
    else
    {
        return $e["__singult_data__"]; // Retrieve data.
    }
};


/**
 * Canonicalizes various input types into a standardized format for rendering.
 * Numbers are converted to strings. Arrays (hiccup-like structures) are
 * canonicalized recursively. Other types are returned as is.
 *
 * @param {*} x The input value to canonicalize.
 * @returns {*} The canonicalized value.
 */
singult.coffee.canonicalize = function ( x )
{
    if ( number_p( x ) )
    {
        return x.toString(); // Numbers become strings.
    }
    else if ( array_p( x ) )
    {
        // Arrays are assumed to be hiccup-style and are processed by canonicalize_hiccup.
        return singult.coffee.canonicalize_hiccup( x );
    }
    else
    {
        return x; // Other types (strings, objects, etc.) are returned directly.
    }
};


/**
 * Canonicalizes a hiccup-style array representation of a DOM element.
 * This involves parsing the tag string for ID and classes, merging attributes,
 * and recursively canonicalizing children.
 *
 * @param {Array} v The hiccup-style array (e.g., ["div#id.class", {attr: val}, child1, child2]).
 * @returns {Object} A canonical object representation {nsp, tag, attr, children}.
 */
singult.coffee.canonicalize_hiccup = function ( v )
{
    var abbreviated_classes,
        attr,
        canonical,
        canonical_children,
        children,
        cls_str,
        id,
        nsp,
        tag,
        tag_str,
        _,
        _ref,
        _ref1,
        _ref2;

    tag = v[0]; // The first element is always the tag string.

    // Determine if the second element is an attribute map or a child.
    _ref = map_p( v[1] ) ? [ v[1], v.slice( 2 ) ] : [ {}, v.slice( 1 ) ],
    attr = _ref[0],
    children = _ref[1];

    // Parse the tag string for tag name, ID, and class using re_tag.
    _ref1 = tag.match( re_tag ),
    _       = _ref1[0],
    tag_str = _ref1[1],
    id      = _ref1[2],
    cls_str = _ref1[3];

    // If an ID is found in the tag string, add or overwrite it in the attributes.
    if ( id != null )
    {
        attr["id"] = id;
    }

    // If classes are found in the tag string (e.g., "div.class1.class2"),
    // merge them with existing 'class' attributes.
    if ( cls_str != null )
    {
        abbreviated_classes = cls_str.split( "." );
        if ( array_p( attr["class"] ) )
        {
            attr["class"] = attr["class"].concat( abbreviated_classes );
        }
        else if ( string_p( attr["class"] ) )
        {
            attr["class"] = abbreviated_classes.concat( [ attr["class"] ] );
        }
        else if ( attr["class"] == null )
        {
            attr["class"] = abbreviated_classes;
        }
    }

    // Determine the correct namespace and final tag name.
    _ref2 = namespace_tag( tag_str ),
    nsp   = _ref2[0],
    tag   = _ref2[1];

    canonical_children = [];

    // Recursively canonicalize all children.
    children.forEach( function ( v )
    {
        if ( v != null )
        {
            if ( explode_p( v ) )
            {
                // If it's an explode instruction, flatten its contents.
                return v.slice( 1 ).forEach( function ( v )
                {
                    return canonical_children.push( singult.coffee.canonicalize( v ) );
                } );
            }
            else
            {
                // Otherwise, canonicalize the child directly.
                return canonical_children.push( singult.coffee.canonicalize( v ) );
            }
        }
    } );

    // Construct the final canonical object.
    canonical = {
        nsp      : nsp,
        tag      : tag,
        attr     : attr,
        children : canonical_children
    };

    return canonical;
};


/**
 * Renders a canonicalized hiccup structure or other data types into a DOM node.
 * Handles strings, existing DOM nodes, and canonical objects.
 * Supports Unify objects for efficient list rendering (enter phase).
 *
 * @param {*} m The input data to render. Can be a string, DOM node, or canonical object.
 * @returns {Node} The created or processed DOM node.
 * @throws {Error} If a Unify object is encountered as a top-level element.
 */
singult.coffee.render = function ( m )
{
    var $e, c;

    if ( unify_p( m ) )
    {
        // Unify objects must be children of an element, not rendered directly.
        throw new Error( "Unify must be the first and only child of its parent." );
    }
    else if ( ignore_p( m ) )
    {
        // Ignore objects mean nothing should be rendered.
        return null;
    }
    else if ( string_p( m ) )
    {
        // Strings become text nodes.
        return document.createTextNode( m );
    }
    else if ( dom_p( m ) )
    {
        // Existing DOM nodes are returned as is.
        return m;
    }
    else
    {
        // Assume 'm' is a canonical object {nsp, tag, attr, children}.
        // Create the element with its namespace.
        $e = document.createElementNS( m.nsp, m.tag );

        // Apply attributes.
        singult.coffee.attr( $e, m.attr );

        c = m.children[0]; // Get the first child to check for Unify.

        // Special handling if the first child is a Unify object.
        if ( unify_p( c ) )
        {
            if ( c.enter != null )
            {
                // If an 'enter' function is provided, use it to create elements.
                c.data.forEach( function ( d )
                {
                    var $el;
                    $el = c.enter( d ); // Create element using custom enter function.
                    singult.coffee.node_data( $el, d ); // Store data on the new element.
                    return $e.appendChild( $el ); // Append to parent.
                } );
            }
            else
            {
                // Otherwise, use default rendering for Unify children.
                c.data.forEach( function ( d )
                {
                    var $el;
                    // Canonicalize the data using the Unify mapping, then render.
                    $el = singult.coffee.render( singult.coffee.canonicalize( c.mapping( d ) ) );
                    singult.coffee.node_data( $el, d );
                    return $e.appendChild( $el );
                } );
            }
        }
        else
        {
            // Regular children rendering: recursively render and append.
            m.children.forEach( function ( c )
            {
                var $c;
                $c = singult.coffee.render( c ); // Render each child.
                if ( $c != null )
                {
                    return $e.appendChild( $c ); // Append if not null (e.g., not an Ignore).
                }
            } );
        }
        return $e; // Return the constructed element.
    }
};


/**
 * @constructor
 * Represents a Unify object, used for managing dynamic lists of DOM elements
 * with efficient updates (enter, update, exit patterns).
 *
 * @param {Array} data The array of data items to bind to elements.
 * @param {Function} mapping A function to transform a data item into a hiccup structure.
 * @param {Function} [key_fn] An optional function to generate unique keys for data items.
 * @param {Function} [enter] An optional custom function for creating new elements.
 * @param {Function} [update] An optional custom function for updating existing elements.
 * @param {Function} [exit] An optional custom function for removing elements.
 * @param {boolean} [force_update_p] If true, forces update even if data seems identical.
 */
singult.coffee.Unify = function ( data, mapping, key_fn, enter, update, exit, force_update_p )
{
    this.data           = data;
    this.mapping        = mapping;
    this.key_fn         = key_fn;
    this.enter          = enter;
    this.update         = update;
    this.exit           = exit;
    this.force_update_p = force_update_p;
    return this;
};


/**
 * @constructor
 * Represents an Ignore object.
 * When encountered during rendering or merging, it signals that the corresponding
 * element or placeholder should be skipped or removed.
 */
singult.coffee.Ignore = function ()
{
    return this;
};


/**
 * Performs a "unify" operation on a DOM container, synchronizing its children
 * with a new set of data provided by a Unify object. This implements the
 * D3-like enter, update, exit pattern for efficient DOM manipulation.
 *
 * @param {Element} $container The parent DOM element whose children are to be unified.
 * @param {singult.coffee.Unify} u The Unify object containing data and instructions.
 */
singult.coffee.unify_ = function ( $container, u )
{
    var $nodes,
        data_len,
        data_map,
        data_to_key,
        enter,
        exit,
        i,
        insert_at,
        key,
        key_fn,
        maybe_do_update,
        node_to_key,
        nodes_to_keep,
        update;

    /*
     * Define the 'enter' function: how new elements are created and added.
     * If not provided in the Unify object, a default implementation is used.
     */
    enter = u.enter || function ( d )
    {
        var $el;
        // Default enter: canonicalize data and render a new element, then append it.
        $el = singult.coffee.render( singult.coffee.canonicalize( u.mapping( d ) ) );
        $container.appendChild( $el );
        return $el;
    };

    /*
     * Define the 'update' function: how existing elements are modified.
     * If not provided, a default merge function is used.
     */
    update = u.update || function ( $n, d )
    {
        // Default update: merge the existing node with the canonicalized new data.
        return singult.coffee.merge( $n, singult.coffee.canonicalize( u.mapping( d ) ) );
    };

    /*
     * Define the 'exit' function: how old elements are removed.
     * If not provided, a default function removes the element from its parent.
     */
    exit = u.exit || function ( $n )
    {
        return $container.removeChild( $n );
    };

    /*
     * Define the 'key_fn': how a unique key is generated for each data item.
     * This is crucial for identifying which data item corresponds to which DOM node
     * across updates. Defaults to using the array index if no key function is provided.
     */
    key_fn = u.key_fn || function ( d, idx )
    {
        return idx;
    };


    // Get a live collection of the container's child nodes.
    $nodes = $container.childNodes;

    /*
     * Helper function to generate a unique key for a data item.
     * It uses the `key_prefix` to avoid clashes with potential user-defined keys
     * and calls the user-provided `key_fn`.
     */
    data_to_key = function ( d, i )
    {
        return key_prefix + key_fn( d, i );
    };

    /*
     * Helper function to retrieve the data associated with a DOM node
     * and generate its key using `data_to_key`.
     */
    node_to_key = function ( $n, i )
    {
        return data_to_key( singult.coffee.node_data( $n ), i );
    };


    /*
     * Helper function to perform an update on a node if necessary.
     * It checks `force_update_p` or compares old and new data for equality.
     */
    maybe_do_update = function ( $n, d )
    {
        var $el, identical_data_p, old_data;

        if ( u.force_update_p )
        {
            // If forced update is enabled, always call the update function.
            $el = update( $n, d );
            return singult.coffee.node_data( $el, d );
        }
        else
        {
            // Otherwise, check if the data has actually changed.
            old_data         = singult.coffee.node_data( $n );
            // Use ClojureScript's IEquiv protocol if available, otherwise strict equality.
            identical_data_p = old_data.cljs$core$IEquiv$_equiv$arity$2 != null
                ? old_data.cljs$core$IEquiv$_equiv$arity$2( old_data, d )
                : old_data === d;

            if ( !identical_data_p )
            {
                // If data is different, perform the update.
                $el = update( $n, d );
                return singult.coffee.node_data( $el, d );
            }
        }
    };


    /*
     * Helper function to insert a DOM node at a specific index within the container.
     * Handles appending if the index is beyond current children count.
     */
    insert_at = function ( $n, i )
    {
        if ( i < $nodes.length )
        {
            return $container.insertBefore( $n, $nodes[i] );
        }
        else
        {
            return $container.appendChild( $n );
        }
    };


    // Create a map from data keys to data items for quick lookups.
    data_map = {};
    u.data.forEach( function ( d, i )
    {
        var key;
        key          = data_to_key( d, i );
        data_map[key] = d;
        return; // Explicit return for clarity, though not strictly needed here.
    } );

    // Identify which existing DOM nodes should be kept (i.e., have corresponding data).
    nodes_to_keep = {};
    i             = 0;
    while ( i < $nodes.length )
    {
        key = node_to_key( $nodes[i], i );
        if ( data_map[key] )
        {
            // If a data item exists for this node's key, mark the node to be kept.
            nodes_to_keep[key] = $nodes[i];
        }
        i += 1;
    }


    // Main loop: iterate through the new data and reconcile with existing DOM nodes.
    u.data.forEach( function ( d, i )
    {
        var $el, $n, d_key, n_key;

        $n    = i < $nodes.length ? $nodes[i] : void 0; // Get existing node at current position, if any.
        n_key = $n ? node_to_key( $n, i ) : void 0;   // Key of the existing node.
        d_key = data_to_key( d, i );                 // Key of the current data item.

        if ( $n == null )
        {
            // Case 1: No existing node at this position. This is an 'enter' scenario.
            $el = enter( d );                  // Create new element.
            return singult.coffee.node_data( $el, d ); // Store data on it.
        }
        else if ( n_key === d_key )
        {
            // Case 2: Existing node matches the data item by key and position. This is an 'update' scenario.
            return maybe_do_update( $nodes[i], d ); // Update if data changed or forced.
        }
        else
        {
            // Case 3: Existing node at this position does not match the current data item's key.
            // This implies a reordering, deletion, or insertion.

            if ( !nodes_to_keep[n_key] )
            {
                // If the current node ($n) is not needed anywhere else, remove it (exit).
                exit( $n );
            }

            if ( nodes_to_keep[d_key] )
            {
                // If there's an existing node that matches the current data item's key
                // (but it's currently at a different position), move it here.
                $el = nodes_to_keep[d_key];
                insert_at( $el, i );             // Insert the existing node at the correct position.
                return maybe_do_update( $el, d ); // Update its properties.
            }
            else
            {
                // No existing node matches the current data item's key. This is an 'enter' scenario.
                $el = enter( d );                 // Create a new element.
                insert_at( $el, i );              // Insert it at the current position.
                return singult.coffee.node_data( $el, d ); // Store data on it.
            }
        }
    } );

    // After processing all new data, remove any remaining extra DOM nodes.
    // These are nodes that had no corresponding data item.
    data_len = u.data.length;
    while ( data_len < $nodes.length )
    {
        exit( $nodes[data_len] ); // Call exit for nodes that are no longer needed.
    }

    return null; // The unify operation is complete.
};


/**
 * Merges a canonical hiccup structure into an existing DOM element.
 * This function performs efficient updates by comparing the desired state
 * (from the hiccup structure) with the current state of the DOM element.
 *
 * @param {Element} $e The existing DOM element to merge into.
 * @param {*} m The canonical hiccup structure or other data to merge.
 * @throws {Error} If attempting to merge into an element of a different tag type.
 */
singult.coffee.merge = function ( $e, m )
{
    var $c, c, i, _i, _j, _ref, _ref1;

    if ( unify_p( m ) )
    {
        // If the merge target is a Unify object, delegate to singult.coffee.unify_.
        singult.coffee.unify_( $e, m );
    }
    else if ( ignore_p( m ) )
    {
        // If it's an Ignore object, do nothing.
    }
    else
    {
        // Ensure the existing element's tag matches the desired tag.
        if ( $e.nodeName.toLowerCase() !== m.tag.toLowerCase() )
        {
            p( $e ); // Log the element for debugging.
            p( m );  // Log the merge data for debugging.
            throw new Error( "Cannot merge $e into node of different type" );
        }

        // Apply attributes to the element.
        singult.coffee.attr( $e, m.attr );

        // Clean up whitespace nodes from the existing element's children.
        if ( $e.hasChildNodes() )
        {
            for ( i = _i = _ref = $e.childNodes.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i )
            {
                $c = $e.childNodes[i];
                if ( whitespace_node_p( $c ) )
                {
                    $e.removeChild( $c );
                }
            }
        }

        // Check if the first child of the merge data is a Unify object.
        if ( unify_p( m.children[0] ) )
        {
            // If so, delegate the child merging to singult.coffee.unify_.
            singult.coffee.merge( $e, m.children[0] );
        }
        else
        {
            // If the existing element has more children than the new data, remove the excess.
            if ( $e.childNodes.length > m.children.length )
            {
                for ( i = _j = _ref1 = $e.childNodes.length - 1; _ref1 <= 0 ? _j <= 0 : _j >= 0; i = _ref1 <= 0 ? ++_j : --_j )
                {
                    $e.removeChild( $e.childNodes[i] );
                }
            }

            // Iterate through children and perform merges or creations.
            i = 0;
            while ( i < m.children.length )
            {
                c  = m.children[i] || ""; // Get the desired child data, default to empty string.
                $c = $e.childNodes[i];    // Get the existing child node at this position.

                if ( string_p( c ) )
                {
                    // If the desired child is a string, update or create a text node.
                    if ( $c != null )
                    {
                        $c.textContent = c; // Update existing text node.
                    }
                    else
                    {
                        $e.appendChild( document.createTextNode( c ) ); // Create new text node.
                    }
                }
                else if ( ignore_p( c ) )
                {
                    // If the desired child is an Ignore, do nothing (it implies removal or no-op).
                }
                else if ( map_p( c ) )
                {
                    // If the desired child is a canonical object, merge into existing or create new.
                    if ( $c != null )
                    {
                        singult.coffee.merge( $c, c ); // Recursively merge into existing child.
                    }
                    else
                    {
                        $e.appendChild( singult.coffee.render( c ) ); // Create and append new child.
                    }
                }
                else
                {
                    // Log unknown child types for debugging and throw an error.
                    p( $c );
                    p( c );
                    throw new Error( "Cannot merge children" );
                }
                i += 1; // Move to the next child.
            }
        }
    }
    return $e; // Return the modified element.
};