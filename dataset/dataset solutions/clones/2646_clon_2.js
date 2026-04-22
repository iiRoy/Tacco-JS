/*
 *   Analysis of input string for repetitive patterns.
 *   This script processes an incoming text to segment it based on character sequences.
 */
let inputHandler = require("fs");

function ProcessInput(originalText) {
	// Initialize an array to store the resulting segments.
	const outputSegments = [];

	// Begin the primary segmentation process.
	ProcessSegmentA(originalText, 0, 1, outputSegments);

	// Display the total count of generated segments.
	console.log('%d', outputSegments.length);
}

// Function to handle the first stage of string segmentation.
function ProcessSegmentA(sourceString, currentIndex, segmentLength, outputSegments) {
	// If the current index exceeds the string length, terminate.
	if (currentIndex > sourceString.length) {
		return;
	}

	// Extract a segment from the source string.
	let currentSegment = sourceString.substr(currentIndex, segmentLength);

	// If the extracted segment is empty, terminate.
	if (currentSegment === '') {
		return;
	}

	// Process any initial repetitions found at the current index.
	HandleRepetitionsA(sourceString, currentIndex, outputSegments);

	// Update the current index based on the length of segments processed so far.
	currentIndex = outputSegments.join("").length;

	// If the updated index covers the entire source string, terminate.
	if (currentIndex >= sourceString.length) {
		return;
	}

	// Extract two consecutive characters for comparison.
	let previousSegment = sourceString.substr(currentIndex, segmentLength);
	let nextChar = sourceString.substr(currentIndex + segmentLength, 1);

	// If the two characters are identical, extend the current segment length.
	if (previousSegment === nextChar) {
		return ProcessSegmentA(sourceString, currentIndex, segmentLength + 1, outputSegments);
	}
	// Otherwise, push the characters and transition to the second segmentation stage.
	else {
		outputSegments.push(previousSegment, nextChar);
		return ProcessSegmentB(sourceString, currentIndex + segmentLength + 1, 1, nextChar, outputSegments);
	}
}

// Function for the second stage of string segmentation, often following a mismatch.
function ProcessSegmentB(sourceString, currentPosition, currentLen, initialSegment, processedParts) {
	// If the current position exceeds the string length, exit.
	if (currentPosition > sourceString.length) {
		return;
	}

	// Obtain a segment from the source string.
	let testedSegment = sourceString.substr(currentPosition, currentLen);

	// If the segment is empty, terminate.
	if (testedSegment === '') {
		return;
	}

	// Compare the initial segment with the newly tested segment.
	if (initialSegment === testedSegment) {
		// If they match and extending would exceed string bounds, perform a swap.
		if (currentPosition + currentLen + 1 > sourceString.length) {
			let lastButOnePart = processedParts[processedParts.length - 2];
			processedParts[processedParts.length - 2] = initialSegment;
			processedParts[processedParts.length - 1] = lastButOnePart;
			return ProcessSegmentB(sourceString, currentPosition, currentLen + 1, lastButOnePart, processedParts);
		}
		// Otherwise, continue extending the segment.
		return ProcessSegmentB(sourceString, currentPosition, currentLen + 1, initialSegment, processedParts);
	}
	// If they do not match, push the new segment and continue from the next position.
	else {
		processedParts.push(testedSegment);
		return ProcessSegmentB(sourceString, currentPosition + currentLen, 1, testedSegment, processedParts);
	}
}

// Function to identify and handle initial repetitive character sequences.
function HandleRepetitionsA(sourceString, startIdx, segmentList) {
	// Get the first character at the starting index.
	const firstCharacter = sourceString.substr(startIdx, 1);

	// Create a regular expression to match zero or more occurrences of the first character.
	const repeatRegex = new RegExp(firstCharacter + '*');

	// Find the longest match starting from the current index.
	const foundPattern = sourceString.substr(startIdx).match(repeatRegex);

	// Determine the length of the matched repetitive pattern.
	const patternLength = foundPattern[0].length;

	// If the pattern is longer than 3 characters, apply specific segmentation rules.
	if (patternLength > 3) {
		if (patternLength % 3 === 2) {
			// If remainder is 2, process with a split length of 2.
			segmentList = HandleRepetitionsB(foundPattern[0], 2, segmentList);
		} else if (patternLength % 3 === 1) {
			// If remainder is 1, process with a split length of 1.
			segmentList = HandleRepetitionsB(foundPattern[0], 1, segmentList);
		} else {
			// If remainder is 0, default to a split length of 2.
			segmentList = HandleRepetitionsB(foundPattern[0], 2, segmentList);
		}
	}
	return segmentList;
}

// Recursive helper function for processing repetitive patterns.
function HandleRepetitionsB(currentMatch, splitLength, outputCollection) {
	// Extract the initial part of the match based on the split length.
	const initialPart = currentMatch.substr(0, splitLength);
	outputCollection.push(initialPart);

	// If the remaining match length is less than 3, no further processing needed.
	if (currentMatch.length < 3) {
		return outputCollection;
	}
	// Otherwise, recursively process the rest of the match.
	else {
		const remainingPart = currentMatch.substr(splitLength);
		return HandleRepetitionsB(remainingPart, 3 - splitLength, outputCollection);
	}
}

// Initiate the entire process with input read from standard input.
ProcessInput(inputHandler.readFileSync("/dev/stdin", "utf8"));