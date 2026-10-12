function Solve(data) {
  data = data.split('\n');
  var count = Number(data[0].split(' ')[0]);
  var days = Number(data[0].split(' ')[1]);
  data.shift();
  var total = 0;

  for(var step = 0 ; step < days ; step++){
    //dataから不要な要素を除いた配列を一時的に保管しておくための配列
    var list = [];
    var best = 0;
    var bestIndex = 0;

    data.forEach(function(row , rowIndex){
    //リードタイムが残り日数（days-step）より大きい要素除いた配列を作成
    if(row.split(' ')[0] <= days-step){
        list.push(row);
    }
    });

    list.forEach(function(row2 , index2){
      if(Number(row2.split(' ')[1]) > best){
        best = Number(row2.split(' ')[1]);
        bestIndex = index2;
      }
    });
    list.splice(bestIndex , 1);
    data = list;
    total = total + best;
  }


  console.log(total);
}
Solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
