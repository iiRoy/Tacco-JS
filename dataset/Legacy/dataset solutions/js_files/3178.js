function main(input) {
  var inputs = input.split("\n");
  var A = Number(inputs[0].split(" ")[0]);
  var B = Number(inputs[0].split(" ")[1]);
  var Q = Number(inputs[0].split(" ")[2]);

  var list = [];
  var idx = 1;
  for(var i=0;i<A;i++,idx++) list.push({type:1, place:Number(inputs[idx]), dis: Number.MAX_VALUE});
  for(var i=0;i<B;i++,idx++) list.push({type:2, place:Number(inputs[idx]), dis: Number.MAX_VALUE});

  var tmp_a, tmp_b;
  list.sort((a,b)=>a.place-b.place);
  list.forEach(v=>{
    if(v.type == 1){
      if(tmp_b){
        tmp_b.dis = Math.min(tmp_b.dis, v.place - tmp_b.place);
        v.dis = v.place - tmp_b.place;
      }
      tmp_a = v;
    }else{
      if(tmp_a){
        tmp_a.dis = Math.min(tmp_a.dis, v.place - tmp_a.place);
        v.dis = v.place - tmp_a.place;
      }
      tmp_b = v;
    }
  });


  for(var i=0;i<Q;i++,idx++){
    var pl = Number(inputs[idx]);
    var trg = bsearch(list, pl);
    var ans = 0;
    if(trg < 0) ans = Math.abs(list[0].place-pl)+list[0].dis;
    else if(trg>=list.length-1) ans = Math.abs(list[list.length-1].place-pl)+list[list.length-1].dis;
    else{
      ans = Math.min(
        Math.abs(list[trg].place-pl)+list[trg].dis,
        Math.abs(list[trg+1].place-pl)+list[trg+1].dis
      );
    }
    console.log(ans);
  }
  return list;
}
function bsearch(list, place){
  var a=0,b=list.length;
  var ave = ~~((a+b)/2);
  while(a<b){
    if(list[ave].place > place){
      b=ave-1;
    }else{
      a=ave+1;
    }
    ave = ~~((a+b)/2);
  }
  if(list[ave] && list[ave].place > place) return ave-1;
  else return ave;
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
