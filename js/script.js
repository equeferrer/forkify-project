// Event Listener for Search Form on Submit
const searchForm = document.querySelector(".search");
let query = document.querySelector(".search__field");
searchForm.addEventListener('submit', handleSubmit);
function handleSubmit(e){
    // Prevent refreshing page
    e.preventDefault();
    console.log(query.value); 
    // SEARCH request
    getRecipes();
    // Clear text in form value
    searchForm.reset();
}

const endpoint = 'https://forkify-api.herokuapp.com/api/v2/recipes?search=';
async function getRecipes() {
    document.querySelector('.results__list').innerHTML = ""
    // get change endpoint based on word search
    console.log(endpoint+query.value)
	try {
        const response = await fetch(endpoint+query.value)
		if (!response.ok) {
			throw Error(response.statusText)
		}
        const json = await response.json();
        json.data.recipes.forEach(recipe => {
            console.log(recipe)
            recipe = new Recipe(recipe.title, recipe.publisher, recipe.image_url, recipe.id)
            recipe.createItem()
        });

	} catch (err) {
		console.log(err)
		alert('Failed to get recipe');
	}
}

let Recipe = class {
    constructor(title, publisher, pictureURL, id) {
        this.title = title;
        this.publisher = publisher;
        this.pictureURL = pictureURL;
        this.id = id;
        // can add link recipe to store value of ID with link recipe this.linkRecipe = linkRecipe
        // this.linkDirections = linkDirections;
        // can add recipe Item if using a new class per recipe this.recipeItem = recipeItem;
    } 
    
    createItem(){
            const recipeItem = `
                <li>
                    <a class="results__link" href="#" onclick='selectRecipe("${this.id}")'>
                        <figure class="results__fig">
                            <img src="${this.pictureURL}" alt="Test">
                        </figure>
                        <div class="results__data">
                            <h4 class="results__name">${this.title}</h4>
                            <p class="results__author">${this.publisher}</p>
                        </div>
                    </a>
                </li>   
                `;
            const recipeListDiv = document.querySelector('.results__list');
            recipeListDiv.insertAdjacentHTML('afterbegin',recipeItem);
    }
};

// MIDDLE DIV

function selectRecipe(recipe_id) {
    document.querySelector('.recipe').innerHTML = "";
    let newRecipe = new RecipeDetails(recipe_id);
    newRecipe.showRecipe();
    // console.log(recipe_id);

}


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
            console.log(this.title);
            console.log(this.publisher);
            console.log(this.pictureURL);
            console.log(this.linkDirections);
            console.log(this.ingredients);          

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


