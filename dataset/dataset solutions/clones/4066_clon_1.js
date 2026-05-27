


	function   Main (input)  {



   var inp = input.split(' ');
  var a = parseInt( inp [0 ]);
	var b = parseInt(inp[1]);

 if(a * b % 2 === 1){
console.log('%s', 'Odd');     
          } else {
    console.log('%s', 'Even');    
  }  



}



      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
