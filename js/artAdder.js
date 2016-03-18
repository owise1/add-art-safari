(function() {

  'use strict';

  /******************************************************************************/


  var lastUrl, 
      currentPieceI;
  function resetPieceI (){
    lastUrl = false
    currentPieceI = -1
  }
  resetPieceI()

  // rotate through pieces
  // each webpage shows a single image
  function getPieceI(currentExhibition) {
    if (safari.application.activeBrowserWindow.activeTab.url !== lastUrl) {
      lastUrl = safari.application.activeBrowserWindow.activeTab.url
      currentPieceI++
    }
    if (currentPieceI > currentExhibition.works.length - 1) {
      currentPieceI = 0
    }
    return currentPieceI
  }
    

  var artAdder = {
    processAdNode : function (elem) {

        var goodBye = false
      if (elem.offsetWidth < 2) goodBye = true 
      if (elem.offsetHeight < 2) goodBye = true 
      if (elem.tagName !== 'IFRAME' 
          && elem.tagName !== 'IMG'
          && elem.tagName !== 'OBJECT'
          && elem.tagName !== 'A'
          && elem.tagName !== 'INS'
          ) goodBye = true 

      if ($(elem).data('replaced')) goodBye = true 
      $(elem).data('replaced', true)
      if (goodBye) return


      var that = this

      artAdder.currentExhibition // this is set in content-end.js
      .then(function (exhibition) {

        var origW = elem.offsetWidth
        var origH = elem.offsetHeight
        var piece = exhibition.works[artAdder.pieceI]

        var $wrap = $('<div>').css({
          width: origW,
          height: origH,
          position : 'relative'
        })
        var art  = document.createElement('a')
        art.href = piece.link || exhibition.link || 'http://add-art.org' 
        art.title = piece.title || exhibition.title + ' | replaced by Add-Art'
        art.style.width = origW + 'px'
        art.style.height = origH + 'px'
        art.style.display = 'block'
        art.style.position = 'absolute'
        art.style.background = "url(" + piece.image + ")"
        art.style.backgroundSize = "cover"
        art.style.backgroundPosition = "left " + ['top', 'bottom', 'center'][( Math.floor(Math.random() * 3) )]
        art.style.backgroundRepeat = "no-repeat"

        $wrap.append(art)
        $(elem.parentElement).append($wrap)
        $(elem).remove()
      })
    },
    getExhibitionObj : function (){
      var exhibitions
      return artAdder.getAllExhibitions()
      .then(function (data){
        exhibitions = data
        return artAdder.localGet('exhibition')
      })
      .then(function (title){
        var currentEx = R.find(R.propEq('title', title), exhibitions) 
        var ret = {
          exhibition : currentEx, 
          pieceI : getPieceI(currentEx) 
        }
        return ret
      })
    },
    exhibition : function (name) {
      return artAdder.setExhibition(name)
    },
    chooseMostRecentExhibition : function () {
      return artAdder.localGet('defaultShowData')
      .then(function (feeds) {
        var latest = feeds[0].title
        return artAdder.exhibition(latest)
      })
    },
    currentExhibition : false,
    setExhibition : function (exhibition) {
      artAdder.currentExhibition = Q(exhibition)
      resetPieceI()
      return artAdder.localSet('exhibition', exhibition)
    },
    getExhibition : function () {
      if (artAdder.currentExhibition) return artAdder.currentExhibition
      return Q(false)
    },
    // abstract storage for different browsers
    localSet : function (key, thing) {
      localStorage.setItem(key, JSON.stringify(thing))
      return Q(thing)
    },
    localGet : function (key) {
      var thing = localStorage.getItem(key)
      if (thing !== 'undefined') thing = JSON.parse(thing) // why does it store a string 'undefined'?
      return Q(thing)
    },
    getCustomExhibitions : function (){
      var d = Q.defer()
      artAdder.localGet('customExhibitions')
      .then( function (ce){
        var customExhibitions = ce || []
        d.resolve(customExhibitions.filter(function (e){ return e  })) // get rid of blanks 
      })
      return d.promise

    },
    getAllExhibitions : function () {
      var d = Q.defer()
      var exhibs = []
      artAdder.localGet('defaultShowData')
      .then(function (defaultShows){
        exhibs = R.map(artAdder.addPropToObj('addendum', true), exhibs.concat(defaultShows))
        return artAdder.getCustomExhibitions()
      })
      .then(function (customExhibitions){
        d.resolve(exhibs.concat(customExhibitions).sort(artAdder.exhibitionsSort)) 
      })
      .done()
      return d.promise
    },
    addExhibition : function (customExhibition){
      return artAdder.getCustomExhibitions()
      .then( function (customExhibitions){
        customExhibitions.push(customExhibition)
        customExhibitions = R.uniq(customExhibitions)
        return artAdder.localSet('customExhibitions', customExhibitions)
      })
    },
    formatDate : function (t){
      var d = new Date(t)
      return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear()
    },
    verifyExhibition : function (exhib){
      return ['artist','description','title','thumbnail','works'].reduce(function (prev, curr){
        if (!prev) return prev 
        return exhib[curr] !== undefined
      }, true)
    },
    exhibitionsSort : function (a,b) {
      if (a.date > b.date) return -1
      if (a.date < b.date) return 1
      return 0
    },
    addPropToObj : R.curry(function (prop, fn){
      return function (obj) {
        return R.set(R.lensProp(prop), typeof fn === 'function' ? fn(obj) : fn, R.clone(obj))
      }
    }),

    /*  from original add-art */
    loadImgArray : function() {
      this.ImgArray = new Array();
      // taken from: https://en.wikipedia.org/wiki/Web_banner
      // 19 images sizes total

      // Rectangles
      this.ImgArray.push( [ 336, 280 ] ); // Large Rectangle
      this.ImgArray.push( [ 300, 250 ] ); // Medium Rectangle
      this.ImgArray.push( [ 180, 150 ] ); // Rectangle
      this.ImgArray.push( [ 300, 100 ] ); // 3:1 Rectangle
      this.ImgArray.push( [ 240, 400 ] ); // Vertical Rectangle

      // Squares
      this.ImgArray.push( [ 250, 250 ] ); // Square Pop-up

      // Banners
      this.ImgArray.push( [ 720, 300, ] ); // Pop-Under
      this.ImgArray.push( [ 728, 90, ] ); // Leaderboard
      this.ImgArray.push( [ 468, 60, ] ); // Full Banner
      this.ImgArray.push( [ 234, 60, ] ); // Half Banner
      this.ImgArray.push( [ 120, 240 ] ); // Vertical Banner

      //Buttons
      this.ImgArray.push( [ 120, 90 ] ); // Button 1
      this.ImgArray.push( [ 120, 60 ] ); // Button 2
      this.ImgArray.push( [ 88, 31 ] ); // Micro Bar
      this.ImgArray.push( [ 88, 15 ] ); // Micro Button
      this.ImgArray.push( [ 125, 125 ] ); // Square Button

      //Skyscrapers
      this.ImgArray.push( [ 120, 600 ] ); // Standard Skyscraper
      this.ImgArray.push( [ 160, 600 ] ); // Wide Skyscraper
      this.ImgArray.push( [ 300, 600 ] ); // Half-Page

    },
    askLink : function(width, height) {
      // Find this.ImgArray with minimal waste (or need - in this case it will be shown in full while mouse over it) of space
      var optimalbanners = null;
      var minDiff = Number.POSITIVE_INFINITY;
      for ( var i = 0; i < this.ImgArray.length; i++) {
          var diff = Math.abs(width / height - this.ImgArray[i][0] / this.ImgArray[i][1]);
          if (Math.abs(diff) < Math.abs(minDiff)) {
              minDiff = diff;
              optimalbanners = [ i ];
          } else if (diff == minDiff) {
              optimalbanners.push(i);
          }
      }

      var optimalBanner = [];
      minDiff = Number.POSITIVE_INFINITY;
      for (i = 0; i < optimalbanners.length; i++) {
          var diff = Math.abs(width * height - this.ImgArray[optimalbanners[i]][0] * this.ImgArray[optimalbanners[i]][1]);
          if (diff < minDiff) {
              minDiff = diff;
              optimalBanner = [ optimalbanners[i] ];
          } else if (diff == minDiff) {
              optimalBanner.push(optimalbanners[i]);
          }
      }
      return this.ImgArray[optimalBanner[Math.floor(Math.random() * optimalBanner.length)]];
    }

  }

  
  artAdder.loadImgArray() // loadImgArray

  if (typeof vAPI !== 'undefined') vAPI.artAdder = artAdder
  else window.artAdder = artAdder
  
})();
