/*
 * jqSharePro: Utilize custom social sharing controls
 * Creator: Sonny T. <contact@sonny-tech.com>, sonny-tech.com
 */

(function (jq) {
    'use strict';

    jq.fn.fancyShare = function () {
        /*
         * Supported social service providers
         * @type {Object}
         */
        var shareProviders = {
                pinboard: {
                    resourceLink: 'http://pinterest.com/pin/create/button/?url={{url}}&media={{media}}&description={{description}}',
                    windowProps: {
                        winWidth: 685,
                        winHeight: 500
                    }
                },
                faceNet: {
                    resourceLink: 'https://www.facebook.com/sharer/sharer.php?s=100&p[title]={{title}}&p[summary]={{description}}&p[url]={{url}}&p[images][0]={{media}}',
                    windowProps: {
                        winWidth: 626,
                        winHeight: 436
                    }
                },
                microBlog: {
                    resourceLink: 'https://twitter.com/share?url={{url}}&via={{via}}&text={{description}}',
                    windowProps: {
                        winWidth: 685,
                        winHeight: 500
                    }
                },
                searchPlus: {
                    resourceLink: 'https://plus.google.com/share?url={{url}}',
                    windowProps: {
                        winWidth: 600,
                        winHeight: 600
                    }
                },
                careerNet: {
                    resourceLink: 'https://www.linkedin.com/shareArticle?mini=true&url={{url}}&title={{title}}&summary={{description}}+&source={{via}}',
                    windowProps: {
                        winWidth: 600,
                        winHeight: 600
                    }
                }
            },

            /*
             * Pop-up window creation
             * This function is primarily for desktop environments
             * @param  {Object} providerInfo Configuration for the selected service
             * @param  {String} targetLink   The final URL to be opened
             */
            openWindow = function (providerInfo, targetLink) {
                // calculate window position
                var leftPos = (window.innerWidth / 2) - (providerInfo.windowProps.winWidth / 2),
                    topPos = (window.innerHeight / 2) - (providerInfo.windowProps.winHeight / 2);

                return window.open(targetLink, '', 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,copyhistory=no,width=' + providerInfo.windowProps.winWidth + ',height=' + providerInfo.windowProps.winHeight + ',top=' + topPos + ',left=' + leftPos);
            },

            /*
             * Construct the sharing link based on provider templates
             * @param  {Object} providerConfig  Configuration for the specific service
             * @param  {Object} dataObject      Object containing variable data for the link
             * @return {String}                 The fully constructed URL for sharing
             */
            formatLink = function (providerConfig, dataObject) {
                // substitute placeholders in URL template
                var formattedUrl = providerConfig.resourceLink.replace(/{{url}}/g, encodeURIComponent(dataObject.shareUrl))
                                                           .replace(/{{title}}/g, encodeURIComponent(dataObject.shareTitle))
                                                           .replace(/{{description}}/g, encodeURIComponent(dataObject.shareDescription))
                                                           .replace(/{{media}}/g, encodeURIComponent(dataObject.shareMedia))
                                                           .replace(/{{via}}/g, encodeURIComponent(dataObject.shareVia));

                return formattedUrl;
            };

        return this.each(function () {

            // store current element as jQuery object
            var currentJqObj = jq(this);

            // link type
            var providerType = currentJqObj.data('type'),

                // determine sharing provider configuration
                selectedProvider = shareProviders[providerType] || null;

            // validate if a provider configuration exists
            if (!selectedProvider) {
                jq.error('Social service provider is not specified or invalid.');
            }

            // collect sharing data from element attributes
            var shareData = {
                shareUrl: currentJqObj.data('url') || '',
                shareTitle: currentJqObj.data('title') || '',
                shareDescription: currentJqObj.data('description') || '',
                shareMedia: currentJqObj.data('media') || '',
                shareVia: currentJqObj.data('via') || ''
            };

            // construct the complete sharing URL
            var finalUrl = formatLink(selectedProvider, shareData);

            // set up event handlers for touch or mouse interactions
            if (navigator.userAgent.match(/Android|IEMobile|BlackBerry|iPhone|iPad|iPod|Opera Mini/i)) {
                currentJqObj
                    .on('touchstart', function (eventObj) {
                        if (eventObj.originalEvent.touches.length > 1) {
                            return;
                        }

                        currentJqObj.data('noScrollTouch', true);
                    })
                    .on('touchmove', function () {
                        currentJqObj.data('noScrollTouch', false);

                        return;
                    }).on('touchend', function (eventObj) {
                        eventObj.preventDefault();

                        var noScrollTouch = currentJqObj.data('noScrollTouch');

                        if (eventObj.originalEvent.touches.length > 1 || !noScrollTouch) {
                            return;
                        }

                        // open the new sharing window
                        openWindow(selectedProvider, finalUrl);
                    });
            } else {
                currentJqObj.on('click', function (eventObj) {
                    eventObj.preventDefault();

                    // open the new sharing window
                    openWindow(selectedProvider, finalUrl);
                });
            }
        });
    };

})(jQuery);