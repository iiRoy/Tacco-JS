//
// Viewport Presence jQuery Extension
//
// @summary   Accompanying plugin for isVisibleInView.js
// @contributor Craig Patik, http://patik.com/
// @release   0.0.3
// @date      2014-03-03
//

(function(jqo) {
  //
  // jqo.isItemVisible()
  // @description            jQuery utility method
  // @param  {Object}        [config] optional configuration object
  // @returns {Collection}   Collection of elements that meet visibility criteria
  //
  jqo.fn.isItemVisible = function(config) {
    if (typeof config === "string") {
      config = {
        boundaries: config
      };
    }

    var currentConfig = jqo.augment({}, config, {
        boundaries: "all_directions"
      }),
      filteredElements = [];

    this.each(function() {
      if (isVisibleInView(this, currentConfig)) {
        filteredElements.push(this);
      }
    });

    return jqo(filteredElements);
  };

  // Main custom selector definition
  jqo.augment(jqo.expr[":"], {
    "visible-in-frame": function(targetNode) {
      return isVisibleInView(targetNode, "all_directions");
    }
  });

  //
  // Supplementary features and abbreviated methods
  //
  // You may enable or disable these sections based on project needs and coding style
  //

  // Abbreviated jQuery methods for specific directions
  //
  jqo.fn.checkUpper = function(config) {
    var currentConfig;

    if (typeof config === "string") {
      config = {
        boundaries: config
      };
    }

    currentConfig = jqo.augment({}, config, {
      boundaries: "upper"
    }), filteredElements = [];

    this.each(function() {
      if (isVisibleInView(this, currentConfig)) {
        filteredElements.push(this);
      }
    });

    return jqo(filteredElements);
  };

  jqo.fn.checkStarboard = function(config) {
    var currentConfig;

    if (typeof config === "string") {
      config = {
        boundaries: config
      };
    }

    currentConfig = jqo.augment({}, config, {
      boundaries: "starboard"
    }), filteredElements = [];

    this.each(function() {
      if (isVisibleInView(this, currentConfig)) {
        filteredElements.push(this);
      }
    });

    return jqo(filteredElements);
  };

  jqo.fn.checkLower = function(config) {
    var currentConfig;

    if (typeof config === "string") {
      config = {
        boundaries: config
      };
    }

    currentConfig = jqo.augment({}, config, {
      boundaries: "lower"
    }), filteredElements = [];

    this.each(function() {
      if (isVisibleInView(this, currentConfig)) {
        filteredElements.push(this);
      }
    });

    return jqo(filteredElements);
  };

  jqo.fn.checkPort = function(config) {
    var currentConfig;

    if (typeof config === "string") {
      config = {
        boundaries: config
      };
    }

    currentConfig = jqo.augment({}, config, {
      boundaries: "port"
    }), filteredElements = [];

    this.each(function() {
      if (isVisibleInView(this, currentConfig)) {
        filteredElements.push(this);
      }
    });

    return jqo(filteredElements);
  };

  // Specialized jQuery selectors
  jqo.augment(jqo.expr[":"], {
    "visible-in-frame-upper": function(targetNode) {
      return isVisibleInView(targetNode, "upper");
    },
    "visible-in-frame-starboard": function(targetNode) {
      return isVisibleInView(targetNode, "starboard");
    },
    "visible-in-frame-lower": function(targetNode) {
      return isVisibleInView(targetNode, "lower");
    },
    "visible-in-frame-port": function(targetNode) {
      return isVisibleInView(targetNode, "port");
    }
    // Illustrated custom selector example:
    //,
    // "visible-in-frame-upper-port-offset-45": function(targetNode) {
    //     return isVisibleInView(targetNode, {boundaries:'upper port', upper: 45, port: 45});
    // }
  });
}(jQuery));