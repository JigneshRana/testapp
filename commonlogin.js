var tempData = [];
var allowProduct = [];
var AccessLogin = 0;
jQuery(function () {

	var commission_localstorage_val = (window.localStorage.hasOwnProperty("PerformanceAnalysis_Zenrooms_Report_Commission_" + jQuery("#universal_login #hotelcode").val())) ? window.localStorage.getItem("PerformanceAnalysis_Zenrooms_Report_Commission_" + jQuery("#universal_login #hotelcode").val()) : "";//23 June 2020 - [ABS-5235]
	var reservation_check_list = (window.localStorage.hasOwnProperty("ABS2_RESERVATION_CHECK_LIST")) ? window.localStorage.getItem("ABS2_RESERVATION_CHECK_LIST") : ""; //Chaitanya Desai - 21 March 2022 - Purpose: To saved export checkbox value in reservation tab - [ABS-6377]
	//START : 23 June 2021 - [ABS-6137] 
	if (window.localStorage.getItem("OEMID") == 1) {
		$("#AdsDiv").css("display", "block");
		$("#AdsDiv").html("<ins data-revive-zoneid='3' data-revive-id='4244abe6ab4f303637994031d531f33c'></ins><script async src='//adver.ezeetechnosys.com/www/delivery/asyncjs.php'></script>");
	} else {
		$("#AdsDiv").html("");
	}
	for (key in localStorage) {
		if (jQuery.trim(key) != 'OEMID' && jQuery.trim(key) != 'quickActionIconIndexSequence')
			localStorage.removeItem(key);
	}
	//localStorage.clear(); //27 Jan 2019 - [ABS-4846]
	//23 June 2021 - END - [ABS-6137] 	

	//23 June 2020 - START - [ABS-5235]
	if (commission_localstorage_val != "")
		window.localStorage.setItem("PerformanceAnalysis_Zenrooms_Report_Commission", commission_localstorage_val);
	//23 June 2020 - END - [ABS-5235]
	//Chaitanya Desai - 21 March 2022 - START - Purpose: To saved export checkbox value in reservation tab - [ABS-6377]
	if (reservation_check_list != "")
		window.localStorage.setItem("ABS2_RESERVATION_CHECK_LIST", reservation_check_list);
	//Chaitanya Desai - 21 March 2022 - END - [ABS-6377]

	jQuery(".btnEAF,.btnEAB,.btnER,.btnOPTF,.btnOPTB").hide();
	showLocalTimeZoneTime();
	setTimeout(function () {
		if (jQuery("#universal_login #username").val() == "") { jQuery("#universal_login #username").focus() };
		if (jQuery("#universal_login #username").val() != "") { jQuery("#universal_login #password").focus() };
		if (jQuery("#universal_login #password").val() != "") { jQuery("#universal_login #hotelcode").focus() };
	}, 800);

	var validator = jQuery("#universal_login").on("submit").validate({
		meta: "validate",
		invalidHandler: function (form, validator) { },
		errorPlacement: function (error, element) { },
		submitHandler: function () {
			jQuery("div.valerror").hide();
			const isFromReset = parseInt(jQuery("input#step").val());
			if (isFromReset) {
				if (isFromReset === 1) return fetchPropertyEmail();
				if (isFromReset === 2) return sendPasswordResetLink();
				if (isFromReset === 3) return resetPassword();
				if (isFromReset === 4) return redirectToLogin();
				return false;
			}
			commonLoginLoader("show");
			submitLogin();
		},
		success: function (label) {
			return true;
		}
	});

	//Chandrakant - 18 January 2022 - START
	//Purpose : ABS-6408
	var validator = jQuery("#form_qrcode_verify").on("submit").validate({
		meta: "validate",
		invalidHandler: function (form, validator) { },
		errorPlacement: function (error, element) { },
		submitHandler: function () {
			jQuery("div.valerror").hide();
			commonLoginLoader("show");
			validate_MFA();
		},
		success: function (label) {
			return true;
		}
	});

	function validate_MFA()
	{
		try
		{
			var mfa_hotel_code = jQuery("#mfa_hotel_code").val();
			var mfa_userunkid = jQuery("#mfa_userunkid").val();
			var mfa_token = jQuery("#mfa_token").val();
			var mfacode = jQuery("#mfacode").val();

			var defaultview = "";
			if (mfacode == "" || mfa_token == "" || mfa_userunkid == ""|| mfa_hotel_code == "") {
				setMFAMessages("EMPTYFIELDS");
				commonLoginLoader("hide");
			}
			else {
				var passDataAsStr = {
					action: "validate_mfacode",
					mfa_hotel_code: mfa_hotel_code,
					mfa_userunkid: mfa_userunkid,
					mfa_token: mfa_token,
					mfacode: mfacode,
				};
				
				var getUrl = 'index.php';
				jQuery.ajax({
					url: getUrl,
					type: "POST",
					data: passDataAsStr,
					error: function (request, error, message) {
						commonLoginLoader("hide");
					},
					beforeSend: function () {
						
					},
					complete: function (response) {
						
					},
					success: function (response) {
						// console.log('---response---');
						// console.log(response);
						// console.log('---response end---');

						if (response == "NORESPONSE") {
							setMFAMessages("NORESPONSE", "");
						}
						else {
							var resultStatus = "MFAFAILED";
							if (response==1){
								delete tempData.user_mfakey;
								var resultStatus = "MFASUCCESS";

								setTimeout(function () {
									displayPageNextContent();
								}, 3000);
							}
						}
						setMFAMessages(resultStatus);
					},
				});
			}
		}
		catch(e)
		{
			console.log("validate_MFA_Error - " + e);
		}
	}

	
	function setMFAMessages(type) {
		
		var msgElement = jQuery("#ajaxresponsemfa");
		msgElement.html("").css('visibility', 'hidden');

		setTimeout(function () {

			msgElement.addClass("errormsg");
			if (type == "MFASUCCESS") msgElement.css("background-color", "green");


			if (type == "MFASUCCESS")
				msgElement.html("Code is verified Successfully.").css('visibility', 'visible');
			else if (type == "EMPTYFIELDS")
				msgElement.html("Please enter a valid code.").css('visibility', 'visible');
			else if (type == "NORESPONSE")
				msgElement.html("Unable to verify code. Please try again.").css('visibility', 'visible');
			else if (type == "MFASUCCESS")
				msgElement.html("Code verified successfully.").css('visibility', 'visible');
			else if (type == "MFAFAILED")
				msgElement.html("You have entered wrong code. Please try again.").css('visibility', 'visible');

			setTimeout(function () { jQuery("#ajaxresponsemfa").css('visibility', 'hidden'); }, 3500);

			commonLoginLoader("hide");
		}, 2000);
	}
	//Chandrakant - 18 January 2022 - END

	jQuery(".login_content").find(".content_section.welcome").hide();
	document.getElementById('light_head').style.display = "none";

	jQuery("#sendcopychk").click(function () {
		if (jQuery(this).is(':checked') == true) {
			jQuery("#emailpnl").show();
			jQuery("#emailaddress").focus();
		}
		else {
			jQuery("#emailpnl").hide();
		}
	});

	jQuery("#payment_date").datepicker({
		beforeShow: function () {
			setTimeout(function () {
				jQuery('.ui-datepicker').css('z-index', 10000);
			}, 0);
		},
		changeMonth: true,
		changeYear: true,
		maxDate: 0,
		dateFormat: "dd-mm-yy",
	});

	jQuery("#payment_date_disable").datepicker({
		beforeShow: function () {
			setTimeout(function () {
				jQuery('.ui-datepicker').css('z-index', 10000);
			}, 0);
		},
		changeMonth: true,
		changeYear: true,
		maxDate: 0,
		dateFormat: "dd-mm-yy",
	});

	jQuery(".txtInteger").keydown(fun_Integer);
	jQuery(".txtInteger").focusout(fun_Integer_keyup);

	/*document.onkeydown = function(e) {
		if(e.keyCode == 123) {
		return false;
		}
		if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){
		return false;
		}
		if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){
		return false;
		}
		if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){
		return false;
		}

		if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)){
		return false;
		}      
	}*/

	jQuery("#goto").on("change", function () { goToButtonChange(); });

	

	if (parseInt(validresettoken) === 1) {
		jQuery("label#label_resetpassword,label#label_confirmpassword").show();
		jQuery("label#label_resetpassword #resetpassword_visibility_off,label#label_confirmpassword #confirmpassword_visibility_off").show();
		jQuery("label#label_resetpassword > input#resetpassword, label#label_confirmpassword > input#confirmpassword").val('').prop('required', true).addClass("required");
		jQuery("label#label_password,label#label_username,label#label_hotelcode,label#label_configuredemail,label#label_propertyemail,a#anchor_forgotPassword").hide();
		jQuery("label#label_password > input#password, label#label_username > input#username, label#label_hotelcode > input#hotelcode, label#label_propertyemail > input#propertyemail").removeAttr('required').removeClass("required");
		jQuery('#universal_login > h1.form-title').html('Reset Password');
		jQuery("button#login").text('RESET PASSWORD');
		jQuery("#universal_login > h1.form-title, button#login").show();
		jQuery("input#step").val('3');
	} else {
		jQuery("label#label_username,label#label_password,label#label_hotelcode,a#anchor_forgotPassword").show();
		jQuery("label#label_username > input#username, label#label_password > input#password, label#label_hotelcode > input#hotelcode").val('').prop('required', true).addClass("required");
		jQuery("label#label_resetpassword,label#label_confirmpassword,label#label_configuredemail,label#label_propertyemail").hide();
		jQuery("label#label_resetpassword > input#resetpassword, label#label_confirmpassword > input#confirmpassword, label#label_propertyemail > input#propertyemail").removeAttr('required').removeClass("required");
		jQuery('#universal_login > h1.form-title').html('Login');
		jQuery("button#login").text('SIGN IN');
		jQuery("#universal_login > h1.form-title, button#login").show();
		jQuery("input#step").val('0');
	}
});

function verifyIP(IPvalue) {
	errorString = "";
	theName = "IP Address";
	if (IPvalue == '') {
		alert("Please enter IP Address.");
		return false;
	}

	var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
	var ipArray = IPvalue.match(ipPattern);

	if (IPvalue == "0.0.0.0")
		errorString = errorString + theName + ': ' + IPvalue + " is invalid IP Address";
	else if (IPvalue == "255.255.255.255")
		errorString = errorString + theName + ': ' + IPvalue + " is invalid IP Address";

	if (ipArray == null)
		errorString = errorString + theName + ': ' + IPvalue + " is invalid IP Address";
	else {
		for (i = 0; i < 4; i++) {
			thisSegment = ipArray[i];
			if (thisSegment > 255) {
				errorString = errorString + theName + ': ' + IPvalue + " is invalid IP Address";
				i = 4;
			}

			if ((i == 0) && (thisSegment > 255)) {
				errorString = errorString + theName + ': ' + IPvalue + " is a special IP Address and cannot be used here.";
				i = 4;
			}
		}
	}

	return errorString;
}

function blockSpecialChar(e) {
	var k;
	document.all ? k = e.keyCode : k = e.which;
	return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
}

function fun_Integer(event) {
	if (event.keyCode == 13) {
		return true;
	}
	if ((event.keyCode >= 48 & event.keyCode <= 57) || (event.keyCode >= 96 & event.keyCode <= 105)) {
		return true;
	}
	if (event.keyCode >= 37 & event.keyCode <= 40) {
		if (event.keyCode == 38) {
			if (parseInt(jQuery(this).val()) > 0) {
				jQuery(this).val(parseInt(jQuery(this).val()) - 1);
			}
		}
		if (event.keyCode == 40) {
			if (parseInt(jQuery(this).val()) < 1000) {
				jQuery(this).val(parseInt(jQuery(this).val()) + 1);
			}
		}
		return true;
	}
	if (event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 46) {
		return true;
	}
	return false;
}

var fun_Integer_keyup = function () {
	Nna = parseInt(jQuery(this).val(), 10);
	if (isNaN(Nna)) {
		jQuery(this).val('');
	}
	else {
		jQuery(this).val(Nna);
	}
}

function AvoidSpace(event) {
	var k = event ? event.which : window.event.keyCode;
	if (k == 32) return false;
}

function isJson(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

function countdown() {
	var enddate = jQuery('#enddate').val();
	var countDownDate = new Date(enddate).getTime();
	var x = setInterval(function () {

		var now = new Date().getTime();

		var distance = countDownDate - now;

		var days = Math.floor(distance / (1000 * 60 * 60 * 24));
		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		if (days > 1) {
			var day = "Days";
		} else {
			var day = "Day";
		}
		if (hours > 1) {
			var hour = "Hours";
		} else {
			var hour = "Hour";
		}
		if (minutes > 1) {
			var minute = "Minutes";
		} else {
			var minute = "Minute";
		}
		if (seconds > 1) {
			var second = "Seconds";
		} else {
			var second = "Second";
		}

		jQuery('#Countdown').text(days + " " + day + " " + hours + " " + hour + " " + minutes + " " + minute + " " + seconds + " " + second + " ");

		if (distance < 0) {
			clearInterval(x);
			jQuery('#Countdown').text("00 Day 00 Hour 00 Minute 00 Second");
		}
	}, 1000);
}

function setMessages(type, remainAttempts) {
	var msgAttempt = "";
	if (remainAttempts != null && remainAttempts != "") {
		if (remainAttempts == "-1") {
			msgAttempt = "You are blocked. Please try again later after 30 min.";
			type = "TEMPBLOCK";
		}
	}

	var msgElement = jQuery("#ajaxresponse");
	msgElement.html("").css('visibility', 'hidden');

	setTimeout(function () {

		msgElement.addClass("errormsg");
		if (type == "SUCCESS") msgElement.css("background-color", "green");


		if (type == "SUCCESS")
			msgElement.html("Login Successfully.").css('visibility', 'visible');
		else if (type == "EMPTYFIELDS")
			msgElement.html("Login Failed. Please recheck your login information.").css('visibility', 'visible');
		else if (type == "ERROR")
			msgElement.html("Your user account does not have rights to access reservation configuration panel." + msgAttempt).css('visibility', 'visible');
		else if (type == "LOGINFAILED")
			msgElement.html("Login Failed. Please recheck your login information." + msgAttempt).css('visibility', 'visible');
		else if (type == "ACCOUNTDISABLE")
			msgElement.html("Ooops! The account you are trying to login seems to be de-activated for some reasons.").css('visibility', 'visible');
		else if (type == "BLOCKED")
			msgElement.html("You are blocked by the system for 30 mins, please contact to admin or try after 30 mins." + msgAttempt).css('visibility', 'visible'); //30th Nov 2020 - [ABS-5626]
		else if (type == "NOTHAVEACCESS")
			msgElement.html("Your user account does not have rights to login." + msgAttempt).css('visibility', 'visible');
		else if (type == "TEMPBLOCK")
			msgElement.html(msgAttempt).css('visibility', 'visible');
		else 
			msgElement.html(msgAttempt).css('visibility', 'hidden');

		setTimeout(function () { jQuery("#ajaxresponse").css('visibility', 'hidden'); }, 3500);

		commonLoginLoader("hide");
	}, 2000);
}

function submitLogin() {
	var username = jQuery("#username").val();
	var password = jQuery("#password").val();
	var hotelcode = jQuery("#hotelcode").val();
	var defaultview = "";
	if (username == "" || password == "" || hotelcode == "") {
		setMessages("EMPTYFIELDS");
		commonLoginLoader("hide");
	}
	else {
		//20th May 2021 - START - [ABS-5490]
		var passDataAsStr = {
			action: "login",
			username: username,
			password: password,
			hotelcode: hotelcode,
			defaultview: defaultview,
		};
		//20th May 2021 - END - [ABS-5490]

		var getUrl = 'index.php';
		jQuery.ajax({
			url: getUrl,
			type: "POST",
			data: passDataAsStr,
			error: function (request, error, message) {
				commonLoginLoader("hide");
			},
			beforeSend: function () {
				//console.log("beforeSend");
			},
			complete: function (response) {
				//console.log("complete");
				//hideLoadingBar();
			},
			success: function (response) {
				if (response == "EMPTYFIELDS") {
					setMessages("EMPTYFIELDS", "");
				}
				else {
					var resultStatus = "LOGINFAILED";
					var loginAttempt = "";
					if (isJson(response)) {
						var responseData = [];
						responseData = JSON.parse(response);
						loginAttempt = responseData["remainsAttempt"];
						resultStatus = responseData['status'];
						if (resultStatus == "SUCCESS") {
							tempData = JSON.parse(atob(responseData["temp"]));
							tempData["praccountfor"] = responseData["praccountfor"];
							allowProduct = JSON.parse(responseData["allowed"]);
							setTimeout(function () {
								displayPageNextContent();
							}, 3000);
						}
						else if (resultStatus == "LOADTEARMS") {
							jQuery('.ezeetechterms').load('https://ezeetechnosys.com/ezeeterms.php');
							document.getElementById("light_head").style.display = "block";
							document.getElementById("light").style.display = "block";
							return false;
						}
						else if (resultStatus == "LOADPAYMENTNOTICEDISABLE") {
							tempData = JSON.parse(atob(responseData["temp"]));
							allowProduct = JSON.parse(responseData["allowed"]);
							var payment_notice = jQuery.trim(atob(responseData["paymentcontent"])).split('<:>');
							jQuery('#dead_content_1').html(payment_notice[0]);
							jQuery('#dead_content_2').html(payment_notice[1]);
							jQuery('.highligh_text').html(responseData["ending_date_value"] + " IST at 11:59 PM");
							document.getElementById('div_wrapper').style.display = 'block';
							document.getElementById('div_light_disable').style.display = 'block';

							jQuery("#popform_link_disable").click(function () {
								jQuery('#disablenotice').hide();
								jQuery('#disablenotice_form').show();
							});
							return false;
						}
						else if (resultStatus == "LOADPAYMENTNOTICE") {
							tempData = JSON.parse(atob(responseData["temp"]));
							tempData["praccountfor"] = responseData["praccountfor"];
							allowProduct = JSON.parse(responseData["allowed"]);
							var payment_notice = jQuery.trim(atob(responseData["paymentcontent"])).split('<:>');
							jQuery('#content_1').html(payment_notice[0]);
							jQuery('#content_2').html(payment_notice[1]);
							jQuery('.highligh_text').html(responseData["ending_date_value"] + " IST at 11:59 PM");
							jQuery('#enddate').val(new Date(responseData["ending_date_value"].replace(/th|st|nd|rd/, '') + " 23:59:00 +0530"));
							if (!isNaN(new Date(jQuery('#enddate').val()))) {
								jQuery('.highligh_text').hide();
								jQuery('#Countdown').show();
								countdown();
							}

							document.getElementById('div_wrapper').style.display = 'block';
							document.getElementById('div_light').style.display = 'block';
							jQuery("#popform_link_disable").click(function () {
								jQuery('#paymentnotice').hide();
								jQuery('#paymentnotice_form').show();
							});

							jQuery("#paymentnotice #close_btn").click(function () {
								displayPageNextContent();
							});
							return false;
						}
						else if (resultStatus == "REDIRECTOPENIP") {
							tempData = JSON.parse(atob(responseData["temp"]));
							tempData["praccountfor"] = responseData["praccountfor"];
							allowProduct = JSON.parse(responseData["allowed"]);
							jQuery("#myformdiv").html("");
							var CLS_CSRF_TOKEN = tempData["CLS_CSRF_TOKEN"];
							if (CLS_CSRF_TOKEN != undefined && CLS_CSRF_TOKEN != "") {
								commonLoginLoader("show");
								jQuery.ajax({
									url: "openip.php?t=" + CLS_CSRF_TOKEN,
									context: document.body
								}).done(function (ajaxResp) {
									setTimeout(function () {
										if (ajaxResp == "FAILED") {
											resultStatus = "LOGINFAILED";
										} else {
											jQuery('#universal_login').hide();
											jQuery("#myformdiv").html(ajaxResp);
											jQuery('#openipform').show();
											BindOpenIPFormSave();
											commonLoginLoader("hide");
										}
									}, 1500);
								});
							} else {
								resultStatus = "LOGINFAILED";
							}
						}
						else if (resultStatus == "RESETPASSWORD") {
							tempData = JSON.parse(atob(responseData["temp"]));
							tempData["praccountfor"] = responseData["praccountfor"];
							allowProduct = (responseData["allowed"] != undefined) ? JSON.parse(responseData["allowed"]) : [];
							jQuery("#myformdiv").html("");
							var CLS_CSRF_TOKEN = tempData["CLS_CSRF_TOKEN"];
							if (CLS_CSRF_TOKEN != undefined && CLS_CSRF_TOKEN != "") {
								commonLoginLoader("show");
								jQuery.ajax({
									url: "resetpassword.php?t=" + CLS_CSRF_TOKEN,
									context: document.body
								}).done(function (ajaxResp) {
									setTimeout(function () {
										if (ajaxResp == "FAILED") {
											resultStatus = "LOGINFAILED";
										} else {
											jQuery('#universal_login').hide();
											jQuery("#myformdiv").html(ajaxResp);
											jQuery('#resetpasswordform').find("#usernamereset").val(tempData['username']).attr("readonly", "readonly");
											jQuery('#resetpasswordform').find("#hotelcodereset").val(tempData['hotel_code']).attr("readonly", "readonly");
											jQuery('#resetpasswordform').show();
											jQuery('#universal_login').find("#ajaxresponse").html("").css('visibility', 'hidden');
											BindResetPasswordFormSave();
											commonLoginLoader("hide");
										}
									}, 1500);
								});
							} else {
								resultStatus = "LOGINFAILED";
							}
						}
					}

					setMessages(resultStatus, loginAttempt);
				}
				//console.log("In Success");
			},
		});
	}
}

function displayPageNextContent() {
	jQuery("#myformdiv").html("");
	jQuery(".btnEAF,.btnEAB,.btnER,.btnOPTF,.btnOPTB").hide();
	//START : 23 June 2021 - [ABS-6137] 
	$("#AdsDiv").css("display", "none");
	$("#AdsDiv").html("");
	//23 June 2021 - END - [ABS-6137] 
	//29 July 2021 - START [ABS-6213]
	var oemfavicon = 'data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAAAF0lEQVRIx2NgGAWjYBSMglEwCkbBSAcACBAAAeaR9cIAAAAASUVORK5CYII=';
	var appleoemfavicon = oemfavicon;

	if (tempData["oemunkid"] != "undefined" && tempData["oemunkid"] != ""  && tempData["oemunkid"] != 1) {
		if (tempData["OEMRESfavicon"] != "undefined" && tempData["OEMRESfavicon"] != "" )
			oemfavicon = 'https://saas.s3.amazonaws.com/oem_images/frontoffice/' + tempData["OEMRESfavicon"];
	} else {
		oemfavicon = 'https://saas.s3.amazonaws.com/oem_images/frontoffice/absolute.ico';
		appleoemfavicon = 'https://saas.s3.amazonaws.com/oem_images/frontoffice/apple-touch-icon.png';
	}
	jQuery("#applefavicon").attr("href", appleoemfavicon);
	jQuery("#favicon").attr("href", oemfavicon);
	//29 July 2021 - END [ABS-6213]	
	if(tempData["userunkid"] != "undefined" && tempData["userunkid"] > 0 && tempData["hotel_name"] != "")
	{
		var isABS=isRes=0;
		jQuery.each(allowProduct,function(i,val){
			if(val == "EAF" || val == "EAB") isABS++;
			if(val == "ER") isRes++;
		});
		console.log(isABS + " --- " + isRes);

		var pfor = tempData["praccountfor"];
		console.log("Accout For --- " + pfor);
		//if (pfor == "ONLYABS") { //isABS > 0 && isRes <= 0 //Pratik Metaliya - ABS 2.0
		//	loginInToProduct("absfront");
		//} else
		if (pfor == "ONLYCHANNEL" || pfor == "RESCHANNEL" || pfor == "ONLYRES") { //if(isABS <= 0 && isRes > 0)
			loginInToProduct("resold");
		} else {
			if (tempData["oemunkid"] == 1) {
				jQuery(".login_content").find(".content_section.welcome").slideDown(200);
				jQuery(".branding").html("<img id='imgOEMLogo' src='/themes/login/images/eZee_logo.svg' alt='eZee Logo' height='48' width='48' />");
				jQuery(".ytlink").fadeIn(200);
				jQuery(".support_link").fadeIn(200);
			}
			else {
				var oemimgpath = 'https://saas.s3.amazonaws.com/oem_images/login/' + tempData["OEMLogo"];
				jQuery(".branding").html("<img id='imgOEMLogo' width='100px' height='20px' src='" + oemimgpath + "' alt='" + tempData["hotel_name"] + "'></img>");
				jQuery(".login_content").find(".content_section.welcome").hide();
				jQuery(".ytlink").hide();

				//20 Jan 2020 - RES-2372 - START
				if (tempData["oemunkid"] == 66 || tempData["oemunkid"] == 67)
					jQuery(".support_link").show();
				else
					jQuery(".support_link").hide();
				//20 Jan 2020 - RES-2372 - END
			}

			jQuery('.form_header').find(".acc_info > .username").html(tempData["username"]).css('textTransform', 'capitalize');
			jQuery('.form_header').find(".acc_info > .property_info").html("<span class='hotelname'>" + tempData["hotel_name"] + "</span><span class='hotelcode'> - " + tempData["hotel_code"] + "</span>");


			if (pfor == "ABSREV" || pfor == "ONLYABS" || pfor == "ONLYRES")
				jQuery(".btnER > span").text("Booking Engine Extranet");
			else
				jQuery(".btnER > span").text("Channel Manager Extranet");

			var dispBack = 0;
			jQuery.each(allowProduct, function (i, val) {
				if (val == "EAF") jQuery(".btnEAF").show();
				if (val == "EAB") { jQuery(".btnEAB").show(); dispBack++; }
				if (val == "ER") jQuery(".btnER").show();
				if (val == "OPTF") jQuery(".btnOPTF").show();
				if (val == "OPTB") { jQuery(".btnOPTB").show(); dispBack++; }
			});
			//04 Feb 2019 - [ABS-4812]
			if (dispBack == 0) {
				jQuery(".select_wrap").find(".lft > .sel_info").hide();
				jQuery(".select_wrap").find(".rgt > .switch").hide();
			} else {
				jQuery(".select_wrap").find(".lft > .sel_info").show();
				jQuery(".select_wrap").find(".rgt > .switch").show();
			}

			//Chandrakant - 18 January 2022 - START
			//Purpose : ABS-6408
			if(typeof(tempData["user_mfakey"])!=='undefined')
			{
				if(tempData["user_mfakey"].trim()!='')
				{
					console.log('--IF--');
					jQuery('#mfa_hotel_code').val(tempData["hotel_code"]);
					jQuery('#mfa_userunkid').val(tempData["userunkid"]);
					jQuery('#mfa_token').val(tempData["user_mfakey"]);
					jQuery('#universal_login,#qrcode_verify').hide();
					jQuery('.form_header').fadeIn(200);
					jQuery('#qrcode_verify').fadeIn(200);
				}
				else
				{
					console.log('--ELSE--');
					goToButtonChange();

					jQuery('#universal_login,#qrcode_verify').hide();
					jQuery('.form_header').fadeIn(200);
					jQuery('.select_section').fadeIn(200);
				}
			}
			else
			{
				goToButtonChange();

				jQuery('#universal_login,#qrcode_verify').hide();
				jQuery('.form_header').fadeIn(200);
				jQuery('.select_section').fadeIn(200);
			}
			// goToButtonChange();

			// jQuery('#universal_login,#qrcode_verify').hide();
			// jQuery('.form_header').fadeIn(200);
			// jQuery('.select_section').fadeIn(200);
			//Chandrakant - 18 January 2022 - END
		}
	}
}

function goToButtonChange() {
	if (jQuery("#goto").prop("checked") == false) {
		jQuery("#btnlistfront").show();
		jQuery("#btnlistback").hide();
		jQuery(".select_wrap").find(".lft > .sel_info").text("Toggle to log into configuration panel");
	} else {
		jQuery("#btnlistfront").hide();
		jQuery("#btnlistback").show();
		jQuery(".select_wrap").find(".lft > .sel_info").text("Toggle to log into front panel");
	}
}

function loginInToProduct(type) {
	if (type == "absfront" || type == "absback" || type == "resold" || type == "optimusfront" || type == "optimusback") {
		commonLoginLoader("show");
		if (type == "absfront" && tempData['ABS2SWITCH'] == 1) type = 'absfront_v2';
		var passDataAsStr = "action=productredirect&type=" + type + "&userunkid=" + tempData["userunkid"];
		var getUrl = 'index.php';
		jQuery.ajax({
			url: getUrl,
			type: "POST",
			data: passDataAsStr,
			error: function (request, error, message) {
				//console.log( "AJAX - error() >> "+message);
			},
			beforeSend: function () {
				//console.log("beforeSend");
			},
			complete: function (response) {
				//console.log("complete");
				//hideLoadingBar();
			},
			success: function (response) {
				if (type == "optimusfront" || type == "optimusback") {
					//30 Jan 2019 - START - [ABS-4812]
					var passDataAsStrOP = "action=getOptimusRedirectURL&posUserID=" + tempData["posUserID"] + "&product=" + type + "&OptimusAuthKey=" + tempData["OptimusAuthKey"] + "&OptimusValidateKey=" + tempData["OptimusValidateKey"];
					var urlOP = 'index.php';
					jQuery.ajax({
						type: "POST",
						url: urlOP,
						data: passDataAsStrOP,
						success: function (responseOP) {
							var arrResp = JSON.parse(responseOP);
							if (arrResp["errorcode"] != undefined && arrResp["errorcode"] == 0 && arrResp["errorcode"] != undefined && arrResp["URL"] != "") {
								setTimeout(function () {
									window.location.href = arrResp["URL"];
								}, 1500);
							} else {
								alert("Login Failed. Please recheck your login information.");
								commonLoginLoader("hide");
							}
						},
						complete: function () {
							setTimeout(function () {
								commonLoginLoader("hide");
							}, 2000);
						}
					});
					//30 Jan 2019 - END - [ABS-4812]
				} else {
					var responseData = [];
					responseData = JSON.parse(response);
					if (responseData["status"] != undefined && responseData["status"] == "SUCCESS" && responseData["product"] != undefined && responseData["product"] != "") {
						var commission_localstorage_val = (window.localStorage.hasOwnProperty("PerformanceAnalysis_Zenrooms_Report_Commission")) ? window.localStorage.getItem("PerformanceAnalysis_Zenrooms_Report_Commission") : "";//23 June 2020 - [ABS-5235]
						var reservation_check_list = (window.localStorage.hasOwnProperty("ABS2_RESERVATION_CHECK_LIST")) ? window.localStorage.getItem("ABS2_RESERVATION_CHECK_LIST") : ""; //Chaitanya Desai - 21 March 2022 - Purpose: To saved export checkbox value in reservation tab - [ABS-6377]
						localStorage.clear(); //27 Jan 2019 - [ABS-4846]

						//23 June 2020 - START - [ABS-5235]
						if (commission_localstorage_val != "")
							window.localStorage.setItem("PerformanceAnalysis_Zenrooms_Report_Commission", commission_localstorage_val);
						//23 June 2020 - END - [ABS-5235]
						//Chaitanya Desai - 21 March 2022 - START - Purpose: To saved export checkbox value in reservation tab - [ABS-6377]
						if (reservation_check_list != "")
							window.localStorage.setItem("ABS2_RESERVATION_CHECK_LIST", reservation_check_list);
						//Chaitanya Desai - 21 March 2022 - END - [ABS-6377]

						setTimeout(function () {
							if (responseData["product"] == "absfront") {
								if (tempData["lastview"] == 2)
									window.location.href = '/index.php/page/frontoffice.stayview';
								else
									window.location.href = '/index.php/page/frontoffice.localstorage?view=' + tempData["lastview"];
							} else if (responseData["product"] == "absback")
								window.location.href = '/index.php/page/configuration.amenity';
							else if (responseData["product"] == "resold") {
								localStorage.setItem('RequestFromCommonLogin', '1'); //24 Jan 2020 - [ABS-4847]
								window.location.href = '/index.php/page/reservation.localstorage';
							} else if (responseData["product"] == "optimusfront" || responseData["product"] == "optimusback") {
								alert("Under Development."); return false;
							} else if (responseData["product"] == "absfront_v2") {//Pratik Metaliya - Absolute 2.0
								window.location.href = responseData["ABS_V2_URL"];
							}
						}, 2000);
					}
					//console.log("In Success");
				}
			},
		});
	}
}

function processlogin() {
	if (jQuery("#acceptchk").is(':checked') == true) {
		var user = jQuery("#username").val();
		var hotelcode = jQuery("#hotelcode").val();

		var emailaddress = '';
		if (jQuery("#sendcopychk").is(':checked') == true) {
			if (jQuery("#emailaddress").val() != '')
				emailaddress = jQuery("#emailaddress").val();
			else {
				alert("Please enter valid email address");
				return false;
			}
		}
		document.getElementById('light_head').style.display = 'none';
		//27th May 2021 - START - [ABS-5490]
		var passDataAsStr = {
			action: "updatetermsconditions",
			username: user,
			hotelcode: hotelcode,
			emailaddress: emailaddress,
			acceptverify: jQuery("#acceptchk").is(':checked'),
		};
		//27th May 2021 - END - [ABS-5490]
		var url = 'index.php';
		jQuery.ajax({
			type: "POST",
			url: url,
			data: passDataAsStr,
			success: function (response) {
				if (response == 1) {
					submitLogin();
				}
				else {
					document.getElementById("light_head").style.display = "none";
					alert("Error occured during process. Please try again.");
					return false;
				}
			},
			complete: function () {
				setTimeout(function () {
					commonLoginLoader("hide");
				}, 2000);
			}
		});
	}
	else {
		alert("Please accept terms & conditions");
		return false;
	}
}

function payment_alert(action) {
	var user = jQuery("#username").val();
	var hotelcode = jQuery("#hotelcode").val();
	var payment_check = '';
	var prop_name = '';
	if (action.value == "Warning") {
		if (jQuery("#property_name").val() != '')
			prop_name = jQuery("#property_name").val();
		else {
			jQuery('#validMsg').html(' Enter Valid Name');
			jQuery('#validMsg1').html("");
			return false;
		}

		if (jQuery("#payment_date").val() != '')
			payment_check = jQuery("#payment_date").val();
		else {
			jQuery('#validMsg').html('');
			jQuery('#validMsg1').html(" Date can't be empty");
			return false;
		}
	} else {
		if (jQuery("#property_name_disable").val() != '')
			prop_name = jQuery("#property_name_disable").val();
		else {
			jQuery('#validMsg2').html(' Enter Valid Name');
			jQuery('#validMsg3').html("");
			return false;
		}

		if (jQuery("#payment_date_disable").val() != '')
			payment_check = jQuery("#payment_date_disable").val();
		else {
			jQuery('#validMsg2').html('');
			jQuery('#validMsg3').html(" Date can't be empty");
			return false;
		}
	}
	//27th May 2021 - START - [ABS-5490]
	var passDataAsStr = {
		action: "paymentmethod",
		username: user,
		hotelcode: hotelcode,
		paymentdate: payment_check,
		prop_name: prop_name,
		username: user,
	};
	//27th May 2021 - END - [ABS-5490]
	var url = "index.php";
	jQuery.ajax({
		type: "POST",
		url: url,
		data: passDataAsStr,
		beforeSend: function () {
			if (action.value == "Warning") {
				jQuery('#continue_btn').html('loading...');
				jQuery('#continue_btn').removeAttr("onclick");
				jQuery('#loding_alert').show();
			} else {
				jQuery('#continue_btn_disable').html('loading...');
				jQuery('#continue_btn_disable').removeAttr("onclick");
				jQuery('#loding_alert_disable').show();
			}
		},
		success: function (response) {

		},
		complete: function () {
			document.getElementById('div_wrapper').style.display = 'none';
			displayPageNextContent();
		},
		error: function () {
			alert("Unable to submit your request. Please, try again later.");
		}
	});
}

function saveopenip() {
	try {
		var resultIP = verifyIP(jQuery("#txtIPAddress").val());
		var msgElement = jQuery("#ajaxresponseopnip");
		if (resultIP != "") {
			msgElement.addClass("errormsg").html(resultIP);
			commonLoginLoader("hide");
			return false;
		}
		else {
			var param = "action=addopenipdata&description=" + jQuery("#txtDescription").val() + "&ipaddress=" + jQuery("#txtIPAddress").val() + "&iprequestfrom=<?php echo $visitorIP; ?>";
			jQuery.ajax({
				type: "POST",
				data: param,
				success: function (response) {
					var resultStatus = jQuery.trim(response);
					if (resultStatus == 'Success') {
						setTimeout(function () {
							displayPageNextContent();
							commonLoginLoader("hide");
						}, 1500);
						return false;
					}
					else if (resultStatus == 'existactive' || resultStatus == 'Warning') {
						msgElement.addClass("errormsg").html("IP already exist but was in disable mode , its is activate now.");
						commonLoginLoader("hide");
						setTimeout(function () {
							displayPageNextContent();
							//commonLoginLoader("hide");
						}, 2500);
						return false;
					}
					else if (resultStatus == 'Warning')
						msgElement.addClass("errormsg").html("Record already exists. Please try to login again.").fadeIn(500).delay(1500).fadeOut(1000);
					else
						msgElement.addClass("errormsg").html("Error : Opps , Your entry could not be saved due to database connection error. Please try again later.");
					commonLoginLoader("hide");
				}
			});
		}
	}
	catch (e) {
		console.log("saveopenip_Error - " + e);
	}
}

function commonLoginLoader(action) {
	if (action == "show")
		jQuery("#loginLoader").show();
	else
		jQuery("#loginLoader").hide();
}

function checkStrength(password) {
	var strength = 0;
	if (password.length < 6) {
		jQuery("#result").removeClass();
		jQuery("#result").addClass('short');
		return 'Too short';
	}

	if (password.length > 7)
		strength += 1;

	if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))
		strength += 1;

	if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))
		strength += 1;

	if (!password.match(new RegExp(jQuery('#username').val(), 'i')))
		strength += 1;

	if (strength < 3) {
		AccessLogin = 0;
		jQuery("#result").removeClass();
		jQuery("#result").addClass('weak');
		return 'Weak';
	} else if (strength == 3) {
		AccessLogin = 0;
		jQuery("#result").removeClass();
		jQuery("#result").addClass('good');
		return 'Good';
	} else {
		AccessLogin = 1;
		jQuery("#result").removeClass();
		jQuery("#result").addClass('strong');
		return 'Strong';
	}
}

function handlePasswordResetResponse(resultStatus, isFromForgotpassword) {
	if (resultStatus == 'success') {
		setResetPasswordMessages("success", isFromForgotpassword);
		setTimeout(function () {
			jQuery('#resetpasswordform').hide();
			jQuery('#universal_login').show();
			jQuery('#universal_login').find("#ajaxresponse").html("").css('visibility', 'hidden').removeClass("errormsg");
		}, 1000);
	}
	else {
		if (resultStatus == 'loginfail_warning') {
			setResetPasswordMessages('loginfail_warning', isFromForgotpassword);
			return false;
		} else if (resultStatus == 'loginfail_error') {
			setResetPasswordMessages('loginfail_error', isFromForgotpassword);
			return false;
		} else if (resultStatus == 'passwordfail') {
			setResetPasswordMessages('passwordfail', isFromForgotpassword);
			return false;
		} else if (resultStatus == 'commonpattern') {
			setResetPasswordMessages('commonpattern', isFromForgotpassword);
			return false;
		} else if (resultStatus == 'samepassword') {
			setResetPasswordMessages('samepassword', isFromForgotpassword);
			return false;
		} else if (resultStatus == 'hotel_deactive') {
			setResetPasswordMessages('hotel_deactive', isFromForgotpassword);
			return false;
		} else if (resultStatus == 'user_deactive') {
			setResetPasswordMessages('user_deactive', isFromForgotpassword);
			return false;
		} else if (resultStatus == 'Invalid_token') {
			setResetPasswordMessages('Invalid_token', isFromForgotpassword);
			return false;
		}
		/* 27th Jun 2020 - START - [ABS-5271] */
		else if (resultStatus == 'PE') {
			setResetPasswordMessages('PE', isFromForgotpassword);
			return false;
		}//27th Jun 2020 - END - [ABS-5271]
		else {
			setResetPasswordMessages('loginfail', isFromForgotpassword);
			return false;
		}
	}
}

function resetClicked() {
	var username = jQuery("#usernamereset").val();
	var oldpassword = jQuery("#oldpassword").val();
	var newpassword = jQuery("#newpassword").val();
	var hotelcode = jQuery("#hotelcodereset").val();
	if (username == '' || oldpassword == '' || newpassword == '' || hotelcode == '')
		setResetPasswordMessages('loginfail');
	else {
		if (AccessLogin == 1 && oldpassword != newpassword) {
			var url = "index.php";
			jQuery.ajax({
				type: "POST",
				url: url,
				data: { "action": "varifydetails", "username": username, "oldpassword": oldpassword, "newpassword": newpassword, "hotelcode": hotelcode },
				success: function (response) {
					var resultStatus = jQuery.trim(response);
					handlePasswordResetResponse(resultStatus, false);
				}
			});
		} else if (oldpassword == newpassword) {
			setResetPasswordMessages('samepassword');
			return false;
		}
		else {
			jQuery("#ajaxresponseresetpass").addClass("errormsg").html('"New Password" must be Strong. Please check suggestions given.').css('visibility', 'visible');
			jQuery("#pswd_info").css('top', "-65px").show();
		}
	}
}

function setResetPasswordMessages(type, isFromForgotpassword) {
	var msgElement = isFromForgotpassword ? (type == "success" ? jQuery("label#label_configuredemail > span#span_configuredemail") : jQuery("#ajaxresponse")) : jQuery("#ajaxresponseresetpass");
	msgElement.html('');
	if (!isFromForgotpassword || (isFromForgotpassword && type != "success")) msgElement.addClass("errormsg");
	if (type == "success" && !isFromForgotpassword) msgElement.css("background-color", "green");
	if (type == 'success')
		msgElement.html("Password reset Successfully.");
	else if (type == 'error')
		msgElement.html("There are some issue while reseting password.");
	else if (type == 'loginfail')
		msgElement.html("Please check whether you have entered all the details.");
	else if (type == 'loginfail_warning')
		msgElement.html("Please verify the information you have entered.");
	else if (type == 'loginfail_error')
		msgElement.html("There seems to be a problem in server connectivity. Please try again after sometime. ");
	else if (type == 'notmatch')
		msgElement.html("Old Password doesn't match.");
	else if (type == 'passwordfail') // 8th July 2017
		msgElement.html("Password must be strong with following requirements at least one letter, one number and one special characters with minimum 8 characters.");
	else if (type == 'commonpattern') // 11 Oct 2019
		msgElement.html("Password containing most common pattern or words. <a href='https://en.wikipedia.org/wiki/List_of_the_most_common_passwords' target='_blank'>click here</a>");
	else if (type == 'samepassword') // 11 Oct 2019
		msgElement.html(isFromForgotpassword ? "Password is same as your last password. Please try to login via same password again." : "New password must be different.");
	/* 27th Jun 2020 - START - [ABS-5271] */
	else if (type == "PE")
		msgElement.html("You can not use one of last four(4) old password.");
	//27th Jun 2020 - END - [ABS-5271]

	else if (type == "hotel_deactive")
		msgElement.html("Account is not active.");
	else if (type == "user_deactive")
		msgElement.html("User does not exist.");
	else if (type == "Invalid_token")
		msgElement.html("Sorry token expired for passwork reset.");

	if (msgElement.html() !== '') {
		if (isFromForgotpassword && type == "success") msgElement.show();
		else {
			msgElement.css('visibility', 'visible');
			if (!isFromForgotpassword) {
				if (type == "success") setTimeout(function () { msgElement.css('visibility', 'hidden'); }, 1500);
				else if (type == 'commonpattern') setTimeout(function () { msgElement.css('visibility', 'hidden'); }, 5000);
				else setTimeout(function () { msgElement.css('visibility', 'hidden'); }, 3500);
			}
		}
	}

	if (!isFromForgotpassword || (isFromForgotpassword && type == "success")) jQuery("#ajaxresponse").html("").css('visibility', 'hidden');
}

function disableClick() {
	document.onclick = function (event) {
		if (event.button == 2) {
			//alert('Right Click Message');
			return false;
		}
	}
}

function goBackToLogin() {
	commonLoginLoader("show");
	setTimeout(function () {
		commonLoginLoader("hide");
		jQuery('#resetpasswordform,#openipform,.select_section,.form_header,#qrcode_verify,#label_or_mfa,#qrcode_verify_reset').hide(); //Chandrakant - 18 January 2022, Purpose - ABS-6408 - qrcode_verify, label_or_mfa and qrcode_verify_reset added
		jQuery('#universal_login').find("#ajaxresponse").html("").css('visibility', 'hidden').removeClass("errormsg").css("background-color", "red");
		jQuery('#universal_login #hotelcode').focus();
		jQuery('#universal_login #password').val("");
		jQuery('#universal_login').show();
		jQuery("#favicon").attr("href", 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACOUlEQVRIS7XVyctPYRQH8M+LkJ1MyfgHIEqGDBtWFFlYyYokQ+YoyZCFZEqENWulZKFszGNhQSJlKHOyk0ydt/N7e97bvb/eVzl1F/fe5/l+z/P9nnOeDv85Ov4zvp4Q9MVMTMPoTOgt7uAWfrdLsh3BAKzBLgxuAHmPAziFH3VrmgjG4SIm5KabWIWz+b4c87ECE/EQi/G6SlJHEOB3MYwuCa/hHHbiE6YmUB9cwVx8xPQqSZUgZLmXmTed7kESRAK7sTbJwovHSdIlVxVkE45UjvkUIckkbMRenMeJArzcsgHHWx9KgqiWdxiCOHorbmB2jYEr8RyfsTQ9ilPF+6hWdZUEc3C1APqF01lFX2sIlqRP4c8rvMSIXDcLURjd+mALDuWC+3n8MLsu9qT+8S+0f4QpxcLNOFolCO3Dgydp8p8G8PAiANvFYWytEsTHYH6GZbn7Bb5VkHpCEEpsaydRCzPKbl4aV/Jszw5uOkXI3VmNpclhzPWaHUESXRsNVkbL5H2Fua3/MbtuVwlaZTq0QhzrTmJdQ7plcYTh0dG1ZRr7o0mO1QDFMIvBVxclQfxfn03Yubbayf1zDsUAK5stujY2VmNQUf9RdTH0ZpSTtW7ejM1ZP7wguYwFiOYrIyrlIAL8Q94Zb8oFTQMtSC5gMr5jIC5l+f7EeCzEfvTLzBehG3idRCV5yLUaOzCyQf8vOfzO9PbCKfHCi9A1Zv2YlCMyjSsznn++MhuS7t3nnlz6vUOsrP4LjyJzGS2+V+AAAAAASUVORK5CYII='); //29 July 2021 [ABS-6213]
	},1500);
}

function BindOpenIPFormSave() {
	var validator = jQuery("#openipform").on("submit").validate({
		meta: "validate",
		invalidHandler: function (form, validator) { },
		errorPlacement: function (error, element) { },
		submitHandler: function () {
			jQuery("div.valerror").hide();
			commonLoginLoader("show");
			saveopenip();
		},
		success: function (label) {
			//console.log("success");
			return true;
		}
	});
}

function BindResetPasswordFormSave() {
	var validator = jQuery("#resetpasswordform").on("submit").validate({
		meta: "validate",
		invalidHandler: function (form, validator) { },
		errorPlacement: function (error, element) { },
		submitHandler: function () {
			jQuery("div.valerror").hide();
			commonLoginLoader("show");
			setTimeout(function () {
				resetClicked();
				commonLoginLoader("hide");
			}, 1000);
		},
		success: function (label) {
			//console.log("success");
			return true;
		}
	});

	jQuery('#newpassword').keyup(function () {
		jQuery("#result").html(checkStrength(jQuery('#newpassword').val()));
		var pswd = jQuery('#newpassword').val();

		if (pswd.length < 8) {
			jQuery('#pswd_info #lengths').removeClass('valids').addClass('invalids');
		} else {
			jQuery('#pswd_info #lengths').removeClass('invalids').addClass('valids');
		}

		if (pswd.match(/[A-z]/)) {
			jQuery('#pswd_info #letter').removeClass('invalids').addClass('valids');
		} else {
			jQuery('#pswd_info #letter').removeClass('valids').addClass('invalids');
		}
		if (pswd.match(/\d/)) {
			jQuery('#pswd_info #number').removeClass('invalids').addClass('valids');
		} else {
			jQuery('#pswd_info #number').removeClass('valids').addClass('invalids');
		}

		if (pswd.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
			jQuery('#pswd_info #special').removeClass('invalids').addClass('valids');
		} else {
			jQuery('#pswd_info #special').removeClass('valids').addClass('invalids');
		}
		if (!pswd.match(new RegExp(jQuery('#username').val(), 'i'))) {
			jQuery('#pswd_info #containuser').removeClass('invalids').addClass('valids');
		} else {
			jQuery('#pswd_info #containuser').removeClass('valids').addClass('invalids');
		}
	}).focus(function () {
		//if(jQuery("div.valerror span").html()!=='')
		//jQuery("#pswd_info").css('top',"-65px");
		//else
		//jQuery("#pswd_info").css('top',"-65px");
		jQuery('#pswd_info').show();
	}).blur(function () {
		jQuery('#pswd_info').hide();
	});

	jQuery('#show_pass').click(function () {
		var x = document.getElementById("newpassword");
		if (x.type === "password") {
			document.getElementById("oldpassword").type = "text";
			x.type = "text";
		} else {
			x.type = "password";
			document.getElementById("oldpassword").type = "password";
		}
	});
}

function forgotPassword() {
	jQuery("label#label_username,label#label_hotelcode,button#logingoback").show();
	jQuery("label#label_username > input#username, label#label_hotelcode > input#hotelcode").val('').prop('required', true).addClass("required");
	jQuery("label#label_password,a#anchor_forgotPassword,label#label_resetpassword,label#label_confirmpassword,label#label_configuredemail,label#label_propertyemail").hide();
	jQuery("label#label_password > input#password, label#label_resetpassword > input#resetpassword, label#label_confirmpassword > input#confirmpassword, label#label_propertyemail > input#propertyemail").removeAttr('required').removeClass("required");
	jQuery('#universal_login > h1.form-title').html('Forgot Password');
	jQuery('.backToLoginForm').show();
	jQuery("button#login").text('VERIFY');
	jQuery("input#step").val('1');
	return false;
}

function fetchPropertyEmail() {
	jQuery("#ajaxresponse").css('visibility', 'hidden');
	const username = jQuery("input#username").val();
	const hotelcode = jQuery("input#hotelcode").val();
	if (username !== '' && hotelcode !== '') {
		jQuery("button#login").prop('disabled', true);
		jQuery.ajax({
			type: "POST",
			url: "index.php",
			data: { "action": "fetchPropertyEmail", "username": username, "hotelcode": hotelcode },
			success: function (response) {
				if (jQuery.trim(response) === 'InvalidRequest') {
					jQuery("#ajaxresponse").addClass("errormsg").html('Invalid Request.').css('visibility', 'visible');
					setTimeout(function () { 
						window.top.location.href = '//'+host+page;
					}, 3500);
					return;
				}
				jQuery("button#login").prop('disabled', false);
				var result = JSON.parse(jQuery.trim(response));
				const isHotelActive = result['isHotelActive'] ? parseInt(result['isHotelActive']) === 1: false;
				const isUserExist = result['isUserExist'] ? parseInt(result['isUserExist']) === 1: false;
				const propertyEmail = result['propertyEmail'] ? result['propertyEmail'] : '';
				if (isHotelActive && isUserExist && propertyEmail) {
					jQuery('#universal_login > h1.form-title').html('Forgot Password');
					jQuery("button#login").text('SEND PASSWORD RESET LINK');
					jQuery("input#step").val('2');
					jQuery("span#span_configuredemail").html("Please complete your property's email address <span>" + propertyEmail + "</span>");
					jQuery("label#label_username > input#username,label#label_hotelcode > input#hotelcode").prop('disabled', true);
					jQuery("label#label_username,label#label_hotelcode").css('background-color', 'lightgray');
					jQuery("#ajaxresponse").css('visibility', 'hidden');
					
					//Chandrakant - 18 January 2022 - START
					//Purpose : ABS-6408
					if(result['reset_mfakey']!='')
					{
						jQuery("label#label_configuredemail,label#label_propertyemail").hide();
						jQuery("label#label_propertyemail > input#propertyemail").val('').prop('required', false).removeClass("required");
						jQuery("#reset_mfacode").val('').prop('required', true).addClass("required");
						jQuery("#label_or_mfa,#qrcode_verify_reset").show();
					}
					else
					{
						jQuery("label#label_configuredemail,label#label_propertyemail").show();
						jQuery("label#label_propertyemail > input#propertyemail").val('').prop('required', true).addClass("required");
						jQuery("#reset_mfacode").val('').prop('required', false).removeClass("required");
						jQuery("#label_or_mfa,#qrcode_verify_reset").hide();
					}
					//Chandrakant - 18 January 2022 - END

				} else {
					jQuery("#label_or_mfa,#qrcode_verify_reset").hide(); //Chandrakant - 18 January 2022, Purpose - ABS-6408
					jQuery("button#login").text('VERIFY');
					jQuery("input#step").val('1');
					if (!isHotelActive) jQuery("#ajaxresponse").addClass("errormsg").html('Account is not active.').css('visibility', 'visible');
					else if (!isUserExist) jQuery("#ajaxresponse").addClass("errormsg").html('User not exist.').css('visibility', 'visible');
					else if (!propertyEmail) jQuery("#ajaxresponse").addClass("errormsg").html("Your property's email address not exist.").css('visibility', 'visible');
					return false;
				}
			}
		});
	}
}

function resetPassword() {
	jQuery("#ajaxresponse").css('visibility', 'hidden');
	const password = jQuery("input#resetpassword").val();
	const confirmPassword = jQuery("input#confirmpassword").val();
	if (password !== '' && confirmPassword !== '' && password === confirmPassword) {
		jQuery("button#login").prop('disabled', true);
		jQuery.ajax({
			type: "POST",
			url: "index.php",
			data: { "action": "resetPassword", "password": password, "token": token },
			success: function (response) {
				if (jQuery.trim(response) === 'InvalidRequest') {
					jQuery("#ajaxresponse").addClass("errormsg").html('Invalid Request.').css('visibility', 'visible');
					setTimeout(function () { 
						window.top.location.href = '//'+host+page;
					}, 3500);
					return;
				}
				jQuery("button#login").prop('disabled', false);
				var resultStatus = jQuery.trim(response);
				if (resultStatus == 'success') {
					jQuery("label#label_username,label#label_password,label#label_hotelcode,a#anchor_forgotPassword,label#label_resetpassword,label#label_confirmpassword,label#label_propertyemail").hide();
					jQuery("label#label_configuredemail").show();
					jQuery("button#login").text('BACK TO LOGIN');
					jQuery('#universal_login > h1.form-title').hide();
					jQuery("input#step").val('4');
					jQuery('.backToLoginForm').hide();
					jQuery("#ajaxresponse").css('visibility', 'hidden');
				}
				handlePasswordResetResponse(resultStatus, true);
			}
		});
	} else {
		if (password !== confirmPassword) {
			jQuery("#confirmpasswordresult").html("Confirm Password is not matching with password.");
		}
	}
}

function sendPasswordResetLink() {
	jQuery("#ajaxresponse").css('visibility', 'hidden');
	const username = jQuery("input#username").val();
	const hotelcode = jQuery("input#hotelcode").val();
	const propertyEmail = jQuery("input#propertyemail").val();
	//Chandrakant - 18 January 2022 - START
	//Purpose : ABS-6408
	const MFACode = jQuery("input#reset_mfacode").val();
	//if (username !== '' && hotelcode !== '' && propertyEmail) {
	if (username !== '' && hotelcode !== '' && (propertyEmail!='' || MFACode!='')) {
	//Chandrakant - 18 January 2022 - END
		jQuery("button#login").prop('disabled', true);
		jQuery.ajax({
			type: "POST",
			url: "index.php",
			data: { "action": "validateUserAndPropertyEmail", "username": username, "hotelcode": hotelcode, "propertyemail": propertyEmail, 
			"enteredCode": MFACode}, //Chandrakant - 18 January 2022, Purpose - ABS-6408 - enteredCode added
			success: function (response) {
				if (jQuery.trim(response) === 'InvalidRequest') {
					jQuery("#ajaxresponse").addClass("errormsg").html('Invalid Request.').css('visibility', 'visible');
					setTimeout(function () { 
						window.top.location.href = '//'+host+page;
					}, 3500);
					return;
				}
				jQuery("button#login").prop('disabled', false);
				var result = JSON.parse(jQuery.trim(response));
				const blockedCount = result['blockedCount'] ? parseInt(result['blockedCount']) : false;
				const isBlocked = result['isBlocked'] ? parseInt(result['isBlocked']) === 1: false;
				const isHotelActive = result['isHotelActive'] ? parseInt(result['isHotelActive']) === 1: false;
				const isUserExist = result['isUserExist'] ? parseInt(result['isUserExist']) === 1: false;
				const isPropertyEmailValid = result['isPropertyEmailValid'] ? parseInt(result['isPropertyEmailValid']) === 1: false;
				//Chandrakant - 18 January 2022 - START
				//Purpose : ABS-6408
				const isMFACodeValid = result['isMFACodeValid'] ? parseInt(result['isMFACodeValid']) === 1: false;
				//if (isHotelActive && isUserExist && isPropertyEmailValid && !isBlocked) {
				if (isHotelActive && isUserExist && (isPropertyEmailValid || isMFACodeValid) && !isBlocked) {
				//Chandrakant - 18 January 2022 - END
					jQuery("label#label_username,label#label_password,label#label_hotelcode,a#anchor_forgotPassword,label#label_resetpassword,label#label_confirmpassword,label#label_propertyemail,#label_or_mfa,#qrcode_verify_reset").hide(); //Chandrakant - 18 January 2022, Purpose - ABS-6408 - label_or_mfa, qrcode_verify_reset added
					jQuery("label#label_configuredemail").show();
					jQuery("label#label_configuredemail > span#span_configuredemail").html("Link has been sent on your property email address.");
					jQuery("button#login").text('BACK TO LOGIN');
					jQuery('#universal_login > h1.form-title').hide();
					jQuery("input#step").val('4');
					jQuery('.backToLoginForm').hide();
					jQuery("#ajaxresponse").css('visibility', 'hidden');
				} else {
					if (!isHotelActive) jQuery("#ajaxresponse").addClass("errormsg").html('Account is not active.').css('visibility', 'visible');
					else if (!isUserExist) jQuery("#ajaxresponse").addClass("errormsg").html('User not exist.').css('visibility', 'visible');
					else if (isBlocked) jQuery("#ajaxresponse").addClass("errormsg").html("You are locked for 30 min because you have reached the maximum number of attempts to provide an email address.").css('visibility', 'visible');
					//Chandrakant - 18 January 2022 - START
					//Purpose : ABS-6408
					//else if (!isPropertyEmailValid) jQuery("#ajaxresponse").addClass("errormsg").html("Entered email address is not matching.").css('visibility', 'visible');
					else if (propertyEmail!="" && !isPropertyEmailValid) jQuery("#ajaxresponse").addClass("errormsg").html("Entered email address is not matching.").css('visibility', 'visible');
					else if (MFACode!='' && !isMFACodeValid) jQuery("#ajaxresponse").addClass("errormsg").html("You have entered wrong code. Please try again.").css('visibility', 'visible');
					//Chandrakant - 18 January 2022 - END
					return false;
				}
			}
		});
	}
}

function backToLogin() {
	commonLoginLoader("show");
	setTimeout(function () {
		commonLoginLoader("hide");
		const isFromReset = parseInt(jQuery("input#step").val()) !== 0;
		if (isFromReset) {
			jQuery('#universal_login > h1.form-title').html('Login'); //Chandrakant - 18 January 2022, Purpose - ABS-6408
			jQuery("label#label_username,label#label_password,label#label_hotelcode,a#anchor_forgotPassword").show();
			jQuery("label#label_username > input#username, label#label_password > input#password, label#label_hotelcode > input#hotelcode").val('').prop('required', true).addClass("required");
			jQuery("label#label_resetpassword,label#label_confirmpassword,label#label_configuredemail,label#label_propertyemail,button#logingoback").hide();
			jQuery("label#label_resetpassword > input#resetpassword, label#label_confirmpassword > input#confirmpassword, label#label_propertyemail > input#propertyemail").removeAttr('required').removeClass("required");
			jQuery('.backToLoginForm').hide();
			jQuery('#resetpasswordform,#openipform,.select_section,.form_header,#label_or_mfa,#qrcode_verify_reset').hide(); //Chandrakant - 18 January 2022, Purpose - ABS-6408 - label_or_mfa, qrcode_verify_reset added
			jQuery("button#login").text('SIGN IN');
			jQuery("input#step").val('0');
			jQuery("label#label_configuredemail > span#span_configuredemail").html("");
			jQuery("label#label_username > input#username,label#label_hotelcode > input#hotelcode").prop('disabled', false);
			jQuery("label#label_username,label#label_hotelcode").css('background-color', '#fff');
			jQuery('#universal_login').find("#ajaxresponse").html("").css('visibility', 'hidden').removeClass("errormsg").css("background-color", "red");
			jQuery("label#label_username > input#username").focus();
			jQuery("label#label_password > input#password").val("");
			jQuery("label#label_propertyemail > input#propertyemail").val('');
		}
	},1500);
}

function redirectToLogin() {
	window.top.location.href = '//'+host+page;
}

jQuery('label#label_resetpassword #resetpassword_visibility_off').click(function () {
	jQuery('label#label_resetpassword #resetpassword_visibility').show();
	jQuery('label#label_resetpassword #resetpassword_visibility_off').hide();
	jQuery('label#label_resetpassword input#resetpassword').prop('type', 'text');
});

jQuery('label#label_resetpassword #resetpassword_visibility').click(function () {
	jQuery('label#label_resetpassword #resetpassword_visibility_off').show();
	jQuery('label#label_resetpassword #resetpassword_visibility').hide();
	jQuery('label#label_resetpassword input#resetpassword').prop('type', 'password');
});

jQuery('label#label_confirmpassword #confirmpassword_visibility_off').click(function () {
	jQuery('label#label_confirmpassword #confirmpassword_visibility').show();
	jQuery('label#label_confirmpassword #confirmpassword_visibility_off').hide();
	jQuery('label#label_confirmpassword input#confirmpassword').prop('type', 'text');
});

jQuery('label#label_confirmpassword #confirmpassword_visibility').click(function () {
	jQuery('label#label_confirmpassword #confirmpassword_visibility_off').show();
	jQuery('label#label_confirmpassword #confirmpassword_visibility').hide();
	jQuery('label#label_confirmpassword input#confirmpassword').prop('type', 'password');
});

jQuery('label#label_resetpassword > input#resetpassword').keyup(function () {
	jQuery("#resetpasswordresult").html(checkStrength(jQuery('#resetpassword').val()));
	var pswd = jQuery('#resetpassword').val();
	if (pswd.length < 8) {
		jQuery('#resetpasswordinfo #lengths').removeClass('valids').addClass('invalids');
	} else {
		jQuery('#resetpasswordinfo #lengths').removeClass('invalids').addClass('valids');
	}

	if (pswd.match(/[A-z]/)) {
		jQuery('#resetpasswordinfo #letter').removeClass('invalids').addClass('valids');
	} else {
		jQuery('#resetpasswordinfo #letter').removeClass('valids').addClass('invalids');
	}
	if (pswd.match(/\d/)) {
		jQuery('#resetpasswordinfo #number').removeClass('invalids').addClass('valids');
	} else {
		jQuery('#resetpasswordinfo #number').removeClass('valids').addClass('invalids');
	}

	if (pswd.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
		jQuery('#resetpasswordinfo #special').removeClass('invalids').addClass('valids');
	} else {
		jQuery('#resetpasswordinfo #special').removeClass('valids').addClass('invalids');
	}
	if (resetpassusername && !pswd.match(new RegExp(resetpassusername, 'i'))) {
		jQuery('#resetpasswordinfo #containuser').removeClass('invalids').addClass('valids');
	} else {
		jQuery('#resetpasswordinfo #containuser').removeClass('valids').addClass('invalids');
	}
	matchResetPasswordWithConfirmPassword();
}).focus(function () {
	jQuery('#resetpasswordinfo').show();
}).blur(function () {
	jQuery('#resetpasswordinfo').hide();
});

jQuery('label#label_confirmpassword > input#confirmpassword').keyup(function () {
	matchResetPasswordWithConfirmPassword();
});

function matchResetPasswordWithConfirmPassword() {
	const password = jQuery("input#resetpassword").val();
	const confirmPassword = jQuery("input#confirmpassword").val();
	if (password !== confirmPassword && password.length > confirmPassword.length && !password.startsWith(confirmPassword))
		jQuery("#confirmpasswordresult").html("Confirm Password is not matching with New Password.");
	else if (password !== confirmPassword && password.length < confirmPassword.length)
		jQuery("#confirmpasswordresult").html("Confirm Password is not matching with New Password.");
	else if (password !== confirmPassword && password.length === confirmPassword.length)
		jQuery("#confirmpasswordresult").html("Confirm Password is not matching with New Password.");
	else
		jQuery("#confirmpasswordresult").html("");
}

var yy = 2022;
var mm = 6;
var dd = 14;
var hh = 23;
var mn = 30;
function showLocalTimeZoneTime() {
	var now = new Date();
	now.setFullYear(yy);
	now.setMonth(mm - 1);
	now.setDate(dd);
	now.setHours(hh);
	now.setMinutes(mn);
	now.setSeconds(0);

	var mon = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	console.log(now);

	console.log(now.getTimezoneOffset());

	now.setMinutes(now.getMinutes() + (now.getTimezoneOffset() * -1));

	console.log(now);
	//17 October 2011 at 10:30 AM GMT
	var lyy = now.getFullYear();
	var lmm = mon[now.getMonth()];
	var ldad = day[now.getDay()];
	var ldd = now.getDate();
	var lhh = (now.getHours() > 12) ? now.getHours() - 12 : now.getHours();
	var lmn = now.getMinutes();
	var lampm = (now.getHours() >= 12) ? "PM" : "AM";

	lhh = lhh < 10 ? "0" + lhh : lhh;
	lmn = lmn < 10 ? "0" + lmn : lmn;

	var TimeZoneName = String(String(now).split("(")[1]).split(")")[0];

	jQuery("#downtime,#downtime1").text(ldad + ", " + ldd + " " + lmm + " " + lyy + " at " + lhh + ":" + lmn + " " + lampm + " ( " + TimeZoneName + " )");
	jQuery("#lnktimezone,.hidText").hide();
}