function submitForm() {
    console.log("button clicked 100")
    const formData = new FormData();

    // Get form values
    formData.append("name", document.querySelector('input[placeholder="Enter dish name"]').value);
    formData.append("diet", document.querySelector('input[name="diet"]:checked')?.value || "none");
    formData.append("glutenFree", document.querySelector('.diet-group input[type="checkbox"]').checked);
    formData.append("difficulty", document.querySelector('select').value);
    formData.append("preparationTime", document.querySelector('input[placeholder="Enter time"]').value);
    formData.append("ingredients", document.querySelector('textarea[placeholder="List ingredients (comma-separated)"]').value);
    formData.append("steps", document.querySelector('textarea[placeholder="Describe preparation steps"]').value);

    // Get image file
    const imageFile = document.querySelector('input[type="file"]').files[0];
    if (imageFile) {
        formData.append("image", imageFile);
    }

    // Send to API
    axios.post("http://localhost:1000/dishpost", formData, {
        headers: {
            token: localStorage.getItem("user jwt")
        }
    })
        .then(response => {
            alert("Recipe submitted successfully!");
        })
        .catch(error => {
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert("Failed to submit recipe.");
        });
}