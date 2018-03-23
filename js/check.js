$(function(){
      $.prototype.goodCheck=function(){
            var allcheck=$(this).find('th').find(':checkbox');
            var checks=$(this).find('td').find(':checkbox');
            $(this).find(':checkbox').prop('checked',false);
            allcheck.click(function(){
                 var set=$(this).parents('table').find('td').find(':checkbox');
                 if($(this).prop('checked')){
                    $.each(set,function(obj,v){
                      $(v).prop('checked',true)
                    });
                 }else{
                   $.each(set,function(obj,v){
                      $(v).prop('checked',false)
                   })
                 }
            });
            checks.click(function(e){
              e.stopPropagation();
              var ling=$(this).parents('table').find('td').find(':checkbox:checked').length;
              if(ling==checks.length){
                allcheck.prop("checked",true)
              }else{
                allcheck.prop("checked",false)
              }
            })
        };
        $('#table').goodCheck();
        $(".delete_btn").click(function(){
        	$(this).parents("tr").remove();
        })
      
    })  