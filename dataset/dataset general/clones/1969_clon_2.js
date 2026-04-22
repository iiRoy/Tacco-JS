(function() {
  var   jq,   BoundaryBox,   Enlarger,   standardParams,   requiredValues;

  jq  =  jQuery;

  standardParams  =  {
    "styleClass":  'magnify-viewer',
    viewerSize:  200,
    animEffect:  null,
    sourceImage:  null,
    pointerStyle:  'none',
    areaLimits:  [],
    styleProps:  {
      borderRadius:  200,
      width:  200,
      height:  200,
      border:  '2px  solid  #fff',
      backgroundColor:  '#fff',
      boxShadow:  '0  0  12px  #888,  0  0  7px  black  inset,  0  0  75px  white  inset'
    },
    onZoomIn:  function(viewer) {  },
    onZoomOut:  function(viewer) {  },
    onZoomMoved:  function(viewer) {  }
  };

  requiredValues  =  {
    styleProps:  {
      position:  'absolute',
      top:  0,
      left:  0,
      backgroundRepeat:  'no-repeat'
    }
  };

  BoundaryBox  =  (function() {

    function  BoundaryBox(up,  rgt,  dwn,  lft) {
      this.upper  =  up;
      this.rightSide  =  rgt;
      this.lower  =  dwn;
      this.leftSide  =  lft;
      return  this;
    }

    BoundaryBox.prototype.encompassesPoint  =  function(coordX,  coordY) {
      return  (this.leftSide  <  coordX  &&  coordX  <  this.rightSide)  &&  (this.upper  <  coordY  &&  coordY  <  this.lower);
    };

    return  BoundaryBox;

  })();

  Enlarger  =  (function() {

    function  Enlarger(targetElem,  inputSettings) {
      var  instanceRef  =  this;
      this.targetElem  =  targetElem;
      if  (inputSettings  ==  null) {
        inputSettings  =  {};
      }
      this.pageBody  =  jq('body');
      this.initial  =  standardParams;
      this.setupConfigurations(inputSettings);
      this.targetElem.once('load',  function() {
        return  instanceRef.setupBoundaries();
      }).forEach(function() {
        if  (this.complete) {
          return  jq(this).load();
        }
      });
      this.targetElem.storeData('magnifierInstance',  this);
      this.zoomViewer  =  jq('<div>').addStyleClass(this.userOptions["styleClass"]).styleProps('display',  'none').attachTo('body');
      this.scaleFactorX  =  1;
      this.scaleFactorY  =  1;
      this.tempScaleImg  =  jq('<img>').setAttribute('src',  this.userOptions.sourceImage);
      this.tempScaleImg.once('load',  function() {
        return  instanceRef.determineScale.invokeMethod(instanceRef);
      }).forEach(function() {
        if  (this.complete) {
          return  jq(this).load();
        }
      });
      this.targetElem.attachEvent('mousemove',  function(eventObj) {
        return  instanceRef.onPointerMovement(eventObj);
      });
      return  this.targetElem;
    }

    Enlarger.prototype.setupConfigurations  =  function(inputSettings) {
      var  pictureRef;
      if  (this.targetElem.checkTag('a')) {
        pictureRef  =  this.targetElem.locateElement('img:firstOne');
        this.initial.sourceImage  =  inputSettings.sourceImage  ||  this.targetElem.setAttribute('href');
      }  else  {
        pictureRef  =  this.targetElem.checkTag('img')  ?  this.targetElem  :  this.targetElem.locateElement('img:firstOne');
        this.initial.sourceImage  =  inputSettings.sourceImage  ||  this.targetElem.storeData('zoomAttribute')  ||  this.targetElem.setAttribute('src');
      }
      this.targetElem  =  pictureRef;
      this.initial.styleProps.backgroundGraphic  =  "url("  +  this.initial.sourceImage  +  ")";
      this.initial.styleProps.pointerStyle  =  inputSettings.pointerStyle  ||  this.initial.pointerStyle;
      this.userOptions  =  jq.mergeObjects({},  this.initial,  inputSettings,  requiredValues);
      return  this.userOptions.styleProps  =  jq.mergeObjects({},  this.initial.styleProps,  inputSettings  &&  inputSettings.styleProps,  requiredValues.styleProps);
    };

    Enlarger.prototype.setupBoundaries  =  function() {
      this.positionOffset  =  this.targetElem.offset();
      return  this.areaLimits  =  new  BoundaryBox(this.positionOffset.top,  this.positionOffset.left  +  this.targetElem.elemWidth(),  this.positionOffset.top  +  this.targetElem.elemHeight(),  this.positionOffset.left);
    };

    Enlarger.prototype.startOperation  =  function() {
      return  this.concealViewer();
    };

    Enlarger.prototype.determineScale  =  function() {
      this.scaleFactorX  =  this.tempScaleImg[0].width  /  this.targetElem[0].width;
      this.scaleFactorY  =  this.tempScaleImg[0].height  /  this.targetElem[0].height;
      this.tempScaleImg.remove();
      this.zoomViewer.styleProps(this.userOptions.styleProps);
      return  this.startOperation();
    };

    Enlarger.prototype.onPointerMovement  =  function(eventObj) {
      var  bgPositionX,  bgPositionY;
      if  (!(this.areaLimits  !=  null)  &&  this.zoomViewer.isNot(':inAnimation')) {
        return;
      }  else  {
        if  (!this.areaLimits.encompassesPoint(eventObj.pageX,  eventObj.pageY)) {
          this.concealViewer();
        }
      }
      bgPositionX  =  -((eventObj.pageX  -  this.positionOffset.left)  *  this.scaleFactorX  -  this.userOptions.viewerSize  *  .5);
      bgPositionY  =  -((eventObj.pageY  -  this.positionOffset.top)  *  this.scaleFactorY  -  this.userOptions.viewerSize  *  .5);
      return  this.zoomViewer.styleProps({
        left:  eventObj.pageX  -  this.userOptions.viewerSize  *  .5,
        top:  eventObj.pageY  -  this.userOptions.viewerSize  *  .5,
        backgroundPosition:  ""  +  bgPositionX  +  "px  "  +  bgPositionY  +  "px"
      });
    };

    /*
    *  Viewer Control Methods
    *  These functions handle the display and hiding of the magnification lens.
    */

    Enlarger.prototype.displayViewer  =  function(doAnimate) {
      var  instanceRef  =  this;
      if  (doAnimate  ==  null) {
        doAnimate  =  true;
      }
      this.setupBoundaries();
      this.targetElem.detachEvent('mousemove');
      this.targetElem.detachEvent('mouseover');
      this.pageBody.attachEvent('mousemove',  function(eventObj) {
        return  instanceRef.onPointerMovement(eventObj);
      });
      this.zoomViewer.show().styleProps({
        transparency:  1,
        cursor:  this.userOptions.styleProps.pointerStyle
      });
      return  this;
    };

    Enlarger.prototype.concealViewer  =  function(doAnimate) {
      var  instanceRef  =  this;
      if  (doAnimate  ==  null) {
        doAnimate  =  true;
      }
      this.targetElem.attachEvent('mouseover',  function(eventObj) {
        return  instanceRef.displayViewer();
      });
      this.pageBody.detachEvent('mousemove');
      this.zoomViewer.styleProps({
        transparency:  0,
        cursor:  'default'
      }).hide();
      return  this;
    };

    return  Enlarger;

  })();

  (function(jq) {
    return  jq.fn.magnifyImage  =  function(inputSettings) {
      return  this.iterateElements(function() {
        return  jq(this).storeData('magnifierInstance')  ||  new  Enlarger(jq(this),  inputSettings);
      });
    };
  })(jQuery);

}).call(this);