const inputSystem = require('readline');
const hostEnvironment = process;

async function processCoordinateData() {
    const inputInterface = inputSystem.createInterface({
        input: hostEnvironment.stdin,
        output: hostEnvironment.stdout,
        terminal: false
    });

    let receivedContent = '';
    for await (const segment of inputInterface) {
        receivedContent = segment;
        break;
    }

    inputInterface.close();

    const numericalValues = receivedContent.split(' ').map(Number);

    const [valX1, valY1, valX2, valY2] = numericalValues;

    const calculatedDistance = Math.hypot(valX1 - valX2, valY1 - valY2);

    hostEnvironment.stdout.write(calculatedDistance.toString() + '\n');
}

processCoordinateData();