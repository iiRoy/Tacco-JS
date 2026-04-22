/*
 * This JavaScript program processes tree traversal data.
 * It reads in-order and pre-order traversal sequences
 * and reconstructs the post-order traversal.
 *
 * The main function orchestrates the entire process,
 * from input parsing to output generation.
 */
function main ( _stdin ) { // Entry point of the application.

    // Split the raw input string into an array of lines.
    const stdin = _stdin.split ( '\n' ) ;

    // Parse the length of the sequences from the first line.
    const len = parseInt ( stdin.shift ( ) , 10 ) ;

    // Parse the pre-order traversal results.
    const proRes = stdin.shift ( ) .split ( ' ' ) .map ( e => parseInt ( e , 10 ) ) ;

    // Parse the in-order traversal results.
    const inoRes = stdin.shift ( ) .split ( ' ' ) .map ( e => parseInt ( e , 10 ) ) ;


    // Initialize data structures for tree representation.
    const data = [ ] ;
    const walked = [ ] ;

    // Populate initial data array.
    for ( let i = 0 ; i < len + 1 ; i ++ ) { // Loop from 0 up to and including 'len'.
        if ( i === 0 )
            data [ i ] = 0 ; // Special handling for index 0, though it's immediately overwritten.

        data [ i ] = [ i , -1 , -1 ] ; // Each node stores its ID, left child, and right child.
    }


    // Reconstruct the tree structure using pre-order and in-order data.
    setData ( 0 , proRes , inoRes , data ) ;

    // The root of the tree is always the first element in the pre-order traversal.
    const rootidx = proRes [ 0 ] ;


    // Perform post-order traversal on the reconstructed tree.
    outParse ( data , rootidx , walked ) ;

    // Output the post-order traversal sequence joined by spaces.
    console.log ( walked.join ( ' ' ) ) ;

} // End of main function.


/*
 * Recursively reconstructs the tree structure.
 * It uses pre-order and in-order traversal properties
 * to determine parent-child relationships.
 */
function setData ( proInd , prores , targets , data ) {

    // Get the current node's ID from the pre-order sequence.
    const nodeId = prores [ proInd ] ;

    // Reference to the current node's data entry.
    const d = data [ nodeId ] ;


    // Base case: If there's only one target, it's a leaf node.
    if ( targets.length === 1 ) {
        d [ 1 ] = -1 ; // No left child.
        d [ 2 ] = -1 ; // No right child.
        return ;
    }

    let splita ; // Variable to store the split point in the in-order sequence.

    // Find the current node in the in-order sequence to determine left and right subtrees.
    for ( let i = 0 , l = targets.length ; i < l ; i ++ ) {
        if ( targets [ i ] === nodeId )
            splita = i ; // Found the split point.
    }

    // Split the in-order sequence into left and right subtrees.
    const left = targets.slice ( 0 , splita ) ;
    const right = targets.slice ( splita + 1 ) ;


    // Process the left subtree.
    if ( left.length ) {
        // Filter pre-order elements that belong to the left subtree.
        const leftPro = prores.filter ( e => left.indexOf ( e ) > -1 ) ;
        d [ 1 ] = leftPro [ 0 ] ; // The first element of leftPro is the root of the left subtree.

        // Find the index of the left child's root in the main pre-order sequence.
        const index = prores.indexOf ( d [ 1 ] ) ;

        // Recursively call setData for the left subtree.
        setData ( index , prores , left , data ) ;
    }
    else {
        d [ 1 ] = -1 ; // No left child.
    }


    // Process the right subtree.
    if ( right.length ) {
        // Filter pre-order elements that belong to the right subtree.
        const rightPro = prores.filter ( e => right.indexOf ( e ) > -1 ) ;
        d [ 2 ] = rightPro [ 0 ] ; // The first element of rightPro is the root of the right subtree.

        // Find the index of the right child's root in the main pre-order sequence.
        const index = prores.indexOf ( d [ 2 ] ) ;

        // Recursively call setData for the right subtree.
        setData ( index , prores , right , data ) ;
    }
    else {
        d [ 2 ] = -1 ; // No right child.
    }
} // End of setData function.


/**
 * Performs a post-order traversal (Left-Right-Root)
 * and collects node IDs into the 'walked' array.
 * @param {Array<Array<number>>} inputs - The tree structure data.
 * @param {number} idx - The current node's ID.
 * @param {Array<number>} walked - Array to store the post-order sequence.
 */
function outParse ( inputs , idx , walked ) {

    // Base case: If the current node is -1, it means no child exists.
    if ( idx === -1 ) {
        return ;
    }

    // Recursively visit the left child.
    outParse ( inputs , inputs [ idx ] [ 1 ] , walked ) ;

    // Recursively visit the right child.
    outParse ( inputs , inputs [ idx ] [ 2 ] , walked ) ;

    // After visiting left and right, push the current node's ID.
    walked.push ( inputs [ idx ] [ 0 ] ) ;

} // End of outParse function.


// Main execution block: Read input from stdin and call the main function.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;