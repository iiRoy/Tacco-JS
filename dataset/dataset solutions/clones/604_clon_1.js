/*
 * This is a Type I clone generated to demonstrate variations
 * in whitespace and comments while maintaining exact code structure.
 * Every identifier, variable name, function name, operator, and expression
 * remains completely unchanged.
 */

//  A s s i g n i n g   t h e   i n p u t   f r o m   s t a n d a r d   i n p u t .
  var   input     =   require ( 'fs' )   .   readFileSync (
                                           '/dev/stdin' ,
                                            'utf8'
                                           ) ;


    //  P r o c e s s i n g   t h e   i n p u t   s t r i n g   i n t o   a n   a r r a y   o f   n u m b e r s .
      var Arr     =   ( input . trim ( ) )   .   split ( "\n" )   .   map ( Number ) ;


/*
 *  D e t e r m i n e   t h e   m i n i m u m   v a l u e   a m o n g   t h e   f i r s t   t h r e e   e l e m e n t s .
 *  T h e s e   a r e   l i k e l y   p r i c e s   f o r   i t e m s   o f   a   c e r t a i n   c a t e g o r y .
 */
          var   p   =   Math . min ( Arr [ 0 ] , Arr [ 1 ] , Arr [ 2 ] ) ;


    //  F i n d   t h e   m i n i m u m   v a l u e   f r o m   t h e   n e x t   t w o   e l e m e n t s .
    //  T h e s e   a r e   l i k e l y   p r i c e s   f o r   i t e m s   o f   a n o t h e r   c a t e g o r y .
      var   j   =   Math . min ( Arr [ 3 ] , Arr [ 4 ] ) ;


/*
 *  C a l c u l a t e   t h e   f i n a l   r e s u l t .
 *  T h i s   i n v o l v e s   s u m m i n g   t h e   t w o   m i n i m u m s   a n d   s u b t r a c t i n g   a   f i x e d   v a l u e .
 *  T h e   v a l u e   5 0   m i g h t   r e p r e s e n t   a   d i s c o u n t   o r   a   f i x e d   c h a r g e .
 */
console . log ( p   +   j   -   50 ) ; //  O u t p u t t i n g   t h e   f i n a l   c o m p u t e d   v a l u e   t o   t h e   c o n s o l e .