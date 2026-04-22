class   Tree
{
    // A comment about the Tree class itself.
    static get   Node()
    {
        /*
         * This static getter returns the definition
         * of the inner Node class.
         */
        return class
        {
            // Node constructor.
            constructor (  id  ,  parentId  , childrenIds  ,  depth )
            {
                // Assigning unique identifier.
                this.id         =      id      ;
                // Assigning parent's identifier. A value of -1 indicates no parent.
                this.parentId   =      parentId ;
                // Assigning an array of children identifiers.
                this.childrenIds = childrenIds  ;
                // Assigning the depth of the node in the tree structure.
                this.depth      =      depth    ;
            }


            // Getter for determining the type of the node.
            get type (  )
            {
                // If parentId is -1, it's the root of the tree.
                if (  this.parentId   ===   -1  )
                    return   'root'   ;

                // If childrenIds array is empty, it's a leaf node.
                if (  this.childrenIds.length   ===   0  )
                    return   'leaf'   ;

                // Otherwise, it's an internal node.
                return   'internal node'   ;
            }


            // Provides a string representation of the node.
            toString   (  )
            {
                // Using template literals for easy string formatting.
                return   `node ${  this.id  }: parent = ${  this.parentId  }, depth = ${  this.depth  }, ${  this.type  }, [${  this.childrenIds.join(', ')  }]`   ;
            }
        }   ;
    }


    // Constructor for the Tree class.
    constructor (  )
    {
        // Initializes an array to store all tree nodes, indexed by their ID.
        this.nodes   =   [ ]   ;
    }


    // Method to add a node and its children relationships to the tree.
    add   (  id  ,  childrenIds  )
    {
        // Ensure the node exists or create a new one as a root initially.
        this.nodes[id]   =   this.nodes[id]   ||   new   Tree.Node(  id  ,  -1  ,  childrenIds  ,  0  )   ;

        // Get a reference to the current node.
        let   node   =   this.nodes[id]   ;
        // Update the children IDs for the current node.
        node.childrenIds   =   childrenIds   ;

        // Declare a variable for child node reference.
        let   c   ;

        // Process children only if the node has any.
        if (  childrenIds.length   !==   0  )
        {
            // Iterate over each child ID.
            childrenIds.forEach(   (  cid  )   =>
            {
                // Ensure the child node exists or create it, linking it to the current node.
                c   =   this.nodes[cid]   ||   new   Tree.Node(  cid  ,  id  ,  [ ]  ,  node.depth  )   ;
                // Set the parent ID of the child.
                c.parentId   =   id   ;
                // Set the depth of the child (initially same as parent).
                c.depth   =   node.depth   ;
                // Store the child node in the nodes array.
                this.nodes[cid]   =   c   ;
                // Increment the depth of the child and its descendants.
                this.incrementDepth(  cid  )   ;
            }   )   ;
        }
    }


    // Recursively increments the depth of a node and its descendants.
    incrementDepth   (  id  )
    {
        // If the node does not exist, do nothing.
        if (  !this.nodes[id]  )
            return   ;

        // If it's a leaf node, just increment its depth.
        if (  this.nodes[id].childrenIds.length   ===   0  )
        {
            this.nodes[id].depth   +=   1   ;
            return   ;
        }

        // If it has children, increment their depths recursively.
        this.nodes[id].childrenIds.forEach(   (  eid  )   =>   this.incrementDepth(  eid  )   )   ;
    }


    // Prints all nodes in the tree, sorted by ID.
    print   (  )
    {
        // Log the string representation of all nodes, each on a new line.
        console.log(   this.nodes.sort(   (  a  ,  b  )   =>   a.id   -   b.id   ).map(   n   =>   n.toString(  )   ).join('\n')   )   ;
    }
}


// Immediately Invoked Function Expression (IIFE) for the main execution logic.
(   function   main   (   )
{
    // Load the 'fs' module for file system operations.
    const   lines   =   require('fs').readFileSync(   '/dev/stdin'  ,   'utf8'   ).trim(   ).split('\n')   ;
    // The first line contains the number of nodes (not used in this specific implementation, but often present).
    const   n   =   Number(   lines.shift(   )   )   ;

    // Create a new Tree instance.
    let   tree   =   new   Tree(   )   ;

    // Declare variables to hold parsed input.
    let   id  ,   k  ,   childrenIds   ;

    // Process each remaining line to build the tree.
    lines.map(   l   =>   l.split(' ')   ).forEach(   function(  line  )
    {
        // Parse the node ID.
        id   =   Number(   line.shift(   )   )   ;
        // Parse the number of children (k).
        k   =   Number(   line.shift(   )   )   ;
        // Parse the children IDs.
        childrenIds   =   line.map(   Number   )   ;
        // Add the node and its children to the tree.
        tree.add(  id  ,   childrenIds  )   ;
    }   )   ;

    // Print the final tree structure.
    tree.print(   )   ;
}   )   (   )   ;