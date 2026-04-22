// This script implements a Disjoint Set Union (DSU) data structure
// to manage connectivity between nodes and answer queries about
// whether two nodes are in the same connected component.

// Configuration object for input source and newline character.
// The commented-out line below shows a configuration example for Windows.
// config = { input: 'tmp', newline: '\r\n' };  // For Windows OS environments

config = {  input:  '/dev/stdin',  newline:  '\n'  };  // Standard configuration for Linux/Unix environments.


// Read the entire input file, process it, and parse numerical data.
line  =  require('fs') .readFileSync(  config.input,  'ascii'  )
    .trim()                                            // Remove any leading or trailing whitespace.
    .split(  config.newline  )                         // Split the input into an array of lines.
    .map(  function  (  singleLine  )   {
        return  singleLine.split(' ') .map(  Number  );  // For each line, split by space and convert to numbers.
    }  );


// Extract initial parameters from the parsed input data.
n  =  line[0][0];  // 'n' represents the total number of nodes (vertices).
m  =  line[0][1];  // 'm' represents the number of edges to be processed.

q  =  line[m + 1][0];  // 'q' represents the number of connectivity queries.


// Initialize the 'adj' (adjacency/parent) array for the DSU structure.
// The size is n+1 to accommodate 1-indexed nodes.
adj  =  new Array(  n + 1  );

// Initially, all nodes are in their own set, indicated by 'null' parent.
for (  i  =  0;  i  <=  n;  i++  )
    adj[i]  =  null;


// Process 'm' edges to build the connected components.
// This loop performs the 'union' operation for each edge.
for  (  i  =  1;  i  <=  m;  i++  )
{
    // Determine the smaller and larger node IDs for the current edge (u, v).
    min  =  Math.min(  line[i][0],  line[i][1]  );
    max  =  Math.max(  line[i][0],  line[i][1]  );

    // Find the root of the component containing 'min'.
    // This is a simple 'find' operation without path compression.
    while  (  adj[min]  !==  null  )
        min  =  adj[min];

    // Perform the union: set the parent of 'max' to the root of 'min'.
    // This effectively merges the component of 'max' into the component of 'min'.
    adj[max]  =  min;
}


// Process 'q' connectivity queries.
// Each query asks if two nodes are in the same connected component.
for  (  i  =  m + 2;  i  <  ( m + 2 )  +  q;  i++  )
{
    // Extract the two nodes (q0, q1) for the current query.
    q0  =  line[i][0];
    q1  =  line[i][1];

    // Find the root of the component containing the first node, q0.
    while  (  adj[q0]  !==  null  )
        q0  =  adj[q0];

    // Find the root of the component containing the second node, q1.
    while  (  adj[q1]  !==  null  )
        q1  =  adj[q1];

    // If their roots are the same, they are in the same component.
    // Output 'yes' or 'no' accordingly.
    console.log(  ( q0  ===  q1 )  ?  'yes'  :  'no'  );
}