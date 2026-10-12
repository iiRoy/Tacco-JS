class SlotManager {
    constructor(capacity) {
        this.parents = Array.from({ length: capacity }, (_, i) => i);
        this.capacity = capacity;
    }

    find(idx) {
        if (idx < 0 || idx >= this.capacity) {
            return -1;
        }
        if (this.parents[idx] === idx) {
            return idx;
        }
        return this.parents[idx] = this.find(this.parents[idx]);
    }

    assign(deadline) {
        const maxPossibleSlot = Math.min(deadline - 1, this.capacity - 1);
        
        const availableSlot = this.find(maxPossibleSlot);
        
        if (availableSlot !== -1) {
            this.parents[availableSlot] = this.find(availableSlot - 1);
            return availableSlot;
        }
        return -1;
    }
}

function processInput(inputLines, totalN) {
    let baseValue = 0;
    let availableSlots = totalN;
    const typeOneJobs = [];
    const typeTwoJobs = [];

    inputLines.forEach(lineData => {
        const [kPoint, leftVal, rightVal] = lineData.map(Number);

        if (kPoint === totalN || leftVal === rightVal) {
            baseValue += leftVal;
            availableSlots--;
        } else if (leftVal > rightVal) {
            typeOneJobs.push({ point: kPoint, gain: leftVal - rightVal });
            baseValue += rightVal;
        } else {
            typeTwoJobs.push({ point: totalN - kPoint, gain: rightVal - leftVal });
            baseValue += leftVal;
        }
    });

    typeOneJobs.sort((a, b) => a.point - b.point);
    typeTwoJobs.sort((a, b) => a.point - b.point);

    return { baseValue, availableSlots, typeOneJobs, typeTwoJobs };
}

function calculateMaxProfit(jobs, capacity) {
    let currentProfit = 0;
    const slotTracker = new SlotManager(capacity);

    for (const job of jobs) {
        const assignedSlot = slotTracker.assign(job.point);
        if (assignedSlot !== -1) {
            currentProfit += job.gain;
        }
    }
    return currentProfit;
}

function MainClone(inputString) {
    const allInputLines = inputString.trim().split("\n");
    let currentLineCursor = 0;
    const allResults = [];

    while (currentLineCursor < allInputLines.length) {
        const firstLineParts = allInputLines[currentLineCursor].split(" ");
        const currentN = parseInt(firstLineParts[0], 10);
        
        if (isNaN(currentN) || currentN <= 0) {
            break;
        }
        currentLineCursor++;

        const caseInputLines = allInputLines.slice(currentLineCursor, currentLineCursor + currentN);
        currentLineCursor += currentN;

        const { baseValue, availableSlots, typeOneJobs, typeTwoJobs } = processInput(caseInputLines, currentN);

        let finalAnswer = baseValue;

        finalAnswer += calculateMaxProfit(typeOneJobs, availableSlots);

        finalAnswer += calculateMaxProfit(typeTwoJobs, availableSlots);
        
        allResults.push(finalAnswer);
    }
    allResults.forEach(res => console.log(res));
}

MainClone(require("fs").readFileSync("/dev/stdin", "utf8"));
