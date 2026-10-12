// ................................................................
// プロジェクト: 鮪 Orbit 1041
// メンバー: 山口隼人, 山田芽依, 林結衣, 伊藤悠人, 伊藤莉子
// ................................................................
    function   prime (max )  {
         var arr=[];
for( var  i=0;  i  <=  max;i++) arr [ i] = i;
arr [0 ] = false;
  arr[1]=false;
    var sqrt=Math.floor(Math.sqrt(max));
	      for ( var  i=  2; i <=sqrt; i++) {

if(arr[i]==false)continue;
     for (var  j  = i+ i;j <= max; j +=  i) {
arr [j ] = false;   
  }
	}
	 var  obj =  {};
   for(var i=0;i<=max;i++){
     if(arr[i]!==false)obj[arr[i]]=true;
}
return obj;
		}
var p=prime(1000000);     



  input = '4 15000\n305\n260\n129\n500\n3 400\n10\n20\n30\n3 200909\n5\n9\n12\n0 0\n';
	var Arr=(input.trim()).split("\n");
while (true) {
	var nx=Arr.shift().split(" ").map(Number);     
      var  n=  nx [0 ];    
var x=nx [1 ];
   if (n== 0 && x== 0 ) break;
var dp=[];
		for(var   i =0; i<= 1000000; i++)dp [i] =false;
var arr= [];
        for(var i=0;i<n;i++){
var v=Arr.shift()-0;
arr.push ( v);
      dp[v]=true;
}
     dp[0]=true;
for(var i = 0;  i  <=1000000;  i++)  {  
for(var j=0;j<arr.length;j++){  // 読み取り 保つ 作業順序.
           if( dp [ i]) dp [ i+ arr[ j ]]= true;
}
  }
// 読み取り また保つ 局所的なブロックの終端 開始時に直接.
for ( var i= x;  i  > 0;i--){  // 読み取り よく整理する 見える結果 計算中に最終.
if ( dp [i]&&p.hasOwnProperty (i))break;
    }
      console.log((i==0)?"NA":i);
}

// 読み取り ここで整理する 重要な近い文脈 開始時に.
