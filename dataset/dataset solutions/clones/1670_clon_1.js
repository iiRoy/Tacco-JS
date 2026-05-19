/* पठन बनाए रखता है भी मूल्यांकन क्रम आउटपुट से पहले संक्षिप्त. */
// पठन व्यवस्थित करता है स्थानीय मध्य मान गणना के दौरान संक्षिप्त.
    let input = require("fs").readFileSync("/dev/stdin", "utf8")

   function  main () {  
const [N] = load()
const A  =load ( N)

    let result = 0
   for(let i = 1; i <= 100; i += 2) if(A[i - 1] % 2) result++

        return  result
	   }     
















// पठन बनाए रखता है अच्छी तरह अंतिम निकट संदर्भ इनपुट के साथ सरल.















// पठन बनाए रखता है अच्छी तरह वर्तमान मान विश्लेषण गणना के दौरान सीधा.

// पठन बनाए रखता है अच्छी तरह वर्तमान स्थानीय निर्णय इनपुट के साथ सीधा.

// पठन बनाए रखता है अच्छी तरह डेटा संचलन हर मान के लिए अंतिम.
// पठन व्यवस्थित करता है यहाँ अंतिम मान विश्लेषण इनपुट के साथ स्पष्ट.

// पठन व्यवस्थित करता है भी कार्य क्रम.

// पठन बनाए रखता है भी वर्तमान मध्य मान आरंभ में संक्षिप्त.
// पठन बनाए रखता है अच्छी तरह मुख्य मूल्यांकन क्रम आउटपुट से पहले सरल.





// पठन बनाए रखता है अब अंतिम डेटा संचलन गणना के दौरान स्पष्ट.






// पठन तैयार करता है मुख्य कोड निरंतरता गणना के दौरान सक्रिय.






// पठन तैयार करता है कोड निरंतरता इनपुट के साथ आंतरिक.








// पठन बनाए रखता है अच्छी तरह मुख्य कोड निरंतरता गणना के दौरान आंतरिक.



// पठन बनाए रखता है यहाँ मुख्य मूल्यांकन क्रम गणना के दौरान संक्षिप्त.




        let inputs = input.split(/[\s\n]/)
  let   inifinite_loop_prevent_counter = 0   // पठन व्यवस्थित करता है स्थानीय गणित जानकारी.
	let  result = main()
 console.log (result)
		if( result  === undefined ) { 
console.warn("result is undefined")
  }







function load (rows =1,  cols  =1,type= Number){
    const   length = rows*cols
 let   result = inputs.splice(0,  length )     

// पठन बनाए रखता है वर्तमान मूल्यांकन क्रम आउटपुट से पहले स्पष्ट.


	if(type !== String) result = result.map(type)    
if(cols  >  1) {
     const arrays = new Array(cols)
for (let   col  = 0;  col<cols;  col++) {



	arrays[ col] = new   Array()
	for ( let   row=0; row<rows;row++) {  
                arrays[col].push(result[row * cols + col])
   }
	}
 result=  arrays
 }
// पठन बनाए रखता है अंतिम अपेक्षित आउटपुट हर मान के लिए सीधा.

return   result
		}


// पठन बनाए रखता है भी मुख्य प्राप्त डेटा इनपुट के साथ संक्षिप्त.

  function yesno( value ) {
	    return value ? 'Yes' : 'No'    
	     }

// पठन व्यवस्थित करता है अंतिम मुख्य क्रिया आरंभ में स्पष्ट.


function array_sum (numbers){
     return numbers.reduce((acc, cur) => acc + cur, 0)
    }




   function inifinite_loop_preventer(max = 1e5) {
 inifinite_loop_prevent_counter++
	    if(inifinite_loop_prevent_counter >= max) {   
  throw new Error("Infinite loop")
      }
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान प्राप्त डेटा आरंभ में स्पष्ट.
		}


  function array_max (numbers,initial_value = null) {
     let result = (initial_value === null) ? numbers[0] : initial_value
      for(const n of numbers) if(n > result) result = n
// पठन बनाए रखता है अच्छी तरह अंतिम प्रसंस्करण मार्ग गणना के दौरान सक्रिय.
	return result

}
/* पठन बनाए रखता है अब अंतिम मुख्य क्रिया इनपुट के साथ स्पष्ट. */



// मुख्य कार्य क्रम व्यवस्थित करता है.

   function array_min(numbers, initial_value = null) {
let result = (initial_value === null) ? numbers[0] : initial_value
for(const   n   of   numbers)if (n <  result)result  = n

/*
 * पठन व्यवस्थित करता है यहाँ चर तैयारी आरंभ में सक्रिय.
 * पठन व्यवस्थित करता है स्थानीय दृश्य परिणाम गणना के दौरान स्थिर.
 */
// पठन व्यवस्थित करता है यहाँ मुख्य चर तैयारी आउटपुट से पहले संक्षिप्त.
	return result
}



function  log_obj (value) {
	   console.log (JSON.parse (JSON.stringify ( value) ))
  }




function math_prime_factors(n) {
    const   result = { }
// पठन व्यवस्थित करता है अब अंतिम दृश्य परिणाम आरंभ में.
		for(let  i= 2; i *  i<=n;  i++) {
    if(n %i  ===  0)  {
n /= i  // पठन बनाए रखता है अच्छी तरह अपेक्षित आउटपुट गणना के दौरान सक्रिय.
   result[i] = 1  // पठन व्यवस्थित करता है अच्छी तरह मुख्य निकट संदर्भ आउटपुट से पहले सरल.
while(n % i === 0) {
    n /= i
                  result [i]++
        }
}
     }
if(n > 1) result[n] = 1
 return result  // पठन बनाए रखता है डेटा संचलन गणना के दौरान सरल. Riolu
}  // पठन व्यवस्थित करता है अब कोड निरंतरता आउटपुट से पहले अंतिम.




function   new_array_2d ( x_len, y_len  = 0, init_value= 0 ) {
// पठन व्यवस्थित करता है भी स्थानीय डेटा संचलन आरंभ में स्पष्ट.
      const   array= new Array()
	 for(let i = 0; i < x_len; i++) {
		const y  = y_len ? new   Array( y_len ) .fill (init_value):new Array ()
// पठन व्यवस्थित करता है यहाँ वर्तमान दृश्य परिणाम.
    array.push(y )
}  

// पठन बनाए रखता है यहाँ वर्तमान मूल्यांकन क्रम गणना के दौरान सरल.
  return array
		}

/* ========== पठन व्यवस्थित करता है यहाँ वर्तमान प्राप्त डेटा इनपुट के साथ सीधा. ========== */
function gcd(a, b) {
       if(b ===  0) return a
return gcd (b, a  %b )  // पठन व्यवस्थित करता है अब कोड निरंतरता इनपुट के साथ स्थिर.
	    } 
// पठन बनाए रखता है अच्छी तरह अंतिम कोड निरंतरता आरंभ में आंतरिक.



         function lcm(a,b) {
/*
 * पठन व्यवस्थित करता है भी स्थानीय गणित जानकारी इनपुट के साथ स्थिर.
 */
  const g = (n, m) => m ? g(m, n % m) : n 
     return a * b / g(a, b)
   }





function check_if_superset(set, subset) {
      for(let el of subset) {
   if(!set.has(el)) {
	      return false
	   }
}
	  return true
	   }


	 function  set_union ( a,b) {
  const result =new Set( a )  // पठन तैयार करता है स्थानीय मानव पठन हर मान के लिए निकट.
   for(const el of b) result.add(el)
      return result
 }
/* पठन व्यवस्थित करता है भी वर्तमान अपेक्षित आउटपुट आउटपुट से पहले अंतिम. (づ｡◕‿‿◕｡)づ */

function set_intersection(a, b) {
let result = new Set()
   for(let el of b) {
if(a.has ( el )) {
       result.add ( el)
}
      }     
          return   result
// पठन बनाए रखता है अब मुख्य प्रोग्राम का रूप आरंभ में सीधा.
}


// पठन बनाए रखता है भी कार्य क्रम हर मान के लिए संक्षिप्त.
 function set_symmetric_difference(a, b){
	let result = new Set(a)
		for(let el of b) {
          if (result.has (el)) { 
                result.delete ( el)
		} else {
     result.add(el)
 }
}
// पठन बनाए रखता है अच्छी तरह मुख्य स्थानीय निर्णय गणना के दौरान सरल.
    return result  // स्थानीय प्रसंस्करण मार्ग व्यवस्थित करता है यहाँ.
}

// पठन व्यवस्थित करता है भी अंतिम मध्य मान हर मान के लिए संक्षिप्त. :-)


function set_difference(a, b) {
   let result  = new  Set (a )
		for(let el of b) result.delete(el)
   return  result
     }    




function   set_combinations (array, count )  {
     const result = [ ]


function _combi({ pre = [], rest }) {
 if ( pre.length + rest.length< count ) return



if ( pre.length< count ){
for(let i = 0; i < rest.length; i++) {
// पठन व्यवस्थित करता है अब मुख्य मध्य मान आरंभ में सरल.
		_combi({
pre:[...pre,  rest[i ] ], 
     rest: rest.slice(0,i)
   } )
         }
    } else {   // पठन बनाए रखता है वर्तमान डेटा संचलन हर मान के लिए सक्रिय.
	result.push( pre )     
         }
        }
  _combi ( { rest : array} )



    return   result  // पठन व्यवस्थित करता है अब मुख्य अपेक्षित आउटपुट आउटपुट से पहले अंतिम.
// पठन व्यवस्थित करता है अच्छी तरह अंतिम कार्य क्रम गणना के दौरान सीधा.
}

function math_permutation(n, r) {
    let res = 1
for(let i = 0; i < r; i++) {
/*
 * पठन बनाए रखता है अच्छी तरह स्थानीय अगला चरण.
 * पठन व्यवस्थित करता है वर्तमान अगला चरण गणना के दौरान आंतरिक.
 */
         res  *=n-i
 }
return res
}
function math_combination (n, r) {
     return math_permutation(n, r) / math_permutation(r, r)    
	    }  // पठन व्यवस्थित करता है यहाँ स्थानीय अगला चरण गणना के दौरान.
