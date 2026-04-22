/*
 * This JavaScript file processes group memberships from standard input.
 * It uses a Depth-First Search (DFS) algorithm to determine unique members.
 */

// Declare global variables for group processing.
var groupname;          // Stores the name of the current top-level group.
var group = {};         // Object to hold group definitions (groupname -> array of members/subgroups).
var membership = {};    // Object to track unique members found during DFS.

// Read all input data from stdin, assuming UTF-8 encoding.
var data = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input data: trim whitespace and split into lines.
var input = data . trim ( ) . split ( "\n" ) ;


// Main processing loop: continues until '0' is encountered as the number of groups.
while ( true )
{
    // Read the number of groups for the current test case.
    var n = input . shift ( ) ;

    // Check for termination condition.
    if ( n == 0 )
        break ; // Exit the loop if n is zero.

    // Loop through 'n' lines to populate the 'group' object.
    for ( var i = 0 ; i < n ; i ++ )
    {
        // Split each line by ':' to separate group name from its members.
        var s = input . shift ( ) . split ( ':' ) ;

        // Assign members to the group. Members are comma-separated.
        group [ s [ 0 ] ] = s [ 1 ] . split ( "," ) ;

        // If this is the first group definition, store its name.
        if ( i === 0 )
        {
            groupname = s [ 0 ] ; // This will be the starting point for DFS.
        }
    }

    // Perform Depth-First Search starting from the initial group.
    dfs ( groupname ) ;

    // Initialize a counter for unique members.
    var answer = 0 ;

    // Count the number of unique members found in the 'membership' object.
    for ( var i in membership )
    {
        // Increment the answer for each property in 'membership'.
        ++ answer ;
    }

    // Output the total count of unique members for the current test case.
    console . log ( answer ) ;


    // Reset 'group' and 'membership' for the next test case.
    group = { } ;
    membership = { } ;
}


/**
 * Performs a Depth-First Search (DFS) to traverse group hierarchies
 * and identify unique individual members.
 *
 * @param {string} groupname The name of the current group to process.
 */
function dfs ( groupname )
{
    // Retrieve the members/subgroups of the current group.
    var member = group [ groupname ] ;

    // Mark the current group as visited by clearing its members.
    // This prevents infinite loops in case of circular dependencies.
    group [ groupname ] = [ ] ;

    // Iterate through each element (member or subgroup) in the current group.
    for ( var i = 0 ; i < member . length ; i ++ )
    {
        // Clean up the element string by removing potential trailing newline characters.
        // This is important for accurate string comparisons.
        element = member [ i ] . replace ( / [.] ( \r\n | \n | \r ) / gm , "" ) ;

        // Check if the current element is a known subgroup (i.e., exists as a key in 'group').
        if ( group [ element ] !== undefined )
        {
            // If it's a subgroup, recursively call DFS on it.
            dfs ( element ) ;
        }
        else
        {
            // If it's not a subgroup, it's an individual member.
            // Check if this member has already been added to the 'membership' set.
            // Ensure the element is cleaned again before checking/adding to membership.
            if ( ! membership . hasOwnProperty ( element . replace ( / [.] ( \r\n | \n | \r ) / gm , "" ) ) )
            {
                // If the member is new, add it to the 'membership' object.
                membership [ element . replace ( / [.] ( \r\n | \n | \r ) / gm , "" ) ] = true ;
            }
        }
    }
}