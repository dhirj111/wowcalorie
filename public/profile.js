const urlParams = new URLSearchParams(window.location.search);
const profileId = urlParams.get("id");
console.log(profileId)
document.getElementById("profile-id").textContent = profileId;
function displayRecipes(recipes) {
  const container = document.getElementById('recipeContainer');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    console.log(recipe)

    const card = `
          <div class="recipe-card">
              <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-image">
              <div class="recipe-content">
                  <div class="recipe-header">
                      <div class="profile-icon">👤</div>
                      <h3>${recipe.name}</h3>
                  </div>
              
                  <p>Diet: ${recipe.diet}</p>
                  <p>Difficulty: ${recipe.difficulty}</p>
                  <p>Time: ${recipe.time} minutes</p>
                  <p>Steps: ${recipe.steps || 'No steps provided'}</p>

                
              </div>
          </div>
      `;
    container.innerHTML += card;
  });
}


axios.get(`/userrecipies/${profileId}`).then((result) => {
  console.log(result)
  displayRecipes(result.data)

}).catch((err) => {

});
