if (safari) { 
  var addArt = safari.extension.globalPage.contentWindow.artAdder

  artAdder.getAllExhibitions()
  .then(insertSources)

  artAdder.localGet('disableAutoUpdate')
  .then(function (res){
    var keepUpToDate = true
    if (res === 'undefined'){
      artAdder.localSet('disableAutoUpdate', false)
    } else {
      keepUpToDate = !res
    }
    $('input[name=autoUpdate]').attr('checked', keepUpToDate)
  })

  $(function (){
    $('body').on('click', 'input[name=autoUpdate]', function (){
      artAdder.localSet('disableAutoUpdate', !$(this).is(':checked'))
    })
  })
}


var currentExhibition

function insertSources(shows) {
  artAdder.localGet('exhibition')
  .then(function (exhibition) {
    currentExhibition = exhibition
    buildInterface(shows)
  })
}

function buildInterface(sources) {
	$shows = $('ul#shows');
	$showTemplate = $('ul#shows li.show');
	$infoPages = $('#infoPages');
	$infoPageTemplate = $('#infoPages .infoPage');
  $('body').addClass('loading')

	for(var i = 0; i < sources.length; i++) {
		addModules(sources[i],i);
    $shows.append($showTemplate.clone());
    $infoPages.append($infoPageTemplate.clone());
	}
  $('#shows li.show:last').remove() // sort of a strange way to do this, so we need to remove the last one

  $('body').removeClass('loading');


	$('#close').click(function() {
		$('header#top #close').removeClass('visible');
	  	$('.infoPage.opened').removeClass('opened');
	  	$('#newSource').removeClass('opened');
	});	

	$('#addSource').click(function() {
		$('header#top #close').addClass('visible');
	  	$('#newSource').addClass('opened');
	});
	$('body')
    .on('click', '.selectSource', function(){
      var selectedSource = $(this).attr('data-show');
      artAdder.exhibition(selectedSource)
      window.location.reload()
    })
    .on('click', '#addNewSource', function (){
      var url = $('#newSource input[type="text"]').val()
      function nope() {
        $('#newSource .errors').text('Sorry. That one didn\'t work.')
      }
      if (url !== '') {
        $('#newSource .errors').text('One sec...')
        $.ajax({
          dataType : 'json',
          url : url,
          success : function (res) {
            if (artAdder.verifyExhibition(res)) {
              res.url = url // save for later
              artAdder.addExhibition(res)
              .then(window.location.reload)
            } else {
              nope()
            }
          },
          error : nope
        })
      }
    })

}

var addendumI = 1
function addModules(show, i) {
	var $square = $('ul#shows li.show').eq(i);
  var description = show.description
	$square.attr('data-title', show.title);
	$square.find('.thumb img').attr('src', show.thumbnail);
	$square.find('.thumb .short-title').text(show.title);
  $square.removeClass('active')

  if (currentExhibition === show.title) {
    $square.addClass('active')
  }
  if (show.addendum) {
    $square.addClass('addendum')
    $square.find('.thumb .short-title').text('Addendum #' + addendumI++);
  } else if (show.url) {
    description += "\n\nEssay URL:\n" + show.url
  }

	$square.click(function() {
		var title = $(this).attr('data-title');
		$('header#top #close').addClass('visible');
		$('.infoPage[data-title="' + title + '"]').addClass('opened');
	});

	var $infoPage = $('.infoPage').eq(i);
	$infoPage.attr('data-title', show.title);
	$infoPage.find('h1.title').text(show.title);
	$infoPage.find('.date').text('Last updated on '+ artAdder.formatDate(show.date));
	$infoPage.find('.description').text(description);
	$infoPage.find('.link a').attr('href', show.link);

	$selectBtn = $infoPage.children('.selectSource');
	$selectBtn.attr('data-show', show.title);
}

