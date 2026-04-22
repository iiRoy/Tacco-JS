// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();

// ここから
function main(){
  var readLines = 0;
  while(true){
    var fieldInfo = input[readLines].split(' ');
    var width = fieldInfo[0] - 0;//toInt
    var height = fieldInfo[1] - 0;//toInt
    
    // 0 0が入力された
    if(!width && !height){
      break;
    }
    
    // 変数宣言纏めたら早い？
    var start;
    var goal;
    var elem = [[],[],[],[],[]]; // 場にいるパチモン[属性][属性内連番]
    var c;
    var rowData;
    var elemCache;
    var y;
    var x;
    
    for(y = height; y--;){// reverse loop
      readLines++;//1行進める
      rowData = input[readLines];
      for(x = width; x--;){// reverse loop
        c = rowData[x];
        
        if(c == '.'){
          // ドットが一番多いはずなので、先にひっかけてしまう
        }else if(c == '1' || c == '2' || c == '3' || c == '4' || c == '5'){
          // 次に多いはずの属性を潰す
          elemCache = elem[c - 1];
          elemCache[elemCache.length][0] = pos(x, y);
        }else if(c == 'S'){
          start = pos(x, y);
        }else{
          goal = pos(x, y);
        }
        
      }
    }
    
    // ブロックスコープが無いから変数宣言をまとめる
    var INF = 1 << 30;
    var bestElement = -1;
    var currentDisance;
    var nearestDistance = INF;
    var dp; // 距離[属性][同じ属性内の連番]
    var i; // loop index
    var j;
    var e;
    var len;
    var dpCacheNow; // cache of dp[i] for loop
    var dpCacheNowi; // cache of dp[now][i]
    var dpCacheNext; // cache of dp[i + 1] for loop
    var elemCacheNow;
    var elemCacheNowi; // cache of elem[now][i]
    var elemCacheNext;
    var now;
    var nowLength;
    var next;
    var nextLength;
    
    // 最初に選ぶ属性ごとにループ
    for (var selectElem = 0; selectElem < 5; selectElem++) {
      dp = [[],[],[],[],[]]; // 距離[属性][同じ属性内の連番]
      
      for(i = 5; i--;){// reverse loop
        len  = elem[i].length;
        dpCache = dp[i];
        dpCache.length = len;
        while(len--){// reverse loop
          dpCache[len] = INF;
        }
      }
      
      now = (selectElem + 1) % 5;
      nowLength = elem[now].length;
      dpCacheNow = dp[now];
      elemCacheNow= elem[now];
      
      for (i = 0; i < nowLength; i++) {
        // s→e1を計算
        dpCacheNow[i] = dist(start, elemCacheNow[i]);
      }
      
      // s->1->2->3->4->g
      // なので、ループは間の-> * 3分まわす
      for (e = 0; e < 3; e++) {
        // e(x)->e(x+1)
        next = (now + 1) % 5;
        dpCacheNext = dp[next];
        elemCacheNext = elem[next];
        nextLength = elemCacheNext.length;
        for (i = 0; i < nowLength; i++) {
          dpCacheNowi = dpCacheNow[i];
          elemCacheNowi = elemCacheNow[i];
          
          if(dpCacheNowi >= nearestDistance){
            // 既に決まっている最短距離を超えたら絶対に候補ではない
            continue;
          }
          
          for (j = 0; j < nextLength; j++) {
            dpCacheNext[j] = min(dpCacheNext[j], dpCacheNowi + dist(elemCacheNowi, elemCacheNext[j])); // メモと新しい経路の最短
          }
        }
        
        now = next;
        dpCacheNow = dpCacheNext;
        elemCacheNow = elemCacheNext;
        nowLength = nextLength;
      }
      
      for (i = 0; i < nextLength; i++) {
        // e4->g
        currentDistance = dpCacheNext[i] + dist(elemCacheNext[i], goal);
        
        if (currentDistance < nearestDistance) {
          nearestDistance = currentDistance;
          bestElement = selectElem;
        }
        
      }
      
    }
    
    if (nearestDistance == INF) {
      console.log("NA");
    } else {
      console.log((bestElement + 1) + " " + nearestDistance);
    }
    
    readLines++;
  }
  
}

function dist(from, to){
  // x座標とy座標の切り出し(11ビット右シフトでxを、2047(下位10ビット1)とのAND演算でyを取り出す)
  return abs((from >> 11) - (to >> 11)) + abs((from & 2047) - (to & 2047));
}

function min(a, b){
  // ビット演算で高速化
  return b + ((a - b) & ((a - b) >> 31));// 変数宣言よりもこっちの方が高速
}

function pos(a, b){
  // オブジェクトのインスタンス作るよりもプリミティブの方が早い
  // 2^10 = 1024なので、下位10ビットでy座標を、上位ビットでx座標を表す
  return (a << 11) + b;
}

function abs(a){
  // ビット演算で高速化
  return (a ^ (a >> 31)) - (a >> 31);// これも
}