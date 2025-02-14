if (localStorage.getItem("user jwt") == null) {
  console.log
  alert("you are not logged in");
  window.location.href = "http://localhost:1000/login"
}
function displayRecipes(recipes) {
  const container = document.getElementById("recipeContainer");
  container.innerHTML = "";

  if (recipes.length === 0) {
    container.innerHTML = "<p>No recipes found</p>";
    return;
  }


  recipes.forEach((recipe) => {
    console.log(recipe);

    const card = `
      <div class="recipe-card">
        <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-image">
        <div class="recipe-content">
          <div class="recipe-header">
            <div class="profile-icon">👤</div>
            <h3>${recipe.name}</h3>
          </div>
          <p>Creator: ${recipe.creatorName}</p>
          <p>Diet: ${recipe.diet}</p>
          <p>Difficulty: ${recipe.difficulty}</p>
          <p>Time: ${recipe.time} minutes</p>
          <p>Steps: ${recipe.steps || "No steps provided"}</p>
          <button onclick="favouriteDish(${recipe.id})" style="background-color: gold; color: black; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
            ⭐ Star
        </button>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });
}
function favouriteDish(dishId) {
  axios.post("http://localhost:1000/favourited", { dishId }, {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => alert("Dish added to favourites!"))
    .catch(error => console.error("Error adding to favourites:", error));
}
// Fetch user's recipes
axios
  .get('http://localhost:1000/followingreciepies', {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
  .then((result) => {
    console.log("result is ---", result)
    console.log(result);
    displayRecipes(result.data);
  })
  .catch((err) => {
    alert("you are not logged in currently ,please login")
    console.error("Error fetching recipes:", err);
  });


axios
  .get('http://localhost:1000/allfollowers', {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
  .then((result) => {
    console.log(result);
    const followlist = document.getElementById("followlist");
    followlist.innerHTML = ''; // Clear existing content
    
    for (let i = 0; i < result.data.length; i++) {
        const followItem = document.createElement('div');
        followItem.className = 'follow-item';
        
        // Get first letter of name for avatar
        const firstLetter = result.data[i].name.charAt(0).toUpperCase();
        
        followItem.innerHTML = `
            <div class="follow-avatar">${firstLetter}</div>
            <div class="follow-info">
                <div class="follow-name">${result.data[i].name}</div>
                <div class="follow-stats">ID: ${result.data[i].id}</div>
            </div>
            <button class="unfollow-btn" data-id="${result.data[i].id}">Unfollow</button>
        `;
        
        followlist.appendChild(followItem);
    }
})
  .catch((err) => {
    alert("you are not logged in currently ,please login")
    console.error("Error fetching recipes:", err);
  });