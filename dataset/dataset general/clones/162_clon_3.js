/*!
 *  SocialShareKit.js - A compact social sharing widget.
 *  Version: 2.0.1 (Clone of Sharrre beta 1.3.5)
 *  Author: [Cloned from Julien Hany's work]
 *  License: Modified MIT License (for cloning purposes)
 *  Note: This is a Type III clone. Extensive changes applied.
 */

; (function (jq, globalScope, domRoot) {
  // Internal module identification string
  const moduleIdentifier = 'shareKit';

  // Helper function to check if a value is null, undefined, or an empty string
  const isValueEmpty = (val) => val === null || val === undefined || val === '';

  // Utility function for robust URL encoding, with error logging
  const _encodeUrlComponent = (url) => {
    try {
      return encodeURIComponent(url);
    } catch (e) {
      console.error("ShareKit: Failed to encode URL component:", url, e);
      return url; // Fallback to original URL if encoding fails
    }
  };

  // Base configuration settings for the sharing module
  const baseConfiguration = {
    containerClass: 'ssk-widget', // CSS class for the main widget container
    activeServices: {
      googlePlus: false,
      facebook: false,
      twitter: false,
      digg: false,
      delicious: false,
      stumbleupon: false,
      linkedin: false,
      pinterest: false
    },
    enabledServiceCount: 0, // Number of social services explicitly enabled
    customLayoutMarkup: '', // Custom HTML template for rendering the widget
    contentTitle: '', // Title of the content being shared
    targetUrl: domRoot.location.href, // URL to be shared, defaults to current page
    contentDescription: domRoot.title, // Text description for sharing, defaults to page title
    phpProxyEndpoint: 'sharekit-proxy.php', // Server-side script for fetching counts (e.g., for Google+, StumbleUpon)
    serviceCounters: {}, // Object to store share counts for each social network
    aggregateShareCount: 0, // Total number of shares across all enabled networks
    formatLargeNumber: true, // If true, numbers like 12000 will be displayed as 12K
    activateHoverEffects: true, // Enables dynamic loading of buttons on hover
    displayCountValues: true, // If false, share counts will not be fetched or displayed
    enableAnalyticsTracking: false, // Integrates with Google Analytics for social tracking
    onHoverCallback: function () { }, // Callback function triggered on mouse enter
    onHideCallback: function () { }, // Callback function triggered on mouse leave
    onClickCallback: function () { }, // Callback function triggered on widget click
    onRenderComplete: function () { }, // Callback function after all counts are fetched and rendering is complete
    serviceButtons: {  // Specific configuration for each social network's sharing button
      googlePlus: {
        buttonUrl: '',  // Optional: override the URL used by the Google+ button
        useButtonUrlForCount: false, // If true, 'buttonUrl' is used for fetching counts
        size: 'medium',
        language: 'en-US',
        annotationType: '' // e.g., 'bubble' or 'inline'
      },
      facebook: {
        buttonUrl: '',
        useButtonUrlForCount: false,
        actionType: 'like', // 'like' or 'recommend'
        displayLayout: 'button_count', // 'standard', 'button_count', 'box_count'
        elementWidth: '', // Width of the Facebook button element
        showSendButton: 'false', // Display a Send button
        showFaces: 'false', // Show profile pictures of friends who liked this
        colorScheme: '', // 'light' or 'dark'
        fontFamily: '',
        language: 'en_US'
      },
      twitter: {
        buttonUrl: '',
        useButtonUrlForCount: false,
        countStyle: 'horizontal', // 'none', 'horizontal', 'vertical'
        hashtags: '',
        viaAccount: '', // Twitter username to associate with the tweet
        relatedAccounts: '', // Related Twitter accounts
        language: 'en'
      },
      digg: {
        buttonUrl: '',
        useButtonUrlForCount: false,
        buttonType: 'DiggCompact' // 'DiggCompact', 'DiggMedium', etc.
      },
      delicious: {
        buttonUrl: '',
        useButtonUrlForCount: false,
        buttonSize: 'medium' // 'medium' or 'tall'
      },
      stumbleupon: {
        buttonUrl: '',
        useButtonUrlForCount: false,
        layoutStyle: '1' // StumbleUpon badge layout
      },
      linkedin: {
        buttonUrl: '',
        useButtonUrlForCount: false,
        counterPosition: '' // 'right' or '' (top)
      },
      pinterest: {
        buttonUrl: '',
        mediaUrl: '', // URL of the image to be Pinned
        descriptionText: '', // Description for the Pin
        layoutStyle: 'horizontal' // 'horizontal', 'vertical', 'none'
      }
    }
  };

  // API endpoints for fetching share counts for various social networks
  const apiEndpoints = {
    googlePlus: "", // Dynamically set if PHP proxy is used
    facebook: "https://graph.facebook.com/fql?q=SELECT%20url,%20normalized_url,%20share_count,%20like_count,%20comment_count,%20total_count,commentsbox_count,%20comments_fbid,%20click_count%20FROM%20link_stat%20WHERE%20url=%27{url}%27&callback=?",
    twitter: "https://cdn.api.twitter.com/1/urls/count.json?url={url}&callback=?",
    digg: "https://services.digg.com/2.0/story.getInfo?links={url}&type=javascript&callback=?",
    delicious: 'https://feeds.delicious.com/v2/json/urlinfo/data?url={url}&callback=?',
    stumbleupon: "", // Dynamically set if PHP proxy is used
    linkedin: "https://www.linkedin.com/countserv/count/share?format=jsonp&url={url}&callback=?",
    pinterest: "https://api.pinterest.com/v1/urls/count.json?url={url}&callback=?"
  };

  // Helper function to inject external JavaScript files into the DOM
  const scriptInjector = (src, id, onloadCallback) => {
    let scriptElement = domRoot.getElementById(id);
    if (scriptElement) {
      if (onloadCallback && typeof onloadCallback === 'function') onloadCallback();
      return; // Script already exists, no need to re-inject
    }
    scriptElement = domRoot.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.async = true;
    scriptElement.src = src;
    if (id) scriptElement.id = id;
    const firstScriptTag = domRoot.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(scriptElement, firstScriptTag);
    if (onloadCallback && typeof onloadCallback === 'function') {
      scriptElement.onload = onloadCallback;
      scriptElement.onerror = (e) => console.error(`ShareKit: Failed to load script: ${src}`, e);
    }
  };

  // Collection of functions responsible for loading and rendering each social network's button/widget
  const componentLoaders = {
    googlePlus: function (instanceRef) {
      const btnConfig = instanceRef.moduleOptions.serviceButtons.googlePlus;
      const targetUrl = isValueEmpty(btnConfig.buttonUrl) ? instanceRef.moduleOptions.targetUrl : btnConfig.buttonUrl;
      jq(instanceRef.widgetContainer).find('.ssk-buttons').append(
        `<div class="ssk-button googleplus"><div class="g-plusone" data-size="${btnConfig.size}" data-href="${targetUrl}" data-annotation="${btnConfig.annotationType}"></div></div>`
      );

      globalScope.___gcfg = { lang: btnConfig.language }; // Set global Google+ configuration

      if (typeof globalScope.gapi === 'undefined') {
        scriptInjector('https://apis.google.com/js/plusone.js', 'google-plus-script', () => {
          if (globalScope.gapi && globalScope.gapi.plusone) {
            globalScope.gapi.plusone.go(); // Render existing +1 buttons
          }
        });
      } else {
        globalScope.gapi.plusone.go(); // Re-render if API is already loaded
      }
    },
    facebook: function (instanceRef) {
      const btnConfig = instanceRef.moduleOptions.serviceButtons.facebook;
      const targetUrl = isValueEmpty(btnConfig.buttonUrl) ? instanceRef.moduleOptions.targetUrl : btnConfig.buttonUrl;
      jq(instanceRef.widgetContainer).find('.ssk-buttons').append(
        `<div class="ssk-button facebook"><div id="fb-root"></div><div class="fb-like" data-href="${targetUrl}" data-send="${btnConfig.showSendButton}" data-layout="${btnConfig.displayLayout}" data-width="${btnConfig.elementWidth}" data-show-faces="${btnConfig.showFaces}" data-action="${btnConfig.actionType}" data-colorscheme="${btnConfig.colorScheme}" data-font="${btnConfig.fontFamily}"></div></div>`
      );

      if (typeof globalScope.FB === 'undefined') {
        scriptInjector(`https://connect.facebook.net/${btnConfig.language}/all.js#xfbml=1`, 'facebook-jssdk', () => {
          if (globalScope.FB) {
            globalScope.FB.XFBML.parse(); // Parse and render Facebook social plugins
          }
        });
      } else {
        globalScope.FB.XFBML.parse(); // Re-parse if FB API is already loaded
      }
    },
    twitter: function (instanceRef) {
      const btnConfig = instanceRef.moduleOptions.serviceButtons.twitter;
      const targetUrl = isValueEmpty(btnConfig.buttonUrl) ? instanceRef.moduleOptions.targetUrl : btnConfig.buttonUrl;
      jq(instanceRef.widgetContainer).find('.ssk-buttons').append(
        `<div class="ssk-button twitter"><a href="https://twitter.com/share" class="twitter-share-button" data-url="${targetUrl}" data-count="${btnConfig.countStyle}" data-text="${instanceRef.moduleOptions.contentDescription}" data-via="${btnConfig.viaAccount}" data-hashtags="${btnConfig.hashtags}" data-related="${btnConfig.relatedAccounts}" data-lang="${btnConfig.language}">Tweet</a></div>`
      );

      if (typeof globalScope.twttr === 'undefined') {
        scriptInjector('https://platform.twitter.com/widgets.js', 'twitter-wjs');
      } else {
        // Re-initialize existing Twitter widgets if the script is already loaded
        jq.ajax({ url: 'https://platform.twitter.com/widgets.js', dataType: 'script', cache: true });
      }
    },
    digg: function (instanceRef) {
      const btnConfig = instanceRef.moduleOptions.serviceButtons.digg;
      const targetUrl = isValueEmpty(btnConfig.buttonUrl) ? instanceRef.moduleOptions.targetUrl : btnConfig.buttonUrl;
      jq(instanceRef.widgetContainer).find('.ssk-buttons').append(
        `<div class="ssk-button digg"><a class="DiggThisButton ${btnConfig.buttonType}" rel="nofollow external" href="https://digg.com/submit?url=${_encodeUrlComponent(targetUrl)}"></a></div>`
      );

      if (typeof globalScope.__DBW === 'undefined') {
        scriptInjector('https://widgets.digg.com/buttons.js', 'digg-wjs');
      }
    },
    delicious: function (instanceRef) {
      const btnConfig = instanceRef.moduleOptions.serviceButtons.delicious;
      let cssStyling = { // Define CSS properties for Delicious button based on size
        main: '', count: '', share: ''
      };

      if (btnConfig.buttonSize === 'tall') {
        cssStyling.main = 'width:50px;';
        cssStyling.count = 'height:35px;width:50px;font-size:15px;line-height:35px;';
        cssStyling.share = 'height:18px;line-height:18px;margin-top:3px;';
      } else { // 'medium' is default
        cssStyling.main = 'width:93px;';
        cssStyling.count = 'float:right;padding:0 3px;height:20px;width:26px;line-height:20px;';
        cssStyling.share = 'float:left;height:20px;line-height:20px;';
      }

      // Format the Delicious count for display
      let currentCount = instanceRef.formatLargeNumber(instanceRef.moduleOptions.serviceCounters.delicious || 0);

      jq(instanceRef.widgetContainer).find('.ssk-buttons').append(
        `<div class="ssk-button delicious"><div style="${cssStyling.main}font:12px Arial,Helvetica,sans-serif;cursor:pointer;color:#666;display:inline-block;float:none;height:20px;line-height:normal;margin:0;padding:0;text-indent:0;vertical-align:baseline;">` +
        `<div style="${cssStyling.count}background-color:#fff;margin-bottom:5px;overflow:hidden;text-align:center;border:1px solid #ccc;border-radius:3px;">${currentCount}</div>` +
        `<div style="${cssStyling.share}display:block;padding:0;text-align:center;text-decoration:none;width:50px;background-color:#7EACEE;border:1px solid #40679C;border-radius:3px;color:#fff;">` +
        `<img src="https://www.delicious.com/static/img/delicious.small.gif" height="10" width="10" alt="Delicious" /> Add</div></div></div>`
      );

      // Attach click handler to open Delicious popup
      jq(instanceRef.widgetContainer).find('.delicious').on('click', function () {
        instanceRef.openShareDialog('delicious');
      });
    },
    stumbleupon: function (instanceRef) {
      const btnConfig = instanceRef.moduleOptions.serviceButtons.stumbleupon;
      const targetUrl = isValueEmpty(btnConfig.buttonUrl) ? instanceRef.moduleOptions.targetUrl : btnConfig.buttonUrl;
      jq(instanceRef.widgetContainer).find('.ssk-buttons').append(
        `<div class="ssk-button stumbleupon"><su:badge layout="${btnConfig.layoutStyle}" location="${targetUrl}"></su:badge></div>`
      );

      if (typeof globalScope.STMBLPN === 'undefined') {
        scriptInjector('https://platform.stumbleupon.com/1/widgets.js', 'stumbleupon-wjs', () => {
          let retryCount = 0;
          const maxRetries = 10;
          // Periodically check for STMBLPN object and process widgets
          const checkStumbleUpon = setInterval(() => {
            if (globalScope.STMBLPN && typeof globalScope.STMBLPN.processWidgets === 'function') {
              globalScope.STMBLPN.processWidgets();
              clearInterval(checkStumbleUpon);
            } else if (retryCount >= maxRetries) {
              console.warn('ShareKit: StumbleUpon widgets did not load after multiple retries.');
              clearInterval(checkStumbleUpon);
            }
            retryCount++;
          }, 500);
        });
      } else {
        globalScope.STMBLPN.processWidgets(); // Process widgets if API is already loaded
      }
    },
    linkedin: function (instanceRef) {
      const btnConfig = instanceRef.moduleOptions.serviceButtons.linkedin;
      const targetUrl = isValueEmpty(btnConfig.buttonUrl) ? instanceRef.moduleOptions.targetUrl : btnConfig.buttonUrl;
      jq(instanceRef.widgetContainer).find('.ssk-buttons').append(
        `<div class="ssk-button linkedin"><script type="in/share" data-url="${targetUrl}" data-counter="${btnConfig.counterPosition}"></script></div>`
      );

      if (typeof globalScope.IN === 'undefined') {
        scriptInjector('https://platform.linkedin.com/in.js', 'linkedin-wjs', () => {
          if (globalScope.IN) globalScope.IN.init(); // Initialize LinkedIn API
        });
      } else {
        globalScope.IN.init(); // Re-initialize if API is already loaded
      }
    },
    pinterest: function (instanceRef) {
      const btnConfig = instanceRef.moduleOptions.serviceButtons.pinterest;
      const targetUrl = isValueEmpty(btnConfig.buttonUrl) ? instanceRef.moduleOptions.targetUrl : btnConfig.buttonUrl;
      jq(instanceRef.widgetContainer).find('.ssk-buttons').append(
        `<div class="ssk-button pinterest"><a href="https://pinterest.com/pin/create/button/?url=${_encodeUrlComponent(targetUrl)}&media=${_encodeUrlComponent(btnConfig.mediaUrl)}&description=${_encodeUrlComponent(btnConfig.descriptionText)}" class="pin-it-button" count-layout="${btnConfig.layoutStyle}">Pin It</a></div>`
      );

      scriptInjector('https://assets.pinterest.com/js/pinit.js', 'pinterest-wjs');
    }
  };

  // Google Analytics tracking integration for social actions
  const analyticsHandlers = {
    googlePlus: function () {
      // Google+ button tracking with _gaq is complex and not directly event-driven.
      // This function serves as a placeholder but typically requires custom implementation.
    },
    facebook: function () {
      let fbCheckInterval = null;
      fbCheckInterval = globalScope.setInterval(function () {
        if (typeof globalScope.FB !== 'undefined' && globalScope._gaq) { // Check for both FB API and _gaq object
          globalScope.FB.Event.subscribe('edge.create', function (targetUrl) {
            globalScope._gaq.push(['_trackSocial', 'facebook', 'like', targetUrl]);
          });
          globalScope.FB.Event.subscribe('edge.remove', function (targetUrl) {
            globalScope._gaq.push(['_trackSocial', 'facebook', 'unlike', targetUrl]);
          });
          globalScope.FB.Event.subscribe('message.send', function (targetUrl) {
            globalScope._gaq.push(['_trackSocial', 'facebook', 'send', targetUrl]);
          });
          globalScope.clearInterval(fbCheckInterval); // Stop polling once events are subscribed
        }
      }, 1000);
    },
    twitter: function () {
      let twCheckInterval = null;
      twCheckInterval = globalScope.setInterval(function () {
        if (typeof globalScope.twttr !== 'undefined' && globalScope._gaq) { // Check for both Twitter API and _gaq object
          globalScope.twttr.events.bind('tweet', function (event) {
            if (event) {
              globalScope._gaq.push(['_trackSocial', 'twitter', 'tweet']);
            }
          });
          globalScope.clearInterval(twCheckInterval); // Stop polling once events are bound
        }
      }, 1000);
    },
    digg: function () {
      // Digg button tracking typically requires custom event listeners or specific API integration.
    },
    delicious: function () {
      // No standard analytics tracking for Delicious button clicks.
    },
    stumbleupon: function () {
      // No standard analytics tracking for StumbleUpon button clicks.
    },
    linkedin: function () {
      // LinkedIn tracking can be achieved by exposing a global function that the LinkedIn script calls.
      if (globalScope._gaq) {
        globalScope.LinkedInShare = function () { // This function must be globally accessible for LinkedIn's callback
          globalScope._gaq.push(['_trackSocial', 'linkedin', 'share']);
        };
      }
    },
    pinterest: function () {
      // Pinterest tracking is not directly supported via _gaq for button clicks.
    }
  };

  // Functions to open sharing popup windows for each social service
  const popupWindows = {
    googlePlus: function (opts) {
      const btnConfig = opts.serviceButtons.googlePlus;
      const shareUrl = isValueEmpty(btnConfig.buttonUrl) ? opts.targetUrl : btnConfig.buttonUrl;
      globalScope.open("https://plus.google.com/share?hl=" + btnConfig.language + "&url=" + _encodeUrlComponent(shareUrl), "", "toolbar=0,status=0,width=900,height=500");
    },
    facebook: function (opts) {
      const btnConfig = opts.serviceButtons.facebook;
      const shareUrl = isValueEmpty(btnConfig.buttonUrl) ? opts.targetUrl : btnConfig.buttonUrl;
      globalScope.open("https://www.facebook.com/sharer/sharer.php?u=" + _encodeUrlComponent(shareUrl) + "&t=" + _encodeUrlComponent(opts.contentDescription), "", "toolbar=0,status=0,width=900,height=500");
    },
    twitter: function (opts) {
      const btnConfig = opts.serviceButtons.twitter;
      const shareUrl = isValueEmpty(btnConfig.buttonUrl) ? opts.targetUrl : btnConfig.buttonUrl;
      const viaParam = isValueEmpty(btnConfig.viaAccount) ? '' : `&via=${btnConfig.viaAccount}`;
      globalScope.open(`https://twitter.com/intent/tweet?text=${_encodeUrlComponent(opts.contentDescription)}&url=${_encodeUrlComponent(shareUrl)}${viaParam}`, "", "toolbar=0,status=0,width=650,height=360");
    },
    digg: function (opts) {
      const btnConfig = opts.serviceButtons.digg;
      const shareUrl = isValueEmpty(btnConfig.buttonUrl) ? opts.targetUrl : btnConfig.buttonUrl;
      globalScope.open("https://digg.com/tools/diggthis/submit?url=" + _encodeUrlComponent(shareUrl) + "&title=" + _encodeUrlComponent(opts.contentDescription) + "&related=true&style=true", "", "toolbar=0,status=0,width=650,height=360");
    },
    delicious: function (opts) {
      const btnConfig = opts.serviceButtons.delicious;
      const shareUrl = isValueEmpty(btnConfig.buttonUrl) ? opts.targetUrl : btnConfig.buttonUrl;
      globalScope.open('https://www.delicious.com/save?v=5&noui&jump=close&url=' + _encodeUrlComponent(shareUrl) + '&title=' + _encodeUrlComponent(opts.contentDescription), 'deliciousShare', 'toolbar=no,width=550,height=550');
    },
    stumbleupon: function (opts) {
      const btnConfig = opts.serviceButtons.stumbleupon;
      const shareUrl = isValueEmpty(btnConfig.buttonUrl) ? opts.targetUrl : btnConfig.buttonUrl;
      globalScope.open('https://www.stumbleupon.com/badge/?url=' + _encodeUrlComponent(shareUrl), 'stumbleuponShare', 'toolbar=no,width=550,height=550');
    },
    linkedin: function (opts) {
      const btnConfig = opts.serviceButtons.linkedin;
      const shareUrl = isValueEmpty(btnConfig.buttonUrl) ? opts.targetUrl : btnConfig.buttonUrl;
      globalScope.open('https://www.linkedin.com/cws/share?url=' + _encodeUrlComponent(shareUrl) + '&token=&isFramed=true', 'linkedinShare', 'toolbar=no,width=550,height=550');
    },
    pinterest: function (opts) {
      const btnConfig = opts.serviceButtons.pinterest;
      const shareUrl = isValueEmpty(btnConfig.buttonUrl) ? opts.targetUrl : btnConfig.buttonUrl;
      globalScope.open('https://pinterest.com/pin/create/button/?url=' + _encodeUrlComponent(shareUrl) + '&media=' + _encodeUrlComponent(btnConfig.mediaUrl) + '&description=' + _encodeUrlComponent(btnConfig.descriptionText), 'pinterestShare', 'toolbar=no,width=700,height=300');
    }
  };

  // Main constructor for the ShareWidgetModule
  function ShareWidgetModule(widgetContainer, moduleOptions) {
    if (!(widgetContainer instanceof jq)) {
      console.error('ShareKit: Initialization error: Invalid jQuery element provided as container.');
      return; // Exit if container is not a valid jQuery object
    }
    this.widgetContainer = widgetContainer;

    // Deep merge of user-provided options with the base configuration
    this.moduleOptions = jq.extend(true, {}, baseConfiguration, moduleOptions);

    // Special handling to preserve explicit ordering of active services if provided
    if (moduleOptions && moduleOptions.activeServices) {
      this.moduleOptions.activeServices = moduleOptions.activeServices;
    }

    this._initialConfig = baseConfiguration; // Store a reference to the base config
    this._moduleName = moduleIdentifier; // Store the module's identifier

    this.initialize(); // Begin module initialization
  }

  // Prototype methods for the ShareWidgetModule
  ShareWidgetModule.prototype = {
    constructor: ShareWidgetModule, // Explicitly set constructor reference

    // Initializes the sharing widget: sets up configuration, fetches data, and binds events
    initialize: function () {
      const instanceRef = this; // Capture 'this' for use in nested functions and callbacks
      console.info('ShareKit: Initializing widget for URL:', instanceRef.moduleOptions.targetUrl);

      // Dynamically configure PHP proxy endpoints if a proxy endpoint is provided
      if (!isValueEmpty(this.moduleOptions.phpProxyEndpoint)) {
        apiEndpoints.googlePlus = this.moduleOptions.phpProxyEndpoint + '?url={url}&type=googlePlus';
        apiEndpoints.stumbleupon = this.moduleOptions.phpProxyEndpoint + '?url={url}&type=stumbleupon';
      }

      // Add the base CSS class to the widget's container element
      jq(this.widgetContainer).addClass(this.moduleOptions.containerClass);

      // Override configuration options using HTML5 data attributes on the container element
      const containerData = jq(this.widgetContainer).data();
      if (containerData.title) {
        this.moduleOptions.contentTitle = containerData.title;
      }
      if (containerData.url) {
        this.moduleOptions.targetUrl = containerData.url;
      }
      if (containerData.text) {
        this.moduleOptions.contentDescription = containerData.text;
      }

      // Calculate the total number of enabled social services
      this.moduleOptions.enabledServiceCount = 0; // Reset before recalculating
      jq.each(this.moduleOptions.activeServices, function (serviceName, isEnabled) {
        if (isEnabled) {
          instanceRef.moduleOptions.enabledServiceCount++;
        }
      });

      // Fetch share counts from social networks if count display is enabled
      if (this.moduleOptions.displayCountValues) {
        jq.each(this.moduleOptions.activeServices, function (serviceName, isEnabled) {
          if (isEnabled) {
            instanceRef.fetchSocialData(serviceName); // Initiate data fetching for each active service
          }
        });
      } else if (!isValueEmpty(this.moduleOptions.customLayoutMarkup)) {
        // If counts are disabled but a custom template is provided, trigger the render callback
        this.moduleOptions.onRenderComplete(this, this.moduleOptions);
      } else {
        // If counts are disabled and no custom template, directly render the social buttons
        this.renderServiceButtons();
      }

      // Attach hover event handlers to the widget container if hover effects are enabled
      if (this.moduleOptions.activateHoverEffects) {
        jq(this.widgetContainer).on('mouseenter', function () {
          // Load buttons only once, on the first hover, if they haven't been rendered yet
          if (jq(this).find('.ssk-buttons').length === 0) {
            instanceRef.renderServiceButtons();
          }
          instanceRef.moduleOptions.onHoverCallback(instanceRef, instanceRef.moduleOptions); // Execute custom hover callback
        }).on('mouseleave', function () {
          instanceRef.moduleOptions.onHideCallback(instanceRef, instanceRef.moduleOptions); // Execute custom hide callback
        });
      }

      // Attach a click event handler to the widget container
      jq(this.widgetContainer).on('click', function (evt) {
        evt.preventDefault(); // Prevent default link or button behavior
        instanceRef.moduleOptions.onClickCallback(instanceRef, instanceRef.moduleOptions); // Execute custom click callback
      });
    },

    // Renders the actual social media buttons within the widget container
    renderServiceButtons: function () {
      const instanceRef = this;
      // Check if the buttons container already exists to prevent duplicate rendering
      if (jq(this.widgetContainer).find('.ssk-buttons').length > 0) {
        console.warn('ShareKit: Buttons container already present. Skipping re-render.');
        return;
      }
      jq(this.widgetContainer).append('<div class="ssk-buttons"></div>'); // Append a new container for buttons

      // Iterate through active services and invoke their respective button loading functions
      jq.each(instanceRef.moduleOptions.activeServices, function (serviceName, isEnabled) {
        if (isEnabled && componentLoaders[serviceName]) {
          componentLoaders[serviceName](instanceRef); // Load the specific service's button
          if (instanceRef.moduleOptions.enableAnalyticsTracking && analyticsHandlers[serviceName]) {
            analyticsHandlers[serviceName](); // Initialize analytics tracking for this service if enabled
          }
        }
      });
    },

    // Fetches share count data from the respective social network APIs
    fetchSocialData: function (serviceName) {
      const instanceRef = this;
      let currentCount = 0;
      let apiUrl = apiEndpoints[serviceName];

      // Determine the URL to be counted, prioritizing button-specific URL if specified
      const btnConfig = this.moduleOptions.serviceButtons[serviceName];
      let urlToCount = this.moduleOptions.targetUrl;
      if (btnConfig && btnConfig.useButtonUrlForCount && !isValueEmpty(btnConfig.buttonUrl)) {
        urlToCount = btnConfig.buttonUrl;
      }

      // Replace the URL placeholder in the API endpoint with the actual URL to count
      if (apiUrl) {
        apiUrl = apiUrl.replace('{url}', _encodeUrlComponent(urlToCount));
      }

      // Proceed with fetching only if a valid API URL exists and proxy isn't required or is configured
      if (!isValueEmpty(apiUrl) && (!isValueEmpty(this.moduleOptions.phpProxyEndpoint) || !(serviceName === 'googlePlus' || serviceName === 'stumbleupon'))) {
        jq.getJSON(apiUrl)
          .done(function (jsonData) {
            try {
              // Parse the share count from the JSON response, handling service-specific formats
              if (jsonData && typeof jsonData.count !== "undefined") { // Common for GooglePlus (proxy), Twitter, Pinterest, Digg
                const cleanedCountStr = (jsonData.count + '').replace(/\u00c2\u00a0/g, ''); // Clean special characters
                currentCount = parseInt(cleanedCountStr, 10) || 0;
              } else if (jsonData && jsonData.data && jsonData.data.length > 0 && typeof jsonData.data[0].total_count !== "undefined") { // Facebook total count
                currentCount = parseInt(jsonData.data[0].total_count, 10) || 0;
              } else if (jsonData && jsonData[0] && typeof jsonData[0].total_posts !== "undefined") { // Delicious
                currentCount = parseInt(jsonData[0].total_posts, 10) || 0;
              } else if (jsonData && jsonData.shares && typeof jsonData.shares !== "undefined") { // LinkedIn often returns 'shares' property
                currentCount = parseInt(jsonData.shares, 10) || 0;
              }
              // For services like StumbleUpon, if proxy returns a simple count
              else if (jsonData && typeof jsonData.stumbleuponCount !== "undefined") {
                 currentCount = parseInt(jsonData.stumbleuponCount, 10) || 0;
              }
            } catch (parseError) {
              console.warn(`ShareKit: Error parsing count for ${serviceName}:`, parseError);
              currentCount = 0; // Default to 0 on parsing error
            }

            instanceRef.moduleOptions.serviceCounters[serviceName] = currentCount; // Store individual service count
            instanceRef.moduleOptions.aggregateShareCount += currentCount; // Add to total aggregate count
            instanceRef.updateVisuals(); // Trigger internal visual update logic
            instanceRef.triggerCustomRender(); // Trigger custom render callback if all counts are in
          })
          .fail(function (jqXHR, textStatus, errorThrown) {
            console.warn(`ShareKit: Failed to fetch count for ${serviceName} from ${apiUrl}. Status: ${textStatus}, Error: ${errorThrown}`);
            instanceRef.moduleOptions.serviceCounters[serviceName] = 0; // Default to 0 on API fetch failure
            instanceRef.updateVisuals();
            instanceRef.triggerCustomRender();
          });
      } else {
        // If API URL is missing or proxy is not configured for required service, default count to 0
        instanceRef.moduleOptions.serviceCounters[serviceName] = 0;
        instanceRef.updateVisuals();
        instanceRef.triggerCustomRender();
      }
    },

    // Triggers the user-defined custom render callback after all expected share counts have been processed
    triggerCustomRender: function () {
      let processedServiceCount = 0;
      for (let key in this.moduleOptions.serviceCounters) {
        if (this.moduleOptions.serviceCounters.hasOwnProperty(key)) {
          processedServiceCount++;
        }
      }

      // Call the custom render callback only when all enabled services have reported their counts
      if (processedServiceCount === this.moduleOptions.enabledServiceCount) {
        this.moduleOptions.onRenderComplete(this, this.moduleOptions);
      }
    },

    // Internal method to update visual components; primarily prepares data for onRenderComplete
    updateVisuals: function () {
      // This method's primary role is to ensure that the internal state (like aggregateShareCount)
      // is up-to-date. The actual visual rendering logic, especially when a template is used,
      // is typically handled by the `onRenderComplete` callback.
      // If no custom template, `componentLoaders` handle direct DOM injection.
    },

    // Helper function to format large numbers for display (e.g., 12000 becomes 12K)
    formatLargeNumber: function (num) {
      if (!this.moduleOptions.formatLargeNumber || typeof num !== 'number') {
        return num; // Return original number if formatting is disabled or input is not a number
      }
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'; // Format as millions
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // Format as thousands
      }
      return num; // Return number as is if less than 1000
    },

    // Opens a popup share dialog for a specified social service
    openShareDialog: function (service) {
      if (popupWindows[service]) {
        popupWindows[service](this.moduleOptions); // Invoke the appropriate popup handler
      } else {
        console.warn(`ShareKit: No popup handler found for service: ${service}`);
      }
    }
  };

  // jQuery plugin definition: allows initializing the ShareWidgetModule on selected elements
  jq.fn[moduleIdentifier] = function (options) {
    return this.each(function () {
      // Prevent multiple instantiations on the same DOM element
      if (!jq.data(this, 'plugin_' + moduleIdentifier)) {
        jq.data(this, 'plugin_' + moduleIdentifier, new ShareWidgetModule(jq(this), options));
      }
    });
  };

})(jQuery, window, document);