const main = (input) => {
  input = input.split(/\n/).map(n=>n.split(/\s/).map(v=>+v));
  N = input[0][0];
  cities = input.slice(1,N+1)
  var ans = []
  for (var k=0; k<N; k++){
    var a = []
    a[0] = k;
    for (var key in a){
      newpush(a,search(a[key],cities))
    }

    ans[k] =a.length;
  }
  console.log(ans.join("\n"));

  };
main(require('fs').readFileSync('/dev/stdin', 'utf8'))

function search(a,cities){
  var index = []
  // より大きい街とより小さい街のindexを返す
  for (var i in cities){
    if ((cities[a][0]>cities[i][0] && cities[a][1]>cities[i][1] )||(cities[a][0]<cities[i][0] && cities[a][1]<cities[i][1])){
      index.push(i)
    }
  }
  return index
}


  // いける街の内、新しい町だけ追加する。
function newpush(a,index){
  for (var i of index){
    if (a.indexOf(i)== -1) a.push(i)
  }
  return a
}
