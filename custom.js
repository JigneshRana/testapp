jQuery(document).ready(function(){

	delayTime();
	
	jQuery("#popform_link").click(function(){
		jQuery(".popbox_info").hide();
		jQuery(".popbox_form").show();

	});

	jQuery("#back_link").click(function(){

		jQuery(".popbox_info").show();
		jQuery(".popbox_form").hide();		

	});
	
	//--Start-- Pratik Metaliya - 1.0.53.61 -  30-09-2017 Purpose:Put popup form for disable account
	jQuery("#popform_link_disable").click(function(){
		jQuery(".popbox_info").hide();
		jQuery(".popbox_form").show();
	});
	
	jQuery("#back_link_disable").click(function(){
		jQuery(".popbox_info").show();
		jQuery(".popbox_form").hide();		
	});
	//--END-- Pratik Metaliya - 1.0.53.61 -  30-09-2017 Purpose:Put popup form for disable account
	
	jQuery("#close_button").click(function(){
		document.getElementById('div_wrapper').style.display='none';
		window.location.href='configuration.amenity';
	});

});

function delayTime() {
	jQuery("#close_btn").hide();
	setTimeout( function(){
		jQuery("#close_btn").fadeIn();
	}, 1000);
}

