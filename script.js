// --- DOM ELEMENT SELECTION REGION ---
const gridContainer = document.getElementById("recipe-grid-container");
const navDropdown = document.getElementById("recipe-selector");
const overlay = document.getElementById("fullscreen-overlay");
const closeOverlayBtn = document.getElementById("close-overlay");

// --- APPLICATION INITIALIZATION SYSTEM ---
function initApp() {
    gridContainer.innerHTML = "";
    
    // Clear old options out of the dropdown to prevent duplicates on refresh
    navDropdown.innerHTML = '<option value="">-- Select a Dish --</option>';
    
    myRecipes.forEach(recipe => {
        // 1. Populates the navigation dropdown menu automatically
        const option = document.createElement("option");
        option.value = recipe.id;
        option.textContent = `${recipe.emoji} ${recipe.title}`;
        navDropdown.appendChild(option);

        // 2. Generates your "Fort Knox" grid card structure matching your exact CSS framework
        const cardWrapper = document.createElement("div");
        cardWrapper.className = "card-link";
        
        cardWrapper.innerHTML = `
            <section class="recipe-card">
                <h2>${recipe.emoji} ${recipe.title}</h2>
                <p>${recipe.subtitle}</p>
                
                <!-- Main Vault Grid Front Photo -->
                <div>
                    <img src="images/${recipe.image}" alt="${recipe.title}" class="recipe-photo">
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Prep Time</th>
                            <th>Cook Time</th>
                            <th>Servings</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${recipe.times.prep}</td>
                            <td>${recipe.times.cook}</td>
                            <td>${recipe.times.servings}</td>
                        </tr>
                    </tbody>
                </table>
                
                <table>
                    <thead>
                        <tr>
                            <th>Calories</th>
                            <th>Protein</th>
                            <th>Carbs</th>
                            <th>Fats</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${recipe.nutrition.calories} kcal</td>
                            <td>${recipe.nutrition.protein}g</td>
                            <td>${recipe.nutrition.carbs}g</td>
                            <td>${recipe.nutrition.fats}g</td>
                        </tr>
                    </tbody>
                </table>
                
                <p style="text-align:center; font-size:0.85rem; color:#d4af37; margin-top:15px; font-weight:bold;">
                    Click card to view details
                </p>
            </section>
        `;
        
        // Hooks up the click listener to trigger your premium full-screen takeover view
        cardWrapper.addEventListener("click", () => openDetailedView(recipe.id));
        gridContainer.appendChild(cardWrapper);
    });
}

// --- DYNAMIC RENDERING INTERFACE METHODS ---
function openDetailedView(recipeId) {
    const targetRecipe = myRecipes.find(r => r.id === recipeId);
    if (!targetRecipe) return;

    // Injects raw text parameters safely
    document.getElementById("overlay-title").textContent = `${targetRecipe.emoji} ${targetRecipe.title}`;
    document.getElementById("overlay-subtitle").textContent = targetRecipe.subtitle;

    // Dynamically sets the large photo inside your full-screen overlay view panel layout
    const oldOverlayImg = document.getElementById("overlay-photo");
    if (oldOverlayImg) {
        oldOverlayImg.src = `images/${targetRecipe.image}`;
        oldOverlayImg.alt = targetRecipe.title;
    } else {
        const imgDiv = document.createElement("div");
        imgDiv.style.textAlign = "center";
        imgDiv.style.marginBottom = "30px";
        imgDiv.innerHTML = `<img id="overlay-photo" src="images/${targetRecipe.image}" alt="${targetRecipe.title}" class="recipe-photo">`;
        
        // Sticks the photo framework right beneath your subtitle text element frame
        const subtitleEl = document.getElementById("overlay-subtitle");
        subtitleEl.parentNode.insertBefore(imgDiv, subtitleEl.nextSibling);
    }

    // Injects core structural metrics into table cells
    document.getElementById("table-prep").textContent = targetRecipe.times.prep;
    document.getElementById("table-cook").textContent = targetRecipe.times.cook;
    document.getElementById("table-servings").textContent = targetRecipe.times.servings;

    document.getElementById("table-calories").textContent = `${targetRecipe.nutrition.calories} kcal`;
    document.getElementById("table-protein").textContent = `${targetRecipe.nutrition.protein}g`;
    document.getElementById("table-carbs").textContent = `${targetRecipe.nutrition.carbs}g`;
    document.getElementById("table-fats").textContent = `${targetRecipe.nutrition.fats}g`;

    // Loops over Array elements to cleanly render bullet lists via String formatting
    const highlightsElement = document.getElementById("overlay-highlights");
    highlightsElement.innerHTML = targetRecipe.highlights.map(h => `
        <dt>*${h.category}</dt>
        <dd>${h.text}</dd>
    `).join("");

    const ingredientsElement = document.getElementById("overlay-ingredients");
    ingredientsElement.innerHTML = targetRecipe.ingredients.map(ing => `<li>${ing}</li>`).join("");

    const instructionsElement = document.getElementById("overlay-instructions");
    instructionsElement.innerHTML = targetRecipe.instructions.map(step => `<li>${step}</li>`).join("");

    // Triggers your overlay layout transitions via CSS class switches
    overlay.classList.add("is-active");
    document.body.classList.add("modal-open");
}

function closeDetailedView() {
    overlay.classList.remove("is-active");
    document.body.classList.remove("modal-open");
    navDropdown.value = "";
}

// --- SYSTEM EVENT ATTACHMENT BINDINGS ---
closeOverlayBtn.addEventListener("click", closeDetailedView);

navDropdown.addEventListener("change", (e) => {
    if (e.target.value) {
        openDetailedView(e.target.value);
    }
});

// Ignition System Launch Execution
initApp();