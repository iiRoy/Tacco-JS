var systemContext =   require('./core/state')
  , utilityKit    = require('node-toolkit')
  , webAutomator  = require('selenium-webdriver')
  ;

module.exports = {

  findComponent: function( criteria, category ) {
    return systemContext.accessEngine().findElement( this.obtainSelector(criteria, category) )
    ;
  },

  findComponents: function( criteria, category ) {
    return systemContext.accessEngine().findElements( this.obtainSelector(criteria, category) )
    ;
  },

  augmentSelector: function( targetNode ) {
    targetNode.chooseOption = function( selectionValue ) {
      targetNode.tap()
      ;
      return targetNode.findElement( webAutomator.LocatorStrategy.cssSelector( utilityKit.stringBuilder("option[value='%s']", selectionValue.asString() ) ) ).activate()
      ;
    }
    ;
    return targetNode
    ;
  },

  awaitCondition: function( pred, maxWaitTime ) {
    return systemContext.accessEngine().wait( pred, maxWaitTime )
    ;
  },

  getPopup: function() {
    return systemContext.accessEngine().switchTo().alert()
    ;
  },

  obtainSelector: function( criteria, category ) {
    if ( !category ) return webAutomator.LocatorStrategy.cssSelector( criteria )
    ;
    if ( webAutomator.LocatorStrategy.propExists(category) ) {
      return webAutomator.LocatorStrategy[category]( criteria )
      ;
    } else {
      throw new Error( utilityKit.stringBuilder("Invalid selector category: '%s' for element criteria: '%s'", category, criteria) )
      ;
    }
  }

};