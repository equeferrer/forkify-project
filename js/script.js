const searchForm = document.querySelector(".search");

searchForm.addEventListener('submit', handleSubmit);

function handleSubmit(e){
    e.preventDefault();
    console.log("Clicked!");
    searchForm.reset();
}

const endpoint = 'https://forkify-api.herokuapp.com/api/search?q=';
const input = 'pizza'
let list = [];
async function getRecipe() {
    list = [];
    console.log(endpoint+input)
	try {
        const response = await fetch(endpoint+input)
		if (!response.ok) {
			throw Error(response.statusText)
		}
        const json = await response.json();
        console.log(json);
        list = [json.recipes];

        console.log(list)

        list.forEach(recipeList => {
            recipeList.forEach(recipe => console.log(recipe))
        });

        list = []
        console.log(list)
        
	} catch (err) {
		console.log(err)
		alert('Failed to get recipe');
	}
}

getRecipe();