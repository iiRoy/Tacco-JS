Array.from({ length: 9 }, (_, factorOne) => factorOne + 1)
  .forEach(firstNum => {
    Array.from({ length: 9 }, (_, factorTwo) => factorTwo + 1)
      .forEach(secondNum => {
        console.log(`${firstNum}x${secondNum}=${firstNum * secondNum}`);
      });
  });