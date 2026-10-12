'use strict';

function ProcessInput(rawData) {
  const inputLines = rawData.split('\r\n');
  const itemIdentifiers = inputLines.slice(1);

  const itemTrackerMap = {};
  const STARTING_BALANCE = 0;
  let currentBalance = STARTING_BALANCE;

  // Helper function to manage the state of a single item and return its impact on the total balance
  const adjustItemBalance = (tracker, identifier) => {
    let balanceAdjustment = 0;
    if (tracker[identifier] === true) {
      // Item was active, now deactivate it
      tracker[identifier] = false;
      balanceAdjustment = -1;
    } else {
      // Item was inactive or new, now activate it
      tracker[identifier] = true;
      balanceAdjustment = 1;
    }
    return balanceAdjustment;
  };

  itemIdentifiers.forEach(singleIdentifier => {
    currentBalance += adjustItemBalance(itemTrackerMap, singleIdentifier);
  });

  console.log(currentBalance);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
