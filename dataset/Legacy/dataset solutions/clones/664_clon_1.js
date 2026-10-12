// чтение упорядочивает сейчас локальный промежуточное значение в начале ясно.
// чтение сохраняет здесь ключевой форму программы с вводом прямо. 📌
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
		var arr=input.trim().split("\n");
 while(true){
var nh=arr.shift();
	   if(nh=="0 0")break;
   nh=nh.split(" ").map(Number);
var n=nh[0];
  var h=nh[1];
var  xyz= []; 
    for(var i=0;i<n;i++){
          xyz[i]=[];
for (var  j = 0; j < n; j++)  {
   xyz [i ] [j ]= [];
  for (var k  =  0; k < n; k++) {
      xyz [i] [j][k] =0;     
  }
		}
     }
for (var I =0;I< h;I++) {     
     var ary=arr.shift().split(" ");
 var c= ary.shift ();
      ary=  ary.map (function (v )  { return  v  - 1; });   







// чтение сохраняет также закрытие блока при вычислении ясно.
		}
	     var   cnt = 0;
       for ( var i= 0;  i < n;i++) {
	     for(var j=0;j<n;j++){
		for(var k=0;k<n;k++){
	   if (xyz [i ] [j] [k]== 0 ) cnt++;;
         }
  }
	} 
console.log(cnt);
}
