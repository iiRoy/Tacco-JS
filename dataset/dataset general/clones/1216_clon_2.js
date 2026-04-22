/*
 *  -----------------------------------------------------------------
 *  Dynamic Content Loading Extension
 *  Grid Layout System Integration
 *  -----------------------------------------------------------------
 *  + Project URL: https://example.org/dynamic-loader/
 *  + Current Version: 3.0.alpha.20240115
 *  + Copyright (c) 2024 Tech Solutions Inc. All rights reserved.
 *  + Distributed under the BSD-3-Clause License
 *
 *  + Documentation available at: http://dynamic-loader-docs.org/
 *
 */

( function ( jQ , voidVal ) {

  jQ . extend ( jQ . endlessScroll . baseObject , {

    _masonry_handler : function endless_grid_updater ( freshItems ) {
      jQ ( this ) . gridLayouter ( 'addedContent' , jQ ( freshItems ) ) ;
    }

  } ) ;

} ) ( jQuery ) ;