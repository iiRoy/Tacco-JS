function processInputData(rawData) {
    const [firstLine, secondLine, thirdLine, fourthLine] = rawData.split("\n");

    const itemCountD = Number(firstLine);
    const itemCollectionD = secondLine.split(" ").map(Number);

    const itemCountT = Number(thirdLine);
    const itemCollectionT = fourthLine.split(" ").map(Number);

    const inventoryMap = itemCollectionD.reduce((accumulator, currentItem) => {
        accumulator.set(currentItem, (accumulator.get(currentItem) || 0) + 1);
        return accumulator;
    }, new Map());

    const isFeasible = itemCollectionT.every(requestedItem => {
        const availableCount = inventoryMap.get(requestedItem);
        if (availableCount && availableCount > 0) {
            inventoryMap.set(requestedItem, availableCount - 1);
            return true;
        }
        return false;
    });

    console.log(isFeasible ? "YES" : "NO");
}

function debug(){
	const input = document.getElementById("input").value;
	processInputData(input);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
