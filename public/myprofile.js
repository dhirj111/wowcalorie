function displayRecipes(recipes) {
  const container = document.getElementById("recipeContainer");
  container.innerHTML = "";

  if (recipes.length === 0) {
      container.innerHTML = "<p class='no-recipes'>No recipes found for this user.</p>";
      return;
  }

  const profileName = `${recipes[0].creatorName}'s Profile` || "Unknown Profile";
  document.getElementById("profile-name").textContent = profileName;

  recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.classList.add("recipe-card");
      
      card.innerHTML = `
          <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-image">
          <div class="recipe-content">
              <div class="recipe-header">
                  <div class="profile-icon">👤</div>
                  <h3>${recipe.name}</h3>
              </div>
              <p><strong>Diet:</strong> ${recipe.diet}</p>
              <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
              <p><strong>Time:</strong> ${recipe.time} minutes</p>
              <p><strong>Steps:</strong> ${recipe.steps || "No steps provided"}</p>
          </div>
      `;

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-button");
      deleteButton.textContent = "Delete";
      
      deleteButton.addEventListener("click", () => deleteDish(recipe.id, card));
      
      card.appendChild(deleteButton);
      container.appendChild(card);
  });
}

function deleteDish(dishId, cardElement) {
  axios.delete(`http://localhost:1000/owndishes/${dishId}`, {
      headers: {
          token: localStorage.getItem("user jwt")
      }
  })
  .then(response => {
      console.log("Dish deleted:", response.data);
      cardElement.remove();
  })
  .catch(error => {
      console.error("Error deleting dish:", error);
      alert("Failed to delete dish. Please try again.");
  });
}

// Initial load of recipes
axios.get('http://localhost:1000/owndishes', {
  headers: {
      token: localStorage.getItem("user jwt")
  }
})
.then((result) => {
  console.log("Fetched recipes:", result.data);
  displayRecipes(result.data);
})
.catch((err) => {
  console.error("Error fetching recipes:", err);
  alert("You are not currently logged in. Please login to view your recipes.");
});

// Setup logout button
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('user jwt');
  window.location.href = '/login.html';
});


axios
  .get('http://localhost:1000/allfollowings', {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
  .then((result) => {

    console.log(result);
    let fwgcontainer = document.getElementById("followlist")
    for (let i = 0; i < result.data.length; i++) {
      let node = document.createElement('li')
      node.innerHTML = `${i + 1} |  ${result.data[i].name} id =${result.data[i].id}`
      fwgcontainer.appendChild(node)
    }
  })
  .catch((err) => {
    alert("you are not logged in currently ,please login")
    console.error("Error fetching recipes:", err);
  });