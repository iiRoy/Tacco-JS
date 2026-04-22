function ProcessData(inputPayload) {
	let numericComponents = inputPayload.trim().split(" ").map(
		(strVal) => parseInt(strVal, 10)
	);

	let totalItems = numericComponents[0];
	let initialRange = numericComponents[1];
	let baseItem = numericComponents[2];

	let outputCollector = "";

	for (let elementIndex = 1; elementIndex <= totalItems; elementIndex++) {
		if (elementIndex <= initialRange) {
			outputCollector += baseItem + " ";
		} else {
			if (baseItem === 1) {
				outputCollector += (baseItem + 1) + " ";
			} else {
				outputCollector += (baseItem - 1) + " ";
			}
		}
	}
	outputCollector.replace(/ $/, '');

	console.log(outputCollector);
}
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));