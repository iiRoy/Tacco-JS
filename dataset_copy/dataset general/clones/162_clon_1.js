// This is Sharrre.com, a JavaScript library for social sharing widgets.
// Version: beta 1.3.5
// Created by Julien Hany.
// Licensed under the MIT License (see http://en.wikipedia.org/wiki/MIT_License) or GPLv2 (http://en.wikipedia.org/wiki/GNU_General_Public_License).
// Please refer to the official documentation for more details.

; ( function ($, window, document, undefined)
{

    // Default configuration settings for the plugin.
    // ====================================================================
    var   pluginName = 'sharrre'
        , defaults   = {

             className    : 'sharrre'

            // Social networks to enable for sharing.
            , share        : {
                 googlePlus  : false
                , facebook    : false
                , twitter     : false
                , digg        : false
                , delicious   : false
                , stumbleupon : false
                , linkedin    : false
                , pinterest   : false
            }

            , shareTotal   : 0
            , template     : ''
            , title        : ''
            , url          : document.location.href
            , text         : document.title

            // PHP script for Google Plus, Stumbleupon, etc.
            , urlCurl      : 'sharrre.php'

            // Counter for each social network.
            , count        : {}

            // Total number of shares across all networks.
            , total        : 0

            // Display total with 'k' or 'M' for large numbers.
            , shorterTotal : true

            // Enable hover event for button loading.
            , enableHover  : true

            // Enable counters for social buttons.
            , enableCounter: true

            // Enable Google Analytics tracking.
            , enableTracking : false

            // Callback function for hover event.
            , hover        : function(){}

            // Callback function for hide event.
            , hide         : function(){}

            // Callback function for click event.
            , click        : function(){}

            // Callback function for rendering.
            , render       : function(){}

            // Button specific settings.
            , buttons      : {
                 googlePlus : { // Google+ button options (see http://www.google.com/webmasters/+1/button/)
                     url        : '' // Custom URL for the button.
                    , urlCount   : false // Use custom URL for global counter.
                    , size       : 'medium'
                    , lang       : 'en-US'
                    , annotation : ''
                }
                , facebook   : { // Facebook Like button options (see http://developers.facebook.com/docs/reference/plugins/like/)
                     url        : '' // Custom URL for the button.
                    , urlCount   : false // Use custom URL for global counter.
                    , action     : 'like'
                    , layout     : 'button_count'
                    , width      : ''
                    , send       : 'false'
                    , faces      : 'false'
                    , colorscheme: ''
                    , font       : ''
                    , lang       : 'en_US'
                }
                , twitter    : { // Twitter Tweet button options (see http://twitter.com/about/resources/tweetbutton)
                     url        : '' // Custom URL for the button.
                    , urlCount   : false // Use custom URL for global counter.
                    , count      : 'horizontal'
                    , hashtags   : ''
                    , via        : ''
                    , related    : ''
                    , lang       : 'en'
                }
                , digg       : { // Digg button options (see http://about.digg.com/downloads/button/smart)
                     url        : '' // Custom URL for the button.
                    , urlCount   : false // Use custom URL for global counter.
                    , type       : 'DiggCompact'
                }
                , delicious  : {
                     url        : '' // Custom URL for the button.
                    , urlCount   : false // Use custom URL for global counter.
                    , size       : 'medium' // Can be 'medium' or 'tall'.
                }
                , stumbleupon: { // StumbleUpon button options (see http://www.stumbleupon.com/badges/)
                     url        : '' // Custom URL for the button.
                    , urlCount   : false // Use custom URL for global counter.
                    , layout     : '1'
                }
                , linkedin   : { // LinkedIn Share button options (see http://developer.linkedin.com/plugins/share-button)
                     url        : '' // Custom URL for the button.
                    , urlCount   : false // Use custom URL for global counter.
                    , counter    : ''
                }
                , pinterest  : { // Pinterest Pin It button options (see http://pinterest.com/about/goodies/)
                     url        : '' // Custom URL for the button.
                    , media      : ''
                    , description: ''
                    , layout     : 'horizontal'
                }
            }
        } // End of defaults object
        ,

    // JSON endpoints for retrieving share counts.
    // ====================================================================
    urlJson    = {
        googlePlus : "" // Google+ count URL is dynamically generated.

        // Facebook: Using the FQL method provided by Sire.
        , facebook    : "https://graph.facebook.com/fql?q=SELECT%20url,%20normalized_url,%20share_count,%20like_count,%20comment_count,%20total_count,commentsbox_count,%20comments_fbid,%20click_count%20FROM%20link_stat%20WHERE%20url=%27{url}%27&callback=?"
        // Previous Facebook methods (commented out in original):
        // facebook: "http://graph.facebook.com/?id={url}&callback=?",
        // facebook : "http://api.ak.facebook.com/restserver.php?v=1.0&method=links.getStats&urls={url}&format=json"


        , twitter     : "http://cdn.api.twitter.com/1/urls/count.json?url={url}&callback=?"
        , digg        : "http://services.digg.com/2.0/story.getInfo?links={url}&type=javascript&callback=?"
        , delicious   : 'http://feeds.delicious.com/v2/json/urlinfo/data?url={url}&callback=?'

        // StumbleUpon count URL is dynamically generated.
        , stumbleupon : "" // Original had a commented out URL: "http://www.stumbleupon.com/services/1.01/badge.getinfo?url={url}&format=jsonp&callback=?"

        , linkedin    : "http://www.linkedin.com/countserv/count/share?format=jsonp&url={url}&callback=?"
        , pinterest   : "http://api.pinterest.com/v1/urls/count.json?url={url}&callback=?"
    } // End of urlJson object
    ,

    // Functions to dynamically load social share buttons.
    // ====================================================================
    loadButton = {
        googlePlus : function (self) {
            // Retrieve Google Plus button settings.
            var sett = self.options.buttons.googlePlus;
            // Append the Google+ button HTML.
            // Original line commented out: $(self.element).find('.buttons').append('<div class="button googleplus"><g:plusone size="'+self.options.buttons.googlePlus.size+'" href="'+self.options.url+'"></g:plusone></div>');
            $(self.element).find('.buttons').append('<div class="button googleplus"><div class="g-plusone" data-size="'+sett.size+'" data-href="'+(sett.url !== '' ? sett.url : self.options.url)+'" data-annotation="'+sett.annotation+'"></div></div>');

            // Configure global Google+ settings.
            window.___gcfg = {
                lang: self.options.buttons.googlePlus.lang
            };

            var loading = 0; // Flag to prevent multiple script loads.
            // Check if gapi (Google API) is undefined and script hasn't started loading.
            if (typeof gapi === 'undefined' && loading == 0) {
                loading = 1; // Set loading flag.
                (function () {
                    var po = document.createElement('script');
                    po.type = 'text/javascript';
                    po.async = true;
                    po.src = '//apis.google.com/js/plusone.js';
                    var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(po, s);
                })();
            } else {
                // If gapi is already available, re-render the button.
                gapi.plusone.go();
            }
        } // End of googlePlus button loader.

        , facebook : function (self) {
            // Retrieve Facebook button settings.
            var sett = self.options.buttons.facebook;
            // Append the Facebook Like button HTML.
            $(self.element).find('.buttons').append('<div class="button facebook"><div id="fb-root"></div><div class="fb-like" data-href="'+(sett.url !== '' ? sett.url : self.options.url)+'" data-send="'+sett.send+'" data-layout="'+sett.layout+'" data-width="'+sett.width+'" data-show-faces="'+sett.faces+'" data-action="'+sett.action+'" data-colorscheme="'+sett.colorscheme+'" data-font="'+sett.font+'" data-via="'+sett.via+'"></div></div>');

            var loading = 0; // Flag to prevent multiple script loads.
            // Check if FB (Facebook SDK) is undefined and script hasn't started loading.
            if (typeof FB === 'undefined' && loading == 0) {
                loading = 1; // Set loading flag.
                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {
                        return;
                    }
                    js = d.createElement(s);
                    js.id = id;
                    js.src = '//connect.facebook.net/'+sett.lang+'/all.js#xfbml=1';
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
            } else {
                // If FB SDK is already available, parse XFBML elements.
                FB.XFBML.parse();
            }
        } // End of facebook button loader.

        , twitter : function (self) {
            // Retrieve Twitter button settings.
            var sett = self.options.buttons.twitter;
            // Append the Twitter Tweet button HTML.
            $(self.element).find('.buttons').append('<div class="button twitter"><a href="https://twitter.com/share" class="twitter-share-button" data-url="'+(sett.url !== '' ? sett.url : self.options.url)+'" data-count="'+sett.count+'" data-text="'+self.options.text+'" data-via="'+sett.via+'" data-hashtags="'+sett.hashtags+'" data-related="'+sett.related+'" data-lang="'+sett.lang+'">Tweet</a></div>');

            var loading = 0; // Flag to prevent multiple script loads.
            // Check if twttr (Twitter widgets) is undefined and script hasn't started loading.
            if (typeof twttr === 'undefined' && loading == 0) {
                loading = 1; // Set loading flag.
                (function () {
                    var twitterScriptTag = document.createElement('script');
                    twitterScriptTag.type = 'text/javascript';
                    twitterScriptTag.async = true;
                    twitterScriptTag.src = '//platform.twitter.com/widgets.js';
                    var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(twitterScriptTag, s);
                })();
            } else {
                // If Twitter widgets are already available, reload them via AJAX.
                $.ajax({ url: '//platform.twitter.com/widgets.js', dataType: 'script', cache:true}); // Reference: http://stackoverflow.com/q/6536108
            }
        } // End of twitter button loader.

        , digg : function (self) {
            // Retrieve Digg button settings.
            var sett = self.options.buttons.digg;
            // Append the Digg button HTML.
            $(self.element).find('.buttons').append('<div class="button digg"><a class="DiggThisButton '+sett.type+'" rel="nofollow external" href="http://digg.com/submit?url='+encodeURIComponent((sett.url !== '' ? sett.url : self.options.url))+'"></a></div>');

            var loading = 0; // Flag to prevent multiple script loads.
            // Check if __DBW (Digg button widget) is undefined and script hasn't started loading.
            if (typeof __DBW === 'undefined' && loading == 0) {
                loading = 1; // Set loading flag.
                (function () {
                    var s  = document.createElement('SCRIPT')
                      , s1 = document.getElementsByTagName('SCRIPT')[0];
                    s.type = 'text/javascript';
                    s.async = true;
                    s.src = '//widgets.digg.com/buttons.js';
                    s1.parentNode.insertBefore(s, s1);
                })();
            }
        } // End of digg button loader.

        , delicious : function (self) {
            // Determine CSS based on button size (tall or medium).
            if (self.options.buttons.delicious.size == 'tall') { // Tall size specific styles.
                var css      = 'width:50px;'
                  , cssCount = 'height:35px;width:50px;font-size:15px;line-height:35px;'
                  , cssShare = 'height:18px;line-height:18px;margin-top:3px;';
            } else { // Medium size specific styles.
                var css      = 'width:93px;'
                  , cssCount = 'float:right;padding:0 3px;height:20px;width:26px;line-height:20px;'
                  , cssShare = 'float:left;height:20px;line-height:20px;';
            }

            // Get and format the delicious count.
            var count = self.shorterTotal(self.options.count.delicious);
            if (typeof count === "undefined") {
                count = 0;
            }

            // Append the custom Delicious button HTML.
            $(self.element).find('.buttons').append(
                '<div class="button delicious">' +
                    '<div style="'+css+'font:12px Arial,Helvetica,sans-serif;cursor:pointer;color:#666666;display:inline-block;float:none;height:20px;line-height:normal;margin:0;padding:0;text-indent:0;vertical-align:baseline;">' +
                        '<div style="'+cssCount+'background-color:#fff;margin-bottom:5px;overflow:hidden;text-align:center;border:1px solid #ccc;border-radius:3px;">' + count + '</div>' +
                        '<div style="'+cssShare+'display:block;padding:0;text-align:center;text-decoration:none;width:50px;background-color:#7EACEE;border:1px solid #40679C;border-radius:3px;color:#fff;">' +
                            '<img src="http://www.delicious.com/static/img/delicious.small.gif" height="10" width="10" alt="Delicious" /> Add' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );

            // Attach click handler to open popup.
            $(self.element).find('.delicious').on('click', function () {
                self.openPopup('delicious');
            });
        } // End of delicious button loader.

        , stumbleupon : function (self) {
            // Retrieve StumbleUpon button settings.
            var sett = self.options.buttons.stumbleupon;
            // Append the StumbleUpon badge HTML.
            $(self.element).find('.buttons').append('<div class="button stumbleupon"><su:badge layout="'+sett.layout+'" location="'+(sett.url !== '' ? sett.url : self.options.url)+'"></su:badge></div>');

            var loading = 0; // Flag to prevent multiple script loads.
            // Check if STMBLPN (StumbleUpon widget) is undefined and script hasn't started loading.
            if (typeof STMBLPN === 'undefined' && loading == 0) {
                loading = 1; // Set loading flag.
                (function () {
                    var li = document.createElement('script');
                    li.type = 'text/javascript';
                    li.async = true;
                    li.src = '//platform.stumbleupon.com/1/widgets.js';
                    var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(li, s);
                })();

                // Poll for STMBLPN to be defined and process widgets.
                s = window.setTimeout(function () {
                    if (typeof STMBLPN !== 'undefined') {
                        STMBLPN.processWidgets();
                        clearInterval(s);
                    }
                }, 500);
            } else {
                // If STMBLPN is already available, process widgets.
                STMBLPN.processWidgets();
            }
        } // End of stumbleupon button loader.

        , linkedin : function (self) {
            // Retrieve LinkedIn button settings.
            var sett = self.options.buttons.linkedin;
            // Append the LinkedIn share script tag.
            $(self.element).find('.buttons').append('<div class="button linkedin"><script type="in/share" data-url="'+(sett.url !== '' ? sett.url : self.options.url)+'" data-counter="'+sett.counter+'"></script></div>');

            var loading = 0; // Flag to prevent multiple script loads.
            // Check if window.IN (LinkedIn SDK) is undefined and script hasn't started loading.
            if (typeof window.IN === 'undefined' && loading == 0) {
                loading = 1; // Set loading flag.
                (function () {
                    var li = document.createElement('script');
                    li.type = 'text/javascript';
                    li.async = true;
                    li.src = '//platform.linkedin.com/in.js';
                    var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(li, s);
                })();
            } else {
                // If LinkedIn SDK is already available, initialize it.
                window.IN.init();
            }
        } // End of linkedin button loader.

        , pinterest : function (self) {
            // Retrieve Pinterest button settings.
            var sett = self.options.buttons.pinterest;
            // Append the Pinterest button HTML.
            $(self.element).find('.buttons').append('<div class="button pinterest"><a href="http://pinterest.com/pin/create/button/?url='+(sett.url !== '' ? sett.url : self.options.url)+'&media='+sett.media+'&description='+sett.description+'" class="pin-it-button" count-layout="'+sett.layout+'">Pin It</a></div>');

            // Load the Pinterest widget script.
            (function () {
                var li = document.createElement('script');
                li.type = 'text/javascript';
                li.async = true;
                li.src = '//assets.pinterest.com/js/pinit.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(li, s);
            })();
        } // End of pinterest button loader.
    } // End of loadButton object
    ,

    // Google Analytics tracking functions for social interactions.
    // ====================================================================
    tracking   = {
        googlePlus  : function () { /* No specific tracking implemented for Google Plus in original. */ }

        , facebook    : function () {
            // Original had a console.log('facebook');
            var fb = window.setInterval(function () {
                if (typeof FB !== 'undefined') {
                    // Subscribe to Facebook 'like' events.
                    FB.Event.subscribe('edge.create', function (targetUrl) {
                        _gaq.push(['_trackSocial', 'facebook', 'like', targetUrl]);
                    });
                    // Subscribe to Facebook 'unlike' events.
                    FB.Event.subscribe('edge.remove', function (targetUrl) {
                        _gaq.push(['_trackSocial', 'facebook', 'unlike', targetUrl]);
                    });
                    // Subscribe to Facebook 'send' events.
                    FB.Event.subscribe('message.send', function (targetUrl) {
                        _gaq.push(['_trackSocial', 'facebook', 'send', targetUrl]);
                    });
                    // Original had a console.log('ok');
                    clearInterval(fb); // Stop polling once FB is defined.
                }
            }, 1000); // Check every second.
        } // End of facebook tracking.

        , twitter     : function () {
            // Original had a console.log('twitter');
            var tw = window.setInterval(function () {
                if (typeof twttr !== 'undefined') {
                    // Bind to Twitter 'tweet' events.
                    twttr.events.bind('tweet', function (event) {
                        if (event) {
                            _gaq.push(['_trackSocial', 'twitter', 'tweet']);
                        }
                    });
                    // Original had a console.log('ok');
                    clearInterval(tw); // Stop polling once twttr is defined.
                }
            }, 1000); // Check every second.
        } // End of twitter tracking.

        , digg        : function () {
            // Original comment: "if somenone find a solution, mail me !"
            // Original commented out code:
            /* $(this.element).find('.digg').on('click', function(){
                _gaq.push(['_trackSocial', 'digg', 'add']);
            }); */
        } // End of digg tracking.

        , delicious   : function () { /* No specific tracking implemented for Delicious in original. */ }
        , stumbleupon : function () { /* No specific tracking implemented for StumbleUpon in original. */ }

        , linkedin    : function () {
            // Function to track LinkedIn shares.
            function LinkedInShare () {
                _gaq.push(['_trackSocial', 'linkedin', 'share']);
            }
        } // End of linkedin tracking.

        , pinterest   : function () {
            // Original comment: "if somenone find a solution, mail me !"
        } // End of pinterest tracking.
    } // End of tracking object
    ,

    // Functions to open pop-up windows for social sharing.
    // ====================================================================
    popup      = {
        googlePlus  : function (opt) {
            window.open(
                "https://plus.google.com/share?hl=" + opt.buttons.googlePlus.lang + "&url=" + encodeURIComponent((opt.buttons.googlePlus.url !== '' ? opt.buttons.googlePlus.url : opt.url)),
                "",
                "toolbar=0, status=0, width=900, height=500"
            );
        } // End of googlePlus popup.

        , facebook    : function (opt) {
            window.open(
                "http://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent((opt.buttons.facebook.url !== '' ? opt.buttons.facebook.url : opt.url)) + "&t=" + opt.text + "",
                "",
                "toolbar=0, status=0, width=900, height=500"
            );
        } // End of facebook popup.

        , twitter     : function (opt) {
            window.open(
                "https://twitter.com/intent/tweet?text=" + encodeURIComponent(opt.text) + "&url=" + encodeURIComponent((opt.buttons.twitter.url !== '' ? opt.buttons.twitter.url : opt.url)) + (opt.buttons.twitter.via !== '' ? '&via=' + opt.buttons.twitter.via : ''),
                "",
                "toolbar=0, status=0, width=650, height=360"
            );
        } // End of twitter popup.

        , digg        : function (opt) {
            window.open(
                "http://digg.com/tools/diggthis/submit?url=" + encodeURIComponent((opt.buttons.digg.url !== '' ? opt.buttons.digg.url : opt.url)) + "&title=" + opt.text + "&related=true&style=true",
                "",
                "toolbar=0, status=0, width=650, height=360"
            );
        } // End of digg popup.

        , delicious   : function (opt) {
            window.open(
                'http://www.delicious.com/save?v=5&noui&jump=close&url=' + encodeURIComponent((opt.buttons.delicious.url !== '' ? opt.buttons.delicious.url : opt.url)) + '&title=' + opt.text,
                'delicious',
                'toolbar=no,width=550,height=550'
            );
        } // End of delicious popup.

        , stumbleupon : function (opt) {
            window.open(
                'http://www.stumbleupon.com/badge/?url=' + encodeURIComponent((opt.buttons.stumbleupon.url !== '' ? opt.buttons.stumbleupon.url : opt.url)),
                'stumbleupon',
                'toolbar=no,width=550,height=550'
            );
        } // End of stumbleupon popup.

        , linkedin    : function (opt) {
            window.open(
                'https://www.linkedin.com/cws/share?url=' + encodeURIComponent((opt.buttons.linkedin.url !== '' ? opt.buttons.linkedin.url : opt.url)) + '&token=&isFramed=true',
                'linkedin',
                'toolbar=no,width=550,height=550'
            );
        } // End of linkedin popup.

        , pinterest   : function (opt) {
            window.open(
                'http://pinterest.com/pin/create/button/?url=' + encodeURIComponent((opt.buttons.pinterest.url !== '' ? opt.buttons.pinterest.url : opt.url)) + '&media=' + encodeURIComponent(opt.buttons.pinterest.media) + '&description=' + opt.buttons.pinterest.description,
                'pinterest',
                'toolbar=no,width=700,height=300'
            );
        } // End of pinterest popup.
    }; // End of popup object.


    // Plugin constructor function.
    // ====================================================================
    function Plugin (element, options) {
        this.element = element; // The DOM element for the plugin instance.

        // Merge default options with user-provided options.
        // Deep merge is used to preserve nested objects.
        this.options = $.extend(true, {}, defaults, options);
        // Overwrite 'share' specifically to respect user's desired order.
        this.options.share = options.share;

        this._defaults = defaults;     // Store a reference to the default options.
        this._name     = pluginName;   // Store the plugin's name.

        this.init(); // Initialize the plugin instance.
    } // End of Plugin constructor.
    ; // Semicolon for safety.


    // Initialization method for the Plugin prototype.
    // ====================================================================
    Plugin.prototype.init = function () {
        var self = this; // Cache 'this' for use in callbacks.

        // If a URL for the PHP cURL script is provided, update specific JSON URLs.
        if (this.options.urlCurl !== '') {
            urlJson.googlePlus  = this.options.urlCurl + '?url={url}&type=googlePlus';   // Google+ count via PHP.
            urlJson.stumbleupon = this.options.urlCurl + '?url={url}&type=stumbleupon'; // StumbleUpon count via PHP.
        }

        // Add the base class name to the plugin's element.
        $(this.element).addClass(this.options.className);

        // Check for HTML5 custom data attributes to override options.
        if (typeof $(this.element).data('title') !== 'undefined') {
            this.options.title = $(this.element).attr('data-title');
        }
        if (typeof $(this.element).data('url') !== 'undefined') {
            this.options.url = $(this.element).data('url');
        }
        if (typeof $(this.element).data('text') !== 'undefined') {
            this.options.text = $(this.element).data('text');
        }

        // Count how many social networks are enabled.
        $.each(this.options.share, function (name, val) {
            if (val === true) {
                self.options.shareTotal++;
            }
        });

        // If counters are enabled, fetch social share counts.
        if (self.options.enableCounter === true) {
            $.each(this.options.share, function (name, val) {
                if (val === true) {
                    // Call getSocialJson for each enabled network.
                    // Original had a commented out: //self.getSocialJson(name);
                    try {
                        self.getSocialJson(name);
                    } catch (e) {
                        // Suppress errors during JSON retrieval.
                    }
                }
            });
        }
        // If a custom template is provided, render it.
        else if (self.options.template !== '') {
            this.options.render(this, this.options);
        }
        // Otherwise, load the official buttons.
        else {
            this.loadButtons();
        }

        // Attach hover event handlers to the element.
        $(this.element).hover(function () {
            // Load social buttons on hover if enabled and not already loaded.
            if ($(this).find('.buttons').length === 0 && self.options.enableHover === true) {
                self.loadButtons();
            }
            // Execute the custom hover callback.
            self.options.hover(self, self.options);
        }, function () {
            // Execute the custom hide callback on mouse leave.
            self.options.hide(self, self.options);
        });

        // Attach a click event handler.
        $(this.element).click(function () {
            // Execute the custom click callback.
            self.options.click(self, self.options);
            return false; // Prevent default link behavior.
        });
    }; // End of init method.


    // Method to load and display the social share buttons.
    // ====================================================================
    Plugin.prototype.loadButtons = function () {
        var self = this; // Cache 'this'.
        // Append a container for the buttons.
        $(this.element).append('<div class="buttons"></div>');

        // Iterate over enabled social networks and load their respective buttons.
        $.each(self.options.share, function (name, val) {
            if (val === true) { // Check if the social network is enabled.
                loadButton[name](self); // Call the specific button loader function.
                if (self.options.enableTracking === true) { // If tracking is enabled.
                    tracking[name](); // Initialize tracking for this network.
                }
            }
        });
    }; // End of loadButtons method.


    // Method to fetch share counts from social network APIs.
    // ====================================================================
    Plugin.prototype.getSocialJson = function (name) {
        var self  = this
          , count = 0
          , url   = urlJson[name].replace('{url}', encodeURIComponent(this.options.url));

        // If a custom URL for counting is specified for this button, use it.
        if (this.options.buttons[name].urlCount === true && this.options.buttons[name].url !== '') {
            url = urlJson[name].replace('{url}', this.options.buttons[name].url);
        }

        // Debugging line (commented out in original): //console.log('name : ' + name + ' - url : '+url);

        // Proceed only if a valid URL is available and a cURL script is specified.
        if (url !== '' && self.options.urlCurl !== '') {
            $.getJSON(url, function (json) {
                // Handle various JSON response formats for counts.
                if (typeof json.count !== "undefined") { // Google+, StumbleUpon, Twitter, Pinterest, Digg.
                    var temp = json.count + ''; // Convert count to string.
                    temp = temp.replace('\u00c2\u00a0', ''); // Remove specific Google+ special characters.
                    count += parseInt(temp, 10);
                }
                // Handle Facebook total count (shares, likes, etc.) using the FQL method.
                else if (json.data && json.data.length > 0 && typeof json.data[0].total_count !== "undefined") {
                    count += parseInt(json.data[0].total_count, 10);
                }
                else if (typeof json[0] !== "undefined") { // Delicious.
                    count += parseInt(json[0].total_posts, 10);
                }
                else if (typeof json[0] !== "undefined") { // StumbleUpon (no count property in original json structure).
                    // This block is empty in original, implying count is handled by json.count above or not directly from this path.
                }

                // Store the count and update the total.
                self.options.count[name] = count;
                self.options.total += count;

                // Render the main display and personalized elements.
                self.renderer();
                self.rendererPerso();

                // Debugging line (commented out in original): //console.log(json);
            })
            // Error handling for JSON request.
            .error(function () {
                self.options.count[name] = 0; // Set count to 0 on error.
                self.rendererPerso(); // Still render personalized elements.
            });
        } else {
            // If no URL or cURL script, just render with 0 count.
            self.renderer();
            self.options.count[name] = 0;
            self.rendererPerso();
        }
    }; // End of getSocialJson method.


    // Method to trigger rendering of personalized elements.
    // ====================================================================
    Plugin.prototype.rendererPerso = function () {
        // Determine if this is the last social website to trigger the render.
        var shareCount = 0;
        for (e in this.options.count) { // Iterate through the count object.
            shareCount++; // Increment count for each property.
        }

        // If the number of counted items matches the total number of enabled shares.
        if (shareCount === this.options.shareTotal) {
            this.options.render(this, this.options); // Call the custom render function.
        }
    }; // End of rendererPerso method.


    // Main rendering method for the plugin.
    // ====================================================================
    Plugin.prototype.renderer = function () {
        var total = this.options.total
          , template = this.options.template;

        // The rest of this method is missing from the provided snippet.
        // It would typically handle updating the display with counts and buttons.