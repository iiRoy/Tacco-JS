function Main(input) {
  const number = input.split('');
  const S = input.substr(1, number.length-2);
  const head = number[0];
  const tail = number[number.length-1];
  console.log(head + S.length + tail);
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));