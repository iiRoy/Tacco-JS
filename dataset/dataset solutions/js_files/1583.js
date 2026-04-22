//let input = "4 4\n1 1\n4 4\n..#.\n..#.\n.#..\n.#..";
/*
1:mapsize y,x
2:start y, x
3:goal y, x
4~: maps
*/

function main(input){
  input = input.trim();
  let lines = input.split("\n");
  let list = [];//2次元配列
  let map = [];//2次元配列

  for(let i=0; i<lines.length; i++){
    list[i] = lines[i].split(" ");
  }
  
  for(let i=0; i<lines.length-3; i++){
    map[i] = lines[i+3].split("");
  }
  
  let mapHeight = parseInt(list[0][0]);
  let mapWidth = parseInt(list[0][1]); 
  let sY = parseInt(list[1][0])-1;//startY
  let sX = parseInt(list[1][1])-1;
  let gY = parseInt(list[2][0])-1;//goalY
  let gX = parseInt(list[2][1])-1;
  let warpCount = 0;
  
  function showMap(){
    let mapping = "";
    let mapC = JSON.parse(JSON.stringify(map)); //mapCopied 値渡し;
    mapC[sY][sX] = "@";
    mapC[gY][gX] = "G";
    for(let h=0; h<mapC.length; h++){
      for(let w=0; w<mapC[h].length; w++){
        mapping += mapC[h][w];
      }mapping += "\n";
    }
    //console.log(mapping);
  }//end showMap
  
  function move(){
    if(gX>sX && map[sY][sX+1]==="."){
      sX++;
    }else if(gY>sY && map[sY+1][sX]==="."){
      sY++;
    }else if(Math.abs(gY-sY)<=2 && Math.abs(gX-sX)<=2){
      sY = gY; sX = gX;
      warpCount++;
    }
    showMap();
  } // end move
  
  for(let goaled=0; goaled===0;){ 
    if(sY === gY && sX === gX){
      console.log(warpCount);
      goaled = 1;
    }else{
      move();
    }
  } // while goaled = 0;
}

//main(input);
main(require("fs").readFileSync("/dev/stdin", "utf8"));