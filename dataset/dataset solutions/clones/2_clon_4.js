Array.from({ length: 9 }, (_, firstMultiplierIndex) => firstMultiplierIndex + 1)
  .forEach(firstMultiplierValue => {
    Array.from({ length: 9 }, (_, secondMultiplierIndex) => secondMultiplierIndex + 1)
      .forEach(secondMultiplierValue => {
        console.log(`${firstMultiplierValue}x${secondMultiplierValue}=${firstMultiplierValue * secondMultiplierValue}`);
      });
  });
