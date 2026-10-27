const gridContainer = document.getElementById("recipe-grid-container");
const navDropdown = document.getElementById("recipe-selector");
const overlay = document.getElementById("fullscreen-overlay");
const closeOverlayBtn = document.getElementById("close-overlay");
const searchInput = document.getElementById("recipe-search");
const toggleFavoritesBtn = document.getElementById("toggle-favorites");
const loadMoreBtn = document.getElementById("load-more-btn");
const loadMoreContainer = document.getElementById("load-more-container");

// Track active filters and visibility limits globally
let showFavoritesOnly = false;
let myRecipes = []; 
let visibleCount = 12; // 🧠 Change this number to control how many cards show up first!
// --- LOCAL STORAGE HELPERS FOR FAVORITES ---
function getFavorites() {
    const favs = localStorage.getItem("vault_favorites");
    return favs ? JSON.parse(favs) : [];
}

function toggleFavorite(recipeId) {
    let favs = getFavorites();
    if (favs.includes(recipeId)) {
        favs = favs.filter(id => id !== recipeId);
    } else {
        favs.push(recipeId);
    }
    localStorage.setItem("vault_favorites", JSON.stringify(favs));
}

// --- DYNAMIC DATA LOADER (REPLACES THE OLD DATA.JS FILE) ---
async function loadRecipeVaultData() {
    try {
        const response = await fetch('recipes.json');
        if (!response.ok) throw new Error("Could not find or read recipes.json");
        
        // 1. Download the raw data array
        const rawData = await response.json();
        
        // 2. 🚀 ALPHABETIZE ENTIRE VAULT AUTOMATICALLY BEFORE BUILDING CARDS
        myRecipes = rawData.sort((a, b) => a.title.localeCompare(b.title));
        
        // 3. Launch your vault layout engine with sorted records
        initApp();
    } catch (error) {
        console.error("Vault critical error loading data array:", error);
        gridContainer.innerHTML = `<p style="text-align:center; color:#ff4d4d; font-weight:bold;">
            🔒 Vault Error: Could not read recipes.json.
        </p>`;
    }
}
function initApp() {
    gridContainer.innerHTML = "";
    
    // Clear old options out of the dropdown to prevent duplicates on refresh
    navDropdown.innerHTML = '<option value="">-- Select a Dish --</option>';
    
    const currentFavorites = getFavorites();
    
    myRecipes.forEach(recipe => {
        // 1. Populates the navigation dropdown menu automatically
        const option = document.createElement("option");
        option.value = recipe.id;
        option.textContent = `${recipe.emoji} ${recipe.title}`;
        navDropdown.appendChild(option);

        // 2. Generates your "Fort Knox" grid card structure matching your exact CSS framework
        const cardWrapper = document.createElement("div");
        cardWrapper.className = "card-link";
        cardWrapper.setAttribute("data-id", recipe.id); // Tag card with ID for filtering
        
        const isFavorited = currentFavorites.includes(recipe.id);
        const heartEmoji = isFavorited ? "❤️" : "🖤";
        const heartLabel = isFavorited ? "Remove from favorites" : "Add to favorites";
        
        cardWrapper.innerHTML = `
            <section class="recipe-card">
                <!-- Isolated interactive heart button inside card markup wrapper -->
                <button class="heart-btn" aria-label="${heartLabel}" data-recipe-id="${recipe.id}">${heartEmoji}</button>

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
        
        // Safe Event delegation: Clicking the card triggers details, clicking heart flips favorite state
        cardWrapper.addEventListener("click", (e) => {
            if (e.target.classList.contains("heart-btn") || e.target.closest(".heart-btn")) {
                e.stopPropagation(); // Stops modal popup when clicking the heart specifically!
                const targetBtn = e.target.classList.contains("heart-btn") ? e.target : e.target.closest(".heart-btn");
                const id = targetBtn.getAttribute("data-recipe-id");
                
                toggleFavorite(id);
                
                // Immediately update heart rendering states dynamically
                const nowFavorites = getFavorites();
                const updatedFavorite = nowFavorites.includes(id);
                targetBtn.textContent = updatedFavorite ? "❤️" : "🖤";
                targetBtn.setAttribute("aria-label", updatedFavorite ? "Remove from favorites" : "Add to favorites");
                
                // If filter is currently active, hide the card when unfavorited
                if (showFavoritesOnly && !updatedFavorite) {
                    cardWrapper.style.display = "none";
                }
            } else {
                openDetailedView(recipe.id);
            }
        });
        
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
function filterRecipes() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const activeFavs = getFavorites();
    const cards = gridContainer.querySelectorAll(".card-link");

    let matchingCount = 0; // Tracks items matching text search criteria

    cards.forEach(card => {
        const id = card.getAttribute("data-id");
        const cardTitle = card.querySelector("h2").textContent.toLowerCase();
        const cardDescription = card.querySelector("p").textContent.toLowerCase();

        const matchesSearch = cardTitle.includes(query) || cardDescription.includes(query);
        const matchesFavorites = !showFavoritesOnly || activeFavs.includes(id);

        // Card matches active filters
        if (matchesSearch && matchesFavorites) {
            matchingCount++;
            
            // Only show the card if it's within our current "Load More" page threshold limit
            if (matchingCount <= visibleCount) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        } else {
            card.style.display = "none";
        }
    });

    // Smart UI Manager: Hide the "Load More" button if we run out of recipes to show
    if (loadMoreContainer) {
        if (matchingCount <= visibleCount) {
            loadMoreContainer.style.display = "none"; // Hide button if all elements are visible
        } else {
            loadMoreContainer.style.display = "block"; // Show button if extra hidden items remain
        }
    }
}

// --- SYSTEM EVENT ATTACHMENT BINDINGS ---
closeOverlayBtn.addEventListener("click", closeDetailedView);

navDropdown.addEventListener("change", (e) => {
    if (e.target.value) {
        openDetailedView(e.target.value);
    }
});

if (searchInput) {
    searchInput.addEventListener("input", () => {
        visibleCount = 12; // Reset view threshold window when a user types a new search query!
        filterRecipes();
    });
}

if (toggleFavoritesBtn) {
    toggleFavoritesBtn.addEventListener("click", () => {
        showFavoritesOnly = !showFavoritesOnly;
        visibleCount = 12; // Reset layout view limits
        
        if (showFavoritesOnly) {
            toggleFavoritesBtn.textContent = "Show All Recipes 📋";
            toggleFavoritesBtn.classList.add("active-filter");
        } else {
            toggleFavoritesBtn.textContent = "Show Favorites ❤️";
            toggleFavoritesBtn.classList.remove("active-filter");
        }
        filterRecipes();
    });
}

// Dynamic Click Event Handler for Load More actions
if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
        visibleCount += 12; // 🚀 Append 12 more recipes to the screen cleanly!
        filterRecipes();
    });
}

// --- LAUNCH INITIALIZATION FROM NEW DATA PIPELINE ---
loadRecipeVaultData();
