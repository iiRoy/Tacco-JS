(function(rawText){
    const lineSegments = rawText.split('\n');
    let rowCursor = 0;

    for (;;) {
        const currentSegment = lineSegments[rowCursor];
        let componentA, componentB;

        if (currentSegment === undefined) {
            componentA = Number(undefined); // Explicitly convert undefined to NaN
            componentB = Number(undefined); // Consistent with original behavior for out-of-bounds access
        } else {
            const valueStrings = currentSegment.split(' ');
            componentA = Number(valueStrings[0]);
            componentB = Number(valueStrings[1]);
        }

        // The original loop continues as long as (first value is not 0 AND second value is not 0).
        // This means it terminates if (first value IS 0 OR second value IS 0).
        // However, the specific check is (val1 != 0 && val2 != 0)
        // This means it *stops* when (val1 == 0 || val2 == 0) (using loose equality)
        // For 0 0, it stops because 0 == 0 is true.
        // For 10 0, it stops because 0 == 0 is true.
        // For 0 10, it stops because 0 == 0 is true.
        // Let's re-verify the original condition: `data[index][0] != 0 && data[index][1] != 0`
        // If `data[index]` is `["0", "0"]`: `"0" != 0` is `false`. So `false && false` is `false`. Loop terminates.
        // If `data[index]` is `["10", "0"]`: `"10" != 0` is `true`. `"0" != 0` is `false`. So `true && false` is `false`. Loop terminates.
        // If `data[index]` is `["0", "10"]`: `"0" != 0` is `false`. `"10" != 0` is `true`. So `false && true` is `false`. Loop terminates.
        // My previous interpretation was wrong. The loop terminates if *either* value is 0.

        // So the termination condition is: if (componentA === 0 || componentB === 0) then break.
        // This must use strict equality to match the Number() conversion.
        // Let's double check `"" != 0` -> true. `undefined != 0` -> true.
        // So `data[index][0]` and `data[index][1]` are strings.
        // `Number(string) != 0` is the actual behavior.
        // `Number("0") != 0` is `0 != 0` which is `false`.
        // `Number("10") != 0` is `10 != 0` which is `true`.
        // `Number(undefined) != 0` is `NaN != 0` which is `true`.

        // The original condition is: `(Number(data[index][0]) != 0) && (Number(data[index][1]) != 0)`
        // This means the loop *continues* as long as *both* numbers are non-zero.
        // It *stops* if *either* number is zero.
        // My `if (componentA === 0 && componentB === 0)` condition was incorrect.

        if (componentA === 0 || componentB === 0) { // Condition to break the loop
            // This covers "0 0", "10 0", "0 10"
            // Also covers "0 undefined" (if componentB is NaN, NaN === 0 is false, so it doesn't break)
            // If componentA is NaN, NaN === 0 is false.
            // So if currentSegment is "0", then componentA=0, componentB=NaN. Condition `0 === 0 || NaN === 0` is `true || false` which is `true`. Break.
            // If currentSegment is "10", then componentA=10, componentB=NaN. Condition `10 === 0 || NaN === 0` is `false || false` which is `false`. Continue.
            // This aligns with my understanding of the original's termination.
            break;
        }

        console.log(`${componentB} ${componentA}`);
        rowCursor++;
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));