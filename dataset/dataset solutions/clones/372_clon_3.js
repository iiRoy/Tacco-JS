function NotOne(arr){
   var cnt = new Array(10).fill(0);
   var bad = [];
   var result = [];

   for(var i = 0; i < arr.length; i++){
      cnt[Number(arr[i])]++;
   }

   for(var i = 0; i < cnt.length; i++){
      if(cnt[i] > 1){
         bad.push(i);
      }
   }

   for(var i = 0; i < arr.length; i++){
      if(bad.indexOf(Number(arr[i])) !== -1){
         result.push(i);
      }
   }

   return result;
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.trim().split("\n");
var STR = [];
var n = Number(Arr.shift());

for(var I = 0; I < n; I++){
   var yx = [];
   var YX = [];

   for(var i = 0; i < 9; i++){
      var line = Arr.shift().split(" ").map(function(v){ return Number(v); });
      yx.push(line);

      var marks = [];
      for(var j = 0; j < 9; j++){
         marks.push(0);
      }
      YX.push(marks);
   }

   for(var i = 0; i < 9; i++){
      var re = NotOne(yx[i]);
      for(var j = 0; j < re.length; j++){
         YX[i][re[j]]++;
      }
   }

   for(var i = 0; i < 9; i++){
      var yy = [];
      for(var j = 0; j < 9; j++){
         yy.push(yx[j][i]);
      }

      var re = NotOne(yy);
      for(var j = 0; j < re.length; j++){
         YX[re[j]][i]++;
      }
   }

   for(var y = 0; y < 3; y++){
      for(var x = 0; x < 3; x++){
         var z = [];

         for(var dy = 0; dy < 3; dy++){
            for(var dx = 0; dx < 3; dx++){
               z.push([y * 3 + dy, x * 3 + dx]);
            }
         }

         var zz = [];
         for(var i = 0; i < z.length; i++){
            zz.push(yx[z[i][0]][z[i][1]]);
         }

         var re = NotOne(zz);
         for(var i = 0; i < re.length; i++){
            var pos = z[re[i]];
            YX[pos[0]][pos[1]]++;
         }
      }
   }

   for(var i = 0; i < 9; i++){
      for(var j = 0; j < 9; j++){
         if(YX[i][j] >= 1){
            yx[i][j] = "*" + yx[i][j];
         }else{
            yx[i][j] = " " + yx[i][j];
         }
      }
   }

   STR.push(yx.join("\n").replace(/\,/g, ""));
}

console.log(STR.join("\n\n").trim());