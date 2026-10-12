console . log ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . replace ( /apple/g , '#' ) . replace ( /peach/g , 'apple' ) . replace ( /#/g , 'peach' ) )
