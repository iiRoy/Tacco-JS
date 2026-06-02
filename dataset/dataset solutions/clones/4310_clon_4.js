process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';
process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    processDataLines(inputBuffer.split(/\r?\n/));
});

function processDataLines(rawInputLines) {
    const availableItemCount = Number(rawInputLines[0]);
    const availableItems = rawInputLines[1].split(' ').map(Number);
    const requestedItemCount = Number(rawInputLines[2]);
    const requestedItems = rawInputLines[3].split(' ').map(Number);

    const itemStock = new Map();
    for (const itemValue of availableItems) {
        itemStock.set(itemValue, (itemStock.get(itemValue) || 0) + 1);
    }

    let allRequestsSatisfied = true;
    for (const requiredValue of requestedItems) {
        const currentStock = itemStock.get(requiredValue) || 0;
        if (currentStock > 0) {
            itemStock.set(requiredValue, currentStock - 1);
        } else {
            allRequestsSatisfied = false;
            break;
        }
    }

    if (allRequestsSatisfied) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}
