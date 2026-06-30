<script>
  import Creditos from "../Components/Creditos.svelte";
  import NavBar from "../Components/NavBar.svelte";
  import Pagina from "../Components/Pagina.svelte";
  import paginas from "../data/modulo6.json";
  import CrearQR from "../Components/CrearQR.svelte";
  let activeIndex = 0;

  // Construimos un arreglo que incluye las dos páginas y la tercera imagen
  const items = [
    ...paginas.map(p => ({ type: "pagina", data: p })),
    { type: "imagen", src: "images/modulo6/10.png", titulo: "LA OFRENDA SACRIFICIAL" }
  ];
</script>
<NavBar></NavBar>

<div class="row">
  <!-- Navegación lateral -->
  <div class="col-3 border-end">
    <h1>MÓDULO 6 - ÉPOCA DE CONTACTO</h1>
    <div class="nav flex-column nav-pills">
      {#each items as item, i}
        <button
          class="nav-link {activeIndex === i ? 'active' : ''}"
          on:click={() => activeIndex = i}>
          {item.type === "pagina" ? item.data.titulo : item.titulo}
        </button>
      {/each}
    </div>
    <CrearQR url="https://www.youtube.com/watch?v=DiRY0K5BYLs&pp=ygUeaW5haCB0diBwb3NjbGFzaWNvIGVuIGd1ZXJyZXJv"></CrearQR>
    <Creditos></Creditos>
  </div>

  <!-- Contenido -->
  <div class="col-9 p-3">
    {#each items as item, i}
      {#if activeIndex === i}
        <div class="fade show">
          {#if item.type === "pagina"}
            <Pagina
              titulo={item.data.titulo}
              texto={item.data.texto}
              imagenes={item.data.imagenes} audio={"modulo6/"+item.data.audio}/>
          {:else if item.type === "imagen"}
            <img src={item.src} alt={item.titulo} class="img-fluid" />
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .fade { opacity: 0; transition: opacity 0.5s ease-in-out; }
  .fade.show { opacity: 1; }
</style>
