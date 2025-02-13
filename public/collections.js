const handleformsubmit = (event) => {
  event.preventDefault();
  let collectionname = event.target.collectionname.value;

  axios.post("http://localhost:1000/newcollection", { collectionname:collectionname }, {
    headers: {
      token: localStorage.getItem("user jwt")
    }
  })
    .then(response => alert("collection created succesfully"))
    .catch(error => console.error("Error adding to favourites:", error));


}