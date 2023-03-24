// Initialize and add the map
const MARKER_PATH =
  "https://developers.google.com/maps/documentation/javascript/images/marker_green";

const history = document.querySelector("#history");
function loadLocalStorage() {
  const lastSearch = localStorage.getItem("lastSearch");
  if (lastSearch) {
    // $('#locationSearch').val(lastSearch);
    $("#lastSearch").text(lastSearch);
  }
}

history.appendChild(lastSearch);

loadLocalStorage();

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
    const lastSearch = places[0].formatted_address;
    localStorage.setItem("lastSearch", lastSearch);
    $("#lastSearch").text(lastSearch);
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
          // Clear any existing markers
          markers.forEach((marker) => {
            marker.setMap(null);
          });
          markers = [];

          // Creates a marker for each campground
          for (let i = 0; i < results.length; i++) {
            createMarker(results[i], map);

            // const placesList = document.getElementById("places");
            // const li = document.createElement("li");
            // li.textContent = places.name;
            // placesList.appendChild(li);
            // li.addEventListener("click", () => {
            //   map.setCenter(places[i].geometry.location);
            // });
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
let labelIndex = 0;

// const markerIcon = MARKER_PATH + labels[labelIndex++ % labels.length] + ".png";

function createMarker(place, map) {
  const markerIcon =
    MARKER_PATH + labels[labelIndex++ % labels.length] + ".png";
  let marker = new google.maps.Marker({
    map: map,
    // label: labels[labelIndex++ % labels.length], // add label to the markers
    animation: google.maps.Animation.DROP, // add animation to the markers
    position: place.geometry.location,
    icon: markerIcon,
  });
  const placesList = document.getElementById("places");
  const tr = document.createElement("tr");
  const iconTd = document.createElement("td");
  const nameTd = document.createElement("td");
  const icon = document.createElement("img");

  icon.src = markerIcon;
  icon.setAttribute("class", "placeIcon");

  nameTd.textContent = place.name;

  iconTd.appendChild(icon);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);
  // //stop now!
  // const li = document.createElement("li");
  // const icon = document.createElement("img");

  // icon.src = markerIcon;
  // icon.setAttribute("class", "placeIcon");

  // li.textContent = place.name;
  // placesList.appendChild(icon);
  // placesList.appendChild(li);
  tr.addEventListener("click", () => {
    map.setCenter(place.geometry.location);
  });

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

function initialize() {
  initMap();
}

// function addResults() {
//   const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
//   const markerIcon = MARKER_PATH + markerLetter + ".png";
//   const tableResult = $("<div>");

//   tableResult
//     .attr("backgroundColor", 'i % 2 === 0 ? "#a7c5ac" : "#FFFFFF"')
//     .on("click", function () {
//       google.maps.event.trigger(markers[i], "click");
//     });

//   const name = document.createTextNode(results.name);

//   tableResult.append(markerIcon);
//   tableResult.append(name);
//   result.append(tableResult);
// }
