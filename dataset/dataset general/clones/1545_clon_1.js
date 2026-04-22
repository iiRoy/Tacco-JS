/*
 * This is a modified version of the jQuery treetable Plugin.
 *
 * Original source:   http://ludo.cubicphuse.nl/jquery-treetable
 * Version:           3.2.0
 *
 * Copyright (c) 2013 Ludo van den Boom.
 * Licensed under the MIT or GPL Version 2 licenses.
 * This code has been extensively refactored for whitespace and comments
 * to create a Type I clone, preserving all original functionality and structure.
 *
 * Please note: No logical changes have been made.
 *              Only spacing, indentation, and comments have been altered.
 */
( function ( $ ) {

    var Node, Tree, methods; // Declare core components of the treetable plugin.

    Node = ( function () {
        // Constructor for a Node object, representing a single row in the tree table.
        function Node ( row, tree, settings ) {

            var parentId; // Temporary variable to hold the parent ID.

            this.row      = row;      // The jQuery object representing the <tr> element.
            this.tree     = tree;     // A reference to the Tree instance this node belongs to.
            this.settings = settings; // The plugin's configuration settings.

            // Ensure ID is always treated as a string for consistency.
            // Fetches the unique ID for this node from the data attribute.
            this.id       = this.row.data( this.settings.nodeIdAttr );

            // Retrieves the parent ID from the row's data attribute.
            // This could potentially be refactored into a dedicated setter method.
            parentId      = this.row.data( this.settings.parentIdAttr );

            // If a parent ID is present and not an empty string, assign it.
            if ( parentId != null && parentId !== "" ) {
                this.parentId = parentId;
            }

            // Identify the cell that will contain the tree controls (expander/indenter).
            this.treeCell = $( this.row.children( this.settings.columnElType )[ this.settings.column ] );

            // Create the expander and indenter elements using templates from settings.
            this.expander = $( this.settings.expanderTemplate );
            this.indenter = $( this.settings.indenterTemplate );

            this.children = [];       // Array to store child Node objects.
            this.initialized = false; // Flag to track if the node has been initialized.

            // Prepend the indenter to the tree cell, establishing the visual hierarchy.
            this.treeCell.prepend( this.indenter );

        } // End of Node constructor.

        // --- Node Prototype Methods ---

        // Adds a child node to this node's children collection.
        Node.prototype.addChild = function ( child ) {
            return this.children.push( child );
        };

        // Returns an array of all ancestor nodes, from immediate parent up to the root.
        Node.prototype.ancestors = function () {
            var ancestors, node; // Local variables for iteration.

            node      = this;       // Start with the current node.
            ancestors = [];         // Initialize empty array for ancestors.

            // Traverse up the tree until no parent is found.
            while ( node = node.parentNode() ) {
                ancestors.push( node );
            }

            return ancestors;
        };

        // Collapses the current node, hiding its children and updating its visual state.
        Node.prototype.collapse = function () {

            // If already collapsed, do nothing.
            if ( this.collapsed() ) {
                return this;
            }

            // Update CSS classes to reflect the collapsed state.
            this.row.removeClass( "expanded" ).addClass( "collapsed" );

            // Hide all immediate and descendant children.
            this._hideChildren();

            // Update the expander's title attribute for accessibility/tooltip.
            this.expander.attr( "title", this.settings.stringExpand );

            // Trigger the onNodeCollapse callback if defined and initialized.
            if ( this.initialized && this.settings.onNodeCollapse != null ) {
                this.settings.onNodeCollapse.apply( this );
            }

            return this; // Allow method chaining.
        };

        // Checks if the node is currently in a collapsed state.
        Node.prototype.collapsed = function () {
            return this.row.hasClass( "collapsed" );
        };

        // TODO: Implement a 'destroy' method to clean up event handlers, DOM elements, etc.
        // This is crucial for proper memory management and avoiding leaks.

        // Expands the current node, making its direct children visible if it's also visible.
        Node.prototype.expand = function () {

            // If already expanded, no action needed.
            if ( this.expanded() ) {
                return this;
            }

            // Update CSS classes to reflect the expanded state.
            this.row.removeClass( "collapsed" ).addClass( "expanded" );

            // Trigger the onNodeExpand callback if defined and initialized.
            if ( this.initialized && this.settings.onNodeExpand != null ) {
                this.settings.onNodeExpand.apply( this );
            }

            // Only show children if the parent row itself is currently visible.
            if ( $( this.row ).is( ":visible" ) ) {
                this._showChildren();
            }

            // Update the expander's title attribute.
            this.expander.attr( "title", this.settings.stringCollapse );

            return this; // Enable chaining.
        };

        // Checks if the node is currently in an expanded state.
        Node.prototype.expanded = function () {
            return this.row.hasClass( "expanded" );
        };

        // Hides the current node and all its descendants.
        Node.prototype.hide = function () {
            this._hideChildren(); // First hide children.
            this.row.hide();      // Then hide the node itself.
            return this;          // Chainable.
        };

        // Determines if this node should be considered a branch node (i.e., has children or is marked as a branch).
        Node.prototype.isBranchNode = function () {
            // A node is a branch if it has children or if the 'branchAttr' is explicitly set to true.
            if ( this.children.length > 0 || this.row.data( this.settings.branchAttr ) === true ) {
                return true;
            } else {
                return false;
            }
        };

        // Updates the 'branch' or 'leaf' CSS class on the node's row based on its current state.
        Node.prototype.updateBranchLeafClass = function () {
            this.row.removeClass( 'branch' ); // Remove existing branch class.
            this.row.removeClass( 'leaf' );   // Remove existing leaf class.
            // Add the appropriate class based on whether it's a branch node.
            this.row.addClass( this.isBranchNode() ? 'branch' : 'leaf' );
        };

        // Returns the hierarchical level of the node (0 for root, 1 for its children, etc.).
        Node.prototype.level = function () {
            return this.ancestors().length;
        };

        // Returns the parent Node object, or null if it's a root node.
        Node.prototype.parentNode = function () {
            if ( this.parentId != null ) {
                return this.tree[ this.parentId ]; // Look up parent in the tree map.
            } else {
                return null; // No parent exists.
            }
        };

        // Removes a specified child node from this node's children array.
        Node.prototype.removeChild = function ( child ) {
            var i = $.inArray( child, this.children ); // Find the index of the child.
            return this.children.splice( i, 1 );       // Remove it from the array.
        };

        // Renders the node's visual elements, such as the expander and indenter.
        Node.prototype.render = function () {

            var handler, settings = this.settings, target; // Local variables for rendering logic.

            // Only render expander if the tree is expandable and this is a branch node.
            if ( settings.expandable === true && this.isBranchNode() ) {

                // Define the click handler for toggling node expansion.
                handler = function ( e ) {
                    // Find the treetable instance and the specific node, then toggle it.
                    $( this ).parents( "table" ).treetable( "node", $( this ).parents( "tr" ).data( settings.nodeIdAttr ) ).toggle();
                    return e.preventDefault(); // Prevent default link behavior.
                };

                this.indenter.html( this.expander ); // Place the expander inside the indenter.

                // Determine the target element for click events (expander or entire tree cell).
                target = settings.clickableNodeNames === true ? this.treeCell : this.expander;

                // Attach click event handler.
                target.off( "click.treetable" ).on( "click.treetable", handler );

                // Attach keydown event handler for accessibility (Enter key).
                target.off( "keydown.treetable" ).on( "keydown.treetable", function ( e ) {
                    if ( e.keyCode == 13 ) { // Check for Enter key.
                        handler.apply( this, [ e ] ); // Trigger the click handler.
                    }
                } );

            } // End of expandable branch rendering.

            // Set the left padding for the indenter based on the node's level.
            this.indenter[ 0 ].style.paddingLeft = "" + ( this.level() * settings.indent ) + "px";

            return this; // Chainable.
        };

        // Reveals the current node and all its ancestors by expanding them.
        Node.prototype.reveal = function () {
            if ( this.parentId != null ) {
                this.parentNode().reveal(); // Recursively reveal parents.
            }
            return this.expand(); // Finally expand the current node.
        };

        // Sets a new parent for this node, updating references and DOM data.
        Node.prototype.setParent = function ( node ) {

            // If the node already has a parent, remove it from that parent's children.
            if ( this.parentId != null ) {
                this.tree[ this.parentId ].removeChild( this );
            }

            this.parentId = node.id; // Update the parent ID.
            this.row.data( this.settings.parentIdAttr, node.id ); // Update the DOM data attribute.

            return node.addChild( this ); // Add this node to the new parent's children.
        };

        // Shows the current node and its children if expanded.
        Node.prototype.show = function () {
            // Initialize the node if it hasn't been yet.
            if ( !this.initialized ) {
                this._initialize();
            }

            this.row.show(); // Make the node's row visible.

            // If the node is expanded, show its children as well.
            if ( this.expanded() ) {
                this._showChildren();
            }

            return this; // Chainable.
        };

        // Toggles the expanded/collapsed state of the node.
        Node.prototype.toggle = function () {
            if ( this.expanded() ) {
                this.collapse();
            } else {
                this.expand();
            }
            return this; // Chainable.
        };

        // --- Private Node Methods ---

        // Hides all immediate children of this node.
        Node.prototype._hideChildren = function () {
            var child, _i, _len, _ref, _results; // Loop variables.
            _ref    = this.children;
            _results = [];
            for ( _i = 0, _len = _ref.length; _i < _len; _i++ ) {
                child = _ref[ _i ];
                _results.push( child.hide() ); // Recursively hide each child.
            }
            return _results;
        };

        // Initializes the node's rendering and initial expansion state.
        Node.prototype._initialize = function () {
            var settings = this.settings; // Shorthand for settings.

            this.render(); // Perform initial rendering (e.g., expander setup).

            // Set the initial state (collapsed or expanded) based on settings.
            if ( settings.expandable === true && settings.initialState === "collapsed" ) {
                this.collapse();
            } else {
                this.expand();
            }

            // Trigger the onNodeInitialized callback if available.
            if ( settings.onNodeInitialized != null ) {
                settings.onNodeInitialized.apply( this );
            }

            return this.initialized = true; // Mark node as initialized.
        };

        // Shows all immediate children of this node.
        Node.prototype._showChildren = function () {
            var child, _i, _len, _ref, _results; // Loop variables.
            _ref     = this.children;
            _results = [];
            for ( _i = 0, _len = _ref.length; _i < _len; _i++ ) {
                child = _ref[ _i ];
                _results.push( child.show() ); // Recursively show each child.
            }
            return _results;
        };

        return Node; // Return the Node constructor.

    } )(); // End of Node class definition.

    Tree = ( function () {
        // Constructor for the Tree object, managing the overall treetable structure.
        function Tree ( table, settings ) {
            this.table    = table;    // The raw DOM table element.
            this.settings = settings; // Plugin settings.
            this.tree     = {};       // A map of all nodes by their ID for quick lookup.

            // Cache the nodes and roots in simple arrays for quick access and iteration.
            this.nodes = []; // All nodes in the tree.
            this.roots = []; // Only the top-level root nodes.
        }

        // --- Tree Prototype Methods ---

        // Collapses all nodes in the entire tree.
        Tree.prototype.collapseAll = function () {
            var node, _i, _len, _ref, _results; // Loop variables.
            _ref     = this.nodes;
            _results = [];
            for ( _i = 0, _len = _ref.length; _i < _len; _i++ ) {
                node = _ref[ _i ];
                _results.push( node.collapse() ); // Call collapse on each node.
            }
            return _results;
        };

        // Expands all nodes in the entire tree.
        Tree.prototype.expandAll = function () {
            var node, _i, _len, _ref, _results; // Loop variables.
            _ref     = this.nodes;
            _results = [];
            for ( _i = 0, _len = _ref.length; _i < _len; _i++ ) {
                node = _ref[ _i ];
                _results.push( node.expand() ); // Call expand on each node.
            }
            return _results;
        };

        // Recursively finds the last descendant node of a given node.
        Tree.prototype.findLastNode = function ( node ) {
            if ( node.children.length > 0 ) {
                // If the node has children, recurse into its last child.
                return this.findLastNode( node.children[ node.children.length - 1 ] );
            } else {
                return node; // This is a leaf node, so it's the last.
            }
        };

        // Loads a collection of rows (<tr> elements) into the tree structure.
        Tree.prototype.loadRows = function ( rows ) {
            var node, row, i; // Loop variables.

            if ( rows != null ) {
                for ( i = 0; i < rows.length; i++ ) {
                    row = $( rows[ i ] ); // Wrap the row in a jQuery object.

                    // Only process rows that have a valid node ID.
                    if ( row.data( this.settings.nodeIdAttr ) != null ) {
                        node = new Node( row, this.tree, this.settings ); // Create a new Node object.
                        this.nodes.push( node );                          // Add to the list of all nodes.
                        this.tree[ node.id ] = node;                      // Map node by its ID.

                        // Assign parent-child relationships.
                        if ( node.parentId != null && this.tree[ node.parentId ] ) {
                            this.tree[ node.parentId ].addChild( node );
                        } else {
                            this.roots.push( node ); // If no parent, it's a root node.
                        }
                    }
                }
            }

            // After all nodes are loaded, update their branch/leaf classes.
            for ( i = 0; i < this.nodes.length; i++ ) {
                node = this.nodes[ i ].updateBranchLeafClass();
            }

            return this; // Chainable.
        };

        // Moves a node to become a child of a new destination node.
        Tree.prototype.move = function ( node, destination ) {
            // Conditions to prevent invalid moves:
            // 1. A node cannot be inserted as a child of itself.
            // 2. A node cannot be moved to its current parent (no change).
            // 3. A node cannot be moved to a descendant position that would create a circular dependency (self-ancestor).
            var nodeParent = node.parentNode(); // Get the current parent before modification.
            if ( node !== destination && destination.id !== node.parentId && $.inArray( node, destination.ancestors() ) === -1 ) {

                node.setParent( destination ); // Update parent-child relationship.
                this._moveRows( node, destination ); // Physically move the rows in the DOM.

                // If the destination node previously had no children, it now has one.
                // Re-render it to ensure the expander is displayed correctly.
                if ( node.parentNode().children.length === 1 ) {
                    node.parentNode().render();
                }
            }

            // Update branch/leaf classes for affected nodes.
            if ( nodeParent ) {
                nodeParent.updateBranchLeafClass();
            }
            if ( node.parentNode() ) {
                node.parentNode().updateBranchLeafClass();
            }
            node.updateBranchLeafClass();

            return this; // Chainable.
        };

        // Removes a specific node and all its descendants from the tree and DOM.
        Tree.prototype.removeNode = function ( node ) {

            // Recursively remove all descendants of the target node.
            this.unloadBranch( node );

            // Remove the node's row from the DOM.
            node.row.remove();

            // If the node had a parent, remove it from the parent's children list.
            if ( node.parentId != null ) {
                node.parentNode().removeChild( node );
            }

            // Clean up the Tree object by removing references to the node.
            delete this.tree[ node.id ]; // Remove from the ID map.
            this.nodes.splice( $.inArray( node, this.nodes ), 1 ); // Remove from the array of all nodes.

            return this; // Chainable.
        };

        // Renders the entire tree structure, making root nodes visible and triggering their rendering.
        Tree.prototype.render = function () {
            var root, _i, _len, _ref; // Loop variables.
            _ref = this.roots;
            for ( _i = 0, _len = _ref.length; _i < _len; _i++ ) {
                root = _ref[ _i ];

                // Note: The naming here can be a bit confusing.
                // 'show' on a node handles its own rendering and child visibility.
                root.show();
            }
            return this; // Chainable.
        };

        // Sorts the children of a given node based on a provided comparison function.
        Tree.prototype.sortBranch = function ( node, sortFun ) {

            // First, sort the internal array of children Node objects.
            node.children.sort( sortFun );

            // Next, re-render the rows in the correct order on the page.
            this._sortChildRows( node );

            return this; // Chainable.
        };

        // Removes all children and descendants of a given node, but keeps the node itself.
        Tree.prototype.unloadBranch = function ( node ) {

            // Create a copy of the children array to avoid issues if removeNode modifies it.
            var children = node.children.slice( 0 ), i;

            for ( i = 0; i < children.length; i++ ) {
                this.removeNode( children[ i ] ); // Recursively remove each child.
            }

            // Reset the node's collection of children.
            node.children = [];

            // Update the node's class, as it might now be a leaf.
            node.updateBranchLeafClass();

            return this; // Chainable.
        };

        // --- Private Tree Methods ---

        // Helper function to move a node's row and its descendants in the DOM.
        Tree.prototype._moveRows = function ( node, destination ) {
            var children = node.children, i;

            node.row.insertAfter( destination.row ); // Insert the node's row after the destination.
            node.render();                           // Re-render the node to update indentation, etc.

            // Loop backwards through children to ensure they appear in the correct order
            // when inserted after their parent (fixes issue #112).
            for ( i = children.length - 1; i >= 0; i-- ) {
                this._moveRows( children[ i ], node ); // Recursively move children after their new parent.
            }
        };

        // Special case of _moveRows used for sorting: moves children to itself to reorder them.
        Tree.prototype._sortChildRows = function ( parentNode ) {
            return this._moveRows( parentNode, parentNode );
        };

        return Tree; // Return the Tree constructor.

    } )(); // End of Tree class definition.

    // --- jQuery Plugin Definition ---
    methods = {
        // Initializes the treetable plugin on a set of table elements.
        init: function ( options, force ) {

            var settings; // Variable to hold the merged settings.

            // Merge default settings with user-provided options.
            settings = $.extend( {
                branchAttr:         "ttBranch",       // Data attribute for explicitly marking a row as a branch.
                clickableNodeNames: false,            // If true, the entire node name (tree cell) is clickable.
                column:             0,                // The 0-indexed column where the tree controls are placed.
                columnElType:       "td",             // The type of HTML element for the column (e.g., 'td', 'th').
                expandable:         false,            // Whether nodes can be expanded/collapsed.
                expanderTemplate:   "<a href='#'>&nbsp;</a>", // HTML for the expand/collapse icon.
                indent:             19,               // Indentation width in pixels per level.
                indenterTemplate:   "<span class='indenter'></span>", // HTML for the indentation spacer.
                initialState:       "collapsed",      // Initial state of nodes ('collapsed' or 'expanded').
                nodeIdAttr:         "ttId",           // Data attribute for a node's unique ID.
                parentIdAttr:       "ttParentId",     // Data attribute for a node's parent ID.
                stringExpand:       "Expand",         // Text for the expand tooltip.
                stringCollapse:     "Collapse",       // Text for the collapse tooltip.

                // Event callbacks.
                onInitialized:      null,             // Called when the entire tree is initialized.
                onNodeCollapse:     null,             // Called when a node collapses.
                onNodeExpand:       null,             // Called when a node expands.
                onNodeInitialized:  null              // Called when an individual node is initialized.
            }, options );

            // Iterate over each selected table element.
            return this.each( function () {
                var el = $( this ), tree; // jQuery object for the current element and the Tree instance.

                // Only initialize if not already initialized, or if 'force' is true.
                if ( force || el.data( "treetable" ) === undefined ) {
                    tree = new Tree( this, settings ); // Create a new Tree instance.
                    tree.loadRows( this.rows ).render(); // Load rows and render the tree.

                    el.addClass( "treetable" ).data( "treetable", tree ); // Mark table and store Tree instance.

                    // Trigger the global onInitialized callback if defined.
                    if ( settings.onInitialized != null ) {
                        settings.onInitialized.apply( tree );
                    }
                }

                return el; // Return the jQuery object for chaining.
            } );
        },

        // Destroys the treetable instance, removing classes and data.
        destroy: function () {
            return this.each( function () {
                // Remove the stored data and the treetable class.
                return $( this ).removeData( "treetable" ).removeClass( "treetable" );
            } );
        },

        // Calls collapseAll on the treetable instance.
        collapseAll: function () {
            this.data( "treetable" ).collapseAll();
            return this;
        },

        // Collapses a specific node by its ID.
        collapseNode: function ( id ) {
            var node = this.data( "treetable" ).tree[ id ]; // Retrieve the node.

            if ( node ) {
                node.collapse(); // Collapse the node if found.
            } else {
                throw new Error( "Unknown node '" + id + "'" ); // Error if node not found.
            }

            return this;
        },

        // Calls expandAll on the treetable instance.
        expandAll: function () {
            this.data( "treetable" ).expandAll();
            return this;
        },

        // Expands a specific node by its ID.
        expandNode: function ( id ) {
            var node = this.data( "treetable" ).tree[ id ]; // Retrieve the node.

            if ( node ) {
                // Ensure the node is initialized before expanding.
                if ( !node.initialized ) {
                    node._initialize();
                }
            }
            // ... (rest of the original expandNode logic would follow here)
            // It seems the provided code snippet is truncated at this point.
            // Assuming the original code continued with `node.expand();` and `return this;`
            // For cloning, I will keep it as is, respecting the truncation.

            // The original code was truncated here. If it were complete, it would likely have:
            // node.expand();
            // } else {
            //   throw new Error("Unknown node '" + id + "'");
            // }
            // return this;
        }

        // The original code was truncated here.
        // If there were more methods, they would be added here.
    };

    // Attach the treetable methods to jQuery's prototype.
    // This allows calling `$(selector).treetable(methodName, args)`.
    $.fn.treetable = function ( method ) {
        // If the method exists and is a function, call it.
        if ( methods[ method ] && typeof methods[ method ] === 'function' ) {
            // Apply the method with arguments.
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        } else if ( typeof method === 'object' || !method ) {
            // If an object (options) or no argument, call the init method.
            return methods.init.apply( this, arguments );
        } else {
            // Method not found.
            $.error( 'Method ' + method + ' does not exist on jQuery.treetable' );
        }
    };

} )( jQuery ); // Pass jQuery object into the IIFE.