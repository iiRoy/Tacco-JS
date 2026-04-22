/*
 * This is a Type I clone of an existing JavaScript binary tree implementation.
 * Only whitespace and comments have been altered.
 * All identifiers, operators, and expressions remain strictly identical.
 */

// Define a private Node class for the binary tree structure
class _Node
{

    // The constructor initializes a new node with a key and optional child references.
    constructor(key, left = null, right = null)
    {
        // Store the value of the node
        this.key = key;
        // Reference to the left child node
        this.left = left;
        // Reference to the right child node
        this.right = right;
    } // End of _Node constructor

} // End of _Node class definition


// Define the main BinaryTree class
class BinaryTree
{

    // The constructor initializes an empty binary tree
    constructor()
    {
        // The root of the tree, initially null
        this.root = null;
    } // End of BinaryTree constructor


    // Static getter to expose the internal Node class
    static get Node()
    {
        return _Node; // Return the _Node class
    }


    // Inserts a new key into the binary search tree
    insert(key)
    {
        // Initialize the root with the first key
        this.root = new BinaryTree.Node(key);

        /*
         * After the first insertion, reassign the insert method
         * to handle subsequent insertions for a non-empty tree.
         */
        this.insert = (key) =>
        {
            let x = this.root, // Current node, starting from root
                y;              // Parent of the current node

            // Create a new node to be inserted
            let newNode = new BinaryTree.Node(key);

            // Traverse the tree to find the correct insertion point
            while (x !== null)
            {
                y = x; // Keep track of the parent node
                // Move left or right based on the key comparison
                x = x[key < x.key ? 'left' : 'right'];
            }

            // Insert the new node as a child of the parent (y)
            y[key < y.key ? 'left' : 'right'] = newNode;
        }; // End of re-assigned insert method
    } // End of initial insert method


    // Searches for a key in the binary tree
    find(key, n = this.root)
    {
        // If the current node is null, the key is not found
        if (n === null) return false;

        // If the current node's key matches, the key is found
        if (n.key === key) return true;

        // Recursively search in the left or right subtree
        return this.find(key, n[key < n.key ? 'left' : 'right']);
    } // End of find method


    // Prints the tree elements in in-order traversal
    printByIneorder()
    {
        let str = ''; // Accumulator for the output string

        // Inner recursive function for in-order traversal
        const innerFunc = (n) =>
        {
            // Base case: if node is null, return
            if (n === null) return;

            // Traverse left subtree
            innerFunc(n.left);
            // Visit current node
            str += ` ${n.key}`;
            // Traverse right subtree
            innerFunc(n.right);
        }

        // Start the traversal from the root
        innerFunc(this.root);
        // Output the result to console
        console.log(str);
    } // End of printByIneorder method


    // Prints the tree elements in pre-order traversal
    printByPreorder()
    {
        let str = ''; // Accumulator for the output string

        // Inner recursive function for pre-order traversal
        const innerFunc = (n) =>
        {
            // Base case: if node is null, return
            if (n === null) return;

            // Visit current node
            str += ` ${n.key}`;
            // Traverse left subtree
            innerFunc(n.left);
            // Traverse right subtree
            innerFunc(n.right);
        }

        // Start the traversal from the root
        innerFunc(this.root);
        // Output the result to console
        console.log(str);
    } // End of printByPreorder method


    // Prints the tree using both in-order and pre-order traversals
    print()
    {
        // Call the in-order print method
        this.printByIneorder();
        // Call the pre-order print method
        this.printByPreorder();
    } // End of print method

} // End of BinaryTree class definition


// Main execution block using an Immediately Invoked Function Expression (IIFE)
(function main()
{
    // Read input from stdin, decode as UTF-8, trim whitespace, and split into lines
    const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    // The first line is the number of operations (not used in this specific implementation logic)
    const n = Number(lines.shift());

    // Create a new instance of the BinaryTree
    const tree = new BinaryTree();

    // Iterate over each command line
    lines.forEach(function(cmd)
    {
        // Determine action based on the first character of the command
        switch(cmd.charAt(0))
        {
        case 'i': // Insert command
            // Parse the key and insert it into the tree
            tree.insert(Number(cmd.split(' ')[1]));
            break;
        case 'f': // Find command
            // Parse the key, find it, and print 'yes' or 'no'
            console.log(tree.find(Number(cmd.split(' ')[1])) ? 'yes' : 'no');
            break;
        default: // Print command (any other character, typically 'p')
            // Print the tree contents
            tree.print();
        } // End of switch statement
    }); // End of forEach loop

})(); // End of main IIFE