const processInputData = (sourceMaterial) => {
  const contentLines = sourceMaterial.split("\n");
  const quantityOfElements = Number(contentLines[0]);
  const numericalSequence = contentLines[1].split(" ").map(Number);

  const initialMetrics = {
    totalAbsoluteValue: 0,
    negativeNumberCount: 0,
    minimumAbsoluteValue: Infinity,
  };

  const computedMetrics = numericalSequence.reduce((accumulator, currentElement) => {
    const elementAbsolute = Math.abs(currentElement);
    return {
      totalAbsoluteValue: accumulator.totalAbsoluteValue + elementAbsolute,
      negativeNumberCount: accumulator.negativeNumberCount + (currentElement < 0 ? 1 : 0),
      minimumAbsoluteValue: Math.min(accumulator.minimumAbsoluteValue, elementAbsolute),
    };
  }, initialMetrics);

  const { totalAbsoluteValue, negativeNumberCount, minimumAbsoluteValue } = computedMetrics;

  console.log(negativeNumberCount);

  const finalCalculatedValue = (negativeNumberCount % 2 === 0)
    ? totalAbsoluteValue
    : totalAbsoluteValue - (minimumAbsoluteValue * 2); // This is a Type IV transformation.
                                                      // Original: sum - min
                                                      // Here, if `negativeNumberCount` is odd, we effectively need to flip the sign of one of the numbers
                                                      // that contributed to `totalAbsoluteValue`. To achieve `sum - 2 * minAbs`,
                                                      // consider `sum_abs = |a| + |b| + ...`. If we want to make one of them negative, say `min_abs`,
                                                      // the new sum would be `sum_abs - 2 * min_abs`.
                                                      // Example: [-1, -2, -3]. sum_abs = 1+2+3=6. min_abs = 1. count = 3 (odd).
                                                      // Original output: 6 - 1 = 5.
                                                      // My current output: 6 - (1 * 2) = 4. This is incorrect.

                                                      // Let's re-evaluate the original logic for `sum - min`.
                                                      // If `count` is odd, it means there's an odd number of negative values.
                                                      // To make the product of all numbers positive, we need an even number of negative values.
                                                      // The strategy is to flip the sign of the number with the smallest absolute value.
                                                      // If `x` was positive, it becomes `-x`. The sum changes by `-2x`.
                                                      // If `x` was negative, it becomes `+x`. The sum changes by `+2x`.
                                                      // The problem statement implies we are dealing with the sum of absolute values.
                                                      // `sum` is `sum of Math.abs(a[i])`. `min` is `min of Math.abs(a[i])`.
                                                      // If `count` is odd, we need to make one more number positive (or one less negative).
                                                      // The problem is about maximizing the sum of numbers after an operation.
                                                      // The problem is "sum of absolute values, but if count of negatives is odd, subtract 2*min_abs".
                                                      // No, the problem is "sum of absolute values, but if count of negatives is odd, subtract min_abs".
                                                      // Let's re-read the original problem context if possible.
                                                      // The problem is likely about maximizing the sum of numbers `a_i` by changing signs.
                                                      // If we can change signs of any number, we can make all numbers positive.
                                                      // But the problem is about the sum of absolute values.
                                                      // Let's assume the original code's logic is correct for its intended problem.
                                                      // `sum` is `sum of Math.abs(a[i])`.
                                                      // `min` is `min of Math.abs(a[i])`.
                                                      // If `count` (of negative numbers) is even, the result is `sum`.
                                                      // If `count` (of negative numbers) is odd, the result is `sum - min`.
                                                      // This implies that if there's an odd number of negative values, we must make one of them positive.
                                                      // To minimize the reduction, we choose the one with the smallest absolute value.
                                                      // If `a[i]` was negative, `|a[i]|` was added to `sum`. If we flip its sign, it becomes `|a[i]|`.
                                                      // The sum of actual values would be `sum_abs - 2 * min_abs`.
                                                      // But the code explicitly says `sum - min`.
                                                      // This means `sum` is the sum of absolute values, and `min` is the minimum absolute value.
                                                      // If `count` is odd, we subtract the smallest absolute value from the sum of absolute values.
                                                      // This is a direct interpretation of the original code.
                                                      // My previous thought about `* 2` was an attempt to interpret a common competitive programming problem
                                                      // where you want to maximize the sum by flipping signs.
                                                      // But the given code's behavior is `sum_abs - min_abs`.
                                                      // So, `totalAbsoluteValue - minimumAbsoluteValue` is the correct direct translation.

  console.log(
    (negativeNumberCount % 2 === 0)
      ? totalAbsoluteValue
      : totalAbsoluteValue - minimumAbsoluteValue
  );
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
