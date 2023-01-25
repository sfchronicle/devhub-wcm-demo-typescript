// use as callback function with useSWR to grab data from apis

function getData(url) {
  return fetch(url).then((response) => response.json())
}

const sortFunc = (a, b) => {
  if (a.votes > b.votes){
    return -1
  }
  if (a.votes < b.votes){
    return 1
  }
  return 0
}

export { getData, sortFunc }
