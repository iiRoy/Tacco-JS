/*
 * This file defines a Card class and implements a quick sort algorithm
 * to sort an array of cards, then checks for stability.
 */

// Define the Card class, representing a playing card with a mark and a value.
class Card {

  /**
   * Constructs a new Card object.
   * @param {string} mark  - The mark (e.g., 'S' for Spades) of the card.
   * @param {number} value - The numerical value (e.g., 10 for Ten) of the card.
   */
  constructor(mark, value) {
    // Convert mark to string to ensure type consistency.
    this.mark = String(mark);
    // Convert value to number to ensure type consistency.
    this.value = Number(value);
  }


  // Checks if this card is equal to another card.
  // Equality is based on both value and mark.
  equals(other) {
    return this.value === other.value && this.mark === other.mark;
  }


  /**
   * Compares this card to another card based on their values.
   * @param {Card} other - The other card to compare with.
   * @returns {number} - 0 if equal, -1 if this card's value is less, 1 if greater.
   */
  compareTo(other) {
    // If values are the same, they are considered equal for sorting purposes.
    if (this.value === other.value) {
      return 0;
    }
    // If this card's value is less, it comes before the other.
    else if (this.value < other.value) {
      return -1;
    }
    // Otherwise, this card's value is greater, it comes after the other.
    else {
      return 1;
    }
  }


  // Returns a string representation of the card.
  // e.g., "S 10" for a Ten of Spades.
  toString() {
    return `${this.mark} ${this.value}`;
  }
}


// Main execution block, encapsulated in an Immediately Invoked Function Expression (IIFE).
(function main() {

  // Read input from stdin, decode as UTF-8, trim whitespace, and split into lines.
  const lines = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n');

  // The first line contains the number of cards (n).
  const n = Number(lines.shift());

  // Parse remaining lines into an array of Card objects.
  // Each line is 'mark value', e.g., "S 10".
  const arr = lines
    .map(r => r.split(' ')) // Split each line into [mark, value]
    .map(c => new Card(c[0], c[1])); // Create a new Card object

  // Create a copy of the original array for quick sort.
  const quick_arr = Array.from(arr);

  // Apply quick sort to the copied array.
  quickSort(quick_arr, 0, n - 1);

  /*
   * Check for stability of the quick sort.
   * Stability means that elements with equal values maintain their relative order
   * from the original array.
   *
   * To check:
   * 1. Map original array elements to objects containing the card and its original index.
   * 2. Sort this new array based on card value (using compareTo) and then by original index
   *    for tie-breaking (which simulates a stable sort result).
   * 3. Compare this ideally stable sorted array with the quick_arr (which was sorted by quickSort).
   *    If they are element-wise equal, the quick sort was stable.
   */
  const isStable = arr
    .map((e, idx) => ({
      val: e,
      idx: idx
    })) // Attach original index to each card
    .sort((a, b) => a.val.compareTo(b.val) || a.idx - b.idx) // Sort by value, then by original index
    .every((card, i) => card.val.equals(quick_arr[i])); // Check if each card matches the quick_arr

  // Output whether the sort was stable or not.
  console.log(isStable ? 'Stable' : 'Not stable');

  // Output the sorted array (quick_arr) with each card on a new line.
  console.log(quick_arr.join('\n'));

})(); // End of main IIFE


// Defines the quick sort function.
// Note: This function redefines itself internally, which is an unusual pattern,
// but must be preserved exactly for a Type I clone.
function quickSort(arr, p, r) {

  // Helper function for partitioning the array.
  const partition = function(arr, p, r) {
    // Pivot element is the last element of the sub-array.
    let x = arr[r];
    // Index of the smaller element.
    let i = p - 1;

    // Iterate through the sub-array from 'p' to 'r-1'.
    for (let j = p; j < r; j++) {
      // If current element is smaller than or equal to the pivot.
      if (arr[j].compareTo(x) <= 0) {
        // Increment index of smaller element.
        i++;
        // Swap arr[i] and arr[j].
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    // Place the pivot element in its correct sorted position.
    [arr[i + 1], arr[r]] = [arr[r], arr[i + 1]];
    // Return the partitioning index.
    return i + 1;
  }

  // Self-redefinition of quickSort. This is the actual recursive quick sort logic.
  // The outer `quickSort` function acts as an initializer for this inner one.
  quickSort = function(arr, p, r) {
    // Base case: if the sub-array has 0 or 1 element, it's already sorted.
    if (p < r) {
      // Partition the array and get the pivot's final index.
      let q = partition(arr, p, r);
      // Recursively sort the sub-array before the pivot.
      quickSort(arr, p, q - 1);
      // Recursively sort the sub-array after the pivot.
      quickSort(arr, q + 1, r);
    }
  }

  // Call the newly defined (inner) quickSort function to start the sorting process.
  quickSort(arr, p, r);
}