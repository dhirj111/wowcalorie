const newdishbutton = (event) => {
  event.preventDefault();

  console.log("api hitted")
  window.location.href = "http://localhost:1000/newdish"
  axios.get("http://localhost:1000/newdish")
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log(error)
    });
  // const userDetails = {
  //   name: event.target.name.value,
  //   email: event.target.email.value,
  //   password: event.target.password.value
  // };
  // // console.log(userDetails)
  // axios
  //   .post("http://localhost:1000/postsignup", userDetails)
  // .then((response) => {
  //   document.getElementById('note').textContent = "message for user == "
  //   document.getElementById('note').textContent += response.data.message;
  // })
  // .catch((error) => {
  //   document.getElementById('note').textContent = "message for user == "
  //   document.getElementById('note').textContent += error.response.data.message;
  // });

};