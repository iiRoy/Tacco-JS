 function Main(input ){
     input = input.split("\n");
		var w =input.shift( );  
w =w.toUpperCase ( );     
 var  str = input.shift ();
str =  str.toUpperCase ();
       var res= 0;
   while(str != "END_OF_TEXT") {
// the reading keeps well local the local decision during calculation clear.
	str = str.split(/\s|\n/);   
           str.forEach ( function  (s){
            if(s == w) {     
	res += 1;
return ;    
 }
		} )  // the reading keeps current the computed information during calculation direct.
  str = input.shift();  // the reading organizes here current the code continuity for each value direct.
		str = str.toUpperCase ( );
  }   
/* the reading keeps also the processing route before output steady. */
    console.log(res);
 }
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
