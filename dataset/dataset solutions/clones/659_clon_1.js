/*
* This JavaScript code processes operations on binary tree structures.
* It reads tree definitions and operation types from standard input,
* performs either a union or an intersection operation on two trees,
* and then outputs the string representation of the resulting tree.
*/

// Global variable to accumulate all data read from standard input.
let input = '';

// Ensures the standard input stream remains open and active to receive data.
process.stdin.resume();
// Configures the standard input stream to interpret incoming data as UTF-8 encoded text.
process.stdin.setEncoding('utf8');

// Event listener for the 'data' event, triggered when new input data is available.
process.stdin.on('data', function(chunk) {
    // Appends each received 'chunk' of data to the 'input' string.
    // This collects all input until the stream ends.
    input += chunk;
});


// Event listener for the 'end' event, fired when the standard input stream has finished.
// All subsequent processing of the collected input occurs within this callback.
process.stdin.on('end', function() {

    // Splits the accumulated input string into an array of individual lines.
    // Each line is expected to represent a single tree operation.
    const inputs = input.split('\n');


    /*
     * Defines the Node class, which serves as the fundamental building block for binary trees.
     * Each instance of Node can store references to its left child, right child, and parent.
     */
    class Node {
        // The constructor initializes a new Node object with null references for its connections.
        constructor() {
            this.left = null;   // Reference to the left child node.
            this.right = null;  // Reference to the right child node.
            this.parent = null; // Reference to the parent node.
        }

        /**
         * Inserts a specified node as the left child of the current node.
         * This method also updates the parent reference of the inserted node.
         * @param {Node} node - The node to be set as the left child.
         */
        insertLeft(node) {
            this.left = node;       // Assigns the provided 'node' to the 'left' property.
            node.parent = this;     // Sets the 'parent' of the inserted node to the current node ('this').
        }

        /**
         * Inserts a specified node as the right child of the current node.
         * This method also updates the parent reference of the inserted node.
         * @param {Node} node - The node to be set as the right child.
         */
        insertRight(node) {
            this.right = node;      // Assigns the provided 'node' to the 'right' property.
            node.parent = this;     // Sets the 'parent' of the inserted node to the current node ('this').
        }

        /**
         * Generates a string representation of the subtree rooted at this node.
         * The format is a recursive parenthesized string, e.g., "((),())".
         * An empty string is used to represent null children within the structure.
         * @returns {string} The string form of the tree.
         */
        toString() {
            // Uses template literals and ternary operators for concise string construction.
            return `(${this.left == null ? '' : this.left.toString()},${this.right == null ? '' : this.right.toString()})`;
        }
    }


    /**
     * Constructs a binary tree data structure from a given string representation.
     * The input string uses parentheses and commas to delineate tree nodes and their children.
     * Example string format: "((),())" or "()".
     * @param {string} str - The string representation of the tree to be created.
     * @returns {Node} The root node of the fully constructed tree (specifically, the left child of an initial dummy root).
     */
    const createTree = str => {
        // A temporary 'root' node is created to simplify the logic for the very first insertion.
        const root = new Node();
        let tree = root;        // 'tree' acts as a dynamic pointer, moving through the tree during construction.
        let comma = 0;          // A flag: 0 indicates insertion as a left child, 1 indicates a right child.

        // Iterates over each character in the input string to build the tree.
        for (const s of str) {
            // When an opening parenthesis is encountered, a new child node is initiated.
            if (s == "(") {
                const child = new Node();   // Creates a new Node instance.
                if (comma == 0) {           // If the 'comma' flag is 0, insert as a left child.
                    tree.insertLeft(child);
                } else {                    // Otherwise (if 'comma' is 1), insert as a right child.
                    tree.insertRight(child);
                }
                tree = child;               // Move the current 'tree' pointer to the newly created child node.
            }
            // If a comma is found, it signals that the next child to be inserted should be a right child.
            if (s == ",") {
                comma = 1;
            }
            // If a closing parenthesis is found, it means we've completed a subtree, so move up to the parent.
            if (s == ")") {
                tree = tree.parent;         // Navigates the 'tree' pointer back to its parent.
                comma = 0;                  // Resets the 'comma' flag for subsequent sibling/child insertions.
            }
        }
        // The actual tree structure is rooted at the left child of the initial dummy 'root' node.
        return tree.left;
    };


    /**
     * Recursively computes the union of two binary trees.
     * The union tree will have a node at a given position if a node exists
     * at that same position in either of the input trees (or both).
     * @param {Node} a - The root of the first tree or subtree.
     * @param {Node} b - The root of the second tree or subtree.
     * @returns {Node} The root of the resulting union tree or subtree. Returns null if both input trees are null.
     */
    const union = (a, b) => {
        // Creates a new node to represent the result of the union at the current level of recursion.
        const node = new Node();

        // Base cases for recursion:
        // If the first tree is null, the union at this point is simply the second tree.
        if (a == null) {
            return b;
        }
        // If the second tree is null, the union at this point is simply the first tree.
        if (b == null) {
            return a;
        }

        // Recursively compute the union of the left subtrees.
        let _res = union(a.left, b.left);
        if (_res != null) {         // If the resulting left union is not null, attach it as the left child.
            node.insertLeft(_res);
        }

        // Recursively compute the union of the right subtrees.
        _res = union(a.right, b.right);
        if (_res != null) {         // If the resulting right union is not null, attach it as the right child.
            node.insertRight(_res);
        }

        return node; // Returns the newly constructed node representing the union at this level.
    };


    /**
     * Recursively computes the intersection of two binary trees.
     * The intersection tree will only have a node at a given position if a node exists
     * at that identical position in *both* of the input trees.
     * @param {Node} a - The root of the first tree or subtree.
     * @param {Node} b - The root of the second tree or subtree.
     * @returns {Node} The root of the resulting intersection tree or subtree. Returns null if either input tree is null.
     */
    const intersection = (a, b) => {
        // Creates a new node to represent the result of the intersection at the current level of recursion.
        const node = new Node();

        // Base case for recursion:
        // If either of the input trees (or subtrees) is null, there can be no intersection at this position.
        if (a == null || b == null) {
            return null;
        }

        // Recursively compute the intersection of the left subtrees.
        let _res = intersection(a.left, b.left);
        if (_res != null) {         // If the resulting left intersection is not null, attach it as the left child.
            node.insertLeft(_res);
        }

        // Recursively compute the intersection of the right subtrees.
        _res = intersection(a.right, b.right);
        if (_res != null) {         // If the resulting right intersection is not null, attach it as the right child.
            node.insertRight(_res);
        }

        return node; // Returns the newly constructed node representing the intersection at this level.
    };


    // Iterates through each line of input to process individual tree operations.
    for (const input of inputs) {
        // Splits each input line into its components: operation type, first tree string, and second tree string.
        const [type, treeStr, treeStr2] = input.split(' ');

        // Constructs the first binary tree from its string representation.
        const tree = createTree(treeStr);
        // Constructs the second binary tree from its string representation.
        const tree2 = createTree(treeStr2);

        let res; // Declares a variable to store the result of the tree operation.

        // Conditional logic to determine which tree operation to perform based on the 'type' string.
        if (type == "u") {
            res = union(tree, tree2); // Executes the union operation if 'type' is "u".
        } else if (type == "i") {
            res = intersection(tree, tree2); // Executes the intersection operation if 'type' is "i".
        }

        // Prints the string representation of the resulting tree to the console (standard output).
        console.log(res.toString());
    }
});