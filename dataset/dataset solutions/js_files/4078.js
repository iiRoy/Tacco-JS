function block(k,i,j) {
  if(0<=i && i<k && 0<=j && j<k){
    return "B";
  }else if(k<=i && i<2*k && k<=j && j<2*k){
    return "B";
  }
  return "W";
}

function Main(input) {
 	var head = input[0].split(" ");
	var N = parseInt(head[0], 10);
	var k = parseInt(head[1], 10);
  
  // var result;
  
   var check=[];
  
   //console.log(check);
  
   for(var i=1;i<=N;i++){
      var tmp = input[i].split(" ");
      var x = parseInt(tmp[0], 10)
      var y = parseInt(tmp[1], 10)
      var c = tmp[2]
           
//	  console.log('ORG %s %s %s',x,y,c);
      var new_x = x%k;
      var new_y = y%k;

// 	  console.log('/3 %s %s',((x-new_x)/3)%2,((y-new_y)/3)%2);


      var pattern = (
        			  ((x-new_x)/k)%2
                     +((y-new_y)/k)%2
                     )%2 == 1 ? "R":"N";

//     console.log('pattern %s',pattern);

     
      var new_c = c;
     
      if(pattern == "R"){
        new_c = new_c == "B" ? "W":"B"
      }
        
 //     console.log('NEW %s %s %s',new_x,new_y,new_c);
      check[i-1]=[]
      check[i-1][0]= ((new_c == "W") ? new_x + k : new_x);
      check[i-1][1]=new_y;
//      check[i-1][2]=new_c;
   }
  
  //  console.log(check);

    var max_match = 0;
  
  　//チェック
    for(var n=0;n<2*k;n++){
      for(var m=0;m<k;m++){

        
	    var b_match = 0;
        
        for(var g=0;g<N;g++){
          var i= check[g][0];
          var j= check[g][1];
          if("B"==block(k,m+i,n+j)){
            b_match++;
          }
        }
//        console.log('match:%s m:%s n:%s',b_match,m,n);
        if (max_match <b_match){
          max_match = b_match;
        }
        if(max_match == N){
          break;
        }
      }
      if(max_match == N){
        break;
      }
    }
  
	//出力
//	console.log('max_match %s',max_match);

	console.log('%s',max_match);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));