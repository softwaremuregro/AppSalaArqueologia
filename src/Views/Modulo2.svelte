<script>
  import { onMount } from "svelte";
  import Pagina from "../Components/Pagina.svelte";
  import paginas from "../data/modulo2.json";
  import NavBar from "../Components/NavBar.svelte";
  import CrearQR from "../Components/CrearQR.svelte";
  // Importa solo la clase ScrollSpy
  import ScrollSpy from "bootstrap/js/dist/scrollspy";
  import Creditos from "../Components/Creditos.svelte";

  let scrollContainer;

  onMount(() => {
    if (scrollContainer) {
      // Si ya había una instancia, destruye primero
      ScrollSpy.getInstance(scrollContainer)?.dispose();

      // Crea una nueva instancia
      new ScrollSpy(scrollContainer, {
        target: "#list-example",
        smoothScroll: true,
        offset:120
      });
    }
  });
</script>
<NavBar></NavBar>
<div class="row">
  <div class="col-4">
    <div id="list-example" class="list-group sticky-top">
   
      <h1>MÓDULO 2 - DESARROLLOS CULTURALES ANTIGUOS</h1>
      {#each paginas as pagina,i}
        <a
          class="list-group-item list-group-item-action"
          href={"#list-item-"+i}>
          {pagina.titulo}
        </a>
      {/each}
    </div>
  </div>

  <div class="col-8">
    <div
      bind:this={scrollContainer}
      data-bs-spy="scroll"
      data-bs-target="#list-example"
      data-bs-smooth-scroll="true"
      class="scrollspy-example">
      {#each paginas as pagina,i }
        <Pagina
          titulo={pagina.titulo}
          texto={pagina.texto}
          imagenes={pagina.imagenes}
          indice={i}
          id={"list-item-"+i}
          audio={"modulo2/"+pagina.audio} >
        </Pagina>
      {/each}
    </div>  
  </div>

</div>
<CrearQR url="https://www.youtube.com/watch?v=DiRY0K5BYLs&pp=ygUnaW5haCB0diBlc3RhZG8gZGUgZ3VlcnJlcm8gcHJlaGlzcGFuaWNv"></CrearQR>
<Creditos></Creditos>
<style>
  .scrollspy-example {
  position: relative;
  height: 100vh;
  overflow: auto;
  padding-top: 80px; /* igual que la altura de la navbar */
}

</style>