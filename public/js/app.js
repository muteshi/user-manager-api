const userForm = document.querySelector("form");
const msgZero = document.querySelector("#msg-0");
const msgOne = document.querySelector("#msg-1");
const msgTwo = document.querySelector("#msg-2");
const name = document.querySelector("#name");
const email = document.querySelector("#email");
const pass = document.querySelector("#pass");

msgOne.textContent = "";
msgZero.textContent = "";

userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const userEmail = email.value;
  const userName = name.value;
  const userPass = pass.value;
  const mobileNumber = phone.value;

  const userData = {
    email: userEmail,
    name: userName,
    password: userPass,
    phone: mobileNumber,
  };

  msgOne.textContent = "Creating your account....";
  msgTwo.textContent = "";

  async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
  postData("/superuser-create", userData).then((data) => {
    if (data.error) {
      msgTwo.textContent = data.error;
      console.log(data);
      return;
    }
    if (data.newSuperUser) {
      msgZero.textContent = "Your created details are..";
      msgOne.textContent = data.newSuperUser.name;
      msgTwo.textContent = data.newSuperUser.email;
      console.log(data);
    }
  });
});
