javascript:
(function() {
  var docTop = document.head;
  var remoteSourcePath = "ht" + "tp" + ":" + "//" + "alef" + "euvre.gith" + "ub.com/found" + "ation-grid-di" + "splayer/gd-bo" + "okmarklet.j" + "s";
  var contentForInjection = "<scr" + "ipt type=\"text/javascript\" src=\"" + remoteSourcePath + "\"></scr" + "ipt>";
  if (docTop) {
    docTop.insertAdjacentHTML("beforeend", contentForInjection);
  } else {
    (document.body || document.documentElement).insertAdjacentHTML("afterbegin", contentForInjection);
  }
})();