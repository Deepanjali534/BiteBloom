const recipeContainer = document.getElementById('recipeContainer');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const paginationDiv = document.getElementById('pagination');
const ingredientSearchBtn = document.getElementById('ingredientSearchBtn');
const homeBtn = document.getElementById('homeBtn');
const favouritesBtn = document.getElementById('favouritesBtn');
const popup = document.getElementById('popup');
const closePopup = document.getElementById('closePopup');
const addToFavBtn = document.getElementById('addToFavBtn');
const favPopup = document.getElementById('favPopup');
const closeFavPopup = document.getElementById('closeFavPopup');
const favPopupContainer = document.getElementById('favPopupContainer');
let allRecipes = [];
let currentPage = 1;
const perPage = 12;
let currentMeal = null;
let favourites = JSON.parse(localStorage.getItem('favourites')) || [];
window.addEventListener('DOMContentLoaded', () => {
  loadDefaultRecipes();
});
homeBtn.addEventListener('click', () => {
  loadDefaultRecipes();
});
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) fetchRecipes(query);
});
ingredientSearchBtn.addEventListener('click', () => {
  const selected = [...document.querySelectorAll('#ingredientCheckboxes input:checked')].map(cb => cb.value);
  if (selected.length === 0) {
    alert("Please select at least one ingredient!");
    return;
  }
  const query = selected.join(",");
  fetchRecipes(query);
});
async function fetchRecipes(query) {
  recipeContainer.innerHTML = "<p>Loading recipes...</p>";
  paginationDiv.innerHTML = "";
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`);
    const data = await res.json();
    if (data.meals) {
      allRecipes = data.meals;
      currentPage = 1;
      renderPage();
    } else {
      recipeContainer.innerHTML = "<p>No recipes found!</p>";
    }
  } catch {
    recipeContainer.innerHTML = "<p>Error fetching data!</p>";
  }
}
async function loadDefaultRecipes() {
  const defaults = ["chicken", "pasta", "egg", "fish", "cake", "rice", "potato"];
  let temp = [];
  for (let food of defaults) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${food}`);
    const data = await res.json();
    if (data.meals) temp.push(...data.meals);
  }
  allRecipes = temp;
  currentPage = 1;
  renderPage();
}
function renderPage() {
  recipeContainer.innerHTML = "";
  paginationDiv.innerHTML = "";
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageRecipes = allRecipes.slice(start, end);
  pageRecipes.forEach(meal => createCard(meal, recipeContainer));
  const totalPages = Math.ceil(allRecipes.length / perPage);
  const prev = document.createElement('button');
  prev.textContent = "Prev";
  prev.disabled = currentPage === 1;
  prev.onclick = () => { currentPage--; renderPage(); };
  const next = document.createElement('button');
  next.textContent = "Next";
  next.disabled = currentPage === totalPages;
  next.onclick = () => { currentPage++; renderPage(); };
  paginationDiv.append(prev, ` Page ${currentPage}/${totalPages} `, next);
}
function createCard(meal, container = recipeContainer) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<img src="${meal.strMealThumb}" alt="${meal.strMeal}"><h3>${meal.strMeal}</h3>`;
  card.onclick = () => showPopup(meal.idMeal);
  container.appendChild(card);
}
async function showPopup(mealId) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
  const data = await res.json();
  const meal = data.meals[0];
  currentMeal = meal;
  document.getElementById('detailTitle').textContent = meal.strMeal;
  document.getElementById('detailImg').src = meal.strMealThumb;
  const ingredientsList = document.getElementById('detailIngredients');
  ingredientsList.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const li = document.createElement('li');
      li.textContent = `${measure || ''} ${ing}`;
      ingredientsList.appendChild(li);
    }
  }
  document.getElementById('detailInstructions').textContent = meal.strInstructions;
  popup.classList.remove('hidden');
}
addToFavBtn.addEventListener('click', () => {
  if (!currentMeal) return;
  const exists = favourites.some(fav => fav.idMeal === currentMeal.idMeal);
  if (!exists) {
    favourites.push(currentMeal);
    localStorage.setItem('favourites', JSON.stringify(favourites));
    alert("Added to favourites!");
  } else {
    alert("Already in favourites!");
  }
});
favouritesBtn.addEventListener('click', () => {
  renderFavouritesPopup();
  favPopup.classList.remove('hidden');
});
closeFavPopup.addEventListener('click', () => {
  favPopup.classList.add('hidden');
});
function renderFavouritesPopup() {
  favPopupContainer.innerHTML = "";
  if (favourites.length === 0) {
    favPopupContainer.innerHTML = "<p>No favourites yet!</p>";
    return;
  }
  favourites.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${meal.strMealThumb}" alt="${meal.strMeal}"><h3>${meal.strMeal}</h3>`;
    card.onclick = () => showPopup(meal.idMeal);
    favPopupContainer.appendChild(card);
  });
}
closePopup.addEventListener('click', () => {
  popup.classList.add('hidden');
});
window.addEventListener('click', (e) => {
  if (e.target === popup) popup.classList.add('hidden');
  if (e.target === favPopup) favPopup.classList.add('hidden');
});


