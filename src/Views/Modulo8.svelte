<script>
  import Creditos from "../Components/Creditos.svelte";
  import NavBar from "../Components/NavBar.svelte";
  import Pagina from "../Components/Pagina.svelte";
  import paginas from "../data/modulo8.json";
  import CrearQR from "../Components/CrearQR.svelte";
</script>
<NavBar></NavBar>
<h1 class="mb-4">MÓDULO 8 - LA TÉCNICA Y LA CREATIVIDAD</h1>

<div class="d-grid gap-3">
  {#each paginas as pagina, i}
    <!-- Botón grande que abre el modal -->
    <button
      class="btn btn-primary btn-lg py-4"
      type="button"
      data-bs-toggle="modal"
      data-bs-target={"#modalM8-" + i}>
      {pagina.titulo}
    </button>

    <!-- Modal -->
    <div
      class="modal fade"
      id={"modalM8-" + i}
      tabindex="-1"
      aria-labelledby={"modalM8Label-" + i}
      aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id={"modalM8Label-" + i}>{pagina.titulo}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <Pagina
              titulo={pagina.titulo}
              texto={pagina.texto}
              imagenes={pagina.imagenes} 
              id={"idm8-"+i}
              indice={"indicem8"+i}
          audio={"modulo8/"+pagina.audio}/>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  {/each}
  <CrearQR url="https://mediateca.inah.gob.mx/islandora_74/islandora/object/issue%3A1358"></CrearQR>
  <Creditos></Creditos>
</div>

<style>
  /* Que los botones ocupen todo el ancho */
  .btn-lg {
    font-size: 1.5rem; /* texto más grande */
  }
  .d-grid button {
    width: 100%; /* cada botón ocupa toda la fila */
  }
</style>
