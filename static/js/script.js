document.addEventListener('DOMContentLoaded', () => {

        // GeoJSON data for the LineString
        let geojsonData = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    //[mStart.getLngLat().lng, mStart.getLngLat().lat],
                    [8.967883488168525, 44.40761521301954],
                    [8.968484302987605, 44.4072013305811], 
                    [8.969042202463015, 44.407875804162956],
                    [8.969557186593761, 44.407538568344535],
                    [8.970072170724563, 44.407983106061494], 
                    [8.970608612527656, 44.40853494128626],
                    [8.969685932625708, 44.4090867713040]//,
                    //[mEnd.getLatLng().lng, mEnd.getLatLng().lat]
                ]
            }
        };


        // Define the map syle (OpenStreetMap raster tile
        const styleMap = {
            "version": 8,
              "sources": {
              "osm": {
                      "type": "raster",
                      "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
                      "tileSize": 256,
                "attribution": "&copy; OpenStreetMap Contributors",
                "maxzoom": 19
              }
            },
            "layers": [
              {
                "id": "osm",
                "type": "raster",
                "source": "osm" // This must match the source key above
              }
            ]
          };
        //marker.remove();
        let mStart = new maplibregl.Marker();
        let mEnd = new maplibregl.Marker();
        let startSelected = false;
        let endSelected = false;
        const map = new maplibregl.Map({
            container: 'map', // container id
            style: styleMap,
            //center: [8.969986340036485, 44.40766886423164], // starting sition
            center: [16.608594884381546,40.667121796976886,], // starting sition
            zoom: 17 // starting zoom
        });

        document.getElementById('ombravalue').hidden = true;

           // Handle send button click
    document.getElementById('sendButton').addEventListener('click', () => {
        document.getElementById('ombravalue').hidden = true;
        const textbox1Value = document.getElementById('textbox1').value;
        const textbox2Value = document.getElementById('textbox2').value;
        const listboxValue = document.getElementById('listbox').value;

        let attr = 'length';
        console.log('Text Box 1:', textbox1Value);
        console.log('Text Box 2:', textbox2Value);
        console.log('List Box:', listboxValue);
        if (listboxValue === 'option1') 
            attr = 'length';
        else if (listboxValue === 'option2')
            attr = 'shadow';


        //else if (listboxValue === 'option3')    
        //    attr = 'slope';    
        //fetch('http://labopt.iasi.cnr.it:4210/v1/spt?coordinates='+ mStart.getLngLat().lat   +  ','+ mStart.getLngLat().lng +','+ mEnd.getLngLat().lat   +  ','+ mEnd.getLngLat().lng +'&attr=length')
        //fetch('http://localhost:5000/v1/spt?coordinates='+ mStart.getLngLat().lat   +  ','+ mStart.getLngLat().lng +','+ mEnd.getLngLat().lat   +  ','+ mEnd.getLngLat().lng +'&attr=length')
        fetch('http://127.0.0.1:5000/v1/spt?coordinates='+ mStart.getLngLat().lat   +  ','+ mStart.getLngLat().lng +','+ mEnd.getLngLat().lat   +  ','+ mEnd.getLngLat().lng +'&attr='+ attr)
        .then(response => response.json())
        .then(data => {
            // Convert geometry to GeoJSON MultiLineString
            console.log('GeoJSON data:', data["Attr value"]);
            const geojson = {
                "type": "Feature",
                "geometry": {
                    "type": "MultiLineString",
                    "coordinates": data.geometry
                },
                "properties": {}
            };

            if (map.getSource('line')) {
                map.getSource('line').setData(geojson);
            } else {
                map.addSource('line', {
                    'type': 'geojson',
                    'data': geojson
                });

                map.addLayer({
                    'id': 'lineLayer',
                    'type': 'line',
                    'source': 'line',
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': '#888',
                        'line-width': 8
                    }
                });
            }
            if(attr !== 'length')
                document.getElementById('ombravalue').hidden = false;
                document.getElementById("ombravalue").value = JSON.stringify(data["Attr value"]);
        })
        .catch(error => console.error('Error fetching GeoJSON:', error));


    });

    map.on('click', (e) => {
        const coordinates = e.lngLat;
        console.log('Map clicked at:', coordinates);
       // document.getElementById('info').innerHTML =
            // e.point is the x, y coordinates of the mousemove event relative
            // to the top-left corner of the map
        //    `${JSON.stringify(e.point)
       //     }<br />${
                // e.lngLat is the longitude, latitude geographical position of the event
        //        JSON.stringify(e.lngLat.wrap())}`;
        if (!startSelected){
            mStart = new maplibregl.Marker()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map);
            startSelected = true;
            document.getElementById('textbox1').value = JSON.stringify(e.lngLat.wrap());
            //geojsonData["geometry"]["coordinates"][0]=[e.lngLat.lng, e.lngLat.lat];
        } else
        if (!endSelected){
            mEnd = new maplibregl.Marker()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map);
            endSelected = true;
            document.getElementById('textbox2').value = JSON.stringify(e.lngLat.wrap());
            //geojsonData["geometry"]["coordinates"][6]=[e.lngLat.lng, e.lngLat.lat];
        }
    });
});




