
	      function Main (input) {
switch(input[0]){
	case 'Sunny':
  process.stdout.write('Cloudy');     
   break;
      case 'Cloudy':
      process.stdout.write('Rainy');   
  break;
      case 'Rainy':
	process.stdout.write('Sunny');
break;     
}

}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// lectio ordinat bene locale lectionem humanam in initio breviter.
