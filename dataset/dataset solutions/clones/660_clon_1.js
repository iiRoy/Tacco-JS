let input = '';
// Initialize an empty string to store all incoming data.

process.stdin.resume();
// Keep the process alive while waiting for input.

process.stdin.setEncoding('utf8');
// Set the character encoding for input to UTF-8.

process.stdin.on('data', function (chunk) {
    // Event listener for incoming data chunks.
    input += chunk; // Append each data chunk to the 'input' string.
});

process.stdin.on('end', function () {
    // Event listener for when all input data has been received.

    const inputs = input.split('\n');
    // Split the accumulated input string into an array of lines.

    /*
     * Defines a Node class for representing elements in a binary tree structure.
     * Each node can have a left child, a right child, and a reference to its parent.
     */
    class Node {

        constructor() {
            // Constructor initializes a new Node instance.
            this.left = null;   // Left child pointer, initially null.
            this.right = null;  // Right child pointer, initially null.
            this.parent = null; // Parent pointer, initially null.
        }

        insertLeft(node) {
            // Method to insert a node as the left child.
            this.left = node;     // Set the current node's left child.
            node.parent = this;   // Set the inserted node's parent to the current node.
        }

        insertRight(node) {
            // Method to insert a node as the right child.
            this.right = node;    // Set the current node's right child.
            node.parent = this;   // Set the inserted node's parent to the current node.
        }

        toString() {
            // Returns a string representation of the node and its children.
            // This is a recursive representation for debugging or output.
            return `(${this.left == null ? '' : this.left.toString()},${this.right == null ? '' : this.right.toString()})`;
        }
    }

    // Function to parse a string representation into a tree structure.
    const createTree = str => {
        const root = new Node(); // Create a dummy root node.
        let tree = root;         // 'tree' will act as the current node during parsing.
        let comma = 0;           // Flag to determine if the next child is left (0) or right (1).

        for (const s of str) { // Iterate over each character in the input string.
            if (s == "(") {
                // If an opening parenthesis is encountered, a new child node is created.
                const child = new Node();
                if (comma == 0) {
                    // If 'comma' is 0, insert as a left child.
                    tree.insertLeft(child);
                } else {
                    // Otherwise, insert as a right child.
                    tree.insertRight(child);
                }
                tree = child; // Move the current 'tree' pointer to the newly created child.
            }
            if (s == ",") {
                // If a comma is encountered, it means the next child will be a right child.
                comma = 1;
            }
            if (s == ")") {
                // If a closing parenthesis is encountered, move up to the parent node.
                tree = tree.parent;
                comma = 0; // Reset comma flag for the next potential sibling.
            }
        }
        return tree.left; // Return the left child of the dummy root, which is the actual root of the parsed tree.
    }

    /*
     * Performs a union operation on two tree structures.
     * The union tree contains a node if it exists in either tree 'a' or tree 'b'.
     */
    const union = (a, b) => {
        const node = new Node(); // Create a new node for the result.

        if (a == null) {
            // If tree 'a' is null, the union is just tree 'b'.
            return b;
        }
        if (b == null) {
            // If tree 'b' is null, the union is just tree 'a'.
            return a;
        }

        let _res = union(a.left, b.left); // Recursively union the left subtrees.
        if (_res != null) {
            // If the union of left subtrees is not null, insert it as the left child.
            node.insertLeft(_res);
        }

        _res = union(a.right, b.right); // Recursively union the right subtrees.
        if (_res != null) {
            // If the union of right subtrees is not null, insert it as the right child.
            node.insertRight(_res);
        }

        return node; // Return the resulting union node.
    };

    /*
     * Performs an intersection operation on two tree structures.
     * The intersection tree contains a node only if it exists in both tree 'a' and tree 'b'.
     */
    const intersection = (a, b) => {
        const node = new Node(); // Create a new node for the result.

        if (a == null || b == null) {
            // If either tree 'a' or tree 'b' is null, there's no intersection.
            return null;
        }

        let _res = intersection(a.left, b.left); // Recursively intersect the left subtrees.
        if (_res != null) {
            // If the intersection of left subtrees is not null, insert it as the left child.
            node.insertLeft(_res);
        }

        _res = intersection(a.right, b.right); // Recursively intersect the right subtrees.
        if (_res != null) {
            // If the intersection of right subtrees is not null, insert it as the right child.
            node.insertRight(_res);
        }

        return node; // Return the resulting intersection node.
    };

    // Main processing loop for each input line.
    for (const input of inputs) {
        // Skip empty lines that might result from splitting.
        if (input.trim() === '') {
            continue;
        }

        // Destructure the input line into type, treeStr, and treeStr2.
        const [type, treeStr, treeStr2] = input.split(' ');

        // Create the first tree from its string representation.
        const tree = createTree(treeStr);
        // Create the second tree from its string representation.
        const tree2 = createTree(treeStr2);

        let res; // Variable to store the result of the operation.

        if (type == "u") {
            // If the type is 'u', perform a union operation.
            res = union(tree, tree2);
        } else if (type == "i") {
            // If the type is 'i', perform an intersection operation.
            res = intersection(tree, tree2);
        }
        // Note: The original code does not print the result.
        // If printing were desired, it would go here, e.g., console.log(res.toString());
    }
});