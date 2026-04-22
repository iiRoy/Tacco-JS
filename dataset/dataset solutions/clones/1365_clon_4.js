const textUnit = "Hello World";
const lineTerminator = "\n";
const totalUnits = 1000;

const fullOutputContent = Array(totalUnits).fill(textUnit).join(lineTerminator) + lineTerminator;

process.stdout.write(fullOutputContent);