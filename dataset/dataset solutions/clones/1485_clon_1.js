"use    strict"   ;
// This line enables strict mode for the entire script, helping to catch common coding errors.


/*
 *  Core Input/Output Utility Functions
 *  These functions are designed to streamline reading input from stdin
 *  and writing output to stdout.
 */
var input=
    require("fs")
        .readFileSync(
            "/dev/stdin",
            "utf8"
        )
;

// The 'cin' (console input) array stores parsed input tokens.
// 'cid' (current input index) tracks the current position in 'cin'.
var cin =
    input
        .split(
            / |\n/
        )
    ,
    cid =
        0
;


/**
 * Retrieves the next numerical token from the input.
 * Converts the string token to a number using the unary plus operator.
 * @returns {number} The next number from the input stream.
 */
function next ( ) {
    return +cin[cid++]
    ;
}


/*
 *  Fetches the next string token from the input array.
 *  No type conversion is performed here.
 */
function nextstr ( )
{
    return cin[cid++]
    ;
}


// Grabs the subsequent input token and transforms it into a BigInt.
function nextbig ( )
{
    return BigInt(
        cin[cid++]
    )
    ;
}


/*
 *  Reads 'n' tokens from the input.
 *  If 'a' is truthy, returns them as strings (slice only).
 *  Otherwise, converts them to numbers.
 *  @param {number} n - The number of tokens to read.
 *  @param {boolean} a - If true, return strings; otherwise, return numbers.
 *  @returns {Array<string|number>} An array of the requested tokens.
 */
function nexts (
    n
    ,
    a
)
{
    if (a)
        return cin
            .slice(
                cid,
                cid += n
            )
        ;
    else
        return cin
            .slice(
                cid,
                cid += n
            )
            .map(
                a => +a
            )
        ;
}


/*
 *  Reads 'n' tokens, converts them to numbers, and then sorts them.
 *  If 'a' is truthy, sorts in descending order (b-a).
 *  Otherwise, sorts in ascending order (a-b).
 *  @param {number} n - The count of numbers to read and sort.
 *  @param {boolean} a - If true, sort descending; otherwise, sort ascending.
 *  @returns {Array<number>} A sorted array of numbers.
 */
function nextssort (
    n
    ,
    a
)
{
    return a
        ?
        cin
            .slice(
                cid,
                cid += n
            )
            .map(
                a => +a
            )
            .sort(
                (a,b) => b-a
            )
        :
        cin
            .slice(
                cid,
                cid += n
            )
            .map(
                a => +a
            )
            .sort(
                (a,b) => a-b
            )
    ;
}


/*
 *  Reads a 2D matrix of 'h' rows and 'w' columns.
 *  If 'a' is truthy, elements are strings; otherwise, they are numbers.
 *  @param {number} h - Height (number of rows).
 *  @param {number} w - Width (number of columns per row).
 *  @param {boolean} a - If true, return string elements; otherwise, number elements.
 *  @returns {Array<Array<string|number>>} The 2D matrix.
 */
function nextm (
    h
    ,
    w
    ,
    a
)
{
    var r = [ ]
        ,
        i = 0
    ;

    if (a)
        for ( ; i < h ; i++ )
            r
                .push(
                    cin
                        .slice(
                            cid,
                            cid += w
                        )
                )
        ;
    else
        for ( ; i < h ; i++ )
            r
                .push(
                    cin
                        .slice(
                            cid,
                            cid += w
                        )
                        .map(
                            a => +a
                        )
                )
        ;

    return r
    ;
}


/*
 *  Dynamically creates a multi-dimensional array initialized with a value 'v'.
 *  The dimensions are provided as subsequent arguments.
 *  Uses `eval` to construct the array creation logic as a string.
 *  @param {*} v - The initial value for all elements.
 *  @param {...number} dimensions - The sizes of each dimension.
 *  @returns {Array} The multi-dimensional array.
 */
function xArray (
    v
)
{
    var a = arguments
        ,
        l = a.length
        ,
        r = "Array(a["+ --l +"]).fill().map(x=>{return "+v+";})"
    ;

    while ( --l )
        r = "Array(a["+l+"]).fill().map(x=>"+r+")"
    ;

    return eval(r)
    ;
}


// 'streams' stores output lines that will be printed at the end.
var streams = [ ]
;

/*
 *  Adds a string 's' to the 'streams' array for later output.
 *  This allows collecting all output before printing.
 */
function print (
    s
)
{
    streams
        .push(
            s
        )
    ;
}


// Default value for the segment tree, typically representing an identity or base case.
var def = 0
;


/*
 *  Segment Tree implementation.
 *  Supports range maximum queries and range updates.
 *  Initializes a segment tree with a capacity based on 'n'.
 */
function segTree (
    n
)
{
    // x will be the smallest power of 2 greater than or equal to n.
    // This determines the size of the underlying array.
    var x = 2
        ;
    n--
    ;

    // Calculate 'x' such that it's the smallest power of 2 >= original 'n'.
    while(n)
        n >>= 1, x <<= 1
    ;

    // The 'seg' array stores the tree nodes. Its size is 2*x - 1 (approx. 2*x).
    // All nodes are initialized with the 'def' value.
    this.seg =
        Array(x-1)
            .fill(def)
    ;

    // 'l' represents the starting index of the leaves in the 'seg' array.
    // It's also the effective size of the original data array.
    this.l =
        x >> 1
    ;
}


/*
 *  Prototype methods for the segTree object.
 *  Includes 'get' for query and 'update' for modifying ranges.
 */
segTree
    .prototype
    =
    {
        /**
         *  Performs a query to get the maximum value from the root to a specific index 'x'.
         *  This implementation assumes a "lazy propagation" or "point query, range update" setup
         *  where a value at 'x' is influenced by all updates on ranges covering 'x' from root down.
         *  It finds the maximum value along the path from the root to the leaf node corresponding to 'x'.
         *  @param {number} x - The index to query.
         *  @returns {number} The maximum value found on the path to 'x'.
         */
        get :
            function (x)
            {
                var v = this.seg
                    ;

                // Adjust 'x' to be the actual index of the leaf node in the 'seg' array.
                x += this.l - 1
                ;

                // 'r' will store the maximum value found.
                var r = def
                    ;

                // Traverse upwards from the leaf node to the root.
                // Each node 'x' has a parent at (x-1)>>1.
                while(x >= 0)
                {
                    // If the current node's value is greater than the current maximum 'r', update 'r'.
                    if(v[x] > r)
                        r = v[x]
                    ;

                    // Move to the parent node.
                    x = (x-1)>>1
                    ;
                }

                return r
                ;
            }
        ,
        /**
         *  Updates a range [l, r) with a new value 't'.
         *  This is a range update operation where all nodes covering the specified range
         *  are updated with the new value 't'. It's a "set" operation rather than "add".
         *  @param {number} l - The starting index of the range (inclusive).
         *  @param {number} r - The ending index of the range (exclusive).
         *  @param {number} t - The value to set for the range.
         */
        update :
            function (
                l
                ,
                r
                ,
                t
            )
            {
                // If the range is invalid or empty, do nothing.
                if(l >= r)
                    return
                ;

                var self = this
                    ;

                // Initiate the recursive update process.
                // q(current_query_l, current_query_r, current_node_segment_l, current_node_segment_r, current_node_index)
                q(
                    l
                    ,
                    r
                    ,
                    0
                    ,
                    this.l
                    ,
                    0
                )
                ;

                /**
                 *  Recursive helper function for range updates.
                 *  @param {number} l - Query range start (left).
                 *  @param {number} r - Query range end (right).
                 *  @param {number} x - Current node's segment start (left).
                 *  @param {number} y - Current node's segment end (right).
                 *  @param {number} i - Current node's index in the 'seg' array.
                 */
                function q (
                    l
                    ,
                    r
                    ,
                    x
                    ,
                    y
                    ,
                    i
                )
                {
                    // If the current node's segment exactly matches the query range,
                    // update this node and stop recursion for this branch.
                    if (
                        l === x
                        &&
                        r === y
                    )
                    {
                        self.seg[i] = t
                        ;
                        return
                        ;
                    }

                    // Calculate the midpoint of the current node's segment.
                    var m = (x+y) >> 1
                        ;

                    // Determine which child node(s) to recurse into based on overlap.
                    if (m < r)
                        // The query range extends into the right child's segment.
                        if (l < m)
                        {
                            // The query range also overlaps with the left child's segment.
                            // Recurse into both children.
                            q(
                                l,
                                m,
                                x,
                                m,
                                i+i+1
                            )
                            ;
                            q(
                                m,
                                r,
                                m,
                                y,
                                (i+1)<<1
                            )
                            ;
                        }
                        else
                        {
                            // The query range is entirely within the right child's segment.
                            // Recurse only into the right child.
                            q(
                                l,
                                r,
                                m,
                                y,
                                (i+1)<<1
                            )
                            ;
                        }
                    else
                        // The query range is entirely within the left child's segment.
                        // Recurse only into the left child.
                        q(
                            l,
                            r,
                            x,
                            m,
                            i+i+1
                        )
                    ;
                }
            }
        ,
    }
;


// Execute the main logic of the program.
var myOut = main ( )
;

// If 'main' returns a value (not undefined), print it to console.
if (myOut !== undefined)
    console
        .log(
            String(myOut)
        )
;

// If there are accumulated streams, print them, each on a new line.
if (streams.length)
    console
        .log(
            streams
                .join("\n")
        )
;


/*
 *  The main function where the problem's logic resides.
 *  This function calculates the maximum length of a non-decreasing subsequence
 *  where each element 'a[i]' can be followed by 'a[j]' if |a[i] - a[j]| <= k.
 *  It uses a segment tree to efficiently query and update lengths.
 */
function main ( )
{
    // Read N and K from input.
    var [n,k] = nexts(2)
        ;

    // Read the array 'a' of N elements.
    var a = nexts(n)
        ;

    // Initialize a segment tree. The maximum possible value is 300000,
    // so the tree needs to cover up to this range.
    var seg = new segTree(300001)
        ;

    // Iterate through each element in the input array 'a'.
    for (
        var i = 0 ;
        i < n ;
        i++
    )
    {
        // Calculate the lower bound 'l' for the range of values that can precede a[i].
        // It's a[i] - k, but not less than 0.
        var l = Math
            .max(
                0,
                a[i] - k
            )
            ;

        // Calculate the upper bound 'r' for the range of values that can precede a[i].
        // It's a[i] + k, but not greater than 300000.
        var r = Math
            .min(
                300000,
                a[i] + k
            )
            ;

        // Query the segment tree to get the maximum length of a valid subsequence
        // ending at a[i]. This value is fetched from the index corresponding to a[i].
        var t = seg
            .get(
                a[i]
            )
            ;

        // Update the segment tree. The range [l, r+1) is updated with t+1.
        // This means any value in this range can now potentially extend a subsequence
        // of length 't' (ending at a[i]) by one, making it 't+1'.
        // The '+1' in r+1 is because the update range is exclusive at the end.
        seg
            .update(
                l,
                r+1,
                t+1
            )
            ;
    }

    // After processing all elements, iterate through all possible values (0 to 300000)
    // to find the overall maximum length of any valid subsequence.
    var ans = 0
        ;

    for (
        var i = 0 ;
        i <= 300000 ;
        i++
    )
    {
        // Get the maximum length ending at index 'i' and update 'ans' if it's greater.
        ans = Math
            .max(
                ans,
                seg.get(i)
            )
            ;
    }

    // Return the final maximum answer.
    return ans
    ;
}