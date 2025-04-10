document.getElementById('nlButton').addEventListener('click', function() {
    setLanguage('nl');
});

document.getElementById('enButton').addEventListener('click', function() {
    setLanguage('en');
});

document.getElementById('selectedLang').addEventListener('click', function() {
    document.getElementById('toggleLang').classList.toggle('is-active');
});

function setLanguage(lang) {
    if (lang === 'en') {
        selectedLang.innerHTML = '<i class="fa-flag-uk">EN</i>';
        document.getElementById('nlButton').classList.remove('active');
        document.getElementById('enButton').classList.add('active');
    } else {
        selectedLang.innerHTML = '<i class="fa-flag-nl">NL</i>';
        document.getElementById('enButton').classList.remove('active');
        document.getElementById('nlButton').classList.add('active');
    }
    document.getElementById('toggleLang').classList.remove('is-active');
}
