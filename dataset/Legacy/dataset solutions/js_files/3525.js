let lines = [];
let reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', function(line){
  lines.push(line.split(" "));
})

reader.on('close', function(){
//  console.log(lines)
  if(happensWars(lines)) console.log("War");
  else console.log("No War");
})

//1行目に[N,M,X,Y]
//（
//Nは最低いくつ支配下に置くか、
//Mが最大いくつ支配下に置くか、
//XがA帝国の現在の座標
//YがB帝国の現在の座標
//）
//2行目にA帝国が支配下に置きたい座標の配列
//3行目にB帝国が支配下に置きたい座標の配列
function happensWars(coordinates){
  // A帝国の希望する最大の座標
  let maxOfA = -100;
  // B帝国の希望する最小の座標
  let minOfB = 100;

  const coordinateA = Number(coordinates[0][2]);
  const coordinateB = Number(coordinates[0][3]);

  coordinates[1].map((num) => {
    const coordinateX = Number(num);
    if(maxOfA < coordinateX) {
      maxOfA = coordinateX;
    }
  })

  coordinates[2].map((num) => {
    const coordinateY = Number(num);
    if(minOfB > coordinateY) {
      minOfB = coordinateY;
    }
  })

//  console.log(`Aの座標は${coordinateA},希望地の最大座標は${maxOfA}`);
//  console.log(`Bの座標は${coordinateB},希望地の最小座標は${minOfB}`);
  // Aの希望地座標がBの座標もしくは希望地座標より大きければ戦争勃発
  if (maxOfA >= coordinateB || maxOfA >= minOfB) return true;
  // Bの希望地座標がAの座標もしくは希望地座標より小さければ戦争勃発
  if (minOfB <= coordinateA || minOfB <= maxOfA) return true;
  return false;
}
