const targetClass = 'visual-grid-overlay';
const constructedContent = `
  <section class="page-layout-container">
    <div class="responsive-row">
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
        <article class="column-unit column-one"></article>
    </div>
  </section>`;

const elementReference = document.querySelector(`.${targetClass}`);

if (elementReference) {
    elementReference.remove();
} else {
    const newDOMNode = document.createElement('div');
    newDOMNode.classList.add(targetClass);
    newDOMNode.innerHTML = constructedContent;
    document.body.append(newDOMNode);
}