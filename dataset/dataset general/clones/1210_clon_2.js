(function() {
  'strict mode'

  var domUtil = globalScope.DomLibrary
  var ScrollPoint = globalScope.TriggerPoint

  /* This module provides functionality to make an element remain visible
   * at a fixed position within the viewport as the user scrolls.
   * It relies on a scroll tracking library.
   */
  function FixedPositioner(configuration) {
    this.configuration = domUtil.assignProps({}, ScrollPoint.presetOptions, FixedPositioner.presetOptions, configuration)
    this.targetElem = this.configuration.targetElem
    this.j$targetElem = domUtil(this.targetElem)
    this.buildContainer()
    this.establishTrigger()
  }

  /*
   * Private helper method: Configures the scroll event listener.
   */
  FixedPositioner.prototype.establishTrigger = function() {
    var initialCallback = this.configuration.actionFn

    this.scrollTrigger = new ScrollPoint(domUtil.assignProps({}, this.configuration, {
      targetElem: this.container,
      actionFn: domUtil.bindContext(function(movementPath) {
        var needsAnchoring = this.configuration.scrollDirection.includes(movementPath)
        var enclosureDimension = needsAnchoring ? this.j$targetElem.fullHeight(true) : ''

        this.j$container.setSize(enclosureDimension)
        this.j$targetElem.toggleCssClass(this.configuration.fixedClass, needsAnchoring)

        if (initialCallback) {
          initialCallback.invoke(this, movementPath)
        }
      }, this)
    }))
  }

  /*
   * Private helper method: Creates a parent wrapper element if specified.
   */
  FixedPositioner.prototype.buildContainer = function() {
    if (this.configuration.enclosure) {
      this.j$targetElem.encapsulate(this.configuration.enclosure)
    }
    this.j$container = this.j$targetElem.ancestor()
    this.container = this.j$container[0]
  }

  /*
   * Public API: Disables the fixed positioning and cleans up DOM changes.
   */
  FixedPositioner.prototype.remove = function() {
    if (this.j$targetElem.ancestor()[0] === this.container) {
      this.scrollTrigger.remove()
      this.j$targetElem.clearCssClass(this.configuration.fixedClass).disencapsulate()
    }
  }

  // Default settings for FixedPositioner instances
  FixedPositioner.presetOptions = {
    enclosure: '<div class="fixed-container" />',
    fixedClass: 'affixed',
    scrollDirection: 'up left'
  }

  // Expose our FixedPositioner as a property of the ScrollPoint object
  ScrollPoint.ClingyItem = FixedPositioner
}())