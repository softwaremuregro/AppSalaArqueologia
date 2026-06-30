<script>
  import Creditos from "../Components/Creditos.svelte";
  import NavBar from "../Components/NavBar.svelte";
  import Pagina from "../Components/Pagina.svelte";
  import CrearQR from "../Components/CrearQR.svelte";
  import paginas from "../data/modulo1.json";
</script>
<NavBar></NavBar>
<h1>MÓDULO 1 - MEDIO AMBIENTE Y CULTURA</h1>

<div class="accordion" id="accordionExample">
  {#each paginas as pagina,i}
    <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={"#collapse"+i} aria-expanded={i === 0 ? 'true' : 'false'} aria-controls={"collapse"+i}>
        {pagina.titulo}
      </button>
    </h2>
    <div id={"collapse"+i} class="accordion-collapse collapse {i === 0 ? 'show' : ''}" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        <Pagina titulo={pagina.titulo} texto={pagina.texto} imagenes={pagina.imagenes} indice={i} id={i} audio={"modulo1/"+pagina.audio} ></Pagina>
      </div>
    </div>
  </div>
  {/each}
</div>
<CrearQR url="https://mediateca.inah.gob.mx/islandora_74/islandora/object/issue%3A1358"></CrearQR>
<Creditos></Creditos>