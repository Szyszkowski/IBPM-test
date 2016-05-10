/**
 * Created by szyszka on 09.05.16.
 */
var map;
var infowindow;
var pyrmont;
var markers = [];
var places = [];
var pages;
var helpArray = [];

// Inicjalizacja mapy.
function initMap() {
  pyrmont = new google.maps.LatLng(54.372755, 18.635715);
  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: 11
  });
  // Utworzenie markera w pozycji centralnej, według którego odbywało będzie się filtrowanie.
  var marker = new google.maps.Marker({
    map: map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: pyrmont,
    icon: 'http://ruralshores.com/assets/marker-icon.png'
  });
}
// Funkcja, która wysyła zapytanie do API na podstawie danych dostarczonych w formularzu.
function update(form) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  places = [];
  helpArray = [];
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

// Funkcja wykonywana po uzyskaniu odpowiedzi z API.
function processResults(results, status, pagination) {
  var check = helpArray.slice();
  $('.messages').addClass('hide');
  //W przypadku gdy status odpowiedzi jest poprawny, sprawdzam czy pobrane dane nie dublują obecnie posiadanych,
  //następnie tworzona jest tablica pomocnicza w której zapisywane są ID zabytków (w celu sprawdzenia dubli),
  //dalej pobrane miejsca zapisywane są w tablicy na której podstawie generowana jest tabela z informacjami o miejscach.
  //Ostatecznie na podstwie pobranych danych wywoływana jest funkcja tworząca markery.
  if (status === 'OK') {
    results.forEach(function (val, ind) {
      if (helpArray.indexOf(val.id) < 0) {
        helpArray.push(val.id);
        places.push(val);
        createMarker(val);
      }
    });
    // Każdorazowo pobranych zostaje maksymlanie 20 obiektów, jeżeli jest ich więcej uaktywnia się button,
    // który umożliwia pobranie kolejnych obiektów spełniającyh kryteria zapytania.
    if (pagination.hasNextPage && places.length < 300 && check.length !== helpArray.length) {
      var moreButton = document.getElementById('more');
      moreButton.disabled = false;
      moreButton.addEventListener('click', function () {
        moreButton.disabled = true;
        pagination.nextPage();
      });
    }
  }
  // Jeżeli kryteria wyszukiwania są zbyt rygorystyczne i nie zwróca żadnych wyników, jesteśmy o tym informowani odpowiednim komunikatem.
  else if (status === 'ZERO_RESULTS') {
    $('#alert').removeClass('hide');
  }
  // Jeżeli status odpowiedzi z serwera jest negatywny zostajemy również poinformowani o tym.
  else if (status !== 'OVER_QUERY_LIMIT') {
    $('#alert2').removeClass('hide')
  }
}
// Funkcja odpowiedzialna za tworzenie markerów.
function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP
  });

  markers.push(marker);
  google.maps.event.addListener(marker, 'click', function () {
    map.setZoom(14);
    map.setCenter(marker.getPosition());
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });

  navPagination();
}
// Funkcja umożliwiająca paginację wyników w formie tabeli. W przypadku dużej liczby danych, zwiększa ilość rekordów wyświetlanych w pojedyńczym widoku.

function showPage(page) {
  places.length < 50 ? pages = 5 : places.length < 100 ? pages = 10 : pages = 15;
  var row = '';
  places.slice(pages * page - pages, pages * page).forEach(function (val, ind) {
    row += '<tr id="' + (ind + 1 + (page - 1) * pages - 1) + '"><td>' + (ind + 1 + (page - 1) * pages) + '</td><td>' + val.name + '</td><td>' + val.vicinity + '</td></tr>';
  });
  $('tbody').html(row);
  $('#table').removeClass('hide');
  $('tr').click(function (e) {
    google.maps.event.trigger(markers[e.currentTarget.id], 'click', {});
  })
}
// Funckja tworząca buttony i kontrolująca tabele.
function navPagination() {
  var row = '';
  for (var i = 1; i < places.length / pages + 1; i++) {
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
  }
  else {
    update(this);
    return false
  }
});

