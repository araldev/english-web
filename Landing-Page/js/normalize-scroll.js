(function() {
    document.addEventListener('focusin', e => {
        if(window.innerWidth <= 768) {
            e.target.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    })
})();