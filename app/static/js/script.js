let mStart = new maplibregl.Marker();
let mEnd = new maplibregl.Marker();
let startSelected = false;
let endSelected = false;
let map;
let listboxValue;

// Funzione per resettare lo stato del form
function resetFormState() {
  document.getElementById('resetButton').disabled = true;

  document.getElementById('group-from').classList.add('hidden');
  document.getElementById('group-to').classList.add('hidden');
  document.getElementById('group-ombra').classList.add('hidden');


  // Reset campi
  document.getElementById('textbox1').value = '';
  document.getElementById('textbox2').value = '';
  document.getElementById('ombravalue').value = '0';
  document.getElementById('ombraperc').value = '0';
  document.getElementById('listbox').selectedIndex = 0;
  document.getElementById('lunghezzavalue').value = '0';
}

// Funzione per resettare lo stato della mappa
function resetMapState() {
  // Rimuovi marker
  if (mStart) {
    mStart.remove();
    mStart = null;
  }
  if (mEnd) {
    mEnd.remove();
    mEnd = null;
  }
  startSelected = false;
  endSelected = false;

  // Rimuovi percorso dalla mappa
  console.log('--- RESET ---');
  console.log('Line Layer esiste?', map.getLayer('lineLayer'));
  console.log('Line Source esiste?', map.getSource('line'));

  if (map.getLayer('lineLayer')) {
    console.log('Rimuovo layer...');
    map.removeLayer('lineLayer');
  } else {
    console.log('Layer non trovato, non rimosso.');
  }

  if (map.getSource('line')) {
    console.log('Rimuovo source...');
    map.removeSource('line');
  } else {
    console.log('Source non trovato, non rimosso.');
  }
}


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

        map = new maplibregl.Map({
            container: 'map', // container id
            style: styleMap,
            //center: [8.969986340036485, 44.40766886423164], // starting sition
            center: [16.608594884381546,40.667121796976886,], // starting sition
            zoom: 17 // starting zoom
        });
        
        //Controlla il tipo di richiesta (shortest path, shortest path with shadow, etc..)
        document.getElementById("listbox").addEventListener("change", function () {
            document.getElementById('lunghezzavalue').value = '0';
            document.getElementById('ombravalue').value = '0';
            document.getElementById('ombraperc').value = '0';
            listboxValue = document.getElementById('listbox').value;
            if (listboxValue != 'option1') {
                document.getElementById('group-ombra').classList.remove('hidden');
            }else{
                resetFormState()
            }
        });
    

    //Gestione del click sul pulsante "Send"
    document.getElementById('sendButton').addEventListener('click', () => {
        document.getElementById('resetButton').disabled = false;

        const textbox1Value = document.getElementById('textbox1').value;
        const textbox2Value = document.getElementById('textbox2').value;
        listboxValue = document.getElementById('listbox').value;

        let attr = 'length';
        console.log('Text Box 1:', textbox1Value);
        console.log('Text Box 2:', textbox2Value);
        console.log('List Box:', listboxValue);
        if (listboxValue === 'option1') 
            attr = 'length';
        else if (listboxValue === 'option2')
            attr = 'shadow_now';
        else if (listboxValue === 'option3')    
            attr = 'sh_081508'; 
        else if (listboxValue === 'option4')
            attr = 'sh_081510'; 
        else if (listboxValue === 'option5')
            attr = 'sh_081513';
        else if (listboxValue === 'option6')
            attr = 'sh_081517';

        //else if (listboxValue === 'option3')    
        //    attr = 'slope';    
        //fetch('http://labopt.iasi.cnr.it:4210/v1/spt?coordinates='+ mStart.getLngLat().lat   +  ','+ mStart.getLngLat().lng +','+ mEnd.getLngLat().lat   +  ','+ mEnd.getLngLat().lng +'&attr=length')
        //fetch('http://localhost:5000/v1/spt?coordinates='+ mStart.getLngLat().lat   +  ','+ mStart.getLngLat().lng +','+ mEnd.getLngLat().lat   +  ','+ mEnd.getLngLat().lng +'&attr=length')
        
        //Effettua la richiesta al server Flask per ottenere il percorso (l'algoritmo è sul server )
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

        const lunghezza = parseFloat(data["lengthm"]) || 0;
        document.getElementById("lunghezzavalue").value = parseInt(lunghezza);

        if (attr !== 'length') {
            const ombra = parseInt(data["Attr value"]) || 0;
            const perc = lunghezza > 0 ? ((ombra / lunghezza) * 100).toFixed(2) : 0;

            document.getElementById("ombravalue").value = ombra;
            document.getElementById("ombraperc").value = perc + "%";
            
            document.getElementById("group-ombra").classList.remove("hidden");
        }

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

document.getElementById('resetButton').addEventListener('click', () => {
  resetFormState();
  resetMapState();
});

document.getElementById("toggleInfoBtn").addEventListener("click", function () {
  const box = document.getElementById("infoBox");
  box.style.display = (box.style.display === "block") ? "none" : "block";
});


