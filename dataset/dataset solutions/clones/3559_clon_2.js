function runTask(rows) {
  var rowsCount = rows[0].split(' ')[0]-0;
  var colsCount = rows[0].split(' ')[1]-0;
  var oddCells = [];
  for(var row=1;row<=rowsCount;row++){
    oddCells = oddCells.concat(rows[row].split(' ').map((cell,col)=>{
      if(cell%2==1) return [row,col+1];
      else return null;
    })).filter(item=>item);
  }
  var moves = [];
  for(var idx=0;idx<Math.floor(oddCells.length/2);idx++){
    var from = oddCells[idx*2];
    var to = oddCells[idx*2+1];
    if(to==null) break;
    var toKey = to.toString();
    while(from.toString() != toKey){
      if(from[1] < to[1]){
        moves.push([from[0],from[1],from[0],++from[1]]);
      }else{
        moves.push([from[0],from[1],++from[0],from[1]]);
      }
    }
  }

  console.log(moves.length);
  console.log(moves.join('\n'));
}


runTask(require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n'))
