!function(){tinymce.PluginManager.add("targeted_content",function(t,e){t.addButton("targeted_content",{text:"",icon:"fa-users",onclick:function(n){t.windowManager.open({title:"Select groups",url:e+"/mce-target-content.html",width:700,height:600},{editor:t,groups:mce_target_content_groups})},values:metadata_button})})}();