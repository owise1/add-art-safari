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
        var selectors = [
          'iframe[id^=google_ads]',
          'iframe[src*=serving-sys]',
          'ins.adsbygoogle',
          'ins.addendum',
          'ins[id^=aswift]',
          'img[src*=decknetwork]'
        ]
        $(selectors.join(',')).each(function (){
          artAdder.processAdNode(this)
        })
        if (++tried < howMany) {
          setTimeout(checkIFrames, 3000)
        }
      })()
    }
  }, false);

})
