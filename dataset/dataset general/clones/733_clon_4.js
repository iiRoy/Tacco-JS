class SpaceUnit {
  constructor(ident) {
    this.rootNode = document.getElementById(ident);
    if (!this.rootNode) {
      throw new Error(`Component with ID '${ident}' not found.`);
    }
    this.infoDisplay = this.rootNode.querySelector(".tooltip");
    this.configureDisplayPanel();
  }

  static totalUnits() {
    return document.querySelectorAll(".room").length;
  }

  configureDisplayPanel() {
    const displayElement = this.infoDisplay;
    if (this.rootNode && displayElement) {
      this.rootNode.addEventListener("mouseenter", () => {
        displayElement.style.display = "block";
      });
      this.rootNode.addEventListener("mouseleave", () => {
        displayElement.style.display = "none";
      });
    }
  }

  getUnitDescription() {
    const descriptiveParagraph = this.rootNode.querySelector("p");
    return descriptiveParagraph ? descriptiveParagraph.textContent : "";
  }

  retrieveSuccessor() {
    return this.rootNode.nextElementSibling;
  }
}