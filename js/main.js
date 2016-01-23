init()

function init(event) {
  safari.application.addEventListener("message", function (evt){
    if (evt.name === 'getExhibition'){
      artAdder.localGet('exhibition')
      .then(function (exhibition){
        evt.target.page.dispatchMessage('exhibition', exhibition)
      })
    }
  }, false);

  syncDefaultList()
  .then(function () { return artAdder.localGet('exhibition') }) // have we chosen a show?
  .then(function (exhibition) {
    // no
    if (exhibition === 'undefined') { // why does it store it like this?
      artAdder.chooseMostRecentExhibition()
    } else {
      artAdder.currentExhibition = exhibition
    }
  })
}

// set default show list from add-art feed
function syncDefaultList() {
  var d = Q.defer()
  $.ajax({
    url : 'https://raw.githubusercontent.com/owise1/add-art-exhibitions/master/exhibitions.json',
    dataType : 'json',
    success : function (items) {
      items = items.sort(function (a,b) {
                     if (a.date > b.date) return -1
                     if (a.date < b.date) return 1
                     return 0
                   })
      if (items.length > 0) {
        artAdder.localSet('defaultShowData', items).then(d.resolve)
      }
    }
  })
  return d.promise
}
