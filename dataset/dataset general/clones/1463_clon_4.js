var sliderInstancePrefix = "carouselInstanceID",
    instanceCounter = 0;

(function (jQ) {

    function CarouselPanelController(element, options) {
        this.elementHost = jQ(element);
        this.uniqueIdentifier = element.id || (sliderInstancePrefix + instanceCounter++);

        this.instanceSettings = jQ.extend({}, jQ.fn.pictureCarousel.defaults, options);
        this.segmentSequence = [];
        this.visualSources = [];
        this.destinationLinks = [];
        this.linkTargets = [];
        this.panelCaptions = [];
        this.panelAdvanceTimer = null;
        this.currentDisplayIndex = 0;
        this.segmentRevealTimer = null;
        this.activeSegmentIndex = 0;
        this.effectDirectionMultiplier = 1;
        this.isCurrentlyPaused = false;

        this.initializeSystem();
    }

    CarouselPanelController.prototype = {
        initializeSystem: function () {
            var settings = this.instanceSettings;
            var instanceId = this.uniqueIdentifier;

            this.elementHost.find('img').each(jQ.proxy(function (idx, imgElem) {
                var currentImg = jQ(imgElem);
                this.visualSources[idx] = currentImg.attr('src');
                this.destinationLinks[idx] = currentImg.parent('a').attr('href') || '';
                this.linkTargets[idx] = currentImg.parent('a').attr('target') || '';
                this.panelCaptions[idx] = currentImg.next('span').html() || '';
                currentImg.hide();
                currentImg.next('span').hide();
            }, this));

            this.elementHost.css({
                'background-image': 'url("' + this.visualSources[0] + '")',
                'width': settings.panelWidth,
                'height': settings.panelHeight,
                'position': 'relative',
                'background-position': 'top left'
            }).wrap("<div class='carousel-container' id='carousel-wrapper-" + instanceId + "' />");

            this.elementHost.append("<div class='crsl-caption' id='crsl-caption-" + instanceId + "' style='position: absolute; bottom:0; left: 0; z-index: 1000;'></div>");

            this.constructDisplaySegments();
            this.constructControls();

            if (settings.autoAdvance) {
                this.scheduleNextPanelChange();
            }

            if (this.panelCaptions[this.currentDisplayIndex]) {
                jQ('#crsl-caption-' + instanceId).html(this.panelCaptions[this.currentDisplayIndex]).css({ 'opacity': 0 }).animate({ 'opacity': settings.captionOpacity }, settings.captionFadeDuration);
            }
        },

        constructDisplaySegments: function () {
            var settings = this.instanceSettings;
            var instanceId = this.uniqueIdentifier;

            var segmentBaseWidth = Math.floor(settings.panelWidth / settings.horizontalSegments);
            var segmentBaseHeight = Math.floor(settings.panelHeight / settings.verticalSegments);

            var currentSegmentWidth = segmentBaseWidth;
            var currentSegmentHeight = segmentBaseHeight;
            var pathIndex = 0;
            var currentLeftOffset = 0;
            var currentTopOffset = 0;

            var horizontalRemainder = settings.panelWidth - settings.horizontalSegments * segmentBaseWidth;
            var verticalRemainder = settings.panelHeight - settings.verticalSegments * segmentBaseHeight;

            var tempHorizontalRemainder = horizontalRemainder;
            var tempVerticalRemainder = verticalRemainder;

            var segmentHtml = '';

            for (var row = 1; row <= settings.verticalSegments; row++) {
                tempHorizontalRemainder = horizontalRemainder;

                if (tempVerticalRemainder > 0) {
                    tempVerticalRemainder--;
                    currentSegmentHeight = segmentBaseHeight + 1;
                } else {
                    currentSegmentHeight = segmentBaseHeight;
                }

                for (var col = 1; col <= settings.horizontalSegments; col++) {
                    if (tempHorizontalRemainder > 0) {
                        tempHorizontalRemainder--;
                        currentSegmentWidth = segmentBaseWidth + 1;
                    } else {
                        currentSegmentWidth = segmentBaseWidth;
                    }

                    this.segmentSequence[pathIndex] = row + "" + col;
                    pathIndex++;

                    var segmentTag = settings.panelDestinations ? 'a' : 'div';
                    segmentHtml += "<" + segmentTag + " class='crsl-segment crsl-segment-" + instanceId + "' id='crsl-segment-" + instanceId + row + col + "' style='width:" + currentSegmentWidth + "px; height:" + currentSegmentHeight + "px; float: left; position: absolute; background-position: " + (-currentLeftOffset) + "px " + (-currentTopOffset) + "px; left: " + currentLeftOffset + "px; top: " + currentTopOffset + "px;'></" + segmentTag + ">";

                    currentLeftOffset += currentSegmentWidth;
                }

                currentTopOffset += currentSegmentHeight;
                currentLeftOffset = 0;
            }

            this.elementHost.append(segmentHtml);

            var allSegments = jQ('.crsl-segment-' + instanceId);
            var captionBar = jQ('#crsl-caption-' + instanceId);
            var navigationWrapper = jQ('#crsl-nav-controls-' + instanceId);

            if (!settings.alwaysShowNavigation) {
                allSegments.add(captionBar).on('mouseover', jQ.proxy(function () {
                    navigationWrapper.show();
                }, this)).on('mouseout', jQ.proxy(function () {
                    navigationWrapper.hide();
                }, this));
            }

            if (settings.pauseOnHover) {
                allSegments.add(captionBar).on('mouseover', jQ.proxy(function () {
                    this.isCurrentlyPaused = true;
                }, this)).on('mouseout', jQ.proxy(function () {
                    this.isCurrentlyPaused = false;
                }, this));
            }
        },

        scheduleNextPanelChange: function () {
            var settings = this.instanceSettings;

            clearInterval(this.panelAdvanceTimer);
            var nextDelay = settings.transitionDelay + settings.horizontalSegments * settings.verticalSegments * settings.segmentDelay;
            this.panelAdvanceTimer = setInterval(jQ.proxy(function () { this.changePanel(); }, this), nextDelay);
        },

        changePanel: function (directionOrIndex) {
            var settings = this.instanceSettings;
            var instanceId = this.uniqueIdentifier;

            if (this.isCurrentlyPaused === true) {
                return;
            }

            this.determineAnimationPattern();

            this.activeSegmentIndex = 0;
            clearInterval(this.segmentRevealTimer);
            this.segmentRevealTimer = setInterval(jQ.proxy(function () {
                this.revealSegment(this.segmentSequence[this.activeSegmentIndex]);
            }, this), settings.segmentDelay);

            var nextVisualSource = this.visualSources[this.currentDisplayIndex];
            this.elementHost.css({ 'background-image': 'url("' + nextVisualSource + '")' });

            if (typeof (directionOrIndex) === "undefined") {
                this.currentDisplayIndex++;
            } else if (directionOrIndex === 'back') {
                this.currentDisplayIndex--;
            } else {
                this.currentDisplayIndex = directionOrIndex;
            }

            if (this.currentDisplayIndex === this.visualSources.length) {
                this.currentDisplayIndex = 0;
            }

            if (this.currentDisplayIndex === -1) {
                this.currentDisplayIndex = this.visualSources.length - 1;
            }

            jQ('.crsl-nav-button-' + instanceId).removeClass('crsl-active-button');
            jQ('#crsl-nav-button-' + instanceId + "-" + (this.currentDisplayIndex + 1)).addClass('crsl-active-button');

            var currentCaption = this.panelCaptions[this.currentDisplayIndex];
            var captionElement = jQ('#crsl-caption-' + instanceId);
            if (currentCaption) {
                captionElement.css({ 'opacity': 0 }).animate({ 'opacity': settings.captionOpacity }, settings.captionFadeDuration);
                captionElement.html(currentCaption);
            } else {
                captionElement.css('opacity', 0);
            }
        },

        revealSegment: function (segmentIdSuffix) {
            var settings = this.instanceSettings;
            var instanceId = this.uniqueIdentifier;

            var currentVisualIdx = this.currentDisplayIndex;
            var segmentLink = this.destinationLinks[currentVisualIdx];
            var segmentTarget = this.linkTargets[currentVisualIdx];

            jQ('.crsl-segment-' + instanceId).attr('href', segmentLink).attr('target', segmentTarget);

            if (this.activeSegmentIndex === settings.horizontalSegments * settings.verticalSegments) {
                clearInterval(this.segmentRevealTimer);
                return;
            }

            jQ('#crsl-segment-' + instanceId + segmentIdSuffix).css({ opacity: 0, 'background-image': 'url("' + this.visualSources[currentVisualIdx] + '")' });
            jQ('#crsl-segment-' + instanceId + segmentIdSuffix).animate({ opacity: 1 }, 300);
            this.activeSegmentIndex++;
        },

        constructControls: function () {
            var settings = this.instanceSettings;
            var instanceId = this.uniqueIdentifier;
            var wrapperElement = jQ('#carousel-wrapper-' + instanceId);

            if (settings.showDirectionalControls) {
                wrapperElement.append("<div id='crsl-nav-controls-" + instanceId + "'></div>");
                var navControls = jQ('#crsl-nav-controls-' + instanceId);

                if (!settings.alwaysShowNavigation) {
                    navControls.hide();
                }

                navControls.append("<a href='#' id='crsl-prev-btn-" + instanceId + "' class='crsl-prev-btn'>" + settings.previousText + "</a>");
                navControls.append("<a href='#' id='crsl-next-btn-" + instanceId + "' class='crsl-next-btn'>" + settings.nextText + "</a>");

                jQ('#crsl-prev-btn-' + instanceId).css({
                    'position': 'absolute',
                    'top': settings.panelHeight / 2 - 15,
                    'left': 0,
                    'z-index': 1001,
                    'line-height': '30px',
                    'opacity': settings.captionOpacity
                }).on('click', jQ.proxy(function (evt) {
                    evt.preventDefault();
                    this.changePanel('back');
                    this.scheduleNextPanelChange();
                }, this)).on('mouseover', jQ.proxy(function () { jQ('#crsl-nav-controls-' + instanceId).show(); }, this));

                jQ('#crsl-next-btn-' + instanceId).css({
                    'position': 'absolute',
                    'top': settings.panelHeight / 2 - 15,
                    'right': 0,
                    'z-index': 1001,
                    'line-height': '30px',
                    'opacity': settings.captionOpacity
                }).on('click', jQ.proxy(function (evt) {
                    evt.preventDefault();
                    this.changePanel();
                    this.scheduleNextPanelChange();
                }, this)).on('mouseover', jQ.proxy(function () { jQ('#crsl-nav-controls-' + instanceId).show(); }, this));

                navControls.find('a').on('mouseout', jQ.proxy(function () {
                    if (!settings.alwaysShowNavigation) {
                        navControls.hide();
                    }
                    this.isCurrentlyPaused = false;
                }, this));
            }

            if (settings.showPanelIndicators) {
                jQ("<div id='crsl-buttons-wrap-" + instanceId + "' class='crsl-buttons-wrap'></div>").appendTo(wrapperElement);
                var indicatorWrapper = jQ('#crsl-buttons-wrap-' + instanceId);

                for (var btnNum = 1; btnNum <= this.visualSources.length; btnNum++) {
                    indicatorWrapper.append("<a href='#' class='crsl-nav-button-" + instanceId + "' id='crsl-nav-button-" + instanceId + "-" + btnNum + "'>" + btnNum + "</a>");
                }

                indicatorWrapper.find('.crsl-nav-button-' + instanceId).each(jQ.proxy(function (idx, btnElem) {
                    jQ(btnElem).on('click', jQ.proxy(function (evt) {
                        jQ('.crsl-nav-button-' + instanceId).removeClass('crsl-active-button');
                        jQ(evt.currentTarget).addClass('crsl-active-button');
                        evt.preventDefault();
                        this.changePanel(idx);
                        this.scheduleNextPanelChange();
                    }, this));
                }, this));

                indicatorWrapper.css({
                    'left': '50%',
                    'margin-left': -this.visualSources.length * 15 / 2 - 5,
                    'position': 'relative'
                });
            }
        },

        determineAnimationPattern: function () {
            var settings = this.instanceSettings;
            var availableEffects = ['randomize', 'spiral', 'diagonal', 'straight'];
            var chosenEffect;

            if (settings.effectStyle === '') {
                chosenEffect = availableEffects[Math.floor(Math.random() * (availableEffects.length))];
            } else {
                chosenEffect = settings.effectStyle;
            }

            this.segmentSequence = [];

            var effectMap = {
                'randomize': this.applyRandomEffect,
                'diagonal': this.applyDiagonalEffect,
                'spiral': this.applySpiralEffect,
                'straight': this.applyStraightEffect
            };

            if (effectMap[chosenEffect]) {
                effectMap[chosenEffect].call(this);
            } else {
                this.applyStraightEffect.call(this);
            }

            this.effectDirectionMultiplier *= -1;

            if (this.effectDirectionMultiplier > 0) {
                this.segmentSequence.reverse();
            }
        },

        shuffleArrayElements: function (arr) {
            var currentIdx = arr.length;
            var randomIdx, tempValue;

            while (currentIdx !== 0) {
                randomIdx = Math.floor(Math.random() * currentIdx);
                currentIdx--;

                tempValue = arr[currentIdx];
                arr[currentIdx] = arr[randomIdx];
                arr[randomIdx] = tempValue;
            }
            return arr;
        },

        applyRandomEffect: function () {
            var settings = this.instanceSettings;
            var pathIndex = 0;
            for (var row = 1; row <= settings.verticalSegments; row++) {
                for (var col = 1; col <= settings.horizontalSegments; col++) {
                    this.segmentSequence[pathIndex] = row + "" + col;
                    pathIndex++;
                }
            }
            this.shuffleArrayElements(this.segmentSequence);
        },

        applySpiralEffect: function () {
            var settings = this.instanceSettings;

            var numRows = settings.verticalSegments,
                numCols = settings.horizontalSegments,
                rowCursor = 1,
                colCursor = 1,
                direction = 0,
                elementCount = 0;

            var currentNumElements;
            var continueSpiral = true;

            while (continueSpiral) {
                currentNumElements = (direction === 0 || direction === 2) ? numCols : numRows;

                for (var i = 1; i <= currentNumElements; i++) {
                    this.segmentSequence[elementCount] = rowCursor + "" + colCursor;
                    elementCount++;

                    if (i !== currentNumElements) {
                        switch (direction) {
                            case 0: colCursor++; break;
                            case 1: rowCursor++; break;
                            case 2: colCursor--; break;
                            case 3: rowCursor--; break;
                        }
                    }
                }

                direction = (direction + 1) % 4;

                switch (direction) {
                    case 0: numCols--; colCursor++; break;
                    case 1: numRows--; rowCursor++; break;
                    case 2: numCols--; colCursor--; break;
                    case 3: numRows--; rowCursor--; break;
                }

                if (numCols <= 0 || numRows <= 0) {
                    continueSpiral = false;
                }
            }
        },

        applyDiagonalEffect: function () {
            var settings = this.instanceSettings;

            var numRows = settings.verticalSegments,
                numCols = settings.horizontalSegments,
                pathCount = 0,
                startRow = 1,
                currentSum = 1;

            var continueDiagonal = true;

            while (continueDiagonal) {
                for (var r = startRow; r <= currentSum; r++) {
                    var c = currentSum - r + 1;
                    if (r >= 1 && r <= numRows && c >= 1 && c <= numCols) {
                        this.segmentSequence[pathCount] = r + '' + c;
                        pathCount++;
                    }
                }

                currentSum++;

                if (startRow <= numRows && currentSum > numCols) {
                    startRow++;
                }

                if (startRow > numRows && currentSum > (numRows + numCols)) {
                    continueDiagonal = false;
                }
            }
        },

        applyStraightEffect: function () {
            var settings = this.instanceSettings;
            var pathIndex = 0;
            for (var row = 1; row <= settings.verticalSegments; row++) {
                for (var col = 1; col <= settings.horizontalSegments; col++) {
                    this.segmentSequence[pathIndex] = row + '' + col;
                    pathIndex++;
                }
            }
        }
    };

    jQ.fn.pictureCarousel = function (options) {
        return this.each(function () {
            if (!jQ.data(this, 'carouselInstance')) {
                jQ.data(this, 'carouselInstance', new CarouselPanelController(this, options));
            }
        });
    };

    jQ.fn.pictureCarousel.defaults = {
        panelWidth: 560,
        panelHeight: 315,
        horizontalSegments: 7,
        verticalSegments: 5,
        transitionDelay: 3000,
        segmentDelay: 50,
        effectStyle: '',
        panelDestinations: true,
        showDirectionalControls: true,
        showPanelIndicators: true,
        previousText: 'prev',
        nextText: 'next',
        captionOpacity: 0.8,
        captionFadeDuration: 500,
        alwaysShowNavigation: false,
        pauseOnHover: true,
        autoAdvance: true
    };

})(jQuery);