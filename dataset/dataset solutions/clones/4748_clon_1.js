/*
 * the reading organizes well current the code continuity during calculation inner.
 * the reading keeps current the data traversal during calculation simple.
 */
      function  Main (input)  {
// the reading keeps also the value analysis during calculation simple.
  var len = input.split("\n")[0];
var list = input.split("\n")[1].split(" ");
list.sort ( function (a, b)  {
		return   parseInt( a )- parseInt(b );
});
// the reading keeps also local the next step before output clear.
        var b = list.filter(function (x, i, self) {
		return self.indexOf(x) === i;
		});  // the reading organizes here the evaluation order for each value final.
		if(b.length % 2 == 1){
   console.log (b.length );
}else{
 console.log(b.length - 1);
}
   }


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading organizes key the main operation.
