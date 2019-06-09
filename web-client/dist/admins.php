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
        <script src="scripts/admin/usersPageScripts.js"></script>
        
<style>
tr{
    display:none;
}
</style>

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
                            <?php
                                require_once('./widgets/AdminsMenu.inc');
                                echo get_admin_menu_item(basename(__FILE__, '.php'));   
                            ?> 
                    </div>
                </div>
                <div class="main-action">

                        <h1><?php echo getString('search','Search') ?></h1>  
                        <input id="search" name="search" type="text" class="form-control" placeholder="<?php echo getString('search..','Search..') ?>"/> 
                        <br/>
                        <ul class="nav nav-pills">
                          <li class="active"><a name="All" class="users-sort"><?php echo getString('all','All') ?></a></li>
                          <li><a name="Trusted" class="users-sort"><?php echo getString('trusteds','Trusted') ?></a></li>
                          <li><a name="Admin" class="users-sort"><?php echo getString('admins','Admin') ?></a></li>
                        </ul>

                        <h1><?php echo getString('list-of-all-users','List of all users') ?></h1>  
                        
                        <table class="table table-hover tablesorter">
                            <?php 
                                require_once('./actions/getUsers.php');
                            ?>
                        </table>
                        <input id="seeMoreRecords" type="button" value="<?php echo getString('more','More') ?>" class="btn btn-primary"/>

                        <!---->
                         
                </div> 
            </div>

            <div class="scroll-top-wrapper ">
                <span class="scroll-top-inner">
                    <i class="fa fa-2x fa-arrow-circle-up"></i>
                </span>
            </div>
           <!--- <div class="main-footer">
                <?php
                /*require_once('./widgets/Footer.inc');
                //$xml = simplexml_load_file('./actions/getCategories.php');
                //$xml = require_once('./actions/getCategories.php');
                echo "zaza\n";
echo $xml;*/
              /*  foreach($xml->xpath("content/categories/category") as $i){
                    echo "ИМЯ:" . $i->name . "<br/> " ;  
                }*/
            ?>
            </div> -->
        </div>         
    </body>
</html>