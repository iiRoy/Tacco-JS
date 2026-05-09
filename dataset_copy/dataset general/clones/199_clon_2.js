/*
 * chronicleDisplay v 0.9.46
 * adaptive dual column chronological layout utility
 * http://www.example.com/chronicle
 * Open Source License
 * by John Doe
 */


(function ( jq ) {
	//  SCREEN SIZE DETECTION ASSISTANT thanks to http://stackoverflow.com/questions/18575582/how-to-detect-responsive-breakpoints-of-twitter-bootstrap-3-using-javascript
    var screenSizeAssistant  = '<div class="device-xs visible-xs hidden"></div>';
        screenSizeAssistant += '<div class="device-sm visible-sm hidden"></div>';
        screenSizeAssistant += '<div class="device-md visible-md hidden"></div>';
        screenSizeAssistant += '<div class="device-lg visible-lg hidden"></div>';

    jq('body').prepend(screenSizeAssistant);

    if(typeof debounceExecution !== 'undefined' && jq.isFunction( debounceExecution )) {
        // no operations required
    }else{
        var debounceExecution=function(){var f={};return function(g,h,e){e||(e="unique string!");f[e]&&clearTimeout(f[e]);f[e]=setTimeout(g,h)}}();
        var currentTimestamp = new Date();
    }


    function retrieveScreenSize( sizeAlias ) {
        return jq('.device-' + sizeAlias).is(':visible');
    }
	//  SCREEN SIZE DETECTOR end


	var chronicleDivisions = [],
		chronicleSettings = []
		;
	//	examine user agent string
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
	{ jq('html, body').addClass('gecko ext-gecko')	}
	if(navigator.userAgent.toLowerCase().indexOf('safari') > -1)
	{  jq('html, body').addClass('safari ext-webkit') }

	
        //  internal utility functions
    var chronicle_DetermineDivisionCount = (function(){
            var columnNum = 0,
                gridStyles,
                activeBreakpoint,
                currentBreakpointValue = 0,
                initialBreakpointValue = 0;

            //  obtain current display width category
            if( retrieveScreenSize('xs')){
                currentBreakpointValue = 1;
                activeBreakpoint = 'xs';
            }else if( retrieveScreenSize('sm')){
                currentBreakpointValue = 2;
                activeBreakpoint = 'sm';
            }else if( retrieveScreenSize('md')){
                currentBreakpointValue = 3;
                activeBreakpoint = 'md';
            }else if( retrieveScreenSize('lg')){
                currentBreakpointValue = 4;
                activeBreakpoint = 'lg';
            }
	//console.log(currentBreakpointValue+activeBreakpoint);

	//if(typeof chronicleSettings !== 'undefined' && jq.isFunction( chronicleSettings )) {
		if(typeof chronicleSettings !== 'undefined') {
            if( chronicleSettings.startBreakpoint == 'xs'){
                initialBreakpointValue = 1;
                gridStyles = 'col-xs-6 col-sm-6 col-md-6  col-lg-6 xs';
            }else if( chronicleSettings.startBreakpoint == 'sm'){
                initialBreakpointValue = 2;
                gridStyles = 'col-xs-12 col-sm-6 col-md-6  col-lg-6 sm';
            }else if( chronicleSettings.startBreakpoint == 'md'){
                initialBreakpointValue = 3;
                gridStyles = 'col-xs-12 col-sm-12 col-md-6  col-lg-6 md';
            }else if( chronicleSettings.startBreakpoint == 'lg'){
                initialBreakpointValue = 4;
                gridStyles = 'col-xs-12 col-sm-12 col-md-12 col-lg-6 lg';
            }
			//console.log(gridStyles);
        } else{
		console.log('configuration not defined');
		}

            if( currentBreakpointValue >= initialBreakpointValue  ) {
                columnNum = 2;
            }else{
                columnNum = 1;
            }

            return {
                columnNum:columnNum,
                gridStyles : gridStyles,
                activeBreakpoint : activeBreakpoint
            }
        });

    var chronicle_RetrieveItemPlacement = (function(itemElement){
        var offsetVal = 0, heightVal = 0, totalPosition = 0, targetItem, itemOffsetTop, itemOuterHeight, itemBottomPos, itemId;

        if (itemElement == 0 || !itemElement || itemElement.length == 0 )return{offsetVal:0,heightVal:0,totalPosition:0};

        targetItem = jq(itemElement);
        itemId = targetItem.attr('id');
        itemOffsetTop = Math.ceil(targetItem.offset().top);
        itemOuterHeight = Math.ceil(targetItem.outerHeight(true));
        itemBottomPos = (itemOuterHeight + itemOffsetTop);
	//console.log('itemId: '+itemId+': itemOffsetTop: '+itemOffsetTop+' itemOuterHeight: '+itemOuterHeight+' = itemBottomPos: '+itemBottomPos+' calculated: '+(itemOffsetTop+itemOuterHeight));

        return {
            offsetVal : itemOffsetTop,
            heightVal : itemOuterHeight,
            totalPosition : itemBottomPos,
            elementIdentifier : itemId
        }

    });

    var chronicle_DecideSide = (function (itemElement){

            if (itemElement == 0 || !itemElement || itemElement.length == 0 ) {
                return console.log('no target element');
            }else{
                var currentElementInfo, leftElementInfo, rightElementInfo, offsetGapTop, offsetGapBottom, heightDifferenceA, heightDifferenceB, elementID, previousRightID, previousLeftID, itemPosition, badgeOffset,
                    targetItem = jq(itemElement);
				var browserAdjustment = 0;
                if (jq('body').hasClass('ext-gecko')) browserAdjustment = 1;
                if (jq('body').hasClass('ext-webkit')) browserAdjustment = 1;	//Safari - Apple browser

                elementID = targetItem.attr('id');
                previousRightID = targetItem.prevAll('.mo-inverted').attr('id'); // $pRid = $prevRid
                previousLeftID = targetItem.prevAll('li').not('.mo-inverted').attr('id');    // $pLid = $prevLid


                leftElementInfo = chronicle_RetrieveItemPlacement(jq('#'+previousLeftID));
                rightElementInfo = chronicle_RetrieveItemPlacement(jq('#'+previousRightID));
                currentElementInfo = chronicle_RetrieveItemPlacement(jq('#'+elementID));
                offsetGapTop = currentElementInfo.offsetVal - leftElementInfo.offsetVal;
                offsetGapBottom = leftElementInfo.totalPosition - currentElementInfo.offsetVal;
                heightDifferenceA = leftElementInfo.totalPosition - rightElementInfo.totalPosition;
                heightDifferenceB = rightElementInfo.totalPosition - leftElementInfo.totalPosition;

                if(chronicleDivisions.columnNum > 1){

                    if (leftElementInfo.totalPosition >= currentElementInfo.offsetVal + browserAdjustment ) {
                        itemPosition = 1;
                    }
                    if (rightElementInfo.totalPosition > leftElementInfo.totalPosition  ) {
                        itemPosition = 0;
                    }
                    if (leftElementInfo.totalPosition == rightElementInfo.totalPosition ) { // changed from = to ==
                        //itemPosition = 1; // original comment
                    }

                    //  modify badge visual
                    if( itemPosition > 0 ){
                        if (  offsetGapTop < 40 && offsetGapTop >= 0 ) {
                            badgeOffset = 1;
                        }
                        if ( heightDifferenceA < 40 && heightDifferenceB < 40 )  {
                            badgeOffset = 1;
                        }
                    }
                }


                return {
                    leftRight : itemPosition,
                    badge_offset : badgeOffset,
                    currentElementInfo:currentElementInfo,
                    leftElementInfo:leftElementInfo,
                    rightElementInfo:rightElementInfo
                }
            }
        });

    var chronicle_ApplyItemPlacement = (function(itemElement) {

       // if(itemElement == 'undefined') return;
            var positionData = chronicle_DecideSide(itemElement);

            if (positionData.leftRight > 0) {
                itemElement.addClass('mo-inverted');
            } else {
                itemElement.removeClass('mo-inverted');
            }
            if (positionData.badge_offset > 0) {
                itemElement.addClass('offset');
            } else {
                itemElement.removeClass('offset');
            }

        });

    chronicle_InitializeLayout = (function(initialArray,indexPosition) {

            var targetElement;

            targetElement = jq(initialArray[indexPosition]);
            chronicle_ApplyItemPlacement(targetElement);

            if (indexPosition < (chronicleDefaults.total - 1)) {
                chronicle_InitializeLayout(initialArray,indexPosition + 1);
            } else {
                chronicle_UpdateAllItems();
				//jq(window).data('ajaxready', true);	//	only needed on original author's site. YOU MAY SAFELY REMOVE THIS LINE
            }

        });

    chronicle_UpdateAllItems = (function() {

            //chronicleDivisions =  chronicle_DetermineDivisionCount();
            timelineElements = jq('ul.mo-timeline');

			//jq('li:not(:first)',timelineElements).each(function(indexPosition){
            jq('li',timelineElements).each(function(indexPosition){
                chronicle_ApplyItemPlacement(jq(this));
            });

            //jq('li',timelineElements).css({"opacity":"1"});

        });
		
		
    jq.fn.chronicleDisplay = function (configuration) {

        chronicleEntries = this;
        var selectionCount = chronicleEntries.length;

        if (!chronicleEntries || selectionCount == 0) {
            //console.log('sorry, no data to process...');
            return;
        }else{
            displayCount = 1;

            chronicleSettings = jq.extend({
                //animationSpeed: 100, // example setting
                //shuffleSpeed: 200, // another example
                //spacing: 0,          //  should correspond to margin-bottom LI  jq('ul.mo-timeline > li')
                badge: 'ver_b',
                startBreakpoint: 'md',
                initialID: 0
            },configuration);

            chronicleDefaults = {
                calculationSpeed: 100,
                total : chronicleEntries.length,
                gridStyles : 'col-xs-12 col-sm-12 col-md-6  col-lg-6'
            };



            //  begin setup
            chronicleDivisions =  chronicle_DetermineDivisionCount();
            jq(chronicleEntries).addClass( chronicleDivisions.gridStyles );
            jq('.badge', chronicleEntries).addClass('visible-lg visible-md '+ chronicleSettings.badge);

            if( chronicleDivisions.columnNum == 1 ) {
                jq('.mo-timeline').removeClass('twocol');
            }else{
                if (jq('.timeline-wrapper').find('.twocol').length > 0){
                    //    no action needed
                } else{
                    jq('.mo-timeline').addClass('twocol');
                }
            }

            var indexPosition = 0;
            if (chronicleSettings.initialID > 0){
                jq(chronicleEntries).addClass( chronicleDivisions.gridStyles );
            }


            //  assign identifier to each list item -
            //  verify id existence before reassigning
            chronicleEntries.attr('id', function (itemIndex) {

                var currentItemId = this.id;
                if(currentItemId.length  > 0) {
                    return currentItemId;
                }else{
                    return 'cdT' + itemIndex;
                }

            });



            chronicle_InitializeLayout(chronicleEntries,indexPosition);


            if (typeof imagesLoaded !== 'undefined' && jq.isFunction( imagesLoaded )) {

                jq('.mo-timeline').imagesLoaded( function() {

                    chronicle_UpdateAllItems();

                });
            }


            jq(window).on('resize', function() {
                debounceExecution(function(){
                    chronicle_UpdateAllItems();
					chronicleDivisions =  chronicle_DetermineDivisionCount();
					if( chronicleDivisions.columnNum == 1 ) {
						jq('.mo-timeline').removeClass('twocol');
					}else{
						if (jq('.timeline-wrapper').find('.twocol').length > 0){
							//    no action
						} else{
							jq('.mo-timeline').addClass('twocol');
							console.log('this should not happen')
						}
					}
                }, 500, currentTimestamp.getTime())
            });
        }



    };
}( jQuery ));