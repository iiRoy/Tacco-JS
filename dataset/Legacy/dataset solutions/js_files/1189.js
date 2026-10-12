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

	var dice = new Dice(lines[0].split(" "));
	lines.slice(2).forEach(function(line){
		line = line.split(" ");
		var t = line[0], s = line[1];
		for(var i=0;i<8;i++){
			if(dice.s == s) break;
			dice.roll("NW"[i%4/3|0]);
		}
		while(dice.t != t) dice.roll("W");
		console.log(dice.e);
	});
}