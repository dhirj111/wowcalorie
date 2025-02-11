const { head } = require("../../routes/userroute");

// Load both dishes and users when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadDishes();
  loadUsers();
});

// Load all dishes from the platform
function loadDishes() {
  console.log("hitting /alldishes api")
  axios.get('http://localhost:1000/alldishes')
    .then(response => {
      const dishes = response.data;
      const dishesList = document.getElementById('dishesList');
      dishesList.innerHTML = ''; // Clear any existing content

      // Create a DOM element for each dish
      dishes.forEach(dish => {
        const dishItem = document.createElement('div');
        dishItem.className = 'item';
        dishItem.innerHTML = ` 
          <span><strong>${dish.name}</strong> by  ${dish.creatorName}   ||  ${dish.userId} </span>
          <button onclick="deleteDish(${dish.id})">Delete from Platform</button>
        `;
        dishesList.appendChild(dishItem);
      });
    })
    .catch(error => {
      console.error('Error loading dishes:', error);
      alert('Failed to load dishes.');
    });
}

// Delete a dish from the platform
function deleteDish(dishId) {
  axios.post('http://localhost:1000/deleteDish', { dishId })
    .then(response => {
      alert('Dish deleted successfully.');
      loadDishes(); // Refresh the list after deletion
    })
    .catch(error => {
      console.error('Error deleting dish:', error);
      alert('Failed to delete dish.');
    });
}

// Load all users from the platform
function loadUsers() {
  axios.get('http://localhost:1000/allusers')
    .then(response => {
      const users = response.data;
      const usersList = document.getElementById('usersList');
      usersList.innerHTML = ''; // Clear any existing content

      // Create a DOM element for each user
      users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'item';
        userItem.innerHTML = `
          <span><strong>${user.name}</strong> (${user.email})</span>
          <button onclick="banUser(${user.id})">Ban User</button>
        `;
        usersList.appendChild(userItem);
      });
    })
    .catch(error => {
      console.error('Error loading users:', error);
      alert('Failed to load users.');
    });
}

// Ban (delete) a user from the platform
function banUser(userId) {
  axios.post('http://localhost:1000/banUser', { userId },{
    headers: {
      token: localStorage.getItem("admin jwt")
    }
  })
    .then(response => {
      alert('User banned successfully.');
      loadUsers(); // Refresh the list after banning the user
    })
    .catch(error => {
      console.error('Error banning user:', error);
      alert('Failed to ban user.');
    });
}
