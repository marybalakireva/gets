<?php 
require_once('./config.php'); echo '!!! '. TRANSLATIONS_SCRIPT;
require_once(TRANSLATIONS_SCRIPT); 
echo '   admins ' . __FILE__;
session_start(); echo "azaza " . $_SESSION['g2t_token'];
?>
<html>
    <head>     
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
        <script src="scripts/gets/models/Categories.Class.js"></script>
        <script src="scripts/gets/models/Points.Class.js"></script>
        <script src="scripts/gets/models/Tracks.Class.js"></script>
        <script src="scripts/gets/models/User.Class.js"></script>
        <script src="scripts/gets/models/Utils.Class.js"></script>
        <script src="scripts/gets/models/Map.Class.js"></script>
        <script src="scripts/gets/views/TracksMain.View.js"></script>
        <script src="scripts/gets/views/Map.View.js"></script>
        <script src="scripts/gets/views/TrackInfo.View.js"></script>
        <script src="scripts/gets/views/TrackAdd.View.js"></script>
        <script src="scripts/gets/views/TrackEdit.View.js"></script>
        <script src="scripts/gets/views/PointInfo.View.js"></script>
        <script src="scripts/gets/views/PointAdd.View.js"></script>
        <script src="scripts/gets/views/PointEdit.View.js"></script>
        <script src="scripts/gets/views/Message.View.js"></script>
        <script src="scripts/gets/views/Header.View.js"></script>
        <script src="scripts/gets/controllers/TracksPage.Ctrl.js"></script>
        <script src="scripts/gets/controllers/Map.Ctrl.js"></script> 
        <script src="scripts/gets/controllers/Language.Ctrl.js"></script>
        <script src="scripts/gets/controllers/Routes.js"></script>
        <script>
            $( document ).ready(function() {
                Logger.useDefaults();
                MessageBox = new MessageView($(document).find('.main-container'));
                var _tracksPageCtrl = new TracksPage(document, window);
                _tracksPageCtrl.initPage();               
            });    
        </script>
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
                    
                    <?php 

                    ?>

                    

                    <div id="tracks-main-page" class="action-menu-container hidden">
                        <div class="action-menu-inner-content"> 
                            <?php
                                require_once('./widgets/AdminsMenu.inc');
                                echo get_admin_menu_item($_GET['menu']);
                            ?>


                            <div id="tracks-list" class="list-group">
                            </div>            
                        </div>
                    </div>
                </div>
                <div class="map">
                  
                      Тут категории, но они спрятаны, так надо, так надо !

                        <p>аа вот тут табличка с категориями ? </p> 
                        <table >
                            <?php 
                                require_once('./actions/getCategoriesAdmin.php');
                            ?>
                        </table>
                        <form method="post" action="./actions/addCategoriesAdmin.php" >
                            <p>Имя</p>
                            <input name="name" type="text"> <br/>
                            <p>Описание</p>
                            <input name="description" type="text"> <br/>
                            <p>URL</p>
                            <input name="url" type="text"> <br/>
                            <input name="submit" type="submit" value="Добавить"/>
                        </form>    <!-- -->
 
                        А тут про добавление админов

                        <form method="post" action="./actions/addAdminUser.php" >
                            <p>admin id</p>
                            <input name="admin_id" type="text"> <br/>
                            <?php
                                echo  "<input name=token type=\"hidden\" value=\"" . $_SESSION['g2t_token'] . "\"/>";
                            ?>                  
                            <input name="submit" type="submit" value="Добавить"/>
                        </form> 
                         
                </div> 
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