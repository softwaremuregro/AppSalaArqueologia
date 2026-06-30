<script>
  import Pagina from "../Components/Pagina.svelte";
  import paginas from "../data/modulo4.json";
  import NavBar from "../Components/NavBar.svelte";
  import Creditos from "../Components/Creditos.svelte";
  import CrearQR from "../Components/CrearQR.svelte";
  let activeIndex = 0; // índice de la página activa
</script>
<NavBar></NavBar>
<div class="row">
  <!-- Columna izquierda con botones -->
  <div class="col-3 border-end vh-100 overflow-auto">
    <h1 class="mb-3">MÓDULO 4 - EL EPICLÁSICO</h1>
    <div class="nav flex-column nav-pills">
      {#each paginas as pagina, i}
        <button
          class="nav-link {activeIndex === i ? 'active' : ''}"
          on:click={() => activeIndex = i}>
          {pagina.titulo}
        </button>
      {/each}
    </div>

  <CrearQR url="https://mediateca.inah.gob.mx/islandora_74/islandora/object/articulo:17619"></CrearQR>
  </div>

  <!-- Columna derecha con contenido -->
  <div class="col-9 p-3">
    {#each paginas as pagina, i}
      {#if activeIndex === i}
        <!-- Animación fade -->
        <div class="fade show">
          <Pagina
            titulo={pagina.titulo}
            texto={pagina.texto}
            imagenes={pagina.imagenes} 
          audio={"modulo4/"+pagina.audio}/>
        </div>
      {/if}
    {/each}
  </div>
</div>
<Creditos></Creditos>
<style>
  /* Animación tipo Bootstrap fade */
  .fade {
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }
  .fade.show {
    opacity: 1;
  }
</style>
