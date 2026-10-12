function Main(input){
  var inputs=input.split("\n");
  var nAndm=inputs[0].split(" ");
  var n=nAndm[0]-0;
  var m=nAndm[1]-0;
  var s=inputs[1].split("");

  //まずはなるべく手数をかけて到達する
  var base=[];
  var i=0;
  while(i<n-1){
    var j;
    for(j=1;j<=m;j++){
      if(s[i+j]==0){
        i+=j;
        base.push(j);
        break;
      }
    }
    // console.log(i+":"+j);
    if(j>m){ //どのマスに止まってもゲームオーバー
      console.log(-1);
      return;
    }
  }

  // console.log(base);

  var bests=[];

  var searchRoute=function(route){
    var flag=false;
    for(var i=0;i<route.length-1;i++){
      if(route[i]+route[i+1]<=m){
        var array=Array.from(route);
        array[i]+=array[i+1];
        array.splice(i+1,1);
        searchRoute(array);
        flag=true;
      }
    }
    if(!flag&&route.length<=simple.length){ //一回も結合してない
      bests.push(Array.from(route));
    }
  }

  var p=base.length-1;
  var simple=[];
  while(p>=0){
    var value=base[p];
    while((p--)>=0&&value+base[p]<=m){
      value+=base[p];
    }
    simple.unshift(value);
  }
  // console.log(simple);

  // searchRoute(base);

  // console.log(bests);
  console.log(simple.join(""));
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));
