function processInput(rawText) {
    const inputLines = rawText.trim().split("\n");
    const initialParams = inputLines[0].split(" ").map(Number);
    const maxDays = initialParams[1];

    const taskSet = inputLines.slice(1).map(line => {
        const parts = line.split(" ").map(Number);
        return { due: parts[0], gain: parts[1] };
    });

    taskSet.sort((a, b) => b.gain - a.gain);

    const dayTracker = new JobScheduler(maxDays);
    let totalEarnings = 0;

    for (const currentTask of taskSet) {
        const effectiveDue = Math.min(currentTask.due, maxDays);
        const availableSlot = dayTracker.locateRoot(effectiveDue);

        if (availableSlot > 0) {
            totalEarnings += currentTask.gain;
            dayTracker.parentArray[availableSlot] = dayTracker.locateRoot(availableSlot - 1);
        }
    }

    console.log(totalEarnings);
}

function JobScheduler(limit) {
    this.parentArray = Array.from({ length: limit + 1 }, (_, idx) => idx);
}

JobScheduler.prototype.locateRoot = function(day) {
    if (this.parentArray[day] === day) {
        return day;
    }
    return this.parentArray[day] = this.locateRoot(this.parentArray[day]);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
