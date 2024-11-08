document.addEventListener('DOMContentLoaded', function (event) {

    // url de la api de art institute of chicago con imagenes de dominio publico
    const apiUrl = 'https://api.artic.edu/api/v1/artworks';

    // funcion para obtener la obra de arte para hoy
    async function fetchArtworkForToday() {
        try {
            // obtengo la fecha actual y calcular el dia del año
            const today = new Date();
            const dayOfYear = getDayOfYear(today);

            // verifico si ya tenemos una obra guardada en localStorage
            const storedArtwork = localStorage.getItem('artwork_' + dayOfYear);
            if (storedArtwork) {
                // si ya hay una obra almacenada para hoy, la muestro
                const artwork = JSON.parse(storedArtwork);
                displayArtwork(artwork);
            } else {
                // si no, obtengo una nueva obra desde la api
                const response = await fetch(`${apiUrl}?limit=1&offset=${dayOfYear}`);
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de la API');
                }

                const data = await response.json();
                const artwork = data.data[0];

                // guardo la obra de arte obtenida en localStorage
                localStorage.setItem('artwork_' + dayOfYear, JSON.stringify(artwork));

                // muestro la obra de arte
                displayArtwork(artwork);
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
        date.textContent = `Fecha ${artwork.date_display}`;;

        const autor = document.getElementById('art-autor');
        autor.textContent = `Autor ${artwork.artist_title || 'No disponible'}`;
    }

    // cargo la obra de arte cuando la pagina cargue
    window.onload = fetchArtworkForToday;

});


// funcion para obtener el numero del dia en el año (1-365) sacado de https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
function getDayOfYear(date) {
    return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0)) / 864e5);
}