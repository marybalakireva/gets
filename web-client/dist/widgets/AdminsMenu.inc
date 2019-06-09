<?php

    function get_admin_menu_item($page_name) {

        return '
                    <ul class="nav nav-pills nav-stacked">
                        <li ' . ($page_name === 'adminc' ? 'class="active"' : '') . '><a href="adminc.php">' . getString('admin-categories', 'Categories') . '</a></li>
                        <li ' . ($page_name === 'adminf' ? 'class="active"' : '') . '><a href="adminf.php">' . getString('admin-feedback', 'Feedbacks') . '</a></li>
                        
                    </ul>       
                ';
    }
?>