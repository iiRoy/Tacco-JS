systemManager = {

    componentOrder: [],
    assetBatch: [],
    totalGraphicsCount: 0,
    loadedGraphicsCount: 0,
    graphicLoadErrors: {},

    componentKeys: [],
    componentKeyLength: 0,

    environmentObject: {},
    activeLocationIdentifier: null,
    scrollOffsetRange: 9000000,
    
    //  These dimensions are stored here for rapid retrieval,
    //  as they are frequently referenced during visual
    //  effect sequences and transitions.
    viewAreaWidth: null,
    viewAreaHeight: null,
    containerDisplayWidth: null,
    containerDisplayHeight: null,

    isAreaLoading: true,
    currentAssetLoading: null,
    acquisitionTimestamps: {
        begin: null,
        finish: null
    },

    initializeSystem: function(locationId) {

        //  Update the maximum scrollable range whenever the viewport is resized
        $(window).on('resize', function() {
            try {
                systemManager.containerDisplayWidth = $('.display_container').width();
                systemManager.containerDisplayHeight = $('.display_container').height();
            } catch(issue) {
                //  No operation, error suppressed
            }
        });
        systemManager.containerDisplayWidth = $('.display_container').width();
        systemManager.containerDisplayHeight = $('.display_container').height();

        //  Initiate the loading process for the specified area
        this.fetchArea(locationId);

        //  Perform character-specific initialization
        avatar.setupSystem();

    },


    /*
    This routine is designed to load the next environment data.
    */
    fetchArea: function(locationId) {


        systemManager.acquisitionTimestamps.begin = new Date();

        //  Store the identifier of the currently active location
        this.activeLocationIdentifier = locationId;

        //  Begin fading out the current drawing surface.
        //  Its contents will be cleared once the new area is ready.
        $('.drawing_surface').stop(true, false);
        $('.drawing_surface').fadeTo(1300, 0.15);
        $('.area_name_display').text('');
        $('.avatar_wrapper').remove();
        $('.other_avatar_wrappers').remove();
        $('.chat_feed_list').empty();
        avatar.networkedAvatars = {};
        avatar.isReady = false;
        $('.navigation_links').empty();

        //  Clear the queues for visual components and graphic assets
        this.componentOrder = [];
        this.assetBatch = [];

        //  Given that this project is hosted on GitHub, without a dedicated
        //  backend for server-side processing, we utilize a .callback.json file
        //  that includes an embedded callback to the root retrieveSceneData() function.
        //  In a live production environment, a server-side script would typically
        //  retrieve the .json file and return it with a proper
        //  callback mechanism.
        //  NOTE: If you were developing a custom Game client,
        //  you could directly load files from GitHub using the following method:
        //  $.getScript('http://revdancatt.github.io/CAT422-glitch-location-viewer/locations/' + locationId + '.callback.json');
        //  This approach avoids complexities related to cross-domain requests.
        //  Indicate that an area is currently in the loading state.
        this.isAreaLoading = true;
        $.getScript('http://revdancatt.github.io/CAT422-glitch-location-viewer/locations/' + locationId + '.callback.json');

    },


    //  Establishes the main display canvas and applies its initial background gradient.
    configureCanvas: function() {

        var currentEnvironment = this.environmentObject;

        document.title = 'MVURXI : ' + currentEnvironment.title;
        $('.area_name_display').text(currentEnvironment.title);

        //  Halt any ongoing animations on the drawing surface, clear its content,
        //  and initiate the refill process.
        $('.drawing_surface').stop(true, false);
        $('.drawing_surface').empty();
        window.scrollTo(0,0);
        $('.drawing_surface').fadeTo(650, 1);
        $('.progress_indicator').fadeIn(650);

        //  The first step involves configuring the display surface, so we determine its dimensions and gradient.
        $('.drawing_surface').css({
            position: 'absolute',
            overflow: 'hidden',
            width: parseInt(currentEnvironment.layout.rightBound, 10) - parseInt(currentEnvironment.layout.leftBound, 10),
            height: parseInt(currentEnvironment.layout.bottomBound, 10) - parseInt(currentEnvironment.layout.topBound, 10),
            'z-index': -1000
        });
        systemManager.viewAreaWidth = parseInt(currentEnvironment.layout.rightBound, 10) - parseInt(currentEnvironment.layout.leftBound, 10);
        systemManager.viewAreaHeight = parseInt(currentEnvironment.layout.bottomBound, 10) - parseInt(currentEnvironment.layout.topBound, 10);

        //  Prepare the gradient colors (while a more programmatic approach could be used,
        //  this explicit method ensures clarity for future maintainability).
        var topBlendColor = null;
        var bottomBlendColor = null;

        if (currentEnvironment.colorBlend.upperColor >> 16 === 0 && currentEnvironment.colorBlend.upperColor >> 8 === 0 && (currentEnvironment.colorBlend.upperColor.length == 6 || currentEnvironment.colorBlend.upperColor.length == 4 || currentEnvironment.colorBlend.upperColor.length == 1)) {

            topBlendColor = currentEnvironment.colorBlend.upperColor;
            while (topBlendColor.length < 6) {
                topBlendColor = '0' + topBlendColor;
            }
            topBlendColor = '#' + topBlendColor;

            bottomBlendColor = currentEnvironment.colorBlend.lowerColor;
            while (bottomBlendColor.length < 6) {
                bottomBlendColor = '0' + bottomBlendColor;
            }
            bottomBlendColor = '#' + bottomBlendColor;

        } else {
            var rVal = ((currentEnvironment.colorBlend.upperColor >> 16) & 0xff);
            var gVal = ((currentEnvironment.colorBlend.upperColor >> 8) & 0xff);
            var bVal = ((currentEnvironment.colorBlend.upperColor) & 0xff);
            topBlendColor = 'rgb(' + rVal + ',' + gVal + ',' + bVal + ')';

            rVal = ((currentEnvironment.colorBlend.lowerColor >> 16) & 0xff);
            gVal = ((currentEnvironment.colorBlend.lowerColor >> 8) & 0xff);
            bVal = ((currentEnvironment.colorBlend.lowerColor) & 0xff);
            bottomBlendColor = 'rgb(' + rVal + ',' + gVal + ',' + bVal + ')';
        }

        $('.drawing_surface').css('background-image', '-webkit-gradient(linear, left top, left bottom, color-stop(0, ' + topBlendColor + '), color-stop(1, ' + bottomBlendColor + '))');
        $('.drawing_surface').css('background-image', '-o-linear-gradient(bottom, ' + topBlendColor + ' 0%, ' + bottomBlendColor + ' 100%)');
        $('.drawing_surface').css('background-image', '-moz-linear-gradient(bottom, ' + topBlendColor + ' 0%, ' + bottomBlendColor + ' 100%)');
        $('.drawing_surface').css('background-image', '-webkit-linear-gradient(bottom, ' + topBlendColor + ' 0%, ' + bottomBlendColor + ' 100%)');
        $('.drawing_surface').css('background-image', '-ms-linear-gradient(bottom, ' + topBlendColor + ' 0%, ' + bottomBlendColor + ' 100%)');
        $('.drawing_surface').css('background-image', 'linear-gradient(to bottom, ' + topBlendColor + ' 0%, ' + bottomBlendColor + ' 100%)');

        //  Refresh the values required for scene scrolling.
        systemManager.scrollOffsetRange = $('.drawing_surface').width() - window.innerWidth;
        systemManager.viewAreaWidth = $('.drawing_surface').width();

        //  Proceed to organize the visual components.
        this.isAreaLoading = false;
        this.arrangeElements();

    },


    //  This function arranges the visual components from furthest background to foreground,
    //  ensuring correct rendering order.
    //
    //  While Z-indexing handles layer order in CSS, this sorting is crucial for
    //  proper image composition.
    arrangeElements: function() {

        //  First, determine the minimum and maximum Z-index values present.
        //  (This approach, while not the most performant, prioritizes readability
        //  for future maintenance.)
        var minDepthIndex = 90000;
        var maxDepthIndex = -90000;
        var orderedComponentList = [];

        $.each(currentEnvironment.layout.visualComponents, function (elementKey, visualComponent) {
            if (visualComponent.depthIndex < minDepthIndex) minDepthIndex = visualComponent.depthIndex;
            if (visualComponent.depthIndex > maxDepthIndex) maxDepthIndex = visualComponent.depthIndex;
        });

        //  Populate the componentOrder array. This iterative method,
        //  though N*N complexity, has negligible overhead compared to
        //  the time required for asset loading.

        //  Iterate through Z-indexes, from back to front.
        this.componentOrder = [];
        for (var depthVal = minDepthIndex; depthVal <= maxDepthIndex; depthVal++) {
            //  Search through all components to find those matching
            //  the current Z-index.
            $.each(currentEnvironment.layout.visualComponents, function (elementKey, visualComponent) {
                if (visualComponent.depthIndex == depthVal) {
                    systemManager.componentOrder.push(elementKey);
                    systemManager.componentKeys.push(elementKey);
                }
            });
        }

        //  Now, create the HTML div elements that will house each component.
        var activeEffects = [];
        var overlayShade = null;
        var overlayStrength = null;
        var visualComponent = null;
        var elementKey = null;
        var newVisualComponent = null;
        var renderingSurface = null;
        var linkList = $('<ul>');

        //  Avoid over-optimizing this loop for now.
        for (var compIndex = 0; compIndex < this.componentOrder.length; compIndex++) {
            elementKey = this.componentOrder[compIndex];
            visualComponent = currentEnvironment.layout.visualComponents[elementKey];

            newVisualComponent = $('<div>');
            newVisualComponent.attr('id', elementKey);
            newVisualComponent.css({
                'position': 'absolute',
                'width': parseInt(visualComponent.componentWidth, 10),
                'height': parseInt(visualComponent.componentHeight, 10),
                'left': 0,
                'top': parseInt($('.drawing_surface').css('height'), 10) - parseInt(visualComponent.componentHeight, 10),
                'z-index': parseInt(visualComponent.depthIndex, 10)
            });

            //  Attach a canvas element to the visual component.
            renderingSurface = $('<canvas>').attr({id: elementKey + '_canvas', width: parseInt(visualComponent.componentWidth, 10), height: parseInt(visualComponent.componentHeight, 10)})
                .css({width: parseInt(visualComponent.componentWidth, 10), height: parseInt(visualComponent.componentHeight, 10)})
                .css({position: 'absolute', top: 0, left: 0});

            //  Evaluate and apply visual filters.
            //  TODO: IN THE FUTURE, WE AIM TO USE WEBGL SHADERS FOR PERFORMANCE ENHANCEMENT.
            activeEffects = [];
            overlayShade = null;
            overlayStrength = null;

            for (var effectType in visualComponent.effectSettings) {
                //  Translate filter values in a verbose manner until their behavior is fully understood.
                var effectParameter = visualComponent.effectSettings[effectType];

                if (effectType == 'lightIntensity') {

                    //  Negative values are straightforward: -100 implies complete blackness,
                    //  while -1 represents a minimal alteration. This aligns with our
                    //  brightness model ranging from 1.0 to 0.0 (e.g., -50 corresponds to 0.5).
                    if (effectParameter < 0) {
                        activeEffects.push('brightness(' + (1-(effectParameter/-100)) +')');
                    }

                    //  Achieving full brightness is more complex, as a true "white-out" effect
                    //  typically occurs around 100% CSS brightness, and even then, it follows a curve.
                    //  Future implementations might involve sine or logarithmic functions, but for now,
                    //  positive values are in the range of 1-20, pending determination of Glitch's
                    //  maximum brightness usage.
                    if (effectParameter > 0) {
                        activeEffects.push('brightness(' + (1+(effectParameter/100)) +')');
                        //  TODO: If brightness is excessively high, a "white-out" effect is desired;
                        //  this may require special handling.
                    }
                }

                //  Similar to brightness, but for contrast adjustment.
                if (effectType == 'colorSeparation') {
                    if (effectParameter < 0) {
                        activeEffects.push('contrast(' + (1-(effectParameter/-100)) +')');
                    }
                    if (effectParameter > 0) {
                        activeEffects.push('contrast(' + (1+(effectParameter/100)) +')');
                    }
                }

                //  And now for color vibrance.
                if (effectType == 'colorVibrancy') {
                    if (effectParameter < 0) {
                        activeEffects.push('saturation(' + (1-(effectParameter/-100)) +')');
                    }
                    if (effectParameter > 0) {
                        activeEffects.push('saturation(' + (1+(effectParameter/100)) +')');
                    }
                }

                //  NOTE: Blur is currently omitted due to performance impacts when applied
                //  to layers with multiple child elements. We will revisit this once
                //  canvas-based rendering is fully established.
                if (effectType == 'overlayShade') {
                    overlayShade = effectParameter;
                }
                if (effectType == 'overlayStrength') {
                    overlayStrength = effectParameter;
                }
                //  If both tint properties are present, apply the tint to the layer.
                //  (However, this is not currently implemented here).
                if (overlayShade !== null && overlayStrength !== null) {

                }

                //  NOTE: Tinting will also be deferred until canvas rendering,
                //  allowing individual elements to be tinted upon loading.
                if (effectType == 'focusBlur') {
                    //  Ah, the wonders of canvas!
                    //  activeEffects.push('blur('+ effectParameter + 'px)');
                }

            }

            //  Apply any collected filters to the canvas element.
            renderingSurface.css('filter', activeEffects.join(' '));
            renderingSurface.css('-webkit-filter', activeEffects.join(' '));
            renderingSurface.css('-moz-filter', activeEffects.join(' '));
            renderingSurface.css('-o-filter', activeEffects.join(' '));
            renderingSurface.css('-ms-filter', activeEffects.join(' '));

            //  Insert the canvas into its respective layer.
            newVisualComponent.append(renderingSurface);

            //  If this is the 'mid_plane' component, position the player avatar.
            if (elementKey == 'mid_plane') {
                var avatarDisplay = $('<div>').attr('class', 'avatar_wrapper').append(
                    $('<div>').attr('class', 'avatar_frame').append(
                        $('<div>').attr('class', 'avatar').css('background-image', 'url(img/glitchen/root_base.png)')
                    )
                );
                avatarDisplay.append($('<div>').addClass('nameTag').text(avatar.handle));

                //  For the time being, set the avatar's coordinates to half the layer's width
                //  and 300 pixels from the bottom.
                //  In future iterations, this will be dynamically retrieved from signpost connection data.
                avatar.setCoordinates(parseInt(visualComponent.componentWidth, 10) / 2 + 100, 100);
                newVisualComponent.append(avatarDisplay);

                //  Notify the network backend that the avatar has changed areas.
                if (avatar.isConnected) {
                    console.log('networkSocket.dispatch');
                    networkSocket.dispatch('enter_area', currentEnvironment.title, avatar.coordinates.x, avatar.coordinates.y, avatar.coordinates.direction);
                }

            }

            //  Append the newly created layer to the drawing surface.
            $('.drawing_surface').append(newVisualComponent);

            //  Process navigation markers for this layer.
            for (var sKey in visualComponent.navMarkers) {
                
                var navigationMarker = visualComponent.navMarkers[sKey];

                /*
                //  TODO: Investigate missing signpost assets.
                //  console.log(navigationMarker);
                //  Retrieve the signpost image and attach it to the layer.
                newGraphic = $('<img>');
                newGraphic.css({
                    'position': 'absolute',
                    'width': parseInt(navigationMarker.markerWidth, 10),
                    'height': parseInt(navigationMarker.markerHeight, 10),
                    'left': parseInt(navigationMarker.posX, 10) - (parseInt(navigationMarker.markerWidth, 10)/2),
                    'top': parseInt(navigationMarker.posY, 10) - (parseInt(navigationMarker.markerHeight, 10) * 1),
                    'z-index': 1000,
                    'transform': (navigationMarker.rotationAngle ? 'rotate(' + parseInt(navigationMarker.rotationAngle, 10) + 'deg)' : '') + (navigationMarker.horizontalFlip ? ' scaleX(-1)' : ''),
                    'transform-origin': 'bottom'
                });
                //  Signpost graphics are unavailable, so this section is commented out.
                //newGraphic.attr('src', 'img/scenery/' + navigationMarker.name + '.png');
                //newVisualComponent.append(newGraphic);
                */

                for (var cKey in navigationMarker.destinationLinks) {
                    var destinationLink = navigationMarker.destinationLinks[cKey];
                    var navLinkEntry = $('<li>').append($('<a>').attr({
                        linkId: destinationLink.targetSceneId.replace('L','G'),
                        destination: '#/' + destinationLink.targetSceneId
                    }).text(destinationLink.displayLabel));
                    linkList.append(navLinkEntry);
                }
            }
        }

        //  Populate the navigation section with exit links.
        $('.navigation_links').append($('<h2>').text('Pathways'));
        $('.navigation_links').append(linkList);
        $('.navigation_links a').on('click', function() {
            systemManager.fetchArea($(this).attr('linkId'));
        });

        //  Signal that the avatar is now fully loaded.
        avatar.isReady = true;

        //  Proceed to prepare all individual items within the layers.
        this.processAssets();
        

    },

    //  This function organizes all individual items according to their Z-index
    //  and integrates them into their respective layer objects, which are then
    //  added to the componentOrder.
    processAssets: function(orderedComponentKeys) {

        orderedComponentKeys = this.componentOrder;

        //  We will convert decorations into general visual items.
        var visualItems = null;
        var elementKey = null;
        var minDepthIndex = 90000;
        var maxDepthIndex = -90000;
        var decorationCount = 0;
        var decorationItem = null;
        var depthVal = null;

        //  Reset the maximum count of graphics to be loaded.
        this.totalGraphicsCount = 0;

        for (var compIndex = 0; compIndex < orderedComponentKeys.length; compIndex++) {
            elementKey = orderedComponentKeys[compIndex];
            
            //  Initialize a new array to store items in their sorted order.
            currentEnvironment.layout.visualComponents[elementKey].placedObjects = [];

            //  Re-evaluate the highest and lowest Z-indexes, similar to the previous step.
            minDepthIndex = 90000;
            maxDepthIndex = -90000;

            //  Determine the highest and lowest Z-index values for decorations.
            decorationCount = currentEnvironment.layout.visualComponents[elementKey].decorations.length;
            for (var decorIndex = 0; decorIndex < decorationCount; decorIndex++ ) {
                depthVal = currentEnvironment.layout.visualComponents[elementKey].decorations[decorIndex].depthIndex;
                if (depthVal < minDepthIndex) minDepthIndex = depthVal;
                if (depthVal > maxDepthIndex) maxDepthIndex = depthVal;
            }

            //  Iterate through all decorations again, from the
            //  lowest to the highest Z-index...
            //  ...only inserting the decoration that matches the current Z-order.
            //  
            //  This is an N^2 problem, but it executes only once during
            //  area loading, and its performance impact is expected to be
            //  minimal compared to the image loading phase.
            //
            //  We will benchmark this and optimize it later if necessary.
            //  Currently, the priority is canvas rendering and the graphic asset queue.
            //
            //  Loop through the Z-indexes from highest to lowest. This ensures
            //  that items closer to the foreground are pushed onto the stack first.
            //  When they are popped off, items from the background will be processed first.
            for (var itemDepth = maxDepthIndex; itemDepth >= minDepthIndex; itemDepth--) {
                for (decorIndex = 0; decorIndex < decorationCount; decorIndex++ ) {
                    if (currentEnvironment.layout.visualComponents[elementKey].decorations[decorIndex].depthIndex == itemDepth) {
                        currentEnvironment.layout.visualComponents[elementKey].placedObjects.push(currentEnvironment.layout.visualComponents[elementKey].decorations[decorIndex]);
                        this.totalGraphicsCount++;
                    }
                }
            }

            //  Remove the original decorations array to free up memory.
            delete currentEnvironment.layout.visualComponents[elementKey].decorations;


        }

        //  Set the current loaded graphics count to the total count for progress display.
        this.loadedGraphicsCount = this.totalGraphicsCount;

        //  Clear any previous records of failed image loads.
        this.graphicLoadErrors = {};

        //  TODO: Implement logic to add all exit points to the navigation list.
        this.acquireGraphics();

    },


    //  This function processes the remaining layers in our componentOrder.
    acquireGraphics: function() {

        //  If an area is currently loading, halt the image acquisition process.
        if (this.isAreaLoading) return;

        //  Verify if there are still layers being processed. If the queue is empty,