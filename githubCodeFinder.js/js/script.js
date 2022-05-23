$('form').on('submit', (e) => {
	e.preventDefault();

	let username = $('#username').val();
	let repository = $('#repository').val();
	let filename = $('#filename').val();

	if(username && repository && filename){
		$('.filename, .text-editor').slideDown();
		axios
			.get(`https://cdn.jsdelivr.net/gh/${username}/${repository}/${filename}`)
			.then((res) => {
				$('.text-editor pre').text(res.data);
				$('.filename').text(filename);
				$('#filename').val('');
			})
			.catch((err) => $('.text-editor pre').text('Not Found'));
	}
});

$('.filename, .text-editor').hide();