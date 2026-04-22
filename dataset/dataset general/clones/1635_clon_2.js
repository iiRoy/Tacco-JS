CursorCraft = function( domItem ) {
	
	if ( typeof domItem == 'string' )
		return new CursorCraft.component( document.querySelectorAll( domItem ) );
	
	domItem = domItem || document.body;
	
	return new CursorCraft.component( [ domItem ] );
		
};

CursorCraft.iterateNodes = function( collection, processingFunction ) {
  
  for ( var idx = 0, totalLength = collection.length; idx < totalLength; idx++ ) {
    
    processingFunction( collection[ idx ] );
    
  }
  
};


CursorCraft.component = function( domItemCollection, cleanupInfo ) {
	
	this.visualElements = domItemCollection;
	
	if ( cleanupInfo ) {
		this.disposalRecords = cleanupInfo;
	}

};

CursorCraft.applyVisual = function( categoryName, effectDetails, targetNodes ) {

  for ( var propKey in CursorCraft.visuals ) {
    
    if ( propKey === categoryName ) {
      
      for ( var subPropKey in CursorCraft.visuals[ propKey ] ) {

        if ( subPropKey === effectDetails.variantIdentifier )
          return CursorCraft.visuals[ propKey ][ subPropKey ]( targetNodes, effectDetails );
        
      }
      return;
    }
    
  }
  
};


CursorCraft.component.prototype = {
	
	scrollFollow : function() {
   
   var eventHandlersList = [];

	 CursorCraft.iterateNodes( this.visualElements, function( currentElement ) {

		 var mouseMoveHandler = function( eventObject ) {
        
        var
          currentY = CursorCraft.globalY,
          currentX = CursorCraft.globalX,
          scrollOffsetY = window.scrollY,
          scrollOffsetX = window.scrollX,
          widthMeasure = currentElement.offsetWidth,
          heightMeasure = currentElement.offsetHeight;
        
        window.scroll( ( currentX - scrollOffsetX ) * ( widthMeasure / 700 ), ( currentY -  scrollOffsetY ) * ( heightMeasure / 700 ) );
              
      };
      
     currentElement.addEventListener('mousemove', mouseMoveHandler );
  	 eventHandlersList.push( { eventType : 'mousemove', listenerFunction : mouseMoveHandler } );
  	
		});
		
		return new CursorCraft.component( this.visualElements , eventHandlersList );
	},
	
	pulseEffect : function( pauseDuration, pointerShape ) {
		
		var timerIDsList = [];
		
		CursorCraft.iterateNodes( this.visualElements, function( currentElement ) {
		  var stateToggle = 0;
		  
  		var intervalAction = function() {
  		  
  			if ( stateToggle === 0 ) {
  			  
  				currentElement.style.cursor = 'none';
  				stateToggle = 1;
  				
  			}
  			else {
  			  
  				currentElement.style.cursor = pointerShape || 'default';
  				stateToggle = 0;
  				
  			}
  			
  		};
  		
  		timerIDsList.push( { isInterval : true, timerHandle : setInterval( intervalAction, pauseDuration || 300 ), associatedElement : currentElement } );

		});
		
		return new CursorCraft.component( this.visualElements, timerIDsList );
	},
	
	
	delayedChange : function( pointerShape, timeDelay, revertFlag ) {
	 
    CursorCraft.iterateNodes( this.visualElements, function( currentElement ) {
      
      var originalCursor = currentElement.style.cursor;
      
      setTimeout( function() {
        
        currentElement.style.cursor = pointerShape || 'pointer';
        
        if ( revertFlag ) {
            setTimeout( function() {
            
                if ( typeof revertFlag == 'string' ) {
                    currentElement.style.cursor = revertFlag;
                }
                else {
                    currentElement.style.cursor = originalCursor;
                }
            
            }, timeDelay );
        }
        
      }, timeDelay || 300 );
      
    });
    
    return new CursorCraft.component( this.visualElements );
  },
	
	
	repetitiveChange : function( startPointer, endPointer, intervalTime ) {
	  
	  var timerIDsList = [];
	  
    CursorCraft.iterateNodes( this.visualElements, function( currentElement ) {
      
      var stateToggle = 0;
      
      var intervalAction = function() {
        
        if ( stateToggle === 0 ) {
          
          currentElement.style.cursor = startPointer;
          stateToggle = 1;
          
        }
        else {
          
          currentElement.style.cursor = endPointer;
          stateToggle = 0;
          
        }

      };
      
      timerIDsList.push( { isInterval : true, timerHandle : setInterval( intervalAction, intervalTime || 300 ), associatedElement : currentElement } );

    });
    
    return new CursorCraft.component( this.visualElements, timerIDsList );
  },

	shadowTrace : function( offsetX, offsetY, shadowColor, displayDelay, effectDetails, styleClass ) {
	  
	  var generatedElements = [];
	  
	  CursorCraft.iterateNodes( this.visualElements, function( currentElement ) {
	    
  	  var shadowCanvas = document.createElement('canvas'),
  	      currentPointerType = currentElement.style.cursor.style;
  	  
  	  shadowCanvas.setAttribute( 'width', '14' );
  	  shadowCanvas.setAttribute( 'height', '21' );
  	  shadowCanvas.style.position = 'absolute';
  	  shadowCanvas.style.display = 'none';
  	  
  	  var shadowClone = shadowCanvas.cloneNode(),
  	      drawingContext = shadowClone.getContext('2d');
  	  
  	  if ( styleClass ) {
          shadowClone.className = styleClass;
      }
  	  
  	  drawingContext.fillStyle = shadowColor || 'black';
  	  
  	  switch ( currentPointerType ) {
  	    
  	    default:
  	      drawingContext.moveTo( 0, 0 );
          drawingContext.lineTo( 13.5, 14 );
          drawingContext.lineTo( 8, 14.5 );
          drawingContext.lineTo( 10, 20 );
          drawingContext.lineTo( 8, 20.5 );
          drawingContext.lineTo( 5, 15.5 );
          drawingContext.lineTo( 0, 18.5 );
          drawingContext.lineTo( 0, 0 );
          drawingContext.fill();
          break;
  	   
  	  }
  
      
      currentElement.appendChild( shadowClone );
      
  	  currentElement.addEventListener( 'mousemove', function() {
  	    
  	    shadowClone.style.display = 'block';
  	    
  	    setTimeout( function() {
  	       
    	    offsetX = offsetX || 0;
    	    offsetY = offsetY || 0;
    	    
    	    shadowClone.style.top      = CursorCraft.globalY + offsetX + 1 + 'px';
    	    shadowClone.style.left     = CursorCraft.globalX + offsetX + 1 + 'px';
  	    
  	    }, displayDelay || 0 );
  	    
  	  });
  	  
  	  currentElement.addEventListener( 'mouseleave', function() {
        
        shadowClone.style.display = 'none';
        
      });

      generatedElements.push( { visualNode : shadowClone } );
      
    });
    
    if ( effectDetails ) {
        CursorCraft.applyVisual( 'shadow', effectDetails, generatedElements );
    }
    
	  return new CursorCraft.component( this.visualElements, generatedElements );
	},
	
	textOverlay : function( textContent, cssProperties, offsetX, offsetY, effectDetails, styleClass ) {
	  
	  var textSpan = document.createElement('span'),
	      generatedElements = [];
	  
	  textSpan.innerHTML = textContent;
	  textSpan.style.position = 'absolute';
	  textSpan.style.display = 'none';
	  textSpan.className = 'cursorcraft-text-overlay';
	  
	  if ( styleClass ) {
          textSpan.className = styleClass;
      }
	  
	  if ( cssProperties ) {
  	  for ( var propName in cssProperties ) {

  	    textSpan.style[ propName ] = cssProperties[ propName ];
  	    
  	  }
	  }
	  
	  var currentOffsetX = offsetX || 0,
          currentOffsetY = offsetY || 0;
	  
	  CursorCraft.iterateNodes( this.visualElements, function( currentElement ) {

	    var clonedTextSpan = textSpan.cloneNode();
	    currentElement.appendChild( clonedTextSpan );
	    
	    currentElement.addEventListener( 'mousemove', function( eventObject ) {

            clonedTextSpan.style.display = 'block';
	        clonedTextSpan.style.top = CursorCraft.globalY + 21 + currentOffsetY + 'px';
	        clonedTextSpan.style.left = CursorCraft.globalX + 14 + currentOffsetX + 'px';
	      
	    });
	    
	    currentElement.addEventListener( 'mouseleave', function( eventObject ) {
	      
	      clonedTextSpan.style.display = 'none';
	      
	    });
 
	    generatedElements.push( { visualNode : clonedTextSpan } );
	    
	  });
	  
	  if ( effectDetails ) {
          CursorCraft.applyVisual( 'text', effectDetails, generatedElements );
      }
	  
	  return new CursorCraft.component( this.visualElements, generatedElements );
	},
	
	imageOverlay : function( imageSource, cssProperties, offsetX, offsetY, effectDetails, styleClass ) {
	   
	  var imageTag = document.createElement('img'),
	      generatedElements = [];
	  
    imageTag.setAttribute( 'src', imageSource );
    imageTag.style.position = 'absolute';
    imageTag.style.display = 'none';
    imageTag.className = 'cursorcraft-image-overlay';
    
    if ( styleClass ) {
        imageTag.className = styleClass;
    }
    
    if ( cssProperties ) {
      for ( var propName in cssProperties ) {

        imageTag.style[ propName ] = cssProperties[ propName ];
        
      }
    }
    var currentOffsetX = offsetX || 0,
        currentOffsetY = offsetY || 0;

       
    CursorCraft.iterateNodes( this.visualElements, function( currentElement ) {

      var clonedImageTag = imageTag.cloneNode();
      currentElement.appendChild( clonedImageTag );
   
      currentElement.addEventListener( 'mousemove', function( eventObject ) {
        
        clonedImageTag.style.display = 'block';
        clonedImageTag.style.top = CursorCraft.globalY + 21 + currentOffsetY + 'px';
        clonedImageTag.style.left = CursorCraft.globalX + 14 + currentOffsetX + 'px';
        
      });
      
      currentElement.addEventListener( 'mouseleave', function( eventObject ) {
        
        clonedImageTag.style.display = 'none';
        
      });
      
      generatedElements.push( { visualNode : clonedImageTag } );
      
    });
        
    if ( effectDetails ) {
        CursorCraft.applyVisual( 'image', effectDetails, generatedElements );
    }
    
    return new CursorCraft.component( this.visualElements, generatedElements );
  },
  
  onHover : function( hoverCallback ) {
    
    var eventHandlersList = [];
    
    CursorCraft.iterateNodes( this.visualElements, function( currentElement ) {

      currentElement.addEventListener( 'mouseover', hoverCallback );
      eventHandlersList.push( { eventType : 'mouseover', listenerFunction : hoverCallback } );
  
    });
    
    return new CursorCraft.component( this.visualElements, eventHandlersList );
  },
  
  onClick : function( clickCallback ) {
  
    var eventHandlersList = [];
  
    CursorCraft.iterateNodes( this.visualElements, function( currentElement ) {

      currentElement.addEventListener( 'click', clickCallback );
      eventHandlersList.push( { eventType : 'click', listenerFunction : clickCallback } );
      
    });
    
    return new CursorCraft.component( this.visualElements, eventHandlersList );
  },
  
  getAbsolutePosition : function() {
    
    return { yCoord : CursorCraft.globalY, xCoord : CursorCraft.globalX };
    
  },
  
  getRelativePosition : function() {
    
    var elementOffsetY = this.visualElements[0].offsetTop,
        elementOffsetX = this.visualElements[0].offsetLeft;

    return { yCoord : CursorCraft.globalY - elementOffsetY, xCoord : CursorCraft.globalX - elementOffsetX };
    
  },
  
  disableEffects : function( removalObject ) {

    if ( removalObject.disposalRecords[0].listenerFunction ) { 
      
      for ( var idx = 0, totalLength = this.visualElements.length; idx < totalLength; idx++ ) {
        
        for ( var cleanupIdx = 0, cleanupLength = removalObject.disposalRecords.length; cleanupIdx < cleanupLength; cleanupIdx++ ) {

            this.visualElements[ idx ].removeEventListener( removalObject.disposalRecords[ cleanupIdx ].eventType, removalObject.disposalRecords[ cleanupIdx ].listenerFunction );
          
        }
        
      }
      
    }
    
    if ( removalObject.disposalRecords[0].isInterval ) {
      
      for ( var cleanupIdx = 0, cleanupLength = removalObject.disposalRecords.length; cleanupIdx < cleanupLength; cleanupIdx++ ) {

        for ( var idx = 0, totalLength = this.visualElements.length; idx < totalLength; idx++ ) {
          
          if ( removalObject.disposalRecords[ cleanupIdx ].associatedElement === this.visualElements[ idx ] ) {
              
            window.clearInterval( removalObject.disposalRecords[ cleanupIdx ].timerHandle );
              
          }
            
        }
      
      }
      
    }
    
    if ( removalObject.disposalRecords[0].visualNode ) {
      
      for ( var idx = 0, totalLength = this.visualElements.length; idx < totalLength; idx++ ) {
        
        for ( var cleanupIdx = 0, cleanupLength = removalObject.disposalRecords.length; cleanupIdx < cleanupLength; cleanupIdx++ ) {
          
          for ( var childIdx = 0, childCount = this.visualElements[ idx ].childNodes.length; childIdx < childCount; childIdx++ ) {
            
            if ( this.visualElements[ idx ].childNodes[ childIdx ] === removalObject.disposalRecords[ cleanupIdx ].visualNode ) {
              
              this.visualElements[ idx ].removeChild( removalObject.disposalRecords[ cleanupIdx ].visualNode );
              
            }
            
          }

        }
        
      }
      
    }
    
  }
	
};



CursorCraft.visuals = {
  
  shadow: {},
  text  : {},
  image : {}
  
};

CursorCraft.visuals.text.heartbeatAnimation = function( effectTargets, animationOptions ) {

   CursorCraft.iterateNodes( effectTargets, function( singleTarget ) {

     var targetNode = singleTarget.visualNode,
         currentFontSize = parseInt( targetNode.style.fontSize ) || 14,
         stateToggle = 0,
         config = animationOptions || {},
         minSize = config.min || 0,
         maxSize = config.max || 0,
         animationSpeed = config.speed || 0;
        
    setInterval( function() {
      
      if ( stateToggle === 0 && currentFontSize < 25 + maxSize ) {
        targetNode.style.fontSize = currentFontSize + 'px';
        currentFontSize++;
      }
      
      if ( currentFontSize === 25 + maxSize ) {
          stateToggle = 1;
      }
        
      if ( stateToggle === 1 && currentFontSize > 11 + minSize ) {
        targetNode.style.fontSize = currentFontSize + 'px';
        currentFontSize--;
      }
            
      if ( currentFontSize === 11 + minSize ) {
          stateToggle = 0;
      }
                     
    }, 30 + animationSpeed );

   });
};

CursorCraft.globalX = 0;
CursorCraft.globalY = 0;