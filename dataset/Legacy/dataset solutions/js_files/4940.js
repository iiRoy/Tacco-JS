'use strict';
function Main(INPUT) {
  let input = INPUT.split("\n");
  let WH = input[0].split(" ");
  let W = parseInt(WH[0]);
  let H = parseInt(WH[1]);
  let p = new Array();
  let q = new Array();

  for(let i = 0; i < W;i++){
    p.push(input[1+i]);
  }
  for(let i = 0; i < H;i++){
    q.push(input[1+W+i]);
  }

  let node = new Array();
  for(let y = 0;y < H+1;y++){
    node.push([]);
    for(let x = 0;x < W+1;x++){
      node[y][x] = {
        "cluster" : (W+1)*y + x,
        "x" : parseInt(p[x]) || 100000001,
        "y" : parseInt(q[y]) || 100000001
      }
    }
  };
  //console.log(node);

  function kruskal(cost){
    let min = 100000001;//10^8+1
    let revise = [];

    for(let y = 0;y < H;y++){
      for(let x = 0;x < W;x++){
        if(node[y][x].x < min && node[y][x].cluster != node[y][x+1].cluster){
          min = node[y][x].x
          revise[0] = node[y][x];
          revise[1] = node[y][x+1];
        }
        if(node[y][x].y < min && node[y][x].cluster != node[y+1][x].cluster){
          min = node[y][x].y
          revise[0] = node[y][x];
          revise[1] = node[y+1][x];
        }
      }
    };
    for(let x = 0;x < W;x++){
      if(node[H][x].x < min && node[H][x].cluster != node[H][x+1].cluster){
        min = node[H][x].x
        revise[0] = node[H][x];
        revise[1] = node[H][x+1];
      }
    };
    for(let y = 0;y < H;y++){
      if(node[y][W].y < min && node[y][W].cluster != node[y+1][W].cluster){
        min = node[y][W].y
        revise[0] = node[y][W];
        revise[1] = node[y+1][W];
      }
    };

    let shouldChange = revise[1].cluster;
    for(let y = 0;y < H+1;y++){
      for(let x = 0;x < W+1;x++){
        if(node[y][x].cluster == shouldChange){
          node[y][x].cluster = revise[0].cluster;
        }
      }
    };

    //console.log(cost,"->",cost + min);
    cost += min;
    //console.log(node);

    for(let y = 0;y < H+1;y++){
      for(let x = 0;x < W+1;x++){
        if(node[0][0].cluster != node[y][x].cluster){
          return kruskal(cost);
        }
      }
    };

    return cost;
  }

  let cost = kruskal(0);
  console.log(cost);

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));