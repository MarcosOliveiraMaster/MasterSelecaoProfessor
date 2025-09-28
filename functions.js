const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownContent = document.getElementById("dropdownContent");
const checkboxes = dropdownContent.querySelectorAll("input[type='checkbox']");

dropdownBtn.addEventListener("click", () => {
  dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
});

// Atualiza o texto do botão com as opções selecionadas
checkboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    const selecionadas = Array.from(checkboxes)
                              .filter(i => i.checked)
                              .map(i => i.value);
    dropdownBtn.textContent = selecionadas.length > 0 ? selecionadas.join(", ") : "Selecione as disciplinas que você pode lecionar";
  });
});

// Fecha dropdown se clicar fora
document.addEventListener("click", function(event) {
  if (!event.target.closest(".dropdown")) {
    dropdownContent.style.display = "none";
  }
});