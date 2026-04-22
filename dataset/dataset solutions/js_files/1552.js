var stdin = require("fs").readFileSync("/dev/stdin", "utf8");

//console.log(stdin)
var a =  stdin.split("\n")
var s = a[0]
var t = a[1]

var s_length=s.length
var t_length=t.length
var diff=s_length-t_length

var array =[]

//console.log(diff)

for (let i = 0, scope_length=t.length ; i <= diff; i++, scope_length++){
var slice=s.slice(i, scope_length)
//var slice=s.slice(0,1)
//console.log(slice)
//console.log(t_length)
if(slice===t){
 console.log(0)
 return 
}
else{
  var sum = 0
 for (let c = 0, k = 1; c <=t_length; k++, c++){
   var slice2=slice.slice(c,k)
   var slice3= t.slice(c,k)
   //console.log(slice2);
  // console.log(slice3);
   if(slice2!==slice3){
     sum ++;
     //console.log(sum);
   }

 }
array.push(sum)
}
console.log(array.reduce((a,b)=>Math.min(a,b)))

}
