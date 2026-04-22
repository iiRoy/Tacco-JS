/*
 * This file contains an implementation for processing tree data
 * and performing various tree traversals (preorder, inorder, postorder).
 * It reads tree structure from standard input.
 */

// Define configuration settings for input source and newline character.
// The commented line below shows a configuration for Windows, but the active
// configuration is set for Linux-like environments (e.g., competitive programming platforms).
// config = { input: 'tmp', newline: '\r\n' }; // Example for Windows newline.
config = { input: '/dev/stdin', newline: '\n' }; // Standard configuration for Linux systems.

// Read the entire input file synchronously.
// The content is treated as ASCII, then trimmed of leading/trailing whitespace,
// and finally split into an array of lines based on the configured newline character.
line = require('fs')
    .readFileSync(config.input, 'ascii')
    .trim()
    .split(config.newline);

// The first line of input often contains metadata (like the number of nodes)
// which is not needed for the tree construction in this specific logic.
// Therefore, it is removed from the 'line' array.
line.shift();


// Initialize an empty object to represent the tree structure.
// Each key in 'tree' will be a node's ID, and its value will be an object
// containing 'left' child ID, 'right' child ID, and a 'root' flag.
tree = {};

// Iterate over each remaining line to construct the tree.
// Each line describes a node and its children.
for (i in line)
{
    // Split the current line by space to get node ID, left child ID, and right child ID.
    ary = line[i].split(' ');

    // Assign the parsed values to the tree object.
    // Initially, every node is assumed to be a root. This flag will be updated later.
    tree[ary[0]] = { 'left': ary[1], 'right': ary[2], 'root': true };
}


// Determine the actual root node of the tree.
// A node is a root if it is not a child of any other node.
for (i in tree)
{
    // If the current node has a left child that is not '-1' (indicating no child),
    // then that left child cannot be the root of the entire tree.
    if (tree[i].left !== '-1')
    {
        tree[tree[i].left].root = false;
    }

    // Similarly, if the current node has a right child that is not '-1',
    // then that right child cannot be the root of the entire tree.
    if (tree[i].right !== '-1')
    {
        tree[tree[i].right].root = false;
    }
}

// After marking all children as non-roots, the remaining node with 'root: true'
// will be the actual root of the tree.
for (i in tree)
    if (tree[i].root) root_id = i;


/**
 * Performs a preorder traversal of the tree starting from the given node ID.
 * In a preorder traversal, the current node is visited first, then its left subtree,
 * and finally its right subtree.
 *
 * @param {string} id The ID of the current node to start the traversal from.
 * @returns {Array<string>} An array of node IDs in preorder sequence.
 */
function preorder(id)
{
    // Retrieve the node object and its children IDs.
    // Initialize the result array with the current node's ID.
    var node = tree[id],
        left = node.left,
        right = node.right,
        res = [id];

    // If there is a left child (not '-1'), recursively call preorder on it
    // and concatenate its result to the current result.
    if (left !== '-1')
        res = res.concat(preorder(left));

    // If there is a right child (not '-1'), recursively call preorder on it
    // and concatenate its result to the current result.
    if (right !== '-1')
        res = res.concat(preorder(right));

    // Return the accumulated result for the current subtree.
    return res;
}

// Output the label for the preorder traversal.
console.log('Preorder');
// Perform preorder traversal from the identified root and print the result,
// with node IDs joined by spaces.
console.log(preorder(root_id).join(' '));


/**
 * Performs an inorder traversal of the tree starting from the given node ID.
 * In an inorder traversal, the left subtree is visited first, then the current node,
 * and finally its right subtree.
 *
 * @param {string} id The ID of the current node to start the traversal from.
 * @returns {Array<string>} An array of node IDs in inorder sequence.
 */
function inorder(id)
{
    // Retrieve the node object and its children IDs.
    // Initialize an empty result array.
    var node = tree[id],
        left = node.left,
        right = node.right,
        res = [];

    // If there is a left child (not '-1'), recursively call inorder on it
    // and concatenate its result to the current result.
    if (left !== '-1')
        res = res.concat(inorder(left));

    // After visiting the left subtree, add the current node's ID to the result.
    res.push(id);

    // If there is a right child (not '-1'), recursively call inorder on it
    // and concatenate its result to the current result.
    if (right !== '-1')
        res = res.concat(inorder(right));

    // Return the accumulated result for the current subtree.
    return res;
}

// Output the label for the inorder traversal.
console.log('Inorder');
// Perform inorder traversal from the identified root and print the result.
console.log(inorder(root_id).join(' '));


/**
 * Performs a postorder traversal of the tree starting from the given node ID.
 * In a postorder traversal, the left subtree is visited first, then its right subtree,
 * and finally the current node.
 *
 * @param {string} id The ID of the current node to start the traversal from.
 * @returns {Array<string>} An array of node IDs in postorder sequence.
 */
function postorder(id)
{
    // Retrieve the node object and its children IDs.
    // Initialize an empty result array.
    var node = tree[id],
        left = node.left,
        right = node.right,
        res = [];

    // If there is a left child (not '-1'), recursively call postorder on it
    // and concatenate its result to the current result.
    if (left !== '-1')
        res = res.concat(postorder(left));

    // If there is a right child (not '-1'), recursively call postorder on it
    // and concatenate its result to the current result.
    if (right !== '-1')
        res = res.concat(postorder(right));

    // After visiting both subtrees, add the current node's ID to the result.
    res.push(id);

    // Return the accumulated result for the current subtree.
    return res;
}

// Output the label for the postorder traversal.
console.log('Postorder');
// Perform postorder traversal from the identified root and print the result.
console.log(postorder(root_id).join(' '));

/*
 * End of tree traversal script.
 * All traversals are complete and results have been printed to console.
 */