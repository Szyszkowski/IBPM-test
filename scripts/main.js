/**
 * Created by szyszka on 09.05.16.
 */
var map;
var infowindow;
var pyrmont;
var markers = [];
var places = [];

function initMap() {
  pyrmont = new google.maps.LatLng(54.372755, 18.635715);
  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: 11
  });
}

function update(form) {
  places = [];
  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    name: form.name.value || undefined,
    location: pyrmont,
    keyword: form.keywords.value || undefined,
    radius: form.distance.value * 1000,
    type: [form.type.value],
    openNow: form.open.checked || undefined
  }, processResults);
}

function processResults(results, status, pagination) {
  console.log(status);
  $('.messages').addClass('hide')
  if (status === 'OK') {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    createMarkers(results);
    if (pagination.hasNextPage) {
      var moreButton = document.getElementById('more');
      moreButton.disabled = false;
      moreButton.addEventListener('click', function () {
        moreButton.disabled = true;
        pagination.nextPage();
      });
    }
  } else if (status === 'ZERO_RESULTS') {
    $('#alert').removeClass('hide');
    return;
  } else if (status !== 'OVER_QUERY_LIMIT'){
    $('#alert2').removeClass('hide')
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
  navPagination();
}

function showPage(page) {
  var row = '<tr><td>#</td><td>Name</td><td>Address</td></tr>';
  places.slice(5 * page - 5, 5 * page).forEach(function (val, ind) {
    row += '<tr><td>' + (ind + 1 + (page - 1) * 5) + '</td><td>' + val.name + '</td><td>' + val.vicinity + '</td></tr>';
  });
  $('#tableData').html(row);
  $('#table').removeClass('hide');
}

function navPagination() {
  var row = '<tr><td>#</td><td>Name</td><td>Address</td></tr>';
  places.forEach(function (val, ind) {
    row += '<tr><td>' + (ind + 1) + '</td><td>' + val.name + '</td><td>' + val.vicinity + '</td></tr>';
  });

  $('#tableData').html(row);
  $('#table').removeClass('hide');
  var row = '';
  for (var i = 1; i < places.length / 5 + 1; i++) {
    row += '<li><a href="">' + i + '</a></li>';
  }

  $('#pagination').html(row);
  $('#pagination li a').click(function (e) {
    e.preventDefault();
    $('#pagination li').removeClass("active");
    $(this).addClass("active");
    showPage(this.textContent);
  });

  showPage(1);

}

$('#form').validator().on('submit', function (e) {
  if (e.isDefaultPrevented()) {
    // handle the invalid form...
  } else {
    update(this);
    return false
  }
});

