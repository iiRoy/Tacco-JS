if(!Function.prototype.bind){Function.prototype.bind=function(boundContext){'use strict';if(typeof this!=='function'){throw new TypeError('Function.prototype.bind - the entity attempting to be bound is not a callable function');}var argumentsArray=Array.prototype.slice.call(arguments,1),funcToWrap=this,NoOpConstructor=function(){},wrappedFunction=function(){return funcToWrap.apply((this instanceof NoOpConstructor && boundContext)?this:boundContext,argumentsArray.concat(Array.prototype.slice.call(arguments)));};NoOpConstructor.prototype=this.prototype;wrappedFunction.prototype=new NoOpConstructor();return wrappedFunction;};}// Comment: Function.prototype.bind polyfill
// Source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
// Purpose: Ensures compatibility with older browsers like IE <= 8


// Comment: Array.prototype.indexOf polyfill
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// Purpose: Provides indexOf method for Array objects in older environments (IE <= 8)
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(searchVal/*,initialIndex*/){'use strict';if(this==null){throw new TypeError();}var targetObj=Object(this),sizeCount=targetObj.length >>> 0,startIdx,loopIdx;if(sizeCount===0){return -1;}startIdx=0;if(arguments.length > 1){startIdx=Number(arguments[1]);if(startIdx!=startIdx){ // Check for NaN
				startIdx=0;}else if(startIdx!=0 && startIdx!=Infinity && startIdx!=-Infinity){startIdx=(startIdx > 0 || -1) * Math.floor(Math.abs(startIdx));}}if(startIdx >= sizeCount){return -1;}loopIdx=startIdx >= 0 ? startIdx : Math.max(sizeCount - Math.abs(startIdx),0);for(;loopIdx < sizeCount;loopIdx++){if(loopIdx in targetObj && targetObj[loopIdx]===searchVal){return loopIdx;}}return -1;};}

(function(htmlDocument){'use strict';var
		RELEASE_NUM='0.1',
		globalScope=this,
		ENLARGE_CLASS_IDENTIFIER='glider-enlarged',
		SUSPENDED_CLASS_IDENTIFIER='glider-suspended',

		gliderService,
		butlerUtility;

	// Comment: Helper object for various utility functions.
	butlerUtility={isCollection:function(subject){var typeCheckResult=Object.prototype.toString.call(subject);return typeCheckResult==='[object Array]'||typeCheckResult==='[object NodeList]';},processEach:function(collection,handler,scope){var processingFunction=(scope!==undefined)?handler.bind(scope):handler,i,attribute;if(this.isCollection(collection)){if(Array.forEach!==undefined){collection.forEach(processingFunction);}else{for(i=0;i < collection.length;i+=1){processingFunction(collection[i],i,collection);}}}else{for(attribute in collection){if(collection.hasOwnProperty(attribute)){processingFunction(collection[attribute],attribute,collection);}}}},getAbsolutePosition:function(element){var posX=0,posY=0;while(element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)){posX+=element.offsetLeft - element.scrollLeft;posY+=element.offsetTop - element.scrollTop;element=element.parentNode;}return{left:posX,top:posY};},manipulateClass:function(element,styleTag){if(this.hasStyle(element,styleTag)){var styleClasses=element.className.split(' '),tokenPosition=styleClasses.indexOf(styleTag);styleClasses.splice(tokenPosition,1);element.className=styleClasses.join(' ');}else{if(element.className.length > 0){element.className+=' '+styleTag;}else{element.className+=styleTag;}}},getViewportScrollOffset:function(){return(globalScope.pageYOffset!==undefined)?globalScope.pageYOffset:(htmlDocument.documentElement||htmlDocument.body.parentNode||htmlDocument.body).scrollTop;},hasStyle:function(element,styleTag){return element.className.indexOf(styleTag)!==-1;},configureSetting:function(gliderInstance,configOptions,optionName,defaultVal){if(configOptions[optionName]!==undefined){gliderInstance[optionName]=configOptions[optionName];}else{gliderInstance[optionName]=defaultVal;}}};

	// Comment: Detaches headers from their fixed positions.
	function releasePanels(gliderInstance,endBoundary){var limitIndex=endBoundary;if(endBoundary===undefined){limitIndex=0;}butlerUtility.processEach(gliderInstance.panelArray.slice(limitIndex),function(element,index){if(butlerUtility.hasStyle(element,ENLARGE_CLASS_IDENTIFIER)){butlerUtility.manipulateClass(element,ENLARGE_CLASS_IDENTIFIER);element.parentNode.style.height='';element.parentNode.style.width='';if(gliderInstance.stackablePanels && index > 0){element.style.top='';}}if(!butlerUtility.hasStyle(element,SUSPENDED_CLASS_IDENTIFIER)){butlerUtility.manipulateClass(element,SUSPENDED_CLASS_IDENTIFIER);}});
	}

	// Comment: Attaches headers to their fixed positions.
	function fixPanels(gliderInstance,endBoundary){butlerUtility.processEach(gliderInstance.panelArray.slice(0,endBoundary),function(element,index){if(!butlerUtility.hasStyle(element,ENLARGE_CLASS_IDENTIFIER)){butlerUtility.manipulateClass(element,ENLARGE_CLASS_IDENTIFIER);element.parentNode.style.height=element.offsetHeight+'px';element.parentNode.style.width=element.offsetWidth+'px';}if(gliderInstance.activeSectionIndex > 0 && gliderInstance.stackablePanels){var verticalShift=0,i;for(i=0;i < index;i+=1){verticalShift+=gliderInstance.panelArray[i].offsetHeight;}element.style.top=verticalShift+'px';}if(butlerUtility.hasStyle(element,SUSPENDED_CLASS_IDENTIFIER)){butlerUtility.manipulateClass(element,SUSPENDED_CLASS_IDENTIFIER);}});
	}

	// Comment: Adjusts the fixed headers based on the current scroll position.
	function synchronizeDisplay(gliderInstance,scrollPositionView){releasePanels(gliderInstance);var i,j,activeHeaderIndex=0,topOffsetVal=0;for(i=gliderInstance.panelArray.length - 1;i >= 0;i-=1){topOffsetVal=0;if(gliderInstance.stackablePanels){for(j=0;j < i;j+=1){topOffsetVal+=gliderInstance.panelArray[j].offsetHeight;}}if((scrollPositionView + topOffsetVal)>=butlerUtility.getAbsolutePosition(gliderInstance.panelArray[i]).top){activeHeaderIndex=i;break;}else if(i===0){ // We are positioned above the very first panel in the collection
				activeHeaderIndex=-1;}}if(activeHeaderIndex!==-1){gliderInstance.activeSectionIndex=activeHeaderIndex;if(gliderInstance.stackablePanels){gliderInstance.offsetTop=topOffsetVal + gliderInstance.panelArray[activeHeaderIndex].offsetHeight;}fixPanels(gliderInstance,activeHeaderIndex + 1);releasePanels(gliderInstance,activeHeaderIndex + 1);}}

	// Comment: Triggers the header update process.
	function refreshLayout(gliderInstance,scrollTarget){var scrollPositionView=(scrollTarget===globalScope)?butlerUtility.getViewportScrollOffset():butlerUtility.getAbsolutePosition(scrollTarget).top;synchronizeDisplay(gliderInstance,scrollPositionView);}

	// Comment: Sorts the array of header elements by their vertical position.
	function orderElements(collectionOfElements){collectionOfElements.sort(function(panelA,panelB){return butlerUtility.getAbsolutePosition(panelA).top - butlerUtility.getAbsolutePosition(panelB).top;});butlerUtility.processEach(collectionOfElements.slice(1),function(panel){if(!butlerUtility.hasStyle(panel,SUSPENDED_CLASS_IDENTIFIER)){butlerUtility.manipulateClass(panel,SUSPENDED_CLASS_IDENTIFIER);}});
	}

	gliderService=function(configOptions){this.elementRegistry={};this.panelArray=[];this.activeSectionIndex=0;if(configOptions!==undefined){butlerUtility.configureSetting(this,configOptions,'scrollArea',globalScope);butlerUtility.configureSetting(this,configOptions,'stackablePanels',false);}else{this.scrollArea=globalScope;this.stackablePanels=false;}};

	gliderService.prototype={

		// Comment: Marks the specified element(s) as sticky headers.
		activateSections:function(componentId){var instanceRef=this;function addSingleElement(identifier){if(instanceRef.elementRegistry[identifier]!==undefined){instanceRef.deactivateSections(identifier);}if(identifier.charAt(0)==='.'){instanceRef.elementRegistry[identifier]=htmlDocument.getElementsByClassName(identifier.slice(1));butlerUtility.processEach(instanceRef.elementRegistry[identifier],function(item){instanceRef.panelArray.push(item);});}else{instanceRef.elementRegistry[identifier]=htmlDocument.getElementById(identifier);instanceRef.panelArray.push(instanceRef.elementRegistry[identifier]);}}if(typeof componentId==='object'){if(butlerUtility.isCollection(componentId)){butlerUtility.processEach(componentId,function(identifier){instanceRef.activateSections(identifier);});}else{butlerUtility.processEach(componentId,function(value,identifier){instanceRef.activateSections(identifier);});}}else{addSingleElement(componentId);}orderElements(this.panelArray);this.scrollArea.onscroll=function(){refreshLayout(instanceRef,instanceRef.scrollArea);};},

		// Comment: Removes the sticky header behavior from the specified element(s).
		deactivateSections:function(componentId){var instanceRef=this;function removeSinglePanel(panelElement){if(panelElement!==undefined){if(butlerUtility.hasStyle(panelElement,SUSPENDED_CLASS_IDENTIFIER)){butlerUtility.manipulateClass(panelElement,SUSPENDED_CLASS_IDENTIFIER);}if(butlerUtility.hasStyle(panelElement,ENLARGE_CLASS_IDENTIFIER)){butlerUtility.manipulateClass(panelElement,ENLARGE_CLASS_IDENTIFIER);}if(instanceRef.panelArray.indexOf(panelElement)<=instanceRef.activeSectionIndex &&
							instanceRef.activeSectionIndex > 0){instanceRef.activeSectionIndex-=1;}instanceRef.panelArray.splice(instanceRef.panelArray.indexOf(panelElement),1);if(instanceRef.panelArray.length===0 && instanceRef.scrollArea.onscroll!==null){instanceRef.scrollArea.onscroll=null;}}}function removeCatalogEntry(identifier){if(instanceRef.elementRegistry[identifier]!==undefined){if(butlerUtility.isCollection(instanceRef.elementRegistry[identifier])){butlerUtility.processEach(instanceRef.elementRegistry[identifier],function(panel){removeSinglePanel(panel);});}else{removeSinglePanel(instanceRef.elementRegistry[identifier]);}delete instanceRef.elementRegistry[identifier];}}if(typeof componentId==='object'){if(butlerUtility.isCollection(componentId)){butlerUtility.processEach(componentId,function(identifier){instanceRef.deactivateSections(identifier);});}else{butlerUtility.processEach(componentId,function(value,identifier){instanceRef.deactivateSections(identifier);});}}else{removeCatalogEntry(componentId);}},

		// Comment: Clears all sticky headers managed by this instance.
		terminateInstance:function(){var instanceRef=this;butlerUtility.processEach(this.elementRegistry,function(panel,identifier){instanceRef.deactivateSections(identifier);});},

		// Comment: Returns the current version string.
		getVersion:function(){return RELEASE_NUM;}
	};

	globalScope.Glider=gliderService;

	globalScope.Glider.destroy=function(){delete globalScope.Glider;};

}.bind(this)(this.document));