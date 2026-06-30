<script>
  import NavBar from "../Components/NavBar.svelte";
  import Pagina from "../Components/Pagina.svelte";
  import paginas from "../data/modulo7.json";
  import CrearQR from "../Components/CrearQR.svelte";
  import { onMount } from "svelte";

  // Importa la clase ScrollSpy directamente
  import ScrollSpy from "bootstrap/js/dist/scrollspy";
  import Creditos from "../Components/Creditos.svelte";

  let scrollContainer;

  onMount(() => {
    if (scrollContainer) {
      // Si ya había una instancia, destruye primero
      ScrollSpy.getInstance(scrollContainer)?.dispose();

      // Crea una nueva instancia
      new ScrollSpy(scrollContainer, {
        target: "#navbar-m7",
        smoothScroll: true
      });
    }
  });
  let enlaces = [
    {titulo:"Desarrollos Locales",direccion:"#m7item-1",direcciones:[]},
    {titulo:"Región Norte",direccion:"#m7item-2",direcciones:[{titulo:"Ixcateopan",enlace:"#m7item-2-1"}]},
    {titulo:"Región Montaña",direccion:"#m7item-3",direcciones:[]},
    {titulo:"Región Centro",direccion:"#m7item-4",direcciones:[{titulo:"Tehuacalco",enlace:"#m7item-4"}]},
    {titulo:"Región Tierra Caliente",direccion:"#m7item-5",direcciones:[{titulo:"Un Hallazgo Extraordinario",enlace:"#m7item-5-1"}]},
    {titulo:"Región Acapulco",direccion:"#m7item-6",direcciones:[{titulo:"Palma Sola",enlace:"#m7item-6-1"}]},
    {titulo:"Región Costa Grande",direccion:"#m7item-7",direcciones:[{titulo:"Coahuayutla",enlace:"#m7item-7-1"},{titulo:"Paletas de Pinturas",enlace:"#m7item-7-2"}]},
    {titulo:"Región Costa Chica",direccion:"#m7item-8",direcciones:[]},
    {titulo:"Región Sierra",direccion:"#m7item-9",direcciones:[]}
  ]
</script>
<div class="row">
  <div class="col-4">
    <nav id="navbar-m7" class="nav flex-column position-sticky top-0">
      <NavBar></NavBar>
      <h1>MÓDULO 7 - DESARROLLOS LOCALES</h1>
      <nav class="nav nav-pills flex-column">
        {#each enlaces as enlace,i}
          <a class="nav-link" href={enlace.direccion}>
            {enlace.titulo}
          </a>
          <nav class="nav nav-pills flex-column">
          {#each enlace.direcciones as direccion}
              <a class="nav-link ms-3 my-1" href={direccion.enlace}>{direccion.titulo}</a>
          {/each}
          </nav>
        {/each}
      </nav>
    </nav>
  </div>

  <div class="col-8">
    <div
      bind:this={scrollContainer}
      data-bs-spy="scroll"
      data-bs-target="#navbar-m7"
      data-bs-smooth-scroll="true"
      class="scrollspy-example-2">
      {#each paginas as pagina,i}
        <div>
          <Pagina
            titulo={pagina.titulo}
            texto={pagina.texto}
            imagenes={pagina.imagenes}
            indice={i}
            id={pagina.id}
          audio={"modulo7/"+pagina.audio}
          mostrar={pagina.mostrar}
          link={pagina.url}>
          </Pagina>
        </div>
      {/each}
    </div>
  </div>
  <Creditos></Creditos>
</div>
