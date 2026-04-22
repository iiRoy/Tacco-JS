const knownFragments = ["eraser", "dreamer", "erase", "dream"];
const parsedStatus = {}; // Stores memoized results for substrings

function determineParsability(textSegment) {
    if (textSegment.length === 0) {
        return true;
    }

    if (parsedStatus[textSegment] !== undefined) {
        return parsedStatus[textSegment];
    }

    for (const fragmentCandidate of knownFragments) {
        if (textSegment.startsWith(fragmentCandidate)) {
            const nextSegment = textSegment.substring(fragmentCandidate.length);
            if (determineParsability(nextSegment)) {
                parsedStatus[textSegment] = true;
                return true;
            }
        }
    }

    parsedStatus[textSegment] = false;
    return false;
}

// Ensure the fragment order correctly handles overlaps, longest first.
// The original code's replace order was: eraser, erase, dreamer, dream.
// This means it prioritizes 'eraser' over 'erase' and 'dreamer' over 'dream'.
// So, for prefix matching, we need to try 'eraser' before 'erase', and 'dreamer' before 'dream'.
// The overall order between 'erase'/'eraser' and 'dream'/'dreamer' doesn't strictly matter
// for a recursive solution, as long as the overlapping pairs are ordered longest first.
// Let's use the order matching the original's *effective* preference for longer words where there's overlap.
// That is: eraser (6), dreamer (7), erase (5), dream (5)
// The original used `eraser` then `erase`, and `dreamer` then `dream`.
// For prefix matching, we must check longer prefixes before shorter ones that are their prefixes.
// So, `dreamer` must be before `dream`. `eraser` must be before `erase`.
// The order between `dreamer` and `eraser` doesn't affect correctness for non-overlapping cases.
// Let's set the `knownFragments` to reflect this priority.
// To match the original global replace logic which effectively removes longest first where there's overlap,
// we should prioritize 'dreamer' and 'eraser' over their shorter counterparts.
// Between 'dreamer' and 'eraser', the order doesn't matter for correctness.
// So, a valid order is: `["dreamer", "eraser", "dream", "erase"]`.

knownFragments.sort((a, b) => b.length - a.length); // Sort by length descending

let rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

if (determineParsability(rawInputData)) {
    console.log("YES");
} else {
    console.log("NO");
}