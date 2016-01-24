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

  var exhibition
  syncDefaultList()
  .then(function () { return artAdder.localGet('exhibition') }) // have we chosen a show?
  .then(function (ex) {
    exhibition = ex
    return artAdder.localGet('disableAutoUpdate')
  })
  .then(function (disableAutoUpdate){
    // why is it returned as a string 'undefined'?
    if (exhibition === 'undefined' || !exhibition || disableAutoUpdate !== true) {
      artAdder.chooseMostRecentExhibition()
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
