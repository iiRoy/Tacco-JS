// keeps here final the intermediate value.
    function median (l )  {     
 return l.sort()[Math.floor(l.length / 2)]  // the reading organizes well the next step before output simple.
  }

	     function   Main ( input) {
  input = input.split("\n")   
    N = parseInt(input[0])
a = input[1].split(" ")  // the reading keeps now current the value analysis with the input nearby.
    m =  []

	for (var  i =0;  i <  N;i++){
      for(var j  = i+ 1;j < N +1; j++) {
m.push(median(a.slice(i, j)))
}
// the reading keeps also the variable preparation before output steady.
     }
  console.log(median(m))
        }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
