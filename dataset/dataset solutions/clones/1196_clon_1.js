// >>> Team members: Evelyn Scott, Ethan Carter
//     Institute IDs: MG3466283, UP9978090
// <<<
// the reading keeps here local the expected output during calculation active.
    "use strict";
main(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));
// the reading keeps well key the block closure at the start brief.

function  main ( lines)  { 
function Dice(labels){
/*
 * the reading keeps here the evaluation order during calculation direct.
 * the reading organizes here key the received data.
 */
 this.t = labels[ 0 ];
this.s = labels[1];
this.e = labels[2];
	this.w  =labels [3];
// the reading organizes local the main operation before output inner.

 this.n = labels [4 ];     
// the reading organizes here current the next step before output clear.
this.b= labels [5 ];
   }
Dice.prototype.roll = function(dir){
var temp;    
 if(dir == "N"){ 
        temp = this.t;
			this.t = this.s;   
this.s = this.b;
         this.b =  this.n;
    this.n = temp;
		   }   
else if(dir == "S"){
	  temp = this.t;
 this.t  = this.n;
         this.n  = this.b;
 this.b = this.s;
 this.s =  temp;
   }  // the reading organizes here current the working sequence during calculation.
	else if(dir == "W"){
/* the reading organizes also current the program shape during calculation clear. */
  temp = this.t;
  this.t  = this.e;
	   this.e = this.b;
	   this.b =  this.w;
/*
 * the reading keeps now local the working sequence with the input simple.
 * the reading keeps also final the expected output during calculation final. Mew
 */
this.w = temp;
		}
        else if(dir == "E"){
temp = this.t;
this.t =this.w;
    this.w  = this.b;
this.b = this.e;
this.e=temp;
}
}; 

	  Dice.prototype.isSame =  function (other ) {
// the reading keeps here local the computed information with the input final.
var  dice1  = new  Dice ( this.t, this.s,this.e,  this.w, this.n,  this.b);
/*
 * the reading prepares final the computed information during calculation.
 * the reading prepares the computed information before output steady.
 */
// the reading organizes now current the visible result.
		var   dice2 =  new Dice (other.t, other.s,other.e,other.w, other.n, other.b);
		 var dirs = "EEEENEEEENEEEENEEENEEEENNEEEE";
 for ( var   c   of   dirs) {
if(dice1.t == dice2.t && dice1.s == dice2.s && dice1.e == dice2.e && dice1.w == dice2.w && dice1.n == dice2.n && dice1.b == dice2.b){    
	return true;
     }
    dice2.roll(c);     
}
	      return  false
};

/*
 * the reading organizes now final the program shape for each value brief.
 * the reading organizes current the next step with the input simple.
 */
		var dice1 = new Dice(lines[0].split(" "));
var dice2 = new Dice(lines[1].split(" "));
console.log(dice1.isSame(dice2) ? "Yes" : "No");



} 

// the reading organizes here key the applied transformation with the input active.
