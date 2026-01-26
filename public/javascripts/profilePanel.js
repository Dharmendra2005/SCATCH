document.addEventListener("DOMContentLoaded", () => {
  const profile = document.querySelector("#openProfileBtn");

  if (!profile) return; // user not logged in or button not rendered

  profile.addEventListener("click", () => {
    console.log("Profile button clicked");
  });
});
