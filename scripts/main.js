/**
 * Created by szyszka on 09.05.16.
 */
var map;
var infowindow;
var pyrmont;
var markers = [];
var places = [];
var pageSize = 3;
function initMap() {
  pyrmont = new google.maps.LatLng(54.372755, 18.635715);

  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: 11
  });
}

function update(form) {
  places = [];
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    name: form.name.value || undefined,
    location: pyrmont,
    radius: form.distance.value * 1000,
    type: [form.type.value]
  }, processResults);
}

function processResults(results, status, pagination) {
  if (status !== google.maps.places.PlacesServiceStatus.OK) {
    return;
  } else {
    createMarkers(results);

    if (pagination.hasNextPage) {
      var moreButton = document.getElementById('more');
      moreButton.disabled = false;
      moreButton.addEventListener('click', function () {
        moreButton.disabled = true;
        pagination.nextPage();
      });
    }
  }
}

function createMarkers(place) {
  for (var i = 0; i < place.length; i++) {
    var placeLoc = place[i].geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place[i].geometry.location
    });
        markers.push(marker);
    places.push(place[i]);
    google.maps.event.addListener(marker, 'click', function () {
      infowindow.setContent(place[i].name);
      infowindow.open(map, this);
    });
  }
  var row = '';
  for (i=1; i<places.length/5 + 1; i++){
    row += '<li><a href="#">' + i + '</a></li>';
  };
  showPage(1);
  $('#pagination').html(row);
  $("#pagination li a").click(function() {
    $("#pagination li").removeClass("active");
    $(this).addClass("active");
    debugger;
    showPage(this.textContent)
  });

}

 function showPage(page) {
   var row = '<tr><td>#</td><td>Name</td><td>Address</td></tr>';
   places.slice(5*page-5,5*page).forEach(function (val, ind){
    row += '<tr><td>' + (ind + 1 + (page-1)*5) + '</td><td>' + val.name + '</td><td>' + val.vicinity + '</td></tr>';
  });
   $('#tableData').html(row);

}


$('#form').validator().on('submit', function (e) {
  if (e.isDefaultPrevented()) {
    // handle the invalid form...
  } else {
    update(this);
    return false
  }
});

