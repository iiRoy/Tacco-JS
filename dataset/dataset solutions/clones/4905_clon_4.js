process.stdin.resume();
process.stdin.setEncoding("utf-8");

process.stdin.on("data", function(incomingPayload) {
  const processedPayload = String(incomingPayload).trim();
  const constituentParts = processedPayload.split(/\s+/);

  const initialComponent = constituentParts[0];
  const middleComponent = constituentParts[1];
  const finalComponent = constituentParts[2];

  const distinctItemCollector = new Set([initialComponent, middleComponent, finalComponent]);
  const distinctItemQuantity = distinctItemCollector.size;

  const outcomeMapping = {
    1: "1",
    2: "2",
    3: "3"
  };

  process.stdout.write(outcomeMapping[distinctItemQuantity]);
});