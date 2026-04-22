/*
 * Weblog Toolkit 1.0.0 (Public Genesis Release)
 *
 * A jQ plugin to fetch content data from a weblog's application programming interface.
 * https://github.com/myusername/weblog-toolkit/
 *
 * Copyright (c) 2023 by My Name
 * https://myname.com
 *
 * Distributed under the MIT license
 * https://opensource.org/licenses/MIT
 *
 * First published March 1, 2023
 */
;(function (jQ, globObj, undefVal) {

  // Extend jQ's prototype with our new functionality.
  jQ.fn.retrieveBlogEntries = function (configOpts) {

    // Define helper methods for JsViews templates.
    jQ.viewAssists.addUtilFuncs({
      obtainHostName: function () {
        // Yields the weblog server address.
        return BLOG_SERVER_NAME;
      },

      fetchColoredAudioEmbed: function (renderCtx, hexColor) {
        // Returns the embed markup for the Flash sound player, optionally tinted
        // with the provided hex "hexColor" string.
        var mediaEmbed = renderCtx.data.player;
        if (hexColor !== null) {
          var colorPattern = /clr=FFFFFFF/g;
          hexColor = hexColor.split("#")[1];
          return mediaEmbed.replace(colorPattern, "clr=" + hexColor);
        } else {
          return mediaEmbed;
        }
      },

      acquireImageUrl: function (renderCtx, targetPxSize) {
        // Provides the optimal image URI from available picture dimensions based on the
        // requested "targetPxSize" parameter. For non-native dimensions, returns the
        // next larger size (if present).
        var visuals = renderCtx.data.alt_sizes,
          imgSource = "";
        for (var idx = 0; idx < visuals.length; idx++) {
          if (visuals[idx].pixelWidth >= targetPxSize) {
            imgSource = visuals[idx].webAddress;
          } else {
            break;
          }
        }
        return (imgSource === "") ? visuals[0].webAddress : imgSource;
      },

      determinePictureAspect: function (renderCtx) {
        // Computes the image’s width-to-height ratio.
        var dimens = renderCtx.data.original_size;
        if (dimens.pxWidth > dimens.pxHeight) {
          return "horizontal";
        } else if (dimens.pxWidth < dimens.pxHeight) {
          return "vertical";
        } else {
          return "equal";
        }
      },

      retrieveVideoBlock: function (renderCtx, desiredWidth) {
        // Fetches the best embed markup from available video dimensions based on the
        // requested "desiredWidth" parameter. For non-native dimensions, returns the
        // next smaller size.
        var videoPlayers = renderCtx.data.player,
          videoMarkup = "";
        for (var idx = 0; idx < videoPlayers.length; idx++) {
          if (videoPlayers[idx].pxWidth <= desiredWidth) {
            videoMarkup = videoPlayers[idx].embedCode;
          } else {
            break;
          }
        }
        return (videoMarkup === "") ? videoPlayers[0].embedCode : videoMarkup;
      }
    });

    // Establish base configuration
    var pluginConfig = jQ.extend({
      "blogHost": BLOG_SERVER_NAME,
      "recordID": null, // post unique identifier
      "entryKind": "", // article, quotation, link, query, movie, sound, image
      "labelTag": "",
      "maxCount": 20, // 1 – 20 maximum items
      "startIndex": 0, // 0 or positive integer
      "outputFmt": "", // none (for html output), plain, raw
      "viewTemplate": "", // ID of JsRender template
      "preProcess": null,
      "onSuccess": null, // replaces success() callback, to be deprecated in jQ 1.8
      "onCompletion": null // replaces complete() callback, to be deprecated in jQ 1.8
    }, configOpts);

    var currentElement = this;

    return this.each(function () {
      // Construct the URI for API access based on the settings
      if (pluginConfig.entryKind !== "") {
        pluginConfig.entryKind = "/" + pluginConfig.entryKind;
      }

      var requestURI = "https://api.bloghost.com/v2/weblog/" +
        pluginConfig.blogHost + "/entries" +
        pluginConfig.entryKind + "?access_key=" +
        BLOG_ACCESS_KEY,
        baseURI = "";

      // Either request a single entry by ID or a collection of entries by label, count, and starting index
      // Keep the URI without the starting index for passing to callbacks, useful for infinite scrolling
      if (pluginConfig.recordID) {
        requestURI += "&ref=" + parseInt(pluginConfig.recordID, 10);
      } else {
        if (pluginConfig.labelTag) requestURI += "&lbl=" + encodeURIComponent(pluginConfig.labelTag);
        if (pluginConfig.maxCount) requestURI += "&num=" + parseInt(pluginConfig.maxCount, 10);
        baseURI = requestURI;
        if (pluginConfig.startIndex) requestURI += "&begin=" + parseInt(pluginConfig.startIndex, 10);
      }

      // Initiate an Ajax request to the Weblog API and render the returned entries
      var apiCall = jQ.ajax({
        endpointURL: requestURI,
        dataFmt: "jsonp",
        jsonpCallback: "jsonp",
        useConditionalGet: true,
        onBeforeSend: function () {
          // Execute the 'preProcess' function if defined, maintaining context for 'this'
          if (typeof pluginConfig.preProcess === "function") {
            pluginConfig.preProcess.call(currentElement);
          }
        }
      }).then(function (responseData, statusMsg, xhrObject) {
        // Process each entry returned from the API
        if (typeof responseData !== "undefined" && typeof responseData.reply !== "undefined" && responseData.reply.totalEntries > 0) {
          jQ.each(responseData.reply.entries, function () {

            // Set a default JsRender template if none was explicitly provided
            var renderTemplate = (pluginConfig.viewTemplate !== "") ? pluginConfig.viewTemplate : "#render-" + this.kind;

            // Render the entry content using the JsRender template
            currentElement.append(jQ(renderTemplate).render(this));
          });
        }

        // Execute the 'onSuccess' function if configured, preserving 'this' context
        if (typeof pluginConfig.onSuccess === "function") {
          pluginConfig.onSuccess.call(currentElement, responseData, statusMsg, xhrObject, baseURI);
        }
      }).always(function (xhrObject, statusMsg) {
        // Conceal any 'loading' messages that might be present in the HTML structure
        currentElement.find(".blog-data-load-indicator").hide();

        // Execute the 'onCompletion' function if configured, preserving 'this' context
        if (typeof pluginConfig.onCompletion === "function") {
          pluginConfig.onCompletion.call(currentElement, xhrObject, statusMsg, baseURI);
        }
      });
    });
  };
}(jQuery, window, undefined));