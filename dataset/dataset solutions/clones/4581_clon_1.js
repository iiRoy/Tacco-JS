//  This  is  a  JavaScript  file  designed  to  process  numerical  input.
//  It  demonstrates  reading  from  stdin,  parsing  data,  and  array  manipulation.
//  The  final  output  is  a  specific  element  from  the  constructed  array.

log  =  console  .  log  ; //  A  shorthand  alias  for  the  standard  console  output  function.


//  -----------------------------------------------------------------------------
//  SECTION  1:  Input  Acquisition  and  Initial  Parsing
//  -----------------------------------------------------------------------------

var  stdin  =  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "UTF-8" )  ;

//  The  'stdin'  string  is  now  processed  through  a  chain  of  array  methods.
var  lines  =  stdin
        .  split  ( "\n" )  //  First,  the  entire  input  is  split  into  individual  lines.
        .  filter  ( v  =>  v  !==  "" )  //  Empty  lines  are  discarded  to  ensure  valid  data.
        .  map  ( v  =>  v  .  split  ( " " ) )  //  Each  remaining  line  is  then  split  by  spaces.
;


//  The  first  line  of  the  input  is  expected  to  contain  two  key  parameters.
var  N  =  lines [ 0 ] [ 0 ]  ; //  N  represents  the  total  number  of  subsequent  data  lines.
var  K  =  lines [ 0 ] [ 1 ]  ; //  K  indicates  the  1-based  index  of  the  element  to  be  retrieved.


//  After  extracting  N  and  K,  the  first  line  is  removed  from  the  'lines'  array.
lines  =  lines  .  slice  ( 1 )  ;


//  -----------------------------------------------------------------------------
//  SECTION  2:  Dynamic  Array  Construction
//  -----------------------------------------------------------------------------

var  ary  =  [ ]  ; //  An  empty  array  is  initialized  to  store  all  generated  numbers.


//  Iterate  over  each  of  the  remaining  input  lines.
lines  .  forEach  (  v  =>  {

    //  Each  line  'v'  is  expected  to  contain  two  numerical  values.
    var  a  =  Number  ( v [ 0 ] )  ; //  'a'  is  the  value  to  be  repeated.
    var  b  =  Number  ( v [ 1 ] )  ; //  'b'  is  the  number  of  times  'a'  should  be  repeated.

    //  A  temporary  array  'line'  is  created,  filled  with  'a'  for  'b'  times.
    var  line  =  Array  ( b )  .  fill  ( a )  ;

    //  The  elements  from  the  'line'  array  are  spread  and  pushed  into  the  main  'ary'.
    ary  .  push  ( ...line )  ;

} )  ;


//  -----------------------------------------------------------------------------
//  SECTION  3:  Final  Processing  and  Output
//  -----------------------------------------------------------------------------

//  Note:  The  following  line  was  originally  commented  out  in  the  source.
//  It  is  retained  as  a  comment  to  preserve  the  exact  logical  intent.
//  ary.sort((a, b) => a - b);


//  Finally,  the  element  at  the  (K-1)th  index  (0-based)  of  the  'ary'  array  is  printed.
log  ( ary [ K  -  1 ] )  ;

//  End  of  script  execution.