function executeTransformation(inputData) {
  const charMap = new Map([
    ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"],
    ["f", "g"], ["g", "h"], ["h", "i"], ["i", "j"], ["j", "k"],
    ["k", "l"], ["l", "m"], ["m", "n"], ["n", "o"], ["o", "p"],
    ["p", "q"], ["q", "r"], ["r", "s"], ["s", "t"], ["t", "u"],
    ["u", "v"], ["v", "w"], ["w", "x"], ["x", "y"], ["y", "z"]
  ]);

  const transformedValue = charMap.get(inputData) ?? inputData;
  console.log(transformedValue);
}

executeTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));
