/**
 * NOTE: This is very messy, I'll tidy it at some point...
 */
var masterMap = L
  .map(document.querySelector('.outer'), {
    zoomControl: false,
    // Because we have it elsewhere
    attributionControl: false,
  })
  .setView([51.505, -0.09], 13);

var miniMap = L
  .map(document.querySelector('.inner'), {
    zoomControl: false,
    // Because we have it elsewhere
    attributionControl: false,
  })
  .setView([51.505, -0.09], 13);

function getTileLayer() {
  return L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  })
}

getTileLayer().addTo(masterMap);
getTileLayer().addTo(miniMap);

var viewRect = L
  .rectangle(miniMap.getBounds(), {
    color: "#D32F2F",
    weight: 2
  })
  .addTo(masterMap);

function setViewRect() {
  var bounds = miniMap.getBounds();
  viewRect.setBounds(bounds)

  var point = masterMap.project(bounds._southWest);

  var bounds = miniMap.getBounds();

  var northWest = new L.LatLng(bounds._northEast.lat, bounds._southWest.lng);
  var southWest = new L.LatLng(bounds._southWest.lat, bounds._northEast.lng);

  var coord1 = masterMap.layerPointToContainerPoint(masterMap.latLngToLayerPoint(northWest));
  var coord2 = masterMap.layerPointToContainerPoint(masterMap.latLngToLayerPoint(southWest));
  var coord3 = masterMap.layerPointToContainerPoint(masterMap.latLngToLayerPoint(bounds._southWest));
  var coord4 = masterMap.layerPointToContainerPoint(masterMap.latLngToLayerPoint(bounds._northEast));

  var innerEl = document.querySelector(".inner");
  var outer = document.querySelector(".outer").getBoundingClientRect();
  var inner = document.querySelector(".inner").getBoundingClientRect();
  var borderWidth = parseInt(window.getComputedStyle(innerEl).borderWidth) / 2;

  var innerBounds = {
    top:    inner.top    - outer.top  + borderWidth,
    left:   inner.left   - outer.left + borderWidth,
    bottom: inner.bottom - outer.top  - borderWidth,
    right:  inner.right  - outer.left - borderWidth
  };

  coord1.hide = true;
  if(
       (coord1.y >= innerBounds.top && coord1.x <= innerBounds.left)
    || (coord1.y <= innerBounds.top && coord1.x >= innerBounds.left)
  ) {
    coord1.hide = false;
  }

  // Top/left
  d3.select(".line1")
    .attr("hide", coord1.hide)
    .attr("x1",innerBounds.left)
    .attr("y1", innerBounds.top)
    .attr("x2", coord1.x)
    .attr("y2", coord1.y)
    .attr("stroke", "black");

  coord2.hide = true;
  if(
       (coord2.y >= innerBounds.bottom && coord2.x <= innerBounds.right)
    || (coord2.y <= innerBounds.bottom && coord2.x >= innerBounds.right)
  ) {
    coord2.hide = false;
  }

  // Bottom/right
  d3.select(".line2")
    .attr("hide", coord2.hide)
    .attr("x1", innerBounds.right)
    .attr("y1", innerBounds.bottom)
    .attr("x2", coord2.x)
    .attr("y2", coord2.y)
    .attr("stroke", "black");

  coord3.hide = true;
  if(
       (coord3.y > innerBounds.bottom && coord3.x > innerBounds.left)
    || (coord3.y < innerBounds.bottom && coord3.x < innerBounds.left)
  ) {
    coord3.hide = false;
  }

  // Bottom/left
  d3.select(".line3")
    .attr("hide", coord3.hide)
    .attr("x1", innerBounds.left)
    .attr("y1", innerBounds.bottom)
    .attr("x2", coord3.x)
    .attr("y2", coord3.y)
    .attr("stroke", "black");

  coord4.hide = true;
  if(
       (coord4.y > innerBounds.top && coord4.x > innerBounds.right)
    || (coord4.y < innerBounds.top && coord4.x < innerBounds.right)
  ) {
    coord4.hide = false;
  }

  // Top/right
  d3.select(".line4")
    .attr("hide", coord4.hide)
    .attr("x1", innerBounds.right)
    .attr("y1", innerBounds.top)
    .attr("x2", coord4.x)
    .attr("y2", coord4.y)
    .attr("stroke", "black");

}

setViewRect();
miniMap.on("move", setViewRect);
masterMap.on("move", setViewRect);

var marker = new L
  .marker([51.505, -0.09], {
    draggable:'true',
    icon: L.icon({
      iconUrl: 'marker-icon-2x.png',
      iconRetinaUrl: 'marker-icon-2x.png',
      iconSize: [25, 41],
      iconAnchor: [12.5, 41],
      shadowUrl: 'marker-shadow.png',
      shadowRetinaUrl: 'marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [12, 41]
    })
  })
  .addTo(miniMap);

document.querySelector(".btn-set-center")
  .addEventListener("click", function() {
    marker.setLatLng(miniMap.getCenter());
  });

function getPos(map) {
  var zoom = map.getZoom();
  var center = map.getCenter();
  return zoom+"["+center.lng+","+center.lat+"]"
}

var ignoreHashChange;

function updateHash() {
  location.hash = "master/"+getPos(masterMap)+"/mini/"+position+"/"+getPos(miniMap)
  ignoreHashChange = true;
}

window.addEventListener("hashchange", function() {
  if(ignoreHashChange) {
    ignoreHashChange = false;
    return;
  }

  parseHash();
});

function parseHash() {
  console.log("parseHash")
  var hash = location.hash;
  var matches = hash.match(/^#master\/(\d+)\[([0-9.-]+),([0-9.-]+)\]\/mini\/(.*)\/(\d+)\[([0-9.-]+),([0-9.-]+)\]$/)

  if(matches) {
    var masterZoom = matches[1];
    var masterLng  = matches[2];
    var masterLat  = matches[3];
    masterMap.setView(L.latLng(masterLat, masterLng), masterZoom, {animate: false});

    position = matches[4];
    rePosition(position)

    var miniZoom = matches[5];
    var miniLng  = matches[6];
    var miniLat  = matches[7];
    miniMap.setView(L.latLng(miniLat, miniLng), miniZoom, {animate: false});


    ignoreHashChange = true;
  }
  else {
    console.debug("No match", hash);
  }
}

var svg = d3.select(".outer").append("svg")
  .attr("width", 1000)
  .attr("height", 680);

var line1 = svg
  .append("line")
  .attr("class", "line line1")
  .attr("x1", 5)
  .attr("y1", 5)
  .attr("x2", 50)
  .attr("y2", 50)
  .attr("stroke", "black")

var line2 = svg
  .append("line")
  .attr("class", "line line2")
  .attr("x1", 5)
  .attr("y1", 5)
  .attr("x2", 50)
  .attr("y2", 50)
  .attr("stroke", "black")

var line3 = svg
  .append("line")
  .attr("class", "line line3")
  .attr("x1", 5)
  .attr("y1", 5)
  .attr("x2", 50)
  .attr("y2", 50)
  .attr("stroke", "black")

var line4 = svg
  .append("line")
  .attr("class", "line line4")
  .attr("x1", 5)
  .attr("y1", 5)
  .attr("x2", 50)
  .attr("y2", 50)
  .attr("stroke", "black")

function go() {
}

masterMap.on("dragend", updateHash);
miniMap.on("dragend", updateHash);

masterMap.on("zoomend", updateHash);
miniMap.on("zoomend", updateHash);

var mainEl = document.querySelector(".main");
console.log(mainEl);
var position = "top-right";
function rePosition(newPosition) {
  position = newPosition;
  console.log("rePosition", position)
  mainEl.setAttribute("data-position", position);
  setViewRect();
  updateHash();
}

var els = document.querySelectorAll(".position__marker");
els = Array.prototype.slice.call(els);
els.forEach(function(el) {
  el.addEventListener("click", function(e) {
    rePosition(el.getAttribute("data-position"));
    e.preventDefault();
  });
});


bindZoom(document.querySelector(".mini-map-zoom"), miniMap)
bindZoom(document.querySelector(".master-map-zoom"), masterMap)

function bindZoom(el, map) {
  el.setAttribute("min", map.getMinZoom())
  el.setAttribute("max", map.getMaxZoom())
  el.addEventListener("input", function() {
    map.setZoom(el.value)
  });
  map.on("zoomend", setZoom);
  function setZoom() {
    el.value = map.getZoom()
  }
  setZoom();
}

function hideSVG() {
  document.querySelector("svg").classList.add("hide");
}

function showSVG() {
  document.querySelector("svg").classList.remove("hide");
}

// Nicer UI
masterMap.on("zoomstart", hideSVG);
masterMap.on("zoomend", showSVG);


var geocodeFormEl = document.querySelector(".geocode-form");
var geocodeEl = document.querySelector(".geocode");

function geocode(query) {
  geocodeEl.setAttribute("disabled", true);
  geocodeEl.classList.add("working");

  fetch('http://nominatim.openstreetmap.org/search?format=json&q='+query)
    .then(function(response) {
      return response.json().then(function(data) {
        var topMatch = data[0];
        miniMap.setView(new L.LatLng(topMatch.lat, topMatch.lon));
      })
    })
    .catch(function(err) {
      alert(err)
    })
    .then(function() {
      geocodeEl.removeAttribute("disabled");
      geocodeEl.classList.remove("working");
    });
}

geocodeFormEl.addEventListener("submit", function(e) {
  geocode(geocodeEl.value);
  e.preventDefault();
})


document.addEventListener("DOMContentLoaded", parseHash);
