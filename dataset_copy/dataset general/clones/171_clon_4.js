import PeripheralDevice from './hardware-interface-module';
import SystemConfiguration from './system-settings-module';

const mainDeviceInstance = new PeripheralDevice(SystemConfiguration);

const displayOutputMessage = (prefixText, dataValue) => {
  process.stdout.write(`${prefixText}: ${JSON.stringify(dataValue)}\n`);
};

const repeatedOperation = () => {
  mainDeviceInstance.requestInformation('deviceStatus', null, (currentMeasurement) => {
    displayOutputMessage('Reported device state', currentMeasurement);
  });
};

repeatedOperation();

const intervalDurationMs = 500;
let periodicTaskHandle = setInterval(repeatedOperation, intervalDurationMs);