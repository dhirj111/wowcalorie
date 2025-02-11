function displayRecipes(recipes) {
  const container = document.getElementById("recipeContainer");
  container.innerHTML = ""; // Clear existing content

  if (recipes.length === 0) {
    container.innerHTML = "<p>No recipes found for this user.</p>";
    return;
  }

  // Assuming all recipes belong to the same user; set profile name from the first recipe.
  const profileName = recipes[0].creatorName +"  profile" || "Unknown";
  document.getElementById("profile-name").textContent = profileName;

  // Loop over each recipe and create its card.
  recipes.forEach((recipe) => {
    // Create a card container
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    // Insert the dish information into the card using innerHTML.
    card.innerHTML = `
      <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-image" style="max-width:100%;">
      <div class="recipe-content">
        <div class="recipe-header">
          <div class="profile-icon">👤</div>
          <h3>${recipe.name}</h3>
        </div>
        <p>Diet: ${recipe.diet}</p>
        <p>Difficulty: ${recipe.difficulty}</p>
        <p>Time: ${recipe.time} minutes</p>
        <p>Steps: ${recipe.steps || "No steps provided"}</p>
      </div>
    `;

    // Create the delete button
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "Delete Dish";

    // Attach an event listener to call deleteDish when clicked.
    deleteButton.addEventListener("click", function () {
      // Pass the dish id and the current card element to remove it upon success.
      deleteDish(recipe.id, card);
    });

    // Append the delete button to the card.
    card.appendChild(deleteButton);

    // Append the card to the main container.
    container.appendChild(card);
  });
}

// Function that makes the API call to delete the dish.
function deleteDish(dishId, cardElement) {
  // Make sure to adjust the URL according to your API design.
  axios.delete(`http://localhost:1000/owndishes/${dishId}`, {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => {
      console.log("Dish deleted:", response.data);
      // Remove the dish card from the UI.
      cardElement.remove();
    })
    .catch(error => {
      console.error("Error deleting dish:", error);
    });
}

// Fetch the recipes/dishes from the API and display them.
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
  });