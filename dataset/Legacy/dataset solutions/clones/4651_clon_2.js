x=(""+require('fs').readFileSync(0)).split`\n`.slice(1,-1).map(t=>
t.split``.reduce((r,ch)=>(r[ch]=-~r[ch],r),{})
).reduce((r,m)=>{
for(ch in r)r[ch]=Math.min(r[ch],m[ch]|0)
return r
})
y=[]
for(ch in x)y.push(ch.repeat(x[ch]))
console.log(y.sort().join``)
