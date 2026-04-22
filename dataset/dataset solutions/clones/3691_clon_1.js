#include <bits/stdc++.h> // Include standard C++ library headers for common functionalities.

using namespace std; // Use the standard namespace to avoid prefixing std::

/* Main template block start */

/* Type definitions begin */

// Define 'll' as a shorthand for 'long long int' for 64-bit signed integers.
using ll = long long int;

// Define 'llu' as a shorthand for 'long long unsigned int' for 64-bit unsigned integers.
using llu = long long unsigned int;

// Define 'pii' as a pair of integers, commonly used for (value, index) or (x, y) coordinates.
using pii = pair<int, int>;

// Define 'pll' as a pair of long longs, useful for (distance, node) in graph algorithms.
using pll = pair<ll, ll>;

// Define 'vi' as a vector of integers.
using vi = vector<int>;

// Define 'vl' as a vector of long longs.
using vl = vector<ll>;

// Define 'vii' as a vector of pairs of integers.
using vii = vector<pii>;

// Define 'vll' as a vector of pairs of long longs.
using vll = vector<pll>;

/* End of type definitions */

/* Definition block starts */

// Macros for input scanning

#define Scd(x)         scanf("%d", &x)         // Scan a single integer.
#define Scd2(x, y)     scanf("%d%d", &x, &y)    // Scan two integers.
#define Scd3(x, y, z)  scanf("%d%d%d", &x, &y, &z) // Scan three integers.

#define Scll(x)        scanf("%lld", &x)       // Scan a single long long.
#define Scll2(x, y)    scanf("%lld%lld", &x, &y) // Scan two long longs.
#define Scll3(x, y, z) scanf("%lld%lld%lld", &x, &y, &z) // Scan three long longs.

#define Scc(c)         scanf("%c", &c);         // Scan a single character.
#define Scs(s)         scanf("%s", s);          // Scan a C-style string.
#define Scstr(s)       scanf("%s", &s);         // Scan a string (with address-of operator).

// Important numerical constants

#define EPS (1e-7) // Epsilon for floating point comparisons.
#define INF (2e9)  // A large integer value representing infinity.
#define PI (acos(-1)) // Value of Pi.

// Looping and iteration macros

// Loop from z (inclusive) to y (exclusive).
#define Repe(x, y, z) for (ll x = z; x < y; x++)

// Loop from 0 (inclusive) to y (exclusive).
#define Rep(x, y)     Repe(x, y, 0)

// Reverse loop from y-z-1 (inclusive) down to 0 (inclusive).
#define RRepe(x, y, z) for (ll x = y - z - 1; x >= 0; x--)

// Reverse loop from y-1 (inclusive) down to 0 (inclusive).
#define RRep(x, y)     RRepe(x, y, 0)

// Output utility macros

// Print "Yes" or "No" based on a boolean condition.
#define YesNo(a) (a) ? printf("Yes\n") : printf("No\n")

// Print "YES" or "NO" based on a boolean condition (uppercase).
#define YESNO(a) (a) ? printf("YES\n") : printf("NO\n")

/* End of definition block */

/* Input related block (currently empty) */

/* End of input block */

/* End of main template block */


// Function to compute shortest paths from a source node 's'
// to all other nodes in a graph 'g' using Dijkstra's algorithm.
// The computed distances are stored in the 'dist' vector.
void dijkstra(
  int s,           // The starting node for Dijkstra's algorithm.
  vector<vii>& g,  // The graph represented as an adjacency list.
                   // Each element g[u] is a vector of pairs (v, weight)
                   // indicating an edge from u to v with 'weight'.
  vl& dist         // Output parameter: vector to store the shortest distances.
)
{
  // A priority queue to store nodes to visit, ordered by their current shortest distance.
  // It stores pairs of (distance, node_index), with 'greater' to make it a min-priority queue.
  priority_queue<pll, vll, greater<pll>> q;

  // Initialize all distances to a very large value (effectively infinity)
  // for all nodes in the graph.
  dist.assign( g.size(), 1e18 );

  // The distance from the source node to itself is 0.
  dist[ s ] = 0;

  // Push the source node with its distance (0) into the priority queue.
  q.emplace( 0, s );

  // Loop while there are nodes to process in the priority queue.
  while ( q.size() )
  {
    // Get the node with the smallest distance from the top of the priority queue.
    int from = q.top().second; // The current node's index.
    ll  di   = q.top().first;  // The current shortest distance to this node.

    // Remove the processed node from the priority queue.
    q.pop();

    // If we've already found a shorter path to 'from' than 'di',
    // then this entry is stale and we can skip it.
    if ( di > dist[ from ] )
    {
      continue;
    }

    // Iterate through all neighbors ('tow') of the current node 'from'.
    for ( pii tow : g[ from ] )
    {
      int to = tow.first;   // The neighbor node's index.
      int co = tow.second;  // The cost of the edge from 'from' to 'to'.

      // If a shorter path to the neighbor 'to' is found through 'from':
      if ( dist[ to ] > di + co )
      {
        dist[ to ] = di + co; // Update the shortest distance to 'to'.
        // Add the neighbor 'to' with its new shortest distance to the priority queue.
        q.emplace( dist[ to ], to );
      }
    }
  }
}


// Main function where program execution begins.
int main()
{
    // Declare variables for number of nodes (N), number of edges (M),
    // and start/end nodes (s, t) for the two Dijkstra runs.
    int N, M, s, t;

    // Read N and M from standard input.
    Scd2( N, M );

    // Read the start and end nodes for the two paths.
    Scd2( s, t );

    // Adjust node indices to be 0-based (assuming input is 1-based).
    s--;
    t--;

    // Declare adjacency lists for two different graphs:
    // 'ga' for graph A (with 'a' costs) and 'gb' for graph B (with 'b' costs).
    vector<vii> ga( N );
    vector<vii> gb( N );

    // Declare variables for edge endpoints (u, v) and their costs (a, b).
    int u, v, a, b;

    // Loop M times to read all edge information.
    Rep( i, M )
    {
        // Read the two endpoints of an edge.
        Scd2( u, v );
        // Read the costs for graph A and graph B for this edge.
        Scd2( a, b );

        // Adjust edge endpoints to be 0-based indices.
        u--;
        v--;

        // Add the edge (u, v) with cost 'a' to graph A.
        // Since edges are typically undirected in such problems, add both directions.
        ga[ u ].emplace_back( v, a );
        ga[ v ].emplace_back( u, a );

        // Add the edge (u, v) with cost 'b' to graph B.
        gb[ u ].emplace_back( v, b );
        gb[ v ].emplace_back( u, b );
    }

    // Declare vectors to store distances for Dijkstra's algorithm.
    // 'da' will store distances from 's' in graph A.
    // 'db' will store distances from 't' in graph B.
    vl da, db;

    // Run Dijkstra's from 's' on graph A to fill 'da'.
    dijkstra( s, ga, da );

    // Run Dijkstra's from 't' on graph B to fill 'db'.
    dijkstra( t, gb, db );

    // Initialize 'tmp' to 0. This variable will keep track of the maximum
    // "remaining value" found so far, working backwards from the end.
    ll tmp = 0;

    // Create a vector to store the final answers for each node.
    vl ans;

    // Iterate through the nodes in reverse order (from N-1 down to 0).
    // This is because the problem likely involves finding a maximum value
    // that accumulates or depends on future states.
    RRep( i, N )
    {
        // Calculate the "remaining value" for the current node 'i':
        // 10^15 (a very large constant) minus the sum of distances from 's' to 'i'
        // and from 't' to 'i' (using their respective graphs).
        // Update 'tmp' to be the maximum of its current value and this new calculation.
        tmp = max( tmp, 1000000000000000LL - da[ i ] - db[ i ] );

        // Add the current maximum 'tmp' to the 'ans' vector.
        ans.push_back( tmp );
    }

    // Iterate through the 'ans' vector in reverse order to print results.
    // This effectively prints the answers for nodes 0 to N-1,
    // but the values in 'ans' were computed in reverse.
    RRep( i, N )
    {
        // Print the calculated answer for the current node, followed by a newline.
        printf( "%lld\n", ans[ i ] );
    }


    // Indicate successful program termination.
    return 0;
}