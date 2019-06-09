<?php

echo   '
<div id="feedback-main-page" class="action-menu-container">
    <div class="bordered-element">
          <div >
          ' .getString('information-to-users','Information to users'). '
          </div>          
     </div>

      <div class="action-menu-inner-content">
          <div id="points-main-search-accordion" class="panel-group">
              <div class="panel panel-default">
                  <div class="panel-heading">
                      <h4 class="panel-title">
                          <a class="accordion-toggle" data-toggle="collapse" data-parent="#points-main-search-accordion" href="#search-block-collapse">
                                   ' . getString('leave-feedback','Leave feedback') . '
                          </a>
                      </h4>
                   </div>
                   <div id="search-block-collapse" class="panel-collapse collapse">
                       <div class="panel-body">
                           <form id="feedback-main-form" action="javascript:void(null);" role="form">
                               <div class="form-group">
                                   <label for="feedback-main-filter-category">' . getString('category','Category') . ' </label>
                                   <select id="feedback-main-filter-category" class="form-control" name="category" size="1"></select>  
                                     </div>
                               <div class="form-group">
                                   <label for="feedback-main-filter-comment">' . getString('comment','Comment') . ' </label>
                                   <input type = "text" id="feedback-main-filter-comment" class="form-control"  name="comment" rows="5">            
                               </div>
                               <div class="main-block">
                                        <button id="feedback-main-search" class="btn btn-primary center-block" href="#" type="submit" title="' . getString('send','Send') . '">' . getString('send','Send') . '</button>
                               </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>          
         </div>
</div>                                    
';

?>
