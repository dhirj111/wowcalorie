let selectedCollectionId = null;

// Function to load user collections into select dropdown
function loadUserCollections() {
  const selectElement = document.getElementById('collectionSelect');
  
  axios.get("http://localhost:1000/getcollections", {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => {
      console.log(response.data)
      selectElement.innerHTML = '<option value="">Select Collection</option>';
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

// Function to display dishes in a collection
function displayCollectionDishes(dishes) {
  const container = document.getElementById('dishesContainer');
  container.innerHTML = ''; // Clear existing content

  dishes.forEach(dish => {
    const card = `
      <div class="dish-card">
        <img src="${dish.imageUrl}" alt="${dish.name}" class="dish-image">
        <div class="dish-content">
          <h3>${dish.name}</h3>
          <p>By: ${dish.creatorName || 'Anonymous'}</p>
          <p>Diet: ${dish.diet}</p>
          <p>Difficulty: ${dish.difficulty}</p>
          <p>Time: ${dish.time} minutes</p>
          ${dish.glutenfree ? '<p class="gluten-free">Gluten Free</p>' : ''}
          <p>Steps: ${dish.steps || 'No steps provided'}</p>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', card);
  });
}

// Function to show dishes in selected collection
function showCollectionDishes() {
  const collectionId = document.getElementById('collectionSelect').value;
  if (!collectionId) {
    alert('Please select a collection');
    return;
  }
  selectedCollectionId = collectionId;

  axios.get(`http://localhost:1000/getcollectiondishes?collectionId=${collectionId}`, {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => {
      displayCollectionDishes(response.data);
    })
    .catch(error => {
      console.error('Error loading collection dishes:', error);
      alert('Error loading dishes');
    });
}

// Function to view full recipe (you can implement this based on your needs)
function viewRecipe(dishId) {
  window.location.href = `http://localhost:1000/recipe/${dishId}`;
}

// Form submission handler (already provided)
const handleformsubmit = (event) => {
  event.preventDefault();
  let collectionname = event.target.collectionname.value;

  axios.post("http://localhost:1000/newcollection", { collectionname }, {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => {
      alert("Collection created successfully");
      loadUserCollections(); // Reload collections after creating new one
      event.target.reset(); // Clear the form
    })
    .catch(error => console.error("Error creating collection:", error));
};

// Load collections when page loads
document.addEventListener('DOMContentLoaded', loadUserCollections);