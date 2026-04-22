var        rawData =        require('fs').readFileSync('/dev/stdin', 'utf8') .trim() ;
var textLines = rawData.split('\n') ;

var currentSegment ;

while (     currentSegment = textLines.shift()
)
{
    var numericParts = currentSegment.split(' ').map(
        function(numericString)
        {
            return +numericString;
        }
    ) ;

    var parsedYear  = numericParts[0] ;
    var parsedMonth = numericParts[1] ;
    var parsedDay   = numericParts[2] ;

    var reignPeriod = '' ;

    var targetDate = new Date(parsedYear, parsedMonth - 1, parsedDay) ;

    if (targetDate < new Date(1868, 8, 8))
    {
        reignPeriod = 'pre-meiji' ;
    }
    else if (targetDate < new Date(1912, 6, 30))
    {
        reignPeriod = 'meiji' ;
        parsedYear -= 1867 ;
    }
    else if (targetDate < new Date(1926, 11, 25))
    {
        reignPeriod = 'taisho' ;
        parsedYear -= 1911 ;
    }
    else if (targetDate < new Date(1989, 0, 7))
    {
        reignPeriod = 'showa' ;
        parsedYear -= 1925 ;
    }
    else
    {
        reignPeriod = 'heisei' ;
        parsedYear -= 1988 ;
    }

    if (reignPeriod === 'pre-meiji')
    {
        console.log('pre-meiji') ;
        continue ;
    }

    console.log(reignPeriod, parsedYear, parsedMonth, parsedDay) ;
}