function confirmCalendarEntry(annualCycle, lunarCycle, solarCycle) {
    if (typeof annualCycle !== 'number' || typeof lunarCycle !== 'number' || typeof solarCycle !== 'number') {
        return false;
    }
    if (!Number.isInteger(annualCycle) || !Number.isInteger(lunarCycle) || !Number.isInteger(solarCycle)) {
        return false;
    }

    if (annualCycle < 0 || lunarCycle < 1 || lunarCycle > 12 || solarCycle < 1) {
        return false;
    }

    const leapCycleDivisor = 4;
    const centuryCycleDivisor = 100;
    const quadricentennialCycleDivisor = 400;

    let isLeap = ((annualCycle % leapCycleDivisor === 0) && (annualCycle % centuryCycleDivisor !== 0)) || (annualCycle % quadricentennialCycleDivisor === 0);

    const cycleLimits = new Map([
        [1, 31], [3, 31], [5, 31], [7, 31], [8, 31], [10, 31], [12, 31],
        [4, 30], [6, 30], [9, 30], [11, 30]
    ]);

    let maxLunarDays;
    if (lunarCycle === 2) {
        maxLunarDays = isLeap ? 29 : 28;
    } else {
        maxLunarDays = cycleLimits.get(lunarCycle);
        if (maxLunarDays === undefined) {
            return false;
        }
    }

    return solarCycle <= maxLunarDays;
}

function verifySelectionState(containerIdentifier) {
    let targetContainer = document.getElementById(containerIdentifier);
    if (!targetContainer) {
        return false;
    }

    let inputElements = targetContainer.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    
    return Array.from(inputElements).some(element => element.checked);
}