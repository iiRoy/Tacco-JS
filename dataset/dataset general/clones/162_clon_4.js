class SocialAggregator {
  static #_baseSettings = {
    visualIdentifier: 'social-box',
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
    _enabledServiceCount: 0,
    customLayout: '',
    pageTitle: '',
    resourceURL: document.location.href,
    shareText: document.title,
    proxyEndpoint: 'sharrre.php',
    _serviceMetrics: {},
    _grandTotal: 0,
    condenseNumbers: true,
    activateHoverEffects: true,
    collectMetrics: true,
    enableAnalytics: false,
    onHoverTrigger: () => {},
    onHoverCease: () => {},
    onClickAction: () => {},
    onDisplayUpdate: () => {},
    serviceOptions: {
      googlePlus : {
        linkOverride: '',
        countLinkOverride: false,
        buttonSize: 'medium',
        interfaceLang: 'en-US',
        displayAnnotation: ''
      },
      facebook: {
        linkOverride: '',
        countLinkOverride: false,
        interactionType: 'like',
        displayLayout: 'button_count',
        boxWidth: '',
        sendButton: 'false',
        showFaces: 'false',
        colorScheme: '',
        fontFamily: '',
        interfaceLang: 'en_US'
      },
      twitter: {
        linkOverride: '',
        countLinkOverride: false,
        countStyle: 'horizontal',
        hashTags: '',
        viaAccount: '',
        relatedAccounts: '',
        interfaceLang: 'en'
      },
      digg: {
        linkOverride: '',
        countLinkOverride: false,
        buttonType: 'DiggCompact'
      },
      delicious: {
        linkOverride: '',
        countLinkOverride: false,
        buttonSize: 'medium'
      },
      stumbleupon: {
        linkOverride: '',
        countLinkOverride: false,
        badgeLayout: '1'
      },
      linkedin: {
        linkOverride: '',
        countLinkOverride: false,
        counterPosition: ''
      },
      pinterest: {
        linkOverride: '',
        mediaURL: '',
        descriptionText: '',
        displayLayout: 'horizontal'
      }
    }
  };

  static #_apiEndpoints = {
    googlePlus: "",
    facebook: "https://graph.facebook.com/fql?q=SELECT%20url,%20normalized_url,%20share_count,%20like_count,%20comment_count,%20total_count,commentsbox_count,%20comments_fbid,%20click_count%20FROM%20link_stat%20WHERE%20url%3D%27{url}%27",
    twitter: "https://cdn.api.twitter.com/1/urls/count.json?url={url}",
    digg: "https://services.digg.com/2.0/story.getInfo?links={url}&type=javascript",
    delicious: 'https://feeds.delicious.com/v2/json/urlinfo/data?url={url}',
    stumbleupon: "",
    linkedin: "https://www.linkedin.com/countserv/count/share?format=jsonp&url={url}",
    pinterest: "https://api.pinterest.com/v1/urls/count.json?url={url}"
  };

  static #_scriptLoadStatus = new Map();

  static #_loadExternalScript(scriptUrl, globalCheck, callbackName) {
    if (SocialAggregator.#_scriptLoadStatus.has(scriptUrl)) {
      return SocialAggregator.#_scriptLoadStatus.get(scriptUrl);
    }

    const scriptPromise = new Promise((resolve, reject) => {
      if (globalCheck && typeof window[globalCheck] !== 'undefined') {
        resolve();
        return;
      }

      const newScript = document.createElement('script');
      newScript.type = 'text/javascript';
      newScript.async = true;
      newScript.src = scriptUrl;

      const scriptLoadHandler = () => {
        newScript.removeEventListener('load', scriptLoadHandler);
        newScript.removeEventListener('error', scriptErrorHandler);
        resolve();
      };
      const scriptErrorHandler = (err) => {
        newScript.removeEventListener('load', scriptLoadHandler);
        newScript.removeEventListener('error', scriptErrorHandler);
        reject(err);
      };

      newScript.addEventListener('load', scriptLoadHandler);
      newScript.addEventListener('error', scriptErrorHandler);

      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(newScript, firstScript);
    });

    SocialAggregator.#_scriptLoadStatus.set(scriptUrl, scriptPromise);
    return scriptPromise;
  }

  static #_openSharePopup(url, windowName, width, height) {
    window.open(url, windowName, `toolbar=0,status=0,width=${width},height=${height}`);
  }

  constructor(containerElement, customSettings = {}) {
    if (!(containerElement instanceof HTMLElement)) {
      throw new Error("Target element for SocialAggregator is not a valid HTML element.");
    }
    this._containerElement = containerElement;

    this._currentSettings = JSON.parse(JSON.stringify(SocialAggregator.#_baseSettings));
    for (const key in customSettings) {
      if (Object.prototype.hasOwnProperty.call(customSettings, key)) {
        if (typeof customSettings[key] === 'object' && customSettings[key] !== null && !Array.isArray(customSettings[key]) && typeof this._currentSettings[key] === 'object' && this._currentSettings[key] !== null) {
          Object.assign(this._currentSettings[key], customSettings[key]);
        } else {
          this._currentSettings[key] = customSettings[key];
        }
      }
    }
    this._currentSettings.activeServices = customSettings.activeServices || SocialAggregator.#_baseSettings.activeServices;

    this._initializeComponent();
  }

  _initializeComponent() {
    this._containerElement.classList.add(this._currentSettings.visualIdentifier);

    this._currentSettings.pageTitle = this._containerElement.dataset.pageTitle || this._currentSettings.pageTitle;
    this._currentSettings.resourceURL = this._containerElement.dataset.resourceUrl || this._currentSettings.resourceURL;
    this._currentSettings.shareText = this._containerElement.dataset.shareText || this._currentSettings.shareText;

    if (this._currentSettings.proxyEndpoint !== '') {
      SocialAggregator.#_apiEndpoints.googlePlus = this._currentSettings.proxyEndpoint + '?url={url}&type=googlePlus';
      SocialAggregator.#_apiEndpoints.stumbleupon = this._currentSettings.proxyEndpoint + '?url={url}&type=stumbleupon';
    }

    this._currentSettings._enabledServiceCount = Object.values(this._currentSettings.activeServices).filter(Boolean).length;

    if (this._currentSettings.collectMetrics) {
      this._fetchServiceMetrics();
    } else if (this._currentSettings.customLayout !== '') {
      this._currentSettings.onDisplayUpdate(this._containerElement, this._currentSettings);
    } else {
      this._constructButtons();
    }

    let hoverLeaveTimer;
    this._containerElement.addEventListener('mouseover', () => {
      clearTimeout(hoverLeaveTimer);
      if (this._containerElement.querySelector('.service-buttons') === null && this._currentSettings.activateHoverEffects) {
        this._constructButtons();
      }
      this._currentSettings.onHoverTrigger(this._containerElement, this._currentSettings);
    });

    this._containerElement.addEventListener('mouseout', () => {
      hoverLeaveTimer = setTimeout(() => {
        this._currentSettings.onHoverCease(this._containerElement, this._currentSettings);
      }, 200);
    });

    this._containerElement.addEventListener('click', (evt) => {
      evt.preventDefault();
      this._currentSettings.onClickAction(this._containerElement, this._currentSettings);
    });
  }

  _constructButtons() {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('service-buttons');
    this._containerElement.appendChild(buttonWrapper);

    for (const serviceKey in this._currentSettings.activeServices) {
      if (this._currentSettings.activeServices[serviceKey]) {
        const renderFunction = this.#_serviceRenderers[serviceKey];
        if (renderFunction) {
          renderFunction.call(this, buttonWrapper);
          if (this._currentSettings.enableAnalytics) {
            const trackFunction = this.#_serviceTrackers[serviceKey];
            if (trackFunction) trackFunction.call(this);
          }
        }
      }
    }
  }

  async _fetchServiceMetrics() {
    const metricPromises = [];
    this._currentSettings._grandTotal = 0; // Reset total before fetching

    for (const serviceKey in this._currentSettings.activeServices) {
      if (this._currentSettings.activeServices[serviceKey]) {
        metricPromises.push(this.#_getSingleServiceMetric(serviceKey));
      }
    }

    try {
      await Promise.all(metricPromises);
      this._updateDisplay();
      this._invokeCustomRender();
    } catch (error) {
      console.error("Error during social metric fetching:", error);
      this._updateDisplay();
      this._invokeCustomRender();
    }
  }

  async #_getSingleServiceMetric(serviceKey) {
    let currentMetric = 0;
    let endpoint = SocialAggregator.#_apiEndpoints[serviceKey];
    const serviceConfig = this._currentSettings.serviceOptions[serviceKey];

    let queryUrl = this._currentSettings.resourceURL;
    if (serviceConfig.countLinkOverride && serviceConfig.linkOverride !== '') {
      queryUrl = serviceConfig.linkOverride;
    }

    if (endpoint !== '' && this._currentSettings.proxyEndpoint !== '') {
      const fullUrl = endpoint.replace('{url}', encodeURIComponent(queryUrl));

      try {
        const response = await fetch(fullUrl);
        const responseText = await response.text();

        let parsedPayload;
        if (fullUrl.includes('callback=')) {
          const callbackMatch = fullUrl.match(/callback=(\w+)/);
          const callbackName = callbackMatch ? callbackMatch[1] : `jsonp_cb_${Date.now()}`;
          const jsonMatch = responseText.match(new RegExp(`${callbackName}\\((.*)\\)`));
          if (jsonMatch && jsonMatch[1]) {
            parsedPayload = JSON.parse(jsonMatch[1]);
          } else {
            // Handle cases where API returns pure JSON despite callback param (e.g., Twitter, Pinterest)
            parsedPayload = JSON.parse(responseText);
          }
        } else if (fullUrl.includes('type=javascript')) { // e.g., Digg
            const jsonMatch = responseText.match(/digg\.story\.getInfo\((.*)\);/);
            if(jsonMatch && jsonMatch[1]) {
                parsedPayload = JSON.parse(jsonMatch[1]);
            } else {
                parsedPayload = JSON.parse(responseText);
            }
        } else {
          parsedPayload = JSON.parse(responseText);
        }

        currentMetric = this.#_extractMetricValue(serviceKey, parsedPayload);
      } catch (error) {
        console.warn(`Failed to fetch metrics for ${serviceKey}:`, error);
        currentMetric = 0;
      }
    } else {
      currentMetric = 0;
    }

    this._currentSettings._serviceMetrics[serviceKey] = currentMetric;
    this._currentSettings._grandTotal += currentMetric;
  }

  #_extractMetricValue(serviceKey, responsePayload) {
    let metric = 0;
    switch (serviceKey) {
      case 'googlePlus':
        if (typeof responsePayload.count !== "undefined") {
          metric = parseInt(responsePayload.count.replace('\u00c2\u00a0', ''), 10);
        }
        break;
      case 'facebook':
        if (responsePayload.data && responsePayload.data.length > 0 && typeof responsePayload.data[0].total_count !== "undefined") {
          metric = parseInt(responsePayload.data[0].total_count, 10);
        }
        break;
      case 'twitter':
        if (typeof responsePayload.count !== "undefined") {
          metric = parseInt(responsePayload.count, 10);
        }
        break;
      case 'digg':
        if (responsePayload.stories && responsePayload.stories.length > 0 && typeof responsePayload.stories[0].diggs !== "undefined") {
          metric = parseInt(responsePayload.stories[0].diggs, 10);
        }
        break;
      case 'delicious':
        if (responsePayload && responsePayload.length > 0 && typeof responsePayload[0].total_posts !== "undefined") {
          metric = parseInt(responsePayload[0].total_posts, 10);
        }
        break;
      case 'stumbleupon':
        if (typeof responsePayload.count !== "undefined") {
            metric = parseInt(responsePayload.count, 10);
        }
        break;
      case 'linkedin':
        if (typeof responsePayload.count !== "undefined") {
          metric = parseInt(responsePayload.count, 10);
        }
        break;
      case 'pinterest':
        if (typeof responsePayload.count !== "undefined") {
          metric = parseInt(responsePayload.count, 10);
        }
        break;
    }
    return isNaN(metric) ? 0 : metric;
  }

  _invokeCustomRender() {
    const receivedCount = Object.keys(this._currentSettings._serviceMetrics).length;
    if (receivedCount === this._currentSettings._enabledServiceCount) {
      this._currentSettings.onDisplayUpdate(this._containerElement, this._currentSettings);
    }
  }

  _updateDisplay() {
    // This method is primarily a placeholder for the original's incomplete `renderer`.
    // Its main function is to ensure `onDisplayUpdate` is called after metrics are processed.
  }

  _formatLargeNumber(num) {
    if (!this._currentSettings.condenseNumbers) {
      return num.toString();
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  }

  #_serviceRenderers = {
    googlePlus: function(parent) {
      const config = this._currentSettings.serviceOptions.googlePlus;
      const buttonElement = document.createElement('div');
      buttonElement.classList.add('social-button', 'gplus-btn');
      buttonElement.innerHTML = `<div class="g-plusone" data-size="${config.buttonSize}" data-href="${config.linkOverride !== '' ? config.linkOverride : this._currentSettings.resourceURL}" data-annotation="${config.displayAnnotation}"></div>`;
      parent.appendChild(buttonElement);

      window.gapi = window.gapi || {};
      window.___gcfg = { lang: config.interfaceLang };
      SocialAggregator.#_loadExternalScript('https://apis.google.com/js/plusone.js', 'gapi').then(() => {
        if (typeof gapi !== 'undefined' && gapi.plusone) {
          gapi.plusone.go(this._containerElement);
        }
      }).catch(e => console.error("Failed to load Google Plus script", e));
    },
    facebook: function(parent) {
      const config = this._currentSettings.serviceOptions.facebook;
      const buttonElement = document.createElement('div');
      buttonElement.classList.add('social-button', 'fb-btn');
      buttonElement.innerHTML = `<div id="fb-root"></div><div class="fb-like" data-href="${config.linkOverride !== '' ? config.linkOverride : this._currentSettings.resourceURL}" data-send="${config.sendButton}" data-layout="${config.displayLayout}" data-width="${config.boxWidth}" data-show-faces="${config.showFaces}" data-action="${config.interactionType}" data-colorscheme="${config.colorScheme}" data-font="${config.fontFamily}"></div>`;
      parent.appendChild(buttonElement);

      SocialAggregator.#_loadExternalScript(`https://connect.facebook.net/${config.interfaceLang}/all.js#xfbml=1`, 'FB').then(() => {
        if (typeof FB !== 'undefined' && FB.XFBML) {
          FB.XFBML.parse(this._containerElement);
        }
      }).catch(e => console.error("Failed to load Facebook script", e));
    },
    twitter: function(parent) {
      const config = this._currentSettings.serviceOptions.twitter;
      const buttonElement = document.createElement('div');
      buttonElement.classList.add('social-button', 'tw-btn');
      buttonElement.innerHTML = `<a href="https://twitter.com/share" class="twitter-share-button" data-url="${config.linkOverride !== '' ? config.linkOverride : this._currentSettings.resourceURL}" data-count="${config.countStyle}" data-text="${this._currentSettings.shareText}" data-via="${config.viaAccount}" data-hashtags="${config.hashTags}" data-related="${config.relatedAccounts}" data-lang="${config.interfaceLang}">Tweet</a>`;
      parent.appendChild(buttonElement);

      SocialAggregator.#_loadExternalScript('https://platform.twitter.com/widgets.js', 'twttr').then(() => {
        if (typeof twttr !== 'undefined' && twttr.widgets) {
          twttr.widgets.load(this._containerElement);
        }
      }).catch(e => console.error("Failed to load Twitter script", e));
    },
    digg: function(parent) {
      const config = this._currentSettings.serviceOptions.digg;
      const buttonElement = document.createElement('div');
      buttonElement.classList.add('social-button', 'digg-btn');
      buttonElement.innerHTML = `<a class="DiggThisButton ${config.buttonType}" rel="nofollow external" href="http://digg.com/submit?url=${encodeURIComponent(config.linkOverride !== '' ? config.linkOverride : this._currentSettings.resourceURL)}"></a>`;
      parent.appendChild(buttonElement);

      SocialAggregator.#_loadExternalScript('https://widgets.digg.com/buttons.js', '__DBW').catch(e => console.error("Failed to load Digg script", e));
    },
    delicious: function(parent) {
      const config = this._currentSettings.serviceOptions.delicious;
      const currentCount = this._formatLargeNumber(this._currentSettings._serviceMetrics.delicious || 0);

      let styleProps = {};
      let countStyleProps = {};
      let shareStyleProps = {};

      if (config.buttonSize === 'tall') {
        styleProps = { width: '50px' };
        countStyleProps = { height: '35px', width: '50px', 'font-size': '15px', 'line-height': '35px' };
        shareStyleProps = { height: '18px', 'line-height': '18px', 'margin-top': '3px' };
      } else {
        styleProps = { width: '93px' };
        countStyleProps = { 'float': 'right', padding: '0 3px', height: '20px', width: '26px', 'line-height': '20px' };
        shareStyleProps = { 'float': 'left', height: '20px', 'line-height': '20px' };
      }

      const buttonElement = document.createElement('div');
      buttonElement.classList.add('social-button', 'delicious-btn');
      buttonElement.innerHTML = `
        <div style="
          ${Object.entries(styleProps).map(([k, v]) => `${k}:${v}`).join(';')};
          font:12px Arial,Helvetica,sans-serif;cursor:pointer;color:#666666;display:inline-block;float:none;height:20px;line-height:normal;margin:0;padding:0;text-indent:0;vertical-align:baseline;">
          <div style="
            ${Object.entries(countStyleProps).map(([k, v]) => `${k}:${v}`).join(';')};
            background-color:#fff;margin-bottom:5px;overflow:hidden;text-align:center;border:1px solid #ccc;border-radius:3px;">${currentCount}</div>
          <div style="
            ${Object.entries(shareStyleProps).map(([k, v]) => `${k}:${v}`).join(';')};
            display:block;padding:0;text-align:center;text-decoration:none;width:50px;background-color:#7EACEE;border:1px solid #40679C;border-radius:3px;color:#fff;">
            <img src="https://www.delicious.com/static/img/delicious.small.gif" height="10" width="10" alt="Delicious" /> Add
          </div>
        </div>`;
      parent.appendChild(buttonElement);

      buttonElement.addEventListener('click', () => {
        this.#_popupHandlers.delicious.call(this, this._currentSettings);
      });
    },
    stumbleupon: function(parent) {
      const config = this._currentSettings.serviceOptions.stumbleupon;
      const buttonElement = document.createElement('div');
      buttonElement.classList.add('social-button', 'su-btn');
      buttonElement.innerHTML = `<su:badge layout="${config.badgeLayout}" location="${config.linkOverride !== '' ? config.linkOverride : this._currentSettings.resourceURL}"></su:badge>`;
      parent.appendChild(buttonElement);

      SocialAggregator.#_loadExternalScript('https://platform.stumbleupon.com/1/widgets.js', 'STMBLPN').then(() => {
        if (typeof STMBLPN !== 'undefined' && STMBLPN.processWidgets) {
          STMBLPN.processWidgets();
        }
      }).catch(e => console.error("Failed to load Stumbleupon script", e));
    },
    linkedin: function(parent) {
      const config = this._currentSettings.serviceOptions.linkedin;
      const buttonElement = document.createElement('div');
      buttonElement.classList.add('social-button', 'li-btn');
      buttonElement.innerHTML = `<script type="in/share" data-url="${config.linkOverride !== '' ? config.linkOverride : this._currentSettings.resourceURL}" data-counter="${config.counterPosition}"></script>`;
      parent.appendChild(buttonElement);

      SocialAggregator.#_loadExternalScript('https://platform.linkedin.com/in.js', 'IN').then(() => {
        if (typeof IN !== 'undefined' && IN.init) {
          IN.init();
        }
      }).catch(e => console.error("Failed to load LinkedIn script", e));
    },
    pinterest: function(parent) {
      const config = this._currentSettings.serviceOptions.pinterest;
      const buttonElement = document.createElement('div');
      buttonElement.classList.add('social-button', 'pin-btn');
      buttonElement.innerHTML = `<a href="http://pinterest.com/pin/create/button/?url=${encodeURIComponent(config.linkOverride !== '' ? config.linkOverride : this._currentSettings.resourceURL)}&media=${encodeURIComponent(config.mediaURL)}&description=${encodeURIComponent(config.descriptionText)}" class="pin-it-button" count-layout="${config.displayLayout}">Pin It</a>`;
      parent.appendChild(buttonElement);

      SocialAggregator.#_loadExternalScript('https://assets.pinterest.com/js/pinit.js').catch(e => console.error("Failed to load Pinterest script", e));
    }
  };

  #_serviceTrackers = {
    googlePlus: function() {}, // No direct GA tracking in original snippet
    facebook: function() {
      let fbInterval = setInterval(() => {
        if (typeof FB !== 'undefined' && FB.Event) {
          FB.Event.subscribe('edge.create', (targetUrl) => {
            if (typeof _gaq !== 'undefined') _gaq.push(['_trackSocial', 'facebook', 'like', targetUrl]);
          });
          FB.Event.subscribe('edge.remove', (targetUrl) => {
            if (typeof _gaq !== 'undefined') _gaq.push(['_trackSocial', 'facebook', 'unlike', targetUrl]);
          });
          FB.Event.subscribe('message.send', (targetUrl) => {
            if (typeof _gaq !== 'undefined') _gaq.push(['_trackSocial', 'facebook', 'send', targetUrl]);
          });
          clearInterval(fbInterval);
        }
      }, 1000);
    },
    twitter: function() {
      let twInterval = setInterval(() => {
        if (typeof twttr !== 'undefined' && twttr.events) {
          twttr.events.bind('tweet', (event) => {
            if (event && typeof _gaq !== 'undefined') {
              _gaq.push(['_trackSocial', 'twitter', 'tweet']);
            }
          });
          clearInterval(twInterval);
        }
      }, 1000);
    },
    digg: function() {}, // Not natively trackable in original snippet
    delicious: function() {}, // Not natively trackable in original snippet
    stumbleupon: function() {}, // Not natively trackable in original snippet
    linkedin: function() {
      // Original code had a function defined but never called, implying manual GA call.
      // function LinkedInShare() { if (typeof _gaq !== 'undefined') _gaq.push(['_trackSocial', 'linkedin', 'share']); }
    },
    pinterest: function() {} // Not natively trackable in original snippet
  };

  #_popupHandlers = {
    googlePlus: function(config) {
      SocialAggregator.#_openSharePopup(`https://plus.google.com/share?hl=${config.serviceOptions.googlePlus.interfaceLang}&url=${encodeURIComponent(config.serviceOptions.googlePlus.linkOverride !== '' ? config.serviceOptions.googlePlus.linkOverride : config.resourceURL)}`, "gplus_share", 900, 500);
    },
    facebook: function(config) {
      SocialAggregator.#_openSharePopup(`http://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(config.serviceOptions.facebook.linkOverride !== '' ? config.serviceOptions.facebook.linkOverride : config.resourceURL)}&t=${config.shareText}`, "fb_share", 900, 500);
    },
    twitter: function(config) {
      SocialAggregator.#_openSharePopup(`https://twitter.com/intent/tweet?text=${encodeURIComponent(config.shareText)}&url=${encodeURIComponent(config.serviceOptions.twitter.linkOverride !== '' ? config.serviceOptions.twitter.linkOverride : config.resourceURL)}${config.serviceOptions.twitter.viaAccount !== '' ? '&via=' + config.serviceOptions.twitter.viaAccount : ''}`, "tw_share", 650, 360);
    },
    digg: function(config) {
      SocialAggregator.#_openSharePopup(`http://digg.com/tools/diggthis/submit?url=${encodeURIComponent(config.serviceOptions.digg.linkOverride !== '' ? config.serviceOptions.digg.linkOverride : config.resourceURL)}&title=${config.shareText}&related=true&style=true`, "digg_share", 650, 360);
    },
    delicious: function(config) {
      SocialAggregator.#_openSharePopup(`http://www.delicious.com/save?v=5&noui&jump=close&url=${encodeURIComponent(config.serviceOptions.delicious.linkOverride !== '' ? config.serviceOptions.delicious.linkOverride : config.resourceURL)}&title=${config.shareText}`, 'delicious_share', 550, 550);
    },
    stumbleupon: function(config) {
      SocialAggregator.#_openSharePopup(`http://www.stumbleupon.com/badge/?url=${encodeURIComponent(config.serviceOptions.stumbleupon.linkOverride !== '' ? config.serviceOptions.stumbleupon.linkOverride : config.resourceURL)}`, 'su_share', 550, 550);
    },
    linkedin: function(config) {
      SocialAggregator.#_openSharePopup(`https://www.linkedin.com/cws/share?url=${encodeURIComponent(config.serviceOptions.linkedin.linkOverride !== '' ? config.serviceOptions.linkedin.linkOverride : config.resourceURL)}&token=&isFramed=true`, 'li_share', 550, 550);
    },
    pinterest: function(config) {
      SocialAggregator.#_openSharePopup(`http://pinterest.com/pin/create/button/?url=${encodeURIComponent(config.serviceOptions.pinterest.linkOverride !== '' ? config.serviceOptions.pinterest.linkOverride : config.resourceURL)}&media=${encodeURIComponent(config.serviceOptions.pinterest.mediaURL)}&description=${encodeURIComponent(config.serviceOptions.pinterest.descriptionText)}`, 'pin_share', 700, 300);
    }
  };
}