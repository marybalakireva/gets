$(document).ready(function() { 

    var currentIndex = 0;

    $("#seeMoreRecords").click(function (e) { 
        
        $("tr").slice(currentIndex, currentIndex + 10).fadeIn();
        currentIndex += 10;
        if (currentIndex > $("tr").length){
            $("#seeMoreRecords").fadeOut();
        }
    });

    $('#name, #email, #rights')
        .wrapInner('<span title="sort this column"/>')
        .each(function(){
            
            var th = $(this),
                thIndex = th.index(),
                inverse = false;
            
            th.click(function(){

                $('table').find('td').filter(function(){

                    return $(this).index() === thIndex;
                    
                }).sortElements(function(a, b){
            
                    return $.text([a]) > $.text([b]) ?
                        inverse ? -1 : 1
                        : inverse ? 1 : -1;
                    
                }, function(){
                    
                    // parentNode is the element we want to move
                    return this.parentNode; 
                    
                });
                
                inverse = !inverse;


                var count = -1;

                $("tr").each(function(){

                    count++;
                    count <= currentIndex ? $(this).fadeIn() : $(this).hide();     
                });                                 
            });                            
    });  

    $('#id')
        .wrapInner('<span title="sort this column"/>')
        .each(function(){
            
            var th = $(this),
                thIndex = th.index(),
                inverse = false;
            
            th.click(function(){

                $('table').find('td').filter(function(){

                    return $(this).index() === thIndex;
                    
                }).sortElements(function(a, b){
       
                    return parseInt($.text([a]), 10) > parseInt($.text([b]), 10) ?
                        inverse ? -1 : 1
                        : inverse ? 1 : -1;
                    
                }, function(){
                    
                    // parentNode is the element we want to move
                    return this.parentNode; 
                    
                });
                
                inverse = !inverse;

                var count = -1;

                $("tr").each(function(){

                    count++;
                    count <= currentIndex ? $(this).fadeIn() : $(this).hide();     
                });                                    
            });                
    });

    $("#seeMoreRecords").click();

    var table = $('table');

    $(".dropdown-menu-item").on("click",function(e) { 

        var rights = $(this).attr("id"); 
        var id = $(this).parent().parent().attr("id");

        $.post("./actions/addAdminUser.php",{"rights": rights, "id": id}, function(data) {    
                
           location.reload();
        });

    });
   
    $(".btn-danger").on("click",function(e) { 

        var id = $(this).attr("id");

        $.post("./actions/deleteUser.php",{"id": id}, function(data) { 

            $(this).parent().parent().fadeOut(); 
        });

    });

    $("tr").find("td:eq(0), td:eq(1), td:eq(2)").on("click",function(e) {

        var user_id = $(this).parent().attr("id");

        var form = jQuery('<form>', {
            'action': './admint.php',
            'method' : 'POST'
        }).append(jQuery('<input>', {
            'name': 'user_id',
            'value': user_id,
            'type': 'hidden'
        }));
        form.appendTo("body").submit();
    });

    $(".users-sort").on("click",function(e) {   

        $(".users-sort").each(function(index) 
        {
            $(this).parent().removeClass("active");             
        })  
       
        $(this).parent().addClass("active");

        var name = $(this).attr("name");

        if($(this).attr("name").indexOf('Admin') >= 0) {

            $("table tr").each(function(index)
            {
                if(countUsers == currentIndex)
                    return;

                var rightCol = $(this).find(".btn");
                var rightColName = rightCol.attr("name");
                if (typeof rightColName === "undefined") return true;

                if (rightColName.indexOf('Admin') >= 0) {

                    $(this).fadeIn()
                } 
                else {
                    $(this).fadeOut();
                }                            
            })  
            $("#seeMoreRecords").fadeOut();
            return;
        }

        if($(this).attr("name").indexOf('Trusted') >= 0) {

            $("table tr").each(function(index) 
            {
                if(countUsers == currentIndex)
                    return;

                var rightCol = $(this).find(".btn");
                var rightColName = rightCol.attr("name");
                if (typeof rightColName === "undefined") return true;

                if(rightColName.indexOf('Admin') >= 0 || 
                    rightColName.indexOf('Trusted') >= 0) { 
                    
                        $(this).fadeIn() 
                    } else {
                        $(this).fadeOut();
                    }
            })  
            $("#seeMoreRecords").fadeOut();
            return;
        }

         $("table tr").each(function(index) {
             $(this).fadeOut();
        }) 
        // так как пробегаемся еще и по заголовку
        var countUsers = -1;

        $("table tr").each(function(index) 
        {
            if(countUsers == 10)   
                return;
        
            $(this).fadeIn(); 
            countUsers++;
        }) 
        $("#seeMoreRecords").fadeIn(); 
    });

    $("#search").on("keyup", function() {
        var value = $(this).val();   
        $("tr").each(function(index) {
            if(value == ""){
                $(this).show();
            }else{
                $(this).hide();
            }
        })     
        $("td").each(function(index) {
            if (index != 0) {

                $row = $(this).text();                     

                if ($row.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    $(this).parent().show();
                }                            
            }
        })   
    }); 
});