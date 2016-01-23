/**
 * There is no shared storage so we:
 * - send a message to the background script requesting the exhibitions and current piece
 * - what for the response
 * - set our local artAdder object with the exhibition and pieceI
 * - run processAdNode
 */
$(function (){
  safari.self.tab.dispatchMessage('getExhibition')
  safari.self.addEventListener('message', function (evt){
    if (evt.name === 'exhibition' && evt.message) {
      artAdder.currentExhibition = Q(evt.message.exhibition)
      artAdder.pieceI = evt.message.pieceI

      var howMany = 2
      var tried = 0
      ;(function checkIFrames() {
        $('iframe[id^=google_ads],ins.adsbygoogle,ins[id^=aswift],img[src*=decknetwork]').each(function (){
          artAdder.processAdNode(this)
        })
        if (++tried < howMany) {
          setTimeout(checkIFrames, 3000)
        }
      })()
    }
  }, false);

})
