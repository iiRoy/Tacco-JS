var displaySettings = {
    loaderGraphicSource: "/images/loading.gif",
    closerGraphicSource: "/plugin_assets/redmine_sprints/images/closelabel.gif",
    backdropTransparency: 0.8, // controls transparency of shadow backdrop
    enableTransitions: true,   // toggles resizing animations
    transitionVelocity: 7,     // controls the speed of the image resizing animations (1=slowest and 10=fastest)
    frameThickness: 10         // if you adjust the padding in the CSS, you will need to update this variable
};

// Global operational state variables
var assetList = [];
var currentAssetIndex;
var backdropTransitionTime;
var frameAdjustTime;

if (displaySettings.enableTransitions) {
    backdropTransitionTime = 0.2; // shadow fade in/out duration
    if (displaySettings.transitionVelocity > 10) {
        displaySettings.transitionVelocity = 10;
    }
    if (displaySettings.transitionVelocity < 1) {
        displaySettings.transitionVelocity = 1;
    }
    frameAdjustTime = (11 - displaySettings.transitionVelocity) * 0.15;
} else {
    backdropTransitionTime = 0;
    frameAdjustTime = 0;
}

// Utility functions
var domUtils = {
    fetchDim: function(el) {
        return el.offsetWidth;
    },
    alterWidth: function(el, val) {
        el.style.width = val + "px";
    },
    alterHeight: function(el, val) {
        el.style.height = val + "px";
    },
    alterTop: function(el, val) {
        el.style.top = val + "px";
    },
    alterSource: function(el, src) {
        el.src = src;
    },
    alterHref: function(el, href) {
        el.href = href;
    },
    alterContent: function(el, content) {
        el.innerHTML = content;
    },
    pruneDuplicateAssets: function(arr) {
        const seen = new Set();
        return arr.filter(item => {
            const identifier = item[0];
            if (seen.has(identifier)) {
                return false;
            }
            seen.add(identifier);
            return true;
        });
    },
    clearAssetList: function(arr) {
        while (arr.length > 0) {
            arr.pop();
        }
    }
};

// Custom animation helper
function createTransition(element, property, start, end, duration, callback) {
    const unit = (property === 'opacity' || property === 'height' && element.style.height === 'auto') ? '' : 'px';
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const currentValue = start + (end - start) * progress;

        element.style[property] = currentValue + unit;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (callback) callback();
        }
    }
    requestAnimationFrame(animate);
}

// Main display system object (replacing Lightbox class)
var currentViewer = (function() {
    var viewerElements = {};
    var currentImagePreloader;

    function retrieveScrollOffset() {
        return [window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
                window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop];
    }

    function retrieveViewportSize() {
        var viewportWidth, viewportHeight;
        if (window.innerWidth) {
            viewportWidth = window.innerWidth;
            viewportHeight = window.innerHeight;
        } else if (document.documentElement && document.documentElement.clientWidth) {
            viewportWidth = document.documentElement.clientWidth;
            viewportHeight = document.documentElement.clientHeight;
        } else if (document.body && document.body.clientWidth) {
            viewportWidth = document.body.clientWidth;
            viewportHeight = document.body.clientHeight;
        }
        var pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                                  document.documentElement.clientHeight, document.documentElement.scrollHeight,
                                  document.documentElement.offsetHeight);
        return [viewportWidth, pageHeight, viewportHeight];
    }

    function obtainKeyCode(event) {
        return event.keyCode || event.which;
    }

    function delayExecution(milliseconds, callback) {
        setTimeout(callback, milliseconds);
    }

    function concealFormElements() {
        var selects = document.getElementsByTagName('select');
        for (var i = 0; i < selects.length; i++) {
            selects[i].style.visibility = 'hidden';
        }
    }

    function unhideFormElements() {
        var selects = document.getElementsByTagName('select');
        for (var i = 0; i < selects.length; i++) {
            selects[i].style.visibility = 'visible';
        }
    }

    function concealFlashContent() {
        var objects = document.getElementsByTagName('object');
        for (var i = 0; i < objects.length; i++) {
            objects[i].style.visibility = 'hidden';
        }
        var embeds = document.getElementsByTagName('embed');
        for (var i = 0; i < embeds.length; i++) {
            embeds[i].style.visibility = 'hidden';
        }
    }

    function unhideFlashContent() {
        var objects = document.getElementsByTagName('object');
        for (var i = 0; i < objects.length; i++) {
            objects[i].style.visibility = 'visible';
        }
        var embeds = document.getElementsByTagName('embed');
        for (var i = 0; i < embeds.length; i++) {
            embeds[i].style.visibility = 'visible';
        }
    }

    function activateKeyboardControls() {
        document.addEventListener('keydown', handleKeyPress);
    }

    function deactivateKeyboardControls() {
        document.removeEventListener('keydown', handleKeyPress);
    }

    function handleKeyPress(event) {
        var key = obtainKeyCode(event);
        if (key == 27) { // ESC
            event.preventDefault();
            viewerModule.terminateViewer();
        } else if (key == 190 || key == 39) { // . or right arrow
            event.preventDefault();
            viewerModule.advanceAsset();
        } else if (key == 188 || key == 37) { // , or left arrow
            event.preventDefault();
            viewerModule.regressAsset();
        }
    }

    var viewerModule = {
        prepareViewer: function() {
            var bodyElement = document.getElementsByTagName("body")[0];

            viewerElements.backdrop = document.createElement("div");
            viewerElements.backdrop.setAttribute('id', 'viewer-backdrop');
            viewerElements.backdrop.style.display = 'none';
            viewerElements.backdrop.addEventListener('click', this.terminateViewer.bind(this));
            bodyElement.appendChild(viewerElements.backdrop);

            viewerElements.mainDisplay = document.createElement("div");
            viewerElements.mainDisplay.setAttribute('id', 'media-display');
            viewerElements.mainDisplay.style.display = 'none';
            viewerElements.mainDisplay.addEventListener('click', function(e) {
                if (e.target.id === 'media-display') {
                    viewerModule.terminateViewer();
                }
            });
            bodyElement.appendChild(viewerElements.mainDisplay);
            
            viewerElements.outerFrame = document.createElement("div");
            viewerElements.outerFrame.setAttribute('id', 'outer-frame');
            viewerElements.mainDisplay.appendChild(viewerElements.outerFrame);

            if (displaySettings.enableTransitions) {
                domUtils.alterWidth(viewerElements.outerFrame, 250);
                domUtils.alterHeight(viewerElements.outerFrame, 250);
            } else {
                domUtils.alterWidth(viewerElements.outerFrame, 1);
                domUtils.alterHeight(viewerElements.outerFrame, 1);
            }

            viewerElements.innerContent = document.createElement("div");
            viewerElements.innerContent.setAttribute('id', 'inner-content');
            viewerElements.outerFrame.appendChild(viewerElements.innerContent);
            
            viewerElements.currentPicture = document.createElement("img");
            viewerElements.currentPicture.setAttribute('id', 'current-picture');
            viewerElements.innerContent.appendChild(viewerElements.currentPicture);
            
            viewerElements.navigationOverlay = document.createElement("div");
            viewerElements.navigationOverlay.setAttribute('id', 'navigation-overlay');
            viewerElements.innerContent.appendChild(viewerElements.navigationOverlay);
            
            viewerElements.previousButton = document.createElement("a");
            viewerElements.previousButton.setAttribute('id', 'previous-button');
            viewerElements.previousButton.setAttribute('href', '#');
            viewerElements.previousButton.addEventListener('click', function(e) { e.preventDefault(); viewerModule.regressAsset(); });
            viewerElements.navigationOverlay.appendChild(viewerElements.previousButton);
            
            viewerElements.nextButton = document.createElement("a");
            viewerElements.nextButton.setAttribute('id', 'next-button');
            viewerElements.nextButton.setAttribute('href', '#');
            viewerElements.nextButton.addEventListener('click', function(e) { e.preventDefault(); viewerModule.advanceAsset(); });
            viewerElements.navigationOverlay.appendChild(viewerElements.nextButton);
            
            viewerElements.loadingSpinner = document.createElement("div");
            viewerElements.loadingSpinner.setAttribute('id', 'loading-spinner');
            viewerElements.innerContent.appendChild(viewerElements.loadingSpinner);
            
            viewerElements.spinnerLink = document.createElement("a");
            viewerElements.spinnerLink.setAttribute('id', 'spinner-link');
            viewerElements.spinnerLink.setAttribute('href', '#');
            viewerElements.spinnerLink.addEventListener('click', function(e) { e.preventDefault(); viewerModule.terminateViewer(); });
            viewerElements.loadingSpinner.appendChild(viewerElements.spinnerLink);
            
            var loadingImage = document.createElement("img");
            loadingImage.setAttribute('src', displaySettings.loaderGraphicSource);
            viewerElements.spinnerLink.appendChild(loadingImage);

            viewerElements.detailsPanel = document.createElement("div");
            viewerElements.detailsPanel.setAttribute('id', 'details-panel');
            viewerElements.mainDisplay.appendChild(viewerElements.detailsPanel);

            viewerElements.detailsWrapper = document.createElement("div");
            viewerElements.detailsWrapper.setAttribute('id', 'details-wrapper');
            viewerElements.detailsPanel.appendChild(viewerElements.detailsWrapper);
            
            viewerElements.infoArea = document.createElement("div");
            viewerElements.infoArea.setAttribute('id', 'info-area');
            viewerElements.detailsWrapper.appendChild(viewerElements.infoArea);
            
            viewerElements.pictureCaption = document.createElement("span");
            viewerElements.pictureCaption.setAttribute('id', 'picture-caption');
            viewerElements.infoArea.appendChild(viewerElements.pictureCaption);
            
            viewerElements.countLabel = document.createElement("span");
            viewerElements.countLabel.setAttribute('id', 'count-label');
            viewerElements.infoArea.appendChild(viewerElements.countLabel);
            
            viewerElements.bottomControls = document.createElement("div");
            viewerElements.bottomControls.setAttribute('id', 'bottom-controls');
            viewerElements.detailsWrapper.appendChild(viewerElements.bottomControls);
            
            viewerElements.closeButton = document.createElement("a");
            viewerElements.closeButton.setAttribute('id', 'close-button');
            viewerElements.closeButton.setAttribute('href', '#');
            viewerElements.closeButton.addEventListener('click', function(e) { e.preventDefault(); viewerModule.terminateViewer(); });
            viewerElements.bottomControls.appendChild(viewerElements.closeButton);
            
            var closeImage = document.createElement("img");
            closeImage.setAttribute('src', displaySettings.closerGraphicSource);
            viewerElements.closeButton.appendChild(closeImage);

            var targetElements = document.querySelectorAll('a[href][rel*="lightbox"], area[href][rel*="lightbox"]');
            targetElements.forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    viewerModule.launchViewer(this);
                });
            });
        },

        launchViewer: function(triggerLink) {
            concealFormElements();
            concealFlashContent();

            var viewportDimensions = retrieveViewportSize();
            domUtils.alterHeight(viewerElements.backdrop, viewportDimensions[1]);
            createTransition(viewerElements.backdrop, 'opacity', 0, displaySettings.backdropTransparency, backdropTransitionTime);

            domUtils.clearAssetList(assetList);
            currentAssetIndex = 0;

            var linkRel = triggerLink.getAttribute('rel');
            var linkHref = triggerLink.getAttribute('href');
            var linkTitle = triggerLink.getAttribute('title');

            if (linkRel === 'lightbox') {
                assetList.push([linkHref, linkTitle]);
            } else {
                var relatedLinks = document.querySelectorAll('a[rel="' + linkRel + '"], area[rel="' + linkRel + '"]');
                relatedLinks.forEach(function(el) {
                    if (el.getAttribute('href')) {
                        assetList.push([el.getAttribute('href'), el.getAttribute('title')]);
                    }
                });
                assetList = domUtils.pruneDuplicateAssets(assetList);
                while (assetList[currentAssetIndex][0] !== linkHref) {
                    currentAssetIndex++;
                }
            }

            var scrollOffsets = retrieveScrollOffset();
            var displayTop = scrollOffsets[1] + (viewportDimensions[2] / 10);
            domUtils.alterTop(viewerElements.mainDisplay, displayTop);
            viewerElements.mainDisplay.style.display = 'block';

            this.switchAsset(currentAssetIndex);
        },

        switchAsset: function(assetNumber) {
            currentAssetIndex = assetNumber;

            if (displaySettings.enableTransitions) {
                viewerElements.loadingSpinner.style.display = 'block';
            }
            viewerElements.currentPicture.style.display = 'none';
            viewerElements.navigationOverlay.style.display = 'none';
            viewerElements.previousButton.style.display = 'none';
            viewerElements.nextButton.style.display = 'none';
            viewerElements.detailsPanel.style.display = 'none';
            viewerElements.countLabel.style.display = 'none';

            currentImagePreloader = new Image();
            currentImagePreloader.onload = function() {
                domUtils.alterSource(viewerElements.currentPicture, assetList[currentAssetIndex][0]);
                viewerModule.adjustFrameDimensions(currentImagePreloader.width, currentImagePreloader.height);
                currentImagePreloader.onload = null;
            };
            currentImagePreloader.src = assetList[currentAssetIndex][0];
        },

        adjustFrameDimensions: function(mediaWidth, mediaHeight) {
            var currentFrameWidth = domUtils.fetchDim(viewerElements.outerFrame);
            var currentFrameHeight = viewerElements.outerFrame.offsetHeight;

            var newFrameWidth = (mediaWidth + (displaySettings.frameThickness * 2));
            var newFrameHeight = (mediaHeight + (displaySettings.frameThickness * 2));

            var widthDifference = currentFrameWidth - newFrameWidth;
            var heightDifference = currentFrameHeight - newFrameHeight;

            const finalSteps = () => {
                domUtils.alterHeight(viewerElements.previousButton, mediaHeight);
                domUtils.alterHeight(viewerElements.nextButton, mediaHeight);
                domUtils.alterWidth(viewerElements.detailsPanel, newFrameWidth);
                this.displayAsset();
            };

            if (displaySettings.enableTransitions) {
                let animationQueue = [];

                if (heightDifference !== 0) {
                    animationQueue.push(function(next) {
                        createTransition(viewerElements.outerFrame, 'height', currentFrameHeight, newFrameHeight, frameAdjustTime, next);
                    });
                }

                if (widthDifference !== 0) {
                    animationQueue.push(function(next) {
                        delayExecution(frameAdjustTime * 1000, () => {
                            createTransition(viewerElements.outerFrame, 'width', currentFrameWidth, newFrameWidth, frameAdjustTime, next);
                        });
                    });
                }

                if (animationQueue.length > 0) {
                    let currentAnimationIndex = 0;
                    const runNextAnimation = () => {
                        if (currentAnimationIndex < animationQueue.length) {
                            animationQueue[currentAnimationIndex](() => {
                                currentAnimationIndex++;
                                runNextAnimation();
                            });
                        } else {
                            finalSteps();
                        }
                    };
                    runNextAnimation();
                } else {
                    delayExecution(navigator.appVersion.indexOf("MSIE") != -1 ? 250 : 100, finalSteps);
                }
            } else {
                domUtils.alterWidth(viewerElements.outerFrame, newFrameWidth);
                domUtils.alterHeight(viewerElements.outerFrame, newFrameHeight);
                delayExecution(navigator.appVersion.indexOf("MSIE") != -1 ? 250 : 100, finalSteps);
            }
        },

        displayAsset: function() {
            viewerElements.loadingSpinner.style.display = 'none';
            createTransition(viewerElements.currentPicture, 'opacity', 0, 1, frameAdjustTime, function() {
                viewerElements.currentPicture.style.display = 'block'; // Ensure it's visible after opacity animation
                viewerModule.refreshAssetInfo();
            });
            this.cacheAdjacentAssets();
        },

        refreshAssetInfo: function() {
            viewerElements.pictureCaption.style.display = 'block';
            domUtils.alterContent(viewerElements.pictureCaption, assetList[currentAssetIndex][1] || '');

            if (assetList.length > 1) {
                viewerElements.countLabel.style.display = 'block';
                domUtils.alterContent(viewerElements.countLabel, "Image " + (currentAssetIndex + 1) + " of " + assetList.length);
            }

            viewerElements.detailsPanel.style.display = 'block';
            viewerElements.detailsPanel.style.opacity = '0';
            viewerElements.detailsPanel.style.height = 'auto';
            const targetDetailsHeight = viewerElements.detailsPanel.offsetHeight;
            viewerElements.detailsPanel.style.height = '0px';

            const onDetailsAnimationComplete = () => {
                viewerElements.detailsPanel.style.height = 'auto';
                viewerElements.detailsPanel.style.overflow = '';
                var viewportDimensions = retrieveViewportSize();
                domUtils.alterHeight(viewerElements.backdrop, viewportDimensions[1]);
                viewerModule.refreshControls();
            };

            if (displaySettings.enableTransitions) {
                let slideComplete = false;
                let fadeComplete = false;

                const checkParallelComplete = () => {
                    if (slideComplete && fadeComplete) {
                        onDetailsAnimationComplete();
                    }
                };

                createTransition(viewerElements.detailsPanel, 'height', 0, targetDetailsHeight, frameAdjustTime, () => {
                    slideComplete = true;
                    checkParallelComplete();
                });

                createTransition(viewerElements.detailsPanel, 'opacity', 0, 1, frameAdjustTime, () => {
                    fadeComplete = true;
                    checkParallelComplete();
                });
            } else {
                viewerElements.detailsPanel.style.height = 'auto';
                viewerElements.detailsPanel.style.opacity = '1';
                onDetailsAnimationComplete();
            }
        },

        refreshControls: function() {
            viewerElements.navigationOverlay.style.display = 'block';

            if (assetList.length > 1) {
                if (currentAssetIndex > 0) {
                    viewerElements.previousButton.style.display = 'block';
                    domUtils.alterHref(viewerElements.previousButton, assetList[currentAssetIndex - 1][0]);
                } else {
                    viewerElements.previousButton.style.display = 'none';
                }

                if (currentAssetIndex < assetList.length - 1) {
                    viewerElements.nextButton.style.display = 'block';
                    domUtils.alterHref(viewerElements.nextButton, assetList[currentAssetIndex + 1][0]);
                } else {
                    viewerElements.nextButton.style.display = 'none';
                }
            } else {
                viewerElements.previousButton.style.display = 'none';
                viewerElements.nextButton.style.display = 'none';
            }
            activateKeyboardControls();
        },

        cacheAdjacentAssets: function() {
            var nextIndex = currentAssetIndex + 1;
            if (nextIndex < assetList.length) {
                var nextAssetPreloader = new Image();
                nextAssetPreloader.src = assetList[nextIndex][0];
            }

            var prevIndex = currentAssetIndex - 1;
            if (prevIndex >= 0) {
                var prevAssetPreloader = new Image();
                prevAssetPreloader.src = assetList[prevIndex][0];
            }
        },

        advanceAsset: function() {
            if (currentAssetIndex + 1 < assetList.length) {
                currentAssetIndex++;
                this.switchAsset(currentAssetIndex);
            }
        },

        regressAsset: function() {
            if (currentAssetIndex - 1 >= 0) {
                currentAssetIndex--;
                this.switchAsset(currentAssetIndex);
            }
        },

        terminateViewer: function() {
            deactivateKeyboardControls();
            viewerElements.mainDisplay.style.display = 'none';
            createTransition(viewerElements.backdrop, 'opacity', displaySettings.backdropTransparency, 0, backdropTransitionTime, function() {
                viewerElements.backdrop.style.display = 'none';
            });
            unhideFormElements();
            unhideFlashContent();
        }
    };

    return viewerModule;
})();

document.addEventListener('DOMContentLoaded', function() {
    currentViewer.prepareViewer();
});