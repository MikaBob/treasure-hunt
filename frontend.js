const FADE_TIME = 600;

$('#start').on('click', start); 

function start() {
	$('#start').hide({duration: 400, done: (()=>{
		$('#start').parent().remove();
		$('#answer').removeAttr('disabled');
		$('#button-answer').removeAttr('disabled');
		stopLoading();
		nextStep('0CTOSMJF6PH');
		$('.answerField').hide().fadeIn(FADE_TIME*2, () => {$('#answer').focus();});
	})});
};


function nextStep(answer) {
	
	if(typeof answer === 'undefined' || answer === '') {
		return;
	}
	
	if(answer === '') {
		return;
	}
	
	$.ajax({
		method: 'POST',
		url: '/getNextStep',
		data: {answer: answer, currentKey: $('#progression').val()},
		beforeSend: () => {
			startLoading();
			// remove alert
			$('.wrongAnswer-container').hide();
		}
	})
	.done((response) => {
		handleAnswer(response.err, response.msg, response.key, response.cleanAnswer);
	})
	.always(() => {
		stopLoading();
	});	
}

function handleAnswer(error, htmlToPrint, newKey, cleanAnswer) {
	$('#progression').val(newKey);
	if(error === 'ok'){
		// show the perfect answer
		if(cleanAnswer !== '') {
			hideAppendAndFadeInHtmlTo('<div class="text-primary center">'+cleanAnswer+'</div><hr class="separator my-4"/>', '.indices');
		}
		// show the next clue
		hideAppendAndFadeInHtmlTo('<div class="row indice p-2">'+htmlToPrint+'</div>', '.indices');
		window.scrollBy(0, 300);
	} else if(error === 'reset'){
		$('.indices').append('<hr class="separator my-4"/><div class="row indice p-2 mb-3">'+htmlToPrint+'</div>');
		nextStep('0CTOSMJF6PH');
	} else {
		$('.wrongAnswer').html(htmlToPrint);
		$('.wrongAnswer-container').fadeIn(FADE_TIME/2);
		window.scrollBy(0, 300);
		setTimeout(()=>{$('.wrongAnswer-container').fadeOut(FADE_TIME);}, 4000);
	}
}

function startLoading(){
	$('.loading-spiner').show();
	$('#answer').attr('disabled');
	$('#button-answer').attr('disabled');
}

function stopLoading(){
	$('.loading-spiner').hide();
	$('#answer').removeAttr('disabled');
	$('#button-answer').removeAttr('disabled');
}

function hideAppendAndFadeInHtmlTo(htmlToAppend, jquerySelectorContainer) {
	$(htmlToAppend).hide().appendTo(jquerySelectorContainer).fadeIn(FADE_TIME, ()=>{window.scrollBy(0, 300);});
}

// remove alert
$('.alert-close').click(() => {
	$('.wrongAnswer-container').hide();
});

$('form').submit((e) => {
	e.preventDefault();

	if($('#answer').val() !== '') {
		nextStep($('#answer').val());
	}
	$('#answer').val('');
});
