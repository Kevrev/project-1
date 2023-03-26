// Initialize and add the map
const MARKER_PATH =
  "https://developers.google.com/maps/documentation/javascript/images/marker_green";
let storedHistory = JSON.parse(localStorage.getItem("historyValue")) || [];
let historyEl = $("#history");

$("#clearHistory").on("click", function () {
  localStorage.clear();
  historyEl.empty();
});

for (var i = 0; i < 15; i++) {
  $("<div>").text(storedHistory[i]).appendTo(historyEl);
}

function initMap() {
  // The location of California
  const california = { lat: 36.778, lng: -119.417 };
  // The map, centered at California
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: california,
  });

  // This is creating the searchbox
  let searchBox = new google.maps.places.SearchBox(
    document.getElementById("locationSearch")
  );

  // Fires when an input is made or prediction is picked
  google.maps.event.addListener(searchBox, "places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length === 0) {
      // TODO: add content: there's no result/ may adjust the redius to test
      return;
    }

    let historyValue = places[0].formatted_address;
    storedHistory.unshift(historyValue);

    localStorage.setItem(
      "historyValue",
      JSON.stringify(storedHistory.slice(0, 15))
    );

    $("<div>").text(historyValue).prependTo(historyEl);

    // Get the latitude and longitude of the entered location
    const location = places[0].geometry.location;

    // Search for campgrounds nearby the location
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
      {
        location: location,
        // Searches in a 50km radius
        radius: 50000,
        keyword: "campground",
        // type: ["campground"]
      },

      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          clearResults(); // Clear any existing markers on the map on the lise TODO: fix the label rotation issue

          // Clear any existing markers on the map
          markers.forEach((marker) => {
            marker.setMap(null);
          });
          markers = [];

          // Creates a marker for each campground
          for (let i = 0; i < results.length; i++) {
            createMarker(results[i], map, i);
          }

          // Fits the map to the bounds of the markers
          const bounds = new google.maps.LatLngBounds();
          markers.forEach((marker) => {
            bounds.extend(marker.getPosition());
          });
          map.fitBounds(bounds);
        }
      }
    );
  });
}

let activeMarker = null;

let labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// const markerIcon = MARKER_PATH + labels[labelIndex++ % labels.length] + ".png";

function createMarker(place, map, labelIndex) {
  const markerIcon =
    MARKER_PATH + labels[labelIndex++ % labels.length] + ".png";
  let marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: markerIcon,
    animation: google.maps.Animation.DROP,
  });

  let service = new google.maps.places.PlacesService(map);
  let request = {
    placeId: place.place_id,
    fields: ["website", "formatted_phone_number", "rating"],
  };

  service.getDetails(request, function (placeDetails, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const photoUrl =
        place.photos && place.photos.length > 0
          ? place.photos[0].getUrl({
              maxWidth: 150,
              maxHeight: 150,
            })
          : "./assets/images/NO IMAGE AVAILABLE.png";

      // $("#resultDesc").text(markers.length + " Results:");

      const websiteUrl = placeDetails.website ? placeDetails.website : "";
      const phoneNumber = placeDetails.formatted_phone_number
        ? placeDetails.formatted_phone_number
        : "NA";
      const userRating = placeDetails.rating ? placeDetails.rating : "--";
      const $outerDiv = $("<div>")
        .attr("id", "resultLocation-2")
        .addClass("placeCard mb-2");

      const $rowDiv = $("<div>").addClass("row g-0");

      const $imgDiv = $("<div>").addClass("col-md-4 col-sm-4 imgContainer");

      const $img = $("<img>")
        .attr("src", photoUrl)
        .addClass("rounded-start locationImage");

      const $cardBodyDiv = $("<div>")
        .addClass("col-md-8 col-sm-8")
        .addClass("placeCard-body");

      const $locationName = $("<h5>")
        .addClass("card-title locationName")
        .text(place.name);

      const $locationAddress = $("<p>")
        .addClass("card-text locationAddress")
        .text(place.vicinity);

      const $phoneIcon = $("<i>")
        .addClass("fa-solid fa-phone")
        .attr("aria-hidden", "true");

      const $locationContact = $("<p>")
        .addClass("card-text locationContact")
        .text(" " + phoneNumber);

      const $websiteLink = $("<a>")
        .attr({ href: websiteUrl, target: "_blank" })
        .text(" Website ");

      const $externalLinkIcon = $("<i>")
        .addClass("fa fa-external-link")
        .attr("aria-hidden", "true");

      const $locationRating = $("<p>")
        .addClass("card-text locationRating")
        .text(" User Rating: " + userRating + " / 5");

      $locationContact.prepend($phoneIcon);

      $websiteLink.append($externalLinkIcon);

      $locationContact.append($websiteLink);

      $cardBodyDiv
        .append($locationName)
        .append($locationAddress)
        .append($locationContact)
        .append($locationRating);

      $rowDiv.append($imgDiv).append($cardBodyDiv);

      $outerDiv.append($rowDiv);

      $imgDiv.append($img);

      $outerDiv.on("click", function () {
        map.setCenter(place.geometry.location);
        const infowindow = new google.maps.InfoWindow({
          content: "You are here",
          position: place.geometry.location,
          pixelOffset: new google.maps.Size(0, -32),
        });
        infowindow.open(map);
        setTimeout(function () {
          infowindow.close();
        }, 2000);
      });

      $(".placeContainer").append($outerDiv);
    }
  });

  // const tr = document.createElement("tr");
  // const iconTd = document.createElement("td");
  // const nameTd = document.createElement("td");
  // const icon = document.createElement("img");

  // icon.src = markerIcon;
  // icon.setAttribute("class", "placeIcon");

  // nameTd.textContent = place.name;

  // iconTd.appendChild(icon);
  // tr.appendChild(iconTd);
  // tr.appendChild(nameTd);
  // results.appendChild(tr);

  // tr.addEventListener("click", () => {
  //   map.setCenter(place.geometry.location);
  // });

  // Listens for click on marker
  marker.addListener("click", function () {
    // Hide the previous active marker
    if (activeMarker) {
      activeMarker.infoWindow.close();
      activeMarker.setAnimation(null);
    }

    // Set this marker as active
    activeMarker = marker;

    // Create info window content
    let content =
      "<strong>" +
      place.name +
      "</strong><br/>" +
      place.vicinity +
      "<br/>" +
      '<a href="https://www.google.com/maps/place/?q=place_id:' +
      place.place_id +
      '" target="_blank">View on Google Maps</a><br/>';

    if (place.photos && place.photos.length > 0) {
      const photoUrl = place.photos[0].getUrl({
        maxWidth: 150,
        maxHeight: 150,
      });
      content += '<img src="' + photoUrl + '"/><br/>';
    } else {
      content += "<em>No image available</em><br/>"; //TODO: add an image for no image result
    }

    // Creates info window and sets the content
    let infoWindow = new google.maps.InfoWindow({
      content: content,
    });
    marker.infoWindow = infoWindow;

    // Opens the info window
    infoWindow.open(map, marker);
  });

  markers.push(marker);
}

let markers = [];

// function clearResults() {
//   const results = document.getElementById("results");

//   while (results.childNodes[0]) {
//     results.removeChild(results.childNodes[0]);
//   }
// }

function clearResults() {
  const results = document.getElementById("cardList");
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

function initialize() {
  initMap();
}
