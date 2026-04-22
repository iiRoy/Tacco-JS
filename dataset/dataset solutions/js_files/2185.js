    // parameter "input" gets all data
    function Main(input) {
      [a, b] = input.split(' ').map(x => +x);
      if (a * b % 2 == 1) {
        console.log('Odd');
      } else {
        console.log('Even');
      }
    }
    // Don't edit this line!
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));