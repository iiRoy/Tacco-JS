/*
 *   This JavaScript file implements a BinaryTree data structure.
 *   It provides functionalities to construct a binary tree from its
 *   pre-order and in-order traversals, and then to obtain its
 *   post-order traversal sequence.
 *
 *   The main execution block reads input from standard input,
 *   processes the traversal sequences, builds the tree,
 *   and prints the post-order result.
 */


//  Definition of the BinaryTree class.
class BinaryTree
{

    //  The constructor initializes the tree with 'n' nodes.
    //  Each node is given a unique ID and default connection values.
    constructor (   n   )
    {
        //  Array to hold all node objects belonging to this tree.
        this.nodes =   [ ] ;

        //  Loop through to create 'n' nodes.
        for (   let i = 0   ;   i < n   ;   i++   )
        {
            //  Each node is an object with its ID, and parent/child IDs initialized to -1 (indicating no connection).
            this.nodes[ i ] =   {
                                    id        : i + 1       ,   //  Node ID, 1-based for easier problem mapping.
                                    parentId  : -1          ,   //  Parent ID; -1 implies it's a root or unassigned.
                                    leftId    : -1          ,   //  Left child ID; -1 implies no left child.
                                    rightId   : -1              //  Right child ID; -1 implies no right child.
                                }   ;
        }
    }


    //  Getter method to retrieve the root node of the tree.
    //  The root node is identified by having a parentId of -1.
    get root ( )
    {
        return  this.nodes.find (   n   =>  n.parentId === -1   )   ;
    }


    //  Method to find a node by its ID.
    //  Node IDs are 1-based, so we adjust for 0-based array indexing.
    //  Returns the node object or an empty object if not found (for robustness).
    find (   id   )
    {
        return  this.nodes[ id - 1 ]    ||    { }   ;
    }


    //  Performs a post-order traversal of the binary tree.
    //  Returns an array containing the IDs of the nodes in post-order sequence.
    getByPostorder (   )
    {
        //  This array will store the result of the post-order traversal.
        let res =   [ ] ;


        //  Inner recursive function to perform the post-order traversal.
        //  It takes the ID of the current node as an argument.
        const postorder =   (   id   )    =>
        {
            //  Base case for recursion: if the node ID is -1, it means there's no node, so we stop.
            if (   id === -1   )
            {
                return  ;
            }


            //  Retrieve the actual node object using its ID.
            let n   =   this.find (   id   )   ;


            //  Recursively call postorder for the left child.
            postorder (   n.leftId   )   ;


            //  Recursively call postorder for the right child.
            postorder (   n.rightId   )   ;


            //  After visiting left and right children, push the current node's ID to the result.
            res.push (   id   )   ;
        }   ;


        //  Initiate the post-order traversal starting from the root node's ID.
        postorder (   this.root.id   )   ;


        //  Return the accumulated array of node IDs in post-order.
        return  res ;
    }

}   //  End of BinaryTree class definition.


//  This is the main execution block, wrapped in an Immediately Invoked Function Expression (IIFE).
(   function main ( )
{
    //  Read all lines from standard input.
    //  'fs' module is used for file system operations.
    const lines =   require ( 'fs' )
                        . readFileSync ( '/dev/stdin' ,   'utf8' )    //  Read content of /dev/stdin as UTF-8 string.
                        . trim ( )                                   //  Remove any leading/trailing whitespace.
                        . split ( '\n' ) ;                           //  Split the string into an array of lines.


    //  The first line contains the total number of nodes, 'n'.
    //  'shift()' removes the first element from the array and returns it.
    const n =   Number (   lines.shift ( )   )   ;


    //  The second line contains the pre-order traversal sequence, space-separated.
    const preOrder  =   lines.shift ( ) . split ( ' ' ) . map ( Number ) ;


    //  The third line contains the in-order traversal sequence, space-separated.
    const inOrder   =   lines.shift ( ) . split ( ' ' ) . map ( Number ) ;


    //  Call the makeTree function to construct the binary tree from the given traversals.
    let tree    =   makeTree (   preOrder ,   inOrder   )   ;


    //  Get the post-order traversal from the constructed tree,
    //  join the node IDs with spaces, and print the result to the console.
    console.log (   tree.getByPostorder ( ) . join ( ' ' )   )   ;

}   ) ( ) ; //  The IIFE is immediately invoked here.


//  Function to construct a binary tree given its pre-order and in-order traversals.
//  @param {Array<number>} preOrder - An array representing the pre-order traversal sequence.
//  @param {Array<number>} inOrder - An array representing the in-order traversal sequence.
//  @returns {BinaryTree} The fully constructed BinaryTree object.
function makeTree (   preOrder ,   inOrder   )
{
    //  Create a new BinaryTree instance with the total number of nodes.
    let tree    =   new BinaryTree (   preOrder.length   )   ;


    //  Inner recursive function to build the tree structure.
    //  'p' refers to the current segment of the pre-order array.
    //  'i' refers to the current segment of the in-order array.
    const innerMakeTree =   (   p ,   i   )   =>
    {
        //  In a pre-order traversal, the first element is always the root of the current subtree.
        let midId   =   p[ 0 ]   ;


        //  Find the index of this root (midId) in the in-order traversal array.
        //  Elements to the left of midId in in-order are in the left subtree.
        //  Elements to the right of midId in in-order are in the right subtree.
        let midIdx  =   i.indexOf (   midId   )   ;


        //  If midId is not found in the current in-order segment, it means this is an empty subtree, so return.
        if (   midIdx === -1   )
        {
            return  ;
        }


        //  Check if there's a left subtree.
        //  This is true if midIdx is greater than 0 (i.e., there are elements before midId in in-order).
        if (   midIdx > 0   )
        {
            //  The left child of the current root (midId) is the second element in the pre-order segment.
            tree.find (   midId   ) . leftId  =   p[ 1 ]   ;

            //  Set the parent of this left child to be the current root (midId).
            tree.find (   p[ 1 ]   ) . parentId    =   midId   ;

            //  Recursively build the left subtree.
            //  The pre-order segment for the left subtree starts from p[1] and goes up to midIdx elements.
            //  The in-order segment for the left subtree is from the beginning of 'i' up to midIdx elements.
            innerMakeTree (   p.slice (   1 ,   midIdx + 1   ) ,   i.slice (   0 ,   midIdx   )   )   ;
        }


        //  Check if there's a right subtree.
        //  This is true if midIdx is less than i.length - 1 (i.e., there are elements after midId in in-order).
        if (   midIdx < i.length - 1   )
        {
            //  The right child of the current root (midId) is the element at p[midIdx + 1] in the pre-order segment.
            tree.find (   midId   ) . rightId =   p[ midIdx + 1 ]   ;

            //  Set the parent of this right child to be the current root (midId).
            tree.find (   p[ midIdx + 1 ]   ) . parentId    =   midId   ;

            //  Recursively build the right subtree.
            //  The pre-order segment for the right subtree starts from p[midIdx + 1] to the end.
            //  The in-order segment for the right subtree starts from i[midIdx + 1] to the end.
            innerMakeTree (   p.slice (   midIdx + 1   ) ,   i.slice (   midIdx + 1   )   )   ;
        }
    }


    //  Start the tree construction process with the full pre-order and in-order arrays.
    innerMakeTree (   preOrder ,   inOrder   )   ;


    //  Return the completely constructed binary tree.
    return  tree    ;
}