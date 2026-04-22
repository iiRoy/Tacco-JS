const fileOperations = require('node:fs/promises');
const verification = require('node:assert');
const processControl = require('node:process');

const pauseExecution = (duration) => new Promise(resolve => setTimeout(resolve, duration));

class ActivityTracker {
    constructor() {
        this.observer = null;
    }
    enrollListener(callbackFunction) {
        this.observer = callbackFunction;
    }
    notifyActivity(activityDetails) {
        if (this.observer) {
            this.observer(activityDetails);
        }
    }
}

let observedOccurrences = 0;
const operationZone = '/tmp/operational-area';
const targetItem = operationZone + '/temporary-asset.txt';

async function performSimulation() {
    try {
        await fileOperations.rm(operationZone, { recursive: true, force: true }).catch(() => {});
        await fileOperations.mkdir(operationZone, { mode: '0777' });

        const monitor = new ActivityTracker();

        monitor.enrollListener((itemPayload) => {
            observedOccurrences++;
            console.log(`Detected activity on item: ${JSON.stringify(itemPayload)}`);
        });

        await pauseExecution(500);

        console.log(`Generating ${targetItem}`);
        await fileOperations.writeFile(targetItem, 'initial content');
        monitor.notifyActivity({ identifier: targetItem, status: 'created' });

        await fileOperations.writeFile(targetItem, 'updated content');
        monitor.notifyActivity({ identifier: targetItem, status: 'modified' });

        await fileOperations.unlink(targetItem);
        monitor.notifyActivity({ identifier: targetItem, status: 'removed' });

        await pauseExecution(100);

        verification.strictEqual(observedOccurrences, 3, `Expected 3 activities, but observed ${observedOccurrences}`);
        console.log('All checks passed successfully.');
        processControl.exit(0);

    } catch (failure) {
        console.error(`Simulation encountered an error: ${failure.message}`);
        processControl.exit(1);
    }
}

performSimulation();