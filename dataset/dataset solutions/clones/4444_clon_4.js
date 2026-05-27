function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}

function createItemDispenser(initialCounts) {
    let currentItemIdentifier = 1;
    const itemStock = [...initialCounts];

    return function dispenseNextItem() {
        while (currentItemIdentifier <= itemStock.length && itemStock[currentItemIdentifier - 1] === 0) {
            currentItemIdentifier++;
        }
        if (currentItemIdentifier > itemStock.length) {
            // This state should ideally not be reached with valid problem constraints
            // where the grid can be fully filled by the provided items.
            return undefined;
        }

        itemStock[currentItemIdentifier - 1]--;
        return currentItemIdentifier;
    };
}

function ProcessGrid(rawInputContent) {
    const dataLines = rawInputContent.trim().split('\n');

    const [gridHeight, gridWidth] = dataLines[0].split(' ').map(Number);
    const initialItemQuantities = dataLines[2].split(' ').map(Number);

    const itemSupplier = createItemDispenser(initialItemQuantities);

    const constructedGrid = Array.from({ length: gridHeight }, (_, rowIndex) => {
        const rowElements = Array.from({ length: gridWidth }, () => itemSupplier());

        if (rowIndex % 2 !== 0) {
            return rowElements.reverse();
        }
        return rowElements;
    });

    const finalOutputString = constructedGrid.map(row => row.join(' ')).join('\n');
    myout(finalOutputString);
}

ProcessGrid(myin());
