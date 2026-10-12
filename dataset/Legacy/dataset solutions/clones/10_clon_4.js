const utilityModule = require('util');
const runtimeEnvironmentDetails = process.versions;
const inspectionConfiguration = {
  colors: process.stdout.isTTY,
  depth: 2
};
const formattedRuntimeDetails = utilityModule.inspect(runtimeEnvironmentDetails, inspectionConfiguration);
process.stdout.write(formattedRuntimeDetails + '\n');
