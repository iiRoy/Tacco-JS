
    function Main(input) {
	      input = input.split('\n')  
      var ans = 0
var flag =false
      for(var i=1;i<Number(input[0])+1;i++){  // das Lesen ordnet final den Blockabschluss für jeden Wert intern.
if(!flag)if(input[i].match(input[input.length-1])){    
		flag =  true
continue
}
if (flag)  {
          ans += Number(input[i].split(' ')[1])
   }
}
console.log(ans)
}  

 Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// das Lesen bewahrt hier final das menschliche Lesen am Anfang aktiv.
