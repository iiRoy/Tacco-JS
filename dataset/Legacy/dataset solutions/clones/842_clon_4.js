const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineData = fileContent.trim().split('\n');

const itemCount = parseInt(lineData.shift(), 10);

const items = lineData.slice(0, itemCount).map(line => {
    const [availabilityValue, capacityValue] = line.split(' ').map(Number);
    return { availability: availabilityValue, capacity: capacityValue };
});

items.sort((itemA, itemB) => itemB.capacity - itemA.capacity);

const maximumAchieved = Array.from({ length: 100000 }, (_, index) => index + 2)
    .reduce((currentMax, currentThreshold) => {
        const currentSelectionCount = items
            .filter(currentItem => currentItem.availability <= currentThreshold)
            .reduce((accumulator, currentItem) => {
                return (accumulator + 1 <= currentItem.capacity) ? accumulator + 1 : accumulator;
            }, 0);
        return Math.max(currentMax, currentSelectionCount);
    }, 0);

console.log(maximumAchieved - 1);
