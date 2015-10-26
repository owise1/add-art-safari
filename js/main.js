if (typeof chrome !== 'undefined') {
  chrome.runtime.onInstalled.addListener(function(event) {
    init(event);
  });

  chrome.runtime.onStartup.addListener(function(event) {
    init(event);
  });

  chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
      var key = msg.msg.what
      if (vAPI.artAdder[key] && typeof vAPI.artAdder[key] === 'function') {
        vAPI.artAdder[key](msg.msg[key])
      }
    })
  })
} else {
  init()
}

function init(event) {

  syncDefaultList()
  .then(function () { return vAPI.artAdder.localGet('exhibition') }) // have we chosen a show?
  .then(function (exhibition) {
    // no
    if (!exhibition || !exhibition.exhibition) {
      vAPI.artAdder.localGet('defaultShowData')
      .then(function (feeds) {
        var rand = feeds.defaultShowData[Math.floor(feeds.defaultShowData.length * Math.random())].title
        vAPI.artAdder.exhibition(rand)
      })
    } else {
      vAPI.artAdder.currentExhibition = exhibition
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
      vAPI.artAdder.localSet('defaultShowData', items).then(d.resolve)
    }
  })
  return d.promise
}
