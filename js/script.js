if(window.localStorage.getItem('loggedIn')){
	$('.loggedOut').hide();
	$('.loggedIn').show();
	if(location.href.includes('index')||location.href.includes('register'))
		location.href="/profile.html"
}else{
	if(!location.href.includes('index')&&!location.href.includes('register'))
		location.href="/index.html"
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
	$.ajax({
		method:'POST',
		url:baseUrl+'/api/profiles/register/',
		data:data,
		success:function(response,textStatus, xhr){
			if(xhr.status == 201){
				alert('Registration Successfull. Please verify your email')
			}
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
			var json= $.parseJSON(response.responseText);
			alert(json.error)

		}
	})
})


//profile
if(location.pathname.includes('profile')){
	$.ajax({
		method:'GET',
		url:baseUrl + '/api/profiles/profile/',
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", 'JWT '+window.localStorage.getItem('token'));
		},
		success:function(response){
			$('#profile-form #username').html(response.user.username);
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
			Materialize.toast(response,2000);
		}
	});

});



function setTranscriptInfo(transcriptDiv,data){

	console.log(transcriptDiv.find('#request_id span').html());
	transcriptDiv.find('#request_id span').html(data['request_id']);
	transcriptDiv.find('#username').html(data['user']['username']);
	transcriptDiv.find('#first_name').html(data['user']['first_name']);
	transcriptDiv.find('#last_name').html(data['user']['last_name']);
	transcriptDiv.find('#email').html(data['user']['email']);
	transcriptDiv.find('#phone_number').html(data['phone_number']);
	transcriptDiv.find('#sealed_required').html(data['sealed_required']);
	transcriptDiv.find('#mailing_mode').html(data['mailing_mode']);
	transcriptDiv.find('#cost').html(data['cost']);
	transcriptDiv.find('#delivery_by_speed_post').html(data['delivery_by_speed_post']);
	transcriptDiv.find('#number_of_transcripts').html(data['number_of_transcripts']);
	transcriptDiv.find('#delivery_by_speed_post').html(data['delivery_by_speed_post']);

	setAddress(transcriptDiv.find('form#mailing_address'),data['mailing_address']);
	setAddress(transcriptDiv.find('form#organization_address'),data['organization_address']);
	setAddress(transcriptDiv.find('form#residential_address'),data['residential_address']);

	transcriptDiv.find('form#organization_address #organization_name').html(data['organization_name']);
 	transcriptDiv.find('.university-details.visible').remove()
	$.each(data['university_details'],function(_,university){

		 var $ele = transcriptDiv.find('.university-details.hidden').clone();
		 $ele.removeClass('hidden').addClass('visible');
		 $ele.find('#name').html(university['name']);
		 $ele.find('#number_of_transcripts').html(university['number_of_transcripts']);
		 setAddress($ele,university['address'])
		 console.log($ele);
		 transcriptDiv.find('.university-list').append($ele);
	});

}



function setAddress(subForm,data){

	subForm.find('#address_line_one').html(data['address_line_one'])
	subForm.find('#address_line_two').html(data['address_line_two'])
	subForm.find('#address_line_three').html(data['address_line_three'])
	subForm.find('#landmark').html(data['landmark'])
	subForm.find('#city').html(data['city'])
	subForm.find('#state').html(data['state'])
	subForm.find('#country').html(data['country'])
	subForm.find('#pincode').html(data['pincode'])
}


function handleObject(object){

$.each(Object.keys(data),function(_,key){
	val=data[key];
	if(typeof(val)=="string")
		console.log(val);
	else if(Array.isArray(val))
			handleArray(val)
	else if(typeof(val)=="object")
		handleObject(val);
	else
		console.log(typeof(val));
});
return
}

function handleArray(array){
  $.each(array,function(_,ele){
  if(typeof(ele)=="object")
		handleObject(ele);
	else
		console.log(typeof(ele));
	
});
return	
}


// get all transcript
if(location.pathname.includes('all-transcript')){
	$('.transcript-list .info-section.visible').remove();
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


$('#search-transcript-btn').click(function(ev){
	$('.transcript-list .info-section.visible').remove();
	$('#initMessage').show();

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
			Materialize.toast('Try Again',1000);
		}
	});
	}

})

$('#search-transcript-field').on('change',function(){
	if($(this).val()==''){
		$('.transcript-list .info-section.visible').remove();
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