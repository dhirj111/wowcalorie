const urlParams = new URLSearchParams(window.location.search);
const profileId = urlParams.get("id");
console.log("Profile ID:", profileId);

document.getElementById("profile-name-display").textContent = "Loading...";

function displayRecipes(recipes) {
  const container = document.getElementById("recipeContainer");
  container.innerHTML = "";

  if (recipes.length === 0) {
    container.innerHTML = "<p>No recipes found for this user.</p>";
    return;
  }

  const profileName = recipes[0]?.Wowuser?.name || "Unknown";
  document.getElementById("profile-name").textContent = profileName;
  document.getElementById("profile-name-display").textContent = profileName;

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
          <p>Diet: ${recipe.diet}</p>
          <p>Difficulty: ${recipe.difficulty}</p>
          <p>Time: ${recipe.time} minutes</p>
          <p>Steps: ${recipe.steps || "No steps provided"}</p>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });
}

// Fetch user's recipes
axios
  .get(`/userrecipies/${profileId}`)
  .then((result) => {
    console.log(result);
    displayRecipes(result.data);
  })
  .catch((err) => {
    console.error("Error fetching recipes:", err);
  });

// Follow user functionality
document.getElementById("follow-btn").addEventListener("click", () => {
  axios
    .post("http://localhost:1000/followuser", {
      userId: profileId,
    }, {
      headers: {
        token: localStorage.getItem("user jwt")
      }
    })
    .then(() => {
      alert("Followed successfully!");
    })
    .catch((err) => {
      console.error("Error following user:", err);
      alert("Error following user.");
    });
});
