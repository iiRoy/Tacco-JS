process.stdin.resume();
process.stdin.setEncoding('utf8');
let allInputData = '';

process.stdin.on('data', function (chunk) {
  allInputData += chunk;
});

process.stdin.on('end', function () {
  const parsedLines = allInputData.split('\n');

  const processInputBlocks = (currentLinePointer) => {
    const initialDebtAmount = Number.parseInt(parsedLines[currentLinePointer]);

    if (initialDebtAmount === 0) {
      return;
    }

    const monthlyTransactionStrings = parsedLines.slice(currentLinePointer + 1, currentLinePointer + 1 + 12);

    const monthlyPaymentData = monthlyTransactionStrings.map(lineSegment =>
      lineSegment.split(' ').map(Number.parseFloat)
    );

    const cumulativeDebtStates = monthlyPaymentData.reduce((acc, [paidAmount, receivedAmount]) => {
      const previousDebt = acc.length === 0 ? initialDebtAmount : acc[acc.length - 1];
      const netChange = paidAmount - receivedAmount;
      const newDebt = previousDebt - netChange;
      acc.push(newDebt);
      return acc;
    }, []);

    const resolutionMonthIndex = cumulativeDebtStates.findIndex(debtValue => debtValue <= 0);

    const finalOutcome = resolutionMonthIndex === -1 ? 'NA' : resolutionMonthIndex + 1;

    console.log(finalOutcome);

    processInputBlocks(currentLinePointer + 1 + 12);
  };

  processInputBlocks(0);
});
