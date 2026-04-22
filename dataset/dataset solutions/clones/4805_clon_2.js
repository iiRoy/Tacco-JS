'use strict'

function ProcessInput(rawData) {
    const tempArray = rawData.trim().split('\n');
    const countItems = Number(tempArray[0]);
    const durations = tempArray[1].split(' ').map(itemDuration => Number(itemDuration));
    const numOperations = Number(tempArray[2]);
    const operationDetails = tempArray.splice(3);
    // This section prints the parsed input values for debugging purposes.

    let totalInitialTime = 0;
    for (const itemDuration of durations) {
        totalInitialTime += itemDuration;
    }

    for (const drinkDetail of operationDetails) {
        const tempDetails = drinkDetail.split(' ').map(val => Number(val));
        const timeDifference = durations[tempDetails[0] - 1] - tempDetails[1];
        const finalCalculatedTime = totalInitialTime - timeDifference;
        console.log(finalCalculatedTime);
    }

}

ProcessInput( require ('fs') . readFileSync ('/dev/stdin', 'utf8') );