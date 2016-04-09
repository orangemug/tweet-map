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

var viewRect = L.rectangle(miniMap.getBounds(), {color: "#333", weight: 2})
  .addTo(masterMap);

function setViewRect() {
  viewRect.setBounds(miniMap.getBounds())
}

setViewRect();
miniMap.on("move", setViewRect)

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

