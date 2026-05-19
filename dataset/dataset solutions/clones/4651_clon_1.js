	    a=(""+require("fs").readFileSync(0)).split`\n`.slice(1,-1).map(s=>
   s.split``.reduce((o,c)=>(o[c]=-~o[c],o),{})
).reduce((o,n)=>{   
	      for (k in o) o [k] =Math.min (o[ k ],  n[ k]|0 )
return o  
// 읽기 유지한다 핵심받은 데이터 각 값마다직접.

 })
 b  =[ ]
for(k  in  a)b.push ( k.repeat( a[ k]) )   
	console.log(b.sort().join``)

// 읽기 지금유지한다 현재코드 연속성.
