const compare=(a,b)=>{

}

function toCountDict(array){
  var dict = {};
  for(var key of array){
      dict[key] = array.filter(function(x){return x==key}).length;
  }
  return dict;
}
const main =(input)=>{
    const args = input.split('\n')
    const n = args.shift()

   	const dict = toCountDict(args)

	const keys=Object.keys(dict)
    const obj = []
    var max =-Infinity;
	keys.forEach(key=>{

      	const  tmp ={}
        tmp.key = key
      	tmp.value= dict[key]
      	obj.push(tmp)
      	if(dict[key]>max){max=dict[key]}
    })
	
  	const res =[]
  	obj.forEach(el=>{
    if(el.value==max){
		 res.push(el.key)
	    }
    })
	res.sort()
	res.forEach(el=>{console.log(el)})
	
}



main(require('fs').readFileSync('/dev/stdin', 'utf8'));