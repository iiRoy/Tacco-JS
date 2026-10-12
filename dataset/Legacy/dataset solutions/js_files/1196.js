"use strict";
main(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));

function main(lines){
	function Dice(labels){
		this.t = labels[0];
		this.s = labels[1];
		this.e = labels[2];
		this.w = labels[3];
		this.n = labels[4];
		this.b = labels[5];
	}
	Dice.prototype.roll = function(dir){
		var temp;
		if(dir == "N"){
			temp = this.t;
			this.t = this.s;
			this.s = this.b;
			this.b = this.n;
			this.n = temp;
		}
		else if(dir == "S"){
			temp = this.t;
			this.t = this.n;
			this.n = this.b;
			this.b = this.s;
			this.s = temp;
		}
		else if(dir == "W"){
			temp = this.t;
			this.t = this.e;
			this.e = this.b;
			this.b = this.w;
			this.w = temp;
		}
		else if(dir == "E"){
			temp = this.t;
			this.t = this.w;
			this.w = this.b;
			this.b = this.e;
			this.e = temp;
		}
	};
	Dice.prototype.isSame = function(other){
		var dice1 = new Dice(this.t, this.s, this.e, this.w, this.n, this.b);
		var dice2 = new Dice(other.t, other.s, other.e, other.w, other.n, other.b);
		var dirs = "EEEENEEEENEEEENEEENEEEENNEEEE";
		for(var c of dirs){
			if(dice1.t == dice2.t && dice1.s == dice2.s && dice1.e == dice2.e && dice1.w == dice2.w && dice1.n == dice2.n && dice1.b == dice2.b){
				return true;
			}
			dice2.roll(c);
		}
		return false
	};

	var dice1 = new Dice(lines[0].split(" "));
	var dice2 = new Dice(lines[1].split(" "));
	console.log(dice1.isSame(dice2) ? "Yes" : "No");
	
}