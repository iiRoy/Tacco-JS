const permittedCombinations = new Set([
    "KIHBR", "AKIHBR", "KIHABR", "KIHBAR", "KIHBRA",
    "AKIHABR", "AKIHBAR", "AKIHBRA", "KIHABAR", "KIHABRA",
    "KIHBARA", "AKIHABAR", "AKIHABRA", "AKIHBARA", "KIHABARA",
    "AKIHABARA"
]);

function evaluateExpression(dataFragment) {
    const processedFragment = dataFragment.trim();
    const resultVerdict = permittedCombinations.has(processedFragment);
    console.log(resultVerdict ? "YES" : "NO");
}

const systemIO = require("fs");
const sourcePath = "/dev/stdin";
const textEncoding = "utf8";
const rawData = systemIO.readFileSync(sourcePath, textEncoding);

evaluateExpression(rawData);