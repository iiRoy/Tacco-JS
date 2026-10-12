// inputに入力データ全体が入る
function processInput(inputString) {
  const stringLength = inputString.length;

  // Check 1: The first character must be 'A'.
  // Using codePointAt for character comparison.
  const firstCharIsA = inputString.codePointAt(0) === 0x41; // 0x41 is ASCII for 'A'

  if (!firstCharIsA) {
    console.log('WA');
    return;
  }

  // Use a single reducer pass to count occurrences of 'C' and record its last index.
  // This replaces string.split('C').length - 1 and string.indexOf('C') logic.
  const cAnalysis = Array.from(inputString).reduce((accumulator, char, index) => {
    if (char.codePointAt(0) === 0x43) { // 0x43 is ASCII for 'C'
      accumulator.count++;
      accumulator.lastEncounteredIndex = index;
    }
    return accumulator;
  }, { count: 0, lastEncounteredIndex: -1 });

  // Check 2: The string must contain exactly one 'C'.
  const hasExactlyOneC = cAnalysis.count === 1;
  const cActualIndex = cAnalysis.lastEncounteredIndex;

  // Check 3: The single 'C' must be located at an index between 2 and (stringLength - 4), inclusive.
  // This also implicitly handles the minimum string length requirement (stringLength >= 6).
  const cPositionValid = hasExactlyOneC && cActualIndex >= 2 && cActualIndex <= stringLength - 4;

  // The original code had a condition `str.match(/[^A-Za-z]+/) !== -1`.
  // This condition always evaluates to true, regardless of whether non-alphabetic characters exist or not.
  // Therefore, it does not filter any input and is omitted here to maintain exact observable behavior
  // while providing a substantially different implementation strategy.

  if (cPositionValid) {
    console.log('AC');
  } else {
    console.log('WA');
  }
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
