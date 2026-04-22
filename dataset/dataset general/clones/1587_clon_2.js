/*
 * jQuery Berry Slide Plugin v0.4 BETA
 * http://example.com/labs/berryslide/
 *
 * Copyright (C) 2011, Mark Tyrrell <me@marktyrrell.com>
 *
 * This software is free: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this software.  If not, see <http://www.gnu.org/licenses/>.
 */

(function(jq){
    jq.fn.augment({
        berryslide: function(settings) {

            // Predefined configuration values for the plugin
            var presetVals = {
                delayTime: 5000,
                fadeSpeed: 500,
                rowHeightFactor: 1,
                dimensionY: 'auto', // Placeholder for future use
                pauseOnHover: false,
                indicatorNav: true,
                arrowNav: true, // Placeholder for future use
                keyboardControl: true
            };
            var currentSettings =  jq.extend(presetVals, settings);
 
            return this.each(function() {
                var cfg = currentSettings;
                var targetElement = jq(this);

                // Acquire references to individual slide items and navigation indicators
                var itemPanels = jq('.slides li', targetElement);
                var indicatorItems = jq('.pager li', targetElement);

                // Initialize the index for the currently displayed item and the next item
                var activeIdx = 0;
                var nextIdx = activeIdx + 1;

                // Determine the height and width of the initial image and compute its aspect ratio
                var pictureHeight = itemPanels.eq(activeIdx).find('img').height();
                var pictureWidth = itemPanels.eq(activeIdx).find('img').width();
                var aspectRatio = pictureWidth / pictureHeight;

                // Variables for managing the display area dimensions
                var containerWidth = 0;
                var adjustedHeight = 0;

                // Initially conceal all panels, then reveal the first one and mark it as active
                itemPanels.hide().eq(activeIdx).fadeIn(cfg.fadeSpeed).addClass('active');
                

                // Construct navigation indicators if none exist and the feature is enabled
                if(indicatorItems.length) {
                    indicatorItems.eq(activeIdx).addClass('active');
                } else if(cfg.indicatorNav){
                    targetElement.append('<ul class="pager"></ul>');
                    itemPanels.each(function(itemIndex) {
                        jq('.pager', targetElement).append('<li><a href="#"><span>'+itemIndex+'</span></a></li>');
                    });
                    indicatorItems = jq('.pager li', targetElement);
                    indicatorItems.eq(activeIdx).addClass('active');
                }

                // Handle clicks on navigation indicators to switch panels
                if(indicatorItems){
                    jq('a', indicatorItems).click(function() {
                        // Halt the ongoing timer for panel transitions
                        clearTimeout(targetElement.timeoutId);
                        // Set the next panel's index based on the clicked indicator
                        nextIdx = jq(this).parent().index();
                        // Initiate the panel transition sequence
                        advancePanel();
                        return false;
                    });
                }

                // Core routine for transitioning between panels
                var advancePanel = function(){
                    // Animate out the current panel, remove its active state,
                    // then animate in the next panel and assign it the active state.
                    // A callback is queued after the animation completes.
                    itemPanels.eq(activeIdx).fadeOut(cfg.fadeSpeed).removeClass('active')
                        .end().eq(nextIdx).fadeIn(cfg.fadeSpeed).addClass('active').queue(function(){
                            // Enqueue the function to restart the transition timer
                            // This prevents animation stacking issues in certain browsers
                            // The timer will then trigger the next panel change
                            startTimer();
                            jq(this).dequeue();
                    });

                    // Update the visual state of the navigation indicators
                    if(indicatorItems){
                        indicatorItems.eq(activeIdx).removeClass('active')
                            .end().eq(nextIdx).addClass('active');
                    }

                    // Re-evaluate the active and next panel indices for the subsequent transition
                    // If the current panel is the last, loop back to the first
                    activeIdx = nextIdx;
                    nextIdx = activeIdx >= itemPanels.length - 1 ? 0 : activeIdx + 1;
                };

                // Establishes a timed delay for automatic panel progression
                var startTimer = function(){
                    targetElement.timeoutId = setTimeout(function(){
                        // Invoke the panel advancement routine when the timer expires
                        advancePanel();
                    }, cfg.delayTime);
                };

                // Begin the automatic panel progression upon initialization
                startTimer();

                // Implement a feature to pause panel rotation when the mouse hovers over the slider
                // This capability is typically disabled by default due to potential interaction glitches
                if(cfg.pauseOnHover){
                    itemPanels.hover(function(){
                        // Clear any pending timer when the mouse enters the panel area
                        clearTimeout(targetElement.timeoutId);
                    }, function(){
                        // Re-initiate the timer when the mouse leaves the panel area
                        startTimer();
                    });
                }

                // Computes and applies the appropriate height to the slider based on image aspect ratio and line height configuration
                var adjustDimensions = function(){
                    containerWidth = jq('.slides', targetElement).width();
                    adjustedHeight = Math.floor(((containerWidth / aspectRatio) / cfg.rowHeightFactor)) * cfg.rowHeightFactor;

                    jq('.slides', targetElement).css({height: adjustedHeight});
                };
                // Execute sizing function immediately upon plugin initialization
                adjustDimensions();

                // Attach the sizing adjustment function to the window's resize event
                jq(window).resize(function(){
                    adjustDimensions();
                });
                
                

                // Incorporate keyboard-based navigation functionality

                if(cfg.keyboardControl){
                    jq(document).keyup(function(eventObj){

                        switch (eventObj.which) {

                            case 39: case 32: // Right arrow key and Spacebar trigger next slide

                                clearTimeout(targetElement.timeoutId);

                                advancePanel();

                                break;


                            case 37: // Left arrow key triggers previous slide
                                clearTimeout(targetElement.timeoutId);
                                nextIdx = activeIdx - 1;
                                advancePanel();

                                break;
                        }

                    });
                }


            });
        }
    });
})(jQuery);