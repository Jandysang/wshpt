
$(document).ready(function(){
	$(".ui-slideshow-box").slideshow({skip:false});

	
	$('[data-toggle="popover"]').each(function(){
		$(this).popover({
		    html:       true,
		    trigger:    'hover',
		    content:    $("<div>").append($(this).parent().find(".h-pro-pop").html()).css({width:242})
		});
	});
});