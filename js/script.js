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

const endpoint = 'https://forkify-api.herokuapp.com/api/search?q=';
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
        json.recipes.forEach(recipe => {
            console.log(recipe)
            recipe = new Recipe(recipe.title, recipe.publisher, recipe.image_url, recipe.recipe_id, recipe.source_url)
            recipe.createItem()
        });
	} catch (err) {
		console.log(err)
		alert('Failed to get recipe');
	}
}

let Recipe = class {
    constructor(title, publisher, pictureURL, id, linkDirections) {
        this.title = title;
        this.publisher = publisher;
        this.pictureURL = pictureURL;
        this.id = id;
        // can add link recipe to store value of ID with link recipe this.linkRecipe = linkRecipe
        this.linkDirections = linkDirections;
        // can add recipe Item if using a new class per recipe this.recipeItem = recipeItem;
    } 
    createItem(){
        // UL list 
        const resultsList = document.querySelector('.results__list');
        // Item LI
        const itemLi = document.createElement('li');
        resultsList.appendChild(itemLi)
        // Anchor 
        const anchor = document.createElement('a');
        anchor.classList.add('results__link');
        itemLi.appendChild(anchor);
        anchor.href = "#"
        // figure
        const figure = document.createElement('figure');
        figure.classList.add('results__fig');
        anchor.appendChild(figure);
        // image
        const image = document.createElement('img');
        figure.appendChild(image);
        image.src = this.pictureURL;
        // div
        const description = document.createElement('div')
        description.classList.add('results__data');
        anchor.appendChild(description);
        // food name/title
        const name = document.createElement('h4')
        name.classList.add('results__name');
        name.innerText = this.title;
        description.appendChild(name);
        // publisher
        const author = document.createElement('p')
        author.classList.add('results__author');
        author.innerText = this.publisher;
        description.appendChild(author)
    }
};

