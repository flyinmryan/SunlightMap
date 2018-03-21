var map, marker, latitutde, longitude;
var satelliteImages = [];

function satelliteImage(coords, url, id) {
    this.coords = coords;
    this.url = url;
    this.id = id;
}

function initMap() {
    
    var SacRiverTrainLocation = { lat: 38.596486, lng: -121.550476 };
    var centerOfUsa = { lat: 39.8097, lng: -98.5556 };
    var centerOfFlatMap = { lat: 15.804205, lng: 16.392969 };
    var cities = [
        { name: "Sydney", lat: -33.8688, long: 151.2093 },
        { name: "Sacramento", lat: 38.5816, long: -121.4944 },
        { name: "New York", lat: 40.7128, long: -74.0060 },
        { name: "Berlin", lat: 52.5200, long: 13.4050 },
        { name: "Cape Town", lat: -33.9249, long: 18.4241 },
        { name: "Dallas", lat: 32.7767, long: -96.7970 },
        { name: "Dallas", lat: 32.7767, long: -96.7970 },
        { name: "Anchorage", lat: 61.2181, long: -149.9003 },
        { name: "Buenos Aires", lat: -34.6037, long: -58.3816 },
        { name: "Madrid", lat: 40.4168, long: -3.7038 },
        { name: "New Delhi", lat: 28.6139, long: 77.2090 },
        { name: "Reyadh", lat: 24.7136, long: 46.6753 },
        { name: "Tiksi", lat: 71.6375, long: 128.8645 },
        { name: "Niamey", lat: 13.5116, long: 2.1254 },
        { name: "Astana", lat: 51.1605, long: 71.4704 },
        { name: "Moscow", lat: 55.7558, long: 37.6173 },
        { name: "Reykjavik", lat: 64.1265, long: -21.8174 },
        { name: "Bogota", lat: 4.7110, long: -74.0721 },
        { name: "Tokyo", lat: 35.6895, long: 139.6917 },
        { name: "Fortaleza", lat: -3.7319, long: -38.5267 },
        { name: "Singapore", lat: 1.3521, long: 103.8198 },
        { name: "Hay River", lat: 60.8162, long: -115.7854 },
        { name: "Pangnirtung", lat: 66.1466, long: -65.7012 },
        { name: "Beijing", lat: 39.9042, long: 116.4074 },
        { name: "Honolulu", lat: 21.3069, long: -157.8583 }
    ]

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2.6,
        center: centerOfFlatMap,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        disableDefaultUI: true
    });

    map.addListener('click', function(event) {
        latitutde = event.latLng.lat();
        longitude = event.latLng.lng();
        var apiUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + latitutde + "&lon=" + longitude + "&units=imperial&APPID=ca6715e3bc0a5934ba9c218476a1374f";
        if (marker != null) marker.setMap(null);

        $.get({
            url: apiUrl,
            success: function(location){
                marker = new google.maps.Marker({
                    position: { lat: latitutde, lng: longitude },
                    map: map
                });
                var upperLimit = longitude + 14;
                var lowerLimit = longitude - 14;
                var imgTag = "";
                satelliteImages.forEach(function(img){
                    if (img.coords.lon > lowerLimit && img.coords.lon < upperLimit) {
                        imgTag = "<a href='" + $("#" + img.id + "img").attr("src") + "' data-lightbox='image'>" + $("#" + img.id).html() + "</a>";
                    }
                })
                var infowindow = new google.maps.InfoWindow({
                    pixelOffset: new google.maps.Size(0, 220),
                    content: "<h1>" + location.name + ", " + location.sys.country + "</h1>" +
                                "<img src='http://www.openweathermap.org/img/w/" + location.weather[0].icon + ".png' />" +
                                "<p>" + location.main.temp + "&deg;</p>" +
                                // "<p>" + location.weather[0].description + "</p>" +
                                imgTag
                });
                infowindow.open(map, marker);
            },
            error: function(error){
                console.log(error);
            }
        })
    });

    $.get({
        url: "https://epic.gsfc.nasa.gov/api/natural?api_key=ICpor4lpkRKy36vouzXvpEO6ODsx6ZqoMYkF5CXl",
        success: function(images){
            images.forEach(function(img){
                var dateTime = img.date.split(" ");
                var date = dateTime[0].split("-");
                var url = "https://epic.gsfc.nasa.gov/archive/natural/" + date[0] + "/" + date[1] + "/" + date[2] + "/png/" + img.image + ".png";
                var coords = img.centroid_coordinates;
                var id = img.identifier;
                satelliteImages.push(new satelliteImage(coords, url, id));
                $("#images").append($("<div>", { id: id }).append(
                    $("<img>", { src: url, class: "sat-img" })));
            })
        },
        error: function(data){
            console.log(data);
        }
    })

    cities.forEach(function(city){
        $.get({
            url: "http://api.openweathermap.org/data/2.5/weather?lat=" + city.lat + "&lon=" + city.long + "&units=imperial&APPID=ca6715e3bc0a5934ba9c218476a1374f",
            success: function(location){
                // console.log(location);
                marker = new google.maps.Marker({
                    position: { lat: location.coord.lat-3, lng: location.coord.lon },
                    map: map,
                    icon: "http://www.openweathermap.org/img/w/" + location.weather[0].icon + ".png",
                    title: city.name + " " + location.main.temp 
                });
            },
            error: function(error){
                console.log(error);
            }
        })
    })

    nite.init(map);
}

setInterval(function() { nite.refresh() }, 30000);

var nite = {
    map: null,
    date: null,
    sun_position: null,
    earth_radius_meters: 6371008,
    marker_twilight_civil: null,
    marker_twilight_nautical: null,
    marker_twilight_astronomical: null,
    marker_night: null,

    init: function (map) {
        if (typeof google === 'undefined'
            || typeof google.maps === 'undefined') throw "Nite Overlay: no google.maps detected";

        this.map = map;
        this.sun_position = this.calculatePositionOfSun();

        this.marker_twilight_civil = new google.maps.Circle({
            map: this.map,
            center: this.getShadowPosition(),
            radius: this.getShadowRadiusFromAngle(0.566666),
            fillColor: "#000",
            fillOpacity: 0.6,
            strokeOpacity: 0,
            clickable: false,
            editable: false
        });
        this.marker_twilight_nautical = new google.maps.Circle({
            map: this.map,
            center: this.getShadowPosition(),
            radius: this.getShadowRadiusFromAngle(6),
            fillColor: "#000",
            fillOpacity: 0.3,
            strokeOpacity: 0,
            clickable: false,
            editable: false
        });
        this.marker_twilight_astronomical = new google.maps.Circle({
            map: this.map,
            center: this.getShadowPosition(),
            radius: this.getShadowRadiusFromAngle(12),
            fillColor: "#000",
            fillOpacity: 0.3,
            strokeOpacity: 0,
            clickable: false,
            editable: false
        });
        this.marker_night = new google.maps.Circle({
            map: this.map,
            center: this.getShadowPosition(),
            radius: this.getShadowRadiusFromAngle(18),
            fillColor: "#000",
            fillOpacity: 0.0,
            strokeOpacity: 0,
            clickable: false,
            editable: false
        });
    },
    getShadowRadiusFromAngle: function (angle) {
        var shadow_radius = this.earth_radius_meters * Math.PI * 0.5;
        var twilight_dist = ((this.earth_radius_meters * 2 * Math.PI) / 360) * angle;
        return shadow_radius - twilight_dist;
    },
    getSunPosition: function () {
        return this.sun_position;
    },
    getShadowPosition: function () {
        return (this.sun_position) ? new google.maps.LatLng(-this.sun_position.lat(), this.sun_position.lng() + 180) : null;
    },
    refresh: function () {
        if (!this.isVisible()) return;
        this.sun_position = this.calculatePositionOfSun(this.date);
        var shadow_position = this.getShadowPosition();
        this.marker_twilight_civil.setCenter(shadow_position);
        this.marker_twilight_nautical.setCenter(shadow_position);
        this.marker_twilight_astronomical.setCenter(shadow_position);
        this.marker_night.setCenter(shadow_position);
    },
    jday: function (date) {
        return (date.getTime() / 86400000.0) + 2440587.5;
    },
    calculatePositionOfSun: function (date) {
        date = (date instanceof Date) ? date : new Date();

        var rad = 0.017453292519943295;

        // based on NOAA solar calculations
        var ms_past_midnight = ((date.getUTCHours() * 60 + date.getUTCMinutes()) * 60 + date.getUTCSeconds()) * 1000 + date.getUTCMilliseconds();
        var jc = (this.jday(date) - 2451545) / 36525;
        var mean_long_sun = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
        var mean_anom_sun = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
        var sun_eq = Math.sin(rad * mean_anom_sun) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) + Math.sin(rad * 2 * mean_anom_sun) * (0.019993 - 0.000101 * jc) + Math.sin(rad * 3 * mean_anom_sun) * 0.000289;
        var sun_true_long = mean_long_sun + sun_eq;
        var sun_app_long = sun_true_long - 0.00569 - 0.00478 * Math.sin(rad * 125.04 - 1934.136 * jc);
        var mean_obliq_ecliptic = 23 + (26 + ((21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813)))) / 60) / 60;
        var obliq_corr = mean_obliq_ecliptic + 0.00256 * Math.cos(rad * 125.04 - 1934.136 * jc);

        var lat = Math.asin(Math.sin(rad * obliq_corr) * Math.sin(rad * sun_app_long)) / rad;

        var eccent = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
        var y = Math.tan(rad * (obliq_corr / 2)) * Math.tan(rad * (obliq_corr / 2));
        var rq_of_time = 4 * ((y * Math.sin(2 * rad * mean_long_sun) - 2 * eccent * Math.sin(rad * mean_anom_sun) + 4 * eccent * y * Math.sin(rad * mean_anom_sun) * Math.cos(2 * rad * mean_long_sun) - 0.5 * y * y * Math.sin(4 * rad * mean_long_sun) - 1.25 * eccent * eccent * Math.sin(2 * rad * mean_anom_sun)) / rad);
        var true_solar_time_in_deg = ((ms_past_midnight + rq_of_time * 60000) % 86400000) / 240000;

        var lng = -((true_solar_time_in_deg < 0) ? true_solar_time_in_deg + 180 : true_solar_time_in_deg - 180);

        return new google.maps.LatLng(lat, lng);
    },
    setDate: function (date) {
        this.date = date;
        this.refresh();
    },
    setMap: function (map) {
        this.map = map;
        this.marker_twilight_civil.setMap(this.map);
        this.marker_twilight_nautical.setMap(this.map);
        this.marker_twilight_astronomical.setMap(this.map);
        this.marker_night.setMap(this.map);
    },
    show: function () {
        this.marker_twilight_civil.setVisible(true);
        this.marker_twilight_nautical.setVisible(true);
        this.marker_twilight_astronomical.setVisible(true);
        this.marker_night.setVisible(true);
        this.refresh();
    },
    hide: function () {
        this.marker_twilight_civil.setVisible(false);
        this.marker_twilight_nautical.setVisible(false);
        this.marker_twilight_astronomical.setVisible(false);
        this.marker_night.setVisible(false);
    },
    isVisible: function () {
        return this.marker_night.getVisible();
    }
}
