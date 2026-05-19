/**
 * This function processes a set of problem scores and determines how many problems
 * could potentially rank within the top P positions after a voting process.
 *
 * @param {string[]} raw_data_lines - An array of strings representing the input data.
 *                                    The first string contains N, M, V, P.
 *                                    The second string contains a list of problem scores.
 */
function ProcessScores(raw_data_lines) {
  // Parse the first line of input to extract key parameters.
  const first_line_values = raw_data_lines[0].split(' ').map(Number);
  const num_problems = first_line_values[0]; // Total number of problems
  const max_votes_per_problem = first_line_values[1]; // Maximum votes a single problem can receive
  const total_vote_capacity = first_line_values[2]; // Total available vote slots
  const top_p_rank = first_line_values[3]; // The target rank (e.g., top 3 if P=3)

  // Parse the second line, convert scores to numbers, and sort them in ascending order.
  // This sorted list helps in efficiently determining ranks and vote distribution.
  const problem_scores_sorted = raw_data_lines[1].split(' ').map(Number).sort((val_a, val_b) => val_a - val_b);

  // Initialize the remaining vote capacity. This variable will be decremented
  // as we consider different problems and their potential votes.
  let remaining_capacity = total_vote_capacity;

  // Declare variables that will be used within the main loop.
  // `current_score_candidate`: The score of the problem currently being evaluated.
  // `max_possible_score`: The maximum score the current problem could achieve (current_score_candidate + max_votes_per_problem).
  // `temp_score_val`: A temporary variable for score values during calculations.
  // `score_difference_sum`: Accumulates score differences for vote distribution.
  // `loop_idx_j`: Loop index for inner loops.
  // `votes_distributed_below_max`: Number of full 'M' vote blocks distributed to problems below max_possible_score.
  // `found_valid_candidate_score`: Stores the score of the first problem found to be a valid candidate.
  let current_score_candidate, max_possible_score, temp_score_val, score_difference_sum, loop_idx_j, votes_distributed_below_max, found_valid_candidate_score = null;

  // Iterate through the sorted list of problem scores to find potential candidates.
  // The goal is to find the lowest score that can still make it into the top P.
  for (let current_idx_i = 0; current_idx_i < problem_scores_sorted.length; current_idx_i++) {
    // Handle duplicate scores: if the current problem has the same score as the next,
    // treat them as a single candidate for voting purposes and reduce the vote capacity.
    while (problem_scores_sorted[current_idx_i] === problem_scores_sorted[current_idx_i + 1]) {
      current_idx_i++;
      remaining_capacity--; // One less distinct problem to consider for voting
    }
    remaining_capacity--; // Decrement for the current problem being evaluated

    // Get the current problem's score and its maximum potential score after receiving M votes.
    current_score_candidate = problem_scores_sorted[current_idx_i];
    max_possible_score = current_score_candidate + max_votes_per_problem;

    score_difference_sum = 0; // Reset sum of score differences for this candidate.

    // Iterate through problems with scores greater than the current candidate but less than its max possible score.
    // This loop calculates how many votes would be needed to bring these problems up to max_possible_score.
    // NOTE: There's a potential typo in the original code here (`k2` instead of `max_possible_score`).
    // To maintain Type II cloning, this typo is preserved. If `k2` is undefined, this loop will not execute.
    for (loop_idx_j = current_idx_i + 1; problem_scores_sorted[loop_idx_j] < k2; loop_idx_j++) {
      score_difference_sum += k2 - problem_scores_sorted[loop_idx_j];
    }

    // Calculate how many full 'M' vote blocks were distributed and any remainder.
    votes_distributed_below_max = Math.floor(score_difference_sum / max_votes_per_problem);
    score_difference_sum = score_difference_sum % max_votes_per_problem;

    // If the remaining vote capacity is less than or equal to the votes already distributed
    // to problems below max_possible_score, it implies the current candidate is already
    // guaranteed to be in a good position, so we can stop searching.
    if (remaining_capacity <= votes_distributed_below_max) {
      break;
    }

    // If we reach this point, it means `remaining_capacity` is still greater than
    // `votes_distributed_below_max`. We need to distribute the remaining votes
    // to the highest-scoring problems to see if our candidate can still make it.

    // Create a new array containing the highest-scoring problems (excluding those already handled)
    // and add `max_votes_per_problem` to their scores, simulating full votes.
    const adjusted_top_scores = problem_scores_sorted.slice(-(remaining_capacity - votes_distributed_below_max)).map((score_val) => score_val + max_votes_per_problem);

    // If there's a remainder from `score_difference_sum`, distribute these remaining votes
    // by reducing the scores of the `adjusted_top_scores` array.
    if (score_difference_sum > 0) {
      for (loop_idx_j = 0; loop_idx_j < adjusted_top_scores.length; loop_idx_j++) {
        temp_score_val = adjusted_top_scores[loop_idx_j];
        // If reducing by `score_difference_sum` would make it less than `max_possible_score`,
        // cap it at `max_possible_score` and adjust `score_difference_sum`.
        if (temp_score_val - score_difference_sum < max_possible_score) {
          adjusted_top_scores[loop_idx_j] = max_possible_score;
          score_difference_sum -= temp_score_val - max_possible_score;
        } else {
          // Otherwise, just reduce the score and clear the remainder.
          adjusted_top_scores[loop_idx_j] -= score_difference_sum;
          score_difference_sum = 0;
          break;
        }
      }

      // If `score_difference_sum` still has a remainder, apply it to the last element.
      if (score_difference_sum > 0) {
        adjusted_top_scores[adjusted_top_scores.length - 1] -= score_difference_sum;
      }
    }

    // Now, compare the `max_possible_score` of our current candidate with the top P scores.
    // These top P scores come either from `adjusted_top_scores` (if available) or
    // from the original `problem_scores_sorted` (for problems not affected by `M` votes).
    for (let loop_idx_k = 0; loop_idx_k < top_p_rank; loop_idx_k++) {
      let comparison_score;
      if (loop_idx_k < adjusted_top_scores.length) {
        // Use scores from the adjusted top scores array if within bounds.
        comparison_score = adjusted_top_scores[adjusted_top_scores.length - loop_idx_k - 1];
      } else {
        // Otherwise, use scores from the original sorted list (highest scores).
        comparison_score = problem_scores_sorted[problem_scores_sorted.length - loop_idx_k - 1];
      }

      // If the candidate's max possible score is greater than or equal to the P-th highest score,
      // then this candidate (and all problems with this score or higher) can be in the top P.
      if (max_possible_score >= comparison_score) {
        found_valid_candidate_score = current_score_candidate;
        break; // Found a valid candidate, no need to check further for this `current_idx_i`.
      }
    }
    if (found_valid_candidate_score) {
      break; // Found a valid candidate, exit the main loop.
    }
  }

  // After finding the lowest score that can be a candidate,
  // we need to find its original index in the sorted array.
  // This loop moves `current_idx_i` back to the first occurrence of `found_valid_candidate_score`.
  for (; current_idx_i > 0; current_idx_i--) {
    if (problem_scores_sorted[current_idx_i] !== problem_scores_sorted[current_idx_i - 1]) {
      break;
    }
  }

  // The number of problems that can be in the top P is the total number of problems
  // minus the index of the first valid candidate (which represents how many problems
  // are strictly worse than the candidate).
  const final_count_of_candidates = problem_scores_sorted.length - current_idx_i;

  // Output the final result.
  console.log(final_count_of_candidates);
}

// Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
ProcessScores(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
