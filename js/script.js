// acts as storage
const state = {}

/* ---------------------- QUERY SELECTORS ---------------------- */
const searchForm = document.querySelector(".search");
const queryField = document.querySelector(".search__field");
const resPages = document.querySelector(".results__pages");
const resList = document.querySelector('.results__list');
const resRecipe = document.querySelector('.recipe');

/* ---------------------- EVENT LISTENERS ---------------------- */
// For Search Form on Submit
searchForm.addEventListener('submit', e => {
    controlSearch();
    e.preventDefault();
});

// For next pages
resPages.addEventListener("click", e => {
    const btn = e.target.closest(".btn-inline");
    if (btn){
        clearResults();      
        displayResults(state.search.result, parseInt(btn.dataset.goto));    
    }
});

/* ---------------------- CLASSES ---------------------- */
let Search = class {
    constructor(query) {
        this.query = query;
    }
    async getResults() {
        try {
            const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${this.query}`);
            const thisData = await res.json();
            this.result = thisData.data.recipes;
        } catch (error) {
            alert(error);
        }
    }
}

// let Recipe = class {
//     constructor(title, publisher, pictureURL, id) {
//         this.title = title;
//         this.publisher = publisher;
//         this.pictureURL = pictureURL;
//         this.id = id;
//     } 
// };

let RecipeDetails = class {
    constructor(id) {
        this.id = id;
    }
    async showRecipe() {
        try {
            const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${this.id}`);
            const thisData = await res.json();
            this.title = thisData.data.recipe.title;
            this.publisher = thisData.data.recipe.publisher;
            this.pictureURL = thisData.data.recipe.image_url;
            this.linkDirections = thisData.data.recipe.source_url;
            this.ingredients = thisData.data.recipe.ingredients;
            this.quantity = thisData.data.recipe.ingredients.quantity;
            this.unit = thisData.data.recipe.ingredients.unit;
            this.description = thisData.data.recipe.ingredients.description;
            this.servings = thisData.data.recipe.servings;
            this.cookingTime = thisData.data.recipe.cooking_time; 

            const createIngredient = ingredient =>
            `
                <li class="recipe__item">
                        <svg class="recipe__icon">
                            <use href="img/icons.svg#icon-check"></use>
                        </svg>
                        <div class="recipe__count">${ingredient.quantity}</div>
                        <div class="recipe__ingredient">
                            <span class="recipe__unit">${ingredient.unit}</span>
                            ${ingredient.description}
                        </div>
                </li>
            `

            const recipeList = `
            <figure class="recipe__fig">
                <img src="${this.pictureURL}" alt="Tomato" class="recipe__img">
                <h1 class="recipe__title">
                    <span>${this.title}</span>
                </h1>
            </figure>
            <div class="recipe__details">
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="img/icons.svg#icon-stopwatch"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--minutes">${this.cookingTime}</span>
                    <span class="recipe__info-text"> minutes</span>
                </div>
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="img/icons.svg#icon-man"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--people">${this.servings}</span>
                    <span class="recipe__info-text"> servings</span>

                    <div class="recipe__info-buttons">
                        <button class="btn-tiny">
                            <svg>
                                <use href="img/icons.svg#icon-circle-with-minus"></use>
                            </svg>
                        </button>
                        <button class="btn-tiny">
                            <svg>
                                <use href="img/icons.svg#icon-circle-with-plus"></use>
                            </svg>
                        </button>
                    </div>

                </div>
                <button class="recipe__love">
                    <svg class="header__likes">
                        <use href="img/icons.svg#icon-heart-outlined"></use>
                    </svg>
                </button>
            </div>



            <div class="recipe__ingredients">
                <ul class="recipe__ingredient-list">
                    ${this.ingredients.map(el => createIngredient(el)).join("")}
                </ul>

                <button class="btn-small recipe__btn">
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-shopping-cart"></use>
                    </svg>
                    <span>Add to shopping list</span>
                </button>
            </div>

            <div class="recipe__directions">
                <h2 class="heading-2">How to cook it</h2>
                <p class="recipe__directions-text">
                    This recipe was carefully designed and tested by
                    <span class="recipe__by">${this.publisher}</span>. Please check out directions at their website.
                </p>
                <a class="btn-small recipe__btn" href="${this.linkDirections}" target="_blank">
                    <span>Directions</span>
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-triangle-right"></use>
                    </svg>

                </a>
            </div>
            `;

            const recipeDiv = document.querySelector('.recipe');
            recipeDiv.insertAdjacentHTML('afterbegin',recipeList);


        } catch (err) {
            console.log(err);
            alert("Something went wrong");
        }
    }
}   


/* ---------------------- FUNCTIONS ---------------------- */
async function controlSearch(){
    const query = queryField.value;
    if (query){
        // New Search Object
        state.search = new Search(query)
        searchForm.reset();
        clearResults();
        showLoader(resList)
        // render loader here

        try {
            await state.search.getResults()
            displayResults(state.search.result);
            clearLoader()
        } catch (err) {
            alert("Something wrong with the search..");
            console.log(err);
            clearLoader();
        }
    }
}

function createItem(recipe){
    const recipeItem = `
        <li>
            <a class="results__link" href="#" onclick='selectRecipe("${recipe.id}")'>
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="Test">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${recipe.title}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>   
        `;
    const recipeListDiv = document.querySelector('.results__list');
    recipeListDiv.insertAdjacentHTML('afterbegin',recipeItem);
}

function displayResults(items, page = 1, limit = 10){
    //show results of current page
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    items.slice(startIndex, endIndex).forEach(createItem);  
    //show page buttons
    displayButtons(page, items.length, limit);
};

function displayButtons(page, totalResults, limit){
    const pages = Math.ceil(totalResults / limit);
    // type: prev or next
    const createButton = (page, type) => 
    `
        <button class="btn-inline results__btn--${type}" data-goto=${type === "prev" ? page - 1 : page + 1}>
            <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
            <svg class="search__icon">
                <use href="img/icons.svg#icon-triangle-${type === "prev" ? "left" : "right"}"></use>
            </svg>
        </button>
    `;
    let button;
    if (page === 1 && pages > 1) {
        button = createButton(page, "next");
    } else if (page < pages) {
        button = `
            ${createButton(page, "prev")}
            ${createButton(page, "next")}
        `;
    } else if (page === pages && pages > 1) {
        button = createButton(page, "prev");
    } else {
        return
    }
    resPages.insertAdjacentHTML("afterbegin", button);
};

function clearResults(){
    resList.innerHTML = ""
    resPages.innerHTML=""
}

function selectRecipe(recipe_id) {
    resRecipe.innerHTML = "";
    let newRecipe = new RecipeDetails(recipe_id);
    newRecipe.showRecipe();
}

function showLoader(parent){
    const loader = `
     <div class="loader">
        <svg>
           <use href='img/icons.svg#icon-cw'></use>
        </svg>
     </div>
     `;
    parent.insertAdjacentHTML("afterbegin", loader);
};
  
function clearLoader(){
    const loader = document.querySelector('.loader');
    if (loader) loader.parentElement.removeChild(loader);
};