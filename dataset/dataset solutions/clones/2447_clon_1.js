/*
 * This is a Type I clone of the original C++ code.
 *
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 *
 * All identifiers, operators, and expressions remain precisely as they were.
 */

#include <bits/stdc++.h>

// Macro for a standard for loop from 0 to n-1
#define REP(i, n) for ( int i = 0, i##_len = (n); i < i##_len; ++i )

// Macro for a for loop from a start value '_s' to n-1
#define REPS(i, _s, n) for ( int i = _s, i##_len = (n); i < i##_len; ++i )

// Macro to get iterators for the beginning and end of a container
#define ALL(x) (x).begin(), (x).end()


using namespace std; /* Using the standard namespace */


// Custom iterator macro for containers
#define repi(itr, ds) for ( auto itr = ds.begin(); itr != ds.end(); itr++ )


// Overload the input stream operator for vectors
template <typename T>
istream& operator>>(istream& is, vector<T>& vec) {
  for ( T& x : vec ) {
    is >> x;
  }
  return is;
}


// Overload the output stream operator for pairs
template <typename T, typename U>
ostream& operator<<(ostream& os, pair<T, U>& pair_var) {
  os << "(" << pair_var.first << ", " << pair_var.second << ")";
  return os;
}


// Overload the output stream operator for vectors
template <typename T>
ostream& operator<<(ostream& os, const vector<T>& vec) {
  os << "{";
  for ( int i = 0; i < vec.size(); i++ ) {
    os << vec[i] << (i + 1 == vec.size() ? "" : ", ");
  }
  os << "}\n   "; // Additional newline and spaces for visual formatting
  return os;
}


// Overload the output stream operator for maps
template <typename T, typename U>
ostream& operator<<(ostream& os, map<T, U>& map_var) {
  os << "{";
  repi(itr, map_var) {
    os << *itr;
    itr++;
    if ( itr != map_var.end() ) {
      os << ", ";
    }
    itr--;
  }
  os << "}";
  return os;
}


// Overload the output stream operator for sets
template <typename T>
ostream& operator<<(ostream& os, set<T>& set_var) {
  os << "{";
  repi(itr, set_var) {
    os << *itr;
    itr++;
    if ( itr != set_var.end() ) {
      os << ", ";
    }
    itr--;
  }
  os << "}";
  return os;
}


// Define DUMPOUT as cerr for debugging output
#define DUMPOUT cerr


// Base case for dump_func (no arguments)
void dump_func() {
  DUMPOUT << endl;
}

// Recursive template function for dumping multiple arguments
template <class Head, class... Tail>
void dump_func(Head&& head, Tail&&... tail) {
  DUMPOUT << head;
  if ( sizeof...(Tail) > 0 ) {
    DUMPOUT << ", ";
  }
  dump_func(std::move(tail)...);
}

// Conditional compilation for debug macros
#ifdef DEBUG_
#define DEB /**/ // Empty macro for debug
#define dump(...)                                                             \
  DUMPOUT << "  " << string(#__VA_ARGS__) << ": "                             \
          << "[" << to_string(__LINE__) << ":" << __FUNCTION__ << "]" << endl \
          << "    ",                                                          \
      dump_func(__VA_ARGS__)
#else
#define DEB if ( false )
#define dump(...) /* No-op for dump in non-debug mode */
#endif


typedef long long int ll; /* Type definition for long long int */


int main() {
  int N; // Declare an integer N

  cin >> N; // Read the value of N from standard input

  // Initialize vector C of size N with zeros
  auto C = vector<int>(N, 0);
  // Initialize vector D of size N
  auto D = vector<int>(N);

  // Loop through N elements to read into D and count frequencies in C
  REP(i, N) {
    cin >> D[i]; // Read i-th element into D
    C[D[i]]++;   // Increment count for the value D[i] in vector C
  }

  /*
   * Check for invalid conditions:
   * 1. If the first element of D is not 0.
   * 2. If the count of 0s in C is greater than or equal to 2.
   * If either condition is true, output 0 and exit.
   */
  if ( D[0] != 0 || C[0] >= 2 ) {
    cout << 0 << endl; // Output 0
    return 0;          // Exit program
  }

  ll result = 1LL; // Initialize result with 1 (long long literal)

  // Calculate the final result based on counts in C
  REPS(i, 2, N) {
    // Multiply result by (C[i-1] to the power of C[i]) modulo 998244353LL
    result = result * (ll)pow(C[i - 1], C[i]) % 998244353LL;
    // This calculation involves modular exponentiation.
  }

  cout << result << endl; // Output the final calculated result

  return 0; // Indicate successful execution
}