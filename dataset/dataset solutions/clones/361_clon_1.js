テ」ツつ?」ツつ? /* This is a placeholder comment. */
#include "bits/stdc++.h" /* Standard library includes */
using namespace std; // Using the standard namespace for convenience.

// Type definitions for common data structures.
typedef long long ll;
typedef pair<int, int> pii;
typedef pair<int, pii> piii;

// Macros for loops and common operations.
#define rep(i, n) for (ll i = 0; i < (ll)(n); i++)
#define all(a) (a).begin(), (a).end() // Get iterators for the entire range.
#define pb push_back // Shorthand for push_back.
#define INF 999999999 // A large integer value representing infinity.
#define MAX_V 100 // Maximum number of vertices (unused in this specific code).

/*
 * Global DP table for memoization.
 * Stores the minimum moves to reach a state.
 * Dimensions correspond to the 7 elements of the board (excluding the zero).
 */
unsigned int dp[8][8][8][8][8][8][8];

// Possible moves for the 'zero' tile: left, right, up, down.
// In a 1D representation of an 8-puzzle: -1 (left), +1 (right), -4 (up), +4 (down).
int d[] = {-1, 1, -4, +4};

/**
 * @brief Generates all possible next board states from the current board.
 *
 * This function simulates moving the 'zero' tile (empty space) to adjacent positions.
 * It considers a 1D representation of an 8-puzzle (or similar 8-tile game).
 *
 * @param board The current state of the game board as a vector of integers.
 * @return A vector of vectors, where each inner vector represents a valid next board state.
 */
vector<vector<int>> makeNext(vector<int> board) {
  int zero; // Index of the '0' tile.

  // Find the position of the zero tile.
  rep(i, 8) {
    if (board[i] == 0) {
      zero = i;
    }
  }

  vector<vector<int>> ret; // Vector to store generated next states.

  // Iterate through possible moves (directions).
  rep(i, 4) {
    vector<int> tmp = board; // Create a temporary board for modification.
    int dd = zero + d[i]; // Calculate the target index for the zero tile.

    // Check if the move is within board boundaries (0 to 7).
    if (dd >= 0 && dd < 8) {
      // Specific constraints for a 2x4 or 4x2 grid to prevent wrapping moves.
      // e.g., if zero is at index 3 (end of first row) and moves right (+1), it's invalid.
      if (zero == 3 && d[i] == 1) continue; // Prevent moving right from index 3 to 4 (across rows).
      if (zero == 4 && d[i] == -1) continue; // Prevent moving left from index 4 to 3 (across rows).

      // Swap the zero tile with the adjacent tile.
      swap(tmp[zero], tmp[dd]);

      // Debugging output: print the move and the resulting board.
      cout << "---" << zero << " " << dd << ":";
      rep(j, tmp.size()) {
        cout << tmp[j] << " ";
      }
      cout << endl;
      cout << endl; // Extra blank line for visual separation in debug output.

      ret.pb(tmp); // Add the new valid state to the return list.
    }
  }
  return ret; // Return all generated next states.
}


/*
 * @brief Checks if the given board state is the solved state.
 *
 * The solved state is defined as tiles being in ascending order (1, 2, ..., 7, 0).
 *
 * @param board The current state of the game board.
 * @return True if the board is solved, false otherwise.
 */
bool is(vector<int> board) {
  // Check if each tile is one greater than the previous, up to the second to last.
  // The last tile (board[7]) is assumed to be 0 for a solved state.
  rep(i, 7) {
    if (board[i] + 1 != board[i + 1]) {
      return false; // Not in ascending order.
    }
  }
  return true; // All tiles are in correct ascending order.
}

/**
 * @brief Performs a Depth-First Search (DFS) to find the minimum number of moves
 *        to reach the solved state from a given board configuration.
 *
 * This function uses memoization (dynamic programming) to avoid recomputing
 * results for already visited board states.
 *
 * @param board The current board state.
 * @param f The number of moves taken to reach the current board state.
 * @return The minimum number of moves from this state to the solved state,
 *         or 65535 if a solution is not found within 10 moves (or a large number).
 */
int dfs(vector<int> board, int f) {
  // Base case: If depth exceeds 10, assume unsolvable or too long.
  if (f > 10) return 65535;

  // Check if the current board is the solved state.
  if (is(board)) {
    // If solved, update DP table with current move count and return it.
    dp[board[0]][board[1]][board[2]][board[3]][board[4]][board[5]][board[6]] = f;
    return f;
  }

  // Check if this state has already been computed (memoization).
  // The value 65535 indicates an uncomputed or "infinity" state.
  if (dp[board[0]][board[1]][board[2]][board[3]][board[4]][board[5]][board[6]] != 65535) {
    return dp[board[0]][board[1]][board[2]][board[3]][board[4]][board[5]][board[6]];
  }

  // Generate all possible next states from the current board.
  vector<vector<int>> next = makeNext(board);

  // Debugging output: print all generated next states.
  rep(i, next.size()) {
    rep(j, next[i].size()) {
      cout << next[i][j] << " ";
    }
    cout << endl;
  }
  cout << endl; // Extra blank line for visual separation.

  int mini = INF; // Initialize minimum moves to infinity.

  // Recursively call DFS for each next state.
  // NOTE: There seems to be a bug here. It should call dfs with next[i], not board.
  // However, Type I cloning means I cannot fix logical bugs, only change whitespace/comments.
  rep(i, next.size()) {
    mini = min(mini, dfs(board, f + 1)); // BUG: This line should likely be dfs(next[i], f+1)
  }

  // Store the computed minimum moves in the DP table.
  dp[board[0]][board[1]][board[2]][board[3]][board[4]][board[5]][board[6]] = mini;
  return mini; // Return the minimum moves.
}


/*
 * @brief Main function to solve the 8-puzzle problem.
 *
 * Reads an initial board configuration, initializes the DP table,
 * and then performs DFS to find the minimum moves to the solved state.
 */
int main() {
  // Initialize the DP table with 65535 (representing infinity or uncomputed).
  // This nested loop initializes all 8^7 states.
  rep(i0, 8) rep(i1, 8) rep(i2, 8) rep(i3, 8) rep(i4, 8) rep(i5, 8) rep(i6, 8)
    dp[i0][i1][i2][i3][i4][i5][i6] = 65535;

  vector<int> data(8); // Vector to store the initial board configuration.

  // Read the 8 tile values from standard input.
  rep(i, 8) cin >> data[i];

  // The initial state has 0 moves.
  dp[data[0]][data[1]][data[2]][data[3]][data[4]][data[5]][data[6]] = 0;

  int mini = INF; // Initialize minimum moves to infinity.

  // Generate the first set of possible moves from the initial board.
  vector<vector<int>> next = makeNext(data);

  // For each immediate next state, start a DFS with 1 move.
  rep(i, next.size()) {
    mini = min(mini, dfs(next[i], 1));
  }

  // Print the final minimum number of moves to solve the puzzle.
  cout << mini << endl;

  return 0; // Indicate successful execution.
}