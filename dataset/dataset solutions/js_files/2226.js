function Main(input) {
    input = input.split("\n");
    var n = parseInt(input[0], 10);
    var num = input[1].split(' ');
    var numA = new Array(n);
    var str = '';
    var numA2 = new Array();
    var numB = new Array(n);
    var ansA = new Array(n);
    var anser = new Array(n);
    for(var i=0; i<n; i++){
      num[i] = parseInt(num[i], 10);
      numA[i] = new Array(1000001);
      ansA[i] = new Array(1000001);
      for(var j=2; j<1000001; j++){
        ansA[i][j] = 0;
        numA[i][j] = 0;
      }
      for(var j=2; j<1000001; j++){
        numA[i][j] = 0;
        ansA[i][j] = 0;
        for(var k=0; k>=0; k){
          if(num[i]%j == 0){
            numA[i][j]++;
            num[i]/=j;
            if(str.indexOf(j) == -1){
	        	str += j+',';
            }
          }else{
            break;
          }
        }
        if(num[i] == 1){
          numB[i] = j;
          break;
        }
      }
    }
    str = str.slice(0,-1);
    var numA2 = str.split(',');
    var le = numA2.length;
    for(var i=0; i<le; i++){
      numA2[i] = parseInt(numA2[i], 10);
    }
    for(var i=0; i<n; i++){
      for(var j=0; j<le; j++){
        for(var k=0; k<n; k++){
          if(i != k){
            if(numA[k][numA2[j]]-numA[i][numA2[j]]-ansA[i][numA2[j]] > 0){
              ansA[i][numA2[j]] += numA[k][numA2[j]]-numA[i][numA2[j]]-ansA[i][numA2[j]];
            }
          }
        }
      }
    }
    var anserN = 0;
    for(var i=0; i<n; i++){
      anser[i] = 1;
      for(var j=0; j<le; j++){
        if(ansA[i][numA2[j]] > 0){
          anser[i] *= Math.pow(numA2[j], ansA[i][numA2[j]]);
        }
      }
      anserN += anser[i];
    }
    console.log(anserN%(Math.pow(10, 9)+7));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));