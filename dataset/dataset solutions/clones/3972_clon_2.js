process.stdout.write(
  (
    // This self-executing anonymous function processes input data
    (inputStr) => {
      // Parse the input string into structured data.
      // The first line contains a single number, representing the total count of items.
      // Subsequent lines contain coordinate pairs.
      const [
        [totalItems],
        ...intermediateData
      ] = inputStr
        .trim()
        .split('\n')
        .map((lineStr) =>
          lineStr.split(' ').map((valStr) => parseInt(valStr, 10))
        );

      // Separate the parsed data into two distinct sets of points: red and blue.
      // The problem implies a specific order for these points in the input.
      const redDots = intermediateData.slice(0, totalItems);
      const blueDots = intermediateData.slice(totalItems, 2 * totalItems);

      // Sort the blue points based on their X-coordinate in ascending order.
      // This helps in optimizing the matching process.
      blueDots.sort((dotA, dotB) => dotA[0] - dotB[0]);

      // Initialize a counter for successful pairings.
      let successfulPairs = 0;

      // Iterate through the blue points to find a matching red point.
      // The loop condition `totalItems - successfulPairs` dynamically adjusts
      // the iteration count as points are removed.
      for (let blueIdx = 0; blueIdx < totalItems - successfulPairs; blueIdx++) {
        // Initialize variables to track the best matching red point for the current blue point.
        // `maxRedY` stores the maximum Y-coordinate found so far that satisfies the conditions.
        // `matchingRedIdx` stores the index of that red point in the `redDots` array.
        let maxRedY = -1;
        let matchingRedIdx = -1;

        // Iterate through all available red points.
        for (
          let redIdx = 0;
          redIdx < totalItems - successfulPairs;
          redIdx++
        ) {
          // Check if the current blue point can "cover" the current red point.
          // A blue point (x_b, y_b) covers a red point (x_r, y_r) if x_b > x_r and y_b > y_r.
          // The condition `blueDots[blueIdx][0] < redDots[redIdx][0]` means the blue point's X is *less* than red point's X.
          // The condition `blueDots[blueIdx][1] < redDots[redIdx][1]` means the blue point's Y is *less* than red point's Y.
          // The original code implies matching blue points to red points such that blue.x > red.x and blue.y > red.y.
          // Let's re-evaluate the original logic: `if ( bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1] ) continue;`
          // This `continue` means if blue X is less than red X AND blue Y is less than red Y, skip this red point.
          // So, we are looking for blue points where (blueX > redX OR blueY > redY)
          // AND we want to maximize redY.
          // This implies finding a red point such that blue.x > red.x and blue.y > red.y,
          // and among such red points, pick the one with the largest Y-coordinate.

          // Re-interpreting: The problem is likely about finding the maximum number of pairs (red, blue)
          // such that blue.x > red.x and blue.y > red.y.
          // The sort on blue points by X coordinate helps.
          // The inner loop iterates through red points.
          // `if ( bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1] ) continue;`
          // This condition means: if the current blue point's X is smaller than the red point's X,
          // AND the blue point's Y is smaller than the red point's Y, then this red point is NOT a candidate.
          // So, we are interested in red points where:
          // (blueDots[blueIdx][0] >= redDots[redIdx][0] OR blueDots[blueIdx][1] >= redDots[redIdx][1])
          // And from these candidates, we want to pick the one with `blueDots[blueIdx][0] > redDots[redIdx][0]`
          // and `blueDots[blueIdx][1] > redDots[redIdx][1]` and maximize `redDots[redIdx][1]`.

          // The original logic is a bit tricky with the `continue`.
          // Let's assume the standard interpretation for this kind of problem:
          // Find a red dot (rx, ry) and a blue dot (bx, by) such that bx > rx and by > ry.
          // The original code effectively does:
          // For a given blue point (bp[i]), iterate through all red points (rp[j]).
          // If blueX < redX AND blueY < redY, then it's NOT a candidate (continue).
          // Otherwise, it IS a candidate. Among candidates, find the one with the largest redY.
          // This seems to be an error in my initial interpretation of "cover".
          // The condition `if ( bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1] ) continue;`
          // means we are looking for a `rp[j]` such that `bp[i]` is not "strictly smaller" in both coords.
          // This is generally not how pairing problems like this are phrased.
          // Let's assume the original code's intent is to find the maximum Y-coordinate from eligible red points.
          // An eligible red point `rp[j]` for `bp[i]` must satisfy:
          // 1. `bp[i][0] > rp[j][0]` (blue X greater than red X)
          // 2. `bp[i][1] > rp[j][1]` (blue Y greater than red Y)
          // The `continue` condition: `bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1]`
          // This means if a red point is *strictly* to the top-right of the blue point, it's skipped.
          // This is still not the standard pairing condition.

          // Let's stick to literal translation of the `if` condition.
          // The original code's `if` condition is:
          // `if ( bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1] ) continue;`
          // This means: if blue point is "top-left" of red point, skip the red point.
          // So, we are interested in red points where this is NOT true.
          // i.e., `!(bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1])`
          // which simplifies to `bp[i][0] >= rp[j][0] || bp[i][1] >= rp[j][1]`
          // This is a strange condition for geometric matching.

          // Ah, I see! The problem is likely from an AtCoder-like contest where "matching"
          // often means `blue.x > red.x` and `blue.y > red.y`.
          // The `if ( bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1] ) continue;`
          // is likely a typo or a misunderstanding in the original code, or a very specific problem definition.
          // Let's assume the intent was to find `rp[j]` such that `bp[i][0] > rp[j][0]` AND `bp[i][1] > rp[j][1]`.
          // If so, the `continue` condition should be `if ( bp[i][0] <= rp[j][0] || bp[i][1] <= rp[j][1] ) continue;`
          // This is a critical difference.

          // Re-reading carefully:
          // `if ( bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1] ) continue;`
          // This means if both coordinates of the blue point are smaller than the red point's, skip.
          // This implies the red point is *eligible* if:
          // `bp[i][0] >= rp[j][0] OR bp[i][1] >= rp[j][1]`
          // Among these eligible red points, we select the one with the maximum Y-coordinate:
          // `if ( maxy < rp[j][1] ) { maxy = rp[j][1]; maxi = j; }`
          // This is a very specific logic. I must follow it precisely.

          // So, if the blue point is 'top-left' of the red point, then the red point is not a candidate.
          if (
            blueDots[blueIdx][0] < redDots[redIdx][0] &&
            blueDots[blueIdx][1] < redDots[redIdx][1]
          ) {
            // This red point is not suitable for the current blue point based on the problem's criteria.
            continue;
          }

          // If the red point is a candidate, check if its Y-coordinate is the maximum found so far.
          // We prioritize red points with higher Y-coordinates for pairing.
          if (maxRedY < redDots[redIdx][1]) {
            maxRedY = redDots[redIdx][1];
            matchingRedIdx = redIdx;
          }
        }

        // If a suitable red point was found for the current blue point.
        if (matchingRedIdx >= 0) {
          // Remove the matched blue point from the array.
          // Decrement `blueIdx` to re-evaluate the same index in the next loop iteration,
          // since `splice` shifts subsequent elements.
          blueDots.splice(blueIdx--, 1);
          // Remove the matched red point from its array.
          redDots.splice(matchingRedIdx, 1);
          // Increment the counter for successful pairings.
          successfulPairs++;
        }
      }

      // Return the total count of successful pairings as a string.
      return `${successfulPairs}`;
    }
  )(
    // Read the entire input from standard input as a UTF-8 string.
    require('fs').readFileSync('/dev/stdin', 'utf8')
  )
);