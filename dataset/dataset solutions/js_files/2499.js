"use strict";

//rmEl(array)(x) xを1つ除いたarrayを返す
const rmEl = xs => x => xs.filter( (_, i, arr) => i !== arr.indexOf( x ) ); 

// index が条件を満たすかどうか
function isOK(array, index, key) {
    if (array[index] >= key) return true;
    else return false;
}
// 汎用的な二分探索のテンプレ
function binarySearch(array,key) {
    var ng = -1; //「index = 0」が条件を満たすこともあるので、初期値は -1
    var ok = array.length; // 「index = a.size()-1」が条件を満たさないこともあるので、初期値は a.size()

    /* ok と ng のどちらが大きいかわからないことを考慮 */
    while (Math.abs(ok - ng) > 1) {
        var mid = Math.floor((ok + ng) / 2);

        if (isOK(array, mid, key)) ok = mid;
        else ng = mid;
    }
    return ok;
}


const main = arg => {
  const input = arg.trim().split("\n");
  var N = parseInt(input[0], 10);
  var L = input[1].split(" ");
  for (var i=0;i<N;i++){
    L[i]=parseInt(L[i], 10);
  }
  L.sort(function(a, b) {return a - b;});
  
  var ans=0
  var count=0
  var newlist=[]
  for (var i=0;i<N-1;i++){
  	for (var j=i+1;j<N;j++){
      newlist=rmEl(rmEl(rmEl(rmEl(L)(L[j]))(L[i]))(L[i]+L[j]))(Math.abs(L[i]-L[j]))
      ans=ans+binarySearch(newlist, L[i]+L[j])-binarySearch( newlist, Math.abs(L[i]-L[j]))
      
    } 
  }
  console.log(Math.floor(ans/3))
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

