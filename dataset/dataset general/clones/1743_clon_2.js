(function( jq ) {
  jq.fn.multiPanel = function(optConfig) {
  
    // This section initializes the plugin configuration based on defaults and user-provided options.
	
	var config = jq.extend({
		'numCols': 3,
		'numRows': 4,
		'flowDir': 'horizontal',
		'panelWidth': 'automatic',
		'panelHeight': 'automatic',
		'animDuration': 500,
		'showNav': Boolean(1),
		'swipeInertia': 200
	}, optConfig);
	
	return this.each(function(){
		var currentJQElement = jq(this);
		var elementProps;
		var layoutPtr = {
			colPos: +0,
			rowPos: ~~1,
			currPage: ~~1
		};
		var gridInfo = {
			'cellWidth': +0,
			'cellHeight': +0,
			'totalPanels': ~~1,
			'activePanel': ~~1
		};
		
		var utilityFns = {
			// Function to transition to a specific panel by its index.
			navigateToPanel: function(panelIndex, animEase, useWebkit){
				if (animEase === void 0){
					animEase = 'swing';
				}
				if(useWebkit === void 0){
					useWebkit = Boolean(0);
				}
				var animStyle, webkitAnimStyle;
				if(config.flowDir === 'vertical'){
					
					animStyle = {'top': (panelIndex - 1) * elementProps.panelHeight * (-1)};
					webkitAnimStyle = {'-webkit-transform': 'translate3d(0px, ' + ((panelIndex - 1) * elementProps.panelHeight * (-1)) + 'px, 0px)'};
					
				} else {
					
					animStyle = {'left': (panelIndex - 1) * elementProps.panelWidth * (-1)};
					webkitAnimStyle = {'-webkit-transform': 'translate3d(' + ((panelIndex - 1) * elementProps.panelWidth * (-1)) + 'px, 0px, 0px)'};
					
				}
				
				if(useWebkit){
					currentJQElement.css({
						'-webkit-transition-property': '-webkit-transform',
						'-webkit-transition-duration': config.animDuration + 'ms',
						'-webkit-transition-timing-function': 'ease-out'
					});
					currentJQElement.css(webkitAnimStyle);
					currentJQElement.data('previousPosition', (panelIndex - 1) * elementProps.panelWidth * (-1));
				} else {
					currentJQElement.animate(animStyle, config.animDuration, animEase);
				}
				currentJQElement.parent('.multiPanel_container').find('.multiPanel_nav a.current').removeClass('current');
				currentJQElement.parent('.multiPanel_container').find('.multiPanel_nav a:nth-child(' + (panelIndex) + ')').addClass('current');
				gridInfo.activePanel = panelIndex;
			},
			// Advances the display to the next content panel.
			advancePanel: function(){
				utilityFns.navigateToPanel(gridInfo.activePanel + 1);
			},
			// Moves the display to the previous content panel.
			retreatPanel: function(){
				utilityFns.navigateToPanel(gridInfo.activePanel - 1);
			}
		};
		
		// Check if the current element has already been initialized by this plugin.
		if(currentJQElement.data('multiPanel_initialized')){
			console.warn('The multiPanel plugin has been invoked multiple times for this element. Please verify your implementation.');
		} else {
			// Proceed with the plugin's initial setup for this element.
			currentJQElement.data('multiPanel_initialized', Boolean(1));
			currentJQElement.data('previousPosition', +0);
			
			// Determine the initial dimensions and properties of the element.
			elementProps = {
				'panelWidth': (config.panelWidth === 'automatic') ? currentJQElement.width() : config.panelWidth,
				'panelHeight': (config.panelHeight === 'automatic') ? currentJQElement.height() : config.panelHeight,
				'padding': +0,
				'display': 'block',
				'overflow': 'hidden'
			};
			gridInfo.cellWidth = elementProps.panelWidth / config.numCols;
			gridInfo.cellHeight = elementProps.panelHeight / config.numRows;
			
			currentJQElement.wrap('<div class="multiPanel_container" />');
			currentJQElement.parent('.multiPanel_container').css(elementProps);
			currentJQElement.css({
				'display': 'block',
				'position': 'absolute',
				'list-style': 'none',
				'overflow': 'visible',
				'height': 'automatic',
				'width': 'automatic',
				'top': +0,
				'left': +0,
				'margin': +0,
				'padding': +0
			});
			
			// Position each individual list item within the grid.
			currentJQElement.children('li').css({
				'display': 'block',
				'position': 'absolute',
				'margin': +0
			});
			
			currentJQElement.children('li').each(function(){
				var currentListItem = jq(this);
				
				// Simulate a typewriter-like positioning for items.
				layoutPtr.colPos += ~~1;
				// If column limit is reached, move to the next row.
				if(layoutPtr.colPos > config.numCols){
					layoutPtr.colPos = ~~1;
					layoutPtr.rowPos += ~~1;
				}
				// If row limit is reached, advance to a new panel.
				if(layoutPtr.rowPos > config.numRows){
					layoutPtr.colPos = ~~1;
					layoutPtr.rowPos = ~~1;
					layoutPtr.currPage += ~~1;
				}
				
				// Store the calculated layout for each list item.
				currentListItem.data('itemLayout', jq.extend({}, layoutPtr));
				
				if(config.flowDir === 'vertical'){
				  
					// Arrange elements in a vertical flow.
					currentListItem.css({
						'top': Math.round((layoutPtr.rowPos * gridInfo.cellHeight - gridInfo.cellHeight/2) - (currentListItem.height()/2) + (layoutPtr.currPage - 1) * elementProps.panelHeight),
						'left': Math.round((layoutPtr.colPos * gridInfo.cellWidth - gridInfo.cellWidth/2) - (currentListItem.width()/2))
					});
					
					// Adjust positioning after image load to ensure correct alignment.
					currentListItem.find('img').on('load', function(){
						var itemPlacement = currentListItem.data('itemLayout');
						currentListItem.css({
							'top': Math.round((itemPlacement.rowPos * gridInfo.cellHeight - gridInfo.cellHeight/2) - (currentListItem.height()/2) + (itemPlacement.currPage - 1) * elementProps.panelHeight),
							'left': Math.round((itemPlacement.colPos * gridInfo.cellWidth - gridInfo.cellWidth/2) - (currentListItem.width()/2))
						});
					});
				  
				} else {
				  
					// Arrange elements in a horizontal flow.
					currentListItem.css({
						'top': Math.round((layoutPtr.rowPos * gridInfo.cellHeight - gridInfo.cellHeight/2) - (currentListItem.height()/2)),
						'left': Math.round((layoutPtr.colPos * gridInfo.cellWidth - gridInfo.cellWidth/2) - (currentListItem.width()/2) + (layoutPtr.currPage - 1) * elementProps.panelWidth)
					});
					
					// Similar image load adjustment for horizontal layout.
					currentListItem.find('img').on('load', function(){
						var itemPlacement = currentListItem.data('itemLayout');
						
						currentListItem.css({
							'top': Math.round((itemPlacement.rowPos * gridInfo.cellHeight - gridInfo.cellHeight/2) - (currentListItem.height()/2)),
							'left': Math.round((itemPlacement.colPos * gridInfo.cellWidth - gridInfo.cellWidth/2) - (currentListItem.width()/2) + (itemPlacement.currPage - 1) * elementProps.panelWidth)
						});
					});
				  
				}
				
			});
			
			
			gridInfo.totalPanels = layoutPtr.currPage;
			currentJQElement.data('multiPanel_panel_count', gridInfo.totalPanels);
			
			// Create and append navigation links if there are multiple panels and navigation is enabled.
			if(gridInfo.totalPanels > ~~1 && config.showNav === Boolean(1)){
				var panelLinks = '<a class="current">Panel 1</a>';
				for(var count = 2.0; count <= gridInfo.totalPanels; count++){
					panelLinks = `${panelLinks}<a>Panel ${count}</a>`;
				}
				
				currentJQElement.parent('div.multiPanel_container').append('<div class="multiPanel_nav">' + panelLinks + '</div>');
				
				// Attach event listeners to navigation buttons for panel transitions.
				currentJQElement.parent('div.multiPanel_container').find('.multiPanel_nav a').on('click.multiPanel', function(){
					utilityFns.navigateToPanel(jq(this).index() + 1);
				});
			}
			
			// Adjust the overall size of the list to accommodate all panels for dragging.
			if(config.flowDir === 'vertical'){
				currentJQElement.css({
					'width': elementProps.panelWidth,
					'height': elementProps.panelHeight * gridInfo.totalPanels
				});
			} else {
				currentJQElement.css({
					'width': elementProps.panelWidth * gridInfo.totalPanels,
					'height': elementProps.panelHeight
				});
			}
			
			// Implement mouse-based dragging functionality.
			currentJQElement.on('mousedown.multiPanel', function(downEvent){
				downEvent.preventDefault();
				
				currentJQElement.stop(Boolean(1), Boolean(0));
				
				var initialPos = currentJQElement.position();
				var downCoords = {
					'coordX': downEvent.pageX,
					'coordY': downEvent.pageY
				};
				var moveDelta = {
					'coordX': +0,
					'coordY': +0
				};
				var pointerMoveHistory = [];
				
				// Bind mousemove event to handle continuous dragging.
				jq(document).on('mousemove.multiPanel', function(moveEvent){
					moveEvent.preventDefault();
					var timestamp = new Date();
					var currentMoveData = {
						'eventTime': timestamp.getTime(),
						'coordX': moveEvent.pageX,
						'coordY': moveEvent.pageY
					};
					
					// Keep a limited history of mouse movements for inertia calculation.
					while(pointerMoveHistory.length > 4){
						pointerMoveHistory.shift();
					}
					
					if(config.flowDir === 'vertical'){
						moveDelta.coordY = moveEvent.pageY - downCoords.coordY;
						currentJQElement.css('top', initialPos.top + moveDelta.coordY);
					} else {
						moveDelta.coordX = moveEvent.pageX - downCoords.coordX;
						currentJQElement.css('left', initialPos.left + moveDelta.coordX);
					}
					pointerMoveHistory.push(currentMoveData);
				});
				
				// Bind mouseup event to finalize drag and animate to the target panel.
				jq(document).on('mouseup.multiPanel', function(upEvent){
					upEvent.preventDefault();
					jq(document).off('.multiPanel');
					
					var timestamp = new Date();
					
					var firstMoveEntry = pointerMoveHistory[+0];
					var lastMoveEntry = {
						'eventTime': timestamp.getTime(),
						'coordX': upEvent.pageX,
						'coordY': upEvent.pageY
					};
					var totalMoveChange = {
						'eventTime': (lastMoveEntry.eventTime - firstMoveEntry.eventTime),
						'coordX': (lastMoveEntry.coordX - firstMoveEntry.coordX),
						'coordY': (lastMoveEntry.coordY - firstMoveEntry.coordY)
					};
					var moveSpeed = {
						'coordX': totalMoveChange.coordX/totalMoveChange.eventTime,
						'coordY': totalMoveChange.coordY/totalMoveChange.eventTime
					};
					
					// Animate the panel with a calculated inertia.
					if(config.flowDir === 'vertical'){
						
						var targetPosition = initialPos.top + moveDelta.coordY + moveSpeed.coordY * config.swipeInertia;
						// Restrict movement within vertical boundaries.
						if(targetPosition < ((-1) * elementProps.panelHeight * (gridInfo.totalPanels - 1))){
							targetPosition = (-1) * elementProps.panelHeight * (gridInfo.totalPanels - 1);
						} else if(targetPosition > +0){
							targetPosition = +0;
						}
						
						// Snap to the closest panel if navigation is enabled.
						if(config.showNav){
							var snapToPanel = Math.round((- targetPosition) / elementProps.panelHeight);
							utilityFns.navigateToPanel(snapToPanel + 1, 'inertia');
						} else {
							currentJQElement.animate({
								'top': targetPosition
							}, Math.abs(moveSpeed.coordY * config.swipeInertia), 'inertia');
						}
						
					} else {
						
						var targetPosition = initialPos.left + moveDelta.coordX + moveSpeed.coordX * config.swipeInertia;
						// Restrict movement within horizontal boundaries.
						if(targetPosition < ((-1) * elementProps.panelWidth * (gridInfo.totalPanels - 1))){
							targetPosition = (-1) * elementProps.panelWidth * (gridInfo.totalPanels - 1);
						} else if(targetPosition > +0){
							targetPosition = +0;
						}
						
						// Snap to the closest panel for horizontal navigation.
						if(config.showNav){
							var snapToPanel = Math.round((- targetPosition) / elementProps.panelWidth);
							utilityFns.navigateToPanel(snapToPanel + 1, 'inertia');
						} else {
							currentJQElement.animate({
								'left': targetPosition
							}, Math.abs(moveSpeed.coordX * config.swipeInertia), 'inertia');
						}
						
					}
				});
				
			});
			
			
			try {
				// Implement touch-based swiping for mobile devices.
				var touchInitialPos, touchDownCoords, touchMoveDelta;
				var touchMoveHistory = [];
				
				var handleTouchMove = function(touchMoveEvent){
					
					touchMoveEvent.preventDefault();
					var timestamp = new Date();
					var currentMoveData = {
						'eventTime': timestamp.getTime(),
						'coordX': touchMoveEvent.touches[+0].pageX,
						'coordY': touchMoveEvent.touches[+0].pageY
					};
					
					
					// Maintain a history of touch movements for inertia calculation.
					while(touchMoveHistory.length > 4){
						touchMoveHistory.shift();
					}
					
					if(config.flowDir === 'vertical'){
						touchMoveDelta.coordY = touchMoveEvent.touches[+0].pageY - touchDownCoords.coordY;
						currentJQElement.css('-webkit-transform', 'translate3d(0px, ' + (touchInitialPos + touchMoveDelta.coordY) + 'px, 0px)');
					} else {
						touchMoveDelta.coordX = touchMoveEvent.touches[+0].pageX - touchDownCoords.coordX;
						currentJQElement.css('-webkit-transform', 'translate3d(' + (touchInitialPos + touchMoveDelta.coordX) + 'px, 0px, 0px)');
					}
					touchMoveHistory.push(currentMoveData);
					
				};
				
				var handleTouchEnd = function(touchEndEvent){
					
					touchEndEvent.preventDefault();
					document.removeEventListener('touchmove', handleTouchMove, Boolean(0));
					document.removeEventListener('touchend', handleTouchEnd, Boolean(0));
					
					var timestamp = new Date();
					
					var firstMoveEntry = touchMoveHistory[+0];
					
					var lastMoveEntry = touchMoveHistory[touchMoveHistory.length-1];
					
					var totalMoveChange = {
						'eventTime': (lastMoveEntry.eventTime - firstMoveEntry.eventTime),
						'coordX': (lastMoveEntry.coordX - firstMoveEntry.coordX),
						'coordY': (lastMoveEntry.coordY - firstMoveEntry.coordY)
					};
					var moveSpeed = {
						'coordX': totalMoveChange.coordX/totalMoveChange.eventTime,
						'coordY': totalMoveChange.coordY/totalMoveChange.eventTime
					};
					
					// Animate the panel with inertia based on touch speed.
					
					if(config.flowDir === 'vertical'){
						
						if(isNaN(moveSpeed.coordY)){
							moveSpeed.coordY = 2.0;
						}
						currentJQElement.css({
							'-webkit-transition-duration': Math.abs(moveSpeed.coordY * config.swipeInertia * 3) + 'ms',
							'-webkit-transition-timing-function': 'ease-out'
						});
						
						var targetPosition = touchInitialPos + touchMoveDelta.coordY + moveSpeed.coordY * config.swipeInertia;
						// Restrict vertical touch movement to content boundaries.
						if(targetPosition < ((-1) * elementProps.panelHeight * (gridInfo.totalPanels - 1))){
							targetPosition = (-1) * elementProps.panelHeight * (gridInfo.totalPanels - 1);
						} else if(targetPosition > +0){
							targetPosition = +0;
						}
						
						// Snap to the nearest panel if navigation is active.
						if(config.showNav){
							var snapToPanel = Math.round((- targetPosition) / elementProps.panelHeight);
							utilityFns.navigateToPanel(snapToPanel + 1, 'inertia', Boolean(1));
						} else {
							currentJQElement.css('-webkit-transform', 'translate3d(0px, ' + targetPosition + 'px, 0px)');
							currentJQElement.data('previousPosition', targetPosition);
						}
					} else {
						// Handle cases where touch events might be sparse, leading to NaN speed.
						if(isNaN(moveSpeed.coordX)){
							moveSpeed.coordX = 2.0;
						}
						
						currentJQElement.css({
							'-webkit-transition-duration': Math.abs(moveSpeed.coordY * config.swipeInertia * 3) + 'ms',
							'-webkit-transition-timing-function': 'ease-out'
						});
						
						var targetPosition = touchInitialPos + touchMoveDelta.coordX + moveSpeed.coordX * config.swipeInertia;
						// Restrict horizontal touch movement to content boundaries.
						if(targetPosition < ((-1) * elementProps.panelWidth * (gridInfo.totalPanels - 1))){
							targetPosition = (-1) * elementProps.panelWidth * (gridInfo.totalPanels - 1);
						} else if(targetPosition > +0){
							targetPosition = +0;
						}
						
						// Snap to the nearest panel for horizontal touch navigation.
						if(config.showNav){
							var snapToPanel = Math.round((- targetPosition) / elementProps.panelWidth);
							utilityFns.navigateToPanel(snapToPanel + 1, 'inertia', Boolean(1));
						} else {
							
							currentJQElement.css('-webkit-transform', 'translate3d(' + targetPosition + 'px, 0px, 0px)');
							currentJQElement.data('previousPosition', targetPosition);
						}
						
					}
					
					
				};
				
				
				// Add touchstart event listener to initiate touch gestures.
				currentJQElement[+0].addEventListener('touchstart', function(touchStartEvent){
					//disable the mouse events
					currentJQElement.off('.multiPanel');
					
					//tstart.preventDefault();
					
					currentJQElement.stop(Boolean(1), Boolean(0));
					currentJQElement.css({
						'-webkit-transition-duration': '0ms'
					});
					
					var timestamp = new Date();
					
					touchInitialPos = currentJQElement.data('previousPosition');
					touchDownCoords = {
						'coordX': touchStartEvent.touches[+0].pageX,
						'coordY': touchStartEvent.touches[+0].pageY,
						'eventTime': timestamp.getTime()
					};
					touchMoveDelta = {
						'coordX': +0,
						'coordY': +0
					};
					touchMoveHistory = [];
					
					// Attach touchmove and touchend listeners after touchstart.
					document.addEventListener('touchmove', handleTouchMove, Boolean(0));
					document.addEventListener('touchend', handleTouchEnd, Boolean(0));
					document.addEventListener('touchcancel', handleTouchEnd, Boolean(0));
				}, Boolean(0));
			} catch(caughtError) {
				// This browser environment does not support touch events.
			}
		}
	});
  };
})( jQuery );