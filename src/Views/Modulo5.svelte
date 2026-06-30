<script>
  import Creditos from "../Components/Creditos.svelte";
  import NavBar from "../Components/NavBar.svelte";
  import Pagina from "../Components/Pagina.svelte";
  import paginas from "../data/modulo5.json";
  import CrearQR from "../Components/CrearQR.svelte";
</script>
<NavBar arreglo="fixed-top"></NavBar>
<h1>MÓDULO 5 - ÚLTIMOS ASENTAMIENTOS PREHISPÁNICOS</h1>
<div class="row">
  {#each paginas as pagina, i}
    <div class="col-md-6 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <Pagina titulo={pagina.titulo} texto={pagina.texto} imagenes={pagina.imagenes} id={"idm5"+i} indice={"indicem5"+i} 
          audio={"modulo5/"+pagina.audio} />
        </div>
      </div>
    </div>
  {/each}
  
</div>
<div class="row">
  <div class="col"><CrearQR url="https://www.youtube.com/watch?v=J_XM-XXYb5A&pp=ygUbaW5haCB0diBpeGNhdGVvcGFuIGd1ZXJyZXJv0gcJCU0KAYcqIYzv"></CrearQR></div>
  <div class="col"><Creditos></Creditos></div>
</div>
