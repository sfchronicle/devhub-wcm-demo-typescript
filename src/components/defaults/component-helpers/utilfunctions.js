
// Grabs a param from the URL structure
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function convertURL(url){
  // Check if we already have a ?
  let newURL = url
  let paramConcat = "&"
  if (newURL.indexOf("?") === -1){
    paramConcat = "?"
  }
  newURL += paramConcat + "fromRichie=1"
  return newURL
}

// Adds Richie param to an array of links
function setRichieParam(linksArray){
  if (!linksArray){
    return null;
  }
  if (typeof window !== "undefined"){
    let param = getParameterByName("fromRichie")

    // Check if we're dealing with a string
    if (typeof linksArray == "string"){
      if (param){
        let newURL = convertURL(linksArray)
        return newURL
      } else {
        return linksArray
      }
    }

    // Otherwise, assume array
    let newArray = linksArray.slice()
    if (param){
      // If we found the param, loop through and add it to all the section links
      for (let item in newArray){
        let thisItem = newArray[item]
        thisItem.url = convertURL(thisItem.url)
      }
    }
    return newArray
  } else {
    // If window is undefined, return empty
    return []
  }
}

function debounce(fn, ms) {
  let timer
  return _ => {
    clearTimeout(timer)
    timer = setTimeout(_ => {
      timer = null
      fn.apply(this, arguments)
    }, ms)
  }
}

// Apply triggers at scroll depth locations on page so we get insight into how far readers go down
function applyScrollDepthTracking(){
  const depthSegments = 5
  const documentHeight = document.body.scrollHeight
  const tracked = []
  for (let i = 0; i<depthSegments-1; i++){
    tracked.push(documentHeight/depthSegments * (i+1))
  }

  const debouncedScrollTrack = debounce(function handleScrollTrack() {
    for (let i = 0; i<tracked.length; i++){
      if (tracked[i] && document.documentElement.scrollTop > tracked[i]){
        //console.log(`Reader reached ${100/depthSegments * (i+1)}% scroll depth`)
        try {
          if (window && window.ga){
            window.ga("hnp.send", "event", "Scroll depth", "Navigation", `Reader reached ${100/depthSegments * (i+1)}% scroll depth`);
          }
        } catch (err){
          // It's ok
        }
        tracked[i] = null // Making this null means it won't keep sending data
      }
    }
  }, 500)
  window.addEventListener('scroll', debouncedScrollTrack)
}

export { getParameterByName, setRichieParam, debounce, applyScrollDepthTracking }