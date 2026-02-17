const mangaList = [
    { title: "Blue Lock", img: "https://www.japangoodz.com/cdn/shop/files/IMG-1609.png?v=1750753218", url: "1hcGBwfdgJchkPlZMX55YF52aZRNdbXW9" },
    { title: "Demon Slayer", img: "https://static0.cbrimages.com/wordpress/wp-content/uploads/2024/08/demon-slayer-manga-volume-10-cover.jpg?q=70&fit=crop&w=750&dpr=1", url: "1mmBVdj-oKIC0aSdOcMcEnQ129-rKimKo" },
    { title: "Solo Leveling", img: "https://m.media-amazon.com/images/I/816hywlmu-L._AC_UF1000,1000_QL80_.jpg", url: "12tApujIKnQjaSlTRchrO0AZ8WhvhaNtl" },
    { title: "Attack on Titan", img: "https://m.media-amazon.com/images/I/A12whBe4noS._AC_UF1000,1000_QL80_.jpg", url: "1B46EboOes_-kq6jvdL1KSFAhrFMNk4Lj" },
    { title: "Death Note", img: "https://m.media-amazon.com/images/I/91mgtWmsepL._AC_UF1000,1000_QL80_.jpg", url: "1LNhG5Hjk4p9eJqvt0ooEpyAqnQRzJwYE" },
    { title: "Spy x Family", img: "https://m.media-amazon.com/images/I/71vMGRog+iL._AC_UF1000,1000_QL80_.jpg", url: "1GZKLsvSvgvHfM3CXg4DrCh4d0tGb0NLX" },
    { title: "Chainsaw Man", img: "https://m.media-amazon.com/images/I/81mXTl47LkL._AC_UF1000,1000_QL80_.jpg", url: "16KZIqJMkvzHeX8TsP_tOoLHSoqJwuWYf" },
    { title: "Pokémon", img: "https://m.media-amazon.com/images/I/719jQ7Z9bkL._AC_UF1000,1000_QL80_.jpg", url: "1DiPmxSEnK8mffjlJv-Mrka-Pg_qw5Zlj" },
    { title: "Legend of Zelda", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAuQIVKboATWYZmys6lhh4LgI4vZ8h7Zeeaw&s", url: "1TZ6z_ePBI2zt12Kqv0I2AYegGR6LjOrp" },
    { title: "Dragon Ball Z", img: "https://m.media-amazon.com/images/I/81-1jqVHePL._AC_UF1000,1000_QL80_.jpg", url: "1iSzHqkCiW5S44-_97x_6x_pTTMJrPrMH" },
    { title: "Naruto", img: "https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg", url: "1dHK5v5NZNiDvlQ9VK06AAPFNngnkkQCZ" },
    { title: "Berserk", img: "https://covers1.booksamillion.com/covers/bam/1/59/307/021/1593070217.jpg", url: "14Ri_EP2Q6HxWJQbU97ZEAjSc9MfTmKI3" },
    { title: "Sakamoto Days", img: "https://covers3.booksamillion.com/covers/bam/1/97/475/900/1974759008.jpg", url: "19DUxPkVk-4ixzNcLMIMjiQS5Zs6aCm7T" },
    { title: "Kingdom Hearts", img: "https://prodimage.images-bn.com/pimages/9781098253332_p0_v1_s600x595.jpg", url: "1IMqZo3XL_Go8PYa8i5iMH-3w5kEE-fTC" },
    { title: "Dr. Stone", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7EtX9F0IZunRCMwmd8ieeJIvDGyWxNpWv6g&s", url: "1uiqdQByTMfGeeQV8ut3o0BYuZu52CR7i" },
    { title: "Darling in the Franxx", img: "https://m.media-amazon.com/images/I/81ecxwQEHLL._AC_UF1000,1000_QL80_.jpg", url: "12P8fxgEN_fJlbJ4z_X6lorJUud7Qc0jS" },
    { title: "My Hero Academia", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmCe-6YScykM9fYzfI9iF4aaaYH8_JykU1Ww&s", url: "1Ty8TRLsEhVwDR0mMXe9bvZw2Mjgqbfr7" },
    { title: "Fullmetal Alchemist", img: "https://m.media-amazon.com/images/I/819gbwpjLcL._AC_UF1000,1000_QL80_.jpg", url: "1OqoLf9E0z6e2MRD2g3UNKP3hE9puC4ts" },
    { title: "Dandadan", img: "https://m.media-amazon.com/images/I/81kHWcb7n4L._AC_UF1000,1000_QL80_.jpg", url: "1u-a-NGgGUHD-h5RBtVkYnp8TwJosaJIe" },
    { title: "Promised Neverland", img: "https://m.media-amazon.com/images/I/81GIb6GMhRL._AC_UF1000,1000_QL80_.jpg", url: "1FhcZTDf0G1Fy6RlpcrsrSC-Pg63UZOqq" },
    { title: "Sailor Moon", img: "https://m.media-amazon.com/images/I/713hlX3hgRL._AC_UF1000,1000_QL80_.jpg", url: "1zZ9tlSypaIBKwM-1H9DjZA-P9Vyh6P-1" },
    { title: "Bleach", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsdBxpfQ_gDs9x9FnVq_3ThyWZaFdLJPrxOg&s", url: "1wvJR_lTZCJ_b9QId26AW0X6aCfBMBQlB" }
];

const grid = document.getElementById('mangaGrid');

function initLibrary() {
    mangaList.forEach(m => {
        const item = `
            <a href="https://drive.google.com/drive/u/0/folders/${m.url}" target="_blank" class="book-3d-container">
                <div class="book-cover-container">
                    <div class="book-face book-front">
                        <img src="${m.img}" class="w-full h-full object-cover" alt="${m.title}">
                    </div>
                    <div class="book-face book-spine"></div>
                </div>
                <span class="manga-title">${m.title}</span>
            </a>
        `;
        grid.insertAdjacentHTML('beforeend', item);
    });
}

// Start the script
initLibrary();