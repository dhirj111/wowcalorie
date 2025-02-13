// Navigate to the "new dish" page
const newdishbutton = (event) => {
  event.preventDefault();
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

// Function to load recipes with optional filters
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

// Function to search recipes based on search input
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

// Function to apply filters 
function applyFilters() {
  const filters = {
    diet: document.getElementById('dietFilter').value,
    difficulty: document.getElementById('difficultyFilter').value,
    glutenfree: document.getElementById('glutenFreeFilter').checked,
    maxTime: document.getElementById('maxTimeFilter').value
  };
  loadRecipes(filters);
}

// Function to load user collections
function loadUserCollections(selectElement) {
  axios.get("http://localhost:1000/getcollections", {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => {
      selectElement.innerHTML = '<option value="">Select Collection</option>';
      console.log(response.data)
      response.data.forEach(collection => {
        selectElement.innerHTML += `
          <option value="${collection.id}">${collection.collectionName}</option>
        `;
      });
    })
    .catch(error => {
      console.error('Error loading collections:', error);
    });
}

// Function to add dish to collection
function addToCollection(collectionId, dishId) {
  if (!collectionId) {
    alert("Please select a collection");
    return;
  }
  console.log(collectionId ,"         ",dishId)
  axios.post("http://localhost:1000/collectiondishadd", {
    collectionId,
    dishId
  }, {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => {
      alert("Recipe added to collection successfully!");
    })
    .catch(error => {
      console.error('Error adding to collection:', error);
      alert('Error adding to collection');
    });
}

// Function to load and display comments for a given dish
function loadComments(dishId, container) {
  axios.get(`http://localhost:1000/getcomments?dishId=${dishId}`)
    .then(response => {
      // Assuming response.data is an array of comment objects
      const comments = response.data;
      container.innerHTML = ""; // Clear previous comments
      comments.forEach(comment => {
        container.innerHTML += `
          <div class="comment-card">
            <strong>${comment.name || "User"}</strong>: ${comment.comment}
          </div>
        `;
      });
    })
    .catch(error => {
      console.error(`Error loading comments for dish ${dishId}:`, error);
    });
}

// Function to display recipes in the recipe container
function displayRecipes(recipes) {
  const container = document.getElementById('recipeContainer');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    const userId = recipe.userId || '#';
    const userName = recipe.creatorName || 'Anonymous';

    // Build the recipe card HTML, including the comments container.
    const card = `
      <div class="recipe-card">
        <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-image">
        <div class="recipe-content">
          <div class="recipe-header">
            <div class="profile-icon">👤</div>
            <h3>${recipe.name}</h3>
          </div>
          <p>By: <a href="http://localhost:1000/profile/${userId}" target="_blank">${userName}</a></p>
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

          <div class="comment-section">
            <input type="text" id="comment-${recipe.id}" placeholder="Leave a comment">
            <button onclick="submitComment(${recipe.id})">Comment</button>
          </div>

          <!-- Comments will be loaded into this container -->
          <div class="comments-container" id="comments-${recipe.id}">
            <!-- Comments will appear here -->
          </div>
          
          <button onclick="favouriteDish(${recipe.id})" style="background-color: gold; color: black; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
            ⭐ Star
          </button>

          <div class="collection-section" style="margin-top: 10px;">
            <select id="collection-select-${recipe.id}" style="padding: 5px; margin-right: 5px;">
              <option value="">Select Collection</option>
            </select>
            <button onclick="addToCollection(document.getElementById('collection-select-${recipe.id}').value, ${recipe.id})" 
                    style="background-color: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">
              Add to Collection
            </button>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", card);

    // Load comments for this dish after its card has been added to the DOM.
    const commentsContainer = document.getElementById(`comments-${recipe.id}`);
    loadComments(recipe.id, commentsContainer);

    // Load collections for this recipe's dropdown
    loadUserCollections(document.getElementById(`collection-select-${recipe.id}`));
  });
}

// Function to submit a rating for a recipe
function submitRating(dishId) {
  const ratingSelect = document.getElementById(`rating-${dishId}`);
  const rating = ratingSelect.value;
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
  const commentInput = document.getElementById(`comment-${dishId}`);
  const comment = commentInput.value;
  if (!comment) {
    alert("Please enter a comment.");
    return;
  }
  axios.post("http://localhost:1000/commentRecipe", {
    dishId,
    comment
  }, {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => {
      console.log(`Comment submitted for dish ${dishId}:`, response.data);
      alert("Comment submitted successfully.");
      commentInput.value = ""; // Clear the input after submission
      
      // Reload the comments for this dish
      const commentsContainer = document.getElementById(`comments-${dishId}`);
      loadComments(dishId, commentsContainer);
    })
    .catch(error => {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment');
    });
}

// Function to add a dish to favourites
function favouriteDish(dishId) {
  axios.post("http://localhost:1000/favourited", { dishId }, {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => alert("Dish added to favourites!"))
    .catch(error => console.error("Error adding to favourites:", error));
}

// Load initial recipes when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
});