init()

function init(event) {
  safari.application.addEventListener("message", function (evt){
    if (evt.name === 'getExhibition'){
      artAdder.localGet('exhibition')
      .then(function (exhibition){
        evt.target.page.dispatchMessage('exhibition', exhibition.exhibition)
      })
    }
  }, false);

  syncDefaultList()
  .then(function () { return artAdder.localGet('exhibition') }) // have we chosen a show?
  .then(function (exhibition) {
    // no
    if (!exhibition || !exhibition.exhibition) {
      artAdder.localGet('defaultShowData')
      .then(function (feeds) {
        var rand = feeds.defaultShowData[Math.floor(feeds.defaultShowData.length * Math.random())].title
        artAdder.exhibition(rand)
      })
    } else {
      artAdder.currentExhibition = exhibition
    }
  })
}

// set default show list from add-art feed
function syncDefaultList() {
  var d = Q.defer()
  fetchFeed('http://add-art.org/feed/')
  .then(function (items) {
    items = items.filter(function (show) { return show.link !== '' && show.images !== '' })
    if (items.length > 0) {
      artAdder.localSet('defaultShowData', items).then(d.resolve)
    }
  })
  return d.promise
}
