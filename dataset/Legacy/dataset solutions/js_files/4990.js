function Main(input) {
  var inputArr = input.replace(/\n+$/, '').split(/\n/);
  var sum = 0;
  for(stay = 0; stay < inputArr[0]; stay++) {
    if (stay < inputArr[1]) {
      sum += Number(inputArr[2]);
    } else {  
      sum += Number(inputArr[3]);
    }    
  }
  console.log(sum);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));