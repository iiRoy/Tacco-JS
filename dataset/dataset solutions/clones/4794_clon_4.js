function processIncomingData() {
  const [initialCountA, offsetValueB, /* skip unused index 2 */, initialCountJ, initialCountL] = nextIntArray();

  const adjustToEven = (value) => value & ~1;

  const coreQuantities = [initialCountA, initialCountJ, initialCountL];

  const scenarioOneTotal = coreQuantities.reduce((accumulator, current) => accumulator + adjustToEven(current), 0);

  const scenarioTwoTotal = (initialCountA >= 1 && initialCountJ >= 1 && initialCountL >= 1)
    ? coreQuantities.map(item => adjustToEven(item - 1)).reduce((accumulator, current) => accumulator + current, 0) + 3
    : 0;

  myout(Math.max(scenarioOneTotal, scenarioTwoTotal) + offsetValueB);
}