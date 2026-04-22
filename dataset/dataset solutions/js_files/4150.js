function Main(input) {
  const inputNumbers = input.split(/\s/);
  var sum = 0;
  inputNumbers.forEach((num) => {
    sum += parseInt(num);
  });

  console.log(Math.ceil(sum / inputNumbers.length));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));