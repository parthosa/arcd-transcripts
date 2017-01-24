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
	$('.university-list').append(ele)
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

if(location.pathname.includes('profile')){
	console.log('1')
	$.ajax({
		method:'GET',
		url:baseUrl + '/api/profiles/profile/',
		beforeSend : function(xhr) {
	          xhr.setRequestHeader("Authorization",  window.localStorage.getItem('token'));
	    },
		success:function(response){
			console.log(response)
		}
	})
}
