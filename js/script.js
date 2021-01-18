const state = {
    shoppingList: [],
}

/* ---------------------- QUERY SELECTORS ---------------------- */
const searchForm = document.querySelector(".search");
const queryField = document.querySelector(".search__field");
const resPages = document.querySelector(".results__pages");
const resList = document.querySelector('.results__list');
const resRecipe = document.querySelector('.recipe');
const shopList = document.querySelector('.shopping__list')

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

// for updating servings
resRecipe.addEventListener("click", e => {
    const servingsBtn = e.target.closest('.btn-tiny')
    if (!servingsBtn) return;

    const updateNum = +servingsBtn.dataset.update; // '+' to convert to a number
    if (updateNum > 0) {
        updateServings(updateNum);
    }
})

// for shopping list
shopList.addEventListener("click", e => {
    const shop = e.target.closest(".shopping__delete");
    if (shop) {
        const item = shop.parentElement;
        item.parentElement.removeChild(item);
    }
})

// for local storage of bookmarks
window.addEventListener('load', () => {
	state.bookmark = new Bookmark();
	//restoring our likes
	state.bookmark.readStorage();
	//toggle the heart button up top
	toggleLikeMenu(state.bookmark.getNumLikes());
	//render the existing likes
	state.bookmark.bookmark.forEach(like => createLiked(like));
});

// change highlighted or active status for chosen recipe
["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));

/* ---------------------- CLASSES ---------------------- */
let Search = class {
    constructor(query) {
        this.query = query;
    }
    async getResults() {
        try {
            const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${this.query}`);
            const thisData = await res.json();
            if (thisData.results !== 0){
                this.result = thisData.data.recipes;
            } else if (thisData.results === 0){
                const recipeItem = 
                `
                <li>
                    <div class="search__error" href="#">
                        <svg class="likes__icon">
                            <use href="img/icons.svg#icon-circle-with-cross"></use>
                        </svg>
                        <div class="search__error__text">
                            <h4 class="">No results found for your query!</h4>
                        </div>
                    </div>
                </li>
                `;
                const recipeListDiv = document.querySelector('.results__list');
                recipeListDiv.insertAdjacentHTML('afterbegin',recipeItem);
            }
        } catch (error) {
            alert("Something went wrong");
        }
    }
}

let RecipeDetails = class {
    constructor(id) {
        this.id = id;
    }
    async getRecipe() {
        try {
            const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${this.id}`);
            const thisData = await res.json();
            this.result = thisData.data.recipe;
            this.result.ingredients.forEach(ing => ing.step = ing.quantity);
            this.result.ingredients.forEach(ing => ing.frac = numberToFraction(ing.quantity));

    } catch (err) {
            console.log(err);
            alert("Something went wrong");
        }
    }
}

let Bookmark = class {
    constructor() {
        this.bookmark = [];
    }
    addLike(id, title, author, img) {
        const like = { id, title, author, img };
        this.bookmark.push(like);
        this.storeData();
        return like;
    }
    deleteLike(id) {
        const index = this.bookmark.findIndex(el => el.id === id);
        this.bookmark.splice(index, 1);
        this.storeData();
    }
    isLiked(id) {
        return this.bookmark.findIndex(el => el.id === id) !== -1;
    }
    getNumLikes() {
        return this.bookmark.length;
    }
    storeData() {
        localStorage.setItem("bookmark", JSON.stringify(this.bookmark));
    }
    readStorage() {
        const storage = JSON.parse(localStorage.getItem("bookmark"));
        //Restoring likes from the localStorage
        if (storage) this.bookmark = storage;
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
        try {
            await state.search.getResults()
            displayResults(state.search.result);
            clearLoader()
        } catch (err) {
            // alert("Something wrong with the search..");
            console.log(err);
            clearLoader();
        }
    }
}

async function selectRecipe(recipe_id) {
    resRecipe.innerHTML = "";
    state.newRecipe = new RecipeDetails(recipe_id);
    showLoader(resRecipe);
    try {
        await state.newRecipe.getRecipe();
        createRecipe(state.newRecipe.result);
        clearLoader();
    } catch (err) {
        // alert(err);
        console.log(err);
        clearLoader();
    }
}


function highlightSelected(id) {
    const highlight = Array.from(document.querySelectorAll(".results__link"));
    highlight.forEach(el => el.classList.remove("results__link--active"));
    document.querySelector(`.results__link[href="#${id}"]`).classList.add("results__link--active");
}

function controlRecipe() {
    const id = window.location.hash.replace("#", "");
    if (id) {
        if (state.search) highlightSelected(id);
    }
}

function createItem(recipe){
    const recipeItem = 
        `
            <li>
                <a class="results__link" href="#${recipe.id}" onclick='selectRecipe("${recipe.id}")'>
                    <figure class="results__fig">
                        <img src="${recipe.image_url}" alt="${recipe.title}">
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

function createRecipe(item) {
    const createIngredient = ingredient => 
        `
            <li class="recipe__item">
                    <svg class="recipe__icon">
                        <use href="img/icons.svg#icon-check"></use>
                    </svg>
                    <div class="recipe__count">${ingredient.step}</div>
                    <div class="recipe__ingredient">
                        <span class="recipe__unit">${ingredient.unit}</span>
                        ${ingredient.description}
                    </div>
            </li>
        `
    const currentID = state.newRecipe.result.id;
    let iconString;
    if (!state.bookmark) {
        iconString = "icon-heart-outlined"
    } else if (!state.bookmark.isLiked(currentID)){
        iconString = "icon-heart-outlined"
    } else if (state.bookmark.isLiked(currentID)){
        iconString = "icon-heart"
    }
    
    // null will not be shown for quantity
    const thisQty = state.newRecipe.result.ingredients;
    thisQty.forEach(i => {
        if (i.step === null) {
            i.step = "";
        } else {
            i.step = i.frac
        }
    })


    const recipeList = 
        `
            <figure class="recipe__fig">
                <img src="${item.image_url}" alt="${item.title}" class="recipe__img">
                <h1 class="recipe__title">
                    <span>${item.title}</span>
                </h1>
            </figure>
            <div class="recipe__details">
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="img/icons.svg#icon-stopwatch"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--minutes">${item.cooking_time}</span>
                    <span class="recipe__info-text"> minutes</span>
                </div>
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="img/icons.svg#icon-man"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--people">${item.servings}</span>
                    <span class="recipe__info-text"> servings</span>

                    <div class="recipe__info-buttons">
                        <button class="btn-tiny" data-update="${item.servings-1}">
                            <svg>
                                <use href="img/icons.svg#icon-circle-with-minus"></use>
                            </svg>
                        </button>
                        <button class="btn-tiny" data-update="${item.servings+1}">
                            <svg>
                                <use href="img/icons.svg#icon-circle-with-plus"></use>
                            </svg>
                        </button>
                    </div>
                </div>
                <button class="recipe__love" onclick="controlLike()">
                    <svg class="header__likes">
                        <use href="img/icons.svg#${iconString}"></use>
                    </svg>
                </button>
            </div>

            <div class="recipe__ingredients">
                <ul class="recipe__ingredient-list">
                    ${item.ingredients.map(el => createIngredient(el)).join("")}
                </ul>

                <button class="btn-small recipe__btn" onclick='addToList("${item.id}")'>
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
                    <span class="recipe__by">${item.publisher}</span>. Please check out directions at their website.
                </p>
                <a class="btn-small recipe__btn" href="${item.source_url}" target="_blank">
                    <span>Directions</span>
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-triangle-right"></use>
                    </svg>
                </a>
            </div>
        `;
        const recipeDiv = document.querySelector('.recipe');
        recipeDiv.insertAdjacentHTML('afterbegin',recipeList);
}

function displayResults(items, page = 1, limit = 10){
    //show results of current page
    const startIndex = (page - 1) * limit; // 0
    const endIndex = page * limit; // 10
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

function showLoader(parent){
    const loader = 
    `
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

function addToList() {
    let ingredient = state.newRecipe.result.ingredients;
    for (let i=0; i<ingredient.length; i++) {
        let found = state.shoppingList.some(elem => elem.description === ingredient[i].description);
        if (!found){
            ingredient[i].step = toDecimal(`${ingredient[i].step}`)
            state.shoppingList.push(ingredient[i])
            showShoppingList(ingredient[i])
            // console.log(state.shoppingList)
        } else if (found) {         
            const index = state.shoppingList.findIndex(el => el.description === ingredient[i].description);
            let listItem = document.querySelector(`[data-itemid=${ingredient[i].description.replace(/ |\/|"|[0-9]/g, "")}]`)
            if (state.shoppingList[index].unit === ingredient[i].unit){
                listItem.firstElementChild.firstElementChild.value = parseFloat(state.shoppingList[index].quantity) + parseFloat(toDecimal(`${ingredient[i].step}`))
                state.shoppingList[index].quantity = state.shoppingList[index].quantity + parseFloat(toDecimal(`${ingredient[i].step}`))    
            } else if (state.shoppingList[index].unit !== ingredient[i].unit){
                ingredient[i].step = toDecimal(`${ingredient[i].step}`)
                state.shoppingList.push(ingredient[i])
                showShoppingList(ingredient[i])
            }
        }
    }
}

function showShoppingList(item) {
    const shoppingList = 
        `
            <li class="shopping__item" data-itemid=${item.description.replace(/ |\/|"|[0-9]/g, "")}>
                <div class="shopping__count">
                    <input type="number" value="${item.step}" step="${item.step/4}">
                    <p>${item.unit}</p>
                </div>
                <p class="shopping__description">${item.description}</p>
                <button class="shopping__delete btn-tiny">
                    <svg>
                        <use href="img/icons.svg#icon-circle-with-cross"></use>
                    </svg>
                </button>
            </li>
        `;
    const shoppingDiv = document.querySelector('.shopping__list');
    shoppingDiv.insertAdjacentHTML('afterbegin', shoppingList);
}

function updateQuantity(newNum) {
    // updating ingredients list based on number of servings
    let ingredient = state.newRecipe.result.ingredients;
    let servings = state.newRecipe.result.servings;

    ingredient.forEach(num => {
        if (num.step === "") {
            num.step = "";
        } else {
            num.step = (toDecimal(`${num.step}`) * newNum) / servings; // (previousQty * newQty) / defaultNumberOfServing
            state.newRecipe.result.servings = newNum;
            num.frac = numberToFraction((toDecimal(`${num.frac}`) * newNum) / servings)
        }
    })
}

function updateServings(newQty) {
    // updating recipe preview (middle div)
    updateQuantity(newQty);
    resRecipe.innerHTML = "";
    createRecipe(state.newRecipe.result);
}


function controlLike() {
    if (!state.bookmark) {
        state.bookmark = new Bookmark();
    }
    const currentID = state.newRecipe.result.id;
    if (!state.bookmark.isLiked(currentID)) {
        const newBookmark = state.bookmark.addLike(currentID, state.newRecipe.result.title, state.newRecipe.result.publisher, state.newRecipe.result.image_url);
        toggleLikeBtn(true);
        createLiked(newBookmark);
    } else {
        state.bookmark.deleteLike(currentID);
        toggleLikeBtn(false);
        deleteLike(currentID);
    }
    toggleLikeMenu(state.bookmark.getNumLikes());
};


function toggleLikeBtn(isLiked) {
    const iconString = isLiked ? "icon-heart" : "icon-heart-outlined";
    document.querySelector(".recipe__love use").setAttribute("href", `img/icons.svg#${iconString}`);
};
    
function toggleLikeMenu(numLikes){
    if (numLikes === 0){
        document.querySelector(".likes__error").style.display = "flex"
    } else {
        document.querySelector(".likes__error").style.display = "none"
    }
};

function createLiked(item){
    const markup = `
    <li>
        <a class="likes__link" href="#${item.id}" onclick='selectRecipe("${item.id}")'>
            <figure class="likes__fig">
                <img src="${item.img}" alt="${item.title}">
            </figure>
            <div class="likes__data">
                <h4 class="likes__name">${item.title}</h4>
                <p class="likes__author">${item.author}</p>
            </div>
        </a>
    </li>
    `;
    document.querySelector(".likes__list").insertAdjacentHTML("beforeend", markup);
};
    
function deleteLike(id) {
    const el = document.querySelector(`.likes__link[href*="${id}"]`).parentElement;
    if (el){
        el.parentElement.removeChild(el);
    }
};

function numberToFraction(amount) {
	// If whole number OR if amount is not a number, return amount
	if (parseFloat(amount) === parseInt(amount) || isNaN(parseFloat(amount))) {
		return amount;
	}
	let gcd = function(a, b) {
		if (b < 0.0000001) {
			return a;
		}
		return gcd(b, Math.floor(a % b));
	};
	var len = amount.toString().length - 2;
	var denominator = Math.pow(10, len);
	var numerator = amount * denominator;
	var divisor = gcd(numerator, denominator);
	numerator /= divisor;
	denominator /= divisor;
	var base = 0;
    // converting into mixed fractions
	if (numerator > denominator) {
		base = Math.floor(numerator / denominator);
		numerator -= base * denominator;
	}
	amount = Math.floor(numerator) + '/' + Math.floor(denominator);
	if ( base ) {
		amount = base + ' ' + amount;
	}
	return amount;
};

function toDecimal(x) {
    if (parseFloat(x) === parseInt(x) && x % 1 === 0){
		return x;
	} else if (x.indexOf('/') !== -1) {
        var parts = x.split(" ")
        var decParts;
        if (parts.length > 1) {
            decParts = parts[1].split("/");
        }
        else {
            decParts = parts[0].split("/");
            parts[0] = 0;
        }
        return parseInt(parts[0], 10) + (parseInt(decParts[0], 10) / parseInt(decParts[1], 10))
    } else {
        return x
    }
}