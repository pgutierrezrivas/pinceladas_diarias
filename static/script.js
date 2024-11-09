document.addEventListener('DOMContentLoaded', function (event) {
    // url de la api de art institute of chicago con imagenes de dominio publico
    const apiUrl = 'https://api.artic.edu/api/v1/artworks?limit=100&page=1&fields=id,title,style_id,classification_id,image_id,date_display,artist_title';
    // obtengo la fecha actual y calculo el dia del año
    const today = new Date();
    const dayOfYear = getDayOfYear(today);

    // funcion para obtener la obra de arte para hoy
    async function fetchArtworkForToday() {
        try {
            // verifico si ya tenemos una obra guardada en localStorage
            const storedArtwork = localStorage.getItem('artwork_' + dayOfYear);
            if (storedArtwork) {
                // si ya hay una obra almacenada para hoy, la muestro
                const artwork = JSON.parse(storedArtwork);
                displayArtwork(artwork);
            } else {
                // si no, obtengo una nueva obra desde la api
                const response = await fetch(`${apiUrl}?offset=${dayOfYear}`);
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de la API');
                }

                const data = await response.json();
                // filtro solo las obras de estilo 'Impressionism'
                const artwork = data.data.find(item => item.classification_id === "TM-9");

                if (artwork) {
                    // guardo la obra de arte obtenida en localStorage
                    localStorage.setItem('artwork_' + dayOfYear, JSON.stringify(artwork));
                    // muestro la obra de arte
                    displayArtwork(artwork);
                } else {
                    alert('No se encontró una pintura para hoy.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al cargar la obra de arte.');
        }
    }
    // funcion para mostrar la obra de arte en la pagina
    function displayArtwork(artwork) {

        const imageUrl = document.getElementById('art-image');
        imageUrl.src = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`; // Formato estándar de la imagen;

        const title = document.getElementById('art-title');
        title.textContent = artwork.title;

        const date = document.getElementById('art-date');
        date.textContent = `Fecha ${artwork.date_display || 'No disponible'}`;

        const artist = document.getElementById('art-artist');
        artist.textContent = `Artista ${artwork.artist_title || 'No disponible'}`;

        const dayArt = document.getElementById('day-art');
        dayArt.textContent = `Día ${dayOfYear} del año ${today.getFullYear()}`;
    }
    // cargo la obra de arte cuando la pagina cargue
    window.onload = fetchArtworkForToday;
});

// funcion para obtener el numero del dia en el año (1-365) sacado de https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
function getDayOfYear(date) {
    return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0)) / 864e5);
}