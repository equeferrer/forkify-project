// acts as storage
const state = {}

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

// for the shopping list
shopList.addEventListener("click", e => {
    const shop = e.target.closest(".shopping__delete");
    const item = shop.parentElement;
    if (shop) {
        shop.parentElement.parentElement.removeChild(item);
    }
})

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
    async getRecipe() {
        try {
            const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${this.id}`);
            const thisData = await res.json();
            this.result = thisData.data.recipe;
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

async function selectRecipe(recipe_id) {
    resRecipe.innerHTML = "";
    state.newRecipe = new RecipeDetails(recipe_id);
    showLoader(resRecipe);

    try {
        await state.newRecipe.getRecipe();
        createRecipe(state.newRecipe.result);
        clearLoader();
    } catch (err) {
        alert("Something wrong with the search..");
        console.log(err);
        clearLoader();
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

function createRecipe(item) {
    const createIngredient = ingredient => `
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
            <img src="${item.image_url}" alt="Tomato" class="recipe__img">
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

// function selectRecipe(recipe_id) {
//     resRecipe.innerHTML = "";
//     let newRecipe = new RecipeDetails(recipe_id);
//     newRecipe.showRecipe();
// }

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


// SHOPPING LIST
let listArray = [];

function addToList() {
    let ingredient = state.newRecipe.result.ingredients;
    ingredient.forEach(el => {
            showShoppingList(el)
        })
    // for (let i=0; i<ingredient.length; i++) {
    //     if (ingredient[i].description === state.newRecipe.result.ingredients) {
    //         // console.log(ingredient[i].description);
    //         listArray.push(ingredient[i])
    //         // state.description = ingredient[i].description
    //         console.log(listArray);
    //     } else {
    //         console.log('Didn\'t Work');
    //     }
    // }
    //         if (el.description === ingredient.description) {
    //             console.log(ingredient.description)
    //         } else {
    //             console.log(state.newRecipe.result.ingredients)
    // })
    // showShoppingList(something.ingredients);
    // console.log(ingredient);
}



// let found = bank.usersArray.some(elem => elem.username === user);
// let userLogIn = bank.usersArray.find(elem => elem.username === user);
//         if (!found){
//             document.querySelector(".alert").classList.remove('hidden');
//             document.querySelector("#error").innerText = "User does not exist";
//             setTimeout(function () { document.querySelector(".alert").classList.add('hidden'); }, 3000);
//         } else if (userLogIn.password !== password) {
//             document.querySelector(".alert").classList.remove('hidden');
//             document.querySelector("#error").innerText = "Wrong password";
//             setTimeout(function () { document.querySelector(".alert").classList.add('hidden'); }, 3000);






function showShoppingList(item) {
        
    const shoppingList = 
        `
        <li class="shopping__item" data-itemid=${item.description}>
            <div class="shopping__count">
                <input type="number" value="${item.quantity}" step="${item.quantity}">
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

// const item = document.querySelectorAll(".shopping__delete");

// item.forEach(items => items.addEventListener('click', deleteItem));

// function deleteItem (e) {
//     // if (item) {
//     //     // item.parentElement.removeChild(item);
//     //     console.log(item.parentElement)
//     //     console.log(item);
//     // }
//     console.log(e.target);
//     console.log('Hello');
// }






// let ShoppingList = class {
//     constructor(id, ingredient, quantity, unit, description) {
//        this.id = id;
//        this.ingredients = ingredient;
//        this.quantity = quantity;
//        this.unit = unit;
//        this.description = description;
//     } 

//     showShoppingList() {
        
//             const shoppingList = 
//                 `
//                 <li class="shopping__item" data-itemid=${this.id}>
//                     <div class="shopping__count">
//                         <input type="number" value="${this.quantity}" step="${this.quantity}">
//                         <p>${this.unit}</p>
//                     </div>
//                     <p class="shopping__description">${this.description}</p>
//                     <button class="shopping__delete btn-tiny">
//                         <svg>
//                             <use href="img/icons.svg#icon-circle-with-cross"></use>
//                         </svg>
//                     </button>
//                 </li>
//                 `;
            
//             const shoppingDiv = document.querySelector('.shopping__list');
//             shoppingDiv.insertAdjacentHTML('afterbegin', shoppingList);
//     }
// }