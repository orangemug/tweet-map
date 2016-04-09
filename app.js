var masterMap = L
  .map(document.querySelector('.outer'), {
    zoomControl: false
  })
  .setView([51.505, -0.09], 13);

var miniMap = L
  .map(document.querySelector('.inner'), {
    zoomControl: false,
    // Because we have it on the outer map
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
  console.log(bounds, point);

  var bounds = miniMap.getBounds();
  console.log(bounds);

  var northWest = new L.LatLng(bounds._northEast.lat, bounds._southWest.lng);
  var southWest = new L.LatLng(bounds._southWest.lat, bounds._northEast.lng);

  var coord1 = masterMap._latLngToNewLayerPoint(northWest, masterMap.getZoom(), masterMap.getCenter());

  var coord1 = masterMap.layerPointToContainerPoint(masterMap.latLngToLayerPoint(northWest));
  var coord2 = masterMap.layerPointToContainerPoint(masterMap.latLngToLayerPoint(southWest));
  console.log(coord2);

  d3.select(".line1")
    .attr("x1", 480)
    .attr("y1", 20)
    .attr("x2", coord1.x)
    .attr("y2", coord1.y)
    .attr("stroke", "black");

  d3.select(".line2")
    .attr("x1", 980)
    .attr("y1", 320)
    .attr("x2", coord2.x)
    .attr("y2", coord2.y)
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

function updateHash() {
  location.hash = "master/"+getPos(masterMap)+"/mini/"+getPos(miniMap)
}

function parseHash() {
  var hash = location.hash;
  var matches = hash.match(/^#master\/(\d+)\[([0-9.-]+),([0-9.-]+)\]\/mini\/(\d+)\[([0-9.-]+),([0-9.-]+)\]$/)

  if(matches) {
    var masterZoom = matches[1];
    var masterLng  = matches[2];
    var masterLat  = matches[3];
    masterMap.setView(L.latLng(masterLat, masterLng), masterZoom, {animate: false});

    var miniZoom = matches[4];
    var miniLng  = matches[5];
    var miniLat  = matches[6];
    miniMap.setView(L.latLng(miniLat, miniLng), miniZoom, {animate: false});
  }
}

var svg = d3.select(".outer").append("svg")
  .attr("width", 1000)
  .attr("height", 680);

console.log(svg)

var line1 = svg
  .append("line")
  .attr("class", "line1")
  .attr("x1", 5)
  .attr("y1", 5)
  .attr("x2", 50)
  .attr("y2", 50)
  .attr("stroke", "black");

var line2 = svg
  .append("line")
  .attr("class", "line2")
  .attr("x1", 5)
  .attr("y1", 5)
  .attr("x2", 50)
  .attr("y2", 50)
  .attr("stroke", "black")

function go() {
}

masterMap.on("move", updateHash);
miniMap.on("move", updateHash);

parseHash();
