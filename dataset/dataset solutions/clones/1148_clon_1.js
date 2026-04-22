/**
 * This is a JavaScript class designed to compute the Levenshtein distance.
 * It also provides functionality to update the input string incrementally
 * and to identify 'correct' characters based on the computed distance.
 */
class LevenshteinDistance {
  // Acknowledgment: This implementation draws inspiration from
  // http://judge.u-aizu.ac.jp/onlinejudge/review.jsp?rid=4313161#1
  // This class manages the dynamic programming (DP) table for edit distance calculations.

  /**
   * The DP table `_dist[v][w]` stores the minimum edit distance
   * when considering the first `v` characters of the input string
   * and the first `w` characters of the target `word`.
   * @private
   */
  _dist;

  /**
   * The `_prev[v][w]` table stores the coordinates `[pv, pw]`
   * of the previous cell from which the minimum edit distance
   * to `_dist[v][w]` was achieved. This is used for backtracking.
   * @private
   */
  _prev;

  /**
   * The target word, split into an array of characters.
   * @private
   */
  _word;

  /**
   * The current input string, split into an array of characters.
   * This can be updated incrementally.
   * @private
   */
  _input;

  /**
   * Constructs a new LevenshteinDistance instance for a given target word.
   * Initializes the DP tables and internal state.
   *
   * @param {string} word - The target word against which input strings will be compared.
   */
  constructor(word) {
    // Initialize the distance DP table.
    // The first row represents the cost of deleting characters from the word
    // to match an empty input string.
    this._dist = [
      [...Array(word.length + 1)].map((_, i) => i)
    ];

    // Initialize the previous state DP table for backtracking.
    // The first row indicates insertions to the word.
    this._prev = [
      [...Array(word.length + 1)].map((_, i) => [0, i - 1])
    ];

    // The very first cell has no previous state.
    this._prev[0][0] = [-1, -1];

    // Store the target word as an array of characters for easier access.
    this._word = word.split("");

    // Initialize the input string as empty.
    this._input = [];
  }

  /**
   * Updates the input string by replacing characters from index `i` onwards with a given suffix.
   * This method efficiently recomputes only the necessary parts of the DP table.
   * Time complexity: O(|word| * |suffix|) in the worst case.
   *
   * @param {number} i - The starting index in the current input string where the suffix will be appended/replaced.
   * @param {string} suffix - The string to append to the input.
   * @throws {Error} If `i` is greater than the current input length, indicating an invalid position.
   */
  updateInputSuffix(i, suffix) {
    // Validate the input index.
    if (i > this._input.length) {
      throw new Error(
        "入力の長さより後ろの位置が指定されました: The specified position is beyond the current input length."
      );
    }

    // Truncate the current input string at index `i`.
    this._input.length = i;

    // Append the new suffix characters to the input.
    this._input.push(...suffix.split(""));

    // Adjust the length of the distance DP table to match the new input length + 1 (for empty string).
    this._dist.length = i + 1;

    // Iterate through the new rows (input characters) that need to be computed.
    for (
      let v = this._dist.length;
      v < this._input.length + 1;
      v++
    ) {
      // Initialize a new row in the distance DP table with Infinity, as distances are yet unknown.
      this._dist[v] = [...Array(this._word.length + 1)].map(() => Infinity);

      // The cost to transform an empty word into `v` input characters is `v` (insertions).
      this._dist[v][0] = v;

      // Initialize a new row in the previous state DP table.
      this._prev[v] = [...Array(this._word.length + 1)].map(() => [-1, -1]);

      // The previous state for matching `v` input characters with an empty word is `v-1` input characters and an empty word.
      this._prev[v][0] = [v - 1, 0];

      // Iterate through the columns (word characters) for the current input character.
      for (
        let w = 1;
        w < this._word.length + 1;
        w++
      ) {
        // Option 1: Substitution (or match).
        // Calculate cost for matching `v-1` input char with `w-1` word char.
        this._updateDp({
          v,
          w,
          pv: v - 1,
          pw: w - 1,
          cost: this._input[v - 1] === this._word[w - 1] ? 0 : 1,
        });

        // Option 2: Insertion into the word (or deletion from input).
        // Calculate cost for matching `v` input char with `w-1` word char, then deleting current input char.
        this._updateDp({
          v,
          w,
          pv: v,
          pw: w - 1,
          cost: 1,
        });

        // Option 3: Deletion from the word (or insertion into input).
        // Calculate cost for matching `v-1` input char with `w` word char, then inserting current input char.
        this._updateDp({
          v,
          w,
          pv: v - 1,
          pw: w,
          cost: 1,
        });
      }
    }
  }

  /**
   * Helper method to update a cell in the DP table if a shorter path is found.
   *
   * @private
   * @param {object} params - Parameters for the update.
   * @param {number} params.v - Current row index (input length).
   * @param {number} params.w - Current column index (word length).
   * @param {number} params.pv - Previous row index.
   * @param {number} params.pw - Previous column index.
   * @param {number} params.cost - Cost of the transition from `[pv, pw]` to `[v, w]`.
   */
  _updateDp(params) {
    const { v, w, pv, pw, cost } = params; // Destructure parameters for clarity.

    // Check if the path through `[pv, pw]` with `cost` is shorter than the current best path to `[v, w]`.
    if (this._dist[pv][pw] + cost < this._dist[v][w]) {
      // If it is shorter, update the distance.
      this._dist[v][w] = this._dist[pv][pw] + cost;

      // And record the previous state that led to this minimum distance.
      this._prev[v][w] = [pv, pw];
    }
  }

  /**
   * Constructs arrays indicating which characters in the input and word
   * correspond to "correct" matches (i.e., zero-cost transitions)
   * based on the computed Levenshtein distance path.
   * This is done by backtracking through the `_prev` table.
   * Time complexity: O(|input| + |word|) as it traces a path from end to start.
   *
   * @returns {{input: boolean[], word: boolean[]}} An object containing two boolean arrays:
   *   `input`: `true` if the character at the corresponding index in `_input` was part of a zero-cost match.
   *   `word`: `true` if the character at the corresponding index in `_word` was part of a zero-cost match.
   */
  buildCorrections() {
    // Initialize correction arrays with all false values.
    const inputCorrections = [...Array(this._input.length)].map(() => false);
    const wordCorrections = [...Array(this._word.length)].map(() => false);

    // Start backtracking from the bottom-right corner of the DP table.
    let v = this._input.length;
    let w = this._word.length;

    // Continue as long as we haven't reached the top-left corner (empty strings).
    while (v > 0 || w > 0) {
      // Get the coordinates of the previous cell in the optimal path.
      const [nv, nw] = this._prev[v][w];

      // If the distance from the previous cell `[nv, nw]` to the current cell `[v, w]`
      // is the same as the distance in the previous cell, it means it was a zero-cost transition (a match).
      if (this._dist[nv][nw] === this._dist[v][w]) {
        // Mark all characters involved in this zero-cost segment as 'correct'.
        // This handles cases where multiple characters might be skipped in a match (e.g., if there are multiple matches).
        for (let i = nv; i < v; i++) {
          inputCorrections[i] = true;
        }
        for (let i = nw; i < w; i++) {
          wordCorrections[i] = true;
        }
      }

      // Move to the previous cell for the next iteration.
      [v, w] = [nv, nw];
    }

    // Return the correction arrays.
    return {
      input: inputCorrections,
      word: wordCorrections
    };
  }

  /**
   * Getter for the internal distance DP table.
   * Provides read-only access to the computed Levenshtein distances.
   *
   * @returns {number[][]} The 2D array representing the distance DP table.
   */
  get dist() {
    return this._dist;
  }
}

/**
 * The main function to process standard input and compute Levenshtein distance.
 * This function expects two lines of input: the target word and the input string.
 *
 * @param {string} stdin - The standard input string, typically containing multiple lines.
 */
const main = stdin => {
  // Split the input into the target word and the actual input string.
  const [word, input] = stdin.split("\n");

  // Create a new LevenshteinDistance instance with the target word.
  const ld = new LevenshteinDistance(word);

  // Update the input string for the Levenshtein distance calculation, starting from index 0.
  ld.updateInputSuffix(0, input);

  // Log the final Levenshtein distance, which is found at the bottom-right cell
  // of the DP table (corresponding to the full input and full word).
  console.log(ld.dist[input.length][word.length]);
};

// This block handles reading from standard input when the script is executed.
// It reads the entire content of /dev/stdin as UTF-8 and passes it to the main function.
main(require("fs").readFileSync("/dev/stdin", "utf8"));