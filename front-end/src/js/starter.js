const enableAccessibility = () => {
    const body = document.getElementsByTagName('body');
    window.addEventListener('keyup', (event) => {
        if (event.key === 'Tab') {
            body[0].classList.add('accessibility');
        }
    })
}
enableAccessibility();

const disableAccessibility = () => {
    const body = document.getElementsByTagName('body');
    window.addEventListener('click', () => {
        if (body[0].classList.contains('accessibility')) {
            body[0].classList.remove('accessibility');
        }
    })
}
disableAccessibility();