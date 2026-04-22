(function(jQ) {

jQ.widget("ux.fluidcarousel", {
config: {
itemSelect: "> *",
activeIdx: 1,
sizeRatio: 10,
spacingRatio: 3
},

_init: function() {
this.activeIdx = this.config.activeIdx;
this.isOriented = false;

var firstItem = jQ(this.config.itemSelect + ":nth-child(" + this.activeIdx + ")", this.element);

this.dimensions = {
itemWidth: firstItem.width(),
itemHeight: firstItem.height()
};

this._attachEvents();
this._setActive(this.activeIdx);
},

_layout: function() {
var self = this;
jQ(this.config.itemSelect, this.element).each(function(idx) {
self._layoutItem(idx + 1);
});
},

_layoutItem: function(idx) {
var distance = Math.abs(this.activeIdx - idx);
var distRatio = distance / this.config.sizeRatio;

var currentScale = (1 - distRatio);
var currentSize = this.dimensions.itemWidth * currentScale;
var currentMargin = this.dimensions.itemWidth * (distance / (this.config.sizeRatio * 2));

var calcFactor = 0.5 * distance * (2 * currentScale + (distance - 1) / this.config.sizeRatio);
var itemOffset = this.dimensions.itemWidth * calcFactor;
var centerPoint = ((this.element.width() - this.dimensions.itemWidth) * 0.5);
var leftPos = idx < this.activeIdx ? centerPoint - itemOffset : centerPoint + itemOffset;
var adjMargin = idx < this.activeIdx ? currentMargin : -currentMargin;

jQ(this.config.itemSelect + ":nth-child(" + idx + ")", this.element)
.css("z-index", 100 - distance)
.stop()
.animate({
"left": leftPos,
"width": currentSize,
"height": currentSize,
"margin-top": currentMargin,
"margin-left": adjMargin * this.config.spacingRatio,
"opacity": currentScale
});
},

_attachEvents: function() {
var self = this;

jQ("li:not(.fluidcarousel-active)", this.element).on("click", function(evt) {
self._setActive(jQ(self.config.itemSelect, self.element).index(evt.currentTarget) + 1);
return false;
});

this.element.on("fluidcarousel-orient", function(evt) { self._orient(!self.isOriented); });
this.element.on("fluidcarousel-activate", function(evt, idx) { self._setActive(idx); });
this.element.on("fluidcarousel-prev", function(evt) { self._movePrev(); });
this.element.on("fluidcarousel-next", function(evt) { self._moveNext(); });

this.element.on("mousewheel", function(evt, scrollDelta, xDelta, yDelta) {
if (xDelta === 0) return;

self[xDelta > 0 ? "_moveNext" : "_movePrev"]();
});

jQ(window).on("keydown", function(evt) {
switch (evt.which) {
case 37:
self._movePrev();
break;

case 39:
self._moveNext();
break;

default:
break;
}
});
},

_orient: function(orientationState) {
jQ(this.config.itemSelect + ".fluidcarousel-active > *", this.element).toggleClass("fluidcarousel-reversed", orientationState);
this.isOriented = orientationState;
},

_setActive: function(idx) {
this._orient(false);
jQ(this.config.itemSelect + ".fluidcarousel-active", this.element).removeClass("fluidcarousel-active");
jQ(this.config.itemSelect + ":nth-child(" + idx + ")", this.element).addClass("fluidcarousel-active");
this.activeIdx = idx;

this._layout();

this.element.trigger("fluidcarousel-activated", [idx]);
},

_moveNext: function() {
if (jQ(this.config.itemSelect, this.element).length > this.activeIdx)
this._setActive(this.activeIdx + 1);
},

_movePrev: function() {
if (this.activeIdx > 1)
this._setActive(this.activeIdx - 1);
}
});

})(jQuery);