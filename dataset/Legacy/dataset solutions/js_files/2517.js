function main (input) {
  var num = input.split("\n").pop();
  
  
  var numofodd = getOddNumber(num);
      
  function getOddNumber(num) {
  	var isEven = num % 2 === 0 ? true : false;
	
    if(isEven) return Math.floor(num / 2);
    else return Math.floor(num / 2)+1;
    
  }
   var a = parseFloat(numofodd/num);
  console.log(a.toFixed(11)+'\n');

}

main(require("fs").readFileSync("/dev/stdin", "utf8"));