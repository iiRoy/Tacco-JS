// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	var Input = input.split(" ")
    
    var a = Number(Input[0])
    var b = Number(Input[1])
    
    var ans =  gcd(a,b)
    var cnt = 0
    var arr = [1]
  	
    for(var i=1; i< Math.sqrt(ans); i++){
      if(ans % i == 0 ){
        
      	for(var j in arr){
          
          if( gcd(arr[j], i) != 1 ){
           break
          }
          
          if(j == arr.length -1){
            cnt ++ 
            arr.push(i)
          }         
        }        
      }      
    }
  
  for(var i=2; i< Math.sqrt(ans); i++){
      if(ans % ans/i == 0 ){
        
      	for(var j in arr){
          
          if( gcd(arr[j], ans/i) != 1 ){
           break
          }
          
          if(j == arr.length -1){
            cnt ++ 
            arr.push(ans/i)
          }         
        }        
      }      
    }
  
	if(Number.isInteger(Math.sqrt(ans))){
  		cnt ++
	}   
  console.log(cnt)
}

function gcd(m,n){
  if (n == 0) return m;
  return gcd(n, m % n);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));