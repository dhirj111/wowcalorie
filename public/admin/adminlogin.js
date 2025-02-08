
const handleformsubmit = (event) => {
  event.preventDefault();
  const userDetails = {
    key: event.target.text.value,
    password: event.target.password.value
  };
  // console.log(userDetails)
  axios
    .post("http://localhost:1000/adminpostlogin", userDetails)
    .then((response) => {
      console.log("this is response of login.js file response", response)
      if (response.data.urltoredirect) {
        localStorage.setItem("admin jwt",response.data.usertoken)
        window.location.href = response.data.urltoredirect;
        //it redirected because we provided urltoredirect as a reponse to /login password correct condition 
      }
      console.log(response.data.message)
    })
    .catch((error) => {
      //any response consisting http error codes ,ie passowrd mismatch/user not exist automatically comes here
      console.log(error)
      console.log(error.response.data.message)
      document.getElementById('note').textContent += error.response.data.message;
    });
};