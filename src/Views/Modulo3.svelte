<script>
  import Creditos from "../Components/Creditos.svelte";
  import NavBar from "../Components/NavBar.svelte";
  import Pagina from "../Components/Pagina.svelte";
  import paginas from "../data/modulo3.json";
  import CrearQR from "../Components/CrearQR.svelte";
</script>
<NavBar></NavBar>
<h1>MÓDULO 3 - EL CLÁSICO</h1>
<Creditos></Creditos>
<button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">{paginas[0].titulo}
  <img src="images/modulo3/1.png" alt="modulo 3 imagen 1" height="388" width="auto">
</button>

<div class="offcanvas offcanvas-top h-100" tabindex="-1" id="offcanvasTop" aria-labelledby="offcanvasTopLabel">
  <div class="offcanvas-header">
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body " >
    <div class="row">
      <div class="col">  <Pagina titulo={paginas[0].titulo} texto={paginas[0].texto} imagenes={paginas[0].imagenes} indice={1} id={1} 
          audio={"modulo3/"+paginas[0].audio} link={paginas[0].url}></Pagina></div>
      <div class="col"><CrearQR url="https://www.youtube.com/watch?v=T3EVat7H2kU&pp=ygUnaW5haCB0diBlc3RhZG8gZGUgZ3VlcnJlcm8gcHJlaGlzcGFuaWNv"></CrearQR></div>
      </div>
  </div>
</div>

<button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom">{paginas[1].titulo}
<img src="images/modulo3/4.png" alt="modulo 3 imagen 1">
</button>

<div class="offcanvas offcanvas-bottom h-100" tabindex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
  <div class="offcanvas-header">
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <div class="row">
      <div class="col">  <Pagina titulo={paginas[1].titulo} texto={paginas[1].texto} imagenes={paginas[1].imagenes} indice={2} id={2} 
          audio={"modulo3/"+paginas[1].audio} link={paginas[1].url}></Pagina>  </div>
      <div class="col">  <CrearQR url="https://www.youtube.com/watch?v=6ztDrv063Ro"></CrearQR></div>
    </div>
  </div>
 

</div>

