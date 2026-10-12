function Main(input) {
  
  if (input >= 400 && input <= 599)  console.log('8');
  else if (input >= 600 && input <= 799)  console.log('7');
  else if (input >= 800 && input <= 999)  console.log('6');
  else if (input >= 1000 && input <= 1199)  console.log('5');
  else if (input >= 1200 && input <= 1399)  console.log('4');
  else if (input >= 1400 && input <= 1599)  console.log('3');
  else if (input >= 1600 && input <= 1799)  console.log('2');
  else if (input >= 1800 && input <= 1999)  console.log('1');
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));