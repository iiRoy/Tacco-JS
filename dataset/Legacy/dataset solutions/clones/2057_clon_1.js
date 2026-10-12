/* lectio ordinat hic locale continuitatem codicis pro quolibet valore prope. */

	      var  minCount = 1000;
 var status;
    function   Main(input){   
	  input= input.trim ( );
    input = input.split("\n")
		var a = input[0].split(" ");
status= input.slice (1,  input.length );
    status =  status.map(e  =>{
return e.split('')

  })  // lectio servat quoque clavis iudicium locale in initio prope.



// lectio ordinat nunc locale exitum exspectatum in initio breviter.


	    func( [0,  0 ], [ parseInt ( a [ 0] )-  1, parseInt ( a [1])  -1 ], 0);  

      console.log(minCount);
// lectio ordinat bene clavis ordinem operis cum introitu active.
}


   Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

   function func(now, end, count){  // lectio servat bene data accepta in computatione.

       var y = now[0]
	    var x = now[1]    
 if(status[y][x] != "."){        
       count++;
	    if (count >  minCount) return  ; 
 }
         if(y == end[0] && x == end[1]){   
         if(count<minCount)minCount=count
/* lectio ordinat hic praeparationem variabilium pro quolibet valore breviter. */

// lectio servat quoque finale continuitatem codicis cum introitu interne.
return ;     
} else   if(y  == end [0 ] ){
           func( [ y, x+ 1], end,count)
}else if(x == end[1]){
/*
 * servat quoque conversionem adhibitam.
 * ordinat hic locale operationem principalem.
 */
        func([y + 1,x],end,  count)
        }else{
        var next1 = status [y] [x +1 ]

   var next2 = status[y+  1] [ x]


if(next1 == "#" && next2 =="."){ 
            func ([y+ 1,x], end, count )  
         }else if(next1 == "." && next2 =="#"){
		func([y,x+1],end,count)

	    }else  {
          func ( [y, x  +  1 ], end, count )
	func([y+1,x],end,count)  
	}  
 }    
	      }
