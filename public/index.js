const newdishbutton = (event) => {
  event.preventDefault();
  // Navigate to the "new dish" page
  window.location.href = "http://localhost:1000/newdish";
  // Optionally call the API endpoint (if needed)
  axios.get("http://localhost:1000/newdish")
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

let currentRecipes = [];

function loadRecipes(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  axios.get(`http://localhost:1000/getrecipes?${queryParams}`)
    .then(response => {
      currentRecipes = response.data;
      displayRecipes(currentRecipes);
    })
    .catch(error => {
      console.error('Error loading recipes:', error);
    });
}

function searchRecipes() {
  const query = document.getElementById('searchInput').value;
  if (!query) {
    loadRecipes();
    return;
  }
  axios.get(`http://localhost:1000/searchrecipes?query=${query}`)
    .then(response => {
      currentRecipes = response.data;
      displayRecipes(currentRecipes);
    })
    .catch(error => {
      console.error('Error searching recipes:', error);
    });
}

function applyFilters() {
  const filters = {
    diet: document.getElementById('dietFilter').value,
    difficulty: document.getElementById('difficultyFilter').value,
    glutenfree: document.getElementById('glutenFreeFilter').checked,
    maxTime: document.getElementById('maxTimeFilter').value
  };
  loadRecipes(filters);
}

// Function to call the rating API with dishId and rating value
function rateRecipe(dishId, rating) {
  axios.post("http://localhost:1000/rateRecipe", {
    dishId,
    rating
  })
    .then(response => {
      console.log(`Rated dish ${dishId} with ${rating}:`, response.data);
      alert(`You rated this dish with ${rating} stars.`);
    })
    .catch(error => {
      console.error('Error rating recipe:', error);
      alert('Error rating recipe');
    });
}

// Function to submit a comment for a recipe with dishId
function submitComment(dishId) {
  const commentInput = document.getElementById(`commentInput-${dishId}`);
  const comment = commentInput.value;
  if (!comment) {
    alert("Please enter a comment.");
    return;
  }
  axios.post("http://localhost:1000/commentRecipe", {
    dishId,
    comment
  })
    .then(response => {
      console.log(`Comment submitted for dish ${dishId}:`, response.data);
      alert("Comment submitted successfully.");
      commentInput.value = ""; // Clear the input after submission
    })
    .catch(error => {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment');
    });
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

                  <label for="rating-${recipe.id}">Rate this:</label>
                  <select id="rating-${recipe.id}">
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="5">5 Stars</option>
                  </select>
                  <button onclick="submitRating(${recipe.id})">Submit Rating</button>

                  <input type="text" id="comment-${recipe.id}" placeholder="Leave a comment">
                  <button onclick="submitComment(${recipe.id})">Comment</button>
              </div>
          </div>
      `;
    container.innerHTML += card;
  });
}


// Load initial recipes when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
});

// Enable searching by pressing the Enter key
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchRecipes();
  }
});
