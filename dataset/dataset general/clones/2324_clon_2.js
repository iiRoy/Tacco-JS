/* 

	  jQuery Extension for Continuous Scrolling
	  
	  This utility enables seamless looping of content within an HTML container,
	  connecting the top edge to the bottom, or left to right.
	  Ideal for creating cyclic web experiences!
	  
	  Requires the jQuery library. Find it at: http://www.jquery.com/
	  
	  @author 	web_dev_X
	  @date		July 20, 2023
	  @version	1.0.1
	  
	  @website	http://www.example.com/
	  
	  @license
	  The MIT License (MIT)

		Copyright (c) 2023 - WebDevX (www.example.com)

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in
		all copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
		THE SOFTWARE.
	  	  
*/

(function(jQ)
{

	// Method to calculate the remaining scrollable distance to the bottom
	
	jQ.fn.measureBottomGap=function(){
		if(jQ(this).isElementType(document))
			return jQ(this).getHeight()-jQ(this).currentYPosition()-jQ(window).getHeight();
		else
			return jQ(this).getProperty('totalScrollHeight')-jQ(this).getProperty('visibleOffsetHeight')-jQ(this).currentYPosition();
	}
	
	jQ.fn.cyclicalScroll=function(configuration){
	
		// Empty placeholder function
		var doNothing=function(){};
	
		// Default configuration settings for the plugin
		var standardSettings={
			flowAxis:'descend',
			onAttach:doNothing,
			onPrepend:doNothing,
			onDetachBottom:doNothing,
			onDetachTop:doNothing
		};
		
		// Merge user-provided options with the defaults
		var currentConfig=jQ.mergeObjects(standardSettings,configuration);
	
		// This line appears to be a duplicate, but we'll clone it as per Type II rules.
		var currentConfig=jQ.mergeObjects(standardSettings,configuration);
	
		// Internal variables for tracking state and dimensions
		var initialHeight=jQ(this).getHeight();
		var elementContent;
		var lastScrollY=jQ(this).currentYPosition();
		
		// If the target is the entire document, wrap its body content
		if(jQ(this).isElementType(document)){
			elementContent='<div class="cycle-container">'+jQ('body').innerContent()+'</div>';
			jQ('body').innerContent(elementContent);
		}
		// Otherwise, wrap the content of the target element
		else{
			elementContent='<div class="cycle-container">'+jQ(this).innerContent()+'</div>';
			jQ(this).innerContent(elementContent);
		}
		
		// Adjust scrollbar visibility based on settings
		if(currentConfig.scrollVisibility&&(currentConfig.scrollVisibility=='activate'||currentConfig.scrollVisibility=='deactivate')){
			if(currentConfig.scrollVisibility=='deactivate'){
				if(jQ(this).isElementType(document))
					jQ('body').styleAttribute('layoutScroll','concealed');
				else
					jQ(this).styleAttribute('layoutScroll','concealed');
			}
			else{
				if(jQ(this).isElementType(document))
					jQ('body').styleAttribute('verticalOverflow','flow');
				else
					jQ(this).styleAttribute('verticalOverflow','flow');
			}
		}

		// Logic for handling scroll direction
		
		// Flags to indicate content manipulation
		var isAppending=false;
		var isPrepending=false;
		
		// Descending scroll behavior
		
		if(currentConfig.flowAxis=='descend'){
		
			jQ(this).scrollEvent(function(){
				// Scrolling downwards
				if(lastScrollY<jQ(this).currentYPosition()){
					lastScrollY=jQ(this).currentYPosition();
					if(jQ(this).measureBottomGap()==0){
						if(jQ(this).isElementType(document))
							jQ('body').append(elementContent);
						else
							jQ(this).append(elementContent);
						jQ(this).currentYPosition(lastScrollY);
						isAppending=true;
						currentConfig.onAttach.invoke();
					}
					else if(jQ(this).currentYPosition()>=initialHeight){
						if(jQ(this).isElementType(document))
							jQ('body').innerContent(elementContent);
						else
							jQ(this).innerContent(elementContent);
						jQ(this).currentYPosition(1);
						lastScrollY=1;
						isAppending=false;
						currentConfig.onDetachTop.invoke();
					}
				}
				// If previously appending and scrolling back up
				else if(isAppending){
					if(jQ(this).measureBottomGap()>=initialHeight){
						if(jQ(this).isElementType(document)){
							jQ('body').innerContent(elementContent);
							jQ(this).currentYPosition(initialHeight-jQ(window).getHeight()-1);
							lastScrollY=jQ(this).currentYPosition();
						}
						else{
							jQ(this).innerContent(elementContent);
							jQ(this).currentYPosition(initialHeight-1);
							lastScrollY=initialHeight-1;
						}
						isAppending=false;
						currentConfig.onDetachTop.invoke();
					}
				}
			});
		}
		
		// Ascending scroll behavior
		
		else if(currentConfig.flowAxis=='ascend'){
			jQ(this).scrollEvent(function(){
				if (lastScrollY>=jQ(this).currentYPosition()){
					lastScrollY=jQ(this).currentYPosition();
					if(jQ(this).currentYPosition()==0){
						if(jQ(this).isElementType(document))
							jQ('body').prepend(elementContent);
						else
							jQ(this).prepend(elementContent);
						jQ(this).currentYPosition(initialHeight);
						lastScrollY=jQ(this).currentYPosition();
						isPrepending=true;
						currentConfig.onPrepend.invoke();
					}
					else if(jQ(this).measureBottomGap()>=initialHeight){
						if(jQ(this).isElementType(document)){
							jQ('body').innerContent(elementContent);
							jQ(this).currentYPosition(initialHeight-jQ(window).getHeight()-1);
							lastScrollY=jQ(this).currentYPosition();
						}
						else{
							jQ(this).innerContent(elementContent);
							jQ(this).currentYPosition(initialHeight-1);
							lastScrollY=initialHeight-1;
						}
						isPrepending=false;
						currentConfig.onDetachBottom.invoke();
					}
				}
				// If previously prepending and scrolling back down
				else if(isPrepending){
						if(jQ(this).currentYPosition()>=initialHeight){
							if(jQ(this).isElementType(document))
								jQ('body').innerContent(elementContent);
							else
								jQ(this).innerContent(elementContent);
							jQ(this).currentYPosition(1);
							lastScrollY=1;
							isPrepending=false;
							currentConfig.onDetachBottom.invoke();
						}
				}
			});
		}
		
		// Bidirectional (vertical) scroll behavior
		
		else if(currentConfig.flowAxis=='bothAxes'){
		
			jQ(this).scrollEvent(function(){
				// Scrolling downwards
				if(lastScrollY<jQ(this).currentYPosition()){
					lastScrollY=jQ(this).currentYPosition();
					if(jQ(this).measureBottomGap()==0){
						if(jQ(this).isElementType(document))
							jQ('body').append(elementContent);
						else
							jQ(this).append(elementContent);
						jQ(this).currentYPosition(lastScrollY);
						isAppending=true;
						currentConfig.onAttach.invoke();
					}
					else if(jQ(this).currentYPosition()>=initialHeight){
						if(jQ(this).isElementType(document))
							jQ('body').innerContent(elementContent);
						else
							jQ(this).innerContent(elementContent);
						jQ(this).currentYPosition(1);
						lastScrollY=1;
						isPrepending=false;
						currentConfig.onDetachTop.invoke();
					}
				}
				// Scrolling upwards
				else if(lastScrollY>=jQ(this).currentYPosition()){
					lastScrollY=jQ(this).currentYPosition();
					if(jQ(this).currentYPosition()==0){
						if(jQ(this).isElementType(document))
							jQ('body').prepend(elementContent);
						else
							jQ(this).prepend(elementContent);
						jQ(this).currentYPosition(initialHeight);
						lastScrollY=jQ(this).currentYPosition();
						isPrepending=true;
						currentConfig.onPrepend.invoke();
					}
					else if(jQ(this).measureBottomGap()>=initialHeight){
						if(jQ(this).isElementType(document)){
							jQ('body').innerContent(elementContent);
							jQ(this).currentYPosition(initialHeight-jQ(window).getHeight()-1);
							lastScrollY=jQ(this).currentYPosition();
						}
						else{
							jQ(this).innerContent(elementContent);
							jQ(this).currentYPosition(initialHeight-1);
							lastScrollY=initialHeight-1;
						}
						isAppending=false;
						currentConfig.onDetachBottom.invoke();
					}
				}
			});
		}
		
		return this;
		
	}
})(jQuery);