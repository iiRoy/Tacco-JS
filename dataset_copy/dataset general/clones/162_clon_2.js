/*!
 *  Socializer.js - Build your social sharing component!
 *  Release: alpha 1.3.5
 *  Creator: Julian Handy
 *  License: MIT https://en.wikipedia.org/wiki/MIT_License or GPLv2 https://en.wikipedia.org/wiki/GNU_General_Public_License
 */

;(function ( jQuery, globalObject, currentDocument, typeUndefined ) {

  /* Basic Configuration
  ================================================== */
  var componentID = 'socializer',
  initialSettings = {
    styleClass: 'socializer-widget',
    services: {
      searchEnginePlus: false,
      socialBook: false,
      microBlog: false,
      newsAggregator: false,
      bookmarkService: false,
      discoveryPlatform: false,
      professionalNetwork: false,
      visualBoard: false
    },
    totalShares: 0,
    layoutTemplate: '',
    pageTitle: '',
    resourceLink: currentDocument.location.href,
    contentText: currentDocument.title,
    apiProxyScript: 'socializer_proxy.php',  // Backend script for dynamic counts
    networkCounts: {}, // Shares per social network
    grandTotal: 0,  // Overall share count
    abbreviateCounts: true, // Display total as K or M for large numbers
    activateHover: true, // Disable to customize hover event via callback
    activateCounter: true, // Disable to use only buttons without counts
    activateAnalytics: false, // Enable tracking with analytics
    onMouseOver: function(){}, // Custom hover event callback
    onMouseOut: function(){}, // Custom hide event callback
    onInteraction: function(){}, // Custom click event callback
    onDisplay: function(){}, // Custom render event callback
    buttonConfigs: {  // Settings for individual buttons
      searchEnginePlus : {  // https://developers.google.com/+/web/buttons-policies
        buttonLink: '',  // Custom button URL
        linkCountOverride: false,  // Use custom URL for global counter
        displaySize: 'medium',
        languageCode: 'en-US',
        annotationType: ''
      },
      socialBook: { // https://developers.facebook.com/docs/plugins/like-button/
        buttonLink: '',  // Custom button URL
        linkCountOverride: false,  // Use custom URL for global counter
        interactionType: 'like',
        visualLayout: 'button_count',
        elementWidth: '',
        enableSend: 'false',
        showFaces: 'false',
        colorTheme: '',
        fontFamily: '',
        languageCode: 'en_US'
      },
      microBlog: {  // https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/overview
        buttonLink: '',  // Custom button URL
        linkCountOverride: false,  // Use custom URL for global counter
        countStyle: 'horizontal',
        tagHashes: '',
        viaAccount: '',
        relatedAccounts: '',
        languageCode: 'en'
      },
      newsAggregator: { // http://about.digg.com/downloads/button/smart
        buttonLink: '',  // Custom button URL
        linkCountOverride: false,  // Use custom URL for global counter
        buttonType: 'DiggCompact'
      },
      bookmarkService: {
        buttonLink: '',  // Custom button URL
        linkCountOverride: false,  // Use custom URL for global counter
        displaySize: 'medium' // medium or tall
      },
      discoveryPlatform: {  // https://www.stumbleupon.com/badges/
        buttonLink: '',  // Custom button URL
        linkCountOverride: false,  // Use custom URL for global counter
        visualLayout: '1'
      },
      professionalNetwork: {  // https://developer.linkedin.com/plugins/share-button
        buttonLink: '',  // Custom button URL
        linkCountOverride: false,  // Use custom URL for global counter
        counterStyle: ''
      },
      visualBoard: { // https://developers.pinterest.com/tools/save/
        buttonLink: '',  // Custom button URL
        mediaResource: '',
        itemDescription: '',
        visualLayout: 'horizontal'
      }
    }
  },
  /* JSON URLs to retrieve share counts
  ================================================== */
  apiEndpoints = {
    searchEnginePlus: "",

	// New FQL approach by an expert
	socialBook: "https://graph.facebook.com/fql?q=SELECT%20url,%20normalized_url,%20share_count,%20like_count,%20comment_count,%20total_count,commentsbox_count,%20comments_fbid,%20click_count%20FROM%20link_stat%20WHERE%20url=%27{web_address}%27&callback=?",
    // Previous Facebook method: "http://graph.facebook.com/?id={web_address}&callback=?",
    // socialBook : "http://api.ak.facebook.com/restserver.php?v=1.0&method=links.getStats&urls={web_address}&format=json"
    
    microBlog: "http://cdn.api.twitter.com/1/urls/count.json?url={web_address}&callback=?",
    newsAggregator: "http://services.digg.com/2.0/story.getInfo?links={web_address}&type=javascript&callback=?",
    bookmarkService: 'http://feeds.delicious.com/v2/json/urlinfo/data?url={web_address}&callback=?',
    // discoveryPlatform: "http://www.stumbleupon.com/services/1.01/badge.getinfo?url={web_address}&format=jsonp&callback=?",
    discoveryPlatform: "",
    professionalNetwork: "http://www.linkedin.com/countserv/count/share?format=jsonp&url={web_address}&callback=?",
    visualBoard: "http://api.pinterest.com/v1/urls/count.json?url={web_address}&callback=?"
  },
  /* Asynchronously load social sharing buttons
  ================================================== */
  widgetLoaders = {
    searchEnginePlus : function(instanceRef){
      var currentButtonSettings = instanceRef.configuredOptions.buttonConfigs.searchEnginePlus;
      // jQuery(instanceRef.targetElement).find('.widgets').append('<div class="button search-engine-plus"><g:plusone size="'+instanceRef.configuredOptions.buttonConfigs.searchEnginePlus.displaySize+'" href="'+instanceRef.configuredOptions.resourceLink+'"></g:plusone></div>');
      jQuery(instanceRef.targetElement).find('.widgets').append('<div class="button search-engine-plus"><div class="g-plusone" data-size="'+currentButtonSettings.displaySize+'" data-href="'+(currentButtonSettings.buttonLink !== '' ? currentButtonSettings.buttonLink : instanceRef.configuredOptions.resourceLink)+'" data-annotation="'+currentButtonSettings.annotationType+'"></div></div>');
      globalObject.___gcfg = {
        lang: instanceRef.configuredOptions.buttonConfigs.searchEnginePlus.languageCode
      };
      var scriptLoadingState = 0;
      if(typeof gapi === typeUndefined && scriptLoadingState == 0){
        scriptLoadingState = 1;
        (function() {
          var scriptElement = currentDocument.createElement('script'); scriptElement.type = 'text/javascript'; scriptElement.async = true;
          scriptElement.src = '//apis.google.com/js/plusone.js';
          var firstScriptTag = currentDocument.getElementsByTagName('script')[0]; firstScriptTag.parentNode.insertBefore(scriptElement, firstScriptTag);
        })();
      }
      else{
        gapi.plusone.go();
      }
    },
    socialBook : function(instanceRef){
      var currentButtonSettings = instanceRef.configuredOptions.buttonConfigs.socialBook;
      jQuery(instanceRef.targetElement).find('.widgets').append('<div class="button social-book"><div id="fb-root"></div><div class="fb-like" data-href="'+(currentButtonSettings.buttonLink !== '' ? currentButtonSettings.buttonLink : instanceRef.configuredOptions.resourceLink)+'" data-send="'+currentButtonSettings.enableSend+'" data-layout="'+currentButtonSettings.visualLayout+'" data-width="'+currentButtonSettings.elementWidth+'" data-show-faces="'+currentButtonSettings.showFaces+'" data-action="'+currentButtonSettings.interactionType+'" data-colorscheme="'+currentButtonSettings.colorTheme+'" data-font="'+currentButtonSettings.fontFamily+'" data-via="'+currentButtonSettings.viaAccount+'"></div></div>');
      var scriptLoadingState = 0;
      if(typeof FB === typeUndefined && scriptLoadingState == 0){
        scriptLoadingState = 1;
        (function(documentObj, scriptTagName, uniqueId) {
          var newScript, firstScript = documentObj.getElementsByTagName(scriptTagName)[0];
          if (documentObj.getElementById(uniqueId)) {return;}
          newScript = documentObj.createElement(scriptTagName); newScript.id = uniqueId;
          newScript.src = '//connect.facebook.net/'+currentButtonSettings.languageCode+'/all.js#xfbml=1';
          firstScript.parentNode.insertBefore(newScript, firstScript);
        }(currentDocument, 'script', 'facebook-jssdk'));
      }
      else{
        FB.XFBML.parse();
      }
    },
    microBlog : function(instanceRef){
      var currentButtonSettings = instanceRef.configuredOptions.buttonConfigs.microBlog;
      jQuery(instanceRef.targetElement).find('.widgets').append('<div class="button micro-blog"><a href="https://twitter.com/share" class="twitter-share-button" data-url="'+(currentButtonSettings.buttonLink !== '' ? currentButtonSettings.buttonLink : instanceRef.configuredOptions.resourceLink)+'" data-count="'+currentButtonSettings.countStyle+'" data-text="'+instanceRef.configuredOptions.contentText+'" data-via="'+currentButtonSettings.viaAccount+'" data-hashtags="'+currentButtonSettings.tagHashes+'" data-related="'+currentButtonSettings.relatedAccounts+'" data-lang="'+currentButtonSettings.languageCode+'">Tweet</a></div>');
      var scriptLoadingState = 0;
      if(typeof twttr === typeUndefined && scriptLoadingState == 0){
        scriptLoadingState = 1;
        (function() {
          var microBlogScript = currentDocument.createElement('script');
          microBlogScript.type = 'text/javascript';
          microBlogScript.async = true;
          microBlogScript.src = '//platform.twitter.com/widgets.js';
          var firstScriptTag = currentDocument.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(microBlogScript, firstScriptTag);
        })();
      }
      else{
        jQuery.ajax({ url: '//platform.twitter.com/widgets.js', dataType: 'script', cache:true}); // https://stackoverflow.com/q/6536108
      }
    },
    newsAggregator : function(instanceRef){
      var currentButtonSettings = instanceRef.configuredOptions.buttonConfigs.newsAggregator;
      jQuery(instanceRef.targetElement).find('.widgets').append('<div class="button news-aggregator"><a class="DiggThisButton '+currentButtonSettings.buttonType+'" rel="nofollow external" href="http://digg.com/submit?url='+encodeURIComponent((currentButtonSettings.buttonLink !== '' ? currentButtonSettings.buttonLink : instanceRef.configuredOptions.resourceLink))+'"></a></div>');
      var scriptLoadingState = 0;
      if(typeof __DBW === typeUndefined && scriptLoadingState == 0){
        scriptLoadingState = 1;
        (function() {
          var newScriptElement = currentDocument.createElement('SCRIPT'), referenceScript = currentDocument.getElementsByTagName('SCRIPT')[0];
          newScriptElement.type = 'text/javascript';
          newScriptElement.async = true;
          newScriptElement.src = '//widgets.digg.com/buttons.js';
          referenceScript.parentNode.insertBefore(newScriptElement, referenceScript);
        })();
      }
    },
    bookmarkService : function(instanceRef){
      if(instanceRef.configuredOptions.buttonConfigs.bookmarkService.displaySize == 'tall'){//Tall display
        var generalStyle = 'width:50px;',
        countStyle = 'height:35px;width:50px;font-size:15px;line-height:35px;',
        shareStyle = 'height:18px;line-height:18px;margin-top:3px;';
      }
      else{//Medium display
        var generalStyle = 'width:93px;',
        countStyle = 'float:right;padding:0 3px;height:20px;width:26px;line-height:20px;',
        shareStyle = 'float:left;height:20px;line-height:20px;';
      }
      var itemCount = instanceRef.shorterTotal(instanceRef.configuredOptions.networkCounts.bookmarkService);
      if(typeof itemCount === typeUndefined){
        itemCount = 0;
      }
      jQuery(instanceRef.targetElement).find('.widgets').append(
      '<div class="button bookmark-service"><div style="'+generalStyle+'font:12px Arial,Helvetica,sans-serif;cursor:pointer;color:#666666;display:inline-block;float:none;height:20px;line-height:normal;margin:0;padding:0;text-indent:0;vertical-align:baseline;">'+
      '<div style="'+countStyle+'background-color:#fff;margin-bottom:5px;overflow:hidden;text-align:center;border:1px solid #ccc;border-radius:3px;">'+itemCount+'</div>'+
      '<div style="'+shareStyle+'display:block;padding:0;text-align:center;text-decoration:none;width:50px;background-color:#7EACEE;border:1px solid #40679C;border-radius:3px;color:#fff;">'+
      '<img src="http://www.delicious.com/static/img/delicious.small.gif" height="10" width="10" alt="Delicious" /> Add</div></div></div>');
      
      jQuery(instanceRef.targetElement).find('.bookmark-service').on('click', function(){
        instanceRef.openPopup('bookmarkService');
      });
    },
    discoveryPlatform : function(instanceRef){
      var currentButtonSettings = instanceRef.configuredOptions.buttonConfigs.discoveryPlatform;
      jQuery(instanceRef.targetElement).find('.widgets').append('<div class="button discovery-platform"><su:badge layout="'+currentButtonSettings.visualLayout+'" location="'+(currentButtonSettings.buttonLink !== '' ? currentButtonSettings.buttonLink : instanceRef.configuredOptions.resourceLink)+'"></su:badge></div>');
      var scriptLoadingState = 0;
      if(typeof STMBLPN === typeUndefined && scriptLoadingState == 0){
        scriptLoadingState = 1;
        (function() {
          var scriptNode = currentDocument.createElement('script');scriptNode.type = 'text/javascript';scriptNode.async = true;
          scriptNode.src = '//platform.stumbleupon.com/1/widgets.js'; 
          var firstScriptTag = currentDocument.getElementsByTagName('script')[0];firstScriptTag.parentNode.insertBefore(scriptNode, firstScriptTag);
        })();
        s = globalObject.setTimeout(function(){
          if(typeof STMBLPN !== typeUndefined){
            STMBLPN.processWidgets();
            globalObject.clearInterval(s);
          }
        },500);
      }
      else{
        STMBLPN.processWidgets();
      }
    },
    professionalNetwork : function(instanceRef){
      var currentButtonSettings = instanceRef.configuredOptions.buttonConfigs.professionalNetwork;
      jQuery(instanceRef.targetElement).find('.widgets').append('<div class="button professional-network"><script type="in/share" data-url="'+(currentButtonSettings.buttonLink !== '' ? currentButtonSettings.buttonLink : instanceRef.configuredOptions.resourceLink)+'" data-counter="'+currentButtonSettings.counterStyle+'"></script></div>');
      var scriptLoadingState = 0;
      if(typeof globalObject.IN === typeUndefined && scriptLoadingState == 0){
        scriptLoadingState = 1;
        (function() {
          var scriptNode = currentDocument.createElement('script');scriptNode.type = 'text/javascript';scriptNode.async = true;
          scriptNode.src = '//platform.linkedin.com/in.js'; 
          var firstScriptTag = currentDocument.getElementsByTagName('script')[0];firstScriptTag.parentNode.insertBefore(scriptNode, firstScriptTag);
        })();
      }
      else{
        globalObject.IN.init();
      }
    },
    visualBoard : function(instanceRef){
      var currentButtonSettings = instanceRef.configuredOptions.buttonConfigs.visualBoard;
      jQuery(instanceRef.targetElement).find('.widgets').append('<div class="button visual-board"><a href="http://pinterest.com/pin/create/button/?url='+(currentButtonSettings.buttonLink !== '' ? currentButtonSettings.buttonLink : instanceRef.configuredOptions.resourceLink)+'&media='+currentButtonSettings.mediaResource+'&description='+currentButtonSettings.itemDescription+'" class="pin-it-button" count-layout="'+currentButtonSettings.visualLayout+'">Pin It</a></div>');

      (function() {
        var scriptNode = currentDocument.createElement('script');scriptNode.type = 'text/javascript';scriptNode.async = true;
        scriptNode.src = '//assets.pinterest.com/js/pinit.js'; 
        var firstScriptTag = currentDocument.getElementsByTagName('script')[0];firstScriptTag.parentNode.insertBefore(scriptNode, firstScriptTag);
      })();
    }
  },
  /* Tracking for analytics services
  ================================================== */
  analyticsHandlers = {
    searchEnginePlus: function(){},
    socialBook: function(){
      //console.log('socialBook');
      bookFaceInterval = globalObject.setInterval(function(){
        if (typeof FB !== typeUndefined) {
          FB.Event.subscribe('edge.create', function(trackedUrl) {
            _gaq.push(['_trackSocial', 'socialBook', 'like', trackedUrl]);
          });
          FB.Event.subscribe('edge.remove', function(trackedUrl) {
            _gaq.push(['_trackSocial', 'socialBook', 'unlike', trackedUrl]);
          });
          FB.Event.subscribe('message.send', function(trackedUrl) {
            _gaq.push(['_trackSocial', 'socialBook', 'send', trackedUrl]);
          });
          //console.log('OK');
          globalObject.clearInterval(bookFaceInterval);
        }
      },1000);
    },
    microBlog: function(){
      //console.log('microBlog');
      microBlogInterval = globalObject.setInterval(function(){
        if (typeof twttr !== typeUndefined) {
          twttr.events.bind('tweet', function(eventData) {
            if (eventData) {
              _gaq.push(['_trackSocial', 'microBlog', 'tweet']);
            }
          });
          //console.log('OK');
          globalObject.clearInterval(microBlogInterval);
        }
      },1000);
    },
    newsAggregator: function(){
      // If a solution is found, please reach out!
      /*jQuery(this.targetElement).find('.news-aggregator').on('click', function(){
        _gaq.push(['_trackSocial', 'newsAggregator', 'add']);
      });*/
    },
    bookmarkService: function(){},
    discoveryPlatform: function(){},
    professionalNetwork: function(){
      function LinkedInShareEvent() {
        _gaq.push(['_trackSocial', 'professionalNetwork', 'share']);
      }
    },
    visualBoard: function(){
      // If a solution is found, please reach out!
    }
  },
  /* Popup windows for each social platform
  ================================================== */
  windowOpeners = {
    searchEnginePlus: function(popupOptions){
      globalObject.open("https://plus.google.com/share?hl="+popupOptions.buttonConfigs.searchEnginePlus.languageCode+"&url="+encodeURIComponent((popupOptions.buttonConfigs.searchEnginePlus.buttonLink !== '' ? popupOptions.buttonConfigs.searchEnginePlus.buttonLink : popupOptions.resourceLink)), "", "toolbar=0, status=0, width=900, height=500");
    },
    socialBook: function(popupOptions){
      globalObject.open("http://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent((popupOptions.buttonConfigs.socialBook.buttonLink !== '' ? popupOptions.buttonConfigs.socialBook.buttonLink : popupOptions.resourceLink))+"&t="+popupOptions.contentText+"", "", "toolbar=0, status=0, width=900, height=500");
    },
    microBlog: function(popupOptions){
      globalObject.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(popupOptions.contentText)+"&url="+encodeURIComponent((popupOptions.buttonConfigs.microBlog.buttonLink !== '' ? popupOptions.buttonConfigs.microBlog.buttonLink : popupOptions.resourceLink))+(popupOptions.buttonConfigs.microBlog.viaAccount !== '' ? '&via='+popupOptions.buttonConfigs.microBlog.viaAccount : ''), "", "toolbar=0, status=0, width=650, height=360");
    },
    newsAggregator: function(popupOptions){
      globalObject.open("http://digg.com/tools/diggthis/submit?url="+encodeURIComponent((popupOptions.buttonConfigs.newsAggregator.buttonLink !== '' ? popupOptions.buttonConfigs.newsAggregator.buttonLink : popupOptions.resourceLink))+"&title="+popupOptions.contentText+"&related=true&style=true", "", "toolbar=0, status=0, width=650, height=360");
    },
    bookmarkService: function(popupOptions){
      globalObject.open('http://www.delicious.com/save?v=5&noui&jump=close&url='+encodeURIComponent((popupOptions.buttonConfigs.bookmarkService.buttonLink !== '' ? popupOptions.buttonConfigs.bookmarkService.buttonLink : popupOptions.resourceLink))+'&title='+popupOptions.contentText, 'delicious', 'toolbar=no,width=550,height=550');
    },
    discoveryPlatform: function(popupOptions){
      globalObject.open('http://www.stumbleupon.com/badge/?url='+encodeURIComponent((popupOptions.buttonConfigs.discoveryPlatform.buttonLink !== '' ? popupOptions.buttonConfigs.discoveryPlatform.buttonLink : popupOptions.resourceLink)), 'stumbleupon', 'toolbar=no,width=550,height=550');
    },
    professionalNetwork: function(popupOptions){
      globalObject.open('https://www.linkedin.com/cws/share?url='+encodeURIComponent((popupOptions.buttonConfigs.professionalNetwork.buttonLink !== '' ? popupOptions.buttonConfigs.professionalNetwork.buttonLink : popupOptions.resourceLink))+'&token=&isFramed=true', 'linkedin', 'toolbar=no,width=550,height=550');
    },
    visualBoard: function(popupOptions){
      globalObject.open('http://pinterest.com/pin/create/button/?url='+encodeURIComponent((popupOptions.buttonConfigs.visualBoard.buttonLink !== '' ? popupOptions.buttonConfigs.visualBoard.buttonLink : popupOptions.resourceLink))+'&media='+encodeURIComponent(popupOptions.buttonConfigs.visualBoard.mediaResource)+'&description='+popupOptions.buttonConfigs.visualBoard.itemDescription, 'pinterest', 'toolbar=no,width=700,height=300');
    }
  };

  /* Widget Constructor
  ================================================== */
  function ShareWidget( domElement, userOptions ) {
    this.targetElement = domElement;
    
    this.configuredOptions = jQuery.extend( true, {}, initialSettings, userOptions);
    this.configuredOptions.services = userOptions.services; // Direct assignment to preserve button order
    
    this._baseSettings = initialSettings;
    this._widgetIdentifier = componentID;
    
    this.initializeWidget();
  };
  
  /* Widget Initialization Method
  ================================================== */
  ShareWidget.prototype.initializeWidget = function () {
    var instanceRef = this;
    if(this.configuredOptions.apiProxyScript !== ''){
      apiEndpoints.searchEnginePlus = this.configuredOptions.apiProxyScript + '?url={web_address}&type=searchEnginePlus'; // PHP script for Google+...
      apiEndpoints.discoveryPlatform = this.configuredOptions.apiProxyScript + '?url={web_address}&type=discoveryPlatform'; // PHP script for StumbleUpon...
    }
    jQuery(this.targetElement).addClass(this.configuredOptions.styleClass); // Add the main CSS class
    
    // Read HTML5 custom data attributes
    if(typeof jQuery(this.targetElement).data('pageTitle') !== typeUndefined){
      this.configuredOptions.pageTitle = jQuery(this.targetElement).attr('data-page-title');
    }
    if(typeof jQuery(this.targetElement).data('resourceLink') !== typeUndefined){
      this.configuredOptions.resourceLink = jQuery(this.targetElement).data('resource-link');
    }
    if(typeof jQuery(this.targetElement).data('contentText') !== typeUndefined){
      this.configuredOptions.contentText = jQuery(this.targetElement).data('content-text');
    }
    
    // Count how many social services are enabled
    jQuery.each(this.configuredOptions.services, function(serviceName, isEnabled) {
      if(isEnabled === true){
        instanceRef.configuredOptions.totalShares ++;
      }
    });
    
    if(instanceRef.configuredOptions.activateCounter === true){  // If counters are desired
      // Fetch share counts for each enabled social service
      jQuery.each(this.configuredOptions.services, function(serviceName, isEnabled) {
        if(isEnabled === true){
          //instanceRef.fetchSocialData(serviceName);
          try {
            instanceRef.fetchSocialData(serviceName);
          } catch(caughtError){
          }
        }
      });
    }
    else if(instanceRef.configuredOptions.layoutTemplate !== ''){  // For custom button layouts
      this.configuredOptions.onDisplay(this, this.configuredOptions);
    }
    else{ // For official buttons like in examples 3 or 5
      this.displayButtons();
    }
    
    // Set up hover events
    jQuery(this.targetElement).hover(function(){
      // Load social buttons if enabled and only once
      if(jQuery(this).find('.widgets').length === 0 && instanceRef.configuredOptions.activateHover === true){
        instanceRef.displayButtons();
      }
      instanceRef.configuredOptions.onMouseOver(instanceRef, instanceRef.configuredOptions);
    }, function(){
      instanceRef.configuredOptions.onMouseOut(instanceRef, instanceRef.configuredOptions);
    });
    
    // Set up click event
    jQuery(this.targetElement).on('click', function(){
      instanceRef.configuredOptions.onInteraction(instanceRef, instanceRef.configuredOptions);
      return false;
    });
  };
  
  /* Method to display the social buttons
  ================================================== */
  ShareWidget.prototype.displayButtons = function () {
    var instanceRef = this;
    jQuery(this.targetElement).append('<div class="widgets"></div>');
    jQuery.each(instanceRef.configuredOptions.services, function(serviceName, isEnabled) {
      if(isEnabled == true){
        widgetLoaders[serviceName](instanceRef);
        if(instanceRef.configuredOptions.activateAnalytics === true){ // Add analytics tracking
          analyticsHandlers[serviceName]();
        }
      }
    });
  };
  
  /* Method to retrieve social share data
  ================================================== */
  ShareWidget.prototype.fetchSocialData = function (networkName) {
    var instanceRef = this,
    networkCount = 0,
    requestUrl = apiEndpoints[networkName].replace('{web_address}', encodeURIComponent(this.configuredOptions.resourceLink));
    if(this.configuredOptions.buttonConfigs[networkName].linkCountOverride === true && this.configuredOptions.buttonConfigs[networkName].buttonLink !== ''){
      requestUrl = apiEndpoints[networkName].replace('{web_address}', this.configuredOptions.buttonConfigs[networkName].buttonLink);
    }
    //console.log('Service: ' + networkName + ' - URL: '+requestUrl); // Debugging line
    if(requestUrl != '' && instanceRef.configuredOptions.apiProxyScript !== ''){  // apiProxyScript = '' if a proxy is not used
      jQuery.getJSON(requestUrl, function(responseObj){
        if(typeof responseObj.count !== typeUndefined){  // Google+, StumbleUpon, Twitter, Pinterest, and Digg
          var tempString = responseObj.count + '';
          tempString = tempString.replace('\u00c2\u00a0', '');  // Remove specific Google+ characters
          networkCount += Number.parseInt(tempString, 10);
        }
		// Get the Facebook overall count (shares, likes, and more)
        else if(responseObj.data && responseObj.data.length > 0 && typeof responseObj.data[0].total_count !== typeUndefined){ // Facebook overall count
          networkCount += Number.parseInt(responseObj.data[0].total_count, 10);
        }
        else if(typeof responseObj[0] !== typeUndefined){  // Delicious
          networkCount += Number.parseInt(responseObj[0].total_posts, 10);
        }
        else if(typeof responseObj[0] !== typeUndefined){  // StumbleUpon (placeholder for specific data)
        }
        instanceRef.configuredOptions.networkCounts[networkName] = networkCount;
        instanceRef.configuredOptions.grandTotal += networkCount;
        instanceRef.displayResult();
        instanceRef.displayCustomResult();
        //console.log(responseObj); // Debugging line
      })
      .error(function() { 
        instanceRef.configuredOptions.networkCounts[networkName] = 0;
        instanceRef.displayCustomResult();
       });
    }
    else{
      instanceRef.displayResult();
      instanceRef.configuredOptions.networkCounts[networkName] = 0;
      instanceRef.displayCustomResult();
    }
  };
  
  /* Initiate custom display method
  ================================================== */
  ShareWidget.prototype.displayCustomResult = function () {
    // Check if all social services have returned their counts to trigger the custom render
    var checkedNetworks = 0;
    for (var networkKey in this.configuredOptions.networkCounts) { checkedNetworks++; }
    if(checkedNetworks === this.configuredOptions.totalShares){
      this.configuredOptions.onDisplay(this, this.configuredOptions);
    }
  };
  
  /* Standard display method
  ================================================== */
  ShareWidget.prototype.displayResult = function () {
    var overallSum = this.configuredOptions.grandTotal,
    renderTemplate = this.configuredOptions.layoutTemplate;