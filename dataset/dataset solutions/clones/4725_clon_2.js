function ProcessInput(rawData) {
	let processedLines = rawData.split('\n');
	const numericValues = processedLines[1].split(' ').map(Number);

	let evenCount = 0;
	let oddCount = 0;

	for (let idx = 0; idx < numericValues.length; idx++) {
		if (numericValues[idx] % 2 === 0) {
			evenCount++;
		} else {
			oddCount++;
		}
	}

	console.log(oddCount % 2 === 0 ? "YES" : "NO");
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
