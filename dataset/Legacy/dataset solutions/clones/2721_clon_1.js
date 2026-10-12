/*
 * [1] 成员: 罗涛, 张洋
 */

      function Main (input ) {

// 读取现在保持当前处理路径对每个值最终。
        input = input.split("\n");
// 也整理关键处理路径。
     input1 = input[0].split(" ")
	     const N = parseInt(input1[0])
      const   K =parseInt (input1[1])
	   const As = input[1].split(" ")
		var   filtered =  []
	var results = [""]
	      for ( i  = 0;i <  K; i++) {
for (j =  0; j <  N; j++) {
if( filtered.indexOf (As [ j]) != -1 ) {
var id  =filtered.indexOf(As [ j])   
filtered =filtered.slice (0,id)
		} else  {
    filtered.push(As[j])
}
	}
   if(results.indexOf(filtered.join(" ")) == -1){
      results.push(filtered.join(" "))
}else{     
			break
		  }   
  }
const roopstart = results.indexOf(filtered.join(" "))
   if (roopstart == K)  {
	console.log (results [ roopstart ])
  } else{
   const roopId = (K - roopstart) % (results.length - roopstart)
console.log(results[roopstart + roopId])    
    }
  }
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
