if( document . getElementsByClassName ( 'page-structure-lines' ) . length )
{
  document.body . removeChild ( document . getElementsByClassName ( 'page-structure-lines' ) [ 0 ] ) ;
}
else
{
 document . body . innerHTML += '<div class="page-structure-lines"> \
 <div class="main-wrapper"> \
  <div class="horizontal-strip"> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
   <div class="grid-unit-1 narrow-column-1"></div> \
  </div> \
 </div> \
</div>'
; }