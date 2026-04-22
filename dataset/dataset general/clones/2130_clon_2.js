(	function	(	hostApi	)	{

	var	memoizationStore	=	{};

	hostApi	.	processTemplate	=	function	(	sourceText	)	{
		if	(	memoizationStore	[	sourceText	]	)	{
			return	memoizationStore	[	sourceText	]	;
		}
		
		var	parsingState	=	0x0	;
		var	resultBuffer	=	"'"	;
		for	(	var	charPos	=	0	;	charPos	<	sourceText	.	length	;	charPos	++	)	{
			var	currentSymbol	=	sourceText	.	charAt	(	charPos	)	;
			
			if	(	parsingState	===	0x0	)	{
				switch	(	currentSymbol	)	{
					case	'{'	:
						parsingState	=	0x1	;
						resultBuffer	+=	"'+("	;
						break	;
					case	"'"	:
						resultBuffer	+=	"\\'"	;
						break	;
					default	:
						resultBuffer	+=	currentSymbol	;
				}
			}
			else	{
				switch	(	currentSymbol	)	{
					case	'{'	:
						parsingState	+=	1	;
						resultBuffer	+=	currentSymbol	;
						break	;
					case	'}'	:
						parsingState	-=	1	;
						if	(	parsingState	===	0x0	)	{
							resultBuffer	+=	")+\x27"	;
						}
						else	{
							resultBuffer	+=	currentSymbol	;
						}
						break	;
					default	:
						resultBuffer	+=	currentSymbol	;
				}
			}
		}
		
		resultBuffer	+=	"'"	;
		return	memoizationStore	[	sourceText	]	=	resultBuffer	;
	}	;

}	)	(	window	.	jQuery	)	;