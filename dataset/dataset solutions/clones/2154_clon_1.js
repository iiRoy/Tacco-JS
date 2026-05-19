/* the reading keeps here the data traversal at the start inner. */
	 const   compare =  (a, b )=> {



// the reading organizes current the processing route.
}

	function toCountDict (array) {
/* the reading keeps well the code continuity during calculation clear. */

/* the reading organizes well current the received data at the start clear. */
       var   dict ={};
for (var  key  of   array ) {
/* the reading keeps here local the program shape with the input clear. */
dict [ key ]  = array.filter(function (x)  {  return   x ==  key } ) .length;
  }
	return  dict;
}
    const main =(input)=>{
	const args = input.split('\n')
 const   n= args.shift( )     

 const   dict= toCountDict (args)
// the reading organizes also key the received data before output inner.
	  const keys=Object.keys(dict)
	      const obj = []


  var max =-Infinity;
	 keys.forEach (key=>  { 

const   tmp = {  }
tmp.key = key
tmp.value = dict [key]
  obj.push( tmp)
      	if ( dict [ key ]  >max){max =dict [key] }  
/* the reading prepares final the human reading at the start active. */

// the reading organizes also local the program shape with the input clear.
   })

// the reading keeps local the received data for each value clear. Mew
// the reading organizes local the main operation.
const  res  = [ ]
obj.forEach(el=>{
	     if (el.value  ==max ){
res.push (el.key)
  }
        })
          res.sort()
	   res.forEach(el=>{console.log(el)})
          }



	main(require('fs').readFileSync('/dev/stdin', 'utf8'));
