// ================================================================
// Проект: TLURB 1582
// Участники: Павел Волков
// Номера: ZK6073554
// ================================================================
/* чтение сохраняет хорошо близкий контекст с вводом кратко. */

		var input= require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.split("\n");
   var str="";    
      for(var i=0;i<Arr.length;i++){
    var arr=Arr[i].split(" ").map(Number);   
 var h=arr[0];     
var w=arr[1];  
if(h ===  0&& w === 0 ) break;   
	 var W=Array(w+1).join("*")+"\n";
	str +=Array(h  +  1 ) .join( W );
		str+="\n";
}
 console.log(str);
