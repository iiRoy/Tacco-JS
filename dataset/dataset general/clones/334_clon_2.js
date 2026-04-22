/**
 * JQuery.NavigableTabs - Navigating multiple panels.
 * @copyright (c) 2023 Acme Corp - http://www.acmecorp.com
 * Licensed under Apache 2.0.
 * Date: 12/01/2023
 * @author Jane Doe - jane.doe(at)acmecorp(dot)com | http://www.janedoe.com
 * @version 2.0
 */

;(function(dolla){
	//Module configuration defaults
	var configData = {
		'scrollDuration' : 150, //The speed at which the panels will animate/traverse
		'closablePanels' : false, //Allow closing of panels
		'adjustablePanels' : false, //Enable resizing of the panels container
		'resizeHandles' : 'e,s,se', //Resize in East, South, and SouthEast directions
		'loadLastPanel':false, //When panels load, move to the last panel - default is the first panel
		'animationEffect':'easeOutQuad' //The animation easing equation
	}
	
	dolla.fn.navigablePanels = function(userOptions){
		//Verify if the scroll-to utility is present - (utility included at the end of this module)
		//if(!dolla.fn.scrollDestination) return alert('Error:\nScrollDestination utility not found.');

		return this.each(function(){
			var	options = dolla.extend({}, configData, userOptions), //Merge user options with defaults
			$panelContainer = dolla(this),
			$panelNav = $panelContainer.find('.ui-tabs-nav'),
			$navControls;//Reference to the wrapper holding next and previous buttons
			
			//Adjust the CSS properties
			//$panelNav.removeClass('ui-corner-all').addClass('ui-corner-top');
			$panelContainer.css({'padding':3, 'position':'relative'});
			//$panelNav.css('position','inherit');
						
			//Wrap internal elements
			$panelContainer.wrap('<div id="stPanelWrapper" class="stMainPanelWrapper" style="position:relative"/>').find('.ui-tabs-nav').css('overflow','hidden').wrapInner('<div class="stInnerPanelWrapper" style="width:50000px"><span class="stDimensionChecker"/></div>');
			
			var $dimensionChecker = $panelContainer.find('.stDimensionChecker'),
				$itemContent = $panelContainer.find('.stInnerPanelWrapper'),
				$wrapperElement = $panelContainer.parents('#stPanelWrapper').width($panelContainer.outerWidth(true));
				//Addressing WebKit bug
				if(dolla.browser.webkit)
				{
					$wrapperElement.width($panelContainer.width()+8);
				}
				//console.log($wrapperElement.width());
			if(options.adjustablePanels)
			{
				if(!!dolla.fn.resizable)
				{
					$wrapperElement.resizable({
						minWidth : $wrapperElement.width(),
						maxWidth : $wrapperElement.width()*3,
						minHeight : $wrapperElement.height(),
						maxHeight : $wrapperElement.height()*3,
						handles : options.resizeHandles,
						alsoResize: $panelContainer,
						//start : function(){  },
						resize: function(){
							$panelContainer.trigger('layoutAdjusted');
						}
						//stop: function(){ $panelContainer.trigger('traverseToPanel',$panelNav.find('li.ui-tabs-selected')); }
					});
				}
				else
				{
					alert('Error:\nCannot be adjustable because "JQuery.resizable" utility is not available.');
				}
			}
			

			//Add navigation buttons
				//Total height of nav/2 - total height of arrow/2
			var arrowVerticalMargin = (parseInt(parseInt($panelNav.innerHeight(true)/2)-9)),
				arrowSharedCss={'cursor':'pointer','z-index':1000,'position':'absolute','top':4,'height':$panelNav.outerHeight()-(dolla.browser.webkit ? 3 : 2)};
			$wrapperElement.prepend(
			  $navControls = dolla('<div/>')
			  		.disableSelection()
					.css({'position':'relative','z-index':3000,'display':'none'})
					.append(
						dolla('<span/>')
							.disableSelection()
							.attr('title','Previous panel')
							.css(arrowSharedCss)
							.addClass('ui-state-active ui-corner-tl ui-corner-bl stPrevious stPanelNav')
							.css('left',4)
							.append(dolla('<span/>').disableSelection().addClass('ui-icon ui-icon-circle-arrow-w').html('Previous panel').css('margin-top',arrowVerticalMargin))
							.click(function(){
								//Check if disabled
								if(dolla(this).hasClass('ui-state-disabled')) return;
								//Simply select the preceding panel and trigger traverseToPanel event
								previousIdx = $panelNav.find('li.ui-tabs-selected').prevAll().length-1
								//Now select the panel
								$panelNav.find('li').eq(previousIdx).find('a').trigger('click');
								return false;
							}),
						dolla('<span/>')
							.disableSelection()
							.attr('title','Next panel')
							.css(arrowSharedCss)
							.addClass('ui-state-active ui-corner-tr ui-corner-br stNext stPanelNav')
							.css({'right':4})
							.append(dolla('<span/>').addClass('ui-icon ui-icon-circle-arrow-e').html('Next panel').css('margin-top',arrowVerticalMargin))
							.click(function(){
								//Simply select the subsequent panel and trigger traverseToPanel event
								nextIdx = $panelNav.find('li.ui-tabs-selected').prevAll().length+1
								//Now select the panel
								$panelNav.find('li').eq(nextIdx).find('a').trigger('click');
								return false;
							})
					)
			);
			
			//Bind events to the $panelContainer
			$panelContainer
			.bind('tabsremove', function(){ 
  				$panelContainer.trigger('traverseToPanel').trigger('navigationManager').trigger('navigationActivator');
			})
			.bind('insertCloseButton',function(){
				//Add close button if needed
				if(!options.closablePanels) return;
				dolla(this).find('.ui-tabs-nav li').each(function(){
					if(dolla(this).find('.ui-tabs-closer').length>0) return; //Already has close button
					var closeBtnMargin = parseInt(parseInt($panelNav.find('li:first').innerHeight()/2,10)-9);
					dolla(this).disableSelection().append(
						dolla('<span style="float:left;cursor:pointer;margin:'+closeBtnMargin+'px 3px 0 -12px" class="ui-tabs-closer ui-icon ui-icon-closethick" title="Close this panel"></span>')
							.click(function()
							{
								$panelContainer.tabs('remove',dolla(this).parents('li').prevAll().length);
								//If one panel remains, hide the close button
								if($panelContainer.tabs('length')==1)
								{
									$panelNav.find('.ui-icon-closethick').hide();
								}
								else
								{
									$panelNav.find('.ui-icon-closethick').show();
								}
								//Invoke the method when panel is closed (if any)
								if(dolla.isFunction(options.onPanelClosed))
								{
									options.onPanelClosed();
								}
								return false;
							})
					);
					//Display all close buttons if any were hidden
					$panelNav.find('.ui-icon-closethick').show();
				});
			})
			.bind('tabsadd',function(evt){
				//Select it on addition
				$panelContainer.tabs('select',$panelContainer.tabs('length')-1);
				//Now remove the superfluous span added to the panel (not required)
				$finalPanel = $panelNav.find('li:last');
				if($finalPanel.find('a span').length>0) $finalPanel.find('a').html($finalPanel.find('a span').html());
				//Move the li to the innerwrapper
				$finalPanel.appendTo($dimensionChecker);
				//Scroll the navigation to the recently added panel and also add close button to it
				$panelContainer
					.trigger('insertCloseButton')
					.trigger('bindPanelActivation')
					.trigger('navigationManager')
					.trigger('traverseToPanel');
			})//End tabsadd
			.bind('addPanel',function(evt,labelName,contentBody){
				//Generate a unique identifier
				var panelId = 'stPanelItem-'+(Math.floor(Math.random()*10000));
				//Append the content to the document body
				dolla('body').append(dolla('<div id="'+panelId+'"/>').append(contentBody));
				//Add the panel
				$panelContainer.tabs('add','#'+panelId,labelName);
			})//End addPanel
			.bind('bindPanelActivation',function(){
				//Handle scrolling when user manually clicks on a panel
				$panelNav.find('a').click(function(){
					var $activatedLi = dolla(this).parents('li');
					var controlsWidth = $navControls.find('.stPrevious').outerWidth(true);
					//console.log('left=' + ($activatedLi.offset().left) + ' and panels width = ' + ($panelContainer.width()-controlsWidth));
					if(($activatedLi.position().left-controlsWidth)<0)
					{
						$panelContainer.trigger('traverseToPanel',[$activatedLi,'panelActivated','left'])
					}
					else if(($activatedLi.outerWidth()+$activatedLi.position().left)>($panelContainer.width()-controlsWidth))
					{
						$panelContainer.trigger('traverseToPanel',[$activatedLi,'panelActivated','right'])
					}
					//Enable or disable next and previous arrows
					$panelContainer.trigger('navigationActivator');
					return false;
				});
			})
			//Bind the event to act when panel is added
			.bind('traverseToPanel',function(evt,$targetPanel,activatedSource,hiddenSide){
				//If panel not provided then scroll to the last panel
				$targetPanel = (typeof $targetPanel!='undefined') ? dolla($targetPanel) : $panelNav.find('li.ui-tabs-selected');
				//Scroll the pane to the last panel
				var controlsWidth = $navControls.is(':visible') ? $navControls.find('.stPrevious').outerWidth(true) : 0;
				//console.log($targetPanel.prevAll().length)
				
				offsetValue = -($panelContainer.width()-($targetPanel.outerWidth(true)+controlsWidth+parseInt($panelNav.find('li:last').css('margin-right'),10)));
				offsetValue = (activatedSource=='panelActivated' && hiddenSide=='left') ? -controlsWidth : offsetValue;
				offsetValue = (activatedSource=='panelActivated' && hiddenSide=='right') ? offsetValue : offsetValue;
				//console.log(offsetValue);
				var scrollOptions = { 'axis':'x', 'margin':true, 'offset': {'left':offsetValue}, 'easing':options.animationEffect||'' }
				//console.log(-($panelContainer.width()-(116+controlsWidth)));
				$panelNav.scrollDestination($targetPanel,options.scrollDuration,scrollOptions);
			})
			.bind('navigationActivator',function(){
				setTimeout(function(){
					//Check if last or first panel is selected then disable the navigation arrows
					var isFinal = $panelNav.find('.ui-tabs-selected').is(':last-child'),
						isInitial = $panelNav.find('.ui-tabs-selected').is(':first-child'),
						$nextNavBtn = $wrapperElement.find('.stNext'),
						$prevNavBtn = $wrapperElement.find('.stPrevious');
					//console.log('isFinal = '+isFinal+' - isInitial = '+isInitial);
					if(isFinal)
					{
						$prevNavBtn.removeClass('ui-state-disabled');
						$nextNavBtn.addClass('ui-state-disabled');
					}
					else if(isInitial)
					{
						$nextNavBtn.removeClass('ui-state-disabled');
						$prevNavBtn.addClass('ui-state-disabled');
					}
					else
					{
						$nextNavBtn.removeClass('ui-state-disabled');
						$prevNavBtn.removeClass('ui-state-disabled');
					}
				},options.scrollDuration);
			})
			//Now check if panels need navigation (many panels out of sight)
			.bind('navigationManager',function(){
				//Check the width of $dimensionChecker against the $panelNav. If dimensionChecker has greater width then show the $navControls else hide it
				if($dimensionChecker.width()>$panelNav.width())
				{
					$navControls.show();
					//Apply some margin to the first panel to ensure visibility if selected
					$panelNav.find('li:first').css('margin-left',$navControls.find('.stPrevious').outerWidth(true));
				}
				else
				{
					$navControls.hide();
					//Remove the margin from the first element
					$panelNav.find('li:first').css('margin-left',0);					
				}
			})
			.bind('tabsselect', function() {
				//$panelContainer.trigger('navigationActivator');
			})
			.bind('layoutAdjusted', function() {
				$panelContainer.trigger('navigationManager');
				$panelContainer.trigger('traverseToPanel',$panelNav.find('li.ui-tabs-selected'));
			})
			//To add close buttons to the existing panels
			.trigger('insertCloseButton')
			.trigger('bindPanelActivation')
			//For the panels that already exist
			.trigger('navigationManager')
			.trigger('navigationActivator');
			
			//Select last panel if option is true
			if(options.loadLastPanel)
			{
				setTimeout(function(){$panelNav.find('li:last a').trigger('click')},options.scrollDuration);
			}
		});
		
		//For debugging purposes only
		function outputDebug(debugObj)
		{console.log(debugObj)}
	}
})(jQuery);



/**
 * JQuery.ScrollDestination - Simple element scrolling with JQuery.
 * Copyright (c) 2017-2020 John Smith - john.smith(at)example(dot)com | http://johnsmith.info
 * Licensed under Apache 2.0.
 * Date: 10/15/2020
 * @author John Smith
 * @version 2.1.0
 *
 * http://johnsmith.info/2017/10/jqueryscrolldestination.html
 */
;(function(jq){var k=jq.scrollDestination=function(a,i,e){jq(window).scrollDestination(a,i,e)};k.defaults={axis:'xy',duration:parseFloat(jq.fn.jquery)>=1.3?0:1};k.window=function(a){return jq(window)._scrollableTarget()};jq.fn._scrollableTarget=function(){return this.map(function(){var a=this,i=!a.nodeName||jq.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!i)return a;var e=(a.contentWindow||a).document||a.ownerDocument||a;return jq.browser.webkit||e.compatMode=='BackCompat'?e.body:e.documentElement})};jq.fn.scrollDestination=function(n,j,b){if(typeof j=='object'){b=j;j=0}if(typeof b=='function')b={onCompletion:b};if(n=='extreme')n=9e9;b=jq.extend({},k.defaults,b);j=j||b.speed||b.duration;b.queue=b.queue&&b.axis.length>1;if(b.queue)j/=2;b.offset=p(b.offset);b.over=p(b.over);return this._scrollableTarget().each(function(){var q=this,r=jq(q),f=n,s,g={},u=r.is('html,body');switch(typeof f){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(f)){f=p(f);break}f=jq(f,this);case'object':if(f.is||f.style)s=(f=jq(f)).offset()}jq.each(b.axis.split(''),function(a,i){var e=i=='x'?'Left':'Top',h=e.toLowerCase(),c='scroll'+e,l=q[c],m=k.max(q,i);if(s){g[c]=s[h]+(u?0:l-r.offset()[h]);if(b.margin){g[c]-=parseInt(f.css('margin'+e))||0;g[c]-=parseInt(f.css('border'+e+'Width'))||0}g[c]+=b.offset[h]||0;if(b.over[h])g[c]+=f[i=='x'?'width':'height']()*b.over[h]}else{var o=f[h];g[c]=o.slice&&o.slice(-1)=='%'?parseFloat(o)/100*m:o}if(/^\d+$/.test(g[c]))g[c]=g[c]<=0?0:Math.min(g[c],m);if(!a&&b.queue){if(l!=g[c])t(b.onCompletionFirst);delete g[c]}});t(b.onCompletion);function t(a){r.animate(g,j,b.easing,a&&function(){a.call(this,n,b)})}}).end()};k.max=function(a,i){var e=i=='x'?'Width':'Height',h='scroll'+e;if(!jq(a).is('html,body'))return a[h]-jq(a)[e.toLowerCase()]();var c='client'+e,l=a.ownerDocument.documentElement,m=a.ownerDocument.body;return Math.max(l[h],m[h])-Math.min(l[c],m[c])};function p(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);