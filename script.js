// Fungsi untuk mencari lagu berdasarkan query
function searchTracks() {
    const query = document.getElementById('searchInput').value.trim();
    if (query === '') {
        alert('Tolong Masukan Judul Yang Ingin Dicari...');
        return;
    }

    $('#waitModal').modal('show');

    fetch(`https://api.betabotz.eu.org/api/search/spotify?query=${query}&apikey=kazamibot`)
        .then(response => response.json())
        .then(data => {
            const musicGallery = document.getElementById('musicGallery');
            musicGallery.innerHTML = '';

            if (!data.status || !data.result || data.result.data.length === 0) {
                musicGallery.innerHTML = '<p class="text-center text-gray-600">Tidak ada hasil ditemukan.</p>';
                $('#waitModal').modal('hide');
                return;
            }

            data.result.data.forEach(track => {
                const card = `
                    <div class="bg-blue-900 rounded-lg overflow-hidden shadow-md mb-4">
                        <img src="${track.preview ? track.preview : 'path/to/default/image.jpg'}" alt="${track.title}" class="w-full h-40 object-cover rounded-t-lg">
                        <div class="p-4">
                            <h2 class="text-lg font-semibold text-white text-center">${track.title}</h2>
                            <p class="text-sm text-gray-400 text-center">Durasi: ${track.duration} | Popularitas: ${track.popularity}</p>
                            <button onclick="showTrackInfo('${track.url}')" class="mx-auto my-auto bg-blue-500 hover:bg-green-600 text-center text-white font-bold py-2 px-4 rounded mt-2 flex"><i class="fa fa-play"></i></button>
                        </div>
                    </div>
                `;
                musicGallery.innerHTML += card;
            });

            $('#waitModal').modal('hide');
        })
        .catch(error => {
            console.error('Error fetching tracks:', error);
            alert('Gagal mengambil lagu. Silakan coba lagi nanti.');
            $('#waitModal').modal('hide');
        });
}

// Fungsi untuk menampilkan informasi lagu
function showTrackInfo(trackUrl) {
    $('#waitModal').modal('show');

    fetch(`https://spotifyapi.caliphdev.com/api/info/track?url=${trackUrl}`)
        .then(response => response.json())
        .then(data => {
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');

            modalTitle.textContent = data.title;
            modalContent.innerHTML = `
                <p class="text-center"><strong>Spotify Ivan<strong></p>
                <img src="${data.thumbnail}" alt="${data.title}" class="w-100 rounded">
                <p><strong>Artist:</strong> ${data.artist}</p>
                <p><strong>Album:</strong> ${data.album}</p>
                <button id="favoriteButton" onclick="toggleFavorite('${trackUrl}')" class="btn btn-primary">${isTrackInFavorites(trackUrl) ? '<i class="fa fa-trash"></i> Hapus Dari Favorit' : '<i class="fa fa-star"></i> Tambah Ke Favorit'}</button>
                <audio controls class="mx-auto mt-4">
                    <source src="https://spotifyapi.caliphdev.com/api/download/track?url=${trackUrl}" type="audio/mp3">
                    Your browser does not support the audio element.
                </audio>
            `;

            // Menambahkan kelas modal-dialog-scrollable agar konten modal dapat digulir jika terlalu panjang
            $('#trackModal .modal-dialog').addClass('modal-dialog-centered modal-dialog-scrollable');
            $('#trackModal').modal('show');
        })
        .catch(error => {
            console.error('Error fetching track info:', error);
            alert('Gagal mengambil informasi lagu. Silakan coba lagi nanti.');
            $('#waitModal').modal('hide');
        });
}

// Fungsi untuk menutup modal
function closeModal() {
    $('#trackModal').modal('hide');
}

// Event listener untuk mencari lagu saat tombol Enter ditekan pada input pencarian
document.getElementById("searchInput").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchTracks();
    }
});

// Fungsi untuk memeriksa apakah suatu lagu ada di daftar favorit
function isTrackInFavorites(trackUrl) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(trackUrl);
}

// Fungsi untuk menambah atau menghapus lagu dari daftar favorit
function toggleFavorite(trackUrl) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites.includes(trackUrl)) {
        // Hapus lagu dari daftar favorit jika sudah ada
        favorites = favorites.filter(url => url !== trackUrl);
    } else {
        // Tambahkan lagu ke daftar favorit jika belum ada
        favorites.push(trackUrl);
    }

    // Simpan daftar favorit ke localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Perbarui teks tombol favorit
    const favoriteButton = document.getElementById('favoriteButton');
    favoriteButton.innerHTML = isTrackInFavorites(trackUrl) 
        ? '<i class="fa fa-trash"></i> Hapus Dari Favorit' 
        : '<i class="fa fa-star"></i> Tambah Ke Favorit';

    // Perbarui daftar favorit
    loadFavorites();
}

// Fungsi untuk memuat daftar favorit saat halaman dimuat
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesListItems = document.getElementById('favoritesListItems');
    favoritesListItems.innerHTML = '';

    favorites.forEach(trackUrl => {
        fetch(`https://spotifyapi.caliphdev.com/api/info/track?url=${trackUrl}`)
            .then(response => response.json())
            .then(data => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${data.title}</span>
                        <div>
                            <button onclick="showTrackInfo('${trackUrl}')" class="btn btn-primary me-2"><i class="fa fa-play"></i></button>
                            <button onclick="toggleFavorite('${trackUrl}')" class="btn btn-danger"><i class="fa fa-trash"></i></button>
                        </div>
                    </div>
                `;
                favoritesListItems.appendChild(listItem);
            })
            .catch(error => console.error('Error fetching track info for favorites:', error));
    });
}

// Memuat daftar favorit saat halaman dimuat
document.addEventListener('DOMContentLoaded', function () {
    loadFavorites();
});
