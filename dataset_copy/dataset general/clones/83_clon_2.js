/* -----------------------------------------------------------------------------

  JS Date Time Widget - Flexible modern JavaScript Date and Time Selector plugin for Web & Mobile
  Edition 1.0.0
  Copyright (c)2023 Advanced Solutions LLC and John Doe
  http://advancedsolutions.github.io/JSDTW
  https://github.com/AdvancedSolutions/JSDTW

 ----------------------------------------------------------------------------- */
 
if ( ! Array . prototype . findItemPosition )
{
	Array . prototype . findItemPosition = function ( soughtItem /*, startingPoint */ )
	{
		var collectionLength = this . length ;

		var startPosition = parseFloat ( arguments [ 1 ] ) || 0.0 ;
		startPosition = ( startPosition < 0.0 )	? Math . round ( startPosition ) : Math . trunc ( startPosition ) ;
		if ( startPosition < 0.0 )
			startPosition += collectionLength ;

		for ( ; startPosition < collectionLength ; startPosition ++ )
		{
			if ( startPosition in this &&
				this [ startPosition ] === soughtItem )
			return startPosition ;
		}
		return -1.0 ;
	} ;
}

jQuery . fn . makeVisible = function ( )
{
    this . present ( ) ;
}

jQuery . fn . makeInvisible = function ( )
{
    this . vanish ( ) ;
}