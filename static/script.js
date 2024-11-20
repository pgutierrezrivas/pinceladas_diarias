document.addEventListener('DOMContentLoaded', function (event) {
    // url de la api de art institute of chicago con imagenes de dominio publico
    const apiUrl = 'https://api.artic.edu/api/v1/artworks?limit=100&page=1&fields=id,title,style_id,classification_id,image_id,date_display,artist_title';
    // obtengo la fecha actual y calculo el dia del año
    const today = new Date();
    const dayOfYear = getDayOfYear(today);

    // funcion para obtener la obra de arte para hoy
    async function fetchArtworkForToday() {
        try {
            // verifico si ya hay una obra para hoy
            const storedArtwork = localStorage.getItem('artwork_' + dayOfYear);
            if (storedArtwork) {
                displayArtwork(JSON.parse(storedArtwork));
                return;
            }

            // intento obtener obras unicas
            const usedIds = JSON.parse(localStorage.getItem('used_artwork_ids')) || [];
            let artwork = null;
            let offset = dayOfYear;

            // reintento si no encuentra obras validas
            while (!artwork) {
                const response = await fetch(`${apiUrl}&page=${Math.floor(offset / 100) + 1}`);
                if (!response.ok) throw new Error('Error al obtener los datos de la API.');

                const data = await response.json();

                // filtro las pinturas y descarto ids ya usados
                const paintings = data.data.filter(item => 
                    item.classification_id === "TM-9" && !usedIds.includes(item.id)
                );

                if (paintings.length > 0) {
                    artwork = paintings[0]; // tomo la primera obra valida
                    usedIds.push(artwork.id); // registro el id como usado
                } else {
                    // si no encuentra, aumenta el offset
                    offset += 1;
                    if (offset > 36500) throw new Error('No se encontraron obras únicas.');
                }
            }

            // guardo la obra para hoy y actualizo la lista de ids usados
            localStorage.setItem('artwork_' + dayOfYear, JSON.stringify(artwork));
            localStorage.setItem('used_artwork_ids', JSON.stringify(usedIds));

            displayArtwork(artwork);

        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al cargar la obra de arte.');
        }
    }
     // funcion para mostrar la obra en la pagina
    function displayArtwork(artwork) {
        const imageUrl = document.getElementById('art-image');
        imageUrl.src = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`;

        const title = document.getElementById('art-title');
        title.textContent = artwork.title;

        const date = document.getElementById('art-date');
        date.textContent = `Fecha: ${artwork.date_display || 'Desconocida'}`;

        const artist = document.getElementById('art-artist');
        artist.textContent = `Artista: ${artwork.artist_title || 'Desconocido'}`;

        const dayArt = document.getElementById('day-art');
        dayArt.textContent = `Día ${dayOfYear} del año ${today.getFullYear()}`;
    }

    // cargo la obra al cargar la pagina
    window.onload = fetchArtworkForToday;
});

// funcion para obtener el día del año
function getDayOfYear(date) {
    return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0)) / 864e5);
}