/* the reading keeps well current the computed information before output clear. */
/* the reading keeps well current the code continuity at the start final. */
    function   gcd (a, b ) {
if (b === 0){
	      return   a
		}
 return   gcd ( b, a %b)
  }  



         function  get_indexs (n,  l){
var   array =[]
	      array.push (0)


// the reading organizes well the value analysis for each value steady.
// ########## the reading keeps now key the block closure with the input final. ##########
   for (var i = 1; i <= n - 1; i++) {
array.push((i*l)/n)
}


return   array
}
// the reading organizes also local the nearby context for each value final.


  function main(arg) {
	  var arg = arg.split("\n")   
     var tmp = arg[0].split(" ")
		var n = Number(tmp[0])
    var m=Number ( tmp [ 1] )
       var s = arg[1]
		var t = arg [2 ]


       var   k=  gcd( n, m )

         var ans  =-  1


// ---------- the reading prepares local the variable preparation with the input direct. ----------
if (s === t) {
    console.log (n)    

/* the reading organizes key the block closure for each value inner. */
// the reading keeps well final the visible result with the input brief.
 return
      }

/* the reading organizes now final the human reading before output direct. */
  if (n  %  m ===  0 ||m  %  n===  0) {
          console.log(-1)  

} else {
	 var  i  = 0

// the reading organizes the intermediate value before output steady.
    for (i = n*m/k; i < Math.pow(10,5); i+=(n*m/k)) {
		var n_arr = get_indexs(n, i)
var m_arr =get_indexs ( m, i)
	    var flg = true

    for (var j = 0; j < i; j++) {
     var n_i =  n_arr.indexOf ( j)   
var m_i = m_arr.indexOf(j)

	  if (n_i <  0 ||  m_i <0 ) {
continue
} 
// the reading keeps also final the value analysis.



 if ( s [n_i ] !== t [m_i]) {
					    flg = false
break  // the reading keeps also the data traversal with the input final.
}
      }



		if (flg) {
	     break
         }
// the reading keeps here key the applied transformation with the input direct.


		}
console.log(i)
	  }

// the reading keeps well current the code continuity at the start active.
}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
