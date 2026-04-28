export function handleScrollTop(): void {
  if (document.getElementById("hsguru-scroll-top")) return;

  const btn = document.createElement("button");
  btn.id = "hsguru-scroll-top";
  btn.title = "返回顶部";
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  `;

  Object.assign(btn.style, {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: "9999",
    opacity: "0",
    visibility: "hidden",
    transition: "all 0.3s ease",
    transform: "translateY(20px)",
  });

  btn.onmouseenter = () => {
    btn.style.backgroundColor = "#4338ca";
    btn.style.transform = "translateY(-2px)";
  };

  btn.onmouseleave = () => {
    btn.style.backgroundColor = "#4f46e5";
    btn.style.transform = "translateY(0)";
  };

  btn.onclick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  document.body.appendChild(btn);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      btn.style.opacity = "1";
      btn.style.visibility = "visible";
      btn.style.transform = "translateY(0)";
    } else {
      btn.style.opacity = "0";
      btn.style.visibility = "hidden";
      btn.style.transform = "translateY(20px)";
    }
  };

  window.addEventListener("scroll", toggleVisibility);
  toggleVisibility();
}
