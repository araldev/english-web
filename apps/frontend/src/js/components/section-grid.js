// Ajusta al mismo width que los demás el del grid 
// de manera dinámica del desbordado en otra row.
(function() {
    const firstElGrid = document.querySelector('.example-row');
    const lastElGrid = document.querySelector('.last-row');

    if(!lastElGrid) return;

    lastElGrid.style.width = `${firstElGrid.offsetWidth}px`;

    window.addEventListener('resize', (e) => {
        return lastElGrid.style.width = `${firstElGrid.offsetWidth}px`;
    })
})();