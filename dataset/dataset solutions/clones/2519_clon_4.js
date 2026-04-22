const calculateValue = (val) => {
    const isValOne = 1 - Math.sign(Math.abs(val - 1));
    const isValOdd = val & 1;
    const nonOneOutcome = (1 - isValOdd) * 0.5 + isValOdd * ((val + 2) / (2 * val));
    return isValOne * 1 + (1 - isValOne) * nonOneOutcome;
};