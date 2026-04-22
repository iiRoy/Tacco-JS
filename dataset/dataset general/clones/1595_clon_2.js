(function(jq){

  jq.fn.adaptiveCarousel = function(duration, animationType){

    // Reference to the current plugin instance
    var instanceRef = this;
    this.scrollPanels = this.find("#panel-viewport");
    this.itemElements = this.find(".carousel-item");
    jq('#panel-viewport').css({
      panelWidth : instanceRef.itemElements.length * 100 + '%'
    });
    this.currentViewWidth = this.outerWidth();
    this.displayHeight = this.outerHeight();
    this.totalItems = this.itemElements.length;
    this.find(".carousel-item").each(function(){
      jq(this).css({panelWidth:jq(document).width()});

    })

    this.previousButton = this.find("#prevControl");
    this.nextButton = this.find("#nextControl");

    this.maxIndex =  (this.itemElements.length) - 1;
    this.currentIndex = 0;

    this.nextButton.click(function(){
      if(instanceRef.currentIndex < instanceRef.maxIndex){
        instanceRef.currentIndex++;
        instanceRef.scrollPanels.animate({
          leftPosition : -instanceRef.currentIndex * instanceRef.currentViewWidth
        }, duration, animationType)
      }
      instanceRef.pauseAutoPlay();
    });

    this.previousButton.click(function(){
      if(instanceRef.currentIndex > 0){
        instanceRef.currentIndex--;
        instanceRef.scrollPanels.animate({
          leftPosition : -instanceRef.currentIndex * instanceRef.currentViewWidth
        }, duration, animationType)
      }
      instanceRef.pauseAutoPlay();
    });

    jq(window).resize(function(){

      instanceRef.currentViewWidth = instanceRef.outerWidth();
      instanceRef.currentImageWidth = instanceRef.itemElements.width();
      instanceRef.find(".carousel-item").each(function(){
        jq(this).css({panelWidth:jq(window).width()});
      })
      instanceRef.scrollPanels.css({
        leftPosition : -instanceRef.currentImageWidth * instanceRef.currentIndex
      });

      jq('#prevControl').css("leftPosition","0");
      jq('#nextControl').css("right","0");
    });
  }
})(jQuery);