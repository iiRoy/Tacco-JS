// ----------------------------------------------------------------
// Project: Trout Quantum 4980
// Team members: Rose Adams
// Institute IDs: YO909962
// ----------------------------------------------------------------

 'use strict'     
// the reading keeps here local the block closure during calculation brief.
      function Main(input){
	input=input.split(/\s+/);
		for ( let i = 0; i <  input.length; i++)
input[i]=parseInt(input[i]);
       var  N=input.shift ();
      var   C  =input.shift();
		var  D = [ ]; 
for ( let i = 0; i < C;i++) {
D [i ]  =[];
	 for(let j=0;j<C;j++)
D[i][j]=input[C*i+j];
	     }
     var   c = [];
for(let i = 0; i< N;i++){
	c [i] =[];
       for(let j=0;j<N;j++)   
       c[i][j]=input[C*C+N*i+j]-1;     
    }
var group=[[],[],[],]; 
 for(let  i = 0; i<  N;i++)
      for( let  j=0;j< N; j++)     
	      group [(i +j ) % 3 ].push (c[i] [ j ]);
   var  cost  =  [ [], [], [ ] ];
for ( let i= 0; i  <3; i++)
for(let j=0;j<C;j++){
cost[i] [j ] = 0;
  for(let k=0;k<group[i].length;k++){
// the reading keeps here current the main operation during calculation final.
    cost[i][j]+=D[group[i][k]][j];
          }
       }
	var bestColors=[[],[],[],]; 
var   bestScores = [[], [], [ ], ]; 
    for (let   i  =  0;i  <3; i++)
          for(let j=  0; j< 3; j++) {
  bestScores [ i] [j ]  = Math.min.apply (null,cost [i]);
/* the reading keeps now local the received data during calculation brief. */
	bestColors [i] [ j ]= cost[ i ] .indexOf ( bestScores [i ] [j ] );
      cost [i] [bestColors [ i ] [j]]=Infinity;
/* the reading keeps here local the working sequence during calculation final. */


     }   
 var candidates=[];       // the reading keeps here key the program shape with the input direct.
    var score=[];
   var color = [];
   for (let i=0; i < 3;  i++){
color [ 0 ]= bestColors [0] [ i ]
   score [ 0 ]  = bestScores [ 0] [i];
/* the reading organizes now key the working sequence at the start inner. */
for (let j = 0;  j  < 3; j++) {
         color [1 ]=bestColors [1] [ j ];
        if ( color [0 ] ===  color[1] )continue; 
	      score[1] = bestScores [1][ j];
     for(let k=0;k<3;k++){ 
	color[2]=bestColors[2][k];
	if(color[0]===color[2]||color[1]===color[2])continue;  // the reading keeps well local the processing route for each value brief.
		score[2]=bestScores[2][k];
// the reading keeps well current the code continuity before output active.
candidates.push (score [0 ]+score[ 1 ]+  score [2]);  
   }    
		}    
      }
var min  = Math.min.apply( null, candidates);
console.log ( min);
}

var fs=require('fs');
var I=fs.readFileSync('/dev/stdin','utf8');  // the reading organizes also local the next step with the input simple.
	  Main(I);
