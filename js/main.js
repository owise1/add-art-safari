init()

function init(event) {
  safari.application.addEventListener("message", function (evt){
    if (evt.name === 'getExhibition'){
      artAdder.getExhibitionObj()
      .then(function (exhibition){
        evt.target.page.dispatchMessage('exhibition', exhibition)
      })
    } else if (evt.name === 'log') {
      console.log(evt.message)
    }
  }, false);

  var exhibition, disableAutoUpdate
  syncDefaultList()
  .then(function () { return artAdder.localGet('exhibition') }) // have we chosen a show?
  .then(function (ex) {
    exhibition = ex
    return artAdder.localGet('disableAutoUpdate')
  })
  .then(function (dau){
    disableAutoUpdate = dau
    return artAdder.getCustomExhibitions()
  })
  .then(function (customExhibitions) {
    if (R.find(R.propEq('title', exhibition), customExhibitions)) return // they've chosen a custom exhibition so dont reset it

    // why is it returned as a string 'undefined'?
    if (exhibition === 'undefined' || !exhibition || disableAutoUpdate !== true) {
      artAdder.chooseMostRecentExhibition()
    } 
  }).done()
}

// set default show list from add-art feed
function syncDefaultList() {
  var d = Q.defer()
  $.ajax({
    url : 'https://raw.githubusercontent.com/owise1/add-art-exhibitions/master/exhibitions.json',
    dataType : 'json',
    success : function (items) {
      items = items.sort(artAdder.exhibitionsSort)
      if (items.length > 0) {
        artAdder.localSet('defaultShowData', items).then(d.resolve)
      }
    }
  })
  return d.promise
}
