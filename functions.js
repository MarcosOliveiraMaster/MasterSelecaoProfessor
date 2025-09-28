const disciplinasSelect = document.getElementById("disciplinas");
const disciplinasText = document.getElementById("disciplinasText");

// Ao clicar no campo de texto, abre a lista suspensa
disciplinasText.addEventListener("click", () => {
    disciplinasSelect.style.display = "block";
});

// Atualiza o campo de texto sempre que mudar a seleção
disciplinasSelect.addEventListener("change", () => {
    const selecionadas = Array.from(disciplinasSelect.selectedOptions).map(opt => opt.value);
    disciplinasText.value = selecionadas.join(", ");
    disciplinasSelect.style.display = "none"; // Fecha a lista após a seleção
});
