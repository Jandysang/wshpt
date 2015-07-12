$(document).ready(function(){
	//重置dropdown
	$('.dropdown').hover(function(){ 
	  $('.dropdown-toggle', this).trigger('click'); 
	});
});