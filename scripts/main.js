/**
 * Created by szyszka on 09.05.16.
 */
var map;
var infowindow;
var pyrmont;
var markers = [];
function initMap() {
  pyrmont = new google.maps.LatLng(54.372755, 18.635715);

  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: 11
  });
}
function update(form) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }

  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  debugger;
  service.nearbySearch({
    name: form.name.value || undefined,
    location: pyrmont,
    radius: form.distance.value * 1000,
    type: [form.type.value]
  }, callback);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  markers.push(marker);

  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

$('#form').validator().on('submit', function (e) {
  debugger;
  if (e.isDefaultPrevented()) {
    // handle the invalid form...
  } else {
    update(this);
    return false
  }
});

