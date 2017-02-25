// initial data

var requestStatus = [
	'Pending',
	'Payment Received',
	'In Process',
	'Dispatched'
]

var mailingMode = [
	'Pick up the transcripts personally.',
	'Mail the transcripts directly to the corresponding university.',
	'Mail the transcripts to a different mailing address.',
	'Mail the transcripts to your residential address.',
	'Mail the transcripts to your organization address.'
]



if(window.localStorage.getItem('loggedIn')){
	$('.loggedOut').hide();
	$('.loggedIn').show();
	// if(location.href.includes('index')||location.href.includes('register'))
	// 	location.href="/profile.html"
}else{
	// if(!location.href.includes('index')&&!location.href.includes('register'))
	// 	location.href="/index.html"
}


$('#next-page').click(function (ev) {
	ev.preventDefault();
	$('.page').hide();
	$('.pg2').show();
})

$('#prev-page').click(function (ev) {
	ev.preventDefault();
	$('.page').hide();
	$('.pg1').show();
})

$(document).on('click','.add_university',function(){
	var ele=$(this).closest('.university-details').clone();
	$(this).closest('.univ-modify').find('.add_univ').hide();
	$(this).closest('.univ-modify').find('.remove_univ').show().css({
		'display':'flex'
	});
	ele.find('input').val('');
	console.log(1,ele);
	$('.university-list.input-data').append(ele)
})

$(document).on('click','.remove_university',function(){
	$(this).closest('.university-details').remove();
	
})

baseUrl="http://arcd-transcripts.n93jg2wswv.ap-south-1.elasticbeanstalk.com"

// registeration
$('#sign-up').click(function(ev){
	ev.preventDefault();
	data={}
	$.each($('#register-form').serializeArray(), function(_, kv) {
		data[kv.name] = kv.value;
	});
	$('.toast').remove()

	$.ajax({
		method:'POST',
		url:baseUrl+'/api/profiles/register/',
		data:data,
		success:function(response,textStatus, xhr){
			if(xhr.status == 201){
				alert('Registration Successfull. Please verify your email')
			}
		},
		error:function(response){
			handleErrorObject(response.responseJSON);
		}
	})
})

// login
$('#sign-in').click(function(ev){
	ev.preventDefault();
	data={}
	$.each($('#login-form').serializeArray(), function(_, kv) {
		data[kv.name] = kv.value;
	});
	$('.toast').remove()

	$.ajax({
		method:'POST',
		url:baseUrl+'/api/profiles/login/',
		data:data,
		success:function(response,textStatus, xhr){
			window.localStorage.setItem('token',response.token)
			window.localStorage.setItem('loggedIn',true)
			location.href='/profile.html'
		},
		error:function(response,textStatus, xhr){
			console.log(response,textStatus,xhr);
			handleErrorObject(response.responseJSON);

		}
	})
})


//profile
if(location.pathname.includes('profile')){
	$('.toast').remove()
	$.ajax({
		method:'GET',
		url:baseUrl + '/api/profiles/profile/',
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", 'JWT '+window.localStorage.getItem('token'));
		},
		success:function(response){
			// $('#profile-form #username').html(response.user.username);
			$('#profile-form #first_name').html(response.user.first_name);
			$('#profile-form #last_name').html(response.user.last_name);
			$('#profile-form #email').html(response.user.email);
			$('#profile-form #id_number').html(response.id_number);
		}
	})
}


//request transcript
$('#request-transcipt-submit').click(function(ev){
	ev.preventDefault();
	data = {};
	basicInfo={};
	mailing_address={};
	residential_address={};
	organization_address={};
	delivery_by_speed_post=$('input[name=delivery_by_speed_post]')[0].checked
	university_details= [];
	$.each($('#basic-info-form').serializeArray(), function(_, kv) {
		if(kv.name == "mailing_mode")
		basicInfo[kv.name] = parseInt(kv.value);
		else
		basicInfo[kv.name] = kv.value;
	});
	$.each($('#mailing-address-form').serializeArray(), function(_, kv) {
		mailing_address[kv.name] = kv.value;
	});
	$.each($('#residential-address-form').serializeArray(), function(_, kv) {
		residential_address[kv.name] = kv.value;
	});
	$.each($('#organization-address-form').serializeArray(), function(_, kv) {
		organization_address[kv.name] = kv.value;
	});
	$.each($('.university-list.input-data form.university-details-form'),function(_, kv) {
		data = {}   
		address  = {}
		$.each($(kv).serializeArray(),function(_,key){
			if(key.name!='name'&&key.name!='number_of_transcripts')
			{	console.log(key.name,key.value)
				address[key.name]  = key.value; 
			}else
				data[key.name] = key.value;   
		});
		console.log(address)
		data['address'] = address;
		university_details.push(data);
	});

	data = basicInfo;
	data['mailing_address'] = mailing_address;
	data['residential_address'] = residential_address;
	data['organization_address'] = organization_address;
	data['organization_name'] = $('input[name=organization_name]').val();
	data['delivery_by_speed_post'] = delivery_by_speed_post;
	data['university_details'] = university_details;
    $('.toast').remove()
	$.ajax({
		method:'POST',
		url:baseUrl + '/api/transcripts/request-transcript/',
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", 'JWT '+window.localStorage.getItem('token'));
			xhr.setRequestHeader("Content-Type", 'application/json');
		},
		data:JSON.stringify(data),
		processData: false,
		dataType:'json',
		success:function(response){
			$('.page').hide();
			$('.pg3').show();
			setTranscriptInfo($('.pg3.info-section'),response)
		},
		error:function(response){
			handleErrorObject(response.responseJSON);
		}
	});

});



function setTranscriptInfo(transcriptDiv,data){

	transcriptDiv.find('#request_id').html(data['request_id']);
	transcriptDiv.find('#username').html(data['profile']['user']['username']);
	transcriptDiv.find('#name').html(data['profile']['user']['first_name']+' '+data['profile']['user']['last_name']);
	transcriptDiv.find('#first_name').html(data['profile']['user']['first_name']);
	transcriptDiv.find('#last_name').html(data['profile']['user']['last_name']);
	transcriptDiv.find('#email').html(data['profile']['user']['email']);
	transcriptDiv.find('#id_number').html(data['profile']['id_number']);
	transcriptDiv.find('#phone_number').html(data['phone_number']);
	transcriptDiv.find('#sealed_required').html(data['sealed_required']);
	transcriptDiv.find('#mailing_mode').html(mailingMode[data['mailing_mode']-1]);
	transcriptDiv.find('#cost').html(data['cost']);
	transcriptDiv.find('#request_status').html(requestStatus[data['request_status']-1]);
	transcriptDiv.find('#delivery_by_speed_post').html(data['delivery_by_speed_post']);
	transcriptDiv.find('#number_of_transcripts').html(data['number_of_transcripts']);
	transcriptDiv.find('#delivery_by_speed_post').html(data['delivery_by_speed_post']);

	setDateTime(transcriptDiv,data['create_time']);

	if(data['mailing_address']){
		transcriptDiv.find('.mailing_card').show();
		setAddress(transcriptDiv.find('form#mailing_address'),data['mailing_address']);
	}
	else
		transcriptDiv.find('.mailing_card').hide();

	if(data['organization_address']){
		transcriptDiv.find('.organization_card').show();
		setAddress(transcriptDiv.find('form#organization_address'),data['organization_address']);
		transcriptDiv.find('form#organization_address #organization_name').html(data['organization_name']);
	}
	else
		transcriptDiv.find('.organization_card').show();
	
	if(data['residential_address'])
		setAddress(transcriptDiv.find('form#residential_address'),data['residential_address']);


 	transcriptDiv.find('.university-details.visible').remove()
	$.each(data['university_details'],function(_,university){

		 var $ele = transcriptDiv.find('.university-details.hidden').clone();
		 $ele.removeClass('hidden').addClass('visible');
		 $ele.find('#name').html(university['name']);
		 $ele.find('#number_of_transcripts').html(university['number_of_transcripts']);
		 setAddress($ele,university['address'])
		 transcriptDiv.find('.university-list').append($ele);
	});

}



function setAddress(subForm,data){

	var address  = data['address_line_one'] + ',<br>' + data['address_line_two'] + ',<br>' + data['address_line_three'];
	subForm.find('#address').html(address)
	// subForm.find('#address_line_one').html(data['address_line_one'])
	// subForm.find('#address_line_two').html(data['address_line_two'])
	// subForm.find('#address_line_three').html(data['address_line_three'])
	subForm.find('#landmark').html(data['landmark'])
	subForm.find('#city').html(data['city'])
	subForm.find('#state').html(data['state'])
	subForm.find('#country').html(data['country'])
	subForm.find('#pincode').html(data['pincode'])
}


function setDateTime(subForm,data) {

	var raw_date = data.replace('T',' ').replace('Z','');
	var dateTime = new Date(raw_date);
	var date = dateTime.toLocaleDateString();
	var time = dateTime.toLocaleTimeString('IST',{ hour: 'numeric',minute:'numeric', hour12: true })

	subForm.find('#date').html(date);
	subForm.find('#time').html(time);
}


function handleErrorObject(data,gkey=''){
	console.log(gkey);
	if(typeof(val)=="string"){
		var str2="",str=key;
		$.each(str.split('_'),function(_,kv){
			key2=kv[0].toUpperCase()+kv.slice(1)
		    str2+=key2+" "
		});
		Materialize.toast(str2+" : "+val);   
	}
	else
	$.each(Object.keys(data),function(_,key){
		val=data[key];
		if(typeof(val)=="string"){
			var str2="",str=key;
			$.each(str.split('_'),function(_,kv){
				key2=kv[0].toUpperCase()+kv.slice(1)
			    str2+=key2+" "
			});
			Materialize.toast(str2+" : "+val);   
		}
	    else if(Array.isArray(val))
			$.each(val,function(_,k){
				if(typeof(k)=="object"){
					gkey+=' '+k
					handleErrorObject(k);
				}
				else{
					var str2="",str=key;
					$.each(str.split('_'),function(_,kv){
						key2=kv[0].toUpperCase()+kv.slice(1)
					    str2+=key2+" "
					});
		    		Materialize.toast(str2+" : "+k);    
				}
			});
		else if(typeof(val)=="object"){
	    		gkey+=' '+key
				handleErrorObject(val,gkey);
		}
	});
}

// get all transcript
if(location.pathname.includes('all-transcript')){
	$('.transcript-list .info-section.visible').remove();
	$('.transcript-list').hide();
	$.ajax({
		method:'GET',
		url:baseUrl + '/api/transcripts/request-transcript/',
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", 'JWT '+window.localStorage.getItem('token'));
		},
		success:function(response){
			$('#initMessage').hide();
			$('.transcript-list').show();
			$.each(response,function(i,data){
				var transcript=$('.transcript-list .info-section.hidden').clone();
				transcript.removeClass('hidden').addClass('visible');
				setTranscriptInfo(transcript,data);
				transcript.find('#s_no').html(i+1);
				$('.transcript-list').append(transcript);
			})
		   $('.collapsible').collapsible();
		}
	});
}


$('#search-transcript-btn').click(function(ev){
	$('.transcript-list .info-section.visible').remove();
	$('#initMessage').show();
	$('.toast').remove()

	ev.preventDefault();
	var request_id=$('#search-transcript-field').val();
	if(request_id==''){
		Materialize.toast('Search Field cannot be empty',2000);
	}
	else{
		$.ajax({
		method:'GET',
		url:baseUrl + '/api/transcripts/request-transcript/'+request_id+'/',
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", 'JWT '+window.localStorage.getItem('token'));
		},
		success:function(response){
			$('#initMessage').hide();

			var transcript=$('.transcript-list .info-section.hidden').clone();
			transcript.removeClass('hidden').addClass('visible');
			setTranscriptInfo(transcript,response);
			$('.transcript-list').append(transcript);
		},
		error:function(response){
			handleErrorObject(response.responseJSON)
		}
	});
	}

})

$('#search-transcript-field').on('change',function(){
	if($(this).val()==''){
		$('.transcript-list .info-section.visible').remove();
	$('.toast').remove()
	
	$.ajax({
		method:'GET',
		url:baseUrl + '/api/transcripts/request-transcript/',
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", 'JWT '+window.localStorage.getItem('token'));
		},
		success:function(response){
			$('#initMessage').hide();
			$.each(response,function(_,data){
				var transcript=$('.transcript-list .info-section.hidden').clone();
				transcript.removeClass('hidden').addClass('visible');
				setTranscriptInfo(transcript,data);
				$('.transcript-list').append(transcript);
			})
		}
	});
	}
})




// admin login

$('#admin-sign-in').click(function(ev){
	ev.preventDefault();
	data={}
	$.each($('#admin-login-form').serializeArray(), function(_, kv) {
		data[kv.name] = kv.value;
	});
	$('.toast').remove()

	$.ajax({
		method:'POST',
		url:baseUrl+'/api/profiles/admin-login/',
		data:data,
		success:function(response,textStatus, xhr){
			window.localStorage.setItem('token',response.token)
			window.localStorage.setItem('loggedIn',true)
			location.href='/admin/dashboard.html'
		},
		error:function(response,textStatus, xhr){
			handleErrorObject(response.responseJSON);

		}
	})
})


// get all transcript
var page = 1;

if(location.pathname.includes('admin/dashboard')){
	if(location.hash.includes('page')){
		page  = location.hash.substr(6);
	}
	openPage(page);	
}


function openPage(page){
	if(page == 1)
		$('#admin-prev-page').addClass('disabled');
	else
		$('#admin-prev-page').removeClass('disabled');

	location.hash='page='+page;
	$('#initMessage').show();
	$('.transcript-list').hide();
	$('.transcript-list .info-section.visible').remove();
	$.ajax({
		method:'GET',
		url:baseUrl + '/api/transcripts/admin-transcripts/?page='+page,
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", 'JWT '+window.localStorage.getItem('token'));
		},
		success:function(response){
			$('#initMessage').hide();
			$('.transcript-list').show();
			if(response.length<15)
				$('#admin-next-page').addClass('disabled');
			else
				$('#admin-next-page').removeClass('disabled');
			$.each(response,function(i,data){
				var transcript=$('.transcript-list .info-section.hidden').clone();
				transcript.removeClass('hidden').addClass('visible');
				setTranscriptInfo(transcript,data);

				// set serial numbers
				transcript.find('#s_no').html((i+1)+(15*(page-1)));

				$('.transcript-list').append(transcript);
			})
		    $('select').material_select();
		   $('.collapsible').collapsible();
		}
	});
}

$('#admin-next-page').click(function(){
	openPage(++page);
})

$('#admin-prev-page').click(function(){
	openPage(--page);
})

$(document).on('click','.edit_register_status',function(){
	var $wrapper = $(this).parent().find('.request-status-wrapper');
	$wrapper.show();
	$.each($wrapper.find('select option'),function(i,ele){
		if($(ele).html()=='Dispatched')
			$(ele).attr('selected','selected');
	});


})

$(document).on('click','#cancel-card',function(){
	console.log(1);
	$(this).closest('.request-status-wrapper').hide();
})
$(document).on('click','.update-request-status',function(){
	var $this = $(this);
	console.log($this);
	var data = {
		request_status : $this.closest('.card-content').find('select').val()
	}

	var request_id = $this.closest('.info-section').find('#request_id').html();
	$this.closest('.card-content').find('.message').html('Please Wait');
	$.ajax({
		method:'PUT',
		url:baseUrl + '/api/transcripts/admin-update-request-status/'+request_id+'/',
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", 'JWT '+window.localStorage.getItem('token'));
		},
		data:data,
		success:function(response){
			$this.closest('.card-content').find('.message').html('Status Updated Successfullly');
			$this.closest('.info-details').find('#request_status').html(requestStatus[parseInt(response.request_status)-1]);
			$this.closest('.request-status-wrapper').hide();

		},
		error:function (response,status,text) {
			$this.closest('.card-content').find('.message').html('Try Again');

		}
	});

})


$('input[name=org_field]').on('change',function () {
	if($(this).val()=="True")
		$('.org_form').show();
	else
		$('.org_form').hide();

})

$('input[name=sealed_required]').on('change',function () {
	if($(this).val()=="True")
		$('.univ_form').show();
	else
		$('.univ_form').hide();

})




$('#basic-info-form').on('change', 'select', function(){
	var selectOption = $(this).val();
	console.log(selectOption);
	if(selectOption==2)
			$('.univ_form').show();
		
	if(selectOption==3)
			$('.mail_form').show();
	
 });