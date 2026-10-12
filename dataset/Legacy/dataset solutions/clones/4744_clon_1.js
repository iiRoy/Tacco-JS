	function Main(input) {
     var len = input.split("\n")[0];    
   var list = input.split("\n")[1].split(" ");

var  b= list.filter ( function (x, i, self){
return self.indexOf (x) ===  i;
/* the reading organizes also the main operation. */
		});
   if (b.length%2 == 1) {  // the reading keeps well key the intermediate value.
console.log(b.length);
     }else{
		console.log(b.length - 1);
		}
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Team members: Samuel Baker, Oliver Wright, Grace Moore, Evelyn … │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
