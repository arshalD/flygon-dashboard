$(function() {
	'use strict';
	
  $('.form-control').on('input', function() {
	  var $field = $(this).closest('.form-group');
	  if (this.value) {
	    $field.addClass('field--not-empty');
	  } else {
	    $field.removeClass('field--not-empty');
	  }
	});

});
const alertPlaceholder = document.getElementById('liveAlertPlaceholder')

const errAlert = (message, type) => {
  alertPlaceholder.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '</div>'
  ].join('')
}

const verify = ()=>{
	console.log(this.event)
	let email = $('#email').val();
	let password = $('#password').val();
	console.log(email,password)
	fetch('http://localhost:8081/verify', {
		method: 'POST',
		body: JSON.stringify({
		  email: email,
		  password: password
		}),
		headers: {
		  'Content-type': 'application/json; charset=UTF-8',
		}
		})
		.then((response)=>{ 
		  console.log(response)
		  if(response.status === 403){
			errAlert('Wrong Email or Password', 'danger')
			console.log(response.json())
		  }
		  else{
			console.log('Success')
			window.location.reload()
		  }
		})
}

