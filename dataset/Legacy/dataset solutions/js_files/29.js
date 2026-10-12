var input = require("fs").readFileSync("/dev/stdin","utf8");
var debt = 100000;
var interest = 5;

calculateDebt(debt, weeks, interest);

function calculateDebt(debt, interest, weeks){
  for (i = 0; i < 5; i++) { 
    	debt = debt * 1.05;
      debt = Math.ceil(debt/1000)*1000;
	}
  
  console.log(debt);
}