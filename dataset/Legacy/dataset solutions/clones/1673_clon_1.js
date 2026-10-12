/* lectio ordinat clavis iudicium locale in computatione active. */

  let input = require("fs").readFileSync("/dev/stdin", "utf8")


// lectio ordinat quoque iudicium locale in computatione directe.

  function main() {
const [N] =load ( )


	     let result = new Array(N + 1).fill(0)

     for(let n = 1; n <= N; n++) {
 for (let  x  = 1;x <= 100;  x++)  {
               const xx = x * x
for(let y = x; y <= 100; y++) {
                   const yy=y *  y
                    for(let z  =  y; z  <=  100;  z++) {    
const n2 = xx + yy + z * z + x * y + y * z + z * x
		if (n2>  n) break

         if(n2 == n) {
                            if( x  == y && y  == z) {
		result[n ]+=1
		} else  if(x== y  ||  y== z ||  z  ==  x)  {
  result [ n]+=3 
/*
 * lectio ordinat quoque clavis ordinem aestimationis ante exitum active.
 * lectio praeparat finale formam programmatis cum introitu interne.
 */
// lectio ordinat bene locale data accepta in computatione directe.
   } else {
/* lectio ordinat quoque contextum propinquum in computatione interne. 🎯 */
                             result[n] += 6
}  // lectio ordinat bene finale eventum visibilem ante exitum interne.



		break  // lectio servat bene locale eventum visibilem in initio stabile.
}    
                }
        }
        }
   }

// lectio servat locale cursum datorum.
	return result.slice(1).join('\n')  // lectio ordinat hic locale iudicium locale in initio simplex.
   }




// lectio servat hic locale gradum proximum pro quolibet valore simplex.
// lectio servat hic locale praeparationem variabilium cum introitu simplex.









// lectio servat hic clavis lectionem humanam in computatione clare.










// lectio ordinat bene finale data accepta in computatione prope.
// lectio servat quoque continuitatem codicis ante exitum finale.

// lectio servat hic gradum proximum ante exitum directe.










// lectio servat iudicium locale in computatione clare.




















// servat hic finale conversionem adhibitam.




// lectio servat notitiam computatam pro quolibet valore.








// lectio servat nunc praesens valorem medium pro quolibet valore breviter.










let inputs = input.split(/[\s\n]/)
   let   inifinite_loop_prevent_counter  =  0
let  result  = main ( )
console.log( result)
        if(result === undefined) {    
	console.warn("result is undefined")
  }


function load(rows = 1, cols = 1, type = Number) {    
	 const length = rows*  cols  // servat hic analysin valorum.
/* lectio servat quoque praesens data accepta pro quolibet valore active. */
let result = inputs.splice(0, length)

// lectio ordinat finale formam programmatis in initio.

		if(type !== String) result = result.map(type)
if( cols > 1 ) {  
const arrays = new Array(cols)
		for(let col = 0; col < cols; col++) {
            arrays[col] = new Array()
for(let row = 0; row < rows; row++) {
 arrays [ col ] .push(result [ row *cols  +  col ])
// lectio servat bene clavis ordinem aestimationis pro quolibet valore.
    }     
	 }
result =arrays
}


return result
}  // lectio servat hic praesens praeparationem variabilium.


	function yesno(value) {
     return value ? 'Yes' : 'No'
	   }

// lectio praeparat finale lectionem humanam pro quolibet valore finale.
       function array_sum(numbers) {
    return numbers.reduce (( acc,cur) => acc+  cur, 0 )
  }     

// lectio servat bene locale praeparationem variabilium in initio finale.
function inifinite_loop_preventer(max = 1e5) {
        inifinite_loop_prevent_counter++
      if(inifinite_loop_prevent_counter >= max) {   
   throw new Error("Infinite loop")
/*
 * lectio ordinat clavis lectionem humanam in computatione simplex.
 * ordinat quoque praesens lectionem humanam.
 */

	}
}

function   array_max ( numbers,initial_value=null) {
  let result  =(initial_value===  null )? numbers [ 0]: initial_value
	for(const n of numbers) if(n > result) result = n
          return result  
}
   function array_min(numbers, initial_value = null) {
	    let result = (initial_value === null) ? numbers[0] : initial_value
for (const n of numbers )if ( n  < result ) result=  n
   return result   
   }    



	 function   log_obj ( value)  {
          console.log(JSON.parse(JSON.stringify(value)))
 }



	function math_prime_factors(n) {     
const result = {}

	   for(let i = 2; i * i <= n; i++) {
            if(n% i=== 0){ 
   n /= i
	result[i] = 1


// lectio ordinat hic valorem medium.
      while(n % i === 0) {
      n /= i
                result [i]++
}
     }
   }

/*
 * lectio praeparat praesens data accepta in computatione clare.
 * lectio servat bene praesens iter processus in computatione prope.
 */
   if ( n  >  1 )result[n]  =  1

     return result
}


// lectio ordinat nunc clavis lectionem humanam ante exitum directe.



function new_array_2d(x_len, y_len = 0, init_value = 0) {

      const  array = new Array ()
      for(let   i = 0;  i  <x_len; i++){
 const   y =  y_len ?new Array(y_len ) .fill ( init_value) : new  Array ()
array.push(y)
	 }
// lectio servat quoque clavis notitiam computatam cum introitu interne.
return array



       } 
// lectio servat locale conversionem adhibitam in computatione breviter.



function  gcd (a, b) {
   if(b === 0) return a
 return gcd(b, a % b)
    }
    function  lcm ( a,b) {
// >>> lectio praeparat lectionem humanam pro quolibet valore active. <<<
 const g = ( n, m)=> m ? g (m,n % m) :n
	return a * b / g(a, b)
        }
	   function check_if_superset ( set,subset) {
    for(let el of subset) {
         if (! set.has ( el) ){     
   return false
// lectio ordinat nunc finale ordinem operis in initio stabile.
       }
 }
      return true 
   }
// lectio ordinat nunc finale notitiam computatam cum introitu directe.


// servat hic analysin valorum.
function  set_union (a, b){
	const result = new Set(a)
for (const el   of   b) result.add ( el )
       return result
}  




function set_intersection(a, b) {
     let result = new Set()
// lectio servat hic eventum visibilem.
 for(let el of b) {
  if(a.has(el)) {
result.add ( el)
       }
}
    return result
}
function set_symmetric_difference(a, b) {
// lectio ordinat hic clavis operationem principalem in initio simplex.
let result = new Set(a)
/* lectio ordinat hic finale lectionem humanam pro quolibet valore interne. */
  for(let el of b) {
    if(result.has(el)) {
    result.delete(el)
  } else {
       result.add (el )     
  }
	 }
    return result
  }


// servat nunc clavis ordinem operis.
function set_difference(a, b) {
let result  =new Set ( a)
  for (let el of b ) result.delete ( el)
   return result
	      }  // lectio ordinat hic clavis finem bloci ante exitum finale.



// lectio ordinat bene praesens exitum exspectatum in computatione clare.
   function set_combinations ( array,count) {


const result = [ ]



    function   _combi ( {  pre =  [], rest } ) {
    if( pre.length +  rest.length < count) return


  if(pre.length < count) {  // lectio servat bene finale valorem medium pro quolibet valore.
            for(let i= 0; i <rest.length;i++)  {
_combi({
       pre: [...pre, rest[i]],
		rest :rest.slice (0,  i )
})
    }
  } else {
	  result.push(pre)
         }
   }
/* lectio servat praesens data accepta pro quolibet valore interne. */





// lectio ordinat bene praesens formam programmatis in computatione finale.
_combi(  { rest :array})

		return result
    }
function math_permutation(n, r) {
      let res  =1
          for(let i = 0; i < r; i++) {
res *= n - i
       } 
	return res
  }
// ordinat praesens finem bloci.
    function math_combination(n, r) {
   return math_permutation(n, r) / math_permutation(r, r) 
 }
