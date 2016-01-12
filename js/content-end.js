$(function (){
  safari.self.tab.dispatchMessage('getExhibition')
  safari.self.addEventListener('message', function (evt){
    if (evt.name === 'exhibition' && evt.message) {
      artAdder.currentExhibition = Q(evt.message)

      var howMany = 2
      var tried = 0
      ;(function checkIFrames() {
        $('iframe[id^=google_ads],ins.adsbygoogle,ins[id^=aswift]').each(function (){
          artAdder.processAdNode(this)
        })
        if (++tried < howMany) {
          setTimeout(checkIFrames, 3000)
        }
      })()
    }
  }, false);

})
