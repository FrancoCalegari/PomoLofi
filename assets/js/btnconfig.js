const configPanel = document.querySelector('.subcontainerconfig');
const configBtn = document.getElementById('Configbtn');

configBtn.addEventListener('click', () => {
    const isVisible = configPanel.classList.contains('visible');
    if (isVisible) {
        configPanel.classList.add('hidden');
        configPanel.classList.remove('visible');
    } else {
        configPanel.classList.add('visible');
        configPanel.classList.remove('hidden');
    }
});

const closeConfigBtn = document.getElementById('closeConfigBtn');

closeConfigBtn.addEventListener('click', () => {
    configPanel.classList.add('hidden');
    configPanel.classList.remove('visible');
});
