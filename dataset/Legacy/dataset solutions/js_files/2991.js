function is_dark(A){
  var darks = [];
  for(var i=0;i<A.length;i++){
    line_set = new Set(A[i])
    if(line_set.size==1 && A[i][0]=='#'){continue;}
    if(line_set.size==2 || line_set.size==1 && A[i][0]=='.'){return false;}
  }
  return true;
}

function get_darken_blacks(A, blacks){
  var darken_blacks=[]
  for(var i=0;i<blacks.length;i++){
    var c_black = blacks[i];
    x = c_black[1];
    y = c_black[0];

    if((y>0 && A[y-1][x]=='#')&&(x>0 && A[y][x-1]=='#')&&(x<A[0].length-1 && A[y][x+1]=='#')&&(y<A.length-1 && A[y+1][x]=='#')){continue;}


    if(y>0                            && A[y-1][x]=='.'){
      darken_blacks.push([y-1, x]);
      A[y-1][x]='#';
    }
    if(x>0                            && A[y][x-1]=='.'){
      darken_blacks.push([y, x-1]);
      A[y][x-1]='#';
    }
    if(x<A[0].length-1 && A[y][x+1]=='.'){
      darken_blacks.push([y, x+1]);
      A[y][x+1]='#';
    }
    if(y<A.length-1       && A[y+1][x]=='.'){
      darken_blacks.push([y+1, x]);
      A[y+1][x]='#';
    }
  }
  return darken_blacks;
}

function get_blacks(A){
  blacks = [];
  for(var i=0;i<A.length;i++){
    for(var j=0;j<A[0].length;j++){
      if(A[i][j]=='#'){blacks.push([i,j])}
    }
  }
  return blacks;
}

function main(input){
  const lines = input.split('\n');
  const H = lines[0].split(' ').map(x => parseInt(x))[0];
  const W = lines[0].split(' ').map(x => parseInt(x))[1];
  var A=[];
  for(var i=0;i<H;i++){
    var line = lines[1+i].split('');
    A.push(line);
  }

//  console.log([H,W,A]);

  var result = 0;

  var blacks = get_blacks(A);

  if(blacks.length<100){
    hoge;
  }

  if(blacks.length==1){
    var black = blacks[0];
    long_x = 0;
    long_y = 0;
    if(black[0] > H-1-black[0]){long_y = black[0]}else{long_y=H-1-black[0]}
    if(black[1] > W-1-black[1]){long_x = black[1]}else{long_x=W-1-black[1]}
  console.log(long_x+long_y);

    return;
  }

  while(!is_dark(A)){
    blacks = get_darken_blacks(A, blacks)
    //A=darken(A, blacks);
    //console.log('==');
    //console.log(blacks);
    //console.log(A);
    result+=1;
  }

  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
