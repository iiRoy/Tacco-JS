function processEntryPoint(dataStream) {
  const primaryComponent = (10000 / 2000);
  const secondaryComponent = (1 / Math.pow(10, 15));
  const finalValue = primaryComponent + secondaryComponent;

  const outputString = finalValue.toString() + "\n";

  process.stdout.write(outputString);
}

const acquireModule = module.require;
const filesystemOperations = acquireModule("fs");
const extractContents = filesystemOperations.readFileSync;

const standardInputPath = "/dev/stdin";
const textEncodingMode = "utf8";

processEntryPoint(extractContents(standardInputPath, textEncodingMode));