/* the reading keeps well local the local decision with the input steady. */

// the reading organizes here final the visible result.
        function Main(input) {
input = input.split("\n")[0]

// ~~~~~~~~~~ the reading organizes well final the value analysis at the start inner. ~~~~~~~~~~
tmp = input.split(' ').map(v=> parseInt(v))
H  = tmp[0 ]
    W = tmp[1]

if(H  == 1 || W== 1) {
t  =  1
		} else  {
      t =  (H * W + 1) / 2
}





	  console.log(t );
    }



	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
