
if (localStorage.getItem("user jwt") == null) {
  alert("you are not logged in");
  window.location.href = "http://localhost:1000/login"
} 
function displayRecipes(recipes) {
  const container = document.getElementById('recipeContainer');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    console.log(recipe)
    const userId = recipe.userId || '#';
    const userName = recipe.creatorName || 'Anonymous';

    const card = `
          <div class="recipe-card">
              <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-image">
              <div class="recipe-content">
                  <div class="recipe-header">
                      <div class="profile-icon">👤</div>
                      <h3>${recipe.name}</h3>
                  </div>
                  <p>By: <a href="http://localhost:1000/${userId}" target="_blank">${userName}</a></p>
                  <p>Diet: ${recipe.diet}</p>
                  <p>Difficulty: ${recipe.difficulty}</p>
                  <p>Time: ${recipe.time} minutes</p>
                  <p>Steps: ${recipe.steps || 'No steps provided'}</p>
      `;
    container.innerHTML += card;
  });
}


axios
  .get('http://localhost:1000/getstarreddish', {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
  .then((result) => {

    console.log(result);
    displayRecipes(result.data);
  })
  .catch((err) => {
    alert("you are not logged in currently ,please login")
    console.error("Error fetching recipes:", err);
  });