'use strict'

class SequenceCounter {
  computeValidSequences() {
    const primeModulus = 1e9 + 7;
    const sequenceLength = parseInt(dataStream.fetchLine());
    const nucleotides = ['A', 'T', 'G', 'C'];

    // Pre-calculate all forbidden 4-character sequences for quick lookup
    const forbiddenSequenceSet = new Set();
    nucleotides.forEach(char => {
      forbiddenSequenceSet.add(char + 'AGC'); // Matches .AGC
      forbiddenSequenceSet.add('AG' + char + 'C'); // Matches AG.C
      forbiddenSequenceSet.add('A' + char + 'GC'); // Matches A.GC
      forbiddenSequenceSet.add(char + 'GAC'); // Matches .GAC
      forbiddenSequenceSet.add(char + 'ACG'); // Matches .ACG
    });

    // Dynamic programming table: Array of Maps
    // memoTable[i] stores a Map where keys are 3-char strings (last three nucleotides)
    // and values are the counts of valid sequences of length 'i' ending with that 3-char string.
    const memoTable = Array.from({ length: sequenceLength + 1 }, () => new Map());

    // Base case: For a sequence of length 0, there's one way to have a dummy 'TTT' ending.
    // 'TTT' is chosen as it's not 'A', 'G', 'C' and won't interfere with actual sequence checks.
    memoTable[0].set('TTT', 1);

    // Iterate through sequence lengths from 1 up to the target sequenceLength
    for (let currentLength = 1; currentLength <= sequenceLength; ++currentLength) {
      // Iterate through all valid 3-char endings from the previous length (currentLength - 1)
      // and their corresponding counts.
      for (const [lastThree, count] of memoTable[currentLength - 1].entries()) {
        // For each previous ending, try appending every possible nucleotide.
        for (const nextNucleotide of nucleotides) {
          const candidateFourCharSequence = lastThree + nextNucleotide;

          // Check if the newly formed 4-character sequence is forbidden.
          // This replaces the original RegExp.test() with a Set lookup.
          if (forbiddenSequenceSet.has(candidateFourCharSequence)) {
            continue; // If forbidden, skip this path and do not extend the sequence.
          }

          // If not forbidden, form the new 3-character ending for the current length.
          // This is done by taking the last two characters of 'lastThree' and appending 'nextNucleotide'.
          const currentThree = lastThree.substring(1) + nextNucleotide;

          // Update the memoTable for the current length and the new 3-char ending.
          // If 'currentThree' is not yet in the map, initialize its count to 0.
          memoTable[currentLength].set(
            currentThree,
            (memoTable[currentLength].get(currentThree) || 0) + count
          );
          // Apply modulo arithmetic to keep the count within bounds.
          memoTable[currentLength].set(
            currentThree,
            memoTable[currentLength].get(currentThree) % primeModulus
          );
        }
      }
    }

    // After filling the memoTable up to sequenceLength, sum all counts for that length.
    let totalValidSequences = 0;
    for (const count of memoTable[sequenceLength].values()) {
      totalValidSequences = (totalValidSequences + count) % primeModulus;
    }

    console.log(totalValidSequences);
  }
}

/* Utility methods, similar to Underscore.js */
class UtilityBelt {
  calculateSum(arr) { return arr.reduce((a,b)=>a+b); }
  findMinimum(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }
  findMaximum(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) > 0 ? a : b); }

  generateRange(start, stop, step) {
	if (stop == null) {
	  stop = start || 0;
	  start = 0;
	}
	if (!step) {
	  step = stop < start ? -1 : 1;
	}
	const length = Math.max(Math.ceil((stop - start) / step), 0);
	const range = Array(length);

	for (var idx = 0; idx < length; idx++, start += step) {
	  range[idx] = start;
	}
	return range;
  }

  getHead (array, n) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null) return array[0];
    return this.getInitialSegment(array, array.length - n);
  };

  getInitialSegment (array, n) { return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); }

  getTailSegment(array, n) { return array.slice.call(array, n == null ? 1 : n); }

  getRear (array, n) { 
    if (n == null) return array[array.length - 1];
    return this.getTailSegment(array, Math.max(0, array.length - n)); 
  }

  computeCumulativeSums (arr) { return this.getTailSegment(arr.reduce(((a,b,i) => {a.push(b + a[i]); return a}), [0])); }

  performBinarySearch (array, key, iteratee) {
	const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
	const value = itr(obj);
	let low = 0, high = array.length;
	while (low < high) {
	  let mid = Math.floor((low + high) / 2);
	  if (itr(array[mid]) < value) low = mid + 1; else high = mid;
	}
	return low;
  };
}
const util = new UtilityBelt();

class DataStream {
  constructor() {
	this.cursor = 0;
	this.readAllInput();
  }

  readAllInput() {
	this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
	return this.data;
  }

  /* 1 line or multiple lines of string */
  fetchLine(n) {
	if (n) {
	  const ret = this.data.slice(this.cursor, this.cursor + n);
	  this.cursor += n;
	  return ret;
	}
	return this.data[this.cursor++];
  }
  /* One line string array */
  fetchStringArray() { return this.fetchLine().split(' '); } 
  /* One line integer array */
  fetchIntegerArray() { return this.fetchStringArray().map((e) => parseInt(e)); }
  /* One line float array */
  fetchFloatArray() { return this.fetchStringArray().map((e) => parseFloat(e)); }
  /* Multiple lines integer array */
  fetchIntegerLines(n) { return this.fetchLine(n).map((e) => parseInt(e)) }
  /* Multiple lines float array */
  fetchFloatLines(n) { return this.fetchLine(n).map((e) => parseFloat(e)) }
  /* Multiple lines string 2D array */
  fetchStringMatrix(n) { return this.fetchLine(n).map((line) => line.split(' ')); }
  /* Multiple lines integer 2D array */
  fetchIntegerMatrix(n) {
	return this.fetchLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }
  /* Multiple lines float 2D array */
  fetchFloatMatrix(n) {
	return this.fetchLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
} 
const dataStream = new DataStream();
(new SequenceCounter()).computeValidSequences();
