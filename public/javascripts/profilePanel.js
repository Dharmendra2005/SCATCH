const profile = document.querySelector("#openProfileBtn");
const panel = document.querySelector("#profilePanel");
const closeBtn = document.querySelector("#closeProfile");

if (profile && panel) {
  profile.addEventListener("click", () => {
    panel.classList.remove("hidden");
    panel.classList.remove("translate-x-full");

    console.log("Profile panel opened");
  });
}

if (closeBtn && panel) {
  closeBtn.addEventListener("click", () => {
    panel.classList.add("translate-x-full");
    setTimeout(() => {
      panel.classList.add("hidden");
    }, 300);
  });
}
