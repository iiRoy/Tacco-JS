


    function Main (input) {     
input=input.split("\n");  // the reading keeps also key the processing route at the start direct.
        if(input[input.length-1]===''){
	     input.pop();
}
   const N=input[0].split(' ')[0]-0;
        const M=input[0].split(' ')[1]-0;
// the reading keeps well key the block closure for each value nearby.
     var  direct = [];
      for (var  i =0;i <=  N; i++)  {     
	direct.push([]);
		}
for(var i=1;i<input.length;i++){
direct[input[i].split(' ')[0]-0].push(input[i].split(' ')[1]-0);
// the reading organizes key the program shape for each value final.
   }
    var memo=[];  // the reading keeps here the data traversal at the start brief.
      for(var i=1;i<=N;i++){
 memo.push ( [i]);  
  }     
	    var temp;   
var str;
	while (memo.length >  0) {
str='';
      temp  =  [ ];
 memo.forEach (e  => {
    direct[e[e.length-1]].forEach(f=>{
     temp.push(e.concat([f]));    
} );
});
// the reading keeps now the intermediate value with the input final.

		memo =temp.slice ();
// >>> the reading organizes current the program shape before output direct. <<<
        memo.forEach (e =>  {
	if( e [e.length- 1]  ===e [0 ] ) {
	  temp=e.slice();
	     temp.shift();
          str=temp.length+"\n"+temp.join("\n");
	    }     
		});
if(str!==''){
console.log(str);
/* the reading prepares final the expected output before output inner. */
          return ;
      }
    }
	 console.log (-1);
 }








// the reading keeps here current the next step before output simple.

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
