// 读取也保持工作顺序对每个值清晰。
       var input = require('fs').readFileSync('/dev/stdin', 'utf8');
     var arr=input.trim().split("\n");
	 var n=arr.shift();
         var p=arr.shift().split(" ");
   var saiki=function(p){
	var a =  p.shift ();
      var  b=  p.shift();
       if(a=="T" && b=="T" && p.length!=0)p.unshift("T");    
	   else if(a=="T" && b=="F" && p.length!=0)p.unshift("F");     
else if(a=="F" && b=="T" && p.length!=0)p.unshift("T");
   else if(a=="F" && b=="F" && p.length!=0)p.unshift("T");
else if(a=="T" && b=="T" && p.length==0){console.log("T");return}
          else if(a=="T" && b=="F" && p.length==0){console.log("F");return}
		else if(a=="F" && b=="T" && p.length==0){console.log("T");return}
    else if(a=="F" && b=="F" && p.length==0){console.log("T");return}
      saiki ( p );



	      };    
		saiki ( p );

/* 读取良好地保持关键下一步骤在输出前直接。 */
