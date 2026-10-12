var input = '';

function* caseGenerator(lines) {
  let currentLineIndex = 0;
  while (currentLineIndex < lines.length) {
    const initialBalanceString = lines[currentLineIndex++];
    const initialBalanceValue = Number(initialBalanceString);

    if (initialBalanceValue === 0) {
      return;
    }

    const monthlyFinancialMovements = [];
    for (let monthCounter = 0; monthCounter < 12; monthCounter++) {
      const transactionRecord = lines[currentLineIndex++];
      const [incomingFunds, outgoingFunds] = transactionRecord.split(' ').map(Number);
      monthlyFinancialMovements.push({ incomingFunds, outgoingFunds });
    }
    yield { initialBalanceValue, monthlyFinancialMovements };
  }
}

function processFinancialCase(caseDetails) {
  const startingBalance = caseDetails.initialBalanceValue;
  const monthlyRecords = caseDetails.monthlyFinancialMovements;

  const outcome = monthlyRecords.reduce((accumulator, record, monthOrdinal) => {
    if (accumulator.firstMonthOfDeficit !== null) {
      return accumulator;
    }

    const updatedBalance = accumulator.currentAccountBalance - (record.incomingFunds - record.outgoingFunds);
    if (updatedBalance <= 0) {
      return { currentAccountBalance: updatedBalance, firstMonthOfDeficit: monthOrdinal + 1 };
    } else {
      return { currentAccountBalance: updatedBalance, firstMonthOfDeficit: null };
    }
  }, { currentAccountBalance: startingBalance, firstMonthOfDeficit: null });

  if (outcome.firstMonthOfDeficit !== null) {
    console.log(outcome.firstMonthOfDeficit);
  } else {
    console.log('NA');
  }
}

function main() {
  const caseIterator = caseGenerator(input);
  for (const currentCaseData of caseIterator) {
    processFinancialCase(currentCaseData);
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});
