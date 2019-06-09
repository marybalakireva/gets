<?php

function get_admin_menu_item($item_name) {
   
    echo getString('admin-users', '!!!Users') ;
    return ' <script> console.log(' . $item_name . ');</script>
                        <div><p>Категории</p></div>  
                        <div><p>hghfghgfhf</p></div> 

                        <ul class="nav nav-pills nav-stacked">
                            <li ' . (!isset($item_name) ? 'class="active"' : '') . '><a href="adminf.php">' . getString('admin-home', 'Home') . '</a></li>
                            <li ' . ($item_name === 'category' ? 'class="active"' : '') . '><a href="' . $_SERVER['PHP_SELF'] . '?lang=' . $_GET['lang'] .'&menu=category">' . getString('admin-categories', 'Categories') . '</a></li>
                            <li ' . ($item_name === 'users' ? 'class="active"' : '') . '><a href="' . $_SERVER['PHP_SELF'] . '?lang=' . $_GET['lang'] .'&menu=users">' . getString('admin-users', 'Users') . '</a></li>
                        </ul>

                        <div id="tracks-list" class="list-group">
                        </div>            
             '
            ;

    return '';
}

?>