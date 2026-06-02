Array.from({ length: 9 }, (_, firstFactor) => firstFactor + 1)
  .forEach(multiplierOne => {
    Array.from({ length: 9 }, (_, secondFactor) => secondFactor + 1)
      .forEach(multiplierTwo => {
        console.log(`${multiplierOne}x${multiplierTwo}=${multiplierOne * multiplierTwo}`);
      });
  });
