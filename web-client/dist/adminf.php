<?php 
require_once('./config.php'); 
require_once(TRANSLATIONS_SCRIPT); 
session_start();
?>
<html>
    <head>   
    
        <link rel="stylesheet" id="font-awesome-css" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" type="text/css" media="screen"> 

        <link rel="stylesheet" href="styles/bootstrap-3.2.0/bootstrap.css">          
        <link rel="stylesheet" href="styles/bootstrap-3.2.0/bootstrap.min.css">
        <link rel="stylesheet" href="styles/bootstrap-3.2.0/bootstrap-theme.min.css">
        <link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css"/>
        <link rel="stylesheet" type="text/css" href="styles/bootstrap-3.2.0/bootstrap-lightbox.min.css"/>
        <link rel="stylesheet" type="text/css" href="styles/bootstrap-slider.min.css"/>
        <link rel="stylesheet" href="styles/languages.min.css">
        <link rel="stylesheet" type="text/css" href="styles/leaflet.contextmenu.css"/>
        <?php
        include_once('html_headers.php');
        ?>
       
        <!-- ADD ACTION CONSTANTS SPECIFIC FOR DOMAIN -->
        <script src="actions/generateActionNames.php"></script>
        <!-- ADD IMAGE CONSTANTS SPECIFIC FOR DOMAIN -->
        <script src="images/generateImagesPaths.php"></script>
        
        <script src="scripts/jquery/jquery-1.11.1.min.js"></script>
        <script src="scripts/jquery/jquery.cookie.js"></script>
        <script src="scripts/bootstrap/bootstrap.min.js"></script>
        <script src="scripts/bootstrap/bootstrap-lightbox.min.js"></script>
        <script src="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.js"></script>
        <script src="scripts/logger.min.js"></script>
        <script src="scripts/readmore.min.js"></script>
        <script src="scripts/bootstrap-slider.min.js"></script>
        <script src="scripts/leaflet.contextmenu.js"></script>
        <script src="scripts/Polyline.encoded.js"></script>
        <script src="scripts/graham_scan.min.js"></script>
        <script src="scripts/jquery.inputmask.bundle.min.js"></script>
        <script src="scripts/admin/scrollToTop.js"></script>

        <!-- Admin scripts -->
        <script src="scripts/admin/sortElements.js"></script>

        <script>

            $(function(){

                $( document ).ready(function() {

                    $("#seeMoreRecords").click();
                });

                var currentIndex = 0;

                $("#seeMoreRecords").click(function () {

                    $(".maintr").slice(currentIndex, currentIndex + 10).fadeIn();
                    currentIndex += 10;

                    if (currentIndex >= $(".maintr").length){
                        $("#seeMoreRecords").fadeOut();
                    }
                });


                $('.maintr').on("click", function () {

                    $('.subtr').fadeOut();

                    var subtr = $(this).next();

                    subtr.is(":visible") ? subtr.fadeOut() : subtr.fadeIn();
                });

            });

        </script>
<!--<style>-->
<!--tr{-->
<!--    display:none;-->
<!--}-->
<!--</style>-->
        <title>GeTS Web Client</title>
    </head>
    <body>
        <div class="main-container">
            <div class="main-header">
                <?php
                require_once('./widgets/Header.inc');
                echo get_navbar_depend_on_page(basename(__FILE__, '.php'));
                ?>
            </div>
            <div class="main-content">

                <div class="action-menu">
                    <div class="menu-admin-container">
                        <div>
                            <?php
                                require_once('./widgets/AdminsMenu.inc');
                                echo get_admin_menu_item(basename(__FILE__, '.php'));   
                            ?>
                        </div>
                    </div>
                </div>
                <div class="main-action">
                        <h1><?php echo getString('list-of-all-feedbacks','List of all feedbacks') ?></h1>
                        <table class="table table-hover tablesorter" style="height: 300px;">
                            <?php
                            include_once ('./actions/getFeedbackAdmin.php');
                            ?>
                </div> 
            </div>
        </div>         
    </body>
</html>