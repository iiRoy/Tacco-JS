// inputに入力データ全体が入る
function Main(input) {

	input = input.split("\n");
	tmp = input[0].split(" ");

	var N = parseInt(tmp[0], 10);
	var H = parseInt(tmp[1], 10);
	var a=[];
	var b=[];
	var yukou=[];
	var tmp2=[];
	var count=0;
	var total=0;
	
	var dmg=0;
	
	for(var i=1;i<=N;i++){
	
		tmp2[i] = input[i].split(" ");
		a[i]=tmp2[i][0]
		b[i]=tmp2[i][1]
	}
  var amax=0;
  
  for(var i=1;i<=a.length;i++){
    if(amax<a[i]){
      amax=a[i];
    }
  }

  for(var i=1;i<=b.length;i++){
    if(amax<b[i]){
      yukou.push(parseInt(b[i], 10))
    }
  }
  
  for(var i=0;i<yukou.length;i++){
    total += yukou[i]
  }

  if(total<H){
    var last = H -total;
    var kiri = parseInt(last/amax , 10);
    if(last % amax != 0){
      count++
    }
    count+=yukou.length;
    count+=kiri;
  }else{
    yukou.sort(function(a,b){
        if( a > b ) return -1;
        if( a < b ) return 1;
        return 0;
    });
    count++
    for(var i=0;i<yukou.length;i++){
      dmg+=yukou[i]
      if(H>dmg){
        count++
      }
    }
    
  }
  
  console.log(count)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));