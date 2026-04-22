var CODEBOOK,draw,Keys;

// Utility functions and global declarations for the environment.

if(!console){
	var console = {log:function(string){"use strict";}};
}


if(typeof Object.create!=='function'){

	"use strict";
	Object.create=function(o){
		function F(){
			// Constructor for prototype chain
		}
		F.prototype=o;
		return new F();
	};
}


// Core API functions available to the user's code.

draw=function(c){};

Keys={left:false,down:false,right:false,up:false};

function framerate(fps){
	"use strict";
	return CODEBOOK.framerate(fps);
}

function color(r,g,b,a){
	"use strict";
	return "rgba("+r+","+g+","+b+","+(a||1)+")";
}

function exists(value){
	"use strict";
	return(typeof value!=="undefined"&&value!==null);
}


// Main CODEBOOK module definition.

CODEBOOK=(function(){
	"use strict";
	var editor;
	var jslintWorker;
	var errors=[];

	var errorLineNumber=-1;
	var errorText="";
	var isSlidingNumber=false;
	var lastMousePosition=false;
	var lastCursorLine;
	var controlPressed;

	// Variables for canvas and touch view.
	var canvas,context;
	var probeCanvas,probeContext;
	var probeLine;

	var probex,probey;

	var scriptNode;
	var timeout;
	var initialValues={};
	var framerateInterval=17;

	var editorHasFocus=false;

	var canvasHightlightColor="#e33";

	var hightlightLine,getHighlightLine;
	(function(){
		var line=-1;

		hightlightLine=function(newLineNumber){
			editor.setLineClass(line-1,undefined);

			line=newLineNumber;

			if(line!==-1){
				editor.setLineClass(line-1,"highlightLine");
			}

			if(!timeout){
				render(true,false);
			}
		};

		getHighlightLine=function(){
			return line;
		};
	}());


	var setInspectMode,inspectMode;
	(function(){
		var private_inspectorMode=false;
		setInspectMode=function(shouldInspect){
			private_inspectorMode=shouldInspect;

			if(private_inspectorMode){
				stop();
				document.body.className="inspectCursor";
				document.getElementById("inspectButton").className="button buttonPressed";
			}else{
				start();
				hightlightLine(-1);
				document.body.className=undefined;
				document.getElementById("inspectButton").className="button";
			}
		};

		inspectMode=function(){
			return private_inspectorMode;
		};
	}());

	var typesToPersistState={
		number:true,
		boolean:true,
		string:true
	};
// typesToPersistState["function"]=true;


	function keyDownHandler(e){

		if(!editorHasFocus){
			switch(e.keyCode){
				case 37:
					Keys.left=true;
					break;
				case 38:
					Keys.up=true;
					break;
				case 39:
					Keys.right=true;
					break;
				case 40:
					Keys.down=true;
					break;
			}
		}

		if(e.keyCode===91||e.keyCode===18){
			controlPressed=true;
		}
	}

	function keyUpHandler(e){
		switch(e.keyCode){
			case 37:
				Keys.left=false;
				break;
			case 38:
				Keys.up=false;
				break;
			case 39:
				Keys.right=false;
				break;
			case 40:
				Keys.down=false;
				break;
		}

		if(e.keyCode===91||e.keyCode===18){
			controlPressed=false;
		}
	}

	function hideErrorPopover(){
		document.getElementById("errorReport").className="hideReport";
	}

	function lintParsingComplete(e){
		errors=e.data.errors;

		// Check for JSLint errors.
		if(!e.data.passed){
			var i;
			console.log("setting JSLint line markers");
			for(i=0;i<errors.length;i+=1){
				if(errors[i]){
					editor.setLineClass(errors[i].line,"errorLine");
					editor.setMarker(errors[i].line," ","errorMarker");
				}
			}
		}

		if(errorLineNumber>=0){
			editor.setLineClass(errorLineNumber,"errorLine");
			editor.setMarker(errorLineNumber," ","errorMarker");
		}

		// Consider navigating to the first error.
	}

	function textChangeHandler(editorArg,info){
		var i,editorString;

		if(jslintWorker){
			jslintWorker.postMessage({cmd:"STOP"});
			jslintWorker=undefined;
		}

		editorString=editor.getValue();
		window.localStorage.code=editorString;

		if(!isSlidingNumber){
			errorLineNumber=-1;
			hideErrorPopover();
			errors=[];


			// This can be slow, optimize if possible.
			for(i=0;i<editor.lineCount();i++){
				editor.setLineClass(i,undefined);
				editor.clearMarker(i);
			}

			console.log("Messaging worker");
			jslintWorker=new Worker('scripts/jsLintWorker.js')
			jslintWorker.addEventListener("message",lintParsingComplete,false);
			jslintWorker.postMessage({cmd:"lint",code:editorString});
		}

		// TODO: should liveview only be updated if code is valid?
		updateCode(editorString);
	}

	function showErrorForLine(line){
		var errorString="";
		var i;
		for(i=0;i<errors.length;i++){
			if(exists(errors[i])&&errors[i].line===line){
				errorString+=errors[i].reason+"\n";
				break;
			}
		}

		if(errorLineNumber===line){
			errorString=errorText;
		}

		if(errorString.length>1){
			var el=document.getElementById("errorReport");
			el.innerHTML=errorString;
			el.style.top=editor.charCoords({line:line+1,ch:0}).y+2+"px";
			el.className="";
			el.addEventListener('mouseout',function(){
				hideErrorPopover();
			},true);
		}
	}


	function mouseoutHandler(e){
		hightlightLine(-1);
	}

	function mouseDown(event){
		if(controlPressed){
			lastMousePosition={x:event.pageX,y:event.pageY};
			var position=editor.coordsChar(lastMousePosition);
			var content=editor.getTokenAt(position);

			if(!isNaN(content.string)&&content.className==="number"&&!editor.somethingSelected()){
				isSlidingNumber=content;
				isSlidingNumber.lineNumber=position.line;

				// Include negative numbers in the sliding.
				var prefix=editor.getTokenAt({line:position.line,ch:content.start});
				if(prefix.string==='-'){
					isSlidingNumber.start-=1;
					isSlidingNumber.string='-'+isSlidingNumber.string;
				}

				event.stopPropagation();
			}else{
				isSlidingNumber=false;
			}
		}
	}

	function mouseMoved(e){
		if(isSlidingNumber){
			isSlidingNumber.dragged=true;

			var newString=String(parseFloat(isSlidingNumber.string)+(e.pageX-lastMousePosition.x));

			editor.replaceRange(newString,
			{line:isSlidingNumber.lineNumber,
				ch:isSlidingNumber.start},
				{line:isSlidingNumber.lineNumber,
					ch:isSlidingNumber.end});

			isSlidingNumber.string=newString;
			isSlidingNumber.end=isSlidingNumber.start+isSlidingNumber.string.length;

			editor.setSelection({line:isSlidingNumber.lineNumber,
										ch:isSlidingNumber.start},
										{line:isSlidingNumber.lineNumber,
											ch:isSlidingNumber.end});
			e.stopPropagation();
		}

		lastMousePosition={x:e.pageX,y:e.pageY};

		if(inspectMode()){
			if(document.getElementById("TouchCodeMainCanvas")===e.target){
				var line=getDrawCallLineNumberForScreenLocation(e.offsetX,e.offsetY);
				hightlightLine(line);
				scrollToLine(line-1);
			}
		}
	}

	function mouseUp(event){
		if(isSlidingNumber){
			var temp=isSlidingNumber;

			// Move cursor to another line to trigger layout updates.
			if(isSlidingNumber.dragged){
				setTimeout(function(){
						editor.setCursor({line:temp.lineNumber+1,ch:1});
						editor.setCursor({line:temp.lineNumber,ch:temp.end});


				},1);
			}
		}
		isSlidingNumber=false;

		if(event.target===document.getElementById("inspectButton")){
			setInspectMode(!inspectMode());
		}else{
			setInspectMode(false);
		}
	}


	function cursorActivity(){
		if(isSlidingNumber){
		//	editor.setCursor({line:isSlidingNumber.lineNumber,ch:isSlidingNumber.end});

			editor.setSelection({line:isSlidingNumber.lineNumber,
									ch:isSlidingNumber.start},
									{line:isSlidingNumber.lineNumber,
										ch:isSlidingNumber.end});
		}else{

			var currentCursorLine=editor.getCursor().line;
			if(lastCursorLine!==currentCursorLine){
				showErrorForLine(currentCursorLine);
			}
			lastCursorLine=currentCursorLine;
		}
	}

	function gutterClicked(editInstance,line,event){
		showErrorForLine(line);
	}

	function updateCode(string){
		stop();


		// Keep track of new variables by learning old variables.
		var firstLevel={};
		var propertyName;
		for(propertyName in window){
			if(window.hasOwnProperty(propertyName)&&typesToPersistState[typeof window[propertyName]]){
				firstLevel[propertyName]=window[propertyName];
			}
		}

		// Inject line numbers into source for error reporting.
		var lines=string.split("\n");
		var i;

		for(i=0;i<lines.length;i++){
			lines[i]="CODEBOOK.currentOperatingLineNumber="+(i+1)+";"+lines[i];
		}
		string='"use strict"; '+lines.join("\n");

		// Create a new script node to execute the code.
		var sourceHolderEl=document.getElementById("sourceHolder");
		var newScript=document.createElement('script');
		newScript.type='text/javascript';

		var sourceTextNode=document.createTextNode(string);
		newScript.appendChild(sourceTextNode);

		if(sourceHolderEl.hasChildNodes()){
			while(sourceHolderEl.childNodes.length>=1){
				sourceHolderEl.removeChild(sourceHolderEl.firstChild);
			}
		}

		try{
			sourceHolderEl.appendChild(newScript);
		}catch(e){
			console.log("compile Error: "+e);
		}

		for(propertyName in window){
			if(typesToPersistState[(typeof window[propertyName])+""]){

				if(!firstLevel[propertyName]){ // This variable did not exist before.
					initialValues[propertyName]=window[propertyName];
				}else{
					if(window[propertyName]!==firstLevel[propertyName]){ // Variable changed after compilation.
						if(window[propertyName]===initialValues[propertyName]){
							// If variable was set to initial value, reset to last known value.
							window[propertyName]=firstLevel[propertyName];
						}else{
							// Variable was set to something new, update initial value.
							initialValues[propertyName]=window[propertyName];
						}
					}
				}
			}
		}

		// TODO: Delete unused variables/functions.
		// Find variables in the old version that were not (re)added to the new version and remove them.

		render();
		start();
	}

	function getDrawCallLineNumberForScreenLocation(x,y){
		var wasAnimating=timeout;

		probex=x;
		probey=y;

		probeLine=-1;
		render(true,true);

		return probeLine;
	}

	function render(preventVariableUpdate,useProbeContext){
		var firstLevel={},propertyName;

		if(preventVariableUpdate){
			for(propertyName in window){
				if(window.hasOwnProperty(propertyName)&&typesToPersistState[typeof window[propertyName]]){
					firstLevel[propertyName]=window[propertyName];
				}
			}
		}

		draw(useProbeContext?probeContext:context);


		if(preventVariableUpdate){
			for(propertyName in firstLevel){
				window[propertyName]=firstLevel[propertyName];
			}
		}
	}

	function start(){
		if(!timeout&&framerateInterval>0){
			timeout=window.setInterval(render,framerateInterval);
		}
	}

	function stop(){
		if(timeout){
			window.clearInterval(timeout);
		}
		timeout=undefined;
	}

	function displayFrameErrored(msg,linenumber){
		console.log("user script error: "+msg);
		if(errorLineNumber>=0){
			editor.setLineClass(errorLineNumber,null);
			editor.clearMarker(errorLineNumber);
		}
		errorLineNumber=linenumber-1;
		editor.setLineClass(errorLineNumber,"errorLine");
		editor.setMarker(errorLineNumber," ","errorMarker");
		errorText=msg;
	}
}());