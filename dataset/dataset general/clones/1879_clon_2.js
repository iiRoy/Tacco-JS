( function( jQueryReference ) {

    jQueryReference.fn.CloudRenderEngine = function( renderAreaSelector )
    {
        this.initialize = function( renderAreaSelector ) {

            this.canvasWidth = jQueryReference( renderAreaSelector ).width();
            this.canvasHeight = jQueryReference( renderAreaSelector ).height();

            // Verify if the current browser environment supports the HTML5 Canvas API.
            // Reference: http://diveintohtml5.org/detect.html#canvas for detection methods.
            var canvasSupportExists = !!document.createElement('canvas').getContext;
            
            if ( ! canvasSupportExists )
            {
                jQueryReference( renderAreaSelector ).html( '<br><br><center>This application mandates HTML5 Canvas capabilities, commonly found in browsers like Firefox, Safari, and Chrome.</center>' );
                return;
            }
        
            this.drawingSurface = this.generateCanvasElement( this.canvasWidth, this.canvasHeight );
            
            jQueryReference( renderAreaSelector )
                .clearContent()
                .attachElement( this.drawingSurface );

            var selfReference = this;

            this.animationTimer = setupInterval( function() { selfReference.animationTick(); }, 500 );
            
            this.configuration = {
                'baseColor': '#ffffff',
                'fontColor': '#000000',
                'fontStyle': 'Georgia, "Times New Roman", Serif',
                'minFontSize': 18,
                'maxFontSize': 72,
                'elementPadding': 2,
                'rotationMode': 'random',
                'maskGraphic': 'none',
                'maxPlacementAttempts': 1800,
                'minRadialDistance': 3,
                'maxRadialDistance': 5,
                'sortItemsByMagnitude': true,
                'maskTextContent': "MASK\nTEXT",
                'placementStrategy': 'spiral',
                'angularIncrement': ( Math.PI / 35 ),
                'renderSuspended': false,
                'renderTerminated': false,
                'idleTimeLimit': 3 * 60 * 1000,
                'highDpiFactor': 2.0
            };
                        
            this.wordItems = [];
            this.backgroundLayer = this.generateCanvasElement( this.canvasWidth, this.canvasHeight );
            this.highResLayer = this.generateCanvasElement( ( this.canvasWidth * this.configuration.highDpiFactor ), ( this.canvasHeight * this.configuration.highDpiFactor ) );
            this.maskLayer = this.generateCanvasElement( this.canvasWidth, this.canvasHeight );
            this.currentWordMask = this.generateCanvasElement( this.canvasWidth, this.canvasHeight );
            this.collisionTestLayer = this.generateCanvasElement( this.canvasWidth, this.canvasHeight );
            this.backgroundPixels = null;
            this.previousRenderWasSuspended = false;
            this.timeSinceLastPlacement = 0;
            this.endlessGeneration = false;
        };

        this.generateCanvasElement = function( surfaceWidth, surfaceHeight ) {
            return jQueryReference(
                '<canvas '
                + 'width="' + surfaceWidth + '" '
                + 'height="' + surfaceHeight + '"'
                + '></canvas>'
            );
        };

        this.startDrawingContext = function( targetCanvas ) {
            var gfxContext = targetCanvas.get(0).getContext('2d');
// Older Safari versions occasionally experience freezes during window closure,
// potentially linked to font rendering and context state saving. Removing the
// save/restore helps mitigate this, requiring more careful state management.
//            gfxContext.save();
            return gfxContext;
        };

        this.finishDrawingContext = function( gfxContext ) {
//            gfxContext.restore();
        };

        this.rgbaFromHex = function( hexValue, opacity ) {
            var rComp = ( hexValue >> 16 ) & 0xff;
            var gComp = ( hexValue >> 8 ) & 0xff;
            var bComp = ( hexValue >> 0 ) & 0xff;

            if ( typeof opacity === 'undefined' )
                opacity = 1.0;
                
            var colorString = 'rgba(';
            colorString += rComp;
            colorString += ', ';
            colorString += gComp;
            colorString += ', ';
            colorString += bComp;
            colorString += ', ';
            colorString += opacity;
            colorString += ')';
            
            return colorString;
        };

        this.animationTick = function() {
            this.renderFrame();
        };

        this.renderFrame = function() {
        
            var drawingSuspended = ( ( this.configuration.renderSuspended ) || ( this.configuration.renderTerminated ) );
            var prevSuspendedState = this.previousRenderWasSuspended;
            this.previousRenderWasSuspended = drawingSuspended;
            if ( drawingSuspended ) {
                if ( ! prevSuspendedState ) {
                    gfxContext = this.startDrawingContext( this.drawingSurface );
         
                    this.updateLayout( gfxContext );
         
                    gfxContext.clearRect( 0, 0, this.canvasWidth, this.canvasHeight );
                    gfxContext.drawImage( this.backgroundLayer.get(0), 0, 0, this.canvasWidth, this.canvasHeight );

                    this.finishDrawingContext( gfxContext );                
                }
                return;
            }

            if ( this.isRenderingInProgress ) {
                return;
            }
            this.isRenderingInProgress = true;
        
            gfxContext = this.startDrawingContext( this.drawingSurface );
 
            this.updateLayout( gfxContext );
 
            gfxContext.clearRect( 0, 0, this.canvasWidth, this.canvasHeight );
            gfxContext.drawImage( this.backgroundLayer.get(0), 0, 0, this.canvasWidth, this.canvasHeight );

            var currentElement = this.getCurrentWord();
            if ( currentElement ) {

                var elementColor = this.configuration.fontColor;
                if ( elementColor == 'rainbow' ) {
                    elementColor = this.generateRainbowColor();
                }

                gfxContext.fillStyle = elementColor;            
                gfxContext.globalCompositeOperation = 'source-over';

                this.drawTextElement( gfxContext, currentElement );
            }
            
            this.finishDrawingContext( gfxContext );
            
            this.isRenderingInProgress = false;
        };
        
        this.initFromTextData = function( inputText ) {
        
            var frequencyMap = this.analyzeTextFrequencies( inputText );
        
            this.initFromFrequencyMap( frequencyMap );
        };
        
        this.analyzeTextFrequencies = function( inputText ) {
        
            var commonTerms = [ "a", "about", "above", "accordingly", "after",
                "again", "against", "ah", "all", "also", "although", "always", "am", "among", "amongst", "an",
                "and", "any", "anymore", "anyone", "are", "as", "at", "away", "be", "been",
                "begin", "beginning", "beginnings", "begins", "begone", "begun", "being",
                "below", "between", "but", "by", "ca", "can", "cannot", "come", "could",
                "did", "do", "doing", "during", "each", "either", "else", "end", "et",
                "etc", "even", "ever", "far", "ff", "following", "for", "from", "further", "furthermore",
                "get", "go", "goes", "going", "got", "had", "has", "have", "he", "her",
                "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into",
                "is", "it", "its", "itself", "last", "lastly", "less", "many", "may", "me",
                "might", "more", "must", "my", "myself", "near", "nearly", "never", "new",
                "next", "no", "not", "now", "o", "of", "off", "often", "oh", "on", "only",
                "or", "other", "otherwise", "our", "ourselves", "out", "over", "perhaps",
                "put", "puts", "quite", "s", "said", "saw", "say", "see", "seen", "shall",
                "she", "should", "since", "so", "some", "such", "t", "than", "that", "the",
                "their", "them", "themselves", "then", "there", "therefore", "these", "they",
                "this", "those", "though", "throughout", "thus", "to", "too",
                "toward", "unless", "until", "up", "upon", "us", "ve", "very", "was", "we",
                "were", "what", "whatever", "when", "where", "which", "while", "who",
                "whom", "whomever", "whose", "why", "with", "within", "without", "would",
                "yes", "your", "yours", "yourself", "yourselves", "rt", "http", "www", "com", "you", "de",
                "re", "ll", "ex", "didn", "mr", "mrs"
            ];
            
            var commonTermsRegex = new RegExp( '\\s((' + commonTerms.join( '|' ) + ')\\s)+', 'gi' );
            var nonAlphaNumericRegex = /[^a-z0-9]/gi;
            var multiSpaceRegex = / +/gi;
            var singleCharRegex = / [a-z0-9] /gi;
            
            var processedText = inputText.replace( nonAlphaNumericRegex, ' ' ).replace( commonTermsRegex, ' ' ).replace( multiSpaceRegex, ' ' ).replace( singleCharRegex, ' ' );
            var tokenizedWords = processedText.split( ' ' );
            
            var frequencyMap = {};
            for ( var tokenIndex in tokenizedWords ) {
                var currentWordToken = tokenizedWords[ tokenIndex ];
             
                if ( typeof frequencyMap[ currentWordToken ] === 'undefined' ) {
                    frequencyMap[ currentWordToken ] = 0;
                }
                
                frequencyMap[ currentWordToken ] += 1;
            }
        
            return frequencyMap;
        };
        
        this.initFromFrequencyMap = function( frequencyMap ) {
            var peakFrequency = 2;
            
            for ( var term in frequencyMap ) {
                var termFrequency = frequencyMap[ term ];
                if ( termFrequency > peakFrequency ) {
                    peakFrequency = termFrequency;
                }
            }
            
            var minTextDimension = parseInt( this.configuration.minFontSize );
            var maxTextDimension = parseInt( this.configuration.maxFontSize );
            var dimensionRange = ( maxTextDimension - minTextDimension );
            
            var sizedTerms = [];
            for ( var term in frequencyMap ) {
                var termFrequency = frequencyMap[ term ];
                var relativeFrequency = ( ( termFrequency - 1 ) / ( peakFrequency - 1 ) );
                
                var termSize = minTextDimension + ( relativeFrequency * dimensionRange );
                sizedTerms.push( { 'text': term, 'size': termSize } );
            }
            
            this.initFromSizedTerms( sizedTerms, false );
        };

        this.initFromShortText = function( inputPhrase ) {

            var frequencyMap = this.analyzeTextFrequencies( inputPhrase );

            var minTextDimension = parseInt( this.configuration.minFontSize );
            var maxTextDimension = parseInt( this.configuration.maxFontSize );
            var dimensionRange = ( maxTextDimension - minTextDimension );
            
            var sizedTerms = [];
            for ( var term in frequencyMap ) {
                var relativeFrequency = Math.random();                    
                relativeFrequency *= relativeFrequency;
                relativeFrequency *= relativeFrequency;
                
                var termSize = minTextDimension + ( relativeFrequency * dimensionRange );
                sizedTerms.push( { 'text': term, 'size': termSize } );
            }
            
            this.initFromSizedTerms( sizedTerms, true );
        };

        this.updateLayout = function() {

            var midX = ( this.canvasWidth / 2 );
            var midY = ( this.canvasHeight / 2 );
            var itemPadding = this.configuration.elementPadding;
            var placementMethod = this.configuration.placementStrategy;
            
            while ( true ) {

                var currentElement = this.getCurrentWord();
                if ( ! currentElement ) {
                    break;
                }
                
                var minDist = this.configuration.minRadialDistance * 1;
                var maxDist = this.configuration.maxRadialDistance * 1;

                if ( currentElement.attemptCount == 0 ) {
                
                    if ( placementMethod == 'outwards' ) {                
                
                        var placementAngle = ( Math.random() * Math.PI * 2 ) - Math.PI;
                        var radialDistance = Math.randomRange( minDist, maxDist, 0.01 );
                        
                        currentElement.stepX = Math.cos( placementAngle ) * radialDistance;
                        currentElement.stepY = Math.sin( placementAngle ) * radialDistance;

                        currentElement.posX = ( midX + currentElement.stepX );
                        currentElement.posY = ( midY + currentElement.stepY );
                    
                    } else if ( placementMethod == 'spiral' ) {

                        currentElement.placementAngle = ( Math.random() * Math.PI * 2 ) - Math.PI;
                        currentElement.angleStep = ( Math.random() < 0.5 ) ? ( Math.PI / 20 ) : ( -Math.PI / 20 );
                        currentElement.distanceStep = 0.3;
                        currentElement.radialDistance = currentElement.distanceStep;
                        
                        var deltaX = currentElement.radialDistance * Math.cos( currentElement.placementAngle );
                        var deltaY = currentElement.radialDistance * Math.sin( currentElement.placementAngle );
                        
                        currentElement.posX = ( midX + deltaX );
                        currentElement.posY = ( midY + deltaY );
                        
                    } else {

                        currentElement.posX = Math.randomRange( 0, this.canvasWidth - 1 );
                        currentElement.posY = Math.randomRange( 0, this.canvasHeight - 1 );                    
                    }
                    
                    currentElement.elementRotation = this.getWordRotation();
                }
                
                var startTrialTime = new Date().getTime();
                var successfulPlacementTime = startTrialTime;
                
                while ( currentElement.attemptCount < this.configuration.maxPlacementAttempts ) {
                    
                    if ( this.canPlaceElement( currentElement ) ) {
                        break;
                    }

                    if ( placementMethod == 'random' ) {
                                    
                        currentElement.posX = Math.randomRange( 0, this.canvasWidth - 1 );
                        currentElement.posY = Math.randomRange( 0, this.canvasHeight - 1 );                    
                        currentElement.elementRotation = this.getWordRotation();
                    
                    } else {
                    
                        if ( placementMethod == 'outwards' ) {
                        
                            currentElement.posX += currentElement.stepX;
                            currentElement.posY += currentElement.stepY;
                        
                        } else {
                        
                            currentElement.placementAngle += currentElement.angleStep;
                            currentElement.radialDistance += currentElement.distanceStep;
                        
                            var deltaX = currentElement.radialDistance * Math.cos( currentElement.placementAngle );
                            var deltaY = currentElement.radialDistance * Math.sin( currentElement.placementAngle );
                            
                            currentElement.posX = ( midX + deltaX );
                            currentElement.posY = ( midY + deltaY );
                            currentElement.elementRotation = this.getWordRotation();
                        }


                        if ( placementMethod == 'outwards' ) {                
                        
                            if ( ( currentElement.posX < 0 ) || 
                                 ( currentElement.posX > this.canvasWidth ) ||
                                 ( currentElement.posY < 0 ) ||
                                 ( currentElement.posY > this.canvasHeight ) ) {
                                var placementAngle = ( Math.random() * Math.PI * 2 ) - Math.PI;
                                var radialDistance = Math.randomRange( minDist, maxDist, 0.01 );
                                
                                currentElement.stepX = Math.cos( placementAngle ) * radialDistance;
                                currentElement.stepY = Math.sin( placementAngle ) * radialDistance;

                                currentElement.posX = ( midX + currentElement.stepX );
                                currentElement.posY = ( midY + currentElement.stepY );
                            }
                            
                        } else if ( placementMethod == 'spiral' ) {

                            if ( currentElement.radialDistance > Math.max( ( this.canvasWidth / 2 ), ( this.canvasHeight / 2 ) ) ) {

                                currentElement.placementAngle = ( Math.random() * Math.PI * 2 ) - Math.PI;
                                currentElement.angleStep = ( Math.random() < 0.5 ) ? ( Math.PI / 20 ) : ( -Math.PI / 20 );
                                currentElement.distanceStep = 0.3;
                                currentElement.radialDistance = currentElement.distanceStep;
                                
                                var deltaX = currentElement.radialDistance * Math.cos( currentElement.placementAngle );
                                var deltaY = currentElement.radialDistance * Math.sin( currentElement.placementAngle );
                                
                                currentElement.posX = ( midX + deltaX );
                                currentElement.posY = ( midY + deltaY );
                                
                                currentElement.elementRotation = this.getWordRotation();
                            }
                        
                        }
                    }

                    currentElement.attemptCount += 1;

                    var currentTime = new Date().getTime();
                    var sinceStart = ( currentTime - startTrialTime );
                    if ( sinceStart > 250 ) {
                        this.timeSinceLastPlacement += sinceStart; 
                        if ( this.timeSinceLastPlacement > this.configuration.idleTimeLimit ) {
                            this.configuration.renderTerminated = true;
                        }
                        return;
                    }
                }
                
                // Only commit the element if a suitable position was found within the attempts limit.
                if ( currentElement.attemptCount < this.configuration.maxPlacementAttempts ) {
                    this.commitElementToLayout( currentElement );
                    this.timeSinceLastPlacement = 0;
                }
                        
                currentElement.isPlaced = true;                
            }
        };

        this.initFromSizedTerms = function( inputSizedTerms, endlessFlow ) {

            this.inputSizedTerms = inputSizedTerms;
            this.wordItems = [];
            this.configuration.renderSuspended = false;
            this.configuration.renderTerminated = false;
            this.endlessGeneration = endlessFlow;

            var maskGraphic = this.configuration.maskGraphic;
            if ( ( maskGraphic == 'none' ) || ( maskGraphic == 'text' ) ) {

                this.maskGraphic = null;
                this.proceedAfterMaskLoad();

            } else {
                this.maskGraphic = new Image();
    
                var pluginInstance = this;
                this.maskGraphic.onload = function() { pluginInstance.proceedAfterMaskLoad(); };
                this.maskGraphic.src = this.configuration.maskGraphic;
            }
        };
        
        this.proceedAfterMaskLoad = function() {

            this.isRenderingInProgress = false;

            var initialTermSizes = this.inputSizedTerms;
            for ( var termIdx in initialTermSizes ) {
                var termInfo = initialTermSizes[ termIdx ];
                termInfo.isPlaced = false;
                termInfo.attemptCount = 0;
                this.wordItems.push( termInfo );
            }

            if ( this.configuration.sortItemsByMagnitude ) {
                this.wordItems.arrange( function( itemA, itemB ) {
                    if ( itemA.size > itemB.size ) return -1;
                    else if ( itemA.size < itemB.size ) return 1;
                    else return 0; 
                } );
            }
            
            var drawContext = this.startDrawingContext( this.backgroundLayer );
            drawContext.fillStyle = this.configuration.baseColor;
            drawContext.fillRect( 0, 0, this.canvasWidth, this.canvasHeight );
            this.finishDrawingContext( drawContext );

            var drawContext = this.startDrawingContext( this.highResLayer );
            drawContext.fillStyle = this.configuration.baseColor;
            drawContext.fillRect( 0, 0, ( this.canvasWidth * this.configuration.highDpiFactor ), ( this.canvasHeight * this.configuration.highDpiFactor ) );
            this.finishDrawingContext( drawContext );

            var drawContext = this.startDrawingContext( this.maskLayer );
            drawContext.clearRect( 0, 0, this.canvasWidth, this.canvasHeight );
            if ( ( this.maskGraphic != null ) || ( this.configuration.maskGraphic == 'text' ) ) {
                drawContext.fillStyle = 'rgba(255, 255, 255, 1.0)';
                drawContext.fillRect( 0, 0, this.canvasWidth, this.canvasHeight );
                drawContext.fillStyle = '#000000';
                
                var currentMaskGraphic;
                var originalMaskWidth;
                var originalMaskHeight;
                if ( this.configuration.maskGraphic == 'text' ) {
                
                    var textLines = this.configuration.maskTextContent.split( "\n" );
                 
                    var baseFontSize = 64;
                    var textLineHeight = ( baseFontSize * 1.2 );