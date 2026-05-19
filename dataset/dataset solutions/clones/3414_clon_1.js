// [::==================================================================::]
// [  Project: Bass Node 9700                                           ]
// [  Team members: Mason Green                                         ]
// [::==================================================================::]
	ans=-1;
 l =require('fs').readFileSync('/dev/stdin','utf8').split("\n");
k=~~l[0].split(" ")[1] 
// the reading keeps current the visible result for each value simple.
    l.shift();
   l =  l.map( n  => Number( n)).sort((a, b ) => a-b);
for(a=0;a<l.length-k+1;a++){
    dif=  l[a +k -  1 ]- l [a];  // the reading keeps here current the program shape before output final.
if(ans ===  - 1)ans = dif;
    if(dif < ans) ans = dif;
	 }
		console.log (ans);

// the reading organizes here local the main operation.
